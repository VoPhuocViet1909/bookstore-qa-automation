# PowerShell script để cấu hình Redis enable keyspace notifications
# Chạy script này sau khi start Redis server

Write-Host "Configuring Redis for keyspace notifications..." -ForegroundColor Cyan

# Kết nối đến Redis và set config
$output = redis-cli -h redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com `
          -p 15646 `
          -a igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA `
          --user default `
          CONFIG SET notify-keyspace-events Ex

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Redis keyspace notifications enabled successfully!" -ForegroundColor Green
    Write-Host "   Event type: Ex (Expired events)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to configure Redis" -ForegroundColor Red
    exit 1
}

# Verify configuration
Write-Host ""
Write-Host "Verifying configuration..." -ForegroundColor Cyan
redis-cli -h redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com `
          -p 15646 `
          -a igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA `
          --user default `
          CONFIG GET notify-keyspace-events

Write-Host ""
Write-Host "✅ Configuration complete!" -ForegroundColor Green
Write-Host "   You can now use Redis Key Expiration for order timeout feature." -ForegroundColor Gray

