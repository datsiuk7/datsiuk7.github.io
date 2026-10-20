$ErrorActionPreference = 'Stop'
$assetDir = Join-Path $PSScriptRoot 'public/assets'
New-Item -ItemType Directory -Force $assetDir | Out-Null
$headers = @{ 'User-Agent' = 'PavlukOpenWorldAssetBuild/1.0' }
foreach ($id in @('leafy_grass', 'grass_path_2')) {
  $json = Invoke-RestMethod "https://api.polyhaven.com/files/$id" -Headers $headers
  foreach ($map in @('Diffuse', 'nor_gl')) {
    $entry = $json.$map.'1k'.jpg
    if ($entry) {
      $out = Join-Path $assetDir "$id-$map.jpg"
      if (!(Test-Path $out)) { Invoke-WebRequest $entry.url -Headers $headers -OutFile $out }
      Write-Output "$id $map $([math]::Round((Get-Item $out).Length / 1MB,2)) MB"
    }
  }
}
foreach ($id in @('pine_sapling_small', 'rock_moss_set_01')) {
  $json = Invoke-RestMethod "https://api.polyhaven.com/files/$id" -Headers $headers
  $entry = $json.gltf.'1k'.gltf
  $outDir = Join-Path $assetDir $id
  New-Item -ItemType Directory -Force $outDir | Out-Null
  $target = Join-Path $outDir "$id.gltf"
  if (!(Test-Path $target)) { Invoke-WebRequest $entry.url -Headers $headers -OutFile $target }
  foreach ($file in $entry.include.PSObject.Properties) {
    $target = Join-Path $outDir $file.Name
    New-Item -ItemType Directory -Force (Split-Path $target) | Out-Null
    if (!(Test-Path $target)) { Invoke-WebRequest $file.Value.url -Headers $headers -OutFile $target }
  }
  Write-Output "$id downloaded"
}
$soldier = Join-Path $assetDir 'Soldier.glb'
if (!(Test-Path $soldier)) { Invoke-WebRequest 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb' -OutFile $soldier }
Write-Output "Soldier $([math]::Round((Get-Item $soldier).Length / 1MB,2)) MB"
$car = Join-Path $assetDir 'CarConcept.glb'
if (!(Test-Path $car)) { Invoke-WebRequest 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb' -OutFile $car }
Write-Output "CarConcept $([math]::Round((Get-Item $car).Length / 1MB,2)) MB"
$cutout = Join-Path $PSScriptRoot 'assets/pine-cutout.png'
if (!(Test-Path $cutout)) { $cutout = Join-Path $PSScriptRoot '../assets/pine-cutout.png' }
if (Test-Path $cutout) { Copy-Item -LiteralPath $cutout -Destination (Join-Path $assetDir 'pine-cutout.png') -Force }
