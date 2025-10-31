#!/bin/bash

# 快速启动脚本 - 后端日志优先显示

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 启动虚拟试衣开发环境${NC}"
echo ""

# 检查项目目录
if [ ! -d "server" ] || [ ! -d "client" ]; then
  echo "❌ 错误: 请在项目根目录运行此脚本"
  exit 1
fi

echo -e "${BLUE}⚡ 跳过 Docker 检测,直接启动应用...${NC}"
echo ""

# 保存前端进程PID的文件
FRONTEND_PID_FILE="/tmp/vto-frontend.pid"

# 清理函数
cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 正在停止所有服务...${NC}"

  # 停止后台任务
  kill $(jobs -p) 2>/dev/null

  # 停止前端进程
  if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
      kill $FRONTEND_PID 2>/dev/null
      # 也尝试kill整个进程组
      pkill -P $FRONTEND_PID 2>/dev/null
    fi
    rm -f "$FRONTEND_PID_FILE"
  fi

  # 清理端口
  lsof -ti:5173 | xargs kill -9 2>/dev/null

  wait 2>/dev/null
  echo -e "${GREEN}✅ 服务已停止${NC}"
  exit 0
}
trap cleanup EXIT INT TERM

# 启动前端 (后台运行,保存日志以检测端口)
echo -e "${BLUE}🎨 启动前端服务 (后台)...${NC}"
FRONTEND_LOG="/tmp/vto-frontend.log"
cd client
npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"
cd ..

# 等待前端启动
sleep 4

# 检查前端是否成功启动
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  警告: 前端启动失败${NC}"
  cat "$FRONTEND_LOG"
else
  # 检测实际运行的端口
  FRONTEND_PORT=$(lsof -p $FRONTEND_PID -a -i TCP -sTCP:LISTEN 2>/dev/null | grep -o ':\([0-9]\+\)' | head -1 | cut -d: -f2)
  if [ -z "$FRONTEND_PORT" ]; then
    FRONTEND_PORT="5173"
  fi
fi

# 服务信息
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 前端: ${NC}http://localhost:${FRONTEND_PORT} (PID: $FRONTEND_PID)"
echo -e "${GREEN}✅ 后端: ${NC}http://localhost:3000"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🔥 后端实时日志:${NC}"
echo ""

# 启动后端 (前台显示所有日志)
cd server && npm run start:dev
