# 快速开始指南

5 分钟快速启动这个 NestJS 模板项目!

## 前置要求

确保已安装:
- Node.js 18+
- pnpm 8+
- Docker (用于本地 PostgreSQL)

## 快速启动步骤

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd vibe_coding_template_nestjs
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动数据库

使用 Docker Compose:

```bash
docker-compose up -d
```

或者使用单独的 Docker 命令:

```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vibe_db \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 4. 配置环境变量

项目已经包含一个开发环境配置的 `.env` 文件,可以直接使用。

如果需要自定义,编辑 `.env`:

```bash
# 数据库连接
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vibe_db?schema=public"

# JWT 密钥 (开发环境)
JWT_SECRET=dev-jwt-secret-key-please-change-in-production-environment
JWT_REFRESH_SECRET=dev-refresh-secret-please-change-in-production-env
```

### 5. 运行数据库迁移

```bash
pnpm prisma:migrate
```

当提示输入迁移名称时,输入:

```
init
```

### 6. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 7. 启动开发服务器

```bash
pnpm start:dev
```

应用将在 http://localhost:3000 启动

### 8. 测试 API

#### 健康检查

```bash
curl http://localhost:3000/health
```

应该返回:

```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "environment": "development"
}
```

#### 注册新用户

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User"
  }'
```

成功后会返回用户信息和访问令牌。

#### 登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

#### 访问受保护的端点

使用返回的 `accessToken`:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 使用 Prisma Studio

Prisma Studio 是一个可视化的数据库管理工具:

```bash
pnpm prisma:studio
```

浏览器会自动打开 http://localhost:5555

## 常见问题

### 端口 5432 已被占用

如果 PostgreSQL 端口已被占用,可以:

1. 停止现有的 PostgreSQL 实例
2. 或修改 `docker-compose.yml` 使用不同端口

### 数据库连接失败

确保 Docker 容器正在运行:

```bash
docker ps
```

检查数据库日志:

```bash
docker logs vibe_postgres
```

### Prisma Client 未生成

运行:

```bash
pnpm prisma:generate
```

### 端口 3000 已被占用

修改 `.env` 中的端口:

```env
PORT=3001
```

然后重启开发服务器。

## 下一步

- 📖 阅读完整的 [README.md](README.md)
- 🚀 查看 [API 文档](API.md)
- 🌐 配置 [Google OAuth](README.md#google-oauth-配置)
- 🚂 学习如何[部署到 Railway](DEPLOYMENT.md)
- 🧪 运行测试: `pnpm test`

## 开发工具

### 代码格式化

```bash
pnpm format
```

### 代码检查

```bash
pnpm lint
```

### 运行测试

```bash
# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e

# 测试覆盖率
pnpm test:cov
```

### 查看数据库

```bash
pnpm prisma:studio
```

## 项目结构概览

```
src/
├── config/              # 配置模块
├── common/              # 公共模块 (guards, interceptors, etc.)
├── database/            # Prisma 服务
├── modules/
│   ├── auth/           # 认证模块 (注册、登录、JWT、Google OAuth)
│   ├── users/          # 用户模块
│   └── health/         # 健康检查
├── app.module.ts       # 根模块
└── main.ts             # 应用入口
```

## 可用的 API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - 刷新令牌
- `POST /api/auth/logout` - 退出
- `GET /api/auth/me` - 获取当前用户

### 用户
- `GET /api/users/profile` - 获取个人资料
- `PATCH /api/users/profile` - 更新个人资料
- `DELETE /api/users/account` - 删除账户

### 健康检查
- `GET /health` - 应用健康检查
- `GET /health/db` - 数据库健康检查

## 获取帮助

- 🐛 [报告 Bug](https://github.com/your-repo/issues)
- 💬 [提问和讨论](https://github.com/your-repo/discussions)
- 📚 [完整文档](README.md)

---

Happy Coding! 🎉
