// CreateSurvival: the drops of the resource nodes (startup_scripts/createsurvival_resource_nodes.js has the list).
// Changes to the list need a restart; /reload is enough for changes here.

// ('last': after KubeJS's own loot table for its blocks, which only drops the block itself)
ServerEvents.generateData('last', event => {
  global.RESOURCE_NODES.forEach(node => {
    const count = node.count ?? [1, 1]
    const functions = [{ function: 'minecraft:set_count', count: { type: 'minecraft:uniform', min: count[0], max: count[1] } }]
    if (node.fortune !== false) {
      functions.push({ function: 'minecraft:apply_bonus', enchantment: 'minecraft:fortune', formula: 'minecraft:uniform_bonus_count',
        parameters: { bonusMultiplier: 1 } })
    }
    event.json('kubejs:loot_table/blocks/' + node.id, {
      type: 'minecraft:block',
      pools: [{ rolls: 1, entries: [{ type: 'minecraft:item', name: node.drop, functions: functions }] }],
      random_sequence: 'kubejs:blocks/' + node.id
    })
  })
})

