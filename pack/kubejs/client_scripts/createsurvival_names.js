// Every name the pack changes, in one place. Client script: F3+T (reload resource packs) applies changes.
// A name is changed by its translation key: 'item.<mod>.<item>', 'block.<mod>.<block>', 'entity.<mod>.<mob>', ...
// (a mod's keys and names are in its jar, assets/<mod>/lang/en_us.json).

// translation key -> new name
const NAMES = {
  // the vanilla furnace is CreateSurvival Core's clay furnace (createsurvival_clay_furnace.js)
  'block.minecraft.furnace': 'Clay Furnace',
  'container.furnace': 'Clay Furnace',
  // Ars Nouveau's Ignite glyph is the fire element of CreateSurvival Magic's spell mode
  'ars_nouveau.glyph_name.glyph_ignite': 'Fire',
  'ars_nouveau.glyph_desc.glyph_ignite': 'The fire element in spell mode: a stream of fire like a Create fan through fire (more fire: through lava), pillars of fire out of the ground (Underfoot, AOE, Wall), a fireball with Projectile (a ghast\'s with two), fire resistance with Self. In a spell book: sets blocks and mobs on fire for a short time.'
}

// Caverns & Chasms' copper armor is Heavy Copper armor (vanilla's copper armor is the light one), in every oxidation
// stage, waxed or not: item.caverns_and_chasms.waxed_weathered_copper_helmet -> Waxed Weathered Heavy Copper Helmet
const COPPER_STAGES = ['', 'exposed_', 'weathered_', 'oxidized_']
const WAXED = ['', 'waxed_']
const ARMOR_PIECES = ['helmet', 'chestplate', 'leggings', 'boots']
COPPER_STAGES.forEach(stage => WAXED.forEach(waxed => ARMOR_PIECES.forEach(piece => {
  const id = waxed + stage + 'copper_' + piece
  NAMES['item.caverns_and_chasms.' + id] = title(id.replace('copper_', 'heavy_copper_'))
})))

// 'waxed_weathered_heavy_copper_helmet' -> 'Waxed Weathered Heavy Copper Helmet'
function title(id) {
  return id.split('_').map(word => word.charAt(0).toUpperCase() + word.substring(1)).join(' ')
}

// The mod whose lang file has the key ('item.caverns_and_chasms.copper_helmet' -> caverns_and_chasms,
// 'ars_nouveau.glyph_name.glyph_ignite' -> ars_nouveau, 'container.furnace' -> minecraft): a new name only wins over the
// mod's own when it is put in that mod's lang file.
function namespaceOf(key) {
  const mod = key.split('.').find(part => Platform.isLoaded(part))
  return mod ? mod : 'minecraft'
}

ClientEvents.lang('en_us', event => {
  Object.keys(NAMES).forEach(key => event.add(namespaceOf(key), key, NAMES[key]))
})
