# Vibe Coding Template - Full Stack Application

一个生产就绪的全栈应用模板,包含 NestJS 后端和 React 前端,支持用户认证、Google OAuth 和 Railway 部署。

## 项目结构

```
vibe_coding_template_nestjs/
├── client/              # React 前端项目
│   ├── src/            # 源代码
│   ├── public/         # 静态资源
│   ├── package.json
│   └── vite.config.ts
├── server/              # NestJS 后端项目
│   ├── src/            # 源代码
│   ├── test/           # 测试文件
│   ├── prisma/         # 数据库模型和迁移
│   ├── package.json
│   └── tsconfig.json
├── documents/           # 项目文档
├── start-dev.sh        # 开发环境启动脚本
├── railway.json        # Railway 部署配置
└── README.md           # 本文件
```

## 技术栈

### 后端 (server/)
- **框架**: NestJS
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **认证**: JWT + Passport
- **OAuth**: Google OAuth 2.0
- **部署**: Railway

### 前端 (client/)
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **状态管理**: Context API

## 快速开始

### 前置要求

- Node.js 20+
- pnpm
- PostgreSQL (本地开发)

### 一键启动(推荐)

```bash
# 克隆项目
git clone https://github.com/feizhen/vibe_coding_template_nestjs.git
cd vibe_coding_template_nestjs

# 配置环境变量
cp server/.env.example server/.env
cp client/.env.example client/.env

# 修改 server/.env 中的数据库配置

# 运行数据库迁移
cd server
pnpm install
pnpm prisma:migrate
cd ..

# 启动开发服务器(前后端同时启动)
./start-dev.sh
```

访问:
- **前端**: http://localhost:5173
- **后端API**: http://localhost:3000/api

### 分别启动

如果你想分别启动前后端:

```bash
# 终端1: 启动后端
cd server
pnpm install
pnpm start:dev      # http://localhost:3000

# 终端2: 启动前端
cd client
pnpm install
pnpm dev            # http://localhost:5173
```

## 环境配置

### 后端环境变量 (server/.env)

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/auth/google/callback"

# 前端URL
FRONTEND_URL="http://localhost:5173"
```

### 前端环境变量 (client/.env)

```env
VITE_API_URL=http://localhost:3000
```

## 功能特性

### ✨ 后端功能
- ✅ 用户注册和登录
- ✅ JWT 认证和自动刷新
- ✅ Google OAuth 2.0 登录
- ✅ 用户资料管理
- ✅ 数据库迁移
- ✅ 全局异常处理
- ✅ 请求日志记录
- ✅ 健康检查端点
- ✅ CORS配置
- ✅ 安全头(Helmet)

### 🎨 前端功能
- ✅ 登录/注册页面
- ✅ Google OAuth 登录
- ✅ 受保护的首页
- ✅ 自动Token刷新
- ✅ 路由守卫
- ✅ 响应式设计
- ✅ 错误处理和提示
- ✅ 加载状态管理

## API端点

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户退出
- `POST /api/auth/refresh` - 刷新token
- `GET /api/auth/me` - 获取当前用户
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - OAuth回调

### 用户
- `GET /api/users/profile` - 获取用户资料
- `PATCH /api/users/profile` - 更新用户资料
- `DELETE /api/users/account` - 删除账号

### 健康检查
- `GET /health` - 应用健康检查
- `GET /health/db` - 数据库健康检查

## 部署到Railway

### 自动部署

1. 连接GitHub仓库到Railway
2. 配置环境变量(参考 `server/.env.example`)
3. Railway会自动检测 `railway.json` 并构建部署

### 环境变量配置

在Railway项目设置中添加:
- `DATABASE_URL` (Railway PostgreSQL自动提供)
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `FRONTEND_URL`

详细步骤: [server/RAILWAY_ENV_SETUP.md](./server/RAILWAY_ENV_SETUP.md)

## 开发命令

### 后端

```bash
cd server

pnpm start:dev      # 开发服务器
pnpm build          # 构建
pnpm start:prod     # 生产服务器
pnpm test           # 测试
pnpm lint           # 代码检查

# Prisma
pnpm prisma:generate  # 生成Client
pnpm prisma:migrate   # 数据库迁移
pnpm prisma:studio    # 数据库管理界面
```

### 前端

```bash
cd client

pnpm dev            # 开发服务器
pnpm build          # 构建
pnpm preview        # 预览构建
```

## 项目文档

- [后端README](./server/README.md) - NestJS后端详细文档
- [前端README](./client/README.md) - React前端详细文档
- [前端设置指南](./FRONTEND_SETUP.md) - 前端项目设置
- [Railway部署](./server/RAILWAY_ENV_SETUP.md) - Railway部署指南

## 许可证

MIT License

---

🤖 这是一个模板项目,欢迎根据实际需求进行修改和扩展。
