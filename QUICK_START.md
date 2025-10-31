# 🚀 快速启动指南

## 前置要求

- ✅ Node.js 18+ 已安装
- ✅ Docker Desktop 已安装并运行

## 一键启动

```bash
./dev.sh
```

就这么简单!脚本会自动:

1. 🐳 检查并启动 Docker
2. 🗄️ 启动 PostgreSQL 和 Redis 容器
3. 🎨 启动前端服务(后台)
4. 🔥 启动后端服务(前台,显示日志)

## 访问地址

启动后访问:

- **前端**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **API 文档**: http://localhost:3000/api

## 停止服务

按 `Ctrl+C` 停止,或运行:

```bash
./stop.sh
```

## 没有 Docker?

请先安装 Docker Desktop:
👉 https://www.docker.com/products/docker-desktop/

详细说明: [DOCKER_SETUP.md](./DOCKER_SETUP.md)

## TOS 云存储配置

项目已集成火山引擎 TOS 云存储!

配置文件: `server/.env`
```bash
STORAGE_TYPE=tos  # 'local' 或 'tos'
TOS_ACCESS_KEY_ID=你的密钥
TOS_SECRET_ACCESS_KEY=你的密钥
TOS_BUCKET=virtual-tryon
```

测试 TOS 连接:
```bash
cd server
npx ts-node scripts/test-tos-connection.ts
```

## 故障排查

### Docker 未运行?
```bash
# 手动启动 Docker Desktop
open -a Docker
```

### 端口被占用?
```bash
./stop.sh  # 停止所有服务
```

### 数据库连接失败?
```bash
cd server
docker compose restart postgres
```

---

🎉 更多详细文档请查看 [README.md](./README.md)
