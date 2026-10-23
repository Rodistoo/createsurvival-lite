# Run as an operator standing in the shop district (about 330 70 -1745): /function shop_migration:convert
# Safe to run more than once: converted shops are skipped.
execute unless entity @s[type=player] run return run tellraw @a {"text":"[Shop migration] Run this as a player (needed for unowned shops).","color":"red"}
scoreboard objectives add shop_migration dummy
scoreboard players set #converted shop_migration 0
function shop_migration:shop/01
function shop_migration:shop/02
function shop_migration:shop/03
function shop_migration:shop/04
function shop_migration:shop/05
function shop_migration:shop/06
function shop_migration:shop/07
function shop_migration:shop/08
function shop_migration:shop/09
function shop_migration:shop/10
function shop_migration:shop/11
function shop_migration:shop/12
function shop_migration:shop/13
function shop_migration:shop/14
function shop_migration:shop/15
function shop_migration:shop/16
function shop_migration:shop/17
function shop_migration:shop/18
tellraw @s [{"text":"[Shop migration] Converted ","color":"gold"},{"score":{"name":"#converted","objective":"shop_migration"},"color":"yellow"},{"text":" of 18 shops this run.","color":"gold"}]
