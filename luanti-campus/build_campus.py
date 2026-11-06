#!/usr/bin/env python3
"""Build the Luanti 'campus' mod from the ObjToSchematic block export.

Reads:  /home/nate/Downloads/block mesh.json   ([[x,y,z], "minecraft:name"], ...)
Writes: ~/.minetest/mods/campus/  (mod.conf, init.lua, blocks.lua, place.lua,
        textures/campus_<name>.png, data/campus.dat)

Textures are vanilla Minecraft 1.20.1 block textures from mcasset.cloud
(Mojang assets - fine for local/personal use, do not redistribute).
"""
import json
import os
import struct
import subprocess
import sys

SRC = "/home/nate/Downloads/block mesh.json"
MODDIR = os.path.expanduser("~/.minetest/mods/campus")
TEXDIR = os.path.join(MODDIR, "textures")
DATDIR = os.path.join(MODDIR, "data")
MC_VER = "1.20.2"
TEX_BASE = ("https://raw.githubusercontent.com/PrismarineJS/minecraft-assets"
            f"/master/data/{MC_VER}/blocks")

# Blocks whose representative (side) texture filename != <block>.png
TEX_OVERRIDE = {
    "snow_block": "snow",
    "bone_block": "bone_block_side",
    "melon": "melon_side",
    "dried_kelp_block": "dried_kelp_side",
    "mycelium": "mycelium_side",
    "furnace": "furnace_side",
    "jukebox": "jukebox_side",
    "observer": "observer_side",
    "sticky_piston": "piston_side",
    # Dispenser/dropper sides reuse the furnace side texture in vanilla
    "dropper": "furnace_side",
    # Not present in this asset snapshot; closest plain-face substitutes
    "smooth_quartz": "quartz_block_bottom",
    "smooth_sandstone": "sandstone_top",
}
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def texture_for(block):
    """Map a block name to its representative side-texture filename."""
    if block in TEX_OVERRIDE:
        return TEX_OVERRIDE[block]
    if block.endswith("_wood"):
        # Bark cubes show the log side texture on all faces
        return block[: -len("_wood")] + "_log"
    return block
LIGHT = {"glowstone": 14, "sea_lantern": 14}
# Mirror the build east-west. The source GLB is authored mirrored vs reality
# (named SEB content sits at +X/east in the model, but Spencer Engineering is
# west of the precinct; named TEB content sits at -X/west, but Thompson is
# east). Verified against Western Facilities Management GPS coordinates.
MIRROR_X = True
# Multi-frame vertical-strip textures from MC (block -> animation length in s)
ANIMATED = {"prismarine": 4.0, "sea_lantern": 2.0}
WOOD_KEYS = ("_planks", "_log", "_wood", "note_block", "jukebox")
DIRT_KEYS = ("dirt", "gravel", "clay", "soul_sand", "mycelium", "snow_block")


def groups_for(name):
    if any(k in name for k in WOOD_KEYS):
        return ("{choppy = 2, oddly_breakable_by_hand = 2, flammable = 2}",
                "default.node_sound_wood_defaults()")
    if any(k in name for k in DIRT_KEYS):
        return ("{crumbly = 3}", "default.node_sound_dirt_defaults()")
    if "_wool" in name or name in ("dried_kelp_block", "sponge", "wet_sponge"):
        return ("{snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3}",
                "default.node_sound_defaults()")
    if name == "obsidian":
        return ("{cracky = 1}", "default.node_sound_stone_defaults()")
    if name == "iron_block":
        return ("{cracky = 1, level = 2}", "default.node_sound_metal_defaults()")
    return ("{cracky = 3}", "default.node_sound_stone_defaults()")


def fail(msg):
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def download_textures(blocks):
    missing = []
    for b in blocks:
        url = f"{TEX_BASE}/{texture_for(b)}.png"
        dest = os.path.join(TEXDIR, f"campus_{b}.png")
        if os.path.exists(dest):
            try:
                with open(dest, "rb") as handle:
                    if handle.read(8) == PNG_MAGIC:
                        continue
            except OSError as err:
                print(f"  warn: cannot stat {dest}: {err}")
        if not url.startswith(f"{TEX_BASE}/"):
            missing.append((b, url, "refusing untrusted URL"))
            continue
        try:
            proc = subprocess.run(
                ["curl", "-fsSL", "--max-time", "30", "-A", "Mozilla/5.0",
                 "-o", dest, url],
                check=False, capture_output=True, timeout=60)
            if proc.returncode != 0:
                missing.append((b, url, proc.stderr.decode()[-200:]))
        except (OSError, subprocess.SubprocessError) as err:
            missing.append((b, url, str(err)))
    for b in blocks:
        path = os.path.join(TEXDIR, f"campus_{b}.png")
        try:
            with open(path, "rb") as handle:
                valid = handle.read(8) == b"\x89PNG\r\n\x1a\n"
        except OSError as err:
            print(f"  warn: cannot read {path}: {err}")
            valid = False
        if not valid:
            missing.append((b, path, "not a PNG"))
    if missing:
        print("TEXTURE FAILURES:")
        for item in missing:
            print(f"  {item}")
        raise SystemExit(1)
    print(f"textures ok: {len(blocks)}")


PLACE_LUA = r'''campus = {}

local MODPATH = minetest.get_modpath("campus")
local BLOCKS = dofile(MODPATH .. "/blocks.lua")

local cache = nil
local function load_data()
  if cache then return cache end
  local f = io.open(MODPATH .. "/data/campus.dat", "rb")
  assert(f, "campus.dat missing")
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
  local cids = {}
  for i, b in ipairs(BLOCKS) do cids[i] = minetest.get_content_id("campus:" .. b) end
  cache = {dx = dx, dy = dy, dz = dz, n = n, idx = idx, nid = nid, cids = cids}
  return cache
end

function campus.place(ax, ay, az, on_done)
  local d = load_data()
  local p1 = {x = ax, y = ay, z = az}
  local p2 = {x = ax + d.dx - 1, y = ay + d.dy - 1, z = az + d.dz - 1}
  local started = string.format(
    "Placing campus (%dx%dx%d, %d nodes)...", d.dx, d.dy, d.dz, d.n)
  minetest.log("action", "[campus] " .. started)
  minetest.emerge_area(p1, p2, function(_, _, remaining)
      if remaining and remaining > 0 then return end
      local STRIPS = 6
      local w = math.ceil(d.dx / STRIPS)
      for s = 0, STRIPS - 1 do
        local x0 = s * w
        local x1 = math.min((s + 1) * w - 1, d.dx - 1)
        local q1 = {x = ax + x0, y = ay, z = az}
        local q2 = {x = ax + x1, y = ay + d.dy - 1, z = az + d.dz - 1}
        local vm = minetest.get_voxel_manip()
        local e1, e2 = vm:read_from_map(q1, q2)
        local area = VoxelArea:new({MinEdge = e1, MaxEdge = e2})
        local data = vm:get_data()
        for i = 1, d.n do
          local flat = d.idx[i]
          local lx = flat % d.dx
          if lx >= x0 and lx <= x1 then
            local rest = (flat - lx) / d.dx
            local lz = rest % d.dz
            local ly = (rest - lz) / d.dz
            data[area:index(ax + lx, ay + ly, az + lz)] = d.cids[d.nid[i] + 1]
          end
        end
        vm:set_data(data)
        vm:write_to_map()
        vm:update_map()
      end
    minetest.log("action", "[campus] Campus placed.")
    if on_done then on_done() end
  end)
  return started
end

minetest.register_chatcommand("place_campus", {
  description = "Place the Engineering campus build with its min corner at your feet.",
  privs = {server = true},
  func = function(name)
    local player = minetest.get_player_by_name(name)
    if not player then return false, "No player." end
    local pos = player:get_pos()
    local ax = math.floor(pos.x + 0.5)
    local ay = math.floor(pos.y + 0.5)
    local az = math.floor(pos.z + 0.5)
    minetest.chat_send_player(name, campus.place(ax, ay, az, function()
      minetest.chat_send_player(name, "Campus placed.")
    end))
    return true
  end,
})

minetest.log("action", "[campus] mod loaded, autoplace=" ..
  tostring(minetest.settings:get_bool("campus_autoplace", false)))
if minetest.settings:get_bool("campus_autoplace", false) then
  local store = minetest.get_mod_storage()
  if store:get_string("autoplace_done") ~= "1" then
    local anchor = minetest.settings:get("campus_anchor") or "0,0,0"
    local parts = {}
    for part in anchor:gmatch("[^,]+") do
      parts[#parts + 1] = tonumber(part) or 0
    end
    minetest.after(2, function()
      campus.place(parts[1] or 0, parts[2] or 0, parts[3] or 0, function()
        store:set_string("autoplace_done", "1")
      end)
    end)
  end
end
'''


def main():
    data = []
    try:
        with open(SRC) as handle:
            data = json.load(handle)
    except (OSError, json.JSONDecodeError) as err:
        fail(f"Cannot read source JSON: {err}")
    if not data:
        fail("Source JSON is empty")
    print(f"blocks: {len(data)}")
    xs = [p[0][0] for p in data]
    ys = [p[0][1] for p in data]
    zs = [p[0][2] for p in data]
    minx = min(xs)
    miny = min(ys)
    minz = min(zs)
    dim_x = max(xs) - minx + 1
    dim_y = max(ys) - miny + 1
    dim_z = max(zs) - minz + 1
    print(f"span: {dim_x} x {dim_y} x {dim_z}")
    names = sorted({p[1] for p in data})
    if not all(n.startswith("minecraft:") for n in names):
        fail("Unexpected non-minecraft block names in JSON")
    blocks = [n.split(":", 1)[1] for n in names]
    print(f"distinct: {len(blocks)}")
    try:
        os.makedirs(TEXDIR, exist_ok=True)
        os.makedirs(DATDIR, exist_ok=True)
    except OSError as err:
        fail(f"Cannot create mod dirs: {err}")

    download_textures(blocks)

    node_id = {b: i for i, b in enumerate(blocks)}
    if len(blocks) >= 256:
        fail("Too many distinct blocks for u8 node ids")
    entries = []
    for coords, full in data:
        loc_x = coords[0] - minx
        if MIRROR_X:
            loc_x = dim_x - 1 - loc_x
        flat = ((coords[1] - miny) * dim_z + (coords[2] - minz)) * dim_x
        flat += loc_x
        entries.append((flat, node_id[full.split(":", 1)[1]]))
    try:
        with open(os.path.join(DATDIR, "campus.dat"), "wb") as handle:
            handle.write(struct.pack("<HHH", dim_x, dim_y, dim_z))
            handle.write(struct.pack("<I", len(entries)))
            for flat, nid in entries:
                handle.write(struct.pack("<IB", flat, nid))
    except OSError as err:
        fail(f"Cannot write campus.dat: {err}")
    size_mb = 0.0
    try:
        size_mb = os.path.getsize(os.path.join(DATDIR, "campus.dat")) / 1e6
    except OSError as err:
        fail(f"Cannot stat campus.dat: {err}")
    print(f"campus.dat: {size_mb:.1f} MB")

    try:
        with open(os.path.join(MODDIR, "blocks.lua"), "w") as handle:
            handle.write("return {\n")
            for b in blocks:
                handle.write(f'  "{b}",\n')
            handle.write("}\n")
    except OSError as err:
        fail(f"Cannot write blocks.lua: {err}")

    try:
        with open(os.path.join(MODDIR, "init.lua"), "w") as handle:
            handle.write('local BLOCKS = dofile(minetest.get_modpath("campus") '
                         '.. "/blocks.lua")\n\n')
            for b in blocks:
                desc = b.replace("_", " ").title()
                groups, sounds = groups_for(b)
                handle.write(f'minetest.register_node("campus:{b}", {{\n')
                handle.write(f'  description = "{desc}",\n')
                if b in ANIMATED:
                    handle.write(
                        '  tiles = {{name="campus_' + b + '.png", animation={type='
                        '"vertical_frames", aspect_w=16, aspect_h=16, '
                        'length=' + str(ANIMATED[b]) + '}}},\n')
                else:
                    handle.write(f'  tiles = {{"campus_{b}.png"}},\n')
                handle.write(f'  groups = {groups},\n')
                handle.write(f'  sounds = {sounds}')
                if b in LIGHT:
                    handle.write(f',\n  light_source = {LIGHT[b]}')
                handle.write('\n})\n')
            handle.write('\n-- Showcase world: make sure every joining player can fly '
                         'around the campus (survives world recreations).\n')
            handle.write('minetest.register_on_joinplayer(function(player)\n')
            handle.write('  local pname = player:get_player_name()\n')
            handle.write('  local privs = minetest.get_player_privs(pname)\n')
            handle.write('  local need = false\n')
            handle.write('  for _, p in ipairs({"fly", "fast", "noclip"}) do\n')
            handle.write('    if not privs[p] then privs[p] = true; need = true end\n')
            handle.write('  end\n')
            handle.write('  if need then\n')
            handle.write('    minetest.set_player_privs(pname, privs)\n')
            handle.write('  end\n')
            handle.write('end)\n')
            handle.write('\ndofile(minetest.get_modpath("campus") .. "/place.lua")\n')
    except OSError as err:
        fail(f"Cannot write init.lua: {err}")

    try:
        with open(os.path.join(MODDIR, "mod.conf"), "w") as handle:
            handle.write("name = campus\n")
            handle.write("description = Western Engineering campus voxel build\n")
            handle.write("depends = default\n")
    except OSError as err:
        fail(f"Cannot write mod.conf: {err}")

    try:
        with open(os.path.join(MODDIR, "place.lua"), "w") as handle:
            handle.write(PLACE_LUA)
    except OSError as err:
        fail(f"Cannot write place.lua: {err}")

    print(f"mod written to {MODDIR}")


if __name__ == "__main__":
    main()
