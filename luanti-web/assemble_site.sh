#!/usr/bin/env bash
# Composes the deployable site into out/www.
#
#   /               the WEVE entry screen (viewer/)
#   /luanti.html    the Luanti page: boot copy, progress bar, wasm launcher
#   /packs/*.pack   the world and game packs
#   /<release>/     the hashed wasm release
#
# Run it after ./build.sh, and again after editing viewer/. The launcher page
# only moves aside, it does not change directory, so its relative paths
# (packs/, <release>/launcher.js) keep resolving from the site root.
set -euo pipefail

cd "$(dirname "$0")"
HERE="$PWD"
ROOT="$(cd "$HERE/.." && pwd)"
WWW="$HERE/out/www"

if [ ! -f "$WWW/index.html" ]; then
  echo "no $WWW/index.html; run ./build.sh and ./packs/make_world_pack.sh first" >&2
  exit 1
fi

# First run: the launcher is index.html. Later runs: it is already luanti.html
# and index.html belongs to the entry screen.
if grep -q 'launcher\.js' "$WWW/index.html"; then
  mv "$WWW/index.html" "$WWW/luanti.html"
  echo "launcher page moved to /luanti.html"
fi

cp "$ROOT/viewer/index.html" "$ROOT/viewer/styles.css" "$ROOT/viewer/main.js" "$WWW/"

# The entry screen fetches content.json next to itself.
if [ -f "$ROOT/public/viewer/content.json" ]; then
  cp "$ROOT/public/viewer/content.json" "$WWW/content.json"
else
  echo "warning: public/viewer/content.json missing; the tour will report an error" >&2
fi

if [ -f "$ROOT/public/favicon.svg" ]; then
  cp "$ROOT/public/favicon.svg" "$WWW/favicon.svg"
fi

echo "assembled $WWW"
printf '  %-14s %s\n' "/" "entry screen (viewer/)" "/luanti.html" "Luanti world"
printf '  %-14s %s\n' "/packs/" "world and game packs"
