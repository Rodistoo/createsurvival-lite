# 1x beacon for 32x diamond (Figerle) at 321 69 -1754 | stock 3, uncollected earnings 0
execute unless loaded 321 69 -1754 run return run tellraw @s [{"text":"[Shop 08] ","color":"gray"},{"text":"chunk not loaded, go closer and run again: 1x beacon for 32x diamond (Figerle) at 321 69 -1754","color":"red"}]
execute if block 321 69 -1754 shoppy:bartering_station run return run tellraw @s [{"text":"[Shop 08] ","color":"gray"},{"text":"already converted: 1x beacon for 32x diamond (Figerle) at 321 69 -1754","color":"yellow"}]
execute unless block 321 69 -1754 #minecraft:air run return run tellraw @s [{"text":"[Shop 08] ","color":"gray"},{"text":"block is not empty, skipped: 1x beacon for 32x diamond (Figerle) at 321 69 -1754","color":"red"}]
execute unless entity @e[type=interaction,tag=playershop,tag=main,x=321.5,y=69.06875,z=-1753.5,distance=..0.2] run return run tellraw @s [{"text":"[Shop 08] ","color":"gray"},{"text":"old shop not found, skipped: 1x beacon for 32x diamond (Figerle) at 321 69 -1754","color":"red"}]
setblock 321 69 -1754 shoppy:bartering_station[facing=west]{SaleItem:{id:"minecraft:beacon",count:1},Currency:{id:"minecraft:diamond",count:1},SaleCounts:[I;1,0,0],CostCounts:[I;32,0,0],SaleItemCount:3,CurrencyItemCount:0,AllowInsert:1b,AllowExtract:0b,Owner:[I;716724703,48188707,-1075289606,-687629103]}
kill @e[tag=playershop,x=321.5,y=69.06875,z=-1753.5,distance=..0.7]
scoreboard players add #converted shop_migration 1
tellraw @s [{"text":"[Shop 08] ","color":"gray"},{"text":"converted: 1x beacon for 32x diamond (Figerle) at 321 69 -1754","color":"green"}]
