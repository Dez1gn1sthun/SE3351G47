#!/usr/bin/env python3
"""Serve out/www locally with the headers Luanti needs.

The WebAssembly build uses threads, so the page has to be cross-origin isolated:
Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy:
require-corp on every response. A plain `python3 -m http.server` will load the
page and then fail inside the engine with a SharedArrayBuffer error.

    ./static/serve.py out/www            # http://localhost:8080
    ./static/serve.py out/www 9000
"""

import functools
import http.server
import pathlib
import socketserver
import sys

ISOLATION = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Resource-Policy": "same-origin",
}


# Everything we author is revalidated on every load: during development the page,
# its scripts and the tour content all change often, and a cached main.js once
# kept serving a start button that ignored the low-performance checkbox. Packs
# and the hashed wasm release keep their long cache behaviour.
LIVE_SUFFIXES = (".html", ".js", ".css", ".json", ".svg", ".txt")


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        for name, value in ISOLATION.items():
            self.send_header(name, value)
        path = self.path.split("?")[0]
        if path in ("", "/") or path.endswith(LIVE_SUFFIXES):
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def log_message(self, format, *args):
        # The pack downloads are large and the engine polls; keep it readable.
        sys.stderr.write(f"{self.address_string()} {format % args}\n")


def main() -> int:
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "out/www")
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080

    if not (root / "index.html").is_file():
        print(f"{root} has no index.html; run ./build.sh first", file=sys.stderr)
        return 1

    handler = functools.partial(Handler, directory=str(root))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", port), handler) as httpd:
        print(f"serving {root} on http://localhost:{port}")
        print("(cross-origin isolated, so Luanti's threads are allowed)")
        httpd.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
