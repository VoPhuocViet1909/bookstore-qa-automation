#!/bin/bash

# Script để cấu hình Redis enable keyspace notifications
# Chạy script này sau khi start Redis server

echo "Configuring Redis for keyspace notifications..."

# Kết nối đến Redis và set config
redis-cli -h redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com \
          -p 15646 \
          -a igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA \
          --user default \
          CONFIG SET notify-keyspace-events Ex

if [ $? -eq 0 ]; then
    echo "✅ Redis keyspace notifications enabled successfully!"
    echo "   Event type: Ex (Expired events)"
else
    echo "❌ Failed to configure Redis"
    exit 1
fi

# Verify configuration
echo ""
echo "Verifying configuration..."
redis-cli -h redis-15646.c277.us-east-1-3.ec2.cloud.redislabs.com \
          -p 15646 \
          -a igZNXMGnoLtmAPWDJYe0UyJSCGDbDAVA \
          --user default \
          CONFIG GET notify-keyspace-events

echo ""
echo "✅ Configuration complete!"
echo "   You can now use Redis Key Expiration for order timeout feature."

