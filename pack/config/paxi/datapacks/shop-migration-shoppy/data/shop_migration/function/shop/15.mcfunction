# 64x red_sand for 4x gold_block (Snaker_15) at 319 69 -1722 | stock 896, uncollected earnings 0
execute unless loaded 319 69 -1722 run return run tellraw @s [{"text":"[Shop 15] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 64x red_sand for 4x gold_block (Snaker_15) at 319 69 -1722","color":"red"}]
execute if block 319 69 -1722 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 15] ","color":"gray"},{"text":"already converted: 64x red_sand for 4x gold_block (Snaker_15) at 319 69 -1722","color":"yellow"}]
execute unless block 319 69 -1722 #minecraft:air run return run tellraw @s [{"text":"[Shop 15] ","color":"gray"},{"text":"block is not empty, skipped: 64x red_sand for 4x gold_block (Snaker_15) at 319 69 -1722","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=319.5,y=69.06875,z=-1721.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 15] ","color":"gray"},{"text":"old shop not found, skipped: 64x red_sand for 4x gold_block (Snaker_15) at 319 69 -1722","color":"red"}]
setblock 319 69 -1722 shoppy:bartering_station[facing=north]{SaleItem:{id:"minecraft:red_sand",count:1},Currency:{id:"minecraft:gold_block",count:1},SaleCounts:[I;64,0,0],CostCounts:[I;4,0,0],SaleItemCount:896,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;-1942055298,-1257615689,-1685052035,1056175112]}
kill @e[tag=playershop,x=319.5,y=69.06875,z=-1721.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 15] ","color":"gray"},{"text":"converted: 64x red_sand for 4x gold_block (Snaker_15) at 319 69 -1722","color":"green"}]
