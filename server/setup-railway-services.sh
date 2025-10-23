#!/bin/bash

# Railway 服务设置脚本
# 此脚本会添加 PostgreSQL 和 Redis 服务到你的 Railway 项目

set -e  # 遇到错误时退出

echo "🚀 开始设置 Railway 服务..."
echo ""

# 检查是否已链接项目
if ! railway status &> /dev/null; then
    echo "❌ 错误: 未链接 Railway 项目"
    echo "请先运行: railway link"
    exit 1
fi

echo "✅ Railway 项目已链接"
echo ""

# 添加 PostgreSQL
echo "📦 添加 PostgreSQL 数据库..."
if railway add --database postgres; then
    echo "✅ PostgreSQL 添加成功!"
else
    echo "⚠️  PostgreSQL 添加失败或已存在"
fi
echo ""

# 添加 Redis
echo "📦 添加 Redis 数据库..."
if railway add --database redis; then
    echo "✅ Redis 添加成功!"
else
    echo "⚠️  Redis 添加失败或已存在"
fi
echo ""

echo "🎉 服务设置完成!"
echo ""
echo "📝 接下来的步骤:"
echo "1. 运行 'railway status' 查看所有服务"
echo "2. PostgreSQL 的 DATABASE_URL 会自动注入到你的应用"
echo "3. Redis 的连接信息也会自动注入"
echo "4. 运行 './set-railway-vars.sh' 设置其他环境变量"
echo ""
echo "💡 提示:"
echo "- 使用 'railway open' 在浏览器中打开项目控制台"
echo "- 使用 'railway variables' 查看所有环境变量"
echo "- 使用 'railway connect postgres' 连接到 PostgreSQL"
echo "- 使用 'railway connect redis' 连接到 Redis"
