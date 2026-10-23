// CreateSurvival: game rules every world gets, set each time a world loads (so /gamerule changes last only until the
// next load; change them here instead). Any game rule works: name -> value. After a change: leave and load the world again.
// doInsomnia false: no phantoms. doTraderSpawning true: wandering traders (the Lite pack has villagers).

const GAME_RULES = {
  doInsomnia: false,
  doTraderSpawning: true
}

ServerEvents.loaded(event => {
  Object.keys(GAME_RULES).forEach(rule => event.server.runCommandSilent(`gamerule ${rule} ${GAME_RULES[rule]}`))
})
