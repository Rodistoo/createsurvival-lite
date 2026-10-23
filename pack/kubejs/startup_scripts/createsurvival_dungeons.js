// CreateSurvival: dungeon keys and seals, one of each for every dungeon.
// A seal is a wall of unbreakable Dungeon Seal blocks across a dungeon's way in. Right-clicked with a Dungeon Key, the
// whole connected wall crumbles away and the key is used up. The key drops from the dungeon's guardian.
// Server side: server_scripts/createsurvival_dungeons.js; the key's tooltip: client_scripts/createsurvival_dungeons.js.
// Startup script: changes need a full game restart.
//
// Locks (optional): a key with a lock only opens seals with the same lock; a seal wall without one opens with any key.
//  - a key's lock is its custom data:  /give @p kubejs:dungeon_key[custom_data={lock:"redstone"}]
//  - a seal wall's lock: in creative, sneak-right-click the wall with a key that has the lock (a key without one clears
//    it); one block of the wall carrying it is enough (it is the seal's block entity data: {data:{lock:"redstone"}})
//
// Guardian: a mob with the entity tag dungeon_guardian drops a key without a lock, dungeon_guardian.<lock> one with that
// lock. Before capturing the structure (structure save ... entities=true), look at the mob and run e.g.
//   /tag @e[type=mowziesmobs:ferrous_wroughtnaut,sort=nearest,limit=1] add dungeon_guardian
//   /data merge entity @e[type=mowziesmobs:ferrous_wroughtnaut,sort=nearest,limit=1] {PersistenceRequired:1b}
// (tags, persistence and the seals' locks are saved with the structure).

StartupEvents.registry('item', event => {
  event.create('dungeon_key')
    .displayName('Dungeon Key')
    .unstackable()
    .rarity('rare')
    .fireResistant() // a key dropped into lava isn't lost
})

StartupEvents.registry('block', event => {
  event.create('dungeon_seal')
    .displayName('Dungeon Seal')
    .unbreakable() // also: pistons and contraptions can't move it
    .noDrops()
    .lightLevel(7 / 15)
    .soundType(Java.loadClass('net.minecraft.world.level.block.SoundType').DEEPSLATE_TILES)
    .blockEntity(info => {}) // holds its lock (data.lock)
})
