# CreateSurvival Lite server

`createsurvival-server-starter.jar` is the server's jar. Every start, it updates the server from the published pack and
then starts NeoForge. The server always runs what players get, without client-only mods.

## Setting it up (once)

1. Stop the server.
2. Upload `createsurvival-server-starter.jar` into the server's main folder (where `server.properties` is).
3. In the host's settings, set the **Server Jar File** to `createsurvival-server-starter.jar`. On Kinetic, that is
   Settings → Server Jar File.
4. Start the server.
   - The first start moves the old `mods` folder to `mods-before-sync-<date>`, downloads the pack's mods and installs
     the pack's NeoForge version if needed. This takes a few minutes.
   - It also writes `createsurvival-server.properties`.

After that, every restart picks up a new pack version: publish with `tools\publish.cmd`, then restart the server.
If GitHub can't be reached, the server starts with what it already has.

## createsurvival-server.properties

- `packUrl`: the pack the server follows.
- `keep`: files and folders the server keeps as they are, whatever the pack has, separated by commas. The default is
  Distant Horizons' and Chunksmith's configs, because the server is set up differently there than players, and the
  CreateSurvival server configs (`createsurvival_core-server.toml`, `createsurvival_mechanics-server.toml`,
  `createsurvival_magic-server.toml`), so what you set on the server stays.
  Add a config here if you change it on the server and want to keep that change. Only server configs (`-server.toml`)
  and configs that only the server uses belong here: players get the server's server configs when they join.
  Startup configs like `createsurvival_core-startup.toml` or the `-features.toml` files decide which blocks and recipes
  exist, so the server and the players need the same ones: those come from the pack.
  The defaults are only written when the file is created; on a server set up before, add the new entries yourself.

## How it works

- Updates are done by packwiz-installer with `-s server`. Mods marked `side = "client"` in the pack are skipped:
  `tools/build-pack.mjs` marks the ones that say they are client-only, the ones that require one of those, and the ones
  in its `CLIENT_ONLY_MODS` list (client mods that don't say so and crash a server).
  If the server fails to start with "invalid dist DEDICATED_SERVER" or a missing `net/minecraft/client` class, that
  mod belongs on that list.
- The server is started as its own process with the host's Java options (memory) and the console passed through.
- Source: `server/starter/CreateSurvivalServerStarter.java`. Build it with `tools\build-starter.cmd`.
