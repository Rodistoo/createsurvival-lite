// CreateSurvival: the dungeon key's tooltip shows its lock (startup_scripts/createsurvival_dungeons.js explains locks).
// Client script: F3+T (reload resource packs) applies changes.

ItemEvents.modifyTooltips(event => {
  event.modify('kubejs:dungeon_key', tooltip => tooltip.dynamic('dungeon_key'))
  event.add('kubejs:dungeon_seal', [Text.gray('Opens with a Dungeon Key')])
})

ItemEvents.dynamicTooltips('dungeon_key', event => {
  const lock = String(event.item.customData.getString('lock'))
  event.add([Text.gray(lock == '' ? 'Opens seals without a lock' : `Opens "${lock}" seals and ones without a lock`)])
})
