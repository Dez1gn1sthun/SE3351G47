# Engineering Campus, playable in a browser

The `luanti-campus` world, running in Luanti itself, compiled to WebAssembly.
Not a reimplementation: the same C++ engine, the same Lua game, the same
`map.sqlite`. You walk in and it is there — no menu, no account, no server.

```
./build.sh                          # compiles Luanti; tens of minutes on 20 cores
./static/serve.py out/www           # http://localhost:8080
netlify deploy --prod --dir out/www # or any host that can set headers
```

## Why this is a separate project

The WebAssembly build needs the page to be cross-origin isolated
(`Cross-Origin-Opener-Policy: same-origin` plus
`Cross-Origin-Embedder-Policy: require-corp`), because Luanti uses threads and
the browser only hands out shared memory to isolated pages. Those are response
headers, and **GitHub Pages cannot set them**. So this cannot be a folder inside
the Three.js site, and it cannot be iframed from it either: the outer page would
need the same headers, which Pages will not send.

## What is in here

| Path | What it is |
|---|---|
| `static/index.html` | The page. Replaces upstream's launcher form; starts the game itself. |
| `static/_headers` | COOP/COEP for Netlify and Cloudflare Pages. |
| `static/serve.py` | Local server that sends those headers, for testing. |
| `packs/make_world_pack.sh` | `luanti-campus/world/campus` → `out/packs/campus.pack`. |
| `packs/make_game_pack.sh` | Minetest Game → `out/packs/minetest.pack`. |
| `deploy.sh` | Hook called by luanti-wasm's `build_www.sh` at the end of the build. |
| `build.sh` | All of the above, in order, plus the Docker compile. |

`vendor/` and `out/` are generated and not committed.

## How the pieces fit

Upstream (`paradust7/luanti-wasm`) ships a `www/` containing a hashed release
directory, the engine (`luanti.wasm` + `luanti.js`), two packs of its own
(`base`, `certs`), and a launcher JS API. Our page sits on top of that API:

- `setPacksDir("packs/")` points at a **stable** path for our two packs.
- `addPack("minetest")` and `addPack("campus")` fetch and unpack them.
- `setConf()` pins viewing range, spawn and player name.
- `launch()` with `--go --world /luanti/worlds/campus --gameid minetest` skips
  the main menu and drops straight into the campus.

A pack is a zstd-compressed tar whose entries are absolute from the WASM
filesystem root, so `luanti/worlds/campus/map.sqlite` in the archive becomes
`/luanti/worlds/campus/map.sqlite` in the engine. These are the paths the engine
actually uses (`src/mainloop.cpp`: `WORLDS_DIR`, `GAMES_DIR`).

Two details worth knowing, both load-bearing:

- The **game id must be `minetest`**, because that is what the baked world's
  `world.mt` says. The pack is therefore `minetest.pack` and the directory
  inside it is `games/minetest`, not `games/minetest_game`.
- The **world's nodes are `campus:*`**, so the campus mod travels with the world
  in `worldmods/campus/`. That mod also grants `fly`, `fast` and `noclip` on
  join, which is the difference between touring the campus and walking it.

## Why the packs are not in the release directory

Upstream invalidates a pack by its URL: the path is the version, and a pack
recorded under an older version gets its files deleted before the new ones are
unpacked. Serving our packs from the hashed release directory would therefore
mean every redeploy silently wipes the visitor's saved world. Serving them from
`www/packs/` keeps the path stable, so the version never changes and the world
survives. Only `base` and `certs` come from the release directory, and upstream
handles those itself.

## Persistence

Worlds live in the browser's origin private file system (OPFS), under `/luanti`.
Dig someone's office out, reload the page, and the hole is still there. Clearing
site data resets it to the baked campus. `?storage=memory` disables persistence
entirely, which is useful when testing.

## Known limitations

- **First load is the wasm binary plus two small packs** — measured so far: the
  campus world is 3.3 MB and the game 2.2 MB, compressed. The engine binary is
  the bulk and its size is not known until the build runs. Later visits load
  everything from local storage.
- **Desktop only, realistically.** It needs a keyboard, a mouse and hardware
  WebGL. A visitor without cross-origin isolation gets a sentence telling them
  so, not a black screen.
- **Singleplayer only.** There is no multiplayer: the proxy that upstream uses
  to carry Luanti's UDP through a WebSocket is a third-party service, needs its
  own CORP headers under COEP, and is not wired up here. The page makes no
  third-party requests at all.
- **No sound.** The WebAssembly port builds without audio.
- **Persistence is best effort.** Worlds live in OPFS, and the browser may evict
  them under storage pressure. There is no reset button; `?storage=memory`
  disables persistence, and clearing site data restores the baked campus.
- **The campus pack is a frozen snapshot.** Because a pack's URL is its version,
  re-cutting `campus.pack` in place would either do nothing for returning
  visitors or delete the world they have been editing. A re-baked world needs a
  new pack name and a new world directory.
- Spawn, viewing range and rendering performance are guesses until the thing
  actually runs once. Verify the spawn point lands on a roof, not in the void.
