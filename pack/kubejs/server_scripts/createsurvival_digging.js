// Terrain is dug a bit at a time without a shovel.
// Full terrain blocks (dirt, grass, sand, gravel, ...): breaking one by hand takes out the corner you aim at as a byte
// (CreateSurvival Core bytes, an eighth of the block) and drops it; grassy blocks drop a dirt byte, like the full
// blocks drop dirt. Blocks of bytes break one byte at a time anyway.
// A shovel (and machines, explosions, ...) removes the whole block with its normal drops.

// full blocks dug in bytes: block -> the byte material that drops
const DUG_IN_BYTES = {
  'minecraft:dirt': 'minecraft:dirt',
  'minecraft:coarse_dirt': 'minecraft:coarse_dirt',
  'minecraft:rooted_dirt': 'minecraft:rooted_dirt',
  'minecraft:podzol': 'minecraft:dirt',
  'minecraft:mycelium': 'minecraft:dirt',
  'minecraft:grass_block': 'minecraft:dirt',
  'minecraft:sand': 'minecraft:sand',
  'minecraft:red_sand': 'minecraft:red_sand',
  'minecraft:gravel': 'minecraft:gravel',
  'minecraft:clay': 'minecraft:clay',
  'minecraft:mud': 'minecraft:mud'
}
const $Bytes = Java.loadClass('createsurvival.core.bytes.Bytes')
const $ByteAiming = Java.loadClass('createsurvival.core.bytes.ByteAiming')
const $ByteBlock = Java.loadClass('createsurvival.core.bytes.ByteBlock')
const EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')

function isShovel(stack) {
  return stack.hasTag('minecraft:shovels') || stack.hasTag('c:tools/shovel') || stack.hasTag('c:tools/shovels')
}

BlockEvents.broken(event => {
  const player = event.player
  if (player.isCreative()) return
  const block = event.block
  const id = String(block.blockState.id)
  const tool = player.mainHandItem
  if (isShovel(tool)) return

  const byteMaterial = DUG_IN_BYTES[id]
  if (!byteMaterial) return
  const level = event.level
  const state = block.blockState
  const part = $ByteAiming.part(state, block.pos, player)
  if (part < 0) return
  // the block of the remaining seven bytes (or the block itself, if it has no bytes)
  if ($Bytes.removePart(level, block.pos, state, part) == null) return
  // out of the corner the byte left (not the block center, inside the bytes still there: that flings it away)
  $Bytes.dropFrom(level, block.pos, $ByteBlock.box(part), Item.of('createsurvival_core:bytes/' + byteMaterial.replace(':', '/')))
  tool.hurtAndBreak(1, player, EquipmentSlot.MAINHAND)
  player.causeFoodExhaustion(0.005)
  event.cancel()
})

// which blocks can be broken by hand: createsurvival_hand_breaking.js
