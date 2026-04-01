param(
  [string]$DataDir = "",
  [string]$BackupDir = ""
)

if (-not $DataDir) {
  $DataDir = Join-Path $env:USERPROFILE ".jbb-tables-dashboard"
}

if (-not $BackupDir) {
  $repoRoot = Split-Path $PSScriptRoot -Parent
  $BackupDir = Join-Path $repoRoot "backups"
}

$dbPath = Join-Path $DataDir "jbb.db"

if (-not (Test-Path -LiteralPath $dbPath)) {
  Write-Error "Database file not found at $dbPath"
  exit 1
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$destination = Join-Path $BackupDir "jbb_$timestamp.db"

Copy-Item -LiteralPath $dbPath -Destination $destination -Force
Write-Output "Backup created: $destination"
