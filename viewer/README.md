# WEVE — Classroom Viewer (front end)

Static front end for the Western Engineering Virtual Explorer classroom viewer. Plain HTML/CSS/ES modules, Three.js 0.160 from a CDN — no build step.

## Run it

It must be served over HTTP (it fetches `content.json` and the GLB):

```bash
cd weve-viewer
python -m http.server 5173     # or: npx vite
# open http://localhost:5173
```

## Files

| File | What it is |
|---|---|
| `index.html` | Entry screen, viewer HUD, panels, text-only tour |
| `styles.css` | All styling (Western purple `#4F2683` tokens, mobile layout, reduced motion) |
| `main.js` | Three.js scene, navigation, minimap, door transitions, analytics |
| `content.json` | **All editable content** — areas, bounds, doors, quick-jump spots, info points |
| `assets/classroom.glb` | *(you add this)* the classroom scan |
| `assets/info/*.jpg` | *(you add these)* info-panel images; missing images are hidden automatically |

## Adding the real scan

1. Export the scan as GLB (Draco compression is supported) to `assets/classroom.glb`.
2. Until it exists, the viewer shows a placeholder room built from `bounds`, and a toast says so.
3. Line the scan up with the coordinate system using `modelTransform` (position / rotationYDeg / scale) in `content.json`. Convention: metres, floor at y = 0, front wall toward −z.
4. Walk around and press **P** — it prints your `x`, `z` and `yawDeg` so you can update `bounds`, `jumpPoints`, `doors` and `infoPoints` to match the scan.
5. Optional: set `modelLowPerf` to a decimated GLB used in low-performance mode.

## Backlog coverage

| # | Item | Where |
|---|---|---|
| 1 | Entry screen, start button, area selector | `#entry`, `buildEntry()` |
| 2 | Three.js viewer loading the GLB | `setupRenderer()`, `ensureModel()` |
| 3 | Mouse / touch / keyboard navigation | `wirePointer()`, `wireTouchPad()`, `wireKeyboard()`, `move()` |
| 4 | Hallway space | `furnishHallway()` + `hallway` in `content.json` |
| 5 | Minimap with you-are-here | `drawMinimap()` |
| 6 | Quick-jump: door, front, seating | Explore panel, `jumpPoints` |
| 7 | Info points with text + image panel | `addMarkers()`, `openInfo()` |
| 8 | Loading indicator + low-perf mode | `#loading`, `applyPerf()`, auto FPS suggestion |
| 9 | Text description + keyboard-only use | `#text-tour`, skip link, ARIA live announcements |
| 10 | Western branding + program link | header brand, `site.programLink` |
| 11 | Non-personal analytics | `analytics` object — no IDs/cookies, honours Do Not Track; set `site.analyticsEndpoint` to POST events |
| 12 | Editable content file (stretch) | `content.json` |
| 13 | Door transition hallway ↔ classroom | `useDoor()`, `enterArea()` fade (instant with reduced motion) |

## Controls

W A S D / arrows to move · ←/→ turn · PgUp/PgDn look · Shift faster · drag to look · **E** door · **I** nearest info point · **M** explore menu · **Esc** close panels · **P** print position (dev)

## Known limits

- Collision is the room's bounding rectangle only — you can walk through desks.
- The brand mark is a plain "W" tile; swap in the official logo from Western's brand resources if the project is allowed to use it.