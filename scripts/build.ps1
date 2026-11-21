$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$version = '1.0.2'
& "$PSScriptRoot/restore.ps1"
New-Item -ItemType Directory -Force dist,build | Out-Null
$c="$env:WINDIR/Microsoft.NET/Framework64/v4.0.30319/csc.exe"
$d='.deps\webview2\lib\net462'
$argsList=@('/nologo','/optimize+','/platform:x64','/win32icon:assets\tempo.ico','/target:winexe','/r:System.Web.Extensions.dll','/r:System.Web.dll','/r:System.Security.dll','/r:.deps\naudio\lib\net35\NAudio.dll',"/r:$d\Microsoft.Web.WebView2.Core.dll","/r:$d\Microsoft.Web.WebView2.WinForms.dll","/resource:$d\Microsoft.Web.WebView2.Core.dll,Microsoft.Web.WebView2.Core.dll","/resource:$d\Microsoft.Web.WebView2.WinForms.dll,Microsoft.Web.WebView2.WinForms.dll",'/resource:.deps\webview2\runtimes\win-x64\native\WebView2Loader.dll,loader','/resource:.deps\webview2\LICENSE.txt,WebView2-LICENSE','/resource:.deps\webview2\NOTICE.txt,WebView2-NOTICE','/resource:.deps\naudio\lib\net35\NAudio.dll,NAudio.dll','/resource:licenses\NAudio-MIT.txt,NAudio-license.txt','/resource:licenses\ical.js-MPL-2.0.txt,ical-license','/resource:vendor\ical.js,ical.js','/resource:ui\worlds.css,worlds.css','/resource:ui\worlds.js,worlds.js','/resource:ui\skins.json,skins.json','/resource:ui\desk.html,desk.html','/resource:ui\desk.js,desk.js','/resource:ui\agenda.js,agenda.js','/r:Microsoft.VisualBasic.dll')

$argsList += @('/main:Boot','/out:dist\Tempo.exe')
& $c @argsList src\AssemblyInfo.cs src\ConsoleBase.cs src\ConsoleTimer.cs src\Receiver.cs src\ConsoleAudio.cs src\ConsoleHost.cs src\Library.cs
if ($LASTEXITCODE) { throw 'Compilation application échouée' }
& $c /nologo /target:winexe /platform:x64 '/win32icon:assets\tempo.ico' '/out:dist\Désinstaller Tempo.exe' 'src\AssemblyInfo.cs' 'src\Uninstall.cs'
if ($LASTEXITCODE) { throw 'Compilation désinstalleur échouée' }
Copy-Item docs/LISEZ-MOI.txt dist/README.txt -Force
& .deps/wix/candle.exe -nologo -out build/Tempo.wixobj installer/Tempo.wxs
if ($LASTEXITCODE) { throw 'Compilation MSI échouée' }
& .deps/wix/light.exe -nologo -sval -out 'dist/Installer Tempo.msi' build/Tempo.wixobj
if ($LASTEXITCODE) { throw 'Assemblage MSI échoué' }
$zip = "dist/Tempo-Windows-x64-$version.zip"
Compress-Archive -LiteralPath 'dist/Installer Tempo.msi','dist/Désinstaller Tempo.exe','dist/README.txt' -DestinationPath $zip -Force
$hash = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath "dist/Tempo-Windows-x64-$version.sha256" -Value "$hash  Tempo-Windows-x64-$version.zip" -Encoding ascii
