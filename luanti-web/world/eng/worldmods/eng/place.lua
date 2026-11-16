eng = {}

local MODPATH = minetest.get_modpath("eng")
local BLOCKS = dofile(MODPATH .. "/blocks.lua")

local cache = nil
local function load_data()
  if cache then return cache end
  local f = io.open(MODPATH .. "/data/eng.dat", "rb")
  assert(f, "eng.dat missing")
  local head = f:read(10)
  local dx = string.byte(head, 1) + string.byte(head, 2) * 256
  local dy = string.byte(head, 3) + string.byte(head, 4) * 256
  local dz = string.byte(head, 5) + string.byte(head, 6) * 256
  local n = string.byte(head, 7) + string.byte(head, 8) * 256
    + string.byte(head, 9) * 65536 + string.byte(head, 10) * 16777216
  local idx, nid = {}, {}
  for i = 1, n do
    local e = f:read(6)
    local b1, b2, b3, b4, b5, b6 = string.byte(e, 1, 6)
    idx[i] = b1 + b2 * 256 + b3 * 65536 + b4 * 16777216
    nid[i] = b5 + b6 * 256
  end
  f:close()
  local cids = {}
  for i, b in ipairs(BLOCKS) do cids[i] = minetest.get_content_id("eng:" .. b) end
  cache = {dx = dx, dy = dy, dz = dz, n = n, idx = idx, nid = nid, cids = cids}
  return cache
end

function eng.place(ax, ay, az, on_done)
  local d = load_data()
  local p1 = {x = ax, y = ay, z = az}
  local p2 = {x = ax + d.dx - 1, y = ay + d.dy - 1, z = az + d.dz - 1}
  local started = string.format(
    "Placing eng (%dx%dx%d, %d nodes)...", d.dx, d.dy, d.dz, d.n)
  minetest.log("action", "[eng] " .. started)
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
    minetest.log("action", "[eng] Campus placed.")
    if on_done then on_done() end
  end)
  return started
end

minetest.register_chatcommand("place_eng", {
  description = "Place the Engineering eng build with its min corner at your feet.",
  privs = {server = true},
  func = function(name)
    local player = minetest.get_player_by_name(name)
    if not player then return false, "No player." end
    local pos = player:get_pos()
    local ax = math.floor(pos.x + 0.5)
    local ay = math.floor(pos.y + 0.5)
    local az = math.floor(pos.z + 0.5)
    minetest.chat_send_player(name, eng.place(ax, ay, az, function()
      minetest.chat_send_player(name, "Campus placed.")
    end))
    return true
  end,
})

minetest.log("action", "[eng] mod loaded, autoplace=" ..
  tostring(minetest.settings:get_bool("eng_autoplace", false)))
if minetest.settings:get_bool("eng_autoplace", false) then
  local store = minetest.get_mod_storage()
  if store:get_string("autoplace_done") ~= "1" then
    local anchor = minetest.settings:get("eng_anchor") or "0,0,0"
    local parts = {}
    for part in anchor:gmatch("[^,]+") do
      parts[#parts + 1] = tonumber(part) or 0
    end
    minetest.after(2, function()
      eng.place(parts[1] or 0, parts[2] or 0, parts[3] or 0, function()
        store:set_string("autoplace_done", "1")
      end)
    end)
  end
end
