# 16x gold_ingot for 4x diamond (Pufffz) at 336 69 -1765 | stock 0, uncollected earnings 0
execute unless loaded 336 69 -1765 run return run tellraw @s [{"text":"[Shop 06] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 16x gold_ingot for 4x diamond (Pufffz) at 336 69 -1765","color":"red"}]
execute if block 336 69 -1765 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 06] ","color":"gray"},{"text":"already converted: 16x gold_ingot for 4x diamond (Pufffz) at 336 69 -1765","color":"yellow"}]
execute unless block 336 69 -1765 #minecraft:air run return run tellraw @s [{"text":"[Shop 06] ","color":"gray"},{"text":"block is not empty, skipped: 16x gold_ingot for 4x diamond (Pufffz) at 336 69 -1765","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=336.5,y=69.06875,z=-1764.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 06] ","color":"gray"},{"text":"old shop not found, skipped: 16x gold_ingot for 4x diamond (Pufffz) at 336 69 -1765","color":"red"}]
setblock 336 69 -1765 shoppy:bartering_station[facing=north]{SaleItem:{id:"minecraft:gold_ingot",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;16,0,0],CostCounts:[I;4,0,0],SaleItemCount:0,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;-648216042,-324713096,-1573659818,1661752486]}
kill @e[tag=playershop,x=336.5,y=69.06875,z=-1764.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 06] ","color":"gray"},{"text":"converted: 16x gold_ingot for 4x diamond (Pufffz) at 336 69 -1765","color":"green"}]
