# Chạy toàn bộ bộ test (API + E2E). Yêu cầu: backend (8080) và frontend (3000) đang chạy.
#   powershell -ExecutionPolicy Bypass -File .\run-tests.ps1            -> chạy tất cả
#   powershell -ExecutionPolicy Bypass -File .\run-tests.ps1 api        -> chỉ API
#   powershell -ExecutionPolicy Bypass -File .\run-tests.ps1 e2e        -> chỉ E2E
param([string]$Project = "")
Set-Location $PSScriptRoot
if (-not (Test-Path "node_modules")) {
    npm install
    npx playwright install chromium
}
if ($Project) { npx playwright test --project=$Project } else { npx playwright test }
Write-Host "`nXem bao cao: npx playwright show-report"
