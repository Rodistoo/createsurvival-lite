// Clay furnace (CreateSurvival Core): the vanilla furnace is a primitive clay furnace. It only smelts the items in
// CLAY_FURNACE_SMELTABLE below; nothing else goes into it (by hand, hopper or funnel). Everything else is smelted with
// Create's fans (bulk blasting) or the blast furnace, which aren't affected. Name: kubejs/client_scripts/createsurvival_names.js,
// textures: kubejs/assets/minecraft/textures/block/furnace_*.png.
// Entries are item ids ('minecraft:raw_iron') or item tags ('#c:ores/iron'). After a change: /reload
// Its recipe (clay balls; no other furnace recipes): createsurvival_recipes.js

const CLAY_FURNACE_SMELTABLE = [
  '#c:raw_materials/iron', '#c:raw_materials/copper',
  '#c:ores/iron', '#c:ores/copper',
  'create:crushed_raw_iron', 'create:crushed_raw_copper', 
  '#minecraft:logs'
]

ServerEvents.tags('item', event => {
  event.removeAll('createsurvival_core:clay_furnace_smeltable')
  event.add('createsurvival_core:clay_furnace_smeltable', CLAY_FURNACE_SMELTABLE)
})
