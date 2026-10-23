# 1x netherite_ingot for 6x diamond (Pufffz) at 338 69 -1761 | stock 35, uncollected earnings 0
execute unless loaded 338 69 -1761 run return run tellraw @s [{"text":"[Shop 05] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 1x netherite_ingot for 6x diamond (Pufffz) at 338 69 -1761","color":"red"}]
execute if block 338 69 -1761 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 05] ","color":"gray"},{"text":"already converted: 1x netherite_ingot for 6x diamond (Pufffz) at 338 69 -1761","color":"yellow"}]
execute unless block 338 69 -1761 #minecraft:air run return run tellraw @s [{"text":"[Shop 05] ","color":"gray"},{"text":"block is not empty, skipped: 1x netherite_ingot for 6x diamond (Pufffz) at 338 69 -1761","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=338.5,y=69.06875,z=-1760.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 05] ","color":"gray"},{"text":"old shop not found, skipped: 1x netherite_ingot for 6x diamond (Pufffz) at 338 69 -1761","color":"red"}]
setblock 338 69 -1761 shoppy:bartering_station[facing=east]{SaleItem:{id:"minecraft:netherite_ingot",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;1,0,0],CostCounts:[I;6,0,0],SaleItemCount:35,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;-648216042,-324713096,-1573659818,1661752486]}
kill @e[tag=playershop,x=338.5,y=69.06875,z=-1760.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 05] ","color":"gray"},{"text":"converted: 1x netherite_ingot for 6x diamond (Pufffz) at 338 69 -1761","color":"green"}]
