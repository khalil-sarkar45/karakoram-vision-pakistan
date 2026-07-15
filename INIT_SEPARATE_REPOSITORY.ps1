$ErrorActionPreference='Stop'
if (-not (Test-Path '.\package.json')) { throw 'Run from the Karakoram Vision project folder.' }
if (Test-Path '.\.git') { throw 'A Git repository already exists here.' }
git init
git branch -M main
git add .
git commit -m 'Initial Karakoram Vision Pakistan website'
Write-Host 'SEPARATE_KARAKORAM_VISION_REPOSITORY_READY' -ForegroundColor Green
