# Western Engineering · Campus

Western University's engineering campus, playable in a browser tab. The entry
screen leads into a real Luanti engine compiled to WebAssembly, running a voxel
model of the campus that was built from a Blender export.

Nothing to install and no account: the first visit downloads the engine and the
world, later visits load both from the browser's local storage.

## Layout

```text
viewer/               entry screen (WEVE): markup, styles, tour content loader
  index.html          the landing page — "Enter the campus"
  main.js             entry screen logic; the start button opens luanti.html
  styles.css
public/viewer/        content.json, editable tour copy and area definitions
luanti-web/           the WebAssembly build and the deployable site
  build.sh            compiles Luanti to wasm (slow: tens of minutes)
  static/             launcher page, serve.py, host header files
  packs/              pack builders: the game pack and the world pack
  mods/               eng_fog, eng_time, eng_spawn (source of truth)
  assemble_site.sh    composes out/www: entry screen at /, Luanti at /luanti.html
  out/www/            the deployable site (gitignored)
blender/Eng.blend     source of the campus model
docs/reference/       reference render
```

## Running it

The site needs cross-origin isolation headers, because the wasm engine uses
threads and browsers refuse `SharedArrayBuffer` without them. A plain
`python3 -m http.server` loads the page and then fails inside the engine, so use
the bundled server:

```bash
cd luanti-web
./static/serve.py out/www          # http://localhost:8080
```

If `out/www` is missing, build it:

```bash
cd luanti-web
./build.sh                          # wasm engine, tens of minutes, once
./packs/make_world_pack.sh eng      # rebuild just the world pack, ~2 seconds
./assemble_site.sh                  # entry screen + Luanti at one root
./static/serve.py out/www
```

`make_world_pack.sh` builds the world pack from your local Luanti installation
(`~/.minetest`), because the world is 8 MB of sqlite plus 266 node textures and
those textures are Mojang assets that must not be redistributed. Only the small
Lua in `luanti-web/mods/` travels with the repository; the generated `eng` mod
is read from the install.

## What the visitor gets

- The campus at its real proportions: 569,545 blocks, 400 × 88 × 756, 266 block
  types, baked once and shipped as a pack.
- Late afternoon permanently (`timeofday = 0.74`, `time_speed = 0`), so every
  visitor sees the same light and the sun never sets mid-demo.
- Fog that starts at 70% of the view range, leaving the mid-distance clear.
- Flying and fast movement already on, so nobody has to find K and J first.
- A hand-off view: the visitor arrives at the author's rooftop vantage looking
  across the rest of the complex. Walking away is preserved per player name.

## Editing the world

The world is authored in Luanti, not in this repository:

```bash
luanti --world ~/.minetest/worlds/eng
```

Rebuild the pack after changing it (about two seconds, no wasm rebuild needed):

```bash
cd luanti-web && ./packs/make_world_pack.sh eng && ./assemble_site.sh
```

The pack builder copies the map and drops the empty chunks that a flight session
leaves behind — 64k blocks down to 7.2k in practice.

## Notes

- `viewer/` came from the WEVE front end. Its classroom tour and area picker are
  hidden now that the campus build replaced the classroom; the markup and tour
  code are still there so the two can be reunited.
- Hosts that cannot send COOP/COEP (GitHub Pages, for example) cannot run the
  engine. Netlify and Cloudflare Pages read `luanti-web/out/www/_headers`, and
  Apache reads the `.htaccess` files.
