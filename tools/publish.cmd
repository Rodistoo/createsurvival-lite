@echo off
rem Publishes the current state of the CreateSurvival Lite Prism instance: rebuilds pack\ from it, commits and pushes.
rem Players get the changes the next time they start the game. Close the game first (configs are read as they are).
setlocal
cd /d "%~dp0.."
node tools\build-pack.mjs %* || exit /b 1
git add -A || exit /b 1
for /f "tokens=3 delims= " %%v in ('findstr /b "version" pack\pack.toml') do set VERSION=%%~v
git commit -m "Pack %VERSION%" || (echo Nothing changed. & exit /b 0)
git push || exit /b 1
echo Published %VERSION%.
