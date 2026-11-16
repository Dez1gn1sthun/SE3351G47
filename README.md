# Western Engineering · 3D Campus

An orbitable 3D model of Western University's engineering buildings. A sign
pinned to the model opens a LiDAR scan of **ACEB 1420** — click it and you are
standing inside the room.

Built with TypeScript, Vite and Three.js. No framework: the whole app is one
canvas plus a thin DOM overlay.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static site in dist/
npm run preview    # serve the build locally
```

The build uses a relative base (`./`), so `dist/` can be dropped on any static
host, including GitHub Pages under a subpath.

## How it works

- **Campus** — `public/models/eng-campus.glb` is framed to the building cluster
  on load, then handed to `OrbitControls`. The camera re-fits if the window is
  resized before the user starts orbiting, so portrait phones get a workable
  framing instead of a cropped one.
- **Sign** — the model contains an empty named `sign`. Each frame its world
  position is projected to screen space and a DOM card is moved to that point
  (see `CampusView.positionLabel`). The card is hidden rather than clipped when
  the anchor leaves the viewport. In the scene itself a pulsing ring is dropped
  onto the terrain under the anchor with a downward raycast, because the
  photogrammetry ground is not flat.
- **Look** — the massing blocks are untextured boxes, so most of the realism comes
  from the light rig: a sky-gradient environment map (PBR sheen that a bare
  directional light cannot give), a 30-degree sun with real shadow maps, contact
  occlusion and faint mottling injected in the shader, and a sky-bounce fill so
  the shaded faces are not charcoal. The sun's angle is matched to the shadows
  baked into the satellite imagery; the terrain's cut sides are painted as a dark
  plinth so the photogrammetry tile reads as a deliberate diorama rather than a
  slice of land floating in the void.
- **Room** — clicking the sign lazily loads `public/models/aceb-1420.glb` (20 MB)
  into a second scene and derives an eye point from the scan's bounding box.
  Leaving the room disposes the geometry and textures to give the GPU memory
  back; reopening re-fetches from the HTTP cache.

Controls: drag to orbit, right-drag to pan, scroll to zoom. In the room, drag to
look around, scroll to move, `Esc` (or the Campus button) to leave.

## Moving the sign

The empty marks the entrance of ACEB (the Amit Chakma Engineering Building) and
currently sits at glTF `20, 1.5, -4.5`. Either move it in Blender and re-export,
or patch the export directly (position is in glTF coordinates — Y up, metres):

```bash
npm run sign -- public/models/eng-campus.glb 20,1.5,-4.5
```

To keep the `.blend` source in agreement, run the Blender-side helper with the
same numbers:

```bash
blender -b Eng.blend --python scripts/add-sign-to-blend.py -- 20,1.5,-4.5
```

**The empty has to be selected when exporting the campus.** Blender's glTF
exporter ships only the selected objects, and the model has been re-exported
once without it — the app then silently falls back to `SIGN_FALLBACK` and the
marker drifts to whatever that point means in the new geometry. After any
re-export, run `npm run sign --` again (it is idempotent: it moves the existing
node if there is one).

If the empty ever goes missing (a re-export from a stale `.blend`, say), the app
still renders the marker at `SIGN_FALLBACK` in `src/ts/config.ts` and logs an error.

Dev helpers, stripped from production builds: append `?nodes` to draw every node
name on screen, or `?sign=x,y,z` to try a marker position without re-exporting.

## Layout

```text
index.html            shell: canvas, sign card, HUD, loader
src/ts/main.ts           renderer, mode switching, load/error flow, loop
src/ts/campus.ts         campus scene, camera framing, sign marker + projection
src/ts/room.ts           interior scan scene and disposal
src/ts/config.ts         model paths, sign node name, copy
src/css/style.css        all styling
public/models/        eng-campus.glb, aceb-1420.glb (served as-is)
blender/Eng.blend     source of the campus model
scripts/              sign injection for the glb and the .blend
docs/reference/       reference render of the campus model
```

## Assets

| File | Size | Notes |
| --- | --- | --- |
| `public/models/eng-campus.glb` | 13 MB | campus blockout + satellite terrain, 12 nodes + `sign` |
| `public/models/aceb-1420.glb` | 20 MB | Scaniverse LiDAR scan, single mesh, 245k vertices |
| `blender/Eng.blend` | 4.3 MB | source scene |

Committed as plain binaries — both files are well under GitHub's 100 MB limit,
so LFS is not worth the setup cost here. `*.blend1` backups are ignored.
