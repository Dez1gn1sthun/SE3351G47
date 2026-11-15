#!/usr/bin/env bash
# Builds the eng world pack from a local Luanti installation.
#
# A "pack" is a zstd-compressed tar whose paths are absolute from the WebAssembly
# filesystem root, so every entry starts with luanti/. The launcher downloads the
# file and the engine unpacks it; see emloop_install_pack() in the luanti-wasm
# fork. Worlds must land in /luanti/worlds, which is the only place the engine
# looks for them (WORLDS_DIR in src/mainloop.cpp).
#
# The world is not in git: it is 8 MB of sqlite plus 266 node textures, and the
# textures are Mojang assets that must not be redistributed. So the pack is built
# from the local installation, and only the small Lua in mods/ travels.
#
# Usage: packs/make_world_pack.sh [world-name]      (default: eng)
set -euo pipefail

cd "$(dirname "$0")/.."
HERE="$PWD"

DATA="${LUANTI_DATA_DIR:-$HOME/.minetest}"
WORLD="${1:-eng}"
SRC="$DATA/worlds/$WORLD"
MODS="$DATA/mods"
OUT="$HERE/out/packs/$WORLD.pack"

# Mods the world loads, all of which must travel inside the pack: worldmods/
# keeps them out of the game itself.
PACK_MODS="eng eng_fog eng_time eng_spawn"

if [ ! -f "$SRC/map.sqlite" ]; then
  echo "no such world: $SRC" >&2
  echo "(set LUANTI_DATA_DIR if your Luanti data dir is not ~/.minetest)" >&2
  exit 1
fi

for m in $PACK_MODS; do
  if [ ! -d "$HERE/mods/$m" ] && [ ! -d "$MODS/$m" ]; then
    echo "missing mod: $HERE/mods/$m or $MODS/$m" >&2
    exit 1
  fi
done

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

DEST="$STAGE/luanti/worlds/$WORLD"
mkdir -p "$DEST"

# map.sqlite holds the build; the three text files describe the world, and
# without map_meta.txt the engine has to guess at the mapgen parameters.
#
# The map is copied and then trimmed: a session spent flying outside the build
# emerges tens of thousands of empty chunks, each still costing ~40 bytes and a
# directory entry, and 62k blocks shrink to 7.2k. The bounds below are the build
# bbox (nodes x 0..399, y 0..87, z 0..755) in 16-node map blocks.
cp "$SRC/map.sqlite" "$SRC/world.mt" "$SRC/map_meta.txt" "$SRC/env_meta.txt" "$DEST/"
python3 - "$DEST/map.sqlite" <<'PY'
import sqlite3, sys
db = sqlite3.connect(sys.argv[1])
before = db.execute("SELECT COUNT(*) FROM blocks").fetchone()[0]
db.execute("DELETE FROM blocks WHERE x < 0 OR x > 24 OR y < 0 OR y > 5 "
           "OR z < 0 OR z > 47")
db.commit()
after = db.execute("SELECT COUNT(*) FROM blocks").fetchone()[0]
db.execute("VACUUM")
db.commit()
db.close()
print(f"map blocks {before} -> {after} (dropped {before - after} void chunks)")
PY

# Per-player state the mods keep (who has already been placed at the hand-off
# view) lives here. Small, and dropping it would replay the spawn for everyone.
if [ -d "$SRC/mod_storage" ]; then
  cp -a "$SRC/mod_storage" "$DEST/"
fi

mkdir -p "$DEST/worldmods"
for m in $PACK_MODS; do
  # The hand-written mods live in the repo (luanti-web/mods) so they are
  # versioned; the generated `eng` mod only exists in the local install.
  if [ -d "$HERE/mods/$m" ]; then
    cp -a "$HERE/mods/$m" "$DEST/worldmods/$m"
  else
    cp -a "$MODS/$m" "$DEST/worldmods/$m"
  fi
  rm -rf "$DEST/worldmods/$m/.git"
done
# Player accounts and logs have no business in a public pack.
rm -rf "$DEST/worldmods"/*/players "$DEST/worldmods"/*/auth.txt

mkdir -p "$HERE/out/packs"
tar -C "$STAGE" -cf - luanti | zstd -q --ultra -22 -f -o "$OUT" -

echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
echo "contents (textures elided):"
tar --use-compress-program=unzstd -tf "$OUT" | grep -v '/textures/' | head -40
