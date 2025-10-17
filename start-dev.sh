#!/bin/bash

# 启动开发环境脚本

echo "🚀 启动开发环境..."
echo ""

# 检查是否在项目根目录
if [ ! -d "server" ] || [ ! -d "client" ]; then
  echo "❌ 错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 检查依赖是否已安装
if [ ! -d "server/node_modules" ]; then
  echo "📦 安装后端依赖..."
  cd server && pnpm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 安装前端依赖..."
  cd client && pnpm install && cd ..
fi

echo ""
echo "✅ 依赖检查完成"
echo ""
echo "🔧 启动服务..."
echo ""
echo "后端运行在: http://localhost:3000"
echo "前端运行在: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 使用trap确保所有进程都被终止
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 在后台启动后端
cd server && pnpm start:dev &

# 等待后端启动
sleep 3

# 在后台启动前端
cd client && pnpm dev &

# 等待所有后台任务
wait
