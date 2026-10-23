// CreateSurvival: the ore temples (kubejs/data/ore_temples) may stand in any biome. They are placed by the world layout
// only (frequency 0 in their structure sets), in open caves, and the cave biomes down there are any mod's (Core fills
// caves with them): a biome list would only keep them from the caves the layout found. /reload is enough for changes.
const ORE_TEMPLES = ['redstone', 'coal', 'iron', 'copper', 'gold', 'lapis', 'diamond', 'emerald', 'zinc']

ServerEvents.tags('worldgen/biome', event => {
  ORE_TEMPLES.forEach(ore => event.add('ore_temples:has_structure/' + ore + '_temple', /.*/))
})
