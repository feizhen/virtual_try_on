#!/bin/bash

# Git Auto-Deploy Webhook Script
# This script pulls the latest code and redeploys the application

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PROJECT_DIR="/opt/virtual-try-on/server"
LOG_FILE="/var/log/virtual-try-on-deploy.log"
LOCK_FILE="/tmp/deploy.lock"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send notification (optional - can integrate with webhook services)
notify() {
    # Add your notification logic here (e.g., send to Slack, DingTalk, etc.)
    log "📢 $1"
}

# Check if another deployment is running
if [ -f "$LOCK_FILE" ]; then
    log "❌ Another deployment is already running"
    exit 1
fi

# Create lock file
touch "$LOCK_FILE"

# Ensure lock file is removed on exit
trap "rm -f $LOCK_FILE" EXIT

log "========================================="
log "🚀 Starting auto-deployment"
log "========================================="

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Fetch latest changes
log "📥 Fetching latest changes from Git..."
git fetch origin

# Check if there are new changes
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "✅ Already up to date"
    exit 0
fi

log "📦 New changes detected, pulling code..."
git pull origin main

# Check if server files changed
if git diff --name-only HEAD@{1} HEAD | grep -qE "^server/"; then
    log "🔄 Server files changed, redeploying..."

    # Run deployment
    log "🏗️  Running deployment script..."
    bash "$PROJECT_DIR/deploy.sh" >> "$LOG_FILE" 2>&1

    if [ $? -eq 0 ]; then
        log "✅ Deployment successful"
        notify "✅ Virtual Try-On deployed successfully"
    else
        log "❌ Deployment failed"
        notify "❌ Virtual Try-On deployment failed - check logs"
        exit 1
    fi
else
    log "ℹ️  No server changes detected"
fi

log "========================================="
log "✅ Auto-deployment completed"
log "========================================="
