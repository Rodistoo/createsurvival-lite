# 1x sponge for 14x diamond (Rodistoo) at 337 69 -1733 | stock 25, uncollected earnings 0
execute unless loaded 337 69 -1733 run return run tellraw @s [{"text":"[Shop 13] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 1x sponge for 14x diamond (Rodistoo) at 337 69 -1733","color":"red"}]
execute if block 337 69 -1733 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 13] ","color":"gray"},{"text":"already converted: 1x sponge for 14x diamond (Rodistoo) at 337 69 -1733","color":"yellow"}]
execute unless block 337 69 -1733 #minecraft:air run return run tellraw @s [{"text":"[Shop 13] ","color":"gray"},{"text":"block is not empty, skipped: 1x sponge for 14x diamond (Rodistoo) at 337 69 -1733","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=337.5,y=69.06875,z=-1732.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 13] ","color":"gray"},{"text":"old shop not found, skipped: 1x sponge for 14x diamond (Rodistoo) at 337 69 -1733","color":"red"}]
setblock 337 69 -1733 shoppy:bartering_station[facing=east]{SaleItem:{id:"minecraft:sponge",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;1,0,0],CostCounts:[I;14,0,0],SaleItemCount:25,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;-2135565243,1930054558,-1998339725,-1376079339]}
kill @e[tag=playershop,x=337.5,y=69.06875,z=-1732.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 13] ","color":"gray"},{"text":"converted: 1x sponge for 14x diamond (Rodistoo) at 337 69 -1733","color":"green"}]
