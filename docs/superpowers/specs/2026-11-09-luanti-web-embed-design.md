# Campus in the browser: design

2026-11-09

## What this is

A public URL where a visitor lands inside the Western Engineering campus world,
walking around in Luanti — the real engine, compiled to WebAssembly — with no
menu, no login and no server. It is a new, separate project. The existing
Three.js campus viewer is not involved and is not modified.

## The why

The campus already exists three ways: as a Three.js diorama, as a photogrammetry
room you can stand in, and as a Luanti world you can only reach by installing
Luanti, copying a folder into `~/.minetest/worlds`, and opening it. The third is
the one where you can actually dig, build and fly, and it is the one nobody can
see without a setup step. The point of this project is to remove that step and
nothing else.

## Goals

- Open the URL, wait once, be inside the campus.
- Move, fly, dig, build — with the engine's own physics and inventory, not a
  lookalike.
- Changes persist across reloads on that machine.
- Deployable to a public URL with nothing running server-side.

## Non-goals

- Multiplayer. No proxy, no server, no shared world.
- Mobile. It needs a keyboard and a mouse.
- Replacing or embedding into the existing Three.js site.
- Looking good while loading. The engine takes over the whole page.

## Anti-goals

- A second world that only looks like the Luanti one. If it does not run the
  engine, the project has failed.
- Shipping Mojang's textures. The committed swatch mod is what goes out.
- A build that only works on the author's machine.

## Constraints, discovered and verified

- **Luanti has no official browser build.** The maintained community port is
  `paradust7/luanti-wasm`, pinned here at `5bfae52`. It is experimental and can
  break; pinning is the mitigation, not a fix.
- **Cross-origin isolation is mandatory.** Threads need
  `SharedArrayBuffer`, which needs COOP `same-origin` + COEP `require-corp` on
  every response. GitHub Pages cannot send headers. This rules out Pages, and
  rules out iframing this from the Pages-hosted Three.js site. The target is
  Netlify or Cloudflare Pages, both of which read a Netlify-style `_headers`
  file.
- **No prebuilt releases exist upstream.** The only way in is `build_all.sh` in
  Docker: emsdk, then zstd, libarchive, OpenSSL, curl, libzip, then Luanti. Slow,
  and a plausible source of unrelated build failures.
- **The world is small.** `map.sqlite` is 3.6 MB; the game is the bulk of the
  download.
- **Upstream's base pack ships no game** (deliberately, since Aug 2026). A game
  has to be supplied as a pack.

## How it works

Three artifacts, two of which are data:

1. `www/` from the upstream build: engine wasm, launcher JS, `base` and `certs`
   packs, per-release hashed directory.
2. `campus.pack` — tar+zstd of `luanti/worlds/campus/{map.sqlite, world.mt,
   map_meta.txt, env_meta.txt}` plus the campus mod under `worldmods/campus/`.
3. `minetest.pack` — tar+zstd of `luanti/games/minetest/`, the official Minetest
   Game at a pinned commit.

A custom `index.html` replaces upstream's launcher form. It declares both packs,
pins a handful of settings (`viewing_range`, `max_block_send_distance`,
`static_spawnpoint`, `name`, damage off), and on `onready` calls `launch()` with
`--go --world /luanti/worlds/campus --gameid minetest`, which skips the main
menu.

## Decisions I made, as mine

- **The `campus` world, not `campus_native`.** Its nodes are `campus:*` with the
  procedurally generated swatches, so it keeps the exact colours of the original
  Minecraft build, and its mod grants `fly`/`fast`/`noclip` on join. That grant
  is the difference between touring a 550-block campus and walking it.
  `campus_native` needs no mod but has neither.
- **Packs at a stable path** (`www/packs/`, via `setPacksDir`) rather than in the
  hashed release directory. Upstream keys pack versions by URL and deletes a
  pack's files when the version changes, which would wipe a visitor's saved
  world on every redeploy.
- **Singleplayer only**, no proxy. Upstream's default proxy is a third-party
  service and multiplayer was not asked for.
- **The campus mod ships as a `worldmods/` entry**, so the game pack stays the
  stock game.

## Left to the builder

- Verify the spawn point. `330,56,155` comes from `luanti-campus/README.md`,
  where it is described as a roof, but neither world file actually records it, so
  it is a claim from documentation and not from the data. If it is wrong the
  visitor lands in the void.
- Measure first-load size and a realistic `viewing_range`. 120 is a guess;
  upstream's own demo uses 85. The two packs are already measured (3.3 MB and
  2.2 MB compressed); the engine binary is the unknown.
- Verify that `--go` without a main menu still picks up a player name on this
  build. `name` is set both as a setting and as an argument to cover both paths.
- Confirm the world opens at all: Luanti 5.18 reading a 5.x-era `map.sqlite` is
  expected to work, but it has not been tried.
- Choose the host. Netlify and Cloudflare Pages both read `_headers`, but the
  free tiers differ on per-file caps and egress, and neither has been tried
  against a real deploy.

## Settled after review

A fresh reviewer read this document and pushed back; these are the answers, in
order of how much they changed.

- **Creative mode, and the clock stopped.** The world only records
  `enable_damage = false`, so a visitor would have arrived in survival with an
  empty inventory, unable to dig stone — which fails this document's own
  success test. `creative_mode = true` and `time_speed = 0` are now pinned. The
  baked start time is daytime (`time_of_day = 7018`), so freezing it is right.
- **The game is pinned to `9e895af`** (`luanti-org/minetest_game`), recorded in
  `packs/make_game_pack.sh`. The policy is to move it only when the engine pin
  moves: the baked world's `env_meta.txt` carries LBMs keyed to that game's node
  names, and the campus mod depends on `default`.
- **The campus pack is frozen.** A pack's URL is its version, and a version bump
  makes the engine delete everything the old pack wrote — including the world.
  So `campus.pack` is a snapshot; re-baking means a new pack name and a new world
  directory, decided then.
- **Unsupported visitors are told so.** Phones, old browsers and misconfigured
  hosts get a sentence instead of a black screen (`SharedArrayBuffer` and
  `crossOriginIsolated` are checked before the engine is loaded).
- **Self-origin only, with attribution.** No proxy, no fonts, no analytics, and
  nothing cross-origin to trip over `require-corp`. Luanti is GPL-2.0 and
  Minetest Game CC-BY-SA-3.0; the bootstrap screen credits both.
- **No reset control.** Persistence is accepted as best-effort, with
  `?storage=memory` as the escape hatch and clearing site data as the reset.
  Not worth a button yet.

## How we will know it worked

Open the URL on a machine that has never run Luanti, wait, and end up standing on
the campus. Dig a block, reload, and the hole is still there.
