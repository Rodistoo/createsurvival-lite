// What a player starts with: given once, the first time they join a world. After a change: /reload (players who
// joined before keep what they got).
// item: an item id ('2x minecraft:bread' for more than one); curios: put into that Curios slot (back, belt, hands, ...)
// instead of the inventory, if one is free.

const STARTING_ITEMS = [
  { item: 'createsurvival_core:block_bag', curios: 'back' }
]

// (a player stage: set once they got their items)
const STARTED = 'createsurvival_started'
const $CuriosApi = Platform.isLoaded('curios') ? Java.loadClass('top.theillusivec4.curios.api.CuriosApi') : null

// puts the item into a free slot of the Curios slot type; whether it did
function wear(player, slot, stack) {
  if ($CuriosApi == null) return false
  const curios = $CuriosApi.getCuriosInventory(player)
  if (!curios.isPresent()) return false
  const handler = curios.get().getStacksHandler(slot)
  if (!handler.isPresent()) return false
  const stacks = handler.get().getStacks()
  for (let i = 0; i < stacks.getSlots(); i++) {
    if (stacks.getStackInSlot(i).isEmpty()) {
      stacks.setStackInSlot(i, stack)
      return true
    }
  }
  return false
}

PlayerEvents.loggedIn(event => {
  const player = event.player
  if (player.stages.has(STARTED)) return
  player.stages.add(STARTED)
  // (items of a feature switched off in config/createsurvival_core-features.toml aren't there)
  const known = {}
  Item.getTypeList().forEach(id => { known[String(id)] = true })
  STARTING_ITEMS.forEach(entry => {
    if (!known[entry.item.replace(/^\d+x /, '')]) return
    const stack = Item.of(entry.item)
    if (stack.isEmpty()) return
    if (entry.curios && wear(player, entry.curios, stack)) return
    player.give(stack)
  })
})
