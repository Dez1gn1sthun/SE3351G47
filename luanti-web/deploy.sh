#!/bin/bash -eux
# Deploy hook for luanti-wasm's build_www.sh.
#
# build_www.sh calls ./deploy.sh <release-uuid> as its last step and describes it
# as "use this to add extra data packs, deploy to webserver, etc". We use it to
# put our two packs and the hosting header file into www/.
#
# This runs inside the build container, with cwd = /luanti-wasm.

RELEASE_UUID="$1"
WWW="$PWD/www"

# Both packs go to a stable path rather than into the per-release directory.
# The release directory is hashed, so packs served from it would get a new
# version on every deploy -- and a pack that looks newer gets uninstalled first,
# which deletes every file it wrote, including the visitor's saved world.
mkdir -p "$WWW/packs"
cp -v "$PWD"/packs/*.pack "$WWW/packs/"

# Cross-origin isolation (COOP/COEP) for hosts that read Netlify-style headers.
cp -v "$PWD/static/_headers" "$WWW/_headers"

echo "deploy.sh: release $RELEASE_UUID, packs:"
ls -la "$WWW/packs"
