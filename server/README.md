# Vibe Coding Template - NestJS

> 一个生产级别的 NestJS 模板项目,开箱即用,支持用户认证、Google OAuth 登录和 Railway 一键部署。

## 📚 文档导航

- 📖 [快速开始指南](documents/guides/QUICKSTART.md) - 5 分钟快速启动
- 📡 [完整 API 文档](documents/guides/API.md) - 详细的 API 接口说明
- 🚀 [部署指南](documents/guides/DEPLOYMENT.md) - Railway 部署详细步骤
- 🤝 [贡献指南](documents/guides/CONTRIBUTING.md) - 如何为项目做贡献
- 📊 [项目总结](documents/guides/PROJECT_SUMMARY.md) - 项目实现总结

## 特性

- ✅ **用户认证系统** - 完整的注册/登录功能,支持 JWT 认证
- ✅ **Google OAuth 2.0** - 一键 Google 登录集成
- ✅ **PostgreSQL + Prisma** - 类型安全的数据库 ORM
- ✅ **Railway 部署** - 一键部署到 Railway 平台
- ✅ **TypeScript** - 完整的类型安全
- ✅ **安全最佳实践** - Helmet、CORS、密码加密等
- ✅ **统一响应格式** - 标准化的 API 响应
- ✅ **全局异常处理** - 优雅的错误处理
- ✅ **请求日志** - 自动记录所有 HTTP 请求
- ✅ **健康检查** - 应用和数据库健康检查端点
- ✅ **E2E 测试** - 完整的端到端测试

## 技术栈

- **NestJS 10** - 企业级 Node.js 框架
- **TypeScript 5** - 类型安全的 JavaScript
- **PostgreSQL** - 关系型数据库
- **Prisma 5** - 现代化 ORM
- **JWT** - JSON Web Token 认证
- **Passport** - 认证中间件
- **pnpm** - 快速的包管理器

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm >= 8
- PostgreSQL >= 14
- Docker (可选,用于本地数据库)

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制环境变量示例文件:

```bash
cp .env.example .env
```

编辑 `.env` 文件,填写必要的配置:

```env
# 数据库连接
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vibe_db?schema=public"

# JWT 密钥 (生产环境请更换)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# Google OAuth (可选,如需使用 Google 登录)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# 前端 URL
FRONTEND_URL=http://localhost:5173
```

### 3. 启动数据库

使用 Docker 快速启动 PostgreSQL:

```bash
docker run --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### 4. 运行数据库迁移

```bash
pnpm prisma:migrate
```

### 5. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 6. 启动开发服务器

```bash
pnpm start:dev
```

应用将在 http://localhost:3000 启动

## 可用脚本

```bash
# 开发
pnpm start:dev          # 启动开发服务器 (热重载)
pnpm start:debug        # 启动调试模式

# 构建和生产
pnpm build              # 构建生产版本
pnpm start:prod         # 启动生产服务器

# 代码质量
pnpm lint               # 运行 ESLint
pnpm format             # 格式化代码

# 测试
pnpm test               # 运行单元测试
pnpm test:watch         # 监听模式运行测试
pnpm test:cov           # 生成测试覆盖率
pnpm test:e2e           # 运行 E2E 测试

# Prisma
pnpm prisma:generate    # 生成 Prisma Client
pnpm prisma:migrate     # 运行数据库迁移
pnpm prisma:studio      # 打开 Prisma Studio (数据库 GUI)
```

## API 文档

### 认证端点

| 方法   | 端点                           | 描述                  | 需要认证 |
|--------|--------------------------------|-----------------------|----------|
| POST   | `/api/auth/register`           | 用户注册              | ❌       |
| POST   | `/api/auth/login`              | 用户登录              | ❌       |
| GET    | `/api/auth/google`             | Google OAuth 登录     | ❌       |
| GET    | `/api/auth/google/callback`    | Google OAuth 回调     | ❌       |
| POST   | `/api/auth/refresh`            | 刷新访问令牌          | ❌       |
| POST   | `/api/auth/logout`             | 退出登录              | ✅       |
| GET    | `/api/auth/me`                 | 获取当前用户信息      | ✅       |

### 用户端点

| 方法   | 端点                  | 描述                  | 需要认证 |
|--------|----------------------|-----------------------|----------|
| GET    | `/api/users/profile` | 获取个人资料          | ✅       |
| PATCH  | `/api/users/profile` | 更新个人资料          | ✅       |
| DELETE | `/api/users/account` | 删除账户              | ✅       |

### 健康检查

| 方法   | 端点         | 描述                  |
|--------|-------------|-----------------------|
| GET    | `/health`   | 应用健康检查          |
| GET    | `/health/db`| 数据库健康检查        |

### 请求示例

#### 注册新用户

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

响应:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "provider": "local",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/register"
}
```

#### 用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### 访问受保护的路由

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Google OAuth 配置

### 1. 创建 Google OAuth 应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据:
   - 应用类型: Web 应用
   - 授权重定向 URI: `http://localhost:3000/api/auth/google/callback`

### 2. 配置环境变量

将获取的 Client ID 和 Client Secret 添加到 `.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. 使用 Google 登录

前端重定向到:

```
http://localhost:3000/api/auth/google
```

用户授权后,将重定向回:

```
http://localhost:5173/auth/callback?token=ACCESS_TOKEN&refresh=REFRESH_TOKEN
```

## Railway 部署

### 方式一: GitHub 集成 (推荐)

1. **将代码推送到 GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

2. **在 Railway 创建项目**

   - 访问 [Railway](https://railway.app)
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **添加 PostgreSQL 数据库**

   - 在项目中点击 "New Service"
   - 选择 "PostgreSQL"
   - Railway 会自动注入 `DATABASE_URL` 环境变量

4. **配置环境变量**

   在 Railway 项目设置中添加以下变量:

   ```
   NODE_ENV=production
   JWT_SECRET=your-production-jwt-secret-min-32-characters
   JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-characters
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://your-app.railway.app/api/auth/google/callback
   FRONTEND_URL=https://your-frontend-url.com
   ```

5. **部署**

   Railway 会自动检测到 `railway.json` 并开始部署。

### 方式二: Railway CLI

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录
railway login

# 初始化项目
railway init

# 添加 PostgreSQL
railway add --plugin postgresql

# 配置环境变量
railway variables set JWT_SECRET="your-secret"

# 部署
railway up

# 查看日志
railway logs
```

### 部署后检查

访问健康检查端点确认部署成功:

```
https://your-app.railway.app/health
```

## 项目结构

```
vibe_coding_template_nestjs/
├── prisma/                     # Prisma 配置和迁移
│   ├── schema.prisma          # 数据库模型定义
│   └── migrations/            # 数据库迁移文件
├── src/
│   ├── config/                # 配置模块
│   │   ├── configuration.ts   # 应用配置
│   │   └── validation.ts      # 环境变量验证
│   ├── common/                # 公共模块
│   │   ├── decorators/        # 自定义装饰器
│   │   ├── filters/           # 异常过滤器
│   │   ├── guards/            # 路由守卫
│   │   ├── interceptors/      # 拦截器
│   │   ├── pipes/             # 管道
│   │   └── interfaces/        # 公共接口
│   ├── database/              # 数据库模块
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── modules/
│   │   ├── auth/              # 认证模块
│   │   │   ├── dto/           # 数据传输对象
│   │   │   ├── strategies/    # Passport 策略
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/             # 用户模块
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   └── health/            # 健康检查模块
│   ├── app.module.ts          # 根模块
│   └── main.ts                # 应用入口
├── test/                      # 测试文件
│   ├── app.e2e-spec.ts
│   └── auth.e2e-spec.ts
├── .env                       # 环境变量
├── .env.example               # 环境变量示例
├── railway.json               # Railway 配置
├── nixpacks.toml              # Nixpacks 配置
└── package.json               # 项目依赖
```

## 安全最佳实践

本项目已实现以下安全措施:

- ✅ **密码加密** - 使用 bcrypt (10 轮加盐)
- ✅ **JWT 认证** - 访问令牌 (7天) + 刷新令牌 (30天)
- ✅ **Helmet** - 设置安全的 HTTP 头
- ✅ **CORS** - 跨域资源共享配置
- ✅ **输入验证** - class-validator 严格验证
- ✅ **SQL 注入防护** - Prisma ORM 参数化查询
- ✅ **环境变量** - 敏感信息不提交到代码库
- ✅ **密码策略** - 最少 8 位,包含大小写字母和数字/特殊字符

### 生产环境建议

1. **更换 JWT 密钥**: 确保 `JWT_SECRET` 和 `JWT_REFRESH_SECRET` 至少 32 个字符
2. **启用 HTTPS**: 生产环境必须使用 HTTPS
3. **配置 Rate Limiting**: 防止暴力破解
4. **日志监控**: 集成 Sentry 或类似服务
5. **定期更新依赖**: 使用 `pnpm update` 更新依赖

## 扩展功能

可以快速集成的功能:

- [ ] 邮箱验证
- [ ] 密码重置
- [ ] 双因素认证 (2FA)
- [ ] 角色和权限管理 (RBAC)
- [ ] 文件上传 (AWS S3)
- [ ] Redis 缓存
- [ ] WebSocket 支持
- [ ] Swagger API 文档
- [ ] Docker 容器化

## 故障排除

### 数据库连接失败

确保 PostgreSQL 正在运行:

```bash
docker ps
```

检查 `DATABASE_URL` 是否正确:

```bash
echo $DATABASE_URL
```

### Prisma Client 未生成

```bash
pnpm prisma:generate
```

### 端口已被占用

修改 `.env` 中的 `PORT`:

```env
PORT=3001
```

## 贡献

欢迎提交 Issue 和 Pull Request!

## 许可证

MIT

## 联系方式

如有问题,请创建 Issue 或联系维护者。

---

**Happy Coding! 🚀**
