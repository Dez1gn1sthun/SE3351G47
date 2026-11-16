local BLOCKS = dofile(minetest.get_modpath("eng") .. "/blocks.lua")

minetest.register_node("eng:acacia_log", {
  description = "Acacia Log",
  tiles = {"eng_acacia_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:acacia_wood", {
  description = "Acacia Wood",
  tiles = {"eng_acacia_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:ancient_debris", {
  description = "Ancient Debris",
  tiles = {"eng_ancient_debris.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:andesite", {
  description = "Andesite",
  tiles = {"eng_andesite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:bamboo_block", {
  description = "Bamboo Block",
  tiles = {"eng_bamboo_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:bamboo_mosaic", {
  description = "Bamboo Mosaic",
  tiles = {"eng_bamboo_mosaic.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:bamboo_planks", {
  description = "Bamboo Planks",
  tiles = {"eng_bamboo_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:barrel", {
  description = "Barrel",
  tiles = {"eng_barrel.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:basalt", {
  description = "Basalt",
  tiles = {"eng_basalt.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:bee_nest", {
  description = "Bee Nest",
  tiles = {"eng_bee_nest.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:beehive", {
  description = "Beehive",
  tiles = {"eng_beehive.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:birch_log", {
  description = "Birch Log",
  tiles = {"eng_birch_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:birch_planks", {
  description = "Birch Planks",
  tiles = {"eng_birch_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:birch_wood", {
  description = "Birch Wood",
  tiles = {"eng_birch_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:black_concrete", {
  description = "Black Concrete",
  tiles = {"eng_black_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:black_concrete_powder", {
  description = "Black Concrete Powder",
  tiles = {"eng_black_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:black_glazed_terracotta", {
  description = "Black Glazed Terracotta",
  tiles = {"eng_black_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:black_terracotta", {
  description = "Black Terracotta",
  tiles = {"eng_black_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:black_wool", {
  description = "Black Wool",
  tiles = {"eng_black_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:blackstone", {
  description = "Blackstone",
  tiles = {"eng_blackstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:blast_furnace", {
  description = "Blast Furnace",
  tiles = {"eng_blast_furnace.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:blue_concrete", {
  description = "Blue Concrete",
  tiles = {"eng_blue_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:blue_glazed_terracotta", {
  description = "Blue Glazed Terracotta",
  tiles = {"eng_blue_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:blue_terracotta", {
  description = "Blue Terracotta",
  tiles = {"eng_blue_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:bone_block", {
  description = "Bone Block",
  tiles = {"eng_bone_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:bookshelf", {
  description = "Bookshelf",
  tiles = {"eng_bookshelf.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:bricks", {
  description = "Bricks",
  tiles = {"eng_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:brown_concrete", {
  description = "Brown Concrete",
  tiles = {"eng_brown_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:brown_glazed_terracotta", {
  description = "Brown Glazed Terracotta",
  tiles = {"eng_brown_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:brown_terracotta", {
  description = "Brown Terracotta",
  tiles = {"eng_brown_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:brown_wool", {
  description = "Brown Wool",
  tiles = {"eng_brown_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:calcite", {
  description = "Calcite",
  tiles = {"eng_calcite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cartography_table", {
  description = "Cartography Table",
  tiles = {"eng_cartography_table.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cherry_log", {
  description = "Cherry Log",
  tiles = {"eng_cherry_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:cherry_planks", {
  description = "Cherry Planks",
  tiles = {"eng_cherry_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:cherry_wood", {
  description = "Cherry Wood",
  tiles = {"eng_cherry_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:chiseled_cinnabar", {
  description = "Chiseled Cinnabar",
  tiles = {"eng_chiseled_cinnabar.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_deepslate", {
  description = "Chiseled Deepslate",
  tiles = {"eng_chiseled_deepslate.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_nether_bricks", {
  description = "Chiseled Nether Bricks",
  tiles = {"eng_chiseled_nether_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_polished_blackstone", {
  description = "Chiseled Polished Blackstone",
  tiles = {"eng_chiseled_polished_blackstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_quartz_block", {
  description = "Chiseled Quartz Block",
  tiles = {"eng_chiseled_quartz_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_sandstone", {
  description = "Chiseled Sandstone",
  tiles = {"eng_chiseled_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_stone_bricks", {
  description = "Chiseled Stone Bricks",
  tiles = {"eng_chiseled_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_sulfur", {
  description = "Chiseled Sulfur",
  tiles = {"eng_chiseled_sulfur.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_tuff", {
  description = "Chiseled Tuff",
  tiles = {"eng_chiseled_tuff.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:chiseled_tuff_bricks", {
  description = "Chiseled Tuff Bricks",
  tiles = {"eng_chiseled_tuff_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cinnabar", {
  description = "Cinnabar",
  tiles = {"eng_cinnabar.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:clay", {
  description = "Clay",
  tiles = {"eng_clay.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:coal_block", {
  description = "Coal Block",
  tiles = {"eng_coal_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:coal_ore", {
  description = "Coal Ore",
  tiles = {"eng_coal_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:coarse_dirt", {
  description = "Coarse Dirt",
  tiles = {"eng_coarse_dirt.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:cobbled_deepslate", {
  description = "Cobbled Deepslate",
  tiles = {"eng_cobbled_deepslate.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cobblestone", {
  description = "Cobblestone",
  tiles = {"eng_cobblestone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cracked_deepslate_bricks", {
  description = "Cracked Deepslate Bricks",
  tiles = {"eng_cracked_deepslate_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cracked_deepslate_tiles", {
  description = "Cracked Deepslate Tiles",
  tiles = {"eng_cracked_deepslate_tiles.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cracked_nether_bricks", {
  description = "Cracked Nether Bricks",
  tiles = {"eng_cracked_nether_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cracked_polished_blackstone_bricks", {
  description = "Cracked Polished Blackstone Bricks",
  tiles = {"eng_cracked_polished_blackstone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cracked_stone_bricks", {
  description = "Cracked Stone Bricks",
  tiles = {"eng_cracked_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:crafter", {
  description = "Crafter",
  tiles = {"eng_crafter.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:crafting_table", {
  description = "Crafting Table",
  tiles = {"eng_crafting_table.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:creaking_heart", {
  description = "Creaking Heart",
  tiles = {"eng_creaking_heart.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:crimson_hyphae", {
  description = "Crimson Hyphae",
  tiles = {"eng_crimson_hyphae.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:crimson_planks", {
  description = "Crimson Planks",
  tiles = {"eng_crimson_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:crimson_stem", {
  description = "Crimson Stem",
  tiles = {"eng_crimson_stem.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:crying_obsidian", {
  description = "Crying Obsidian",
  tiles = {"eng_crying_obsidian.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cut_sandstone", {
  description = "Cut Sandstone",
  tiles = {"eng_cut_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cyan_concrete", {
  description = "Cyan Concrete",
  tiles = {"eng_cyan_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cyan_concrete_powder", {
  description = "Cyan Concrete Powder",
  tiles = {"eng_cyan_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cyan_glazed_terracotta", {
  description = "Cyan Glazed Terracotta",
  tiles = {"eng_cyan_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cyan_terracotta", {
  description = "Cyan Terracotta",
  tiles = {"eng_cyan_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:cyan_wool", {
  description = "Cyan Wool",
  tiles = {"eng_cyan_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:dark_oak_log", {
  description = "Dark Oak Log",
  tiles = {"eng_dark_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:dark_oak_planks", {
  description = "Dark Oak Planks",
  tiles = {"eng_dark_oak_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:dark_oak_wood", {
  description = "Dark Oak Wood",
  tiles = {"eng_dark_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:dark_prismarine", {
  description = "Dark Prismarine",
  tiles = {"eng_dark_prismarine.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dead_brain_coral_block", {
  description = "Dead Brain Coral Block",
  tiles = {"eng_dead_brain_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dead_bubble_coral_block", {
  description = "Dead Bubble Coral Block",
  tiles = {"eng_dead_bubble_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dead_fire_coral_block", {
  description = "Dead Fire Coral Block",
  tiles = {"eng_dead_fire_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dead_horn_coral_block", {
  description = "Dead Horn Coral Block",
  tiles = {"eng_dead_horn_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dead_tube_coral_block", {
  description = "Dead Tube Coral Block",
  tiles = {"eng_dead_tube_coral_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate", {
  description = "Deepslate",
  tiles = {"eng_deepslate.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_bricks", {
  description = "Deepslate Bricks",
  tiles = {"eng_deepslate_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_coal_ore", {
  description = "Deepslate Coal Ore",
  tiles = {"eng_deepslate_coal_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_copper_ore", {
  description = "Deepslate Copper Ore",
  tiles = {"eng_deepslate_copper_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_diamond_ore", {
  description = "Deepslate Diamond Ore",
  tiles = {"eng_deepslate_diamond_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_emerald_ore", {
  description = "Deepslate Emerald Ore",
  tiles = {"eng_deepslate_emerald_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_gold_ore", {
  description = "Deepslate Gold Ore",
  tiles = {"eng_deepslate_gold_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_iron_ore", {
  description = "Deepslate Iron Ore",
  tiles = {"eng_deepslate_iron_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_lapis_ore", {
  description = "Deepslate Lapis Ore",
  tiles = {"eng_deepslate_lapis_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_redstone_ore", {
  description = "Deepslate Redstone Ore",
  tiles = {"eng_deepslate_redstone_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:deepslate_tiles", {
  description = "Deepslate Tiles",
  tiles = {"eng_deepslate_tiles.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:diamond_block", {
  description = "Diamond Block",
  tiles = {"eng_diamond_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:diamond_ore", {
  description = "Diamond Ore",
  tiles = {"eng_diamond_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:diorite", {
  description = "Diorite",
  tiles = {"eng_diorite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dirt", {
  description = "Dirt",
  tiles = {"eng_dirt.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:dispenser", {
  description = "Dispenser",
  tiles = {"eng_dispenser.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dried_kelp_block", {
  description = "Dried Kelp Block",
  tiles = {"eng_dried_kelp_block.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:dripstone_block", {
  description = "Dripstone Block",
  tiles = {"eng_dripstone_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:dropper", {
  description = "Dropper",
  tiles = {"eng_dropper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:emerald_ore", {
  description = "Emerald Ore",
  tiles = {"eng_emerald_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:end_stone_bricks", {
  description = "End Stone Bricks",
  tiles = {"eng_end_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:fletching_table", {
  description = "Fletching Table",
  tiles = {"eng_fletching_table.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:furnace", {
  description = "Furnace",
  tiles = {"eng_furnace.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:gilded_blackstone", {
  description = "Gilded Blackstone",
  tiles = {"eng_gilded_blackstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:glowstone", {
  description = "Glowstone",
  tiles = {"eng_glowstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults(),
  light_source = 14
})
minetest.register_node("eng:gold_ore", {
  description = "Gold Ore",
  tiles = {"eng_gold_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:granite", {
  description = "Granite",
  tiles = {"eng_granite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:gravel", {
  description = "Gravel",
  tiles = {"eng_gravel.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:gray_concrete", {
  description = "Gray Concrete",
  tiles = {"eng_gray_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:gray_concrete_powder", {
  description = "Gray Concrete Powder",
  tiles = {"eng_gray_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:gray_glazed_terracotta", {
  description = "Gray Glazed Terracotta",
  tiles = {"eng_gray_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:gray_terracotta", {
  description = "Gray Terracotta",
  tiles = {"eng_gray_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:gray_wool", {
  description = "Gray Wool",
  tiles = {"eng_gray_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:green_concrete", {
  description = "Green Concrete",
  tiles = {"eng_green_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:green_concrete_powder", {
  description = "Green Concrete Powder",
  tiles = {"eng_green_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:green_glazed_terracotta", {
  description = "Green Glazed Terracotta",
  tiles = {"eng_green_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:green_terracotta", {
  description = "Green Terracotta",
  tiles = {"eng_green_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:hay_block", {
  description = "Hay Block",
  tiles = {"eng_hay_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:ice", {
  description = "Ice",
  tiles = {"eng_ice.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:iron_block", {
  description = "Iron Block",
  tiles = {"eng_iron_block.png"},
  groups = {cracky = 1, level = 2},
  sounds = default.node_sound_metal_defaults()
})
minetest.register_node("eng:iron_ore", {
  description = "Iron Ore",
  tiles = {"eng_iron_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:jungle_log", {
  description = "Jungle Log",
  tiles = {"eng_jungle_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:jungle_planks", {
  description = "Jungle Planks",
  tiles = {"eng_jungle_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:jungle_wood", {
  description = "Jungle Wood",
  tiles = {"eng_jungle_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:lapis_block", {
  description = "Lapis Block",
  tiles = {"eng_lapis_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:lapis_ore", {
  description = "Lapis Ore",
  tiles = {"eng_lapis_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_blue_concrete", {
  description = "Light Blue Concrete",
  tiles = {"eng_light_blue_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_blue_concrete_powder", {
  description = "Light Blue Concrete Powder",
  tiles = {"eng_light_blue_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_blue_glazed_terracotta", {
  description = "Light Blue Glazed Terracotta",
  tiles = {"eng_light_blue_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_blue_terracotta", {
  description = "Light Blue Terracotta",
  tiles = {"eng_light_blue_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_blue_wool", {
  description = "Light Blue Wool",
  tiles = {"eng_light_blue_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:light_gray_concrete", {
  description = "Light Gray Concrete",
  tiles = {"eng_light_gray_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_gray_concrete_powder", {
  description = "Light Gray Concrete Powder",
  tiles = {"eng_light_gray_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_gray_glazed_terracotta", {
  description = "Light Gray Glazed Terracotta",
  tiles = {"eng_light_gray_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_gray_terracotta", {
  description = "Light Gray Terracotta",
  tiles = {"eng_light_gray_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:light_gray_wool", {
  description = "Light Gray Wool",
  tiles = {"eng_light_gray_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:lime_terracotta", {
  description = "Lime Terracotta",
  tiles = {"eng_lime_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:lodestone", {
  description = "Lodestone",
  tiles = {"eng_lodestone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:loom", {
  description = "Loom",
  tiles = {"eng_loom.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:magenta_terracotta", {
  description = "Magenta Terracotta",
  tiles = {"eng_magenta_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:mangrove_log", {
  description = "Mangrove Log",
  tiles = {"eng_mangrove_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:mangrove_planks", {
  description = "Mangrove Planks",
  tiles = {"eng_mangrove_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:mangrove_wood", {
  description = "Mangrove Wood",
  tiles = {"eng_mangrove_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:moss_block", {
  description = "Moss Block",
  tiles = {"eng_moss_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:mossy_cobblestone", {
  description = "Mossy Cobblestone",
  tiles = {"eng_mossy_cobblestone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:mossy_stone_bricks", {
  description = "Mossy Stone Bricks",
  tiles = {"eng_mossy_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:mud", {
  description = "Mud",
  tiles = {"eng_mud.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:mud_bricks", {
  description = "Mud Bricks",
  tiles = {"eng_mud_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:muddy_mangrove_roots", {
  description = "Muddy Mangrove Roots",
  tiles = {"eng_muddy_mangrove_roots.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:mycelium", {
  description = "Mycelium",
  tiles = {"eng_mycelium.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:nether_bricks", {
  description = "Nether Bricks",
  tiles = {"eng_nether_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:nether_quartz_ore", {
  description = "Nether Quartz Ore",
  tiles = {"eng_nether_quartz_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:netherite_block", {
  description = "Netherite Block",
  tiles = {"eng_netherite_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:netherrack", {
  description = "Netherrack",
  tiles = {"eng_netherrack.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:note_block", {
  description = "Note Block",
  tiles = {"eng_note_block.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:oak_log", {
  description = "Oak Log",
  tiles = {"eng_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:oak_planks", {
  description = "Oak Planks",
  tiles = {"eng_oak_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:oak_wood", {
  description = "Oak Wood",
  tiles = {"eng_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:observer", {
  description = "Observer",
  tiles = {"eng_observer.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:obsidian", {
  description = "Obsidian",
  tiles = {"eng_obsidian.png"},
  groups = {cracky = 1},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:ochre_froglight", {
  description = "Ochre Froglight",
  tiles = {"eng_ochre_froglight.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:orange_glazed_terracotta", {
  description = "Orange Glazed Terracotta",
  tiles = {"eng_orange_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:packed_ice", {
  description = "Packed Ice",
  tiles = {"eng_packed_ice.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:packed_mud", {
  description = "Packed Mud",
  tiles = {"eng_packed_mud.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:pale_moss_block", {
  description = "Pale Moss Block",
  tiles = {"eng_pale_moss_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:pale_oak_log", {
  description = "Pale Oak Log",
  tiles = {"eng_pale_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:pale_oak_planks", {
  description = "Pale Oak Planks",
  tiles = {"eng_pale_oak_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:pale_oak_wood", {
  description = "Pale Oak Wood",
  tiles = {"eng_pale_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:pearlescent_froglight", {
  description = "Pearlescent Froglight",
  tiles = {"eng_pearlescent_froglight.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:pink_concrete", {
  description = "Pink Concrete",
  tiles = {"eng_pink_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:pink_terracotta", {
  description = "Pink Terracotta",
  tiles = {"eng_pink_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:piston", {
  description = "Piston",
  tiles = {"eng_piston.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:podzol", {
  description = "Podzol",
  tiles = {"eng_podzol.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_andesite", {
  description = "Polished Andesite",
  tiles = {"eng_polished_andesite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_basalt", {
  description = "Polished Basalt",
  tiles = {"eng_polished_basalt.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_blackstone", {
  description = "Polished Blackstone",
  tiles = {"eng_polished_blackstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_blackstone_bricks", {
  description = "Polished Blackstone Bricks",
  tiles = {"eng_polished_blackstone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_deepslate", {
  description = "Polished Deepslate",
  tiles = {"eng_polished_deepslate.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_diorite", {
  description = "Polished Diorite",
  tiles = {"eng_polished_diorite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_granite", {
  description = "Polished Granite",
  tiles = {"eng_polished_granite.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_sulfur", {
  description = "Polished Sulfur",
  tiles = {"eng_polished_sulfur.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:polished_tuff", {
  description = "Polished Tuff",
  tiles = {"eng_polished_tuff.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:poplar_log", {
  description = "Poplar Log",
  tiles = {"eng_poplar_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:poplar_planks", {
  description = "Poplar Planks",
  tiles = {"eng_poplar_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:poplar_wood", {
  description = "Poplar Wood",
  tiles = {"eng_poplar_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:potent_sulfur", {
  description = "Potent Sulfur",
  tiles = {"eng_potent_sulfur.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:prismarine", {
  description = "Prismarine",
  tiles = {{name="eng_prismarine.png", animation={type="vertical_frames", aspect_w=16, aspect_h=16, length=4.0}}},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:prismarine_bricks", {
  description = "Prismarine Bricks",
  tiles = {"eng_prismarine_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:purple_terracotta", {
  description = "Purple Terracotta",
  tiles = {"eng_purple_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:quartz_block", {
  description = "Quartz Block",
  tiles = {"eng_quartz_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:quartz_bricks", {
  description = "Quartz Bricks",
  tiles = {"eng_quartz_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:quartz_pillar", {
  description = "Quartz Pillar",
  tiles = {"eng_quartz_pillar.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:raw_gold_block", {
  description = "Raw Gold Block",
  tiles = {"eng_raw_gold_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:raw_iron_block", {
  description = "Raw Iron Block",
  tiles = {"eng_raw_iron_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:redstone_lamp", {
  description = "Redstone Lamp",
  tiles = {"eng_redstone_lamp.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:redstone_ore", {
  description = "Redstone Ore",
  tiles = {"eng_redstone_ore.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:reinforced_deepslate", {
  description = "Reinforced Deepslate",
  tiles = {"eng_reinforced_deepslate.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:rooted_dirt", {
  description = "Rooted Dirt",
  tiles = {"eng_rooted_dirt.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:sand", {
  description = "Sand",
  tiles = {"eng_sand.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:sandstone", {
  description = "Sandstone",
  tiles = {"eng_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:sculk", {
  description = "Sculk",
  tiles = {"eng_sculk.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:sculk_catalyst", {
  description = "Sculk Catalyst",
  tiles = {"eng_sculk_catalyst.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:sea_lantern", {
  description = "Sea Lantern",
  tiles = {{name="eng_sea_lantern.png", animation={type="vertical_frames", aspect_w=16, aspect_h=16, length=2.0}}},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults(),
  light_source = 14
})
minetest.register_node("eng:shroomlight", {
  description = "Shroomlight",
  tiles = {"eng_shroomlight.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:smithing_table", {
  description = "Smithing Table",
  tiles = {"eng_smithing_table.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:smoker", {
  description = "Smoker",
  tiles = {"eng_smoker.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:smooth_basalt", {
  description = "Smooth Basalt",
  tiles = {"eng_smooth_basalt.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:smooth_quartz", {
  description = "Smooth Quartz",
  tiles = {"eng_smooth_quartz.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:smooth_sandstone", {
  description = "Smooth Sandstone",
  tiles = {"eng_smooth_sandstone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:smooth_stone", {
  description = "Smooth Stone",
  tiles = {"eng_smooth_stone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:snow_block", {
  description = "Snow Block",
  tiles = {"eng_snow_block.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:soul_sand", {
  description = "Soul Sand",
  tiles = {"eng_soul_sand.png"},
  groups = {crumbly = 3},
  sounds = default.node_sound_dirt_defaults()
})
minetest.register_node("eng:soul_soil", {
  description = "Soul Soil",
  tiles = {"eng_soul_soil.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:spruce_log", {
  description = "Spruce Log",
  tiles = {"eng_spruce_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:spruce_planks", {
  description = "Spruce Planks",
  tiles = {"eng_spruce_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:spruce_wood", {
  description = "Spruce Wood",
  tiles = {"eng_spruce_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stone", {
  description = "Stone",
  tiles = {"eng_stone.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:stone_bricks", {
  description = "Stone Bricks",
  tiles = {"eng_stone_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:stripped_bamboo_block", {
  description = "Stripped Bamboo Block",
  tiles = {"eng_stripped_bamboo_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:stripped_birch_log", {
  description = "Stripped Birch Log",
  tiles = {"eng_stripped_birch_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_birch_wood", {
  description = "Stripped Birch Wood",
  tiles = {"eng_stripped_birch_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_cherry_log", {
  description = "Stripped Cherry Log",
  tiles = {"eng_stripped_cherry_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_cherry_wood", {
  description = "Stripped Cherry Wood",
  tiles = {"eng_stripped_cherry_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_crimson_hyphae", {
  description = "Stripped Crimson Hyphae",
  tiles = {"eng_stripped_crimson_hyphae.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:stripped_dark_oak_log", {
  description = "Stripped Dark Oak Log",
  tiles = {"eng_stripped_dark_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_dark_oak_wood", {
  description = "Stripped Dark Oak Wood",
  tiles = {"eng_stripped_dark_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_jungle_wood", {
  description = "Stripped Jungle Wood",
  tiles = {"eng_stripped_jungle_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_mangrove_log", {
  description = "Stripped Mangrove Log",
  tiles = {"eng_stripped_mangrove_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_oak_log", {
  description = "Stripped Oak Log",
  tiles = {"eng_stripped_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_oak_wood", {
  description = "Stripped Oak Wood",
  tiles = {"eng_stripped_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_pale_oak_log", {
  description = "Stripped Pale Oak Log",
  tiles = {"eng_stripped_pale_oak_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_pale_oak_wood", {
  description = "Stripped Pale Oak Wood",
  tiles = {"eng_stripped_pale_oak_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_poplar_log", {
  description = "Stripped Poplar Log",
  tiles = {"eng_stripped_poplar_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_poplar_wood", {
  description = "Stripped Poplar Wood",
  tiles = {"eng_stripped_poplar_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_spruce_log", {
  description = "Stripped Spruce Log",
  tiles = {"eng_stripped_spruce_log.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_spruce_wood", {
  description = "Stripped Spruce Wood",
  tiles = {"eng_stripped_spruce_wood.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:stripped_warped_hyphae", {
  description = "Stripped Warped Hyphae",
  tiles = {"eng_stripped_warped_hyphae.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:stripped_warped_stem", {
  description = "Stripped Warped Stem",
  tiles = {"eng_stripped_warped_stem.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:sulfur", {
  description = "Sulfur",
  tiles = {"eng_sulfur.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:sulfur_bricks", {
  description = "Sulfur Bricks",
  tiles = {"eng_sulfur_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:target", {
  description = "Target",
  tiles = {"eng_target.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:tuff", {
  description = "Tuff",
  tiles = {"eng_tuff.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:tuff_bricks", {
  description = "Tuff Bricks",
  tiles = {"eng_tuff_bricks.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:verdant_froglight", {
  description = "Verdant Froglight",
  tiles = {"eng_verdant_froglight.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:warped_hyphae", {
  description = "Warped Hyphae",
  tiles = {"eng_warped_hyphae.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:warped_nylium", {
  description = "Warped Nylium",
  tiles = {"eng_warped_nylium.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:warped_planks", {
  description = "Warped Planks",
  tiles = {"eng_warped_planks.png"},
  groups = {choppy = 2, oddly_breakable_by_hand = 2, flammable = 2},
  sounds = default.node_sound_wood_defaults()
})
minetest.register_node("eng:waxed_chiseled_copper", {
  description = "Waxed Chiseled Copper",
  tiles = {"eng_waxed_chiseled_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_copper_block", {
  description = "Waxed Copper Block",
  tiles = {"eng_waxed_copper_block.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_cut_copper", {
  description = "Waxed Cut Copper",
  tiles = {"eng_waxed_cut_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_exposed_chiseled_copper", {
  description = "Waxed Exposed Chiseled Copper",
  tiles = {"eng_waxed_exposed_chiseled_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_exposed_copper", {
  description = "Waxed Exposed Copper",
  tiles = {"eng_waxed_exposed_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_exposed_copper_bulb", {
  description = "Waxed Exposed Copper Bulb",
  tiles = {"eng_waxed_exposed_copper_bulb.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_exposed_cut_copper", {
  description = "Waxed Exposed Cut Copper",
  tiles = {"eng_waxed_exposed_cut_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_oxidized_copper_bulb", {
  description = "Waxed Oxidized Copper Bulb",
  tiles = {"eng_waxed_oxidized_copper_bulb.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:waxed_weathered_copper", {
  description = "Waxed Weathered Copper",
  tiles = {"eng_waxed_weathered_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:weathered_chiseled_copper", {
  description = "Weathered Chiseled Copper",
  tiles = {"eng_weathered_chiseled_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:weathered_copper_bulb", {
  description = "Weathered Copper Bulb",
  tiles = {"eng_weathered_copper_bulb.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:weathered_cut_copper", {
  description = "Weathered Cut Copper",
  tiles = {"eng_weathered_cut_copper.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:wet_sponge", {
  description = "Wet Sponge",
  tiles = {"eng_wet_sponge.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:white_concrete", {
  description = "White Concrete",
  tiles = {"eng_white_concrete.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:white_concrete_powder", {
  description = "White Concrete Powder",
  tiles = {"eng_white_concrete_powder.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:white_glazed_terracotta", {
  description = "White Glazed Terracotta",
  tiles = {"eng_white_glazed_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:white_terracotta", {
  description = "White Terracotta",
  tiles = {"eng_white_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})
minetest.register_node("eng:white_wool", {
  description = "White Wool",
  tiles = {"eng_white_wool.png"},
  groups = {snappy = 2, choppy = 2, oddly_breakable_by_hand = 3, flammable = 3},
  sounds = default.node_sound_defaults()
})
minetest.register_node("eng:yellow_terracotta", {
  description = "Yellow Terracotta",
  tiles = {"eng_yellow_terracotta.png"},
  groups = {cracky = 3},
  sounds = default.node_sound_stone_defaults()
})

-- Showcase world: make sure every joining player can fly around the eng (survives world recreations).
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

dofile(minetest.get_modpath("eng") .. "/place.lua")
