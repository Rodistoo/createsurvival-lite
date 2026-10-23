// Visit the wiki for more info - https://kubejs.com/
console.info('Hello, World! (Loaded client example script)')


// CreateSurvival Lite: hide the blocks CreateSurvival Mechanics replaces (no recipes, see server_scripts/createsurvival_recipes.js)
RecipeViewerEvents.removeEntriesCompletely('item', event => {
  ;['create:mechanical_piston', 'create:sticky_mechanical_piston', 'create:gantry_carriage', 'create:rope_pulley', 'create:cart_assembler',
    'linearbearing:linear_bearing', 'createthrusters:physics_gantry_shaft', 'createthrusters:physics_gantry_carriage',
    'createthrusters:physics_gantry_belt_wheel', 'createthrusters:physics_staff'].forEach(id => event.remove(id))
})

// Caverns & Chasms' copper tools and armour (every weathering stage, waxed or not): no recipes, Vanilla Backport has the
// vanilla ones (see server_scripts/createsurvival_recipes.js)
RecipeViewerEvents.removeEntriesCompletely('item', event => {
  ;['', 'exposed_', 'weathered_', 'oxidized_'].forEach(stage => {
    ;['', 'waxed_'].forEach(waxed => {
      ;['pickaxe', 'axe', 'shovel', 'hoe', 'sword', 'helmet', 'chestplate', 'leggings', 'boots']
        .forEach(piece => event.remove('caverns_and_chasms:' + waxed + stage + 'copper_' + piece))
    })
  })
})
