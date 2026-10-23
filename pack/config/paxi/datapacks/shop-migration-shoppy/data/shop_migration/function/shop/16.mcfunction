# 64x yellow_terracotta for 4x diamond (Snaker_15) at 321 69 -1718 | stock 832, uncollected earnings 0
execute unless loaded 321 69 -1718 run return run tellraw @s [{"text":"[Shop 16] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 64x yellow_terracotta for 4x diamond (Snaker_15) at 321 69 -1718","color":"red"}]
execute if block 321 69 -1718 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 16] ","color":"gray"},{"text":"already converted: 64x yellow_terracotta for 4x diamond (Snaker_15) at 321 69 -1718","color":"yellow"}]
execute unless block 321 69 -1718 #minecraft:air run return run tellraw @s [{"text":"[Shop 16] ","color":"gray"},{"text":"block is not empty, skipped: 64x yellow_terracotta for 4x diamond (Snaker_15) at 321 69 -1718","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=321.5,y=69.06875,z=-1717.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 16] ","color":"gray"},{"text":"old shop not found, skipped: 64x yellow_terracotta for 4x diamond (Snaker_15) at 321 69 -1718","color":"red"}]
setblock 321 69 -1718 shoppy:bartering_station[facing=south]{SaleItem:{id:"minecraft:yellow_terracotta",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;64,0,0],CostCounts:[I;4,0,0],SaleItemCount:832,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;-1942055298,-1257615689,-1685052035,1056175112]}
kill @e[tag=playershop,x=321.5,y=69.06875,z=-1717.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 16] ","color":"gray"},{"text":"converted: 64x yellow_terracotta for 4x diamond (Snaker_15) at 321 69 -1718","color":"green"}]
