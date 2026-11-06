local BLOCKS = dofile(minetest.get_modpath("campus") .. "/blocks.lua")

minetest.register_node("campus:acacia_log", {
  description = "Acacia Log",
  tiles = {"campus_acacia_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:acacia_wood", {
  description = "Acacia Wood",
  tiles = {"campus_acacia_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:andesite", {
  description = "Andesite",
  tiles = {"campus_andesite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:birch_log", {
  description = "Birch Log",
  tiles = {"campus_birch_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:birch_planks", {
  description = "Birch Planks",
  tiles = {"campus_birch_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:birch_wood", {
  description = "Birch Wood",
  tiles = {"campus_birch_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:black_concrete", {
  description = "Black Concrete",
  tiles = {"campus_black_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:black_concrete_powder", {
  description = "Black Concrete Powder",
  tiles = {"campus_black_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:black_glazed_terracotta", {
  description = "Black Glazed Terracotta",
  tiles = {"campus_black_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:black_terracotta", {
  description = "Black Terracotta",
  tiles = {"campus_black_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:black_wool", {
  description = "Black Wool",
  tiles = {"campus_black_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:blue_concrete", {
  description = "Blue Concrete",
  tiles = {"campus_blue_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:blue_glazed_terracotta", {
  description = "Blue Glazed Terracotta",
  tiles = {"campus_blue_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:blue_terracotta", {
  description = "Blue Terracotta",
  tiles = {"campus_blue_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:blue_wool", {
  description = "Blue Wool",
  tiles = {"campus_blue_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:bone_block", {
  description = "Bone Block",
  tiles = {"campus_bone_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:bricks", {
  description = "Bricks",
  tiles = {"campus_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:brown_concrete", {
  description = "Brown Concrete",
  tiles = {"campus_brown_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:brown_glazed_terracotta", {
  description = "Brown Glazed Terracotta",
  tiles = {"campus_brown_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:brown_terracotta", {
  description = "Brown Terracotta",
  tiles = {"campus_brown_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:brown_wool", {
  description = "Brown Wool",
  tiles = {"campus_brown_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:chiseled_quartz_block", {
  description = "Chiseled Quartz Block",
  tiles = {"campus_chiseled_quartz_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:chiseled_sandstone", {
  description = "Chiseled Sandstone",
  tiles = {"campus_chiseled_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:chiseled_stone_bricks", {
  description = "Chiseled Stone Bricks",
  tiles = {"campus_chiseled_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:clay", {
  description = "Clay",
  tiles = {"campus_clay.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("campus:coal_block", {
  description = "Coal Block",
  tiles = {"campus_coal_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:coal_ore", {
  description = "Coal Ore",
  tiles = {"campus_coal_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:coarse_dirt", {
  description = "Coarse Dirt",
  tiles = {"campus_coarse_dirt.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("campus:cobblestone", {
  description = "Cobblestone",
  tiles = {"campus_cobblestone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:cracked_stone_bricks", {
  description = "Cracked Stone Bricks",
  tiles = {"campus_cracked_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:cut_sandstone", {
  description = "Cut Sandstone",
  tiles = {"campus_cut_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:cyan_concrete", {
  description = "Cyan Concrete",
  tiles = {"campus_cyan_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:cyan_glazed_terracotta", {
  description = "Cyan Glazed Terracotta",
  tiles = {"campus_cyan_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:cyan_terracotta", {
  description = "Cyan Terracotta",
  tiles = {"campus_cyan_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:dark_oak_log", {
  description = "Dark Oak Log",
  tiles = {"campus_dark_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:dark_oak_planks", {
  description = "Dark Oak Planks",
  tiles = {"campus_dark_oak_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:dark_oak_wood", {
  description = "Dark Oak Wood",
  tiles = {"campus_dark_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:dark_prismarine", {
  description = "Dark Prismarine",
  tiles = {"campus_dark_prismarine.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:dead_brain_coral_block", {
  description = "Dead Brain Coral Block",
  tiles = {"campus_dead_brain_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:dead_bubble_coral_block", {
  description = "Dead Bubble Coral Block",
  tiles = {"campus_dead_bubble_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:dead_fire_coral_block", {
  description = "Dead Fire Coral Block",
  tiles = {"campus_dead_fire_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:dead_horn_coral_block", {
  description = "Dead Horn Coral Block",
  tiles = {"campus_dead_horn_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:dead_tube_coral_block", {
  description = "Dead Tube Coral Block",
  tiles = {"campus_dead_tube_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:diamond_ore", {
  description = "Diamond Ore",
  tiles = {"campus_diamond_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:diorite", {
  description = "Diorite",
  tiles = {"campus_diorite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:dirt", {
  description = "Dirt",
  tiles = {"campus_dirt.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("campus:dried_kelp_block", {
  description = "Dried Kelp Block",
  tiles = {"campus_dried_kelp_block.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:dropper", {
  description = "Dropper",
  tiles = {"campus_dropper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:emerald_ore", {
  description = "Emerald Ore",
  tiles = {"campus_emerald_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:end_stone", {
  description = "End Stone",
  tiles = {"campus_end_stone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:end_stone_bricks", {
  description = "End Stone Bricks",
  tiles = {"campus_end_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:furnace", {
  description = "Furnace",
  tiles = {"campus_furnace.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:glowstone", {
  description = "Glowstone",
  tiles = {"campus_glowstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults(),
  light_source = 14
})
minetest.register_node("campus:gold_ore", {
  description = "Gold Ore",
  tiles = {"campus_gold_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:granite", {
  description = "Granite",
  tiles = {"campus_granite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:gravel", {
  description = "Gravel",
  tiles = {"campus_gravel.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("campus:gray_concrete", {
  description = "Gray Concrete",
  tiles = {"campus_gray_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:gray_concrete_powder", {
  description = "Gray Concrete Powder",
  tiles = {"campus_gray_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:gray_glazed_terracotta", {
  description = "Gray Glazed Terracotta",
  tiles = {"campus_gray_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:gray_terracotta", {
  description = "Gray Terracotta",
  tiles = {"campus_gray_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:gray_wool", {
  description = "Gray Wool",
  tiles = {"campus_gray_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:green_concrete", {
  description = "Green Concrete",
  tiles = {"campus_green_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:green_concrete_powder", {
  description = "Green Concrete Powder",
  tiles = {"campus_green_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:green_glazed_terracotta", {
  description = "Green Glazed Terracotta",
  tiles = {"campus_green_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:green_terracotta", {
  description = "Green Terracotta",
  tiles = {"campus_green_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:green_wool", {
  description = "Green Wool",
  tiles = {"campus_green_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:iron_block", {
  description = "Iron Block",
  tiles = {"campus_iron_block.png"},
  groups = {cracky = 1, level = 2},
  sounds = default.node_sound_metal_defaults()
})
minetest.register_node("campus:iron_ore", {
  description = "Iron Ore",
  tiles = {"campus_iron_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:jukebox", {
  description = "Jukebox",
  tiles = {"campus_jukebox.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:jungle_log", {
  description = "Jungle Log",
  tiles = {"campus_jungle_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:jungle_planks", {
  description = "Jungle Planks",
  tiles = {"campus_jungle_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:jungle_wood", {
  description = "Jungle Wood",
  tiles = {"campus_jungle_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:lapis_block", {
  description = "Lapis Block",
  tiles = {"campus_lapis_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:lapis_ore", {
  description = "Lapis Ore",
  tiles = {"campus_lapis_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_blue_concrete", {
  description = "Light Blue Concrete",
  tiles = {"campus_light_blue_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_blue_glazed_terracotta", {
  description = "Light Blue Glazed Terracotta",
  tiles = {"campus_light_blue_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_blue_terracotta", {
  description = "Light Blue Terracotta",
  tiles = {"campus_light_blue_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_blue_wool", {
  description = "Light Blue Wool",
  tiles = {"campus_light_blue_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:light_gray_concrete", {
  description = "Light Gray Concrete",
  tiles = {"campus_light_gray_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_gray_concrete_powder", {
  description = "Light Gray Concrete Powder",
  tiles = {"campus_light_gray_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_gray_glazed_terracotta", {
  description = "Light Gray Glazed Terracotta",
  tiles = {"campus_light_gray_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_gray_terracotta", {
  description = "Light Gray Terracotta",
  tiles = {"campus_light_gray_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:light_gray_wool", {
  description = "Light Gray Wool",
  tiles = {"campus_light_gray_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:lime_terracotta", {
  description = "Lime Terracotta",
  tiles = {"campus_lime_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:magenta_terracotta", {
  description = "Magenta Terracotta",
  tiles = {"campus_magenta_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:melon", {
  description = "Melon",
  tiles = {"campus_melon.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:mossy_cobblestone", {
  description = "Mossy Cobblestone",
  tiles = {"campus_mossy_cobblestone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:mossy_stone_bricks", {
  description = "Mossy Stone Bricks",
  tiles = {"campus_mossy_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:mycelium", {
  description = "Mycelium",
  tiles = {"campus_mycelium.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("campus:nether_bricks", {
  description = "Nether Bricks",
  tiles = {"campus_nether_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:nether_quartz_ore", {
  description = "Nether Quartz Ore",
  tiles = {"campus_nether_quartz_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:netherrack", {
  description = "Netherrack",
  tiles = {"campus_netherrack.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:note_block", {
  description = "Note Block",
  tiles = {"campus_note_block.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:oak_log", {
  description = "Oak Log",
  tiles = {"campus_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:oak_planks", {
  description = "Oak Planks",
  tiles = {"campus_oak_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:oak_wood", {
  description = "Oak Wood",
  tiles = {"campus_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:observer", {
  description = "Observer",
  tiles = {"campus_observer.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:obsidian", {
  description = "Obsidian",
  tiles = {"campus_obsidian.png"},
  groups = {cracky = 1},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:orange_glazed_terracotta", {
  description = "Orange Glazed Terracotta",
  tiles = {"campus_orange_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:packed_ice", {
  description = "Packed Ice",
  tiles = {"campus_packed_ice.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:pink_concrete", {
  description = "Pink Concrete",
  tiles = {"campus_pink_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:pink_glazed_terracotta", {
  description = "Pink Glazed Terracotta",
  tiles = {"campus_pink_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:pink_terracotta", {
  description = "Pink Terracotta",
  tiles = {"campus_pink_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:pink_wool", {
  description = "Pink Wool",
  tiles = {"campus_pink_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:polished_andesite", {
  description = "Polished Andesite",
  tiles = {"campus_polished_andesite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:polished_diorite", {
  description = "Polished Diorite",
  tiles = {"campus_polished_diorite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:polished_granite", {
  description = "Polished Granite",
  tiles = {"campus_polished_granite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:prismarine", {
  description = "Prismarine",
  tiles = {{name="campus_prismarine.png", animation={type="vertical_frames", aspect_w=16, aspect_h=16, length=4.0}}},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:prismarine_bricks", {
  description = "Prismarine Bricks",
  tiles = {"campus_prismarine_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:purple_terracotta", {
  description = "Purple Terracotta",
  tiles = {"campus_purple_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:purpur_block", {
  description = "Purpur Block",
  tiles = {"campus_purpur_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:purpur_pillar", {
  description = "Purpur Pillar",
  tiles = {"campus_purpur_pillar.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:quartz_pillar", {
  description = "Quartz Pillar",
  tiles = {"campus_quartz_pillar.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:red_terracotta", {
  description = "Red Terracotta",
  tiles = {"campus_red_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:redstone_lamp", {
  description = "Redstone Lamp",
  tiles = {"campus_redstone_lamp.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:redstone_ore", {
  description = "Redstone Ore",
  tiles = {"campus_redstone_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:sandstone", {
  description = "Sandstone",
  tiles = {"campus_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:sea_lantern", {
  description = "Sea Lantern",
  tiles = {{name="campus_sea_lantern.png", animation={type="vertical_frames", aspect_w=16, aspect_h=16, length=2.0}}},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults(),
  light_source = 14
})
minetest.register_node("campus:smooth_quartz", {
  description = "Smooth Quartz",
  tiles = {"campus_smooth_quartz.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:smooth_sandstone", {
  description = "Smooth Sandstone",
  tiles = {"campus_smooth_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:smooth_stone", {
  description = "Smooth Stone",
  tiles = {"campus_smooth_stone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:snow_block", {
  description = "Snow Block",
  tiles = {"campus_snow_block.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("campus:soul_sand", {
  description = "Soul Sand",
  tiles = {"campus_soul_sand.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("campus:sponge", {
  description = "Sponge",
  tiles = {"campus_sponge.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:spruce_log", {
  description = "Spruce Log",
  tiles = {"campus_spruce_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:spruce_planks", {
  description = "Spruce Planks",
  tiles = {"campus_spruce_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:spruce_wood", {
  description = "Spruce Wood",
  tiles = {"campus_spruce_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:sticky_piston", {
  description = "Sticky Piston",
  tiles = {"campus_sticky_piston.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:stone", {
  description = "Stone",
  tiles = {"campus_stone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:stone_bricks", {
  description = "Stone Bricks",
  tiles = {"campus_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:stripped_birch_log", {
  description = "Stripped Birch Log",
  tiles = {"campus_stripped_birch_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_birch_wood", {
  description = "Stripped Birch Wood",
  tiles = {"campus_stripped_birch_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_dark_oak_log", {
  description = "Stripped Dark Oak Log",
  tiles = {"campus_stripped_dark_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_dark_oak_wood", {
  description = "Stripped Dark Oak Wood",
  tiles = {"campus_stripped_dark_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_jungle_wood", {
  description = "Stripped Jungle Wood",
  tiles = {"campus_stripped_jungle_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_oak_log", {
  description = "Stripped Oak Log",
  tiles = {"campus_stripped_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_oak_wood", {
  description = "Stripped Oak Wood",
  tiles = {"campus_stripped_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_spruce_log", {
  description = "Stripped Spruce Log",
  tiles = {"campus_stripped_spruce_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:stripped_spruce_wood", {
  description = "Stripped Spruce Wood",
  tiles = {"campus_stripped_spruce_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("campus:wet_sponge", {
  description = "Wet Sponge",
  tiles = {"campus_wet_sponge.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:white_concrete", {
  description = "White Concrete",
  tiles = {"campus_white_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:white_concrete_powder", {
  description = "White Concrete Powder",
  tiles = {"campus_white_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:white_glazed_terracotta", {
  description = "White Glazed Terracotta",
  tiles = {"campus_white_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:white_terracotta", {
  description = "White Terracotta",
  tiles = {"campus_white_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:white_wool", {
  description = "White Wool",
  tiles = {"campus_white_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("campus:yellow_glazed_terracotta", {
  description = "Yellow Glazed Terracotta",
  tiles = {"campus_yellow_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("campus:yellow_terracotta", {
  description = "Yellow Terracotta",
  tiles = {"campus_yellow_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})

-- Showcase world: make sure every joining player can fly around the campus (survives world recreations).
minetest.register_on_joinplayer(function(player)
  local pname = player:get_player_name()
  local privs = minetest.get_player_privs(pname)
  local need = false
  for _, p in ipairs({"fly", "fast", "noclip"}) do
    if not privs[p] then privs[p] = true; need = true end
  end
  if need then
    minetest.set_player_privs(pname, privs)
  end
end)

dofile(minetest.get_modpath("campus") .. "/place.lua")
