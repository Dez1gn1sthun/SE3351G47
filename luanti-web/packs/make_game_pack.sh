#!/usr/bin/env bash
# Builds the Minetest Game pack.
#
# The upstream luanti-wasm base pack deliberately ships no game (see
# build_fsroot.sh: it creates an empty games/ directory), so the game the campus
# world belongs to has to be supplied as a pack of its own.
#
# The pack name is "minetest", not "minetest_game": the launcher fetches
# <gameid>.pack for the game the world is opened with, and the campus world's
# world.mt says gameid = minetest. The directory inside the archive has to match.
set -euo pipefail

cd "$(dirname "$0")/.."

# Pinned so a rebuild does not silently change the game under a baked world.
MTG_REPO="https://github.com/luanti-org/minetest_game"
MTG_REF="${MTG_REF:-9e895af6e9feb98332fa1a778001442f5669bc20}"

CACHE="out/src/minetest_game"
OUT="out/packs/minetest.pack"

mkdir -p out/src out/packs

if [ ! -d "$CACHE/.git" ]; then
  rm -rf "$CACHE"
  git clone --quiet "$MTG_REPO" "$CACHE"
fi
git -C "$CACHE" fetch --quiet --all
git -C "$CACHE" checkout --quiet "$MTG_REF"

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/luanti/games"
cp -a "$CACHE" "$STAGE/luanti/games/minetest"
rm -rf "$STAGE/luanti/games/minetest/.git"

# The engine takes the game id from game.conf's `name` if it has one, and
# otherwise from the directory name. Minetest Game has no `name` line at all
# (only `title`), so the directory has to be games/minetest -- which is what the
# campus world's world.mt asks for. A `name` that disagrees would win, so refuse
# that case rather than shipping a world that cannot find its game.
if grep -qE '^name[[:space:]]*=' "$STAGE/luanti/games/minetest/game.conf"; then
  if ! grep -qE '^name[[:space:]]*=[[:space:]]*minetest[[:space:]]*$' \
      "$STAGE/luanti/games/minetest/game.conf"; then
    echo "game.conf declares a name other than minetest:" >&2
    grep -E '^name[[:space:]]*=' "$STAGE/luanti/games/minetest/game.conf" >&2
    exit 1
  fi
fi

tar -C "$STAGE" -cf - luanti | zstd -q --ultra -22 -f -o "$OUT" -

echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
