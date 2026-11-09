#!/usr/bin/env bash
# Builds the deployable site into out/www.
#
# The slow part is compiling Luanti itself to WebAssembly: Emscripten plus zstd,
# libarchive, OpenSSL, curl and libzip. Expect tens of minutes on 20 cores.
#
#   ./build.sh --prepare          fetch the port, install our page, build packs
#   ./build.sh --step build_zstd.sh   run one step of the upstream build
#   ./build.sh                    everything, into out/www
#   ./build.sh --shell            interactive shell in the toolchain container
#
# The toolchain lives in a container (docker/builder.Dockerfile) and the work
# happens in vendor/luanti-wasm, which is bind-mounted rather than baked into an
# image. That way a failed step can be re-run in seconds instead of re-doing the
# Emscripten download, and config.log files survive to be read.
set -euo pipefail

cd "$(dirname "$0")"
HERE="$PWD"

# Pinned: the port moves, and a silent engine upgrade underneath a baked world is
# not a debugging session worth having.
LUANTI_WASM_REPO="https://github.com/paradust7/luanti-wasm"
LUANTI_WASM_REF="${LUANTI_WASM_REF:-5bfae52b53605b39667dfc29cddd59c861e38111}"

VENDOR="vendor/luanti-wasm"
OUT="out"
BUILDER="luanti-web-builder"

MODE="build"
STEP=""
case "${1:-}" in
  -p|--prepare) MODE="prepare" ;;
  -s|--step)    MODE="step"; STEP="${2:?--step needs a script name}" ;;
  --shell)      MODE="shell" ;;
  "")           ;;
  *) echo "usage: $0 [--prepare | --step <script> | --shell]" >&2; exit 2 ;;
esac

step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

# ---------------------------------------------------------------- vendor

step "vendor $LUANTI_WASM_REF"
if [ ! -d "$VENDOR/.git" ]; then
  git clone --quiet "$LUANTI_WASM_REPO" "$VENDOR"
fi
git -C "$VENDOR" fetch --quiet --all
git -C "$VENDOR" checkout --quiet "$LUANTI_WASM_REF"

step "our page replaces theirs"
cp static/index.html "$VENDOR/static/index.html"
cp static/_headers "$VENDOR/static/_headers"
cp deploy.sh "$VENDOR/deploy.sh"
chmod +x "$VENDOR/deploy.sh"

# ------------------------------------------------- static linking

step "force static libraries"
# Everything here ends up inside one .wasm, so a shared object in install/lib is
# never useful and is actively harmful: the linker prefers it over the .a, and
# then every program built afterwards is a dynamically linked module that has to
# find its side module next to itself at runtime.
#
# That is exactly how this build dies: libarchive's configure links against the
# shared libzstd, the autoconf probe then fails with "cannot compute sizeof
# (wchar_t)" because the test program cannot load libzstd.so, and the error reads
# like a broken toolchain rather than a build-flag mistake.
#
# openssl (no-shared) and curl (-DBUILD_SHARED_LIBS=OFF) already get this right.
python3 - "$VENDOR" <<'PY'
import pathlib, sys

vendor = pathlib.Path(sys.argv[1])

# zstd's CMake does not consult BUILD_SHARED_LIBS; it has its own switch.
zstd = vendor / "build_zstd.sh"
src = zstd.read_text()
if "ZSTD_BUILD_SHARED" not in src:
    anchor = '  -DCMAKE_INSTALL_PREFIX="$INSTALL_DIR" \\\n'
    if anchor not in src:
        sys.exit(f"{zstd}: cannot find the cmake invocation; upstream changed")
    src = src.replace(anchor, '  -DZSTD_BUILD_SHARED=OFF \\\n' + anchor, 1)
    zstd.write_text(src)

# libzip turns it on by default.
libzip = vendor / "build_libzip.sh"
src = libzip.read_text()
if "BUILD_SHARED_LIBS" not in src:
    anchor = '    -DCMAKE_INSTALL_PREFIX="$INSTALL_DIR"\n'
    if anchor not in src:
        sys.exit(f"{libzip}: cannot find the cmake invocation; upstream changed")
    src = src.replace(anchor, '    -DBUILD_SHARED_LIBS=OFF \\\n' + anchor, 1)
    libzip.write_text(src)

print("zstd and libzip will build static only")
PY

# ---------------------------------------------------------------- packs

step "packs"
./packs/make_game_pack.sh
./packs/make_world_pack.sh
rm -rf "$VENDOR/packs"
cp -a out/packs "$VENDOR/packs"

if [ "$MODE" = "prepare" ]; then
  echo
  echo "prepared: $VENDOR and $OUT/packs"
  exit 0
fi

# ---------------------------------------------------------------- toolchain

step "toolchain image"
docker build -q -f docker/builder.Dockerfile -t "$BUILDER" docker

run_builder() {
  mkdir -p "$OUT/home"
  docker run --rm \
    --user "$(id -u):$(id -g)" \
    -e HOME=/home/builder \
    -v "$HERE/$VENDOR:/luanti-wasm" \
    -v "$HERE/$OUT/home:/home/builder" \
    -w /luanti-wasm \
    "$BUILDER" "$@"
}

if [ "$MODE" = "shell" ]; then
  exec docker run --rm -it \
    --user "$(id -u):$(id -g)" \
    -e HOME=/home/builder \
    -v "$HERE/$VENDOR:/luanti-wasm" \
    -v "$HERE/$OUT/home:/home/builder" \
    -w /luanti-wasm \
    "$BUILDER" bash
fi

if [ "$MODE" = "step" ]; then
  step "$STEP"
  run_builder bash -c "./$STEP"
  # build_www.sh regenerates the deployable tree from an existing build, so
  # collecting it here means a page change needs no recompile.
  if [ "$STEP" = "build_www.sh" ] && [ -d "$VENDOR/www" ]; then
    rm -rf "$OUT/www"
    cp -a "$VENDOR/www" "$OUT/www"
    echo "collected $OUT/www"
  fi
  exit 0
fi

# ---------------------------------------------------------------- build

step "emsdk"
# install_emsdk.sh reinstalls from scratch every time it is called, so it is only
# called when the checkout has no toolchain yet. common.sh does the same check
# before sourcing.
run_builder bash -c 'test -d emsdk || ./install_emsdk.sh'

step "compile (this is the long one)"
run_builder ./build_all.sh

if [ ! -d "$VENDOR/www" ]; then
  echo "build produced no $VENDOR/www" >&2
  exit 1
fi

step "collect www/"
rm -rf "$OUT/www"
cp -a "$VENDOR/www" "$OUT/www"

step "done"
du -sh "$OUT/www"
echo
echo "Serve it with:  ./static/serve.py $OUT/www"
echo "Deploy it with: netlify deploy --prod --dir $OUT/www"
echo "            or: npx wrangler pages deploy $OUT/www"
