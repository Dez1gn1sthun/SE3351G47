-- World-scoped fog softening.
--
-- Loaded only by worlds that opt in via `load_mod_eng_fog = true` in world.mt,
-- so it never leaks into other worlds and never touches the player's client
-- settings. fog_start is a fraction of the viewing range: fog begins at 70%
-- of the way out, leaving the mid-distance clear and only hazing the horizon.
local FOG_START = 0.70

local function apply(player)
  local sky = player:get_sky(true) or {}
  sky.fog = { fog_start = FOG_START }
  player:set_sky(sky)
end

minetest.register_on_joinplayer(function(player)
  apply(player)
  minetest.log("action", "[eng_fog] fog_start=" .. FOG_START ..
    " applied for " .. player:get_player_name())
end)

-- Re-apply if a mod or game later replaces the sky table wholesale.
minetest.register_on_player_receive_fields(function(player)
  apply(player)
end)
