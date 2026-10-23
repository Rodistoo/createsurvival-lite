# 64x sandstone for 1x diamond (zoisterus) at 338 69 -1747 | stock 13, uncollected earnings 0
execute unless loaded 338 69 -1747 run return run tellraw @s [{"text":"[Shop 11] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 64x sandstone for 1x diamond (zoisterus) at 338 69 -1747","color":"red"}]
execute if block 338 69 -1747 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 11] ","color":"gray"},{"text":"already converted: 64x sandstone for 1x diamond (zoisterus) at 338 69 -1747","color":"yellow"}]
execute unless block 338 69 -1747 #minecraft:air run return run tellraw @s [{"text":"[Shop 11] ","color":"gray"},{"text":"block is not empty, skipped: 64x sandstone for 1x diamond (zoisterus) at 338 69 -1747","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=338.5,y=69.06875,z=-1746.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 11] ","color":"gray"},{"text":"old shop not found, skipped: 64x sandstone for 1x diamond (zoisterus) at 338 69 -1747","color":"red"}]
setblock 338 69 -1747 shoppy:bartering_station[facing=east]{SaleItem:{id:"minecraft:sandstone",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;64,0,0],CostCounts:[I;1,0,0],SaleItemCount:13,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;1799740156,762071018,-1606720754,-567510422]}
kill @e[tag=playershop,x=338.5,y=69.06875,z=-1746.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 11] ","color":"gray"},{"text":"converted: 64x sandstone for 1x diamond (zoisterus) at 338 69 -1747","color":"green"}]
