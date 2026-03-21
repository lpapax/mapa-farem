$existing = Get-Content "frontend\src\data\farms.json" | ConvertFrom-Json
$newFarms = Get-Content "frontend\src\data\new-farms.json" | ConvertFrom-Json
$merged = $existing + $newFarms
$merged | ConvertTo-Json -Depth 10 | Set-Content "frontend\src\data\farms.json"
Write-Host "Hotovo: $($merged.Count) farem"
