# 64x cooked_chicken for 10x gold_ingot (Snaker_15) at 320 69 -1745 | stock 1600, uncollected earnings 10
execute unless loaded 320 69 -1745 run return run tellraw @s [{"text":"[Shop 07] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 64x cooked_chicken for 10x gold_ingot (Snaker_15) at 320 69 -1745","color":"red"}]
execute if block 320 69 -1745 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 07] ","color":"gray"},{"text":"already converted: 64x cooked_chicken for 10x gold_ingot (Snaker_15) at 320 69 -1745","color":"yellow"}]
execute unless block 320 69 -1745 #minecraft:air run return run tellraw @s [{"text":"[Shop 07] ","color":"gray"},{"text":"block is not empty, skipped: 64x cooked_chicken for 10x gold_ingot (Snaker_15) at 320 69 -1745","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=320.5,y=69.06875,z=-1744.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 07] ","color":"gray"},{"text":"old shop not found, skipped: 64x cooked_chicken for 10x gold_ingot (Snaker_15) at 320 69 -1745","color":"red"}]
setblock 320 69 -1745 shoppy:bartering_station[facing=west]{SaleItem:{id:"minecraft:cooked_chicken",count:1},Currency:{id:"minecraft:gold_ingot",count:1},SaleCounts:[I;64,0,0],CostCounts:[I;10,0,0],SaleItemCount:1600,CurrencyItemCount:10,AllowInsert:1b,AllowExtract:0b,Owner:[I;-1942055298,-1257615689,-1685052035,1056175112]}
kill @e[tag=playershop,x=320.5,y=69.06875,z=-1744.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 07] ","color":"gray"},{"text":"converted: 64x cooked_chicken for 10x gold_ingot (Snaker_15) at 320 69 -1745","color":"green"}]
