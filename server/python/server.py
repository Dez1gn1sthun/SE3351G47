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
    # Store the directory containing the website files.
    self.root = root

    # Store the port number that the server will use.
    self.port = port

    # Create a request handler that serves files from the specified root directory.
    # functools.partial allows us to pass the directory argument to SiteRequestHandler.
    handler = functools.partial(SiteRequestHandler, directory=str(root))

    # Create a multithreaded HTTP server.
    # The server listens on the specified host and port.
    # ThreadingHTTPServer allows it to handle multiple requests at the same time.
    self.httpd = ThreadingHTTPServer((host, port), handler)


def serve_forever(self) -> None:
    # Display the server's address and useful website URLs.
    print(f"Serving {self.root.name}/ at http://localhost:{self.port}")
    print(f"  landing page  http://localhost:{self.port}/")
    print(f"  3D campus     http://localhost:{self.port}/campus.html")
    print("Press Ctrl+C to stop.")

    try:
        # Start the server and continuously listen for incoming HTTP requests.
        self.httpd.serve_forever()

    except KeyboardInterrupt:
        # Stop the server when the user presses Ctrl+C.
        print("\nStopped.")

    finally:
        # Close the server socket and release the port.
        # This runs whether the server stops normally or through an interruption.
        self.httpd.server_close()


def build_site() -> None:
    """Run npm run build; Node.js is needed for this step only."""

    # Search for the npm executable installed with Node.js.
    npm = shutil.which("npm")

    # Check whether npm was found on the system.
    if npm is None:
        # Exit the program and display an error message if npm is missing.
        sys.exit("npm was not found. Install Node.js to build, or copy in a prebuilt dist/ folder.")

    # Run the npm build command from the project's root directory.
    # check=True raises an error if the build command fails.
    subprocess.run([npm, "run", "build"], cwd=PROJECT_ROOT, check=True)


def parse_args() -> argparse.Namespace:
    # Create an argument parser to handle command-line options.
    parser = argparse.ArgumentParser(
        description="Serve the built Western Engineering site."
    )

    # Allow the user to specify a port number.
    # If no port is provided, DEFAULT_PORT will be used.
    parser.add_argument(
        "--port",
        type=int,
        default=DEFAULT_PORT,
        help=f"port to listen on (default {DEFAULT_PORT})"
    )

    # Allow the user to optionally run the website build before starting the server.
    # action="store_true" means this option is True when --build is specified.
    parser.add_argument(
        "--build",
        action="store_true",
        help='run "npm run build" before serving'
    )

    # Return the command-line arguments entered by the user.
    return parser.parse_args()


def main() -> None:
    # Read the command-line arguments provided when running the program.
    args = parse_args()

    # Build the website first if the user included the --build option.
    if args.build:
        build_site()

    # Check whether the dist/ directory contains an index.html file.
    # This confirms that a website build is available.
    if not (DIST_DIR / "index.html").is_file():
        # Stop the program if no built website is available.
        sys.exit('No build found in dist/. Run "npm run build" first, or pass --build.')

    try:
        # Create the website server using the dist/ directory and selected port.
        server = SiteServer(DIST_DIR, args.port)

    except OSError as error:
        # Handle errors such as the port already being occupied.
        # Suggest trying the next port number.
        sys.exit(
            f"Could not listen on port {args.port}: "
            f"{error.strerror}. Try --port {args.port + 1}."
        )

    # Start the server and keep it running until interrupted.
    server.serve_forever()


if __name__ == "__main__":
    main()
