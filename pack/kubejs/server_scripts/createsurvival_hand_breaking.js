// Which blocks can be broken by hand (Never Punching Trees).
//
// Without a tool (anything in the item tag #c:tools) only the blocks in BREAKABLE_BY_HAND can be broken; every other
// block needs a tool. Blocks that break instantly (flowers, grass, saplings, torches, ...) can always be broken by
// hand as long as "allways allow insta-break" is true in config/neverpunchingtrees-common.toml.
//
// Entries are block ids ('minecraft:gravel') or block tags ('#minecraft:dirt'). NOT_BREAKABLE_BY_HAND takes blocks
// out again that a tag in the first list brings in. This list replaces Never Punching Trees' own list completely.
// After a change: /reload

const BREAKABLE_BY_HAND = [
  // Never Punching Trees' defaults
  '#minecraft:dirt', '#minecraft:sand', '#minecraft:leaves', '#minecraft:torches', '#c:sands', '#c:gravels', 

  //other terrain blocks
  'minecraft:mud',
  'minecraft:snow',
  //other miscelanious blocks
  'supplementaries:urn',
  'supplementaries:sack',
  'gravestone:gravestone',
  'supplementaries:ash',
  // blocks of bytes of several materials (CreateSurvival Core): mining speed and drops follow the byte you aim at,
  // so a stone byte in it still wants a pickaxe
  'createsurvival_core:mixed_bytes',
  // bytes of the terrain blocks above (dug a byte at a time by hand: createsurvival_digging.js)
  'createsurvival_core:bytes/minecraft/dirt', 'createsurvival_core:bytes/minecraft/coarse_dirt',
  'createsurvival_core:bytes/minecraft/rooted_dirt', 'createsurvival_core:bytes/minecraft/podzol',
  'createsurvival_core:bytes/minecraft/mycelium', 'createsurvival_core:bytes/minecraft/grass_block',
  'createsurvival_core:bytes/minecraft/sand', 'createsurvival_core:bytes/minecraft/red_sand',
  'createsurvival_core:bytes/minecraft/gravel', 'createsurvival_core:bytes/minecraft/clay',

  //Tags
  '#minecraft:enderman_holdable'
]

const NOT_BREAKABLE_BY_HAND = [
  // Never Punching Trees' defaults: in #minecraft:dirt, but need a tool
  'minecraft:moss_block', 'minecraft:muddy_mangrove_roots'
]

ServerEvents.tags('block', event => {
  const TAG = 'neverpunchingtrees:breakable'
  const excluded = {}
  NOT_BREAKABLE_BY_HAND.forEach(id => { excluded[id] = true })
  // tags are expanded into their blocks first: removing a block that only comes in through a tag doesn't work otherwise
  const ids = {}
  BREAKABLE_BY_HAND.forEach(entry => {
    if (entry.startsWith('#')) {
      event.get(entry.substring(1)).getObjectIds().forEach(id => { ids[String(id)] = true })
    } else {
      ids[entry] = true
    }
  })
  event.removeAll(TAG)
  Object.keys(ids).forEach(id => {
    if (!excluded[id]) {
      event.add(TAG, id)
    }
  })
})
