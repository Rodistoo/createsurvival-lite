// CreateSurvival: no nether portals. Lighting an obsidian frame does nothing (the fire just burns); the nether is
// reached by digging down below the overworld instead. End portals aren't affected.
// Startup script: changes need a full game restart.

const NETHER_PORTALS = false

const $PortalSpawnEvent = Java.loadClass('net.neoforged.neoforge.event.level.BlockEvent$PortalSpawnEvent')

NativeEvents.onEvent($PortalSpawnEvent, event => {
  if (!NETHER_PORTALS) event.setCanceled(true)
})
