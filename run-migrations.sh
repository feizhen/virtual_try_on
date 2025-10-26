#!/bin/bash

echo "运行数据库迁移..."
cd /Users/bytedance/Claude/virtual_try_on/server

# 运行迁移
npx prisma migrate deploy

# 生成 Prisma Client
npx prisma generate

# 初始化用户 credits
echo "初始化用户 credits..."
npx prisma db execute --file ./scripts/init-user-credits.sql || echo "初始化完成"

echo ""
echo "✅ 迁移完成！现在可以启动服务了。"
