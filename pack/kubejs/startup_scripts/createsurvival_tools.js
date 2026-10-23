// CreateSurvival: tool and armour stats. Startup script: changes need a full game restart.
//
// 1. Stone tools are as weak as wooden ones used to be (wooden tools can't be crafted, see server_scripts/createsurvival_recipes.js),
//    but keep stone's mining level, so iron ore still drops.
// 2. Iron-and-better tools, weapons and armour last much longer, since good enchantments are hard to get.
//    Items you already own get the new maximum too and keep their current damage.
//
// The numbers are in kubejs/config/createsurvival_tools.json (created with the defaults below on first start).

const CONFIG_FILE = 'kubejs/config/createsurvival_tools.json'
const DEFAULTS = {
  _comment: 'CreateSurvival tool settings. Changes need a full game restart.',
  durability_multipliers: {
    _comment: 'Multiplies the durability of tools, weapons and armour of each material. Modded items are sorted in by how durable they are compared to these. 1 = unchanged.',
    iron: 3,
    diamond: 6,
    netherite: 8
  },
  stone_tools: {
    _comment: 'Stone tool stats (vanilla stone: uses 131, speed 4.0, attack_damage_bonus 1; vanilla wood: 59, 2.0, 0). They keep stone\'s mining level.',
    enabled: true,
    uses: 59,
    speed: 2.0,
    attack_damage_bonus: 0
  }
}

// read the config, adding any missing settings (and writing them back so they show up in the file)
function loadConfig() {
  let config = null
  try {
    config = JsonIO.read(CONFIG_FILE)
  } catch (e) {
    console.warn(`[CreateSurvival] Could not read ${CONFIG_FILE}, using defaults: ${e}`)
  }
  let complete = config != null
  if (config == null) config = {}
  Object.keys(DEFAULTS).forEach(section => {
    if (typeof DEFAULTS[section] !== 'object') {
      if (config[section] == null) { config[section] = DEFAULTS[section]; complete = false }
      return
    }
    if (config[section] == null) { config[section] = {}; complete = false }
    Object.keys(DEFAULTS[section]).forEach(key => {
      if (config[section][key] == null) { config[section][key] = DEFAULTS[section][key]; complete = false }
    })
  })
  if (!complete) JsonIO.write(CONFIG_FILE, config)
  return config
}

const CONFIG = loadConfig()
const STONE_TOOLS = ['stone_pickaxe', 'stone_axe', 'stone_shovel', 'stone_hoe', 'stone_sword']
const DURABILITY_MULTIPLIER = CONFIG.durability_multipliers

const $BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
const $TieredItem = Java.loadClass('net.minecraft.world.item.TieredItem')
const $ArmorItem = Java.loadClass('net.minecraft.world.item.ArmorItem')

// tool tiers by uses: iron 250, diamond 1561, netherite 2031 (wood 59, stone 131, gold 32 are left alone)
function toolMultiplier(item) {
  const uses = item.getTier().getUses()
  if (uses >= 2031) return DURABILITY_MULTIPLIER.netherite
  if (uses >= 1561) return DURABILITY_MULTIPLIER.diamond
  if (uses >= 250) return DURABILITY_MULTIPLIER.iron
  return 1
}

// armour by material durability factor: iron and chainmail 15, turtle 25, diamond 33, netherite 37 (leather 5, gold 7 left alone)
function armorMultiplier(item, maxDamage) {
  const factor = maxDamage / item.getType().getDurability(1)
  if (factor >= 37) return DURABILITY_MULTIPLIER.netherite
  if (factor >= 33) return DURABILITY_MULTIPLIER.diamond
  if (factor >= 15) return DURABILITY_MULTIPLIER.iron
  return 1
}

ItemEvents.modification(event => {
  const stone = CONFIG.stone_tools
  if (stone.enabled) {
    STONE_TOOLS.forEach(name => {
      event.modify('minecraft:' + name, item => {
        item.setTier(tier => {
          tier.uses = stone.uses
          tier.speed = stone.speed
          tier.attackDamageBonus = stone.attack_damage_bonus
        })
      })
    })
  }

  let changed = 0
  $BuiltInRegistries.ITEM.forEach(item => {
    const maxDamage = item.getDefaultInstance().getMaxDamage()
    if (maxDamage <= 0) return
    let multiplier = 1
    if (item instanceof $TieredItem) multiplier = toolMultiplier(item)
    else if (item instanceof $ArmorItem) multiplier = armorMultiplier(item, maxDamage)
    if (multiplier <= 1) return
    event.modify($BuiltInRegistries.ITEM.getKey(item).toString(), modification => {
      modification.maxDamage = Math.round(maxDamage * multiplier)
    })
    changed++
  })
  console.info(`[CreateSurvival] Raised the durability of ${changed} tools, weapons and armour pieces`)
})
