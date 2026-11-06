# Engineering Campus in Luanti

Converts the ObjToSchematic export (`/home/nate/Downloads/block mesh.json`,
593,424 blocks, 143 distinct Minecraft blocks, footprint 550 x 55 x 474)
into a Luanti mod that places the whole build with proper colours.

## How colours are preserved

Each of the 143 blocks is registered as a `campus:<name>` node. Two texture
variants exist:

- **Committed variant (`mod/campus/`)**: 143 procedurally generated 16x16 flat
  swatches (`make_swatches.py`), each holding the average colour of the block
  it replaces. Contains no third-party image data, so it is safe to publish.
  `glowstone` and `sea_lantern` still emit light; the animated prismarine and
  sea lantern frames are dropped since swatches are static.
- **Submission variant (zip only)**: the same 143 nodes textured with the
  actual vanilla Minecraft block textures, cloned from PrismarineJS/
  minecraft-assets. `build_campus.py` regenerates those, but they are Mojang's
  property and are deliberately kept out of this repo.

Node names and registration order are identical between the two variants, so a
world baked against one loads correctly against the other.

## Files

- `build_campus.py` - rebuilds the mod (downloads MC textures, writes `campus.dat`)
- `build_native.py` - rebuilds the no-mods native world
- `make_swatches.py` - replaces MC textures with Mojang-free flat swatches
- `mod/campus/` - the committed mod (swatch textures)
  - `init.lua` / `blocks.lua` - 143 node definitions
  - `place.lua` - `/place_campus` chat command (VoxelManip placement)
  - `data/campus.dat` - compact placement data (4.5 MB)
  - `textures/` - 143 generated swatches (~82 KB total)

## Install the committed world

The ready-to-play native world is in `luanti-campus/world/campus_native/`.
Copy that folder into your Luanti worlds directory and open it with
Minetest Game (no mods required):

```bash
cp -r luanti-campus/world/campus_native ~/.minetest/worlds/
```

Player accounts (`players/`, `auth.txt`) are gitignored, so everyone who
clones gets their own fresh account. The build itself lives in `map.sqlite`.

## Two worlds

| World | Folder | Needs mods? | Colours |
|---|---|---|---|
| `campus` | `luanti-campus/world/campus` | the `mod/campus` mod | flat swatches, Mojang-free |
| `campus_native` | `luanti-campus/world/campus_native` | **none** - stock Minetest Game | stock-node approximation |

For the exact-texture version (vanilla Minecraft block textures), use the zip
prepared for submission; it is not committed here for licensing reasons.

`campus_native` is pre-baked: the build lives in `map.sqlite`, the temporary
placer mod was deleted, and its `world.mt` has no `load_mod_*` entries. It
opens in plain Minetest Game with nothing installed.

Regenerate it with `build_native.py` (writes a throwaway `campus_bake` mod,
bakes, then you delete the mod). Note the engine's map chunks are
**zstd**-compressed with a version byte at offset 0.

## Setup

A ready-made world already exists: **`campus`** (Minetest Game, singlenode
void, build placed at 0,0,0 spanning 550 x 55 x 474, spawn set above the
centre, damage off). Just launch Luanti and open it.

Spawn is set to (330, 56, 155), on the tallest roof, via `static_spawnpoint`
in both `world.mt` and `~/.minetest/minetest.conf` (the engine only honours
the latter). The mod auto-grants `fly`/`fast`/`noclip` on join. If you fall
into the void, just exit to the menu and rejoin to respawn.

To redo it manually in another world:

1. Create a **new world**: game = Minetest Game, mapgen = **Singlenode**
   (flat void - the build is 660x568, terrain would swallow it).
2. Select Mods -> enable **campus** -> Save.
3. Start the world. Grant yourself fast/fly (`/grantme fast, fly` if needed).
4. Fly to where you want the **min (north-west-bottom) corner**, look down,
   and run: `/place_campus`
5. Wait for "Campus placed." (~1-2 min for ~900k nodes).

Note: the mod only honours `campus_autoplace`/`campus_anchor` from
`minetest.conf`, not `world.mt` (engine limitation) - and only places once
per world (guarded by mod storage).

## Orientation note

The source GLB is authored mirrored east-west versus the real campus
(verified: nodes named `SEB_*` sit at +X/east in the model, but Spencer
Engineering is west of the precinct; `TEB_*` sits at -X/west, but Thompson
is east - checked against Western Facilities Management GPS coordinates).
`build_campus.py` therefore mirrors X when generating `campus.dat`
(`MIRROR_X = True`).

## Known limitations

- `block mesh.json` stores no blockstate data, so directional blocks get a
  default orientation: logs/pillars vertical, observers/pistons/droppers and
  glazed terracotta face one way (side texture on all faces). Fine for a
  campus viewed at scale.
- Concrete powder is mapped to solid nodes (no gravity in the placed build).
- The build extends +X/+Y/+Z from your feet; max height is y+68.
