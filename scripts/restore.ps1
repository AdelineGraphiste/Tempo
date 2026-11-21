$ErrorActionPreference = 'Stop'
$cache = Join-Path (Split-Path $PSScriptRoot -Parent) '.deps'
New-Item -ItemType Directory -Force $cache | Out-Null
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
foreach ($p in (Get-Content "$PSScriptRoot/dependencies.json" -Raw | ConvertFrom-Json)) {
 $archive = Join-Path $cache ($p.name + '.zip')
 if (!(Test-Path -LiteralPath $archive)) { Invoke-WebRequest -Uri $p.url -OutFile $archive -UseBasicParsing }
 if ((Get-FileHash -LiteralPath $archive).Hash -ne $p.sha256) { throw "Archive incorrecte pour $($p.name)" }
 Expand-Archive -LiteralPath $archive -DestinationPath (Join-Path $cache $p.name) -Force
}
