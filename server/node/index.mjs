#!/usr/bin/env node
/**
 * Serves the built site from dist/ on one port: the landing page at `/` and
 * the 3D campus at `/campus.html`.
 *
 *   npm start            build, then serve on http://localhost:8080
 *   npm run serve        serve an existing build
 *   PORT=3000 npm start  pick another port
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StaticServer } from './StaticServer.mjs';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const distDir = join(projectRoot, 'dist');
const port = Number(process.env.PORT ?? 8080);

if (!existsSync(join(distDir, 'index.html'))) {
  console.error('No build found in dist/. Run "npm run build" first, or use "npm start".');
  process.exit(1);
}

const server = new StaticServer({ root: distDir, port });

try {
  await server.listen();
} catch (error) {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Try: PORT=${port + 1} npm run serve`);
    process.exit(1);
  }
  throw error;
}

console.log(`Serving dist/ at http://localhost:${port}`);
console.log(`  landing page  http://localhost:${port}/`);
console.log(`  3D campus     http://localhost:${port}/campus.html`);
console.log('Press Ctrl+C to stop.');

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    void server.close().then(() => process.exit(0));
  });
}
