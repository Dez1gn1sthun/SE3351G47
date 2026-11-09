# The toolchain container, without the build.
#
# Upstream's Dockerfile runs the compile inside the image, which means every
# retry starts from scratch and the Emscripten toolchain is buried in a layer
# you cannot inspect. This splits the environment from the build: the container
# provides the tools, the checkout is bind-mounted, and emsdk plus the build
# tree live on the host under vendor/ so a failed step can be re-run on its own.
FROM ubuntu:22.04

# upstream's dependency list from its own Dockerfile
RUN \
	   apt-get update \
	&& DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get install -y \
		wget \
		python3 \
		git \
		build-essential \
		cmake \
		tclsh \
		zip \
		zstd \
		gettext \
	&& rm -rf /var/lib/apt/lists/*

# Then the three things upstream's Dockerfile forgets, though its own scripts
# need them: Node v24 (install_emsdk.sh runs `which node` under `set -e` and
# then refuses anything that is not v24), patch (apply_patches.sh), and unzip
# (common.sh's do_unpack for .zip sources).
RUN apt-get update \
	&& DEBIAN_FRONTEND=noninteractive apt-get install -y patch unzip curl xz-utils \
	&& rm -rf /var/lib/apt/lists/*

ARG NODE_VERSION=v24.22.2
RUN curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz" \
      -o /tmp/node.tar.xz \
	&& tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 \
	&& rm /tmp/node.tar.xz \
	&& node --version | tee /tmp/node-version \
	&& grep -q '^v24\.' /tmp/node-version

WORKDIR /luanti-wasm
