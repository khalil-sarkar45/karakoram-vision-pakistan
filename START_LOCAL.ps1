$ErrorActionPreference = 'Stop'

if (-not (Test-Path '.\package.json')) {
    throw 'Run this script from D:\Websites\Karakoram_Vision_Pakistan.'
}

npm.cmd config set registry 'https://registry.npmjs.org/'

$needsInstall = -not (Test-Path '.\node_modules\htmx.org\dist\htmx.min.js') -or -not (Test-Path '.\node_modules\alpinejs\dist\cdn.min.js')
if ($needsInstall) {
    if (Test-Path '.\package-lock.json') {
        $lockText = Get-Content '.\package-lock.json' -Raw
        if ($lockText -match 'internal\.api\.openai\.org|applied-caas-gateway') {
            Remove-Item '.\package-lock.json' -Force
        }
    }
    npm.cmd install --registry='https://registry.npmjs.org/'
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
}

npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Project build failed.' }

node .\tools\check-client-full-nav-v1-1.mjs
if ($LASTEXITCODE -ne 0) { throw 'Full navigation audit failed.' }

npm.cmd run dev:full
