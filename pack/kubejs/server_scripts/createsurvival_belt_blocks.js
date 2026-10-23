// Which items count as blocks for the block bag and the build hammer (CreateSurvival Core).
//
// By default every block with a collision box counts (stone, planks, chests, fences, slabs, ...); blocks you can walk
// through (flowers, torches, rails, ...) don't. A block counts: it has to sit in the inventory with a bag slot for it,
// and it is only placed with the build hammer worn.
//
// BELT_BLOCKS adds items that count anyway; NOT_BELT_BLOCKS takes items out (and wins over BELT_BLOCKS).
// Entries are item ids ('minecraft:scaffolding'), item tags ('#minecraft:wool') or regexes (/^chipped:.*/).
//
// Stack sizes are set at startup, before tags exist: they still follow the collision box. For items moved in or out
// here, set their stack size with stackSizes in config/createsurvival_core-startup.toml.
// After a change: /reload

const BELT_BLOCKS = [
  // 'minecraft:torch',
]

const NOT_BELT_BLOCKS = [
  // 'minecraft:scaffolding',
  // '#minecraft:beds',
    'supplementaries:ash',
    // cart assemblers go onto rails like rails do
    'create:cart_assembler',
    'createsurvival_mechanics:physics_cart_assembler',
    //misc
    'spawn:sunstone'
]

ServerEvents.tags('item', event => {
  BELT_BLOCKS.forEach(entry => event.add('createsurvival_core:belt_blocks', entry))
  NOT_BELT_BLOCKS.forEach(entry => event.add('createsurvival_core:not_belt_blocks', entry))
})
