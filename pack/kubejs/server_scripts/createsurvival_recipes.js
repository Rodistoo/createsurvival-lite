// Every recipe the CreateSurvival pack adds, changes or removes, in one place. Server script: /reload applies changes.
// Sections: removed, duplicates, CreateSurvival Core, CreateSurvival Mechanics, CreateSurvival Magic, ancient books
// (Immersive Enchanting).
// A recipe is only added while all its items exist: a mod that isn't installed, or a feature switched off in
// config/createsurvival_core-features.toml or createsurvival_mechanics-features.toml, just leaves it out.
// Item tags ('#c:ingots/steel') are always fine.

ServerEvents.recipes(event => {
  const ITEM_IDS = []
  const KNOWN_ITEM = {}
  Item.getTypeList().forEach(entry => {
    const id = String(entry)
    ITEM_IDS.push(id)
    KNOWN_ITEM[id] = true
  })
  // '2x mod:item' -> whether mod:item exists
  const exists = id => id.startsWith('#') || KNOWN_ITEM[id.replace(/^\d+x /, '')] === true
  const allExist = ids => ids.every(exists)
  const keyItems = key => Object.keys(key).map(k => key[k])
  const repeat = (id, count) => {
    const list = []
    for (let i = 0; i < count; i++) list.push(id)
    return list
  }
  const shaped = (id, result, pattern, key) => {
    if (allExist([result].concat(keyItems(key)))) event.shaped(result, pattern, key).id(id)
  }
  // the only recipe for its item: every other recipe making it (vanilla's, other mods') is removed first
  const replaceShaped = (id, result, pattern, key) => {
    if (!allExist([result].concat(keyItems(key)))) return
    event.remove({ output: result.replace(/^\d+x /, ''), not: { id: id } })
    shaped(id, result, pattern, key)
  }
  const shapeless = (id, result, ingredients) => {
    if (allExist([result].concat(ingredients))) event.shapeless(result, ingredients).id(id)
  }
  const stonecutting = (id, result, ingredient) => {
    if (allExist([result, ingredient])) event.stonecutting(result, ingredient).id(id)
  }

  // ---- removed: these items can't be made ----
  // item ids
  const REMOVE = [
    // (wooden tools stay in the Lite pack: no Simple Flint Tools or This Rocks! for the first tools)
    // gantries: CreateSurvival Mechanics' gantry drive replaces them (Gadgets & Gizmos' physics gantry too)
    'create:gantry_carriage', 'createthrusters:physics_gantry_shaft', 'createthrusters:physics_gantry_carriage',
    'createthrusters:physics_gantry_belt_wheel',
    // Gadgets & Gizmos' physics staff: not part of the pack
    'createthrusters:physics_staff',
    // Create contraption blocks CreateSurvival Mechanics replaces with physics ones (their recipes are the Mechanics
    // blocks' now, see below)
    'create:mechanical_piston', 'create:sticky_mechanical_piston', 'create:rope_pulley', 'create:cart_assembler',
    // Linear Bearing's bearing: the Mechanics linear slider replaces it (its linear casing stays)
    'linearbearing:linear_bearing',
    //ropes
    'farmersdelight:rope', 'additionaladditions:rope', 'comforts:rope_and_nail', 'darkerdepths:rope'
    //misc

  ]
  // every item whose id starts with one of these
  const REMOVE_STARTING_WITH = [
    // Create's small tuff bricks (and their slabs, stairs, walls)
    'create:small_tuff_'
  ]
  REMOVE.filter(exists).forEach(id => event.remove({ output: id }))
  ITEM_IDS.filter(id => REMOVE_STARTING_WITH.some(start => id.startsWith(start))).forEach(id => event.remove({ output: id }))
  // Caverns & Chasms' copper tools and armour (every weathering stage, waxed or not): Vanilla Backport has the vanilla ones
  const CNC_COPPER_GEAR = /^caverns_and_chasms:(waxed_)?(exposed_|weathered_|oxidized_)?copper_(pickaxe|axe|shovel|hoe|sword|helmet|chestplate|leggings|boots)$/
  ITEM_IDS.filter(id => CNC_COPPER_GEAR.test(id)).forEach(id => event.remove({ output: id }))

  // ---- duplicates: where two mods add the same block, only the preferred mod's can be made ----
  // PREFERRED: [kept mod, mod whose same blocks lose their recipes]. "The same" is the same name, read loosely by
  // SAME_NAME (quark:cobblestone_bricks_slab = caverns_and_chasms:cobblestone_brick_slab, a vertical slab = the slab).
  // The removed ids are listed in logs/kubejs/server.log.
  const PREFERRED = [['caverns_and_chasms', 'quark']]
  const SAME_NAME = name => name
    .replace(/bricks_/g, 'brick_')
    .replace(/_vertical_slab$/, '_slab')
    .replace(/^azalea_planks_/, 'azalea_')
    .replace(/^dripstone_block_/, 'dripstone_')
  PREFERRED.forEach(pair => {
    const kept = {}
    ITEM_IDS.filter(id => id.startsWith(pair[0] + ':')).forEach(id => { kept[SAME_NAME(id.substring(pair[0].length + 1))] = id })
    const removed = ITEM_IDS.filter(id => id.startsWith(pair[1] + ':') && kept[SAME_NAME(id.substring(pair[1].length + 1))])
    removed.forEach(id => event.remove({ output: id }))
    if (removed.length > 0) console.info(`Duplicates: ${removed.length} ${pair[1]} items can't be made (${pair[0]}'s instead): ${removed.join(', ')}`)
  })

  // ---- CreateSurvival Core ----
  //Stone tools and cobblestone splitters
  // (replaceShaped: this recipe is the only one for its item; other mods' recipes for it go too, Quark's Better Stone
  // Tools one included. Shaped recipes also work mirrored, so one is enough for both sides.)
  replaceShaped('minecraft:stone_axe', 'minecraft:stone_axe', ['II', 'IS', ' S'], { I: 'rocks:cobblestone_splitter', S: 'minecraft:stick' })


  // clay furnace: the vanilla furnace, made of clay (what it smelts: createsurvival_clay_furnace.js); every other furnace
  // recipe (cobblestone, blackstone, deepslate, other mods' stones) goes
  event.remove({ output: 'minecraft:furnace' })
  shaped('createsurvival_core:clay_furnace', 'minecraft:furnace', ['CCC', 'C C', 'CCC'], { C: 'minecraft:clay_ball' })

  // bytes: eighth blocks of other blocks, e.g. createsurvival_core:bytes/minecraft/stone (which blocks get bytes:
  // config/createsurvival_core-startup.toml, needs a restart). The chisel (right-click a block with bytes) breaks off the
  // eighth you aim at; a stonecutter cuts a block into 8 of its bytes, 8 bytes in a crafting grid make the block again
  shaped('createsurvival_core:chisel', 'createsurvival_core:chisel', [' I', 'S '], { I: 'minecraft:iron_ingot', S: 'minecraft:stick' })
  const BYTES_PER_BLOCK = 8
  ITEM_IDS.forEach(id => {
    const match = id.match(/^createsurvival_core:bytes\/([^\/]+)\/(.+)$/)
    if (!match) return
    const material = match[1] + ':' + match[2]
    if (!exists(material)) return
    event.stonecutting(`${BYTES_PER_BLOCK}x ${id}`, material).id(`createsurvival_core:bytes/cut/${match[1]}/${match[2]}`)
    event.shapeless(material, repeat(id, BYTES_PER_BLOCK)).id(`createsurvival_core:bytes/join/${match[1]}/${match[2]}`)
  })


  // vertical slabs (createsurvival_core:vertical_slab/<mod>/<slab>; which slabs: [verticalSlabs] in
  // config/createsurvival_core-startup.toml): 3 slabs in a column make 3, like Quark's; one makes its slab again
  ITEM_IDS.forEach(id => {
    const match = id.match(/^createsurvival_core:vertical_slab\/([^\/]+)\/(.+)$/)
    if (!match) return
    const slab = match[1] + ':' + match[2]
    if (!exists(slab)) return
    event.shaped(`3x ${id}`, ['#', '#', '#'], { '#': slab }).id(`createsurvival_core:vertical_slab/${match[1]}/${match[2]}`)
    event.shapeless(slab, [id]).id(`createsurvival_core:vertical_slab/${match[1]}/${match[2]}_revert`)
  })

  // block bag: worn in a Curios belt slot, each of its slots carries one stack of blocks (level 1: 3 slots; stack size:
  // [inventory] blockStackSize in config/createsurvival_core-startup.toml).
  // build hammer: worn in the Curios hands slot (right-click), lets its wearer place blocks.
  // beams: a frame inside blocks, only seen while holding beams. They start from a Block of Cast Iron (block tag
  // createsurvival_core:beam_anchors) or a block with a beam inside; with beams in the off hand, a block placed against
  // one goes in at once ([placing] beamTimeMultiplier) with a beam inside, using up a beam
  shaped('createsurvival_core:block_bag', 'createsurvival_core:block_bag', ['SLS', 'L L', 'LLL'],
    { S: 'minecraft:string', L: 'minecraft:leather' })
  // contraption bag: worn in a Curios belt slot, each slot carries one pocket contraption (CreateSurvival Mechanics)
  shaped('createsurvival_core:contraption_bag', 'createsurvival_core:contraption_bag', ['SLS', 'LCL', 'LLL'],
    { S: 'minecraft:string', L: 'minecraft:leather', C: 'create:andesite_casing' })
  // block barrel: nine slots for blocks only, stacked [inventory] storageStackMultiplier times as high as in the inventory
  // (config/createsurvival_core-startup.toml); chests, barrels and other storage (block tag createsurvival_core:no_block_storage)
  // take no blocks
  shaped('createsurvival_core:block_barrel', 'createsurvival_core:block_barrel', ['PSP', 'PAP', 'PSP'],
    { P: '#minecraft:planks', S: '#minecraft:wooden_slabs', A: 'create:andesite_alloy' })
  // bag tiers (slots per tier: [inventory] blockBagSlots / contraptionBagSlots in config/createsurvival_core-startup.toml):
  // the bag of the tier below in the middle, the tier's material around it; the bag keeps what it carries
  const BAG_TIER_MATERIALS = { 2: 'minecraft:copper_ingot', 3: 'create:brass_ingot', 4: 'minecraft:diamond', 5: 'minecraft:netherite_ingot' }
  const BAGS = ['block_bag', 'contraption_bag']
  BAGS.forEach(bag => {
    Object.keys(BAG_TIER_MATERIALS).forEach(tier => {
      const below = 'createsurvival_core:' + bag + (tier == 2 ? '' : '_' + (tier - 1))
      const upgraded = 'createsurvival_core:' + bag + '_' + tier
      if (!allExist([below, upgraded, BAG_TIER_MATERIALS[tier]])) return
      event.custom({
        type: 'createsurvival_core:bag_upgrade',
        category: 'equipment',
        pattern: [' M ', 'MBM', ' M '],
        key: { M: { item: BAG_TIER_MATERIALS[tier] }, B: { item: below } },
        result: { id: upgraded, count: 1 }
      }).id(upgraded)
    })
  })
  shaped('createsurvival_core:build_hammer', 'createsurvival_core:build_hammer', ['AAA', ' S ', ' S '],
    { A: 'create:zinc_ingot', S: 'minecraft:stick' })
    shaped('createsurvival_core:build_hammer_alloy', 'createsurvival_core:build_hammer', ['AAA', ' S ', ' S '],
    { A: 'create:andesite_alloy', S: 'minecraft:stick' })
  shaped('createsurvival_core:beam', '8x createsurvival_core:beam', ['N', 'N', 'N'], { N: 'minecraft:iron_nugget' })
  // structural goggles: worn, they show how close the block looked at is to giving way. Placeholder: Create's goggles and a spyglass
  shapeless('createsurvival_core:structural_goggles', 'createsurvival_core:structural_goggles', ['create:goggles', 'minecraft:spyglass'])
  shaped('portablecraftingtable:portable_crafting_table', 'portablecraftingtable:portable_crafting_table', [' NN', ' NN', 'S  '], { N: '#minecraft:planks', S: 'minecraft:stick' })


  // reinforcing tool: use it on one corner, then on the opposite one, and every block in between is reinforced (only
  // falls when nothing holds it, can't be moved by pistons or contraptions, harder to mine; [building.reinforcing] in
  // config/createsurvival_core-server.toml). One durability point per block (2048).
  // Placeholder: iron for the head, andesite alloy and a stick for the handle
  shaped('createsurvival_core:reinforcing_tool', 'createsurvival_core:reinforcing_tool', [' II', ' AI', 'S  '],
    { I: 'minecraft:iron_ingot', A: 'create:andesite_alloy', S: 'minecraft:stick' })

  // hardened stone (the stone tiers further down)
  const HARDENED_STONE = 'createsurvival_core:hardened_stone'
  shaped('createsurvival_core:hardened_stone_stairs', '4x createsurvival_core:hardened_stone_stairs', ['#  ', '## ', '###'], { '#': HARDENED_STONE })
  shaped('createsurvival_core:hardened_stone_slab', '6x createsurvival_core:hardened_stone_slab', ['###'], { '#': HARDENED_STONE })
  shaped('createsurvival_core:hardened_stone_wall', '6x createsurvival_core:hardened_stone_wall', ['###', '###'], { '#': HARDENED_STONE })
  stonecutting('createsurvival_core:hardened_stone_stairs_from_stonecutting', 'createsurvival_core:hardened_stone_stairs', HARDENED_STONE)
  stonecutting('createsurvival_core:hardened_stone_slab_from_stonecutting', '2x createsurvival_core:hardened_stone_slab', HARDENED_STONE)
  stonecutting('createsurvival_core:hardened_stone_wall_from_stonecutting', 'createsurvival_core:hardened_stone_wall', HARDENED_STONE)

  // ---- CreateSurvival Mechanics ----
  // the blocks replacing Create's (and Linear Bearing's) are made like the ones they replace
  shaped('createsurvival_mechanics:gantry_drive', 'createsurvival_mechanics:gantry_drive', ['B', 'C', 'I'],
    { B: '#minecraft:wooden_slabs', C: 'create:andesite_casing', I: 'create:cogwheel' })
  shaped('createsurvival_mechanics:physics_cart_assembler', 'createsurvival_mechanics:physics_cart_assembler', ['CRC', 'LL '],
    { C: 'create:andesite_alloy', R: '#c:dusts/redstone', L: '#minecraft:logs' })
  shaped('createsurvival_mechanics:physics_mechanical_piston', 'createsurvival_mechanics:physics_mechanical_piston', ['B', 'C', 'I'],
    { B: '#minecraft:wooden_slabs', C: 'create:andesite_casing', I: 'create:piston_extension_pole' })
  shaped('createsurvival_mechanics:sticky_physics_mechanical_piston', 'createsurvival_mechanics:sticky_physics_mechanical_piston', ['S', 'P'],
    { S: '#c:slimeballs', P: 'createsurvival_mechanics:physics_mechanical_piston' })
  shaped('createsurvival_mechanics:linear_slider', 'createsurvival_mechanics:linear_slider', ['ASA', 'DPD', 'DDD'],
    { A: 'create:andesite_alloy', S: 'minecraft:slime_ball', D: 'minecraft:cobbled_deepslate', P: 'create:iron_sheet' })
  // pocket contraption: picks up a small physics object as an item that works as a tool while held
  shapeless('createsurvival_mechanics:pocket_contraption', 'createsurvival_mechanics:pocket_contraption',
    ['simulated:physics_assembler', 'create:precision_mechanism', 'create:brass_casing'])
  // block placer: a dispenser turned from behind ([blockPlacer] in the Mechanics server config)
  shapeless('createsurvival_mechanics:block_placer', 'createsurvival_mechanics:block_placer',
    ['minecraft:dispenser', 'create:brass_casing','create:brass_hand', 'create:shaft'])
  shaped('createsurvival_mechanics:steel_rope', '2x createsurvival_mechanics:steel_rope', ['N', 'N', 'N'], { N: '#c:nuggets/steel' })
  shaped('createsurvival_mechanics:steel_rope_pulley', 'createsurvival_mechanics:steel_rope_pulley', ['B', 'R', 'I'],
    { B: 'create:andesite_casing', R: 'createsurvival_mechanics:steel_rope', I: '#c:ingots/steel' })

  // ---- Hardcore Torches: lighting and oil ----
  // (an oil can used on a tank or basin of seed oil fills up from it too: fluid tag createsurvival_core:lantern_oil)
  // (consts outside the if: Rhino counts a block's const as the function's)
  const HT = 'hardcore_torches:'
  const LANTERNS = [['unlit_lantern', 'lit_lantern'], ['unlit_soul_lantern', 'lit_soul_lantern']]
  const TORCHES = [['smoldering_torch', 'lit_torch'], ['unlit_soul_torch', 'lit_soul_torch']]
  if (Platform.isLoaded('hardcore_torches')) {
    // a lantern and an oil can: the lantern filled from the can, the can keeps what is left
    // a lantern and flint and steel (damaged) or a fire charge (used up): lit, with its fuel (it needs some)
    LANTERNS.forEach(pair => {
      const unlit = pair[0], lit = pair[1]
      pair.forEach(lantern => {
        if (!allExist([HT + lantern, HT + 'oil_can'])) return
        event.custom({ type: 'createsurvival_core:fill_lantern', category: 'misc', result: { id: HT + lantern, count: 1 },
          ingredients: [{ item: HT + lantern }, { item: HT + 'oil_can' }] }).id('createsurvival_core:hardcore_torches/fill_' + lantern)
      })
      if (!allExist([HT + unlit, HT + lit])) return
      event.custom({ type: 'createsurvival_core:light_lantern', category: 'misc', result: { id: HT + lit, count: 1 },
        ingredients: [{ item: HT + unlit }, { tag: 'hardcore_torches:damage_lantern_light_items' }] }).id('createsurvival_core:hardcore_torches/light_' + unlit)
      event.custom({ type: 'createsurvival_core:light_lantern', category: 'misc', result: { id: HT + lit, count: 1 },
        ingredients: [{ item: HT + unlit }, { tag: 'hardcore_torches:consume_lantern_light_items' }] }).id('createsurvival_core:hardcore_torches/light_' + unlit + '_consume')
    })
    // torches: Hardcore Torches lights unlit torches with flint and steel itself; also smoldering ones and soul torches
    // (its recipe type keeps their fuel; campfires stay lit by hand)
    TORCHES.forEach(pair => {
      const unlit = pair[0], lit = pair[1]
      if (!allExist([HT + unlit, HT + lit])) return
      event.custom({ type: 'hardcore_torches:damage_light', damage: true, result: { id: HT + lit, count: 1 },
        ingredients: [{ item: HT + unlit }, { tag: 'hardcore_torches:damage_torch_light_items' }] }).id('createsurvival_core:hardcore_torches/light_' + unlit)
    })
    // a bucket of seed oil fills an oil can completely (fuel 0 = full; the bucket comes back)
    if (allExist([HT + 'oil_can', 'createaddition:seed_oil_bucket'])) {
      event.custom({ type: 'createsurvival_core:fill_oil_can', category: 'misc', result: { id: HT + 'oil_can', count: 1 }, fuel: 0,
        ingredients: [{ item: HT + 'oil_can' }, { item: 'createaddition:seed_oil_bucket' }] }).id('createsurvival_core:hardcore_torches/oil_can_from_seed_oil')
    }
  }

  // ---- CreateSurvival Magic (with Ars Nouveau). Placeholders ----
  // Spell mode: using a spell book (item tag createsurvival_magic:spell_casters) puts it in the off hand and the hotbar
  // shows the glyph bag's spell hotbar: using adds the picked glyph to the spell (3 at most, shown above the health bar),
  // sneaking and using lets go of them, attacking casts it. Spell mode ends when the book leaves the off hand.
  // Glyph bag: worn in a Curios belt slot; its inventory tab holds the glyphs and arranges the spell hotbar.
  // Wind glyph: with Projectile a wind charge (Underfoot/Touch: goes off right there); with Self slow falling; otherwise
  // it blows like an encased fan where the spell aims, processing items like one (Underfoot: lifts you). More wind glyphs:
  // stronger. Stream glyph: the spell keeps going while attack is held.
  // Numbers (reach, strength, lift height, durations, ...): config/createsurvival_magic-server.toml
  if (Platform.isLoaded('createsurvival_magic') && Platform.isLoaded('ars_nouveau')) {
    shaped('createsurvival_magic:glyph_bag', 'createsurvival_magic:glyph_bag', ['SLS', 'LAL', 'LLL'],
      { S: 'minecraft:string', L: 'minecraft:leather', A: 'minecraft:amethyst_shard' })
    // at Ars Nouveau's scribe's table, like its own glyphs
    const glyph = (id, inputs) => {
      event.custom({
        type: 'ars_nouveau:glyph',
        exp: 27,
        inputs: inputs.map(item => ({ item: item })),
        output: { count: 1, id: id }
      }).id(id)
    }
    glyph('createsurvival_magic:glyph_wind', ['minecraft:feather', 'minecraft:feather', 'minecraft:string'])
    glyph('createsurvival_magic:glyph_stream', ['minecraft:blaze_rod', 'minecraft:amethyst_shard', 'minecraft:redstone'])
  }

  // ---- ancient books (Immersive Enchanting): a book with one enchantment at level 1, from a book, 7 diamonds and the
  // item that fits the enchantment (top middle) ----
  const ANCIENT_BOOKS = {
    'create:capacity': 'create:pulp',
    'minecraft:aqua_affinity': 'minecraft:turtle_scute',
    'minecraft:bane_of_arthropods': 'minecraft:spider_eye',
    'minecraft:binding_curse': 'minecraft:slime_ball',
    'minecraft:blast_protection': 'minecraft:gunpowder',
    'minecraft:breach': 'minecraft:prismarine_shard',
    'minecraft:channeling': 'minecraft:lightning_rod',
    'minecraft:density': 'minecraft:pointed_dripstone',
    'minecraft:depth_strider': 'minecraft:tropical_fish',
    'minecraft:feather_falling': 'minecraft:phantom_membrane',
    'minecraft:fire_aspect': 'minecraft:blaze_powder',
    'minecraft:fire_protection': 'minecraft:fire_charge',
    'minecraft:flame': 'minecraft:charcoal',
    'minecraft:fortune': 'minecraft:gold_ingot',
    'minecraft:frost_walker': 'minecraft:blue_ice',
    'minecraft:infinity': 'minecraft:water_bucket',
    'minecraft:knockback': 'minecraft:stick',
    'minecraft:looting': 'minecraft:leather',
    'minecraft:loyalty': 'minecraft:feather',
    'minecraft:luck_of_the_sea': 'minecraft:salmon',
    'minecraft:multishot': 'minecraft:melon_seeds',
    'minecraft:piercing': 'minecraft:ender_pearl',
    'minecraft:projectile_protection': 'minecraft:bone',
    'minecraft:punch': 'minecraft:piston',
    'minecraft:quick_charge': 'minecraft:redstone',
    'minecraft:respiration': 'minecraft:pufferfish',
    'minecraft:riptide': 'minecraft:nautilus_shell',
    'minecraft:sharpness': 'minecraft:sweet_berries',
    'minecraft:smite': 'minecraft:glistering_melon_slice',
    'minecraft:thorns': 'minecraft:cactus',
    'minecraft:unbreaking': 'minecraft:obsidian',
    'minecraft:vanishing_curse': 'minecraft:fermented_spider_eye',
    'minecraft:wind_burst': 'minecraft:wind_charge',
    'windswept:slipping_curse': 'neapolitan:banana_bunch',
    'createsurvival_core:soulbound': 'minecraft:soul_sand',
    'minecraft:efficiency': 'minecraft:sugar',
    'minecraft:impaling': 'minecraft:prismarine_crystals',
    'minecraft:lunge': 'minecraft:rabbit_foot',
    'minecraft:lure': 'minecraft:cod',
    'minecraft:power': 'minecraft:arrow',
    'minecraft:protection': 'minecraft:iron_ingot',
    'minecraft:silk_touch': 'minecraft:cobweb',
    'minecraft:soul_speed': 'minecraft:soul_soil',
    'minecraft:sweeping_edge': 'minecraft:shears',
    'minecraft:swift_sneak': 'minecraft:echo_shard',
    'create:potato_recovery': 'minecraft:potato',
    'create_ltab:enchantment_luck': 'minecraft:emerald',
    'create_ltab:wanderer': 'minecraft:compass',
    'farmersdelight:backstabbing': 'farmersdelight:flint_knife',
    'supplementaries:stasis': 'minecraft:clock',
    'caverns_and_chasms:conceal': 'minecraft:ink_sac',
    'caverns_and_chasms:extending': 'minecraft:chain',
    'caverns_and_chasms:obscurity': 'minecraft:glass',
    'caverns_and_chasms:sky_set': 'minecraft:scaffolding',
    'notenoughtrials:daredevil': 'minecraft:breeze_rod',
    'notenoughtrials:equity': 'minecraft:flint',
    'notenoughtrials:storm_front': 'minecraft:heart_of_the_sea',
    'climbingclaws:canopy_grip': 'minecraft:vine',
    'climbingclaws:wall_spring': 'minecraft:slime_block',
    'darkerdepths:quick_dash': 'minecraft:rabbit_hide',
    'darkerdepths:swift_strike': 'minecraft:quartz',
    'enderscape:lightspeed': 'minecraft:glowstone_dust',
    'enderscape:rebound': 'minecraft:firework_rocket',
    'enderscape:transdimensional': 'minecraft:ender_eye'
  }
  if (Platform.isLoaded('immersiveenchanting')) {
    Object.keys(ANCIENT_BOOKS).forEach(enchantment => {
      const item = ANCIENT_BOOKS[enchantment]
      const enchantmentMod = enchantment.substring(0, enchantment.indexOf(':'))
      if (!Platform.isLoaded(enchantmentMod) || !exists(item)) return
      const levels = {}
      levels[enchantment] = 1
      event.custom({
        type: 'minecraft:crafting_shaped',
        category: 'misc',
        group: 'createsurvival_core:ancient_book',
        pattern: ['DRD', 'DBD', 'DDD'],
        key: { D: { item: 'minecraft:diamond' }, B: { item: 'minecraft:book' }, R: { item: item } },
        result: { id: 'immersiveenchanting:ancient_book', count: 1, components: { 'minecraft:stored_enchantments': { levels: levels } } }
      }).id('createsurvival_core:ancient_book/' + enchantment.replace(':', '/'))
    })
  }
})
