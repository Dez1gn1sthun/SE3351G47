#!/usr/bin/env python3
"""Build a NATIVE Luanti (Minetest Game only) copy of the campus build.

Maps the 147 Minecraft block types from the ObjToSchematic export onto stock
Minetest Game nodes, then bakes the result into a world via a temporary
placer mod that is deleted afterwards. The finished world needs no mods.

Falling nodes (gravel/sand) are swapped for non-falling equivalents wherever
they would have nothing underneath, so the build cannot collapse on load.
"""
import json
import os
import struct
import sys

SRC = os.environ.get("CAMPUS_SRC", "/home/nate/Downloads/block mesh(1).json")
MODDIR = os.path.expanduser("~/.minetest/mods/campus_bake")
WORLD = os.path.expanduser("~/.minetest/worlds/campus_native")
DATDIR = os.path.join(MODDIR, "data")
MIRROR_X = True

# Minecraft block -> closest stock Minetest Game node (curated by colour family)
MAP = {
    "acacia_log": "default:tree",
    "acacia_wood": "default:tree",
    "andesite": "default:gravel",
    "birch_log": "default:aspen_wood",
    "birch_planks": "default:pine_wood",
    "birch_wood": "default:aspen_wood",
    "black_concrete": "default:obsidian",
    "black_concrete_powder": "default:obsidian",
    "black_glazed_terracotta": "default:brick",
    "black_terracotta": "default:tree",
    "black_wool": "wool:black",
    "blue_concrete": "wool:blue",
    "blue_glazed_terracotta": "wool:blue",
    "blue_terracotta": "wool:violet",
    "blue_wool": "wool:blue",
    "bone_block": "default:coral_skeleton",
    "bricks": "default:brick",
    "brown_concrete": "wool:brown",
    "brown_glazed_terracotta": "default:coral_brown",
    "brown_terracotta": "default:dirt",
    "brown_wool": "wool:brown",
    "chiseled_quartz_block": "default:coral_skeleton",
    "chiseled_sandstone": "default:sand",
    "chiseled_stone_bricks": "default:stonebrick",
    "clay": "default:clay",
    "coal_block": "default:obsidian",
    "coal_ore": "default:stone_with_coal",
    "coarse_dirt": "default:dirt",
    "cobblestone": "default:cobble",
    "crafting_table": "default:wood",
    "cracked_stone_bricks": "default:cobble",
    "cut_sandstone": "default:sand",
    "cyan_concrete": "wool:cyan",
    "cyan_glazed_terracotta": "wool:cyan",
    "cyan_terracotta": "default:stone",
    "dark_oak_log": "default:tree",
    "dark_oak_planks": "default:junglewood",
    "dark_oak_wood": "default:tree",
    "dark_prismarine": "default:mossycobble",
    "dead_brain_coral_block": "default:gravel",
    "dead_bubble_coral_block": "default:gravel",
    "dead_fire_coral_block": "default:gravel",
    "dead_horn_coral_block": "default:gravel",
    "dead_tube_coral_block": "default:gravel",
    "diamond_ore": "default:stone_with_diamond",
    "diorite": "default:clay",
    "dirt": "default:dirt",
    "dried_kelp_block": "default:mossycobble",
    "dropper": "default:cobble",
    "emerald_ore": "default:stone_with_mese",
    "end_stone": "default:sand",
    "end_stone_bricks": "default:sandstone",
    "furnace": "default:cobble",
    "glowstone": "default:meselamp",
    "gold_ore": "default:stone_with_gold",
    "granite": "default:desert_stone",
    "gravel": "default:gravel",
    "gray_concrete": "wool:dark_grey",
    "gray_concrete_powder": "default:stone",
    "gray_glazed_terracotta": "default:stone",
    "gray_terracotta": "default:tree",
    "gray_wool": "wool:dark_grey",
    "green_concrete": "wool:dark_green",
    "green_concrete_powder": "wool:dark_green",
    "green_glazed_terracotta": "wool:dark_green",
    "green_terracotta": "default:mossycobble",
    "green_wool": "wool:dark_green",
    "hay_block": "default:dry_dirt",
    "iron_block": "default:steelblock",
    "iron_ore": "default:stone_with_iron",
    "jukebox": "default:wood",
    "jungle_log": "default:tree",
    "jungle_planks": "default:wood",
    "jungle_wood": "default:junglewood",
    "lapis_block": "wool:blue",
    "lapis_ore": "default:stone_with_diamond",
    "light_blue_concrete": "wool:cyan",
    "light_blue_glazed_terracotta": "wool:cyan",
    "light_blue_terracotta": "wool:grey",
    "light_blue_wool": "wool:cyan",
    "light_gray_concrete": "default:gravel",
    "light_gray_concrete_powder": "default:gravel",
    "light_gray_glazed_terracotta": "default:silver_sand",
    "light_gray_terracotta": "default:coral_brown",
    "light_gray_wool": "wool:grey",
    "lime_glazed_terracotta": "wool:green",
    "lime_terracotta": "default:mossycobble",
    "magenta_terracotta": "wool:magenta",
    "melon": "default:coral_green",
    "mossy_cobblestone": "default:mossycobble",
    "mossy_stone_bricks": "default:mossycobble",
    "mycelium": "default:dirt",
    "nether_bricks": "default:junglewood",
    "nether_quartz_ore": "default:stone_with_gold",
    "netherrack": "default:brick",
    "nether_wart_block": "wool:red",
    "note_block": "default:wood",
    "oak_log": "default:wood",
    "oak_planks": "default:wood",
    "oak_wood": "default:wood",
    "observer": "default:cobble",
    "obsidian": "default:obsidian",
    "orange_glazed_terracotta": "default:dry_dirt",
    "orange_wool": "wool:orange",
    "packed_ice": "default:ice",
    "pink_concrete": "wool:pink",
    "pink_glazed_terracotta": "wool:pink",
    "pink_terracotta": "default:brick",
    "pink_wool": "wool:pink",
    "polished_andesite": "default:gravel",
    "polished_diorite": "default:clay",
    "polished_granite": "default:coral_brown",
    "prismarine": "default:coral_cyan",
    "prismarine_bricks": "default:coral_cyan",
    "purple_terracotta": "wool:magenta",
    "purpur_block": "wool:pink",
    "purpur_pillar": "wool:pink",
    "quartz_pillar": "default:coral_skeleton",
    "quartz_block": "default:coral_skeleton",
    "red_terracotta": "default:desert_stone",
    "redstone_lamp": "default:meselamp",
    "redstone_ore": "default:stone_with_gold",
    "sandstone": "default:sand",
    "sea_lantern": "default:meselamp",
    "smooth_quartz": "default:coral_skeleton",
    "smooth_sandstone": "default:sand",
    "smooth_stone": "default:clay",
    "snow_block": "default:snowblock",
    "soul_sand": "default:dirt",
    "sponge": "wool:yellow",
    "spruce_log": "default:tree",
    "spruce_planks": "default:wood",
    "spruce_wood": "default:tree",
    "sticky_piston": "default:cobble",
    "stone": "default:stone",
    "stone_bricks": "default:stonebrick",
    "stripped_birch_log": "default:pine_wood",
    "stripped_birch_wood": "default:pine_wood",
    "stripped_dark_oak_log": "default:tree",
    "stripped_dark_oak_wood": "default:tree",
    "stripped_jungle_wood": "default:wood",
    "stripped_jungle_log": "default:pine_wood",
    "stripped_oak_log": "default:pine_wood",
    "stripped_oak_wood": "default:pine_wood",
    "stripped_spruce_log": "default:wood",
    "stripped_spruce_wood": "default:wood",
    "wet_sponge": "default:mossycobble",
    "white_concrete": "wool:white",
    "white_concrete_powder": "wool:white",
    "white_glazed_terracotta": "default:silver_sand",
    "white_terracotta": "default:silver_sand",
    "white_wool": "wool:white",
    "yellow_glazed_terracotta": "wool:yellow",
    "yellow_terracotta": "default:dry_dirt",
}

# Nodes that obey gravity in Minetest Game -> safe stand-ins when unsupported
FALLING = {
    "default:gravel": "default:cobble",
    "default:sand": "default:sandstone",
    "default:silver_sand": "default:stone_block",
    "default:desert_sand": "default:desert_stone",
}

PLACE_LUA = r'''local MODPATH = minetest.get_modpath("campus_bake")
local NODES = dofile(MODPATH .. "/nodes.lua")

local function load_data()
  local f = io.open(MODPATH .. "/data/native.dat", "rb")
  assert(f, "native.dat missing")
  local head = f:read(10)
  local dx = string.byte(head, 1) + string.byte(head, 2) * 256
  local dy = string.byte(head, 3) + string.byte(head, 4) * 256
  local dz = string.byte(head, 5) + string.byte(head, 6) * 256
  local n = string.byte(head, 7) + string.byte(head, 8) * 256
    + string.byte(head, 9) * 65536 + string.byte(head, 10) * 16777216
  local idx, nid = {}, {}
  for i = 1, n do
    local e = f:read(5)
    local b1, b2, b3, b4, b5 = string.byte(e, 1, 5)
    idx[i] = b1 + b2 * 256 + b3 * 65536 + b4 * 16777216
    nid[i] = b5
  end
  f:close()
  return {dx = dx, dy = dy, dz = dz, n = n, idx = idx, nid = nid}
end

local function place(ax, ay, az)
  local d = load_data()
  -- Node names are resolved by the engine via set_node_at, which avoids the
  -- content-id lookup API (unreliable in this engine build).
  local names = {}
  for i, name in ipairs(NODES) do
    assert(minetest.registered_nodes[name], "node not registered: " .. name)
    names[i] = name
  end
  minetest.log("action", string.format("[campus_bake] placing %dx%dx%d (%d nodes)", d.dx, d.dy, d.dz, d.n))
  minetest.emerge_area({x = ax, y = ay, z = az},
    {x = ax + d.dx - 1, y = ay + d.dy - 1, z = az + d.dz - 1},
    function(_, _, remaining)
      if remaining and remaining > 0 then return end
      local STRIPS = 12
      local w = math.ceil(d.dx / STRIPS)
      local done = 0
      for s = 0, STRIPS - 1 do
        local x0 = s * w
        local x1 = math.min((s + 1) * w - 1, d.dx - 1)
        local vm = minetest.get_voxel_manip()
        vm:read_from_map({x = ax + x0, y = ay, z = az},
          {x = ax + x1, y = ay + d.dy - 1, z = az + d.dz - 1})
        for i = 1, d.n do
          local flat = d.idx[i]
          local lx = flat % d.dx
          if lx >= x0 and lx <= x1 then
            local rest = (flat - lx) / d.dx
            local lz = rest % d.dz
            local ly = (rest - lz) / d.dz
            vm:set_node_at({x = ax + lx, y = ay + ly, z = az + lz},
              {name = names[d.nid[i] + 1]})
            done = done + 1
          end
        end
        vm:write_to_map()
        vm:update_map()
      end
      local flag = io.open(minetest.get_worldpath() .. "/campus_bake_done.flag", "w")
      if flag then flag:write("1\n"); flag:close() end
      minetest.log("action", "[campus_bake] done, wrote " .. done .. " nodes")
    end)
end

minetest.register_on_mods_loaded(function()
  local done = io.open(minetest.get_worldpath() .. "/campus_bake_done.flag", "r")
  if done then
    done:close()
    minetest.log("action", "[campus_bake] already baked, skipping")
    return
  end
  minetest.after(2, function() place(0, 0, 0) end)
end)
'''


def fail(msg):
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def main():
    data = []
    try:
        with open(SRC) as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError) as err:
        fail(f"Cannot read source JSON: {err}")
    if not data:
        fail("Source JSON is empty")

    xs = [p[0][0] for p in data]
    ys = [p[0][1] for p in data]
    zs = [p[0][2] for p in data]
    minx, miny, minz = min(xs), min(ys), min(zs)
    dim_x = max(xs) - minx + 1
    dim_y = max(ys) - miny + 1
    dim_z = max(zs) - minz + 1
    print(f"blocks: {len(data)}  span: {dim_x} x {dim_y} x {dim_z}")

    missing = sorted({p[1].split(":", 1)[1] for p in data} - set(MAP))
    if missing:
        fail(f"unmapped minecraft blocks: {missing}")

    # local (mirrored) occupancy, needed to detect unsupported falling nodes
    occ = set()
    cells = []
    for (x, y, z), full in data:
        lx = x - minx
        if MIRROR_X:
            lx = dim_x - 1 - lx
        lz = z - minz
        ly = y - miny
        occ.add((lx, ly, lz))
        cells.append(((lx, ly, lz), full.split(":", 1)[1]))

    swapped = 0
    resolved = []
    for (lx, ly, lz), mc in cells:
        node = MAP[mc]
        if node in FALLING and (lx, ly - 1, lz) not in occ:
            node = FALLING[node]
            swapped += 1
        resolved.append(((lx, ly, lz), node))
    print(f"unsupported falling nodes swapped: {swapped}")

    nodes = sorted({node for _, node in resolved})
    print(f"distinct native nodes used: {len(nodes)}")
    if len(nodes) >= 256:
        fail("too many native nodes for u8 ids")
    node_id = {n: i for i, n in enumerate(nodes)}

    try:
        os.makedirs(DATDIR, exist_ok=True)
        with open(os.path.join(DATDIR, "native.dat"), "wb") as handle:
            handle.write(struct.pack("<HHH", dim_x, dim_y, dim_z))
            handle.write(struct.pack("<I", len(resolved)))
            for (lx, ly, lz), node in resolved:
                flat = (ly * dim_z + lz) * dim_x + lx
                handle.write(struct.pack("<IB", flat, node_id[node]))
        with open(os.path.join(MODDIR, "nodes.lua"), "w") as handle:
            handle.write("return {\n")
            for n in nodes:
                handle.write(f'  "{n}",\n')
            handle.write("}\n")
        with open(os.path.join(MODDIR, "mod.conf"), "w") as handle:
            handle.write("name = campus_bake\n")
            handle.write("description = temporary native-node bake placer\n")
            handle.write("depends = default, wool\n")
        with open(os.path.join(MODDIR, "init.lua"), "w") as handle:
            handle.write(PLACE_LUA)
    except OSError as err:
        fail(f"Cannot write bake mod: {err}")

    try:
        os.makedirs(WORLD, exist_ok=True)
        with open(os.path.join(WORLD, "world.mt"), "w") as handle:
            handle.write("gameid = minetest\n")
            handle.write("backend = sqlite3\n")
            handle.write("load_mod_campus_bake = true\n")
            handle.write("enable_damage = false\n")
    except OSError as err:
        fail(f"Cannot write world: {err}")

    counts = {}
    for _, node in resolved:
        counts[node] = counts.get(node, 0) + 1
    print("\ntop 12 native nodes by volume:")
    for node, c in sorted(counts.items(), key=lambda kv: -kv[1])[:12]:
        print(f"  {node:28s} {c:8d}")
    print(f"\nbake mod: {MODDIR}\nworld:    {WORLD}")


if __name__ == "__main__":
    main()
