// CreateSurvival: Create's wrench on Tom's Simple Storage blocks, as on Create's own. /reload is enough for changes here.
//
// Sneak-right-click picks the block up into the inventory (Create's wrench does that for create:wrench_pickup; a filing
// cabinet's contents drop, as when it is broken). Right-click turns it:
// - blocks that can face every way (connectors, hoppers, proxies, crates, level emitters) turn around the clicked face,
//   clicking the face they point along (or its back) turns them around;
// - terminals and the filing cabinet turn round on a side click; terminals tilt up, level and down on a top or bottom click.
// Cables and connectors connect anew afterwards.

const WRENCH = 'create:wrench'
const WRENCHABLE = /^toms_storage:/
const $Direction = Java.loadClass('net.minecraft.core.Direction')
const $Block = Java.loadClass('net.minecraft.world.level.block.Block')
const $AllSoundEvents = Java.loadClass('com.simibubi.create.AllSoundEvents')

ServerEvents.tags('block', event => {
  event.add('create:wrench_pickup', WRENCHABLE)
})

BlockEvents.rightClicked(event => {
  if (`${event.hand}` != 'MAIN_HAND' || event.item.id != WRENCH || !WRENCHABLE.test(event.block.id)) return
  const player = event.player
  // sneaking: Create's wrench picks it up
  if (player.isShiftKeyDown() || !player.mayBuild()) return
  const level = event.level
  const pos = event.block.pos
  const turned = wrenchTurn(level.getBlockState(pos), event.facing)
  if (turned == null) return
  level.setBlock(pos, $Block.updateFromNeighbourShapes(turned, level, pos), 3)
  $AllSoundEvents.WRENCH_ROTATE.playOnServer(level, pos, 1, 1)
  // (instead of opening the terminal)
  event.cancel()
})

// the block state turned by a wrench click on face (a Direction), or null: it doesn't turn
function wrenchTurn(state, face) {
  var facing = blockProperty(state, 'facing')
  if (facing == null) return null
  var now = state.getValue(facing)
  if (!facing.getPossibleValues().contains($Direction.UP)) {
    var tilt = blockProperty(state, 'pos')
    if (tilt != null && `${face.getAxis()}` == 'y') return state.cycle(tilt)
    return state.setValue(facing, now.getClockWise())
  }
  if (`${now.getAxis()}` == `${face.getAxis()}`) return state.setValue(facing, now.getOpposite())
  return state.setValue(facing, now.getClockWise(face.getAxis()))
}

function blockProperty(state, name) {
  var found = null
  state.getProperties().forEach(property => {
    if (`${property.getName()}` == name) found = property
  })
  return found
}
