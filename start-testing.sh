#!/bin/bash

# Credit System 测试快速启动脚本
# 用法: ./start-testing.sh

set -e

echo "🚀 Credit System 测试环境启动脚本"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    echo "请安装 Docker 或手动启动 PostgreSQL 数据库"
    echo "参考: TEST_CREDIT_SYSTEM.md"
    exit 1
fi

echo "✓ Docker 已安装"
echo ""

# 检查数据库容器是否已存在
if docker ps -a | grep -q vibe-postgres; then
    echo -e "${YELLOW}⚠️  数据库容器已存在${NC}"

    # 检查是否正在运行
    if docker ps | grep -q vibe-postgres; then
        echo -e "${GREEN}✓ 数据库容器正在运行${NC}"
    else
        echo "启动现有容器..."
        docker start vibe-postgres
        echo -e "${GREEN}✓ 数据库容器已启动${NC}"
    fi
else
    echo "创建并启动 PostgreSQL 容器..."
    docker run --name vibe-postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=vibe_db \
      -p 5433:5432 \
      -d postgres:14

    echo -e "${GREEN}✓ PostgreSQL 容器已创建并启动${NC}"
    echo "等待数据库初始化（5秒）..."
    sleep 5
fi

echo ""
echo "=================================="
echo "📊 数据库信息"
echo "=================================="
echo "主机: localhost"
echo "端口: 5433"
echo "数据库: vibe_db"
echo "用户: postgres"
echo "密码: postgres"
echo ""

# 询问是否运行迁移
echo -e "${YELLOW}是否运行数据库迁移？${NC}"
echo "1) 是，运行迁移（首次启动或有新迁移时选择）"
echo "2) 否，跳过迁移"
read -p "请选择 [1/2]: " run_migration

if [ "$run_migration" = "1" ]; then
    echo ""
    echo "运行数据库迁移..."
    cd server

    # 运行迁移
    npx prisma migrate deploy

    # 生成 Prisma Client
    npx prisma generate

    # 初始化用户 credits
    echo "初始化用户 credits..."
    npx prisma db execute --file ./scripts/init-user-credits.sql || echo "初始化脚本执行完成（可能已经初始化过）"

    cd ..
    echo -e "${GREEN}✓ 数据库迁移完成${NC}"
fi

echo ""
echo "=================================="
echo "🎉 数据库就绪！"
echo "=================================="
echo ""
echo "下一步："
echo ""
echo "1. 启动后端服务（新终端）:"
echo "   cd server && pnpm dev"
echo ""
echo "2. 启动前端服务（新终端）:"
echo "   cd client && pnpm dev"
echo ""
echo "3. 打开浏览器访问:"
echo "   http://localhost:5173"
echo ""
echo "4. 开始测试 Credit 系统"
echo "   参考: TEST_CREDIT_SYSTEM.md"
echo ""
echo "停止数据库:"
echo "   docker stop vibe-postgres"
echo ""
echo "删除数据库容器:"
echo "   docker rm vibe-postgres"
echo ""
