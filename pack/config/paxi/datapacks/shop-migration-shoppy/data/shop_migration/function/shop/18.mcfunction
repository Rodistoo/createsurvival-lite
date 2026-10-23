# 64x gravel for 3x diamond (Figerle) at 337 69 -1720 | stock 1569, uncollected earnings 0
execute unless loaded 337 69 -1720 run return run tellraw @s [{"text":"[Shop 18] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 64x gravel for 3x diamond (Figerle) at 337 69 -1720","color":"red"}]
execute if block 337 69 -1720 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 18] ","color":"gray"},{"text":"already converted: 64x gravel for 3x diamond (Figerle) at 337 69 -1720","color":"yellow"}]
execute unless block 337 69 -1720 #minecraft:air run return run tellraw @s [{"text":"[Shop 18] ","color":"gray"},{"text":"block is not empty, skipped: 64x gravel for 3x diamond (Figerle) at 337 69 -1720","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=337.5,y=69.06875,z=-1719.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 18] ","color":"gray"},{"text":"old shop not found, skipped: 64x gravel for 3x diamond (Figerle) at 337 69 -1720","color":"red"}]
setblock 337 69 -1720 shoppy:bartering_station[facing=east]{SaleItem:{id:"minecraft:gravel",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;64,0,0],CostCounts:[I;3,0,0],SaleItemCount:1569,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;716724703,48188707,-1075289606,-687629103]}
kill @e[tag=playershop,x=337.5,y=69.06875,z=-1719.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 18] ","color":"gray"},{"text":"converted: 64x gravel for 3x diamond (Figerle) at 337 69 -1720","color":"green"}]
