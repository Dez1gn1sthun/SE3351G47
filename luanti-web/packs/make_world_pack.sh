#!/usr/bin/env bash
# Builds the campus world pack.
#
# A "pack" is a zstd-compressed tar whose paths are absolute from the WebAssembly
# filesystem root, so every entry starts with luanti/. The launcher downloads the
# file and the engine unpacks it; see emloop_install_pack() in the luanti-wasm
# fork. Worlds must land in /luanti/worlds, which is the only place the engine
# looks for them (WORLDS_DIR in src/mainloop.cpp).
#
# Usage: packs/make_world_pack.sh [world-name]      (default: campus)
set -euo pipefail

cd "$(dirname "$0")/.."
HERE="$PWD"
ROOT="$(cd "$HERE/.." && pwd)"

WORLD="${1:-campus}"
SRC="$ROOT/luanti-campus/world/$WORLD"
MODSRC="$ROOT/luanti-campus/mod/campus"
OUT="$HERE/out/packs/$WORLD.pack"

if [ ! -f "$SRC/map.sqlite" ]; then
  echo "no such world: $SRC" >&2
  exit 1
fi

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

DEST="$STAGE/luanti/worlds/$WORLD"
mkdir -p "$DEST"

# map.sqlite holds the build; the three text files describe the world, and
# without map_meta.txt the engine has to guess at the mapgen parameters.
cp "$SRC/map.sqlite" "$SRC/world.mt" "$SRC/map_meta.txt" "$SRC/env_meta.txt" "$DEST/"

# mod_storage stops the campus mod from autoplacing a second copy if the build
# ever gains an autoplace switch; it is tiny.
if [ -d "$SRC/mod_storage" ]; then
  cp -a "$SRC/mod_storage" "$DEST/"
fi

# The world's nodes are named campus:*, so the mod that registers them has to
# travel with the world. worldmods/ keeps it out of the game itself.
if [ -f "$SRC/world.mt" ] && grep -q '^load_mod_campus = true' "$SRC/world.mt"; then
  if [ ! -d "$MODSRC" ]; then
    echo "world.mt loads the campus mod but $MODSRC is missing" >&2
    exit 1
  fi
  mkdir -p "$DEST/worldmods"
  cp -a "$MODSRC" "$DEST/worldmods/campus"
  rm -rf "$DEST/worldmods/campus/.git"
fi

mkdir -p "$HERE/out/packs"
tar -C "$STAGE" -cf - luanti | zstd -q --ultra -22 -f -o "$OUT" -

echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
echo "contents:"
tar --use-compress-program=unzstd -tf "$OUT"
