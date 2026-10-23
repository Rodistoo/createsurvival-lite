# CreateSurvival Lite

A lighter version of the CreateSurvival modpack (Minecraft 1.21.1, NeoForge, Create Aeronautics), installed into
[Prism Launcher](https://prismlauncher.org) and kept up to date automatically.

## Playing

1. Install Prism Launcher (version 9 or newer), start it once and add your Minecraft account (Accounts, top right).
2. Download **[CreateSurvival-Lite-Installer.cmd](installer/CreateSurvival-Lite-Installer.cmd)** (Download raw file) and
   double-click it. If Windows warns about an unknown file: "More info" → "Run anyway".
3. Choose how much memory Minecraft gets (6-10 GB suits most PCs). The video settings start out on performance
   (short Distant Horizons range, no shaders); change them in the game as you like. Your options.txt (keys,
   video settings) is never touched by updates.
4. Open Prism Launcher, pick **CreateSurvival Lite** and press Launch. The first start downloads the whole pack
   (about 2000 files, a few minutes).

Every later start downloads only what changed in the pack. To change the memory, run the installer again (with Prism
Launcher closed). Your own settings (keys, video settings you changed) stay; the performance values are only set
again when a pack update replaces one of their files.

## Making a new version (pack author)

Change the `CreateSurvival Lite` Prism instance, close the game, then run `tools\publish.cmd`. It rebuilds `pack\`
from the instance and pushes it; players get it at their next start.

- Mods found on Modrinth or CurseForge are linked, not uploaded; only files that are on neither (our own mods) are in
  the repository. Disabled jars (`.disabled`) are left out, and of two versions of the same mod only the newer one.
- What the modes change: `createsurvival/presets.json`. The script that runs before every start:
  `createsurvival/sync.ps1`.
- Tools: `tools/build-pack.mjs` (Node 18+), `tools/bin/packwiz.exe` (packwiz, not in the repository).
