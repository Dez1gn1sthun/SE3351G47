#!/usr/bin/env bash
# Builds a world pack.
#
# A "pack" is a zstd-compressed tar whose paths are absolute from the WebAssembly
# filesystem root, so every entry starts with luanti/. The launcher downloads the
# file and the engine unpacks it; see emloop_install_pack() in the luanti-wasm
# fork. Worlds must land in /luanti/worlds, which is the only place the engine
# looks for them (WORLDS_DIR in src/mainloop.cpp).
#
# Sources, in order of preference:
#   world/<name>/            checked in: map.sqlite, world metadata, mod Lua
#   ~/.minetest/worlds/<name>  a local Luanti install
#
# The branch is self-sufficient: world data is committed, and the block textures
# are taken from a local install when present, otherwise generated as flat
# colour swatches from world/palette.json. The real textures are Mojang assets
# and are never committed.
#
# Usage: packs/make_world_pack.sh [world-name]      (default: eng)
set -euo pipefail

cd "$(dirname "$0")/.."
HERE="$PWD"
DATA="${LUANTI_DATA_DIR:-$HOME/.minetest}"

WORLD="${1:-eng}"
REPO_WORLD="$HERE/world/$WORLD"
LOCAL_WORLD="$DATA/worlds/$WORLD"
MODS="$DATA/mods"
OUT="$HERE/out/packs/$WORLD.pack"

if [ -f "$REPO_WORLD/map.sqlite" ]; then
  SRC="$REPO_WORLD"
  echo "world source: $SRC (repository)"
elif [ -f "$LOCAL_WORLD/map.sqlite" ]; then
  SRC="$LOCAL_WORLD"
  echo "world source: $SRC (local install)"
else
  echo "no world called $WORLD: looked in $REPO_WORLD and $LOCAL_WORLD" >&2
  exit 1
fi

# Mods the world loads, all of which travel inside the pack: worldmods/ keeps
# them out of the game itself.
PACK_MODS="eng eng_fog eng_time eng_spawn"

resolve_mod() {
  local m="$1"
  if [ -d "$HERE/mods/$m" ]; then
    echo "$HERE/mods/$m"
  elif [ -d "$SRC/worldmods/$m" ]; then
    echo "$SRC/worldmods/$m"
  elif [ -d "$MODS/$m" ]; then
    echo "$MODS/$m"
  else
    echo ""
  fi
}

for m in $PACK_MODS; do
  if [ -z "$(resolve_mod "$m")" ]; then
    echo "missing mod: $m (looked in $HERE/mods, $SRC/worldmods, $MODS)" >&2
    exit 1
  fi
done

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

DEST="$STAGE/luanti/worlds/$WORLD"
mkdir -p "$DEST"

# map.sqlite holds the build; the three text files describe the world, and
# without map_meta.txt the engine has to guess at the mapgen parameters.
cp "$SRC/map.sqlite" "$SRC/world.mt" "$SRC/map_meta.txt" "$SRC/env_meta.txt" "$DEST/"

# Trim empty chunks. A session spent flying outside the build emerges tens of
# thousands of them, and each still costs space: 93k blocks became 7.2k here.
# Bounds are the build bbox in 16-node map blocks (nodes x 0..399, y 0..87,
# z 0..755); they come from world/eng/map_meta.txt's companion bbox comment in
# the README.
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
if before != after:
    print(f"map blocks {before} -> {after} (dropped {before - after} void chunks)")
PY

# Per-player state the mods keep (who already has the hand-off view) lives here.
if [ -d "$SRC/mod_storage" ]; then
  cp -a "$SRC/mod_storage" "$DEST/"
fi

mkdir -p "$DEST/worldmods"
for m in $PACK_MODS; do
  src="$(resolve_mod "$m")"
  cp -a "$src" "$DEST/worldmods/$m"
  rm -rf "$DEST/worldmods/$m/.git"
done

# The generated eng mod ships its node definitions but not its textures (Mojang)
# and not the 3.4 MB placement blob (the world is already baked, autoplace is
# off, so /place_eng is the only thing that would need it).
ENG="$DEST/worldmods/eng"
rm -rf "$ENG/data"
if [ -d "$MODS/eng/textures" ] && [ -n "$(ls -A "$MODS/eng/textures" 2>/dev/null)" ]; then
  echo "textures: $MODS/eng/textures (local install)"
  rm -rf "$ENG/textures"
  cp -a "$MODS/eng/textures" "$ENG/textures"
else
  echo "textures: generating swatches from world/palette.json"
  python3 "$HERE/world/make_swatches.py" "$ENG/textures"
fi

# Player accounts and logs have no business in a public pack.
rm -rf "$DEST"/worldmods/*/players "$DEST"/worldmods/*/auth.txt

mkdir -p "$HERE/out/packs"
tar -C "$STAGE" -cf - luanti | zstd -q --ultra -22 -f -o "$OUT" -

echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
