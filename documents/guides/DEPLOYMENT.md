# 部署指南

本文档详细说明如何将此 NestJS 应用部署到 Railway 平台。

## Railway 部署

Railway 是一个现代化的云平台,提供简单的部署体验和自动化的基础设施管理。

### 前置条件

- GitHub 账号
- Railway 账号 (访问 https://railway.app 注册)
- 已将代码推送到 GitHub 仓库

### 方式一: 通过 Railway Dashboard 部署 (推荐)

#### 1. 创建 Railway 项目

1. 登录 Railway Dashboard
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 授权 Railway 访问你的 GitHub 账号
5. 选择包含此项目的仓库

#### 2. 添加 PostgreSQL 数据库

1. 在项目中点击 "+ New" 按钮
2. 选择 "Database"
3. 选择 "Add PostgreSQL"
4. Railway 会自动创建数据库并注入 `DATABASE_URL` 环境变量

#### 3. 配置环境变量

在 Railway 项目的 "Variables" 标签页中添加以下环境变量:

```bash
# 必需的环境变量
NODE_ENV=production
PORT=3000

# JWT 配置 (请使用强密码,至少 32 个字符)
JWT_SECRET=your-production-jwt-secret-at-least-32-characters-long
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-production-refresh-secret-at-least-32-characters
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth (如果使用)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.up.railway.app/api/auth/google/callback

# 前端 URL
FRONTEND_URL=https://your-frontend-domain.com

# Railway 会自动提供
# DATABASE_URL (由 PostgreSQL 插件自动注入)
```

生成强密码的方法:

```bash
# 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 或使用 OpenSSL
openssl rand -hex 32
```

#### 4. 配置部署设置

Railway 会自动检测到项目中的 `railway.json` 和 `nixpacks.toml` 文件。

确保 `railway.json` 包含正确的配置:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm run build && npx prisma generate && npx prisma migrate deploy"
  },
  "deploy": {
    "startCommand": "pnpm run start:prod",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 5. 部署应用

1. Railway 会自动开始构建和部署
2. 在 "Deployments" 标签页查看构建日志
3. 等待部署完成 (通常需要 2-5 分钟)

#### 6. 获取应用 URL

1. 在项目设置中点击 "Generate Domain"
2. Railway 会生成一个类似 `your-app.up.railway.app` 的域名
3. 也可以配置自定义域名

#### 7. 验证部署

访问健康检查端点:

```bash
curl https://your-app.up.railway.app/health
```

应该返回:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

检查数据库连接:

```bash
curl https://your-app.up.railway.app/health/db
```

### 方式二: 通过 Railway CLI 部署

#### 1. 安装 Railway CLI

```bash
# 使用 npm
npm install -g @railway/cli

# 或使用 Homebrew (macOS)
brew install railway
```

#### 2. 登录 Railway

```bash
railway login
```

这会打开浏览器进行身份验证。

#### 3. 初始化项目

在项目根目录运行:

```bash
railway init
```

选择 "Create a new project" 并输入项目名称。

#### 4. 添加 PostgreSQL

```bash
railway add --plugin postgresql
```

#### 5. 设置环境变量

```bash
# 单个设置
railway variables set JWT_SECRET="your-secret-key"
railway variables set NODE_ENV="production"

# 或从 .env 文件批量导入
railway variables set -f .env.production
```

#### 6. 部署应用

```bash
railway up
```

Railway 会:
1. 打包你的代码
2. 上传到 Railway
3. 运行构建命令
4. 启动应用

#### 7. 查看日志

```bash
railway logs
```

#### 8. 打开应用

```bash
railway open
```

### 常见问题排查

#### 构建失败

**问题**: `pnpm: command not found`

**解决方案**: 确保 `nixpacks.toml` 正确配置了 Node.js 环境。

**问题**: 数据库迁移失败

**解决方案**:
1. 检查 `DATABASE_URL` 环境变量是否正确
2. 在 Railway Dashboard 查看数据库日志
3. 手动运行迁移:

```bash
railway run npx prisma migrate deploy
```

#### 应用启动失败

**问题**: 应用无法启动

**解决方案**:
1. 检查环境变量是否完整
2. 查看部署日志:

```bash
railway logs
```

3. 确保所有必需的环境变量都已设置

#### 数据库连接错误

**问题**: `Error: Can't reach database server`

**解决方案**:
1. 确认 PostgreSQL 插件已添加
2. 检查 `DATABASE_URL` 是否正确注入
3. 在 Railway Dashboard 中重启数据库服务

### 自动部署

Railway 默认启用了自动部署:

- 每次推送到主分支时自动部署
- 可以在项目设置中配置部署分支
- 支持 GitHub PR 预览部署

### 监控和日志

#### 查看实时日志

在 Railway Dashboard:
1. 选择你的项目
2. 点击 "Deployments" 标签
3. 选择一个部署
4. 点击 "View Logs"

使用 CLI:

```bash
railway logs --follow
```

#### 性能监控

Railway 提供基本的性能指标:
- CPU 使用率
- 内存使用
- 网络流量

在项目的 "Metrics" 标签查看。

### 自定义域名

#### 添加自定义域名

1. 在 Railway Dashboard 中选择你的项目
2. 点击 "Settings" 标签
3. 在 "Domains" 部分点击 "Add Domain"
4. 输入你的域名 (例如 `api.yourdomain.com`)
5. 在你的 DNS 提供商处添加 CNAME 记录:

```
CNAME  api  your-app.up.railway.app
```

6. 等待 DNS 传播 (通常 5-30 分钟)

#### 更新环境变量

添加自定义域名后,更新以下环境变量:

```bash
APP_URL=https://api.yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
```

### 数据库管理

#### 连接到 Railway PostgreSQL

获取数据库连接信息:

```bash
railway variables | grep DATABASE_URL
```

使用 Prisma Studio:

```bash
railway run npx prisma studio
```

#### 数据库备份

Railway 提供自动备份功能(需付费计划)。

手动备份:

```bash
# 导出数据
railway run pg_dump $DATABASE_URL > backup.sql

# 恢复数据
railway run psql $DATABASE_URL < backup.sql
```

#### 运行迁移

```bash
# 生成迁移
railway run npx prisma migrate dev --name migration_name

# 应用迁移
railway run npx prisma migrate deploy

# 重置数据库 (危险!)
railway run npx prisma migrate reset
```

### 扩展和优化

#### 垂直扩展

Railway 根据你的使用量自动扩展资源。

#### 环境管理

创建多个环境:

1. 在 Railway 中创建新项目用于 staging
2. 使用不同的 GitHub 分支
3. 配置不同的环境变量

#### CI/CD 集成

Railway 已内置 CI/CD:
- 自动从 GitHub 部署
- PR 预览环境
- 部署回滚功能

### 成本估算

Railway 提供以下定价:

- **免费计划**: $5 免费额度/月
- **开发者计划**: $5/月起,按使用量计费
- **团队计划**: 联系销售

主要费用来源:
- 运行时间
- 内存使用
- 网络流量
- 数据库存储

### 生产环境检查清单

部署到生产前,确保:

- [ ] 所有环境变量都已正确配置
- [ ] JWT 密钥使用强随机字符串
- [ ] `NODE_ENV` 设置为 `production`
- [ ] 数据库迁移已成功运行
- [ ] 健康检查端点正常工作
- [ ] Google OAuth 回调 URL 更新为生产域名
- [ ] CORS 配置正确的前端域名
- [ ] 启用了 Railway 自动备份 (如适用)
- [ ] 配置了日志监控和告警
- [ ] 测试了所有主要 API 端点

### 额外资源

- [Railway 官方文档](https://docs.railway.app/)
- [Railway 社区](https://discord.gg/railway)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
- [NestJS 生产最佳实践](https://docs.nestjs.com/techniques/performance)

---

如有问题,请查看 Railway 文档或创建 Issue。
