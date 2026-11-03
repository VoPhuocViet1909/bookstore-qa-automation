# Chạy frontend Next.js trỏ vào backend local (http://localhost:8080/api)
$fe = Join-Path $PSScriptRoot "..\sut\frontend"
Set-Location $fe
if (-not (Test-Path "node_modules")) {
    Write-Host "Cai dat thu vien frontend (lan dau mat vai phut)..."
    npm install
}
$env:NEXT_PUBLIC_API_URL = "http://localhost:8080/api"
npm run dev
