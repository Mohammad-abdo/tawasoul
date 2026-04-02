$ErrorActionPreference = "Stop"
$fontsDir = "f:\tawasol\tawasoul\frontend\public\fonts"
New-Item -ItemType Directory -Force -Path $fontsDir

Write-Host "Downloading Google Fonts ZIP..."
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri "https://fonts.google.com/download?family=Cairo" -OutFile "$fontsDir\Cairo.zip"

Write-Host "Extracting ZIP..."
Expand-Archive -Path "$fontsDir\Cairo.zip" -DestinationPath "$fontsDir\extracted" -Force

Write-Host "Copying TTF files..."
Get-ChildItem -Path "$fontsDir\extracted" -Recurse -Filter "*.ttf" | ForEach-Object {
    if ($_.Name -match "Cairo-Regular.ttf" -or $_.Name -match "Cairo-Bold.ttf" -or $_.Name -match "Cairo\[slnt,wght\].ttf") {
        # Sometimes google fonts zips bundle variable fonts instead of static. If we find exact names, copy them.
        # Otherwise copy them directly renaming to Cairo-XXX.ttf
        Copy-Item $_.FullName -Destination "$fontsDir\$($_.Name)" -Force
    }
}

# Ensure Cairo-Regular is explicitly available. If only variable font was downloaded, rename it so react-pdf uses it correctly
if (!(Test-Path "$fontsDir\Cairo-Regular.ttf")) {
    $varFont = Get-ChildItem -Path "$fontsDir\extracted" -Recurse -Filter "Cairo*.ttf" | Select-Object -First 1
    if ($varFont) {
        Copy-Item $varFont.FullName -Destination "$fontsDir\Cairo-Regular.ttf" -Force
        Copy-Item $varFont.FullName -Destination "$fontsDir\Cairo-Bold.ttf" -Force
    }
}
