$ErrorActionPreference = "Stop"
$fontsDir = "public\fonts"
If (!(Test-Path $fontsDir)) { New-Item -ItemType Directory -Force -Path $fontsDir }

Write-Host "Downloading Google Fonts ZIP..."
Invoke-WebRequest -Uri "https://fonts.google.com/download?family=Cairo" -OutFile "$fontsDir\Cairo.zip"

Write-Host "Extracting ZIP..."
Expand-Archive -Path "$fontsDir\Cairo.zip" -DestinationPath "$fontsDir\extracted" -Force

Write-Host "Copying TTF files..."
Get-ChildItem -Path "$fontsDir\extracted" -Recurse -Filter "Cairo-Regular.ttf" | Copy-Item -Destination "$fontsDir\Cairo-Regular.ttf" -Force
Get-ChildItem -Path "$fontsDir\extracted" -Recurse -Filter "Cairo-Bold.ttf" | Copy-Item -Destination "$fontsDir\Cairo-Bold.ttf" -Force

Write-Host "Cleanup..."
Remove-Item -Path "$fontsDir\Cairo.zip" -Force
Remove-Item -Path "$fontsDir\extracted" -Recurse -Force

Write-Host "Done."
