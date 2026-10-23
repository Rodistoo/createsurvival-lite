# 32x honeycomb for 3x diamond (Figerle) at 318 68 -1763 | stock 1690, uncollected earnings 0
execute unless loaded 318 68 -1763 run return run tellraw @s [{"text":"[Shop 01] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 32x honeycomb for 3x diamond (Figerle) at 318 68 -1763","color":"red"}]
execute if block 318 68 -1763 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 01] ","color":"gray"},{"text":"already converted: 32x honeycomb for 3x diamond (Figerle) at 318 68 -1763","color":"yellow"}]
execute unless block 318 68 -1763 #minecraft:air run return run tellraw @s [{"text":"[Shop 01] ","color":"gray"},{"text":"block is not empty, skipped: 32x honeycomb for 3x diamond (Figerle) at 318 68 -1763","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=318.5,y=68.06875,z=-1762.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 01] ","color":"gray"},{"text":"old shop not found, skipped: 32x honeycomb for 3x diamond (Figerle) at 318 68 -1763","color":"red"}]
setblock 318 68 -1763 shoppy:bartering_station[facing=west]{SaleItem:{id:"minecraft:honeycomb",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;32,0,0],CostCounts:[I;3,0,0],SaleItemCount:1690,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;716724703,48188707,-1075289606,-687629103]}
kill @e[tag=playershop,x=318.5,y=68.06875,z=-1762.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 01] ","color":"gray"},{"text":"converted: 32x honeycomb for 3x diamond (Figerle) at 318 68 -1763","color":"green"}]
