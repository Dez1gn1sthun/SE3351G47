-- World-scoped time lock.
--
-- Only worlds that opt in via `load_mod_eng_time = true` in world.mt get this,
-- so other worlds keep their own day/night cycle. 0.35 is late morning: sun
-- still angled, medium shadows, bright sky.
--
-- time_speed is set in memory only (never written to minetest.conf), and the
-- time of day is re-asserted periodically so nothing can drift it.
local TARGET = 0.74

local function freeze()
  minetest.settings:set("time_speed", "0")
  minetest.set_timeofday(TARGET)
  minetest.log("action", "[eng_time] locked to timeofday=" .. TARGET ..
    " with time_speed=0")
end

minetest.register_on_mods_loaded(function()
  minetest.after(0.2, freeze)
end)

local acc = 0
minetest.register_globalstep(function(dtime)
  acc = acc + dtime
  if acc < 2.0 then return end
  acc = 0
  local now = minetest.get_timeofday()
  if now == nil or math.abs(now - TARGET) > 0.001 then
    minetest.set_timeofday(TARGET)
  end
end)
