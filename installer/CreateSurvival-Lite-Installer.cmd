<# : batch part (this file is a Windows batch file and a PowerShell script at once)
@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "$env:CSL_SELF='%~f0'; iex ([IO.File]::ReadAllText('%~f0'))"
exit /b %errorlevel%
#>
# CreateSurvival Lite installer: sets up the modpack as an instance of Prism Launcher. Needs Prism Launcher 9 or newer,
# started once and logged in to a Minecraft account. Asks for the memory (running it again changes it) and sets up the
# performance video settings. The instance keeps itself up to date: before every start it downloads what changed in the
# pack (createsurvival/sync.ps1, Prism's pre-launch command).
# Test overrides (environment): CSL_PACK_URL, CSL_PRISM_DIR, CSL_SILENT=1 with CSL_RAM_MB and CSL_MODE, CSL_NOGUI=1
# (download without its window), CSL_FORM_TEST=1 (build the window, don't show it).

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$PackUrl = 'https://raw.githubusercontent.com/Rodistoo/createsurvival-lite/main/pack/pack.toml'
if ($env:CSL_PACK_URL) { $PackUrl = $env:CSL_PACK_URL }
$PackBase = $PackUrl.Substring(0, $PackUrl.LastIndexOf('/') + 1)
$BootstrapUrl = 'https://github.com/packwiz/packwiz-installer-bootstrap/releases/download/v0.0.3/packwiz-installer-bootstrap.jar'
$InstanceFolder = 'createsurvival-lite'
$InstanceName = 'CreateSurvival Lite'
$Silent = $env:CSL_SILENT -eq '1'

function Find-Prism {
    if ($env:CSL_PRISM_DIR) { return $env:CSL_PRISM_DIR }
    $candidates = @(
        (Join-Path $env:APPDATA 'PrismLauncher'),
        (Join-Path $env:USERPROFILE 'scoop\persist\prismlauncher'),
        (Join-Path $env:LOCALAPPDATA 'Programs\PrismLauncher')
    )
    foreach ($c in $candidates) { if (Test-Path -LiteralPath (Join-Path $c 'prismlauncher.cfg')) { return $c } }
    return $null
}
function Get-InstancesDir($prism) {
    $dir = 'instances'
    $cfg = Join-Path $prism 'prismlauncher.cfg'
    if (Test-Path -LiteralPath $cfg) {
        $line = Get-Content -LiteralPath $cfg | Where-Object { $_ -match '^InstanceDir=' } | Select-Object -First 1
        if ($line) { $dir = $line.Substring('InstanceDir='.Length).Trim('"') }
    }
    if ([System.IO.Path]::IsPathRooted($dir)) { return $dir }
    return Join-Path $prism $dir
}
function Test-Account($prism) {
    $file = Join-Path $prism 'accounts.json'
    if (-not (Test-Path -LiteralPath $file)) { return $false }
    try { return @((Get-Content -LiteralPath $file -Raw | ConvertFrom-Json).accounts).Count -gt 0 } catch { return $false }
}
function Get-Download($url, $to) {
    $tmp = "$to.download"
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $tmp
    Move-Item -LiteralPath $tmp -Destination $to -Force
}
function Write-Text($path, $text) {
    [System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
}
function Set-CfgKeys($path, $keys) {
    # keeps everything else Prism wrote into instance.cfg
    $lines = [System.Collections.Generic.List[string]]::new()
    if (Test-Path -LiteralPath $path) { foreach ($l in [System.IO.File]::ReadAllLines($path)) { $lines.Add($l) } }
    if ($lines.Count -eq 0) { $lines.Add('[General]') }
    $insertAt = $lines.IndexOf('[General]') + 1
    foreach ($k in $keys.Keys) {
        $at = -1
        for ($i = 0; $i -lt $lines.Count; $i++) { if ($lines[$i].StartsWith("$k=")) { $at = $i; break } }
        $line = "$k=$($keys[$k])"
        if ($at -ge 0) { $lines[$at] = $line }
        else { $lines.Insert($insertAt, $line); $insertAt++ }
    }
    [System.IO.File]::WriteAllLines($path, [string[]]$lines, (New-Object System.Text.UTF8Encoding $false))
}

function Install-Pack($prism, $ramMb, $mode, $log) {
    $instances = Get-InstancesDir $prism
    $inst = Join-Path $instances $InstanceFolder
    $mc = Join-Path $inst '.minecraft'
    $own = Join-Path $mc 'createsurvival'
    $existing = Test-Path -LiteralPath (Join-Path $own 'settings.json')
    New-Item -ItemType Directory -Force -Path $own | Out-Null

    & $log 'Downloading the updater...'
    Get-Download $BootstrapUrl (Join-Path $mc 'packwiz-installer-bootstrap.jar')
    Get-Download ($PackBase + 'createsurvival/sync.ps1') (Join-Path $own 'sync.ps1')
    if (-not (Test-Path -LiteralPath (Join-Path $inst 'mmc-pack.json'))) {
        Get-Download ($PackBase + 'createsurvival/mmc-pack.json') (Join-Path $inst 'mmc-pack.json')
    }

    & $log 'Writing the instance settings...'
    $settings = [ordered]@{ packUrl = $PackUrl; mode = $mode }
    if ($env:CSL_NOGUI -eq '1') { $settings['noGui'] = $true }
    Write-Text (Join-Path $own 'settings.json') ($settings | ConvertTo-Json)
    $jvm = '-XX:+UseStringDeduplication'
    if ($ramMb -ge 6144) { $jvm = '-XX:+UseZGC -XX:+ZGenerational -XX:+UseStringDeduplication' }
    # (ConfigVersion 1.3: Prism reads the values as quoted INI strings; without it it takes the quotes literally,
    # and the pre-launch command becomes a program named "powershell -NoProfile ..." that isn't found)
    $keys = [ordered]@{
        'ConfigVersion' = '1.3'
        'InstanceType' = 'OneSix'
        'name' = $InstanceName
        'OverrideMemory' = 'true'
        'MaxMemAlloc' = "$ramMb"
        'MinMemAlloc' = '512'
        'OverrideJavaArgs' = 'true'
        'JvmArgs' = "`"$jvm`""
        'OverrideCommands' = 'true'
        'PreLaunchCommand' = '"powershell -NoProfile -ExecutionPolicy Bypass -File \"$INST_MC_DIR/createsurvival/sync.ps1\""'
    }
    if (-not $existing) { $keys['iconKey'] = 'flame' }
    Set-CfgKeys (Join-Path $inst 'instance.cfg') $keys
    $downloaded = Test-Path -LiteralPath (Join-Path $own 'state.json')
    if ($existing -and $downloaded) { return "Updated: $([math]::Round($ramMb / 1024, 1)) GB (used from the next start on)." }

    # the first download right away, with a Java that Prism already has (a new Prism gets one at the first start)
    $java = Find-Java $prism
    if ($java) {
        & $log 'Downloading the modpack (a window shows the progress)...'
        $env:INST_DIR = $inst; $env:INST_MC_DIR = $mc; $env:INST_JAVA = $java
        $sync = Start-Process -FilePath 'powershell' -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', "`"$(Join-Path $own 'sync.ps1')`"") -NoNewWindow -Wait -PassThru
        if ($sync.ExitCode -eq 0) { return "Installed and downloaded. Open Prism Launcher, pick '$InstanceName' and press Launch." }
    }
    return "Installed. Open Prism Launcher, pick '$InstanceName' and press Launch: the first start downloads the whole pack (a few minutes)."
}

function Find-Java($prism) {
    foreach ($name in @('java-runtime-delta', 'java-runtime-epsilon', 'java-runtime-gamma')) {
        $exe = Join-Path $prism "java\$name\bin\java.exe"
        if (Test-Path -LiteralPath $exe) { return $exe }
    }
    $any = Get-ChildItem -Path (Join-Path $prism 'java\*\bin\java.exe') -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($any) { return $any.FullName }
    $onPath = Get-Command java -ErrorAction SilentlyContinue
    if ($onPath) { return $onPath.Source }
    return $null
}

function Test-PrismRunning { return @(Get-Process -Name 'prismlauncher' -ErrorAction SilentlyContinue).Count -gt 0 }

# ---- without window (tests) ----
if ($Silent) {
    $prism = Find-Prism
    if (-not $prism) { Write-Host 'Prism Launcher not found'; exit 1 }
    Write-Host (Install-Pack $prism ([int]$env:CSL_RAM_MB) $env:CSL_MODE { param($m) Write-Host $m })
    exit 0
}

# ---- window ----
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$totalMb = [int]((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB)
$maxGb = [math]::Max(4, [math]::Floor(($totalMb - 3072) / 1024))
$defaultGb = [math]::Min(10, [math]::Max(6, [math]::Floor($totalMb / 1024 / 2)))
if ($defaultGb -gt $maxGb) { $defaultGb = $maxGb }

$form = New-Object System.Windows.Forms.Form
$form.Text = 'CreateSurvival Lite - Installer'
$form.ClientSize = New-Object System.Drawing.Size(460, 330)
$form.FormBorderStyle = 'FixedDialog'; $form.MaximizeBox = $false; $form.StartPosition = 'CenterScreen'
$font = New-Object System.Drawing.Font('Segoe UI', 9)
$form.Font = $font

function Add-Label($text, $x, $y, $w = 420, $h = 20) {
    $l = New-Object System.Windows.Forms.Label; $l.Text = $text; $l.Location = New-Object System.Drawing.Point($x, $y)
    $l.Size = New-Object System.Drawing.Size($w, $h); $form.Controls.Add($l); return $l
}
$title = Add-Label 'CreateSurvival Lite' 20 12 420 28
$title.Font = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold)

Add-Label 'Prism Launcher folder:' 20 50 | Out-Null
$prismBox = New-Object System.Windows.Forms.TextBox; $prismBox.Location = New-Object System.Drawing.Point(20, 72)
$prismBox.Size = New-Object System.Drawing.Size(330, 23); $prismBox.Text = (Find-Prism); $form.Controls.Add($prismBox)
$browse = New-Object System.Windows.Forms.Button; $browse.Text = 'Browse...'; $browse.Location = New-Object System.Drawing.Point(360, 71)
$browse.Size = New-Object System.Drawing.Size(80, 25); $form.Controls.Add($browse)
$browse.Add_Click({
    $d = New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description = 'The folder with prismlauncher.cfg'
    if ($d.ShowDialog() -eq 'OK') { $prismBox.Text = $d.SelectedPath }
})

Add-Label "Memory for Minecraft (this PC has $([math]::Round($totalMb / 1024)) GB):" 20 108 | Out-Null
$ram = New-Object System.Windows.Forms.NumericUpDown; $ram.Location = New-Object System.Drawing.Point(20, 130)
$ram.Size = New-Object System.Drawing.Size(70, 23); $ram.Minimum = 4; $ram.Maximum = $maxGb; $ram.Value = $defaultGb
$form.Controls.Add($ram)
Add-Label 'GB  (6-10 GB is right for most PCs)' 96 132 300 | Out-Null

Add-Label 'Video settings: performance (short Distant Horizons range, no shaders).' 20 170 420 36 | Out-Null
Add-Label 'You can change them in the game afterwards.' 20 206 | Out-Null

$status = Add-Label '' 20 244 420 40
$install = New-Object System.Windows.Forms.Button; $install.Text = 'Install'; $install.Location = New-Object System.Drawing.Point(250, 288)
$install.Size = New-Object System.Drawing.Size(90, 30); $form.Controls.Add($install)
$close = New-Object System.Windows.Forms.Button; $close.Text = 'Close'; $close.Location = New-Object System.Drawing.Point(350, 288)
$close.Size = New-Object System.Drawing.Size(90, 30); $form.Controls.Add($close)
$close.Add_Click({ $form.Close() })

# an existing install: show its settings
$found = Find-Prism
if ($found) {
    $settingsFile = Join-Path (Get-InstancesDir $found) "$InstanceFolder\.minecraft\createsurvival\settings.json"
    if (Test-Path -LiteralPath $settingsFile) {
        $install.Text = 'Update'
        try {
            $cfg = Join-Path (Get-InstancesDir $found) "$InstanceFolder\instance.cfg"
            $mem = Get-Content -LiteralPath $cfg | Where-Object { $_ -like 'MaxMemAlloc=*' } | Select-Object -First 1
            if ($mem -match '^MaxMemAlloc=(\d+)') { $ram.Value = [math]::Min($ram.Maximum, [math]::Max($ram.Minimum, [math]::Round([int]$Matches[1] / 1024))) }
        } catch { }
        $status.Text = 'CreateSurvival Lite is already installed: change the memory and press Update.'
    }
}

$install.Add_Click({
    $prism = $prismBox.Text.Trim()
    if (-not $prism -or -not (Test-Path -LiteralPath (Join-Path $prism 'prismlauncher.cfg'))) {
        [System.Windows.Forms.MessageBox]::Show('Prism Launcher was not found there. Install Prism Launcher (prismlauncher.org), start it once, then try again, or pick its folder (the one with prismlauncher.cfg).', 'CreateSurvival Lite') | Out-Null
        return
    }
    if (-not (Test-Account $prism)) {
        $r = [System.Windows.Forms.MessageBox]::Show("No Minecraft account in Prism Launcher yet. Add one there (Accounts, top right) before you start the game.`n`nInstall anyway?", 'CreateSurvival Lite', 'YesNo')
        if ($r -ne 'Yes') { return }
    }
    while (Test-PrismRunning) {
        $r = [System.Windows.Forms.MessageBox]::Show('Please close Prism Launcher first, then press OK.', 'CreateSurvival Lite', 'OKCancel')
        if ($r -ne 'OK') { return }
    }
    $install.Enabled = $false
    $mode = 'performance'
    try {
        $msg = Install-Pack $prism ([int]$ram.Value * 1024) $mode { param($m) $status.Text = $m; $form.Refresh() }
        $status.Text = $msg
        $exe = @((Join-Path $prism 'prismlauncher.exe'), (Join-Path $env:LOCALAPPDATA 'Programs\PrismLauncher\prismlauncher.exe')) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
        if ($exe -and [System.Windows.Forms.MessageBox]::Show("$msg`n`nOpen Prism Launcher now?", 'CreateSurvival Lite', 'YesNo') -eq 'Yes') { Start-Process -FilePath $exe }
    } catch {
        $status.Text = "Something went wrong: $($_.Exception.Message)"
    } finally { $install.Enabled = $true }
})

if ($env:CSL_FORM_TEST -eq '1') { Write-Host "window built: $($form.Controls.Count) controls, $($ram.Value) GB of $maxGb, button $($install.Text)"; exit 0 }
[void]$form.ShowDialog()
