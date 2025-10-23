#!/bin/bash

# 设置 Railway 环境变量脚本
# 使用方法:
# 1. 先运行 railway link 链接你的项目
# 2. 然后运行 chmod +x set-railway-vars.sh && ./set-railway-vars.sh

echo "正在设置 Railway 环境变量..."

railway variables \
  --set "JWT_SECRET=I/233YtWBE0VQb04k0P6C42LOVGHPzcm9y7xG+XsGx4=" \
  --set "JWT_EXPIRES_IN=7d" \
  --set "JWT_REFRESH_SECRET=ft1Fa4KrT9EjwVClGK8klB9VVgo3O2Ml8uf8Eqa6RR8=" \
  --set "JWT_REFRESH_EXPIRES_IN=30d" \
  --set "APP_NAME=Vibe Coding Template" \
  --set "GEMINI_API_KEY=sk-PRV0HXW9ONOTIXDn52FdEf0fA02f466386F960C9C67eF576" \
  --set "GEMINI_API_BASE_URL=https://api.laozhang.ai" \
  --set "GEMINI_TIMEOUT=180" \
  --set "UPLOAD_DIR=uploads"

if [ $? -eq 0 ]; then
  echo "✅ 环境变量设置成功!"
  echo ""
  echo "⚠️  请注意还需要手动设置以下变量:"
  echo "  - APP_URL (你的 Railway 后端 URL)"
  echo "  - FRONTEND_URL (你的前端 URL)"
  echo "  - NODE_ENV=production"
  echo ""
  echo "如果使用 Railway 的 PostgreSQL 或 Redis,以下变量会自动注入:"
  echo "  - DATABASE_URL"
  echo "  - REDIS_HOST"
  echo "  - REDIS_PORT"
else
  echo "❌ 设置环境变量失败,请检查是否已链接项目"
fi
