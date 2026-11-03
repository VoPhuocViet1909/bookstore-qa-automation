# Quick test script - Kiểm tra Redis TTL nhanh

Write-Host "=== QUICK REDIS TTL TEST ===" -ForegroundColor Cyan
Write-Host ""

# 1. Tạo test key với TTL 60 giây
Write-Host "Step 1: Creating test key with 60 seconds TTL..." -ForegroundColor Yellow

$testKey = "order_timeout:test-$(Get-Date -Format 'HHmmss')"
$cmd = "redis-cli -h redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com -p 15646 --user default -a igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA --no-auth-warning SETEX $testKey 60 'test-value'"

Write-Host "  Command: $cmd" -ForegroundColor Gray
Invoke-Expression $cmd

Write-Host "  Created key: $testKey" -ForegroundColor Green
Write-Host ""

# 2. Check TTL 5 lần với interval 5 giây
Write-Host "Step 2: Checking TTL 5 times (every 5 seconds)..." -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le 5; $i++) {
    $ttl = redis-cli -h redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com -p 15646 --user default -a igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA --no-auth-warning TTL $testKey

    $currentTime = Get-Date -Format "HH:mm:ss"
    Write-Host "  [$i] Time: $currentTime | TTL: $ttl seconds" -ForegroundColor Cyan

    if ($i -lt 5) {
        Start-Sleep -Seconds 5
    }
}

Write-Host ""
Write-Host "Step 3: Cleanup - Deleting test key..." -ForegroundColor Yellow
redis-cli -h redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com -p 15646 --user default -a igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA --no-auth-warning DEL $testKey

Write-Host ""
Write-Host "=== TEST COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Expected result:" -ForegroundColor White
Write-Host "  - TTL should decrease by ~5 seconds each check" -ForegroundColor Gray
Write-Host "  - Example: 60 -> 55 -> 50 -> 45 -> 40" -ForegroundColor Gray

