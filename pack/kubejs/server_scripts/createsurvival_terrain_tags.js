// Other mods' terrain and building blocks in CreateSurvival Core's mining categories (vanilla's are in Core itself).
// Each category is a block tag createsurvival_core:dense_mining/<category>; how fast its blocks mine, alone and
// surrounded by others, is set per category in config/createsurvival_core-server.toml ([mining.denseMining] blocks).
// The categories also give blocks their support strength and load capacity ([physics.blockPhysics] supportStrength,
// loadCapacity in the same file).
// Masonry comes in five: masonry_deep (deepslate bricks), masonry_metal (metal bricks), masonry_hard (blackstone, end
// stone), masonry (stone bricks, mud bricks) and masonry_soft (sandstone, dirt bricks).
// Entries are block ids or #tags; blocks that don't exist (a mod not installed) are skipped. After a change: /reload

// natural blocks, by category
const CATEGORIES = {
  // deepslate-like: the slowest
  deep_stone: [
    'darkerdepths:arid_deepslate', 'darkerdepths:grime_deepslate',
    'caverns_and_chasms:cylindrite_tin_ore', 'caverns_and_chasms:deepslate_turquoise_ore'
  ],
  hard_stone: ['caverns_and_chasms:cassiterite_tin_ore'],
  stone: [
    'caverns_and_chasms:magmatic_rhyolite', 'caverns_and_chasms:turquoise_ore',
    'darkerdepths:aridrock', 'darkerdepths:duskrock', 'darkerdepths:grimestone', 'darkerdepths:mossy_grimestone',
    'yungscavebiomes:marble', 'yungscavebiomes:travertine',
    'spawn:reefstone', 'spawn:algal_reefstone'
  ],
  // sandstone, terracotta-like
  soft_stone: [
    '#c:sandstone/red_blocks', '#c:sandstone/uncolored_blocks',
    'spawn:blasted_sandstone', 'spawn:chiseled_blasted_sandstone', 'spawn:cut_blasted_sandstone', 'spawn:smooth_blasted_sandstone',
    'quark:soul_sandstone', 'quark:chiseled_soul_sandstone', 'quark:cut_soul_sandstone', 'quark:smooth_soul_sandstone',
    // Quark's shingles: terracotta shingles, every color
    /^quark:([a-z_]+_)?shingles$/
  ],
  loose: [
    'spawn:algal_sand', 'spawn:blasted_sand', 'yungscavebiomes:suspicious_ancient_sand', 'supplementaries:raked_gravel'
  ],
  soil: ['farmersdelight:rich_soil', 'farmersdelight:rich_soil_farmland', 'farmersdelight:organic_compost'],
  nether_end: [
    'caverns_and_chasms:soul_silver_ore', 'supplementaries:ashen_basalt',
    'enderscape:mirestone', 'enderscape:veradite', 'enderscape:kurodite', 'enderscape:void_shale', 'enderscape:veiled_end_stone',
    'enderscape:corrupt_overgrowth', 'enderscape:celestial_overgrowth',
    'enderscape:nebulite_ore', 'enderscape:shadoline_ore', 'enderscape:mirestone_nebulite_ore', 'enderscape:mirestone_shadoline_ore'
  ],
  ice: ['yungscavebiomes:rare_ice'],
  wood: [
    'darkerdepths:porous_petrified_log', 'darkerdepths:petrified_boards', 'darkerdepths:trimmed_petrified_planks',
    'caverns_and_chasms:azalea_boards', 'supplementaries:fine_wood'
  ],
  // Quark's building blocks that have no Caverns & Chasms twin (the twins can't be made: createsurvival_recipes.js)
  masonry_hard: ['quark:blackstone_bricks'],
  masonry_metal: ['quark:raw_copper_bricks', 'quark:raw_iron_bricks', 'quark:raw_gold_bricks'],
  masonry: [
    'quark:netherrack_bricks', 'quark:blue_nether_bricks', 'quark:carved_mud_bricks', 'quark:mud_pillar', 'quark:sturdy_stone',
    'quark:permafrost_bricks'
  ],
  masonry_soft: ['quark:sandstone_bricks', 'quark:red_sandstone_bricks', 'quark:soul_sandstone_bricks', 'quark:dirt_bricks']
}

// Every other mod's decorative stone (bricks, tiles, shingles, pillars, polished, chiseled, cut, smooth, layered) is
// masonry, found by its name: new ones (Stone Zone's variants of every stone) come in by themselves.
const MASONRY_NAME = /(^|_)(bricks|tiles|shingles|pillar)$|^(polished|chiseled|cut|smooth|layered)_/
// not masonry: shapes that aren't full blocks, glass, crystal, wood
const NOT_MASONRY = /(^|_)(slab|stairs|wall|vertical|fence|gate|door|trapdoor|button|pressure_plate|sign|pane|bars|carpet|lamp|post|lattice|window|lantern|torch|chain|bookshelf|glass|amethyst|leaves|log|wood|planks|suspicious)(_|$)/
// how dense masonry is, by what it is made of (the first that fits; anything else is plain masonry, like stone bricks)
const MASONRY_KINDS = [
  ['masonry_deep', /(^|_)(deepslate|cylindrite|darkslate)(_|$)/],
  ['masonry_metal', /(^|_)(copper|iron|gold|silver|tin|zinc|brass|bronze|netherite|necromium|shadoline|nebulite|raw)(_|$)/],
  ['masonry_hard', /(^|_)(blackstone|end_stone|cassiterite|mirestone|veradite|kurodite|obsidian)(_|$)/],
  ['masonry_soft', /(^|_)(sandstone|dirt|gravel|ash|terracotta|clay|snow)(_|$)/]
]
// mods left out of the name rule: vanilla and Core (Core's tags have them), Quark (listed above), mods with only machines
const NOT_BY_NAME = /^(minecraft|createsurvival_core|quark|rocks|copycats|create_dragons_plus|createbigcannons|createaddition|ldlib2):/
// can't be made: left out (createsurvival_recipes.js)
const LEFT_OUT = [/^create:small_tuff_/]

ServerEvents.tags('block', event => {
  const ids = []
  Block.getTypeList().forEach(entry => ids.push(String(entry)))
  const known = {}
  ids.forEach(id => { known[id] = true })

  Object.keys(CATEGORIES).forEach(category => {
    const tag = 'createsurvival_core:dense_mining/' + category
    CATEGORIES[category].forEach(entry => {
      if (entry instanceof RegExp) {
        ids.filter(id => entry.test(id)).forEach(id => event.add(tag, id))
      } else if (entry.startsWith('#')) {
        // (made empty if no mod has it: a reference to a missing tag would break the whole category)
        event.get(entry.substring(1))
        event.add(tag, entry)
      } else if (known[entry]) {
        event.add(tag, entry)
      }
    })
  })

  const masonry = ids.filter(id => {
    const path = id.substring(id.indexOf(':') + 1)
    return !NOT_BY_NAME.test(id) && MASONRY_NAME.test(path) && !NOT_MASONRY.test(path) && !LEFT_OUT.some(pattern => pattern.test(id))
  })
  const counts = {}
  masonry.forEach(id => {
    const path = id.substring(id.indexOf(':') + 1)
    const kind = MASONRY_KINDS.find(entry => entry[1].test(path))
    const category = kind ? kind[0] : 'masonry'
    event.add('createsurvival_core:dense_mining/' + category, id)
    counts[category] = (counts[category] || 0) + 1
  })
  console.info(`Terrain tags: other mods' decorative stone by category: ${JSON.stringify(counts)}`)
})
