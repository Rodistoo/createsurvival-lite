// Falling blocks: InsaneLib (needed by Enhanced AI) replaces the whole falling block logic with its own "Better falling
// blocks" (bouncing, stacking), and that feature can't be turned off in its config. Simple Block Physics decides how a
// falling block lands (break, or slide off to a lower spot beside it); with InsaneLib's version that never happened, so
// a collapsing tower just landed back on itself and stood forever.
// InsaneLib leaves blocks in this tag alone, so every block goes in - except ids with a '/' in the name: PuzzlesLib mods
// (Easy Anvils) have replacement blocks named like easyanvils:minecraft/anvil that copy the tags of the block they
// replace and refuse to load the world if they already have tags of their own. After a change: /reload
ServerEvents.tags('block', event => {
  event.add('insanelib:blacklisted_better_falling_blocks', /^[^:]+:[^\/]+$/)
})
