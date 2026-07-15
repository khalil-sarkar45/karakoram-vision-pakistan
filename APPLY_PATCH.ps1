# Karakoram Vision Pakistan - Alpine script order fix
# Run this from the ROOT of your project (folder that contains src/)
$ErrorActionPreference = "Stop"
$patchDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path "src")) {
    Write-Host "ERROR: 'src' folder not found here. cd into your project root first." -ForegroundColor Red
    exit 1
}

Copy-Item "$patchDir\base.njk" "src\_includes\layouts\base.njk" -Force
Write-Host "Updated: src/_includes/layouts/base.njk" -ForegroundColor Green

Write-Host ""
Write-Host "Now run:" -ForegroundColor Yellow
Write-Host "  npm run build"
