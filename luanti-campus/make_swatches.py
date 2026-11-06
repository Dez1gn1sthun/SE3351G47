#!/usr/bin/env python3
"""Regenerate the campus mod's block textures as flat colour swatches.

The shipped Minecraft textures are Mojang's property, so they cannot live in a
public repo. This script replaces each 16x16 texture with a procedurally
generated swatch of the same average colour, so the block palette stays
recognisable while containing no third-party image data.

Output: a 16x16 PNG per block with a single flat colour plus low-amplitude
value noise (keeps large untextured walls from reading as flat cardboard).

Run with --dry-run to print the palette without writing files.
"""
import argparse
import os
import struct
import subprocess
import sys
import zlib

TEXDIR = os.path.expanduser("~/.minetest/mods/campus/textures")
SIZE = 16
NOISE = 7  # max +/- per channel


def fail(msg):
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def average_colour(path):
    """Average RGB of an image via ImageMagick."""
    out = subprocess.run(
        ["magick", path, "-resize", "1x1!", "-format",
         "%[fx:int(255*r)],%[fx:int(255*g)],%[fx:int(255*b)]", "info:"],
        capture_output=True, text=True, timeout=30, check=False)
    if out.returncode != 0:
        return None
    try:
        r, g, b = (int(v) for v in out.stdout.strip().split(","))
    except ValueError:
        return None
    return (r, g, b)


def noise_for(seed_text, x, y):
    """Deterministic small signed offset for one pixel (no RNG state)."""
    h = 2166136261
    for ch in f"{seed_text}:{x}:{y}":
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    return (h % (2 * NOISE + 1)) - NOISE


def write_png(path, rows, width, height):
    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    raw = b"".join(b"\x00" + bytes(row) for row in rows)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    try:
        with open(path, "wb") as handle:
            handle.write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr)
                         + chunk(b"IDAT", zlib.compress(raw, 9))
                         + chunk(b"IEND", b""))
    except OSError as err:
        fail(f"cannot write {path}: {err}")


def swatch_rows(name, base):
    rows = []
    for y in range(SIZE):
        row = []
        for x in range(SIZE):
            for c in range(3):
                v = base[c] + noise_for(name, x * 3 + c, y)
                row.append(max(0, min(255, v)))
        rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not os.path.isdir(TEXDIR):
        fail(f"texture dir not found: {TEXDIR}")
    names = []
    try:
        names = sorted(f for f in os.listdir(TEXDIR)
                       if f.startswith("campus_") and f.endswith(".png"))
    except OSError as err:
        fail(f"cannot list {TEXDIR}: {err}")
    if not names:
        fail("no campus_*.png textures found")

    palette = {}
    for fname in names:
        path = os.path.join(TEXDIR, fname)
        colour = average_colour(path)
        if colour is None:
            fail(f"cannot sample {fname}")
        palette[fname] = colour

    if args.dry_run:
        for fname, c in palette.items():
            print(f"{fname:42s} rgb{c}")
        print(f"\n{len(palette)} swatches would be written to {TEXDIR}")
        return

    for fname, colour in palette.items():
        rows = swatch_rows(fname, colour)
        write_png(os.path.join(TEXDIR, fname), rows, SIZE, SIZE)

    print(f"rewrote {len(palette)} textures as {SIZE}x{SIZE} flat swatches")
    dark = sum(1 for c in palette.values() if sum(c) < 90)
    print(f"palette: {len(palette)} distinct swatches, {dark} very dark")


if __name__ == "__main__":
    main()
