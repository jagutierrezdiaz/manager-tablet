# run_checks.ps1
# Read-only validation script for Manager project
param()
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ROOT = Resolve-Path "$ROOT\.." # scripts folder assumed under project root
$ROOT = $ROOT.Path
$BACKEND = Join-Path $ROOT "backend"
$FRONTEND = Join-Path $ROOT "frontend"
$REPORT = "C:\temp\project_validation_report.txt"
New-Item -Path (Split-Path $REPORT) -ItemType Directory -Force | Out-Null
"`n=== Project validation report ===`nGenerated: $(Get-Date)`n" | Out-File $REPORT -Encoding utf8
function Write-Report($title, $content){
  "`n--- $title ---`n" | Out-File $REPORT -Append -Encoding utf8
  $content | Out-File $REPORT -Append -Encoding utf8
}

# 1) Node / npm versions
try { $node = node -v 2>&1 } catch { $node = "node not found in PATH" }
try { $npm = npm -v 2>&1 } catch { $npm = "npm not found in PATH" }
Write-Report "Node / npm" @("node: $node","npm: $npm")

# 2) Syntax check backend JS files (node --check)
Write-Report "Backend JS syntax check (node --check)" "Scanning..."
$errors = @()
Get-ChildItem -Path $BACKEND -Recurse -Include *.js | ForEach-Object {
  $file = $_.FullName
  $out = & node --check $file 2>&1
  if ($LASTEXITCODE -ne 0) {
    $errors += "ERR: $file"
    $errors += $out
  } else {
    $errors += "OK: $file"
  }
}
Write-Report "Backend syntax results" $errors

# 3) Search for known bad token patterns (typos / corruption)
$patterns = @("revimport","hazlosoftwre","hazlosoftware")
$found = @()
foreach ($p in $patterns){
  $matches = Select-String -Path "$ROOT\**\*.js","$ROOT\**\*.env","$ROOT\**\*.html" -Pattern $p -SimpleMatch -ErrorAction SilentlyContinue
  if ($matches) {
    $found += "Pattern '$p' matches:"
    $matches | ForEach-Object { $found += "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" }
  } else {
    $found += "Pattern '$p' : no matches"
  }
}
Write-Report "Keyword scan (typos/patterns)" $found

# 4) Detect BOM in backend .js files
$bomFound = @()
Get-ChildItem -Path $BACKEND -Recurse -Include *.js | ForEach-Object {
  try {
    $fs = [System.IO.File]::OpenRead($_.FullName)
    $bytes = New-Object byte[] 3
    $read = $fs.Read($bytes,0,3)
    $fs.Close()
    if ($read -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) {
      $bomFound += "BOM in: $($_.FullName)"
    }
  } catch { $bomFound += "ERROR reading $($_.FullName): $_" }
}
if ($bomFound.Count -eq 0) { $bomFound = "No BOMs detected in backend .js files." }
Write-Report "BOM detection" $bomFound

# 5) Detect null bytes in backend .js (may be slow)
$nulls = @()
Get-ChildItem -Path $BACKEND -Recurse -Include *.js | ForEach-Object {
  try {
    $bytes = Get-Content -Encoding Byte -ReadCount 0 -Path $_.FullName
    if ($bytes -contains 0) { $nulls += "Null byte found in: $($_.FullName)" }
  } catch { $nulls += "ERROR reading $($_.FullName): $_" }
}
if ($nulls.Count -eq 0) { $nulls = "No null bytes in backend .js files." }
Write-Report "Null byte scan" $nulls

# 6) List files modified in last 48 hours
$recent = Get-ChildItem -Path $ROOT -Recurse | Where-Object { -not $_.PSIsContainer -and $_.LastWriteTime -gt (Get-Date).AddHours(-48) } | Select-Object FullName, LastWriteTime
if ($recent) { $recentOut = $recent | ForEach-Object { "$($_.FullName)  --  $($_.LastWriteTime)" } } else { $recentOut = "No files modified in last 48h." }
Write-Report "Recently modified files (48h)" $recentOut

# 7) Check frontend .env.production for domain typos and VITE vars
$envProd = Join-Path $FRONTEND ".env.production"
if (Test-Path $envProd) {
  $envLines = Get-Content $envProd -ErrorAction SilentlyContinue
  Write-Report "frontend/.env.production" $envLines
  $typos = Select-String -Path $envProd -Pattern "hazlosoftwre|hazlosoftware" -SimpleMatch -AllMatches -ErrorAction SilentlyContinue
  if ($typos) {
    $typoOut = $typos | ForEach-Object { "$($_.LineNumber): $($_.Line.Trim())" }
  } else { $typoOut = "No domain typos found in frontend/.env.production" }
  Write-Report "frontend domain check" $typoOut
} else {
  Write-Report "frontend/.env.production" "File not found: $envProd"
}

# 8) Check backend .env for PORT and CORS_ORIGIN
$backendEnv = Join-Path $BACKEND ".env"
if (Test-Path $backendEnv) {
  $beLines = Get-Content $backendEnv
  Write-Report "backend/.env" $beLines
  $cors = ($beLines | Select-String -Pattern "^CORS_ORIGIN=" -Quiet)
  if (-not $cors) { Write-Report "backend/.env CORS_ORIGIN" "CORS_ORIGIN not found" }
} else {
  Write-Report "backend/.env" "File not found: $backendEnv"
}

# 9) Quick HTTP checks against local backend (only if service running)
$httpChecks = @()
try {
  $rootCheck = Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
  $httpChecks += "GET /  -> $($rootCheck.StatusCode)"
} catch { $httpChecks += "GET /  -> FAILED: $($_.Exception.Message)" }
# /api/users
try {
  $u = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/users" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
  $httpChecks += "GET /api/users -> $($u.StatusCode)"
} catch { $httpChecks += "GET /api/users -> FAILED: $($_.Exception.Message)" }
# device my-ip
try {
  $m = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/device/my-ip" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
  $httpChecks += "GET /api/device/my-ip -> $($m.StatusCode)"
} catch { $httpChecks += "GET /api/device/my-ip -> FAILED: $($_.Exception.Message)" }
Write-Report "Local HTTP checks" $httpChecks

# 10) PM2 status if available
try {
  $pm2 = pm2 -v 2>&1
  if ($LASTEXITCODE -eq 0) {
    $pm2stat = pm2 status 2>&1
    Write-Report "PM2 status" $pm2stat
  } else {
    Write-Report "PM2" "pm2 not found or not in PATH"
  }
} catch { Write-Report "PM2" "pm2 command not available: $_" }

# Final summary stub
Write-Report "Summary guidance" @(
  "If syntax errors found: open the listed files and correct the syntax.",
  "If BOM/null bytes found: remove BOM or recreate file in UTF-8 without BOM.",
  "If frontend env shows domain typo (hazlosoftwre): fix to hazlosoftware (or your chosen domain) before build.",
  "If local HTTP checks fail: ensure backend is running (npm run dev) and check pm2/nodemon logs.",
  "Save or paste C:\temp\project_validation_report.txt back here for review."
)

"`n=== End of report ===`n" | Out-File $REPORT -Append -Encoding utf8
Write-Host "Report generated at $REPORT"

