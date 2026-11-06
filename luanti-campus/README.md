# Engineering Campus in Luanti

Converts the ObjToSchematic export (`/home/nate/Downloads/block mesh.json`,
892,954 blocks, 147 distinct Minecraft blocks, footprint 660 x 69 x 568)
into a Luanti mod that places the whole build with proper colours.

## How colours are preserved

Each of the 147 blocks is registered as a `campus:<name>` node textured with
the **actual vanilla Minecraft 1.20.1 16x16 texture** for that block
(PrismarineJS/minecraft-assets). Nothing is approximated: glazed terracotta,
dead coral, prismarine, ores, concrete etc. all look exactly like the OtS
preview. `prismarine` and `sea_lantern` are animated; `glowstone` and
`sea_lantern` emit light.

Mojang textures: fine for local/personal use, do not redistribute the mod.

## Files

- `build_campus.py` - regenerates everything (textures, `campus.dat`, Lua)
- Mod lives at `~/.minetest/mods/campus/`:
  - `init.lua` / `blocks.lua` - 147 node definitions
  - `place.lua` - `/place_campus` chat command (VoxelManip placement)
  - `textures/` - 147 Minecraft textures renamed to `campus_*`
  - `data/campus.dat` - compact placement data (4.5 MB)

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
| `campus` | `~/.minetest/worlds/campus` | **yes** - the `campus` mod | exact Minecraft textures |
| `campus_native` | `~/.minetest/worlds/campus_native` | **no** - stock Minetest Game only | approximate native palette |

`campus_native` is pre-baked: the build lives in `map.sqlite`, the temporary
placer mod was deleted, and its `world.mt` has no `load_mod_*` entries. It
opens in plain Minetest Game with nothing installed.

Regenerate it with `build_native.py` (writes a throwaway `campus_bake` mod,
bakes, then you delete the mod). Note the engine's map chunks are
**zstd**-compressed with a version byte at offset 0.

## Setup

A ready-made world already exists: **`campus`** (Minetest Game, singlenode
void, build placed at 0,0,0 spanning 660 x 69 x 568, spawn set above the
centre, damage off). Just launch Luanti and open it.

Spawn is set to (383, 71, 203), on the tallest roof, via `static_spawnpoint`
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
