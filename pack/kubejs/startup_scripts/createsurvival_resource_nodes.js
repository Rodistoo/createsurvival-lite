// CreateSurvival: resource nodes, blocks that are never used up (for structures, e.g. a redstone cluster in a cave).
// Mined by a player, a drill or a saw they drop their resource and stay. Core does this for every block in the block tag
// createsurvival_core:infinite_blocks; this script makes such blocks.
// Startup script: changes need a full game restart.
//
// One entry per node. Each gets:
//  - the block and its item kubejs:<id>, named <name>;
//  - its texture: kubejs/assets/kubejs/textures/block/<id>.png (or `texture`, any block texture id);
//  - its drop (createsurvival_resource_nodes.js in server_scripts makes the loot table from this list).
// Fields:
//  id, name         the block's id (kubejs:<id>) and name
//  drop             the item it gives, count: [min, max] of it (Fortune adds like on ores, unless fortune: false)
//  tool             the pickaxe tier it needs: 'stone', 'iron' or 'diamond' (none: any pickaxe)
//  hardness         how long it takes to mine (stone 1.5, ores 3, deepslate ores 4.5)
//  light            light it gives, 0 to 15 (optional)
//  sound            'stone', 'deepslate', 'amethyst', 'metal', ... (a SoundType field name, lower case; default stone)
//  texture          a block texture id instead of the png above (optional, e.g. 'minecraft:block/redstone_block')
// No experience: a node that never runs out would be an experience farm too.

global.RESOURCE_NODES = [
  { id: 'redstone_cluster', name: 'Redstone Cluster', drop: 'minecraft:redstone', count: [2, 4], tool: 'iron', hardness: 4.5,
    light: 5, sound: 'deepslate' },
  // (the ore temples' others: about half of what the ore itself drops, Fortune on top)
  { id: 'coal_cluster', name: 'Coal Cluster', drop: 'minecraft:coal', count: [1, 2], hardness: 4.5, sound: 'deepslate' },
  { id: 'iron_cluster', name: 'Iron Cluster', drop: 'minecraft:raw_iron', count: [1, 1], tool: 'stone', hardness: 4.5, sound: 'deepslate' },
  { id: 'copper_cluster', name: 'Copper Cluster', drop: 'minecraft:raw_copper', count: [1, 3], tool: 'stone', hardness: 4.5, sound: 'deepslate' },
  { id: 'gold_cluster', name: 'Gold Cluster', drop: 'minecraft:raw_gold', count: [1, 1], tool: 'iron', hardness: 4.5, sound: 'deepslate' },
  { id: 'lapis_cluster', name: 'Lapis Cluster', drop: 'minecraft:lapis_lazuli', count: [2, 5], tool: 'stone', hardness: 4.5, sound: 'deepslate' },
  { id: 'diamond_cluster', name: 'Diamond Cluster', drop: 'minecraft:diamond', count: [1, 1], tool: 'iron', hardness: 4.5, sound: 'deepslate' },
  { id: 'emerald_cluster', name: 'Emerald Cluster', drop: 'minecraft:emerald', count: [1, 1], tool: 'iron', hardness: 4.5, sound: 'deepslate' },
  { id: 'zinc_cluster', name: 'Zinc Cluster', drop: 'create:raw_zinc', count: [1, 1], tool: 'stone', hardness: 4.5, sound: 'deepslate' }
]

const $SoundType = Java.loadClass('net.minecraft.world.level.block.SoundType')

StartupEvents.registry('block', event => {
  global.RESOURCE_NODES.forEach(node => {
    const block = event.create(node.id)
      .displayName(node.name)
      .hardness(node.hardness ?? 3)
      .resistance(1200) // explosions don't take them away (pistons and contraptions can't move them: Core)
      .requiresTool(true)
      .soundType($SoundType[(node.sound ?? 'stone').toUpperCase()])
      .tagBlock('minecraft:mineable/pickaxe')
      .tagBlock('createsurvival_core:infinite_blocks')
    if (node.tool) block.tagBlock('minecraft:needs_' + node.tool + '_tool')
    if (node.light) block.lightLevel(node.light / 15)
    if (node.texture) block.texture(node.texture)
  })
})
