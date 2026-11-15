-- Restores the author's hand-off view on a visitor's first join: standing on the
-- roof at (120, 52, 465) looking north-east across the other buildings.
--
-- Uses set_look_horizontal / set_look_vertical: the older set_look_yaw and
-- set_look_pitch are documented as deprecated *because they are broken* (their
-- yaw carries a 90 degree offset), which is why an earlier version of this file
-- aimed the camera somewhere else entirely.
--
-- Applied once per player name so a returning visitor resumes where they left
-- off. A visitor can pick their own hand-off view with /view.
local SPAWN = vector.new(120, 52, 465)
local YAW = math.rad(230.5)
local PITCH = math.rad(-4.8)
local store = nil

local function db()
  if store == nil then
    store = minetest.get_mod_storage() or false
  end
  return store or nil
end

local function aim(player)
  player:set_pos(SPAWN)
  player:set_look_horizontal(YAW)
  player:set_look_vertical(PITCH)
end

minetest.register_on_joinplayer(function(player)
  local name = player:get_player_name()
  local d = db()
  if d and tostring(d:get_string(name)) == "placed" then
    return
  end
  -- Deferred: the engine sends its own spawn/look state after this callback,
  -- which would otherwise overwrite the aim we set here.
  minetest.after(0.5, function()
    local p = minetest.get_player_by_name(name)
    if not p then return end
    aim(p)
    if d then d:set_string(name, "placed") end
    minetest.log("action", "[eng_spawn] placed " .. name .. " at hand-off view")
  end)
end)

-- Capture the current view as the hand-off view for future visitors.
minetest.register_chatcommand("view", {
  description = "Store your current position and facing as the hand-off view",
  func = function(name)
    local player = minetest.get_player_by_name(name)
    if not player then return false, "no player" end
    local pos = vector.round(player:get_pos())
    local yaw, pitch = player:get_look_horizontal(), player:get_look_vertical()
    SPAWN, YAW, PITCH = pos, yaw, pitch
    local d = db()
    if d then
      d:set_string("spawn", minetest.serialize({x = pos.x, y = pos.y, z = pos.z,
                                                yaw = yaw, pitch = pitch}))
    end
    minetest.log("action", string.format(
      "[eng_spawn] hand-off view set to (%d,%d,%d) yaw %.1f pitch %.1f",
      pos.x, pos.y, pos.z, math.deg(yaw), math.deg(pitch)))
    return true, string.format("hand-off view set to (%d, %d, %d)", pos.x, pos.y, pos.z)
  end,
})

-- Honour a view saved by /view, so it survives a reload.
minetest.after(0, function()
  local d = db()
  if not d then return end
  local raw = d:get_string("spawn")
  if raw == "" then return end
  local v = minetest.deserialize(raw)
  if type(v) == "table" and v.x then
    SPAWN = vector.new(v.x, v.y, v.z)
    YAW, PITCH = v.yaw or YAW, v.pitch or PITCH
  end
end)
