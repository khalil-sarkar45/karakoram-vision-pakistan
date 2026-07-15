$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
    throw "Run this script from the Karakoram Vision project folder."
}

npm.cmd config set registry "https://registry.npmjs.org/"

if (-not (Test-Path ".\node_modules")) {
    npm.cmd install --registry="https://registry.npmjs.org/"
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed."
    }
}

npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    throw "Project build failed."
}

npm.cmd run dev:full
