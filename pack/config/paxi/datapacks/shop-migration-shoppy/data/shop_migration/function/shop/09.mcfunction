# 64x quartz for 8x diamond (Pufffz) at 336 69 -1758 | stock 1986, uncollected earnings 0
execute unless loaded 336 69 -1758 run return run tellraw @s [{"text":"[Shop 09] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 64x quartz for 8x diamond (Pufffz) at 336 69 -1758","color":"red"}]
execute if block 336 69 -1758 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 09] ","color":"gray"},{"text":"already converted: 64x quartz for 8x diamond (Pufffz) at 336 69 -1758","color":"yellow"}]
execute unless block 336 69 -1758 #minecraft:air run return run tellraw @s [{"text":"[Shop 09] ","color":"gray"},{"text":"block is not empty, skipped: 64x quartz for 8x diamond (Pufffz) at 336 69 -1758","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=336.5,y=69.06875,z=-1757.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 09] ","color":"gray"},{"text":"old shop not found, skipped: 64x quartz for 8x diamond (Pufffz) at 336 69 -1758","color":"red"}]
setblock 336 69 -1758 shoppy:bartering_station[facing=south]{SaleItem:{id:"minecraft:quartz",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;64,0,0],CostCounts:[I;8,0,0],SaleItemCount:1986,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;-648216042,-324713096,-1573659818,1661752486]}
kill @e[tag=playershop,x=336.5,y=69.06875,z=-1757.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 09] ","color":"gray"},{"text":"converted: 64x quartz for 8x diamond (Pufffz) at 336 69 -1758","color":"green"}]
