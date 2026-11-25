# Western Engineering · Virtual Explorer

A landing page plus an orbitable 3D model of Western University's engineering
buildings. A sign pinned to the model opens a LiDAR scan of **ACEB 1420**: click
it and you are standing inside the room.

Built with TypeScript, Vite and Three.js. No framework.

The site has two pages, served from one server on one port:

| Page | URL | What it is |
| --- | --- | --- |
| Landing | `/` | Entry screen, low-performance toggle, accessible text-only tour. No 3D code. |
| Campus | `/campus.html` | The 3D campus and the ACEB 1420 room scan. |

"View campus" navigates from the landing page to the campus page rather than
embedding it. The landing page never downloads three.js or the models, and the
campus gets the whole GPU and window once it opens.

## Running it

Needs Node.js 20.19+ (the TypeScript has to be compiled).

```bash
npm install
npm run dev        # development: live reload at http://localhost:5173
npm start          # production: build, then serve dist/ at http://localhost:8080
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload, serving both pages. |
| `npm start` | `npm run build` then `npm run serve`. |
| `npm run build` | Type-checks, then writes the static site to `dist/`. |
| `npm run serve` | Serves an existing `dist/` with the Node server in `server/node/`. |
| `npm run typecheck` | Type-checks the client and the Vite config without building. |

Pick another port with `PORT=3000 npm run serve` (PowerShell:
`$env:PORT=3000; npm run serve`).

### Serving with Python instead

Once `dist/` has been built, it can be served with only the Python standard
library (3.8+). This is useful on a machine without Node:

```bash
python3 server/python/server.py              # http://localhost:8080
python3 server/python/server.py --port 3000
python3 server/python/server.py --build      # runs "npm run build" first
```

On Windows, use `python` instead of `python3`.

Both servers send explicit MIME types (`.glb` as `model/gltf-binary`, `.js` as
`text/javascript` even when the Windows registry says otherwise), a
`Content-Length` for the loading bar, and long-lived cache headers for Vite's
fingerprinted `/assets/` files.

`dist/` uses a relative base (`./`), so it can also be dropped on any static
host, including GitHub Pages under a subpath.

## Layout

```text
client/                     everything the browser loads (Vite root)
  index.html                landing page markup
  campus.html               3D campus markup: canvas, sign card, HUD, loader
  public/                   copied to dist/ as-is
    content.json            editable landing-page copy and text-tour content
    favicon.svg
    models/                 eng-campus.glb, aceb-1420.glb
  src/
    landing/
      main.ts               entry point for index.html
      LandingApp.ts         wires the screens, analytics and navigation
      EntryScreen.ts        the first screen (View campus / Text-only tour)
      TextTour.ts           accessible text alternative built from content.json
      ContentRepository.ts  loads and types content.json
      Analytics.ts          non-personal event tracking, honours Do Not Track
      Preferences.ts        localStorage-backed settings (low-performance mode)
    campus/
      main.ts               entry point for campus.html
      CampusApp.ts          renderer, mode switching, load/error flow, loop
      LoaderOverlay.ts      progress / error / retry overlay
      CampusView.ts         campus scene, camera framing, sign marker + projection
      RoomView.ts           interior scan scene and disposal
      config.ts             model paths, sign node name, copy
      types.ts
    shared/
      dom.ts                element lookup and HTML escaping
      routes.ts             page URLs and the query parameters between them
    styles/
      landing.css
      campus.css
server/
  node/index.mjs            `npm run serve` entry point
  node/StaticServer.mjs     dependency-free static file server
  python/server.py          standard-library equivalent
scripts/                    sign injection for the glb and the .blend
blender/Eng.blend           source of the campus model
docs/reference/             reference render of the campus model
```

## Landing page

- **Content.** Everything editable (program link, areas, points of interest,
  optional images) is in `client/public/content.json`. Images go in
  `client/public/images/info/`; any that are missing are hidden automatically.
- **Low-performance mode.** The checkbox is remembered in localStorage and
  passed to the campus as `campus.html?lowperf=1`. That drops antialiasing,
  shadows and the high-DPI backbuffer.
- **No WebGL.** If the device can't create a WebGL context, "View campus" opens
  the text tour with a notice instead of a blank page.
- **Analytics.** Event name, elapsed time and coarse context only: no IDs, no
  cookies. Events are sent to `site.analyticsEndpoint` if it is set, and
  otherwise logged to the console.

## How the campus works

- **Campus.** `models/eng-campus.glb` is framed to the building cluster on load,
  then handed to `OrbitControls`. The camera re-fits if the window is resized
  before the user starts orbiting, so portrait phones get a workable framing
  instead of a cropped one.
- **Sign.** The model contains an empty named `sign`. Each frame its world
  position is projected to screen space and a DOM card is moved to that point
  (see `CampusView.positionLabel`). The card is hidden rather than clipped when
  the anchor leaves the viewport. In the scene itself, a pulsing ring is dropped
  onto the terrain under the anchor with a downward raycast, because the
  photogrammetry ground is not flat.
- **Look.** The massing blocks are untextured boxes, so most of the realism
  comes from the light rig:
  - a sky-gradient environment map, which gives the PBR sheen a bare
    directional light can't;
  - a 30-degree sun with real shadow maps;
  - contact occlusion and faint mottling injected in the shader;
  - a sky-bounce fill so the shaded faces aren't charcoal.

  The sun's angle is matched to the shadows baked into the satellite imagery.
  The terrain's cut sides are painted as a dark plinth, so the photogrammetry
  tile reads as a deliberate diorama rather than a slice of land floating in
  the void.
- **Room.** Clicking the sign lazily loads `models/aceb-1420.glb` (20 MB) into a
  second scene and derives an eye point from the scan's bounding box. Leaving
  the room disposes the geometry and textures to give the GPU memory back.
  Reopening it re-fetches from the HTTP cache.

Controls: drag to orbit, right-drag to pan, scroll to zoom, and hold W/A/S/D
to move the orbit point across the ground plane relative to the camera. In the
room, drag to look around, scroll to move, and use W/A/S/D for the same
ground-plane movement; press `Esc` (or the Campus button) to leave.
"← Back to start" in the top-left corner returns to the landing page.

## Moving the sign

The empty marks the entrance of ACEB (the Amit Chakma Engineering Building) and
currently sits at glTF `20, 1.5, -4.5`. Either move it in Blender and re-export,
or patch the export directly (position is in glTF coordinates: Y up, metres):

```bash
npm run sign -- client/public/models/eng-campus.glb 20,1.5,-4.5
```

To keep the `.blend` source in agreement, run the Blender-side helper with the
same numbers:

```bash
blender -b Eng.blend --python scripts/add-sign-to-blend.py -- 20,1.5,-4.5
```

**The empty has to be selected when exporting the campus.** Blender's glTF
exporter ships only the selected objects. The model has been re-exported once
without the empty; when that happens, the app silently falls back to
`SIGN_FALLBACK` and the marker drifts to wherever that point lands in the new
geometry. After any re-export, run `npm run sign --` again. It is idempotent: if
the node already exists, it moves it.

If the empty ever goes missing (after a re-export from a stale `.blend`, say),
the app still renders the marker at `SIGN_FALLBACK` in
`client/src/campus/config.ts` and logs an error.

Dev helpers, which are stripped from production builds: append `?nodes` to
`campus.html` to draw every node name on screen, or `?sign=x,y,z` to try a
marker position without re-exporting.

## Assets

| File | Size | Notes |
| --- | --- | --- |
| `client/public/models/eng-campus.glb` | 13 MB | campus blockout + satellite terrain, 12 nodes + `sign` |
| `client/public/models/aceb-1420.glb` | 20 MB | Scaniverse LiDAR scan, single mesh, 245k vertices |
| `blender/Eng.blend` | 4.3 MB | source scene |

Committed as plain binaries. Both files are well under GitHub's 100 MB limit,
so LFS isn't worth the setup cost here. `*.blend1` backups are ignored.
