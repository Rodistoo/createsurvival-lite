@echo off
rem Builds server\createsurvival-server-starter.jar (the server's jar, see server\README.md) from server\starter.
rem Needs a JDK 21: JAVA_HOME, else Prism's java-runtime-delta.
setlocal
cd /d "%~dp0.."
if "%JAVA_HOME%"=="" set "JAVA_HOME=%APPDATA%\PrismLauncher\java\java-runtime-delta"
if exist server\starter\build rmdir /s /q server\starter\build
"%JAVA_HOME%\bin\javac" --release 21 -d server\starter\build server\starter\CreateSurvivalServerStarter.java || exit /b 1
"%JAVA_HOME%\bin\jar" --create --file server\createsurvival-server-starter.jar --main-class CreateSurvivalServerStarter -C server\starter\build . || exit /b 1
rmdir /s /q server\starter\build
echo Built server\createsurvival-server-starter.jar
