Editable models, textures and recipes for the pack's own mods
============================================================

Files for the two custom mods live here in the instance's kubejs folder:

  kubejs/assets/createsurvival_core/        and  kubejs/assets/createsurvival_mechanics/
      blockstates/      which model each block state uses
      models/block/     block models (Blockbench .json)
      models/item/      item models
      textures/block/   block textures (.png); item textures go in textures/item/
      lang/en_us.json   display names; start from a copy of the full file from the jar, because on build it
                        replaces the jar's file as a whole (keys missing here would be missing in the jar)

  kubejs/data/createsurvival_core/          and  kubejs/data/createsurvival_mechanics/
      recipe/*.json     crafting recipes (one file per recipe; the file name is the recipe id)
      loot_table/blocks/*.json, tags/...    any other data works the same way

Two ways they take effect:
- Live, while playing: KubeJS loads these folders on top of the mod jars. F3+T reloads assets (models, textures),
  /reload reloads data (recipes).
- On every build of a mod, everything in kubejs/assets/<mod id>/ and kubejs/data/<mod id>/ is packed into its jar
  and replaces the mod's own file with the same path. So the jar always ships what you made here, also without KubeJS.
  Rebuilding never overwrites or deletes anything in these folders.

Recipes for blocks of other mods (or vanilla) belong in kubejs/data/<that namespace>/ or in a KubeJS server script;
those are not packed into the custom mods.

createsurvival_core/        Claim Block (CreateSurvival Core)
  blockstates/claim_block.json
  models/block/claim_block.json      placeholder: a full cube using textures/block/claim_block.png
  models/item/claim_block.json       the item just shows the block model
  textures/block/claim_block.png     placeholder: copy of the iron block texture

createsurvival_mechanics/   Gantry Drive and Linear Slider (CreateSurvival Mechanics)
  blockstates/gantry_drive.json              the drive (the same block before and after assembly)
  models/block/gantry_drive/horizontal.json, vertical.json, item.json
                                             copies of Create's gantry carriage models (they use Create's textures)
  models/item/gantry_drive.json
  blockstates/linear_slider.json             the placeable slider (before assembly)
  blockstates/linear_drive_carriage.json     the slider's part on the physics object, inside the casing
  models/block/linear_slider(_rotated).json          "_rotated" is used for the sideways wall track (side=back)
  models/block/linear_drive_carriage(_rotated).json
  models/item/linear_slider.json
  textures/block/*.png               placeholders: copies of Linear Bearing's textures

Notes
- The blockstates choose a model per orientation. Keep the variant list and only change the model names if you add more
  models.
- The slider's carriage only has a small collision core (a physics joint keeps it in the casing), so its model can be any
  shape that looks right inside the casing. Its outline (what you click) matches Linear Bearing's moving part.
- The Gantry Drive's turning cogs are Create's own model (create:block/gantry_carriage/wheels), drawn in code. Changing
  them would need kubejs/assets/create/..., which also changes Create's own gantry carriages.
- All models are Blockbench models; open the .json files in Blockbench.

GeckoLib models (Blockbench "GeckoLib Animated Model") for ANY block, item or entity, no code needed
====================================================================================================
Put the files under kubejs/assets/<namespace>/, named after the block/item/entity id (<namespace>:<name>).
F3+T reloads them (a block's collision shape from its model only on a game restart).

  Blocks:   geo/block/<name>.geo.json          the model; the block's item uses it too
            textures/block/<name>.png
            animations/block/<name>.animation.json   optional; only blocks WITH a block entity animate
                                                      (plays the animation with "idle" in its name, else the first, looping)
            models/block/<name>.json            only "display" settings (hand, GUI, ground), parent "builtin/entity"
            models/item/<name>.json             { "parent": "<namespace>:block/<name>" }
  Items:    geo/item/<name>.geo.json + textures/item/<name>.png (+ animations/item/...) for an item of its own
            models/item/<name>.json             display settings

  Entities: geo/entity/<name>.geo.json
            textures/entity/<name>.png
            textures/entity/<name>_glowmask.png    optional: parts drawn glowing (non-transparent pixels)
            animations/entity/<name>.animation.json  optional, GeckoLib's standard animation names:
                misc.idle          standing (fallback for everything)
                move.walk          moving (fallback for run, sneak, swim, fly)
                move.run           sprinting          move.sneak   sneaking
                move.swim          moving in water    move.fly     flying      misc.idle.flying  hovering
                misc.sit           sitting (tamed)    misc.rest    sleeping    misc.die          dying (held)
                attack.strike      once per attack/swing (else attack.swing, attack.punch, attack.bite)
            A bone named "head" turns where the entity looks. Only the look changes (hitbox, behaviour stay),
            held items/armor aren't drawn. Players can't be replaced.

  Example:  minecraft/ geo/entity/creeper.geo.json, textures/entity/creeper(_glowmask).png,
            animations/entity/creeper.animation.json = Creeper Overhaul's plains creeper, drawing the vanilla creeper.
            Delete these four files to get the old look back.
