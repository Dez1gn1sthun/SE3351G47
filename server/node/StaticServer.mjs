import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';

/**
 * Explicit types for everything the site ships. The .glb entry matters most:
 * without it browsers get application/octet-stream, and the progress bar
 * depends on the Content-Length this server always sends.
 */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
};

/** Vite fingerprints everything under /assets/, so those files never change. */
const IMMUTABLE_PREFIX = '/assets/';

/**
 * Serves a built site (the `dist/` folder) over plain HTTP: GET and HEAD only,
 * `index.html` for directories, and no access outside the root folder.
 */
export class StaticServer {
  /**
   * @param {object} options
   * @param {string} options.root  Folder to serve.
   * @param {number} options.port  Port to listen on.
   * @param {string} [options.host] Interface to bind (default: all).
   */
  constructor({ root, port, host = '0.0.0.0' }) {
    this.root = resolve(root);
    this.port = port;
    this.host = host;
    this.server = createServer((request, response) => {
      this.handle(request, response).catch((error) => {
        console.error(error);
        this.sendError(response, 500, 'Internal Server Error');
      });
    });
  }

  /** Starts listening; resolves once the port is bound. */
  listen() {
    return new Promise((resolvePromise, reject) => {
      this.server.once('error', reject);
      this.server.listen(this.port, this.host, () => resolvePromise());
    });
  }

  /** Stops listening, dropping idle keep-alive connections so Ctrl+C is instant. */
  close() {
    return new Promise((resolvePromise) => {
      this.server.close(() => resolvePromise());
      this.server.closeAllConnections();
    });
  }

  async handle(request, response) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      this.sendError(response, 405, 'Method Not Allowed');
      return;
    }

    const filePath = await this.resolveFile(request.url ?? '/');
    if (!filePath) {
      this.sendError(response, 404, 'Not Found');
      return;
    }

    const { size } = await stat(filePath);
    const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname;

    response.writeHead(200, {
      'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': size,
      'Cache-Control': urlPath.startsWith(IMMUTABLE_PREFIX)
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });

    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  }

  /**
   * Maps a request URL to a file inside the root, or `null` if there is none.
   * Directories resolve to their index.html.
   */
  async resolveFile(requestUrl) {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
    } catch {
      return null; // malformed percent-encoding
    }

    const candidate = normalize(join(this.root, pathname));
    if (candidate !== this.root && !candidate.startsWith(this.root + sep)) {
      return null; // path traversal attempt
    }

    const info = await stat(candidate).catch(() => null);
    if (info?.isFile()) return candidate;
    if (info?.isDirectory()) {
      const index = join(candidate, 'index.html');
      const indexInfo = await stat(index).catch(() => null);
      if (indexInfo?.isFile()) return index;
    }
    return null;
  }

  sendError(response, status, message) {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`${status} ${message}\n`);
  }
}
