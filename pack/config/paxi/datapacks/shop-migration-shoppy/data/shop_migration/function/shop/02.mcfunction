# 1x heart_of_the_sea for 1x test_block (you (no owner on record)) at 323 68 -1774 | stock 1, uncollected earnings 1
execute unless loaded 323 68 -1774 run return run tellraw @s [{"text":"[Shop 02] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 1x heart_of_the_sea for 1x test_block (you (no owner on record)) at 323 68 -1774","color":"red"}]
execute if block 323 68 -1774 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 02] ","color":"gray"},{"text":"already converted: 1x heart_of_the_sea for 1x test_block (you (no owner on record)) at 323 68 -1774","color":"yellow"}]
execute unless block 323 68 -1774 #minecraft:air run return run tellraw @s [{"text":"[Shop 02] ","color":"gray"},{"text":"block is not empty, skipped: 1x heart_of_the_sea for 1x test_block (you (no owner on record)) at 323 68 -1774","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=323.5,y=68.06875,z=-1773.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 02] ","color":"gray"},{"text":"old shop not found, skipped: 1x heart_of_the_sea for 1x test_block (you (no owner on record)) at 323 68 -1774","color":"red"}]
setblock 323 68 -1774 shoppy:bartering_station[facing=west]{SaleItem:{id:"minecraft:heart_of_the_sea",count:1},SaleCounts:[I;1,0,0],CostCounts:[I;0,0,0],SaleItemCount:1,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b}
data modify block 323 68 -1774 Owner set from entity @s UUID
kill @e[tag=playershop,x=323.5,y=68.06875,z=-1773.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 02] ","color":"gray"},{"text":"converted: 1x heart_of_the_sea for 1x test_block (you (no owner on record)) at 323 68 -1774 - set a new price in the shop UI","color":"green"}]
