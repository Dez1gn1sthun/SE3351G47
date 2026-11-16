#!/usr/bin/env python3
"""Serve the built site (dist/) with only the Python standard library.

This is the no-Node fallback for *serving*. The TypeScript still has to be
compiled once with ``npm run build``; after that, dist/ can be served on any
machine with Python 3.8+:

    python3 server/python/server.py              # http://localhost:8080
    python3 server/python/server.py --port 3000
    python3 server/python/server.py --build      # run "npm run build" first
"""

from __future__ import annotations

import argparse
import functools
import shutil
import subprocess
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DIST_DIR = PROJECT_ROOT / "dist"
DEFAULT_PORT = 8080


class SiteRequestHandler(SimpleHTTPRequestHandler):
    """Static file handler with explicit MIME types and cache headers.

    The MIME table is set explicitly because Python otherwise reads it from the
    OS, and on Windows the registry often maps ``.js`` to ``text/plain``, which
    browsers refuse to run as an ES module.
    """

    extensions_map = {
        "": "application/octet-stream",
        ".html": "text/html; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".mjs": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".svg": "image/svg+xml",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".ico": "image/x-icon",
        ".glb": "model/gltf-binary",
        ".gltf": "model/gltf+json",
        ".wasm": "application/wasm",
        ".txt": "text/plain; charset=utf-8",
    }

    # Vite fingerprints everything under /assets/, so those files never change.
    IMMUTABLE_PREFIX = "/assets/"

    def end_headers(self) -> None:
        if self.path.startswith(self.IMMUTABLE_PREFIX):
            self.send_header("Cache-Control", "public, max-age=31536000, immutable")
        else:
            self.send_header("Cache-Control", "no-cache")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()


class SiteServer:
    """Owns the HTTP server for one folder and one port."""

    def __init__(self, root: Path, port: int, host: str = "") -> None:
        self.root = root
        self.port = port
        handler = functools.partial(SiteRequestHandler, directory=str(root))
        self.httpd = ThreadingHTTPServer((host, port), handler)

    def serve_forever(self) -> None:
        print(f"Serving {self.root.name}/ at http://localhost:{self.port}")
        print(f"  landing page  http://localhost:{self.port}/")
        print(f"  3D campus     http://localhost:{self.port}/campus.html")
        print("Press Ctrl+C to stop.")
        try:
            self.httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
        finally:
            self.httpd.server_close()


def build_site() -> None:
    """Run ``npm run build``; Node is needed for this step only."""
    npm = shutil.which("npm")
    if npm is None:
        sys.exit("npm was not found. Install Node.js to build, or copy in a prebuilt dist/ folder.")
    subprocess.run([npm, "run", "build"], cwd=PROJECT_ROOT, check=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the built Western Engineering site.")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"port to listen on (default {DEFAULT_PORT})")
    parser.add_argument("--build", action="store_true", help='run "npm run build" before serving')
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.build:
        build_site()

    if not (DIST_DIR / "index.html").is_file():
        sys.exit('No build found in dist/. Run "npm run build" first, or pass --build.')

    try:
        server = SiteServer(DIST_DIR, args.port)
    except OSError as error:
        sys.exit(f"Could not listen on port {args.port}: {error.strerror}. Try --port {args.port + 1}.")

    server.serve_forever()


if __name__ == "__main__":
    main()
