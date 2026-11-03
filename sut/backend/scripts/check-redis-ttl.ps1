# Script kiểm tra Redis Key TTL (Time To Live)
# Sử dụng để verify timeout key đang countdown

Write-Host "=== REDIS KEY TTL CHECKER ===" -ForegroundColor Cyan
Write-Host ""

$redisHost = "redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com"
$redisPort = "15646"
$redisUser = "default"
$redisPass = "igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA"

# Function to check TTL
function Check-KeyTTL {
    param(
        [string]$keyPattern = "order_timeout:*"
    )

    Write-Host "🔍 Searching for keys matching pattern: $keyPattern" -ForegroundColor Yellow

    # Get all matching keys
    $keys = redis-cli -h $redisHost -p $redisPort --user $redisUser -a $redisPass --no-auth-warning KEYS $keyPattern

    if ([string]::IsNullOrWhiteSpace($keys)) {
        Write-Host "❌ No keys found matching pattern: $keyPattern" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Hướng dẫn tạo test key:" -ForegroundColor Cyan
        Write-Host "   1. Tạo một payment request từ frontend/Postman" -ForegroundColor Gray
        Write-Host "   2. Hoặc dùng lệnh sau để tạo test key:" -ForegroundColor Gray
        Write-Host "      redis-cli -h $redisHost -p $redisPort --user $redisUser -a $redisPass SETEX order_timeout:test-123 900 'test-123'" -ForegroundColor DarkGray
        return
    }

    Write-Host "✅ Found keys:" -ForegroundColor Green
    $keyArray = $keys -split "`n" | Where-Object { $_ -ne "" }

    foreach ($key in $keyArray) {
        $key = $key.Trim()
        if ([string]::IsNullOrWhiteSpace($key)) { continue }

        Write-Host ""
        Write-Host "📌 Key: $key" -ForegroundColor White

        # Get TTL
        $ttl = redis-cli -h $redisHost -p $redisPort --user $redisUser -a $redisPass --no-auth-warning TTL $key

        if ($ttl -eq "-1") {
            Write-Host "   ⚠️  TTL: No expiration set (key will never expire)" -ForegroundColor Yellow
        }
        elseif ($ttl -eq "-2") {
            Write-Host "   ❌ TTL: Key does not exist or already expired" -ForegroundColor Red
        }
        else {
            $minutes = [math]::Floor($ttl / 60)
            $seconds = $ttl % 60
            Write-Host "   ⏱️  TTL: $ttl seconds ($minutes min $seconds sec remaining)" -ForegroundColor Green

            # Calculate when it will expire
            $expiryTime = (Get-Date).AddSeconds($ttl)
            Write-Host "   📅 Will expire at: $($expiryTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Cyan
        }

        # Get value
        $value = redis-cli -h $redisHost -p $redisPort --user $redisUser -a $redisPass --no-auth-warning GET $key
        Write-Host "   💾 Value: $value" -ForegroundColor Gray
    }
}

# Main
Write-Host "Checking timeout keys..." -ForegroundColor White
Write-Host ""

Check-KeyTTL "order_timeout:*"

Write-Host ""
Write-Host "=== CONTINUOUS MONITORING MODE ===" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

$count = 0
while ($true) {
    $count++
    Write-Host "[$count] Checking at $(Get-Date -Format 'HH:mm:ss')..." -ForegroundColor DarkGray

    $keys = redis-cli -h $redisHost -p $redisPort --user $redisUser -a $redisPass --no-auth-warning KEYS "order_timeout:*"

    if ([string]::IsNullOrWhiteSpace($keys)) {
        Write-Host "    No active timeout keys" -ForegroundColor DarkGray
    }
    else {
        $keyArray = $keys -split "`n" | Where-Object { $_ -ne "" }
        foreach ($key in $keyArray) {
            $key = $key.Trim()
            if ([string]::IsNullOrWhiteSpace($key)) { continue }

            $ttl = redis-cli -h $redisHost -p $redisPort --user $redisUser -a $redisPass --no-auth-warning TTL $key

            if ($ttl -ge 0) {
                $minutes = [math]::Floor($ttl / 60)
                $seconds = $ttl % 60
                Write-Host "    $key -> ${minutes}m ${seconds}s" -ForegroundColor Yellow
            }
        }
    }

    Start-Sleep -Seconds 5
}

