#!/bin/bash

# Virtual Try-On Deployment Script
# Run with: bash deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "🚀 Virtual Try-On Deployment"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please run setup-server.sh first${NC}"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo "Please create .env.production with your configuration"
    exit 1
fi

# Check if Docker Compose file exists
if [ ! -f "docker-compose.prod.yml" ]; then
    echo -e "${RED}❌ docker-compose.prod.yml not found!${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down || true

# Remove old images (optional - uncomment to save space)
# echo "🗑️  Removing old images..."
# docker image prune -af

# Build and start services
echo "🏗️  Building Docker images..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
docker compose -f docker-compose.prod.yml exec -T app npx prisma generate

# Check service health
echo ""
echo "🏥 Checking service health..."
sleep 5

# Check if containers are running
POSTGRES_STATUS=$(docker compose -f docker-compose.prod.yml ps postgres --format json | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)
REDIS_STATUS=$(docker compose -f docker-compose.prod.yml ps redis --format json | grep -o '"Health":"[^"]*"' | cut -d'"' -f4)
APP_STATUS=$(docker compose -f docker-compose.prod.yml ps app --format json | grep -o '"State":"[^"]*"' | cut -d'"' -f4)

echo "PostgreSQL: $POSTGRES_STATUS"
echo "Redis: $REDIS_STATUS"
echo "Application: $APP_STATUS"

# Display running containers
echo ""
echo "📊 Running containers:"
docker compose -f docker-compose.prod.yml ps

# Display logs
echo ""
echo "📝 Recent logs:"
docker compose -f docker-compose.prod.yml logs --tail=20

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || echo "localhost")

echo ""
echo "========================================="
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo "========================================="
echo ""
echo "📍 Your application is running at:"
echo "   http://${SERVER_IP}:${PORT:-3000}"
echo ""
echo "📊 Useful commands:"
echo "   View logs:       docker compose -f docker-compose.prod.yml logs -f"
echo "   Stop services:   docker compose -f docker-compose.prod.yml down"
echo "   Restart app:     docker compose -f docker-compose.prod.yml restart app"
echo "   Enter container: docker compose -f docker-compose.prod.yml exec app sh"
echo "   Check status:    docker compose -f docker-compose.prod.yml ps"
echo ""
echo "⚠️  Remember to:"
echo "   1. Configure Aliyun Security Group to allow port ${PORT:-3000}"
echo "   2. Update FRONTEND_URL in .env.production with your actual URL"
echo "   3. Set up SSL/HTTPS if using a domain name"
echo ""
