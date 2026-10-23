// CreateSurvival: dungeon keys and seals (startup_scripts/createsurvival_dungeons.js explains locks and guardians).
// /reload is enough for changes here.

const KEY = 'kubejs:dungeon_key'
const SEAL = 'kubejs:dungeon_seal'
// the most seal blocks one key opens (the connected wall it is part of)
const SEAL_BLOCKS = 256
// ticks between one layer of the wall crumbling and the next (outwards from the clicked block)
const CRUMBLE_TICKS = 3
const GUARDIAN = 'dungeon_guardian'

// a key's lock ('' for none)
function keyLock(stack) {
  return String(stack.customData.getString('lock'))
}

// the guardian's death: its key drops (dungeon_guardian.<lock>: with that lock)
EntityEvents.death(event => {
  const entity = event.entity
  let lock = null
  entity.tags.forEach(tag => {
    tag = String(tag)
    if (tag == GUARDIAN) lock = ''
    else if (tag.startsWith(GUARDIAN + '.')) lock = tag.substring(GUARDIAN.length + 1)
  })
  if (lock == null) return
  entity.block.popItem(Item.of(lock == '' ? KEY : `${KEY}[custom_data={lock:"${lock}"}]`))
})

// a seal right-clicked: with a fitting key (in either hand) the wall crumbles, else a hint; in creative, sneaking with a
// key sets the wall's lock to the key's
BlockEvents.rightClicked(event => {
  if (event.block.id != SEAL) return
  // (event.cancel() ends the handler, so it comes last)
  if (`${event.hand}` != 'MAIN_HAND') event.cancel() // one click, one try
  const player = event.player
  const level = event.level
  const wall = wallOf(level, event.block.pos)
  const keys = [player.mainHandItem, player.offhandItem].filter(stack => stack.id == KEY)
  // (no const/let inside blocks here: Rhino declares them for the whole handler, the second run fails)
  if (player.isCreative() && player.isShiftKeyDown() && keys.length > 0) {
    wall.blocks.forEach(pos => setLock(level, pos, ''))
    if (keyLock(keys[0]) != '') setLock(level, event.block.pos, keyLock(keys[0]))
    player.setStatusMessage(Text.gold(keyLock(keys[0]) == '' ? 'Seal unlocked: any Dungeon Key opens it.'
      : `Seal locked: only a "${keyLock(keys[0])}" key opens it.`))
    event.cancel()
  }
  const key = keys.find(stack => wall.lock == '' || keyLock(stack) == wall.lock)
  if (!key) {
    player.setStatusMessage(Text.gray((keys.length > 0 ? "This key doesn't fit. " : 'Sealed. ') + 'It needs '
      + (wall.lock == '' ? 'a Dungeon Key' : `a "${wall.lock}" Dungeon Key`) + '.'))
    event.cancel()
  }
  if (!player.isCreative()) key.shrink(1)
  crumble(level, event.server, event.block.pos, wall)
  event.cancel()
})

function lockAt(level, pos) {
  const entity = level.getBlockEntity(pos)
  return entity && entity.data ? String(entity.data.getString('lock')) : ''
}

function setLock(level, pos, lock) {
  const entity = level.getBlockEntity(pos)
  if (!entity || !entity.data) return
  if (lock == '') entity.data.remove('lock')
  else entity.data.putString('lock', lock)
  entity.setChanged()
}

// the connected wall around start (seal blocks face to face) in layers outwards, and its lock (any of its blocks')
function wallOf(level, start) {
  const seen = {}
  seen[start.x + ',' + start.y + ',' + start.z] = true
  // (Rhino can't declare a const inside a loop: the loop only uses variables declared before it)
  const layers = [[start]], blocks = [start]
  let next
  while (layers[layers.length - 1].length > 0) {
    next = []
    layers[layers.length - 1].forEach(pos => [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].forEach(d => {
      const at = pos.offset(d[0], d[1], d[2])
      const id = at.x + ',' + at.y + ',' + at.z
      if (seen[id] || blocks.length >= SEAL_BLOCKS || level.getBlock(at).id != SEAL) return
      seen[id] = true
      blocks.push(at)
      next.push(at)
    }))
    layers.push(next)
  }
  const locked = blocks.map(pos => lockAt(level, pos)).find(lock => lock != '')
  return { layers: layers, blocks: blocks, lock: locked ? locked : '' }
}

function crumble(level, server, start, wall) {
  server.runCommandSilent(`playsound minecraft:block.vault.open_shutter block @a ${start.x} ${start.y} ${start.z} 1 0.6`)
  wall.layers.forEach((layer, i) => server.scheduleInTicks(i * CRUMBLE_TICKS, () => layer.forEach(pos => {
    if (level.getBlock(pos).id == SEAL) level.destroyBlock(pos, false)
  })))
}
