#!/bin/bash

TUNNEL_URL_FILE="/var/lib/cloudflared/tunnel-url.txt"
TUNNEL_LOG_FILE="/var/log/cloudflared-tunnel.log"
FRONTEND_CONFIG_FILE="/home/ec2-user/ysi-backend/frontend/src/utils/environment.ts"
VERCEL_CONFIG_FILE="/home/ec2-user/ysi-backend/architecture/vercel/vercel.json"

mkdir -p /var/lib/cloudflared

start_tunnel() {
    echo "[$(date)] Starting Cloudflare tunnel..." >> $TUNNEL_LOG_FILE

    /usr/local/bin/cloudflared tunnel --url http://localhost:8080 --no-autoupdate 2>&1 | \
    while IFS= read -r line; do
        echo "$line" >> $TUNNEL_LOG_FILE

        if echo "$line" | grep -q "trycloudflare.com"; then
            URL=$(echo "$line" | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com')

            if [ ! -z "$URL" ]; then
                echo "$URL" > $TUNNEL_URL_FILE
                echo "[$(date)] Tunnel URL: $URL" >> $TUNNEL_LOG_FILE

                update_frontend_config "$URL"
            fi
        fi
    done
}

update_frontend_config() {
    local NEW_URL=$1
    local BASE_URL="${NEW_URL}/api/v1"

    echo "[$(date)] Updating frontend configuration with URL: $BASE_URL" >> $TUNNEL_LOG_FILE

    if [ -f "$FRONTEND_CONFIG_FILE" ]; then
        sed -i "s|https://[a-z0-9-]*\.trycloudflare\.com/api/v1|$BASE_URL|g" $FRONTEND_CONFIG_FILE
        echo "[$(date)] Updated frontend environment.ts" >> $TUNNEL_LOG_FILE
    fi

    if [ -f "$VERCEL_CONFIG_FILE" ]; then
        sed -i "s|\"VITE_API_BASE_URL\": \"https://[a-z0-9-]*\.trycloudflare\.com/api/v1\"|\"VITE_API_BASE_URL\": \"$BASE_URL\"|g" $VERCEL_CONFIG_FILE
        echo "[$(date)] Updated vercel.json" >> $TUNNEL_LOG_FILE
    fi

    cd /home/ec2-user/ysi-backend
    git add -A
    git commit -m "Auto-update: Cloudflare tunnel URL changed to $NEW_URL" || true
    git push || true

    echo "[$(date)] Configuration update complete" >> $TUNNEL_LOG_FILE
}

monitor_tunnel() {
    while true; do
        if ! pgrep -x "cloudflared" > /dev/null; then
            echo "[$(date)] Cloudflare tunnel not running, restarting..." >> $TUNNEL_LOG_FILE
            start_tunnel &
        fi
        sleep 30
    done
}

get_current_url() {
    if [ -f "$TUNNEL_URL_FILE" ]; then
        cat $TUNNEL_URL_FILE
    else
        echo "No tunnel URL available"
    fi
}

case "$1" in
    start)
        start_tunnel &
        monitor_tunnel
        ;;
    status)
        echo "Current Tunnel URL: $(get_current_url)"
        echo "Process Status:"
        pgrep -x "cloudflared" > /dev/null && echo "cloudflared is running" || echo "cloudflared is NOT running"
        ;;
    restart)
        pkill -f cloudflared
        sleep 2
        start_tunnel &
        monitor_tunnel
        ;;
    stop)
        pkill -f cloudflared
        echo "Tunnel stopped"
        ;;
    url)
        get_current_url
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|url}"
        exit 1
        ;;
esac