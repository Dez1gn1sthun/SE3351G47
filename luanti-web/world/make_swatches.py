#!/usr/bin/env python3
"""Writes 16x16 flat-colour textures from world/palette.json.

Used when the pack builder runs on a machine without the real Minecraft block
textures: the branch stays buildable, and no Mojang pixels enter the repository.
Colours are the average of each block's texture, so the build still reads
correctly in massing — just without surface detail.

    world/make_swatches.py <dest-dir>        # dest gets eng_<block>.png
"""

import json
import pathlib
import struct
import sys
import zlib

SIZE = 16


def png(rgb: tuple[int, int, int], size: int = SIZE) -> bytes:
    """A minimal RGB PNG: one filter byte (0) per scanline, then zlib."""
    row = b"\x00" + bytes(rgb) * size
    raw = row * size

    def chunk(tag: bytes, payload: bytes) -> bytes:
        return (struct.pack(">I", len(payload)) + tag + payload
                + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF))

    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", header)
            + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))


def load_palette() -> dict[str, str]:
    """Read palette.json next to this script, or explain why it cannot be."""
    path = pathlib.Path(__file__).parent / "palette.json"
    try:
        return json.loads(path.read_text())
    except OSError as err:
        raise SystemExit(f"cannot read {path}: {err}") from err
    except json.JSONDecodeError as err:
        raise SystemExit(f"{path} is not valid JSON: {err}") from err


def parse_rgb(value: str) -> tuple[int, int, int]:
    """'#rrggbb' -> (r, g, b)."""
    value = value.lstrip("#")
    if len(value) != 6:
        raise ValueError(f"expected #rrggbb, got {value!r}")
    return int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16)


def main() -> int:
    dest = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "textures")
    dest.mkdir(parents=True, exist_ok=True)

    palette = load_palette()
    written = 0
    for block, value in palette.items():
        write_swatch(dest, block, value)
        written += 1

    print(f"wrote {written} swatches to {dest}")
    return 0


def write_swatch(dest: pathlib.Path, block: str, value: str) -> None:
    (dest / f"eng_{block}.png").write_bytes(png(parse_rgb(value)))


if __name__ == "__main__":
    raise SystemExit(main())
