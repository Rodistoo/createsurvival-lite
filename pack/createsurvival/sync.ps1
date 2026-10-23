# CreateSurvival Lite: runs before every start (Prism's pre-launch command, set up by the installer).
#  1. brings the instance up to date with the pack (packwiz-installer: only what changed is downloaded)
#  2. the chosen mode (performance / quality, createsurvival/presets.json): applied when it was picked and again when
#     an update rewrote one of its files - other changes a player makes stay. options.txt is never touched.
#  3. a new NeoForge version of the pack goes into the instance (used from the next start on)
# Local files (not part of the pack): createsurvival/settings.json (installer: pack url, mode), createsurvival/state.json.
# Without internet the game starts as it is.

$ErrorActionPreference = 'Stop'
$mc = $env:INST_MC_DIR
if (-not $mc) { $mc = Split-Path -Parent $PSScriptRoot }
$instDir = $env:INST_DIR
if (-not $instDir) { $instDir = Split-Path -Parent $mc }
$own = Join-Path $mc 'createsurvival'
$settingsFile = Join-Path $own 'settings.json'
$stateFile = Join-Path $own 'state.json'

function Read-Json($path) {
    if (Test-Path -LiteralPath $path) { return Get-Content -LiteralPath $path -Raw | ConvertFrom-Json }
    return $null
}
function Write-Json($path, $value) {
    [System.IO.File]::WriteAllText($path, ($value | ConvertTo-Json -Depth 6), (New-Object System.Text.UTF8Encoding $false))
}
function Get-Hash($path) {
    if (Test-Path -LiteralPath $path) { return (Get-FileHash -LiteralPath $path -Algorithm SHA1).Hash }
    return ''
}

$settings = Read-Json $settingsFile
if (-not $settings) { Write-Host 'CreateSurvival: no createsurvival/settings.json - run the installer again.'; exit 1 }
$state = Read-Json $stateFile
if (-not $state) { $state = [pscustomobject]@{ appliedMode = ''; installed = $false } }

# the files the modes change, as they are before the update (none yet on the first start)
$presetsFile = Join-Path $own 'presets.json'
$oldPresets = Read-Json $presetsFile
$before = @{}
if ($oldPresets -and $oldPresets.PSObject.Properties[$settings.mode]) {
    foreach ($p in $oldPresets.($settings.mode).PSObject.Properties) { $before[$p.Name] = Get-Hash (Join-Path $mc $p.Name) }
}

# 1. update (java.exe, not javaw: that one wouldn't be waited for)
$java = $env:INST_JAVA
if ($java -and $java -match 'javaw\.exe$') {
    $console = $java -replace 'javaw\.exe$', 'java.exe'
    if (Test-Path -LiteralPath $console) { $java = $console }
}
if (-not $java) { $java = 'java' }
$bootstrap = Join-Path $mc 'packwiz-installer-bootstrap.jar'
$arguments = @('-jar', "`"$bootstrap`"")
if ($settings.noGui) { $arguments += '-g' }
$arguments += $settings.packUrl
$updated = $false
try {
    $run = Start-Process -FilePath $java -ArgumentList $arguments -WorkingDirectory $mc -NoNewWindow -Wait -PassThru
    $updated = $run.ExitCode -eq 0
    if (-not $updated) { Write-Host "CreateSurvival: the update stopped (exit code $($run.ExitCode))." }
} catch {
    Write-Host "CreateSurvival: couldn't run the update: $_"
}
if ($updated) { $state.installed = $true }
if (-not $state.installed) {
    Write-Host 'CreateSurvival: the pack was never downloaded completely (no internet?). Try again.'
    exit 1
}

# 2. the mode
function Set-Keys($path, $keys) {
    $lines = @()
    if (Test-Path -LiteralPath $path) { $lines = @([System.IO.File]::ReadAllLines($path)) }
    $ext = [System.IO.Path]::GetExtension($path).ToLower()
    foreach ($k in $keys.PSObject.Properties) {
        $key = [regex]::Escape($k.Name)
        if ($ext -eq '.toml') { $pattern = "^(\s*)$key\s*="; $line = $null }
        else { $pattern = "^$key="; $line = "$($k.Name)=$($k.Value)" }
        $done = $false
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $m = [regex]::Match($lines[$i], $pattern)
            if ($m.Success) {
                if ($ext -eq '.toml') { $lines[$i] = "$($m.Groups[1].Value)$($k.Name) = $($k.Value)" } else { $lines[$i] = $line }
                $done = $true; break
            }
        }
        if (-not $done -and $ext -ne '.toml') { $lines += $line } # (a toml key belongs in its section: only changed where it is)
    }
    [System.IO.File]::WriteAllLines($path, [string[]]$lines, (New-Object System.Text.UTF8Encoding $false))
}
$presets = Read-Json $presetsFile
if ($presets -and $presets.PSObject.Properties[$settings.mode]) {
    $modeChanged = $state.appliedMode -ne $settings.mode
    foreach ($p in $presets.($settings.mode).PSObject.Properties) {
        $path = Join-Path $mc $p.Name
        if ($modeChanged -or (Get-Hash $path) -ne $before[$p.Name]) {
            try { Set-Keys $path $p.Value } catch { Write-Host "CreateSurvival: couldn't set $($p.Name): $_" }
        }
    }
    $state.appliedMode = $settings.mode
}
Write-Json $stateFile $state

# 3. NeoForge version of the pack
try {
    $packToml = (Invoke-WebRequest -UseBasicParsing -Uri $settings.packUrl -TimeoutSec 10).Content
    $m = [regex]::Match($packToml, 'neoforge\s*=\s*"([^"]+)"')
    $mmcFile = Join-Path $instDir 'mmc-pack.json'
    if ($m.Success -and (Test-Path -LiteralPath $mmcFile)) {
        $mmc = Read-Json $mmcFile
        $neo = $mmc.components | Where-Object { $_.uid -eq 'net.neoforged' }
        if ($neo -and $neo.version -ne $m.Groups[1].Value) {
            $neo.version = $m.Groups[1].Value
            if ($neo.PSObject.Properties['cachedVersion']) { $neo.cachedVersion = $m.Groups[1].Value }
            Write-Json $mmcFile $mmc
            Write-Host "CreateSurvival: the pack now uses NeoForge $($m.Groups[1].Value); it is used from the next start on."
        }
    }
} catch { }
exit 0
