# Virtual Try-On - AI 虚拟换装应用

一个基于 AI 的虚拟换装应用，允许用户上传照片并虚拟试穿不同的服装。

## 项目结构

```
virtual_try_on/
├── client/              # React 前端项目
├── server/              # NestJS 后端项目
│   ├── src/            # 源代码
│   ├── prisma/         # 数据库模型和迁移
│   ├── Dockerfile      # Docker 配置
│   └── docker-compose.prod.yml
├── dev.sh              # 开发环境启动脚本
└── README.md           # 本文件
```

## 技术栈

### 后端
- **框架**: NestJS
- **数据库**: PostgreSQL
- **缓存**: Redis
- **ORM**: Prisma
- **认证**: JWT + Google OAuth
- **部署**: Docker + 阿里云 ECS

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **HTTP客户端**: Axios

## 快速开始

### 开发环境

```bash
# 克隆项目
git clone https://github.com/feizhen/virtual_try_on.git
cd virtual_try_on

# 配置环境变量
cp server/.env.example server/.env
cp client/.env.example client/.env

# 启动开发服务器
./dev.sh
```

访问:
- **前端**: http://localhost:5173
- **后端API**: http://localhost:3000/api

### 生产环境部署

```bash
cd server
bash deploy.sh
```

## 主要功能

- ✅ 用户注册和登录
- ✅ Google OAuth 登录
- ✅ 上传模特照片
- ✅ 上传服装图片
- ✅ AI 虚拟换装
- ✅ 结果查看和管理

## API 端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户

### 虚拟换装
- `POST /api/outfit-change/models/upload` - 上传模特照片
- `GET /api/outfit-change/models` - 获取模特照片列表
- `POST /api/outfit-change/clothing/upload` - 上传服装
- `GET /api/outfit-change/clothing` - 获取服装列表
- `POST /api/outfit-change/tryon` - 执行虚拟换装
- `GET /api/outfit-change/results` - 获取结果

### 健康检查
- `GET /health` - 应用健康检查
- `GET /health/db` - 数据库健康检查

## 环境变量配置

### server/.env

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/vibe_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"

# AI API
OPENAI_API_KEY="your-openai-key"
```

## 许可证

MIT License
