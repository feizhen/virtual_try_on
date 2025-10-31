#!/bin/bash

# 停止所有服务脚本

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 停止所有服务${NC}"
echo ""

# 停止前端
echo -e "${BLUE}停止前端服务...${NC}"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo -e "${GREEN}  ✅ 前端已停止${NC}" || echo -e "${YELLOW}  ⚠️  前端未运行${NC}"

# 停止后端
echo -e "${BLUE}停止后端服务...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}  ✅ 后端已停止${NC}" || echo -e "${YELLOW}  ⚠️  后端未运行${NC}"

# 停止 Docker 容器
echo -e "${BLUE}停止 Docker 容器...${NC}"
if docker info > /dev/null 2>&1; then
  cd server
  docker compose stop
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Docker 容器已停止${NC}"
  else
    echo -e "${RED}  ❌ 停止 Docker 容器失败${NC}"
  fi
  cd ..
else
  echo -e "${YELLOW}  ⚠️  Docker 未运行${NC}"
fi

echo ""
echo -e "${GREEN}✅ 所有服务已停止${NC}"
echo ""
echo -e "${BLUE}💡 提示:${NC}"
echo -e "   - 使用 ${GREEN}./dev.sh${NC} 重新启动开发环境"
echo -e "   - 使用 ${GREEN}docker compose start${NC} (在 server 目录) 只启动数据库"
echo -e "   - 使用 ${GREEN}docker compose down${NC} (在 server 目录) 完全删除容器"
