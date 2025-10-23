# Railway 部署设置指南

本指南将帮助你在 Railway 上设置完整的后端服务,包括 PostgreSQL 和 Redis。

## 前置要求

- 已安装 Railway CLI
- 已登录 Railway 账户 (`railway login`)
- 已创建 Railway 项目(或准备创建新项目)

## 完整设置步骤

### 1. 链接 Railway 项目

在 `server` 目录下运行:

```bash
cd /Users/bytedance/Claude/virtual_try_on/server
railway link
```

根据提示选择你的项目。如果还没有项目,可以先创建一个:

```bash
railway init
```

### 2. 添加数据库服务

运行准备好的脚本:

```bash
./setup-railway-services.sh
```

或者手动添加:

```bash
# 添加 PostgreSQL
railway add --database postgres

# 添加 Redis
railway add --database redis
```

### 3. 设置环境变量

运行环境变量设置脚本:

```bash
./set-railway-vars.sh
```

### 4. 设置额外的环境变量

根据你的实际部署情况,设置以下变量:

```bash
# 设置为生产环境
railway variables --set "NODE_ENV=production"

# 设置后端 URL(部署后从 Railway 获取)
railway variables --set "APP_URL=https://your-app.up.railway.app"

# 设置前端 URL
railway variables --set "FRONTEND_URL=https://your-frontend.vercel.app"
```

## 环境变量完整列表

### 自动设置的变量

这些变量由脚本 `set-railway-vars.sh` 自动设置:

- ✅ `JWT_SECRET` - JWT 签名密钥
- ✅ `JWT_EXPIRES_IN` - JWT 过期时间
- ✅ `JWT_REFRESH_SECRET` - JWT 刷新令牌密钥
- ✅ `JWT_REFRESH_EXPIRES_IN` - JWT 刷新令牌过期时间
- ✅ `APP_NAME` - 应用名称
- ✅ `GEMINI_API_KEY` - Gemini API 密钥
- ✅ `GEMINI_API_BASE_URL` - Gemini API 基础 URL
- ✅ `GEMINI_TIMEOUT` - Gemini API 超时时间
- ✅ `UPLOAD_DIR` - 文件上传目录

### 需要手动设置的变量

- 📝 `NODE_ENV` - 环境类型(production)
- 📝 `APP_URL` - 后端应用 URL
- 📝 `FRONTEND_URL` - 前端应用 URL

### Railway 自动注入的变量

这些变量由 Railway 自动提供,无需手动设置:

- 🔄 `PORT` - 应用端口
- 🔄 `DATABASE_URL` - PostgreSQL 连接字符串
- 🔄 `REDIS_URL` - Redis 连接 URL(如果使用新版 Railway)
- 🔄 `REDIS_HOST` - Redis 主机地址
- 🔄 `REDIS_PORT` - Redis 端口

## 验证设置

### 查看所有环境变量

```bash
railway variables
```

### 查看项目状态

```bash
railway status
```

### 在浏览器中打开项目

```bash
railway open
```

## 连接到数据库

### 连接到 PostgreSQL

```bash
railway connect postgres
```

### 连接到 Redis

```bash
railway connect redis
```

## 部署应用

### 首次部署

```bash
railway up
```

### 查看部署日志

```bash
railway logs
```

## 数据库迁移

如果你使用 Prisma,需要在部署后运行迁移:

```bash
# 方法 1: 使用 Railway CLI
railway run npx prisma migrate deploy

# 方法 2: 在 package.json 中添加 build 脚本
# "build": "prisma generate && prisma migrate deploy && nest build"
```

## 故障排查

### 检查服务是否正常运行

```bash
railway status
```

### 查看最近的日志

```bash
railway logs
```

### 查看特定服务的日志

```bash
railway logs --service <service-name>
```

### 重新部署

```bash
railway up --detach
```

## 有用的命令

```bash
# 查看所有项目
railway list

# 查看当前项目信息
railway status

# 查看环境变量
railway variables

# 在本地使用 Railway 环境变量运行命令
railway run npm run start:dev

# 打开项目控制台
railway open

# 查看文档
railway docs
```

## 注意事项

1. **安全性**:
   - 不要将 `.env` 文件提交到 git
   - JWT 密钥和 API 密钥应该保密
   - 生产环境应该使用强密码和随机生成的密钥

2. **数据库**:
   - Railway 的 PostgreSQL 和 Redis 服务会自动备份
   - 数据库连接信息会自动注入到环境变量中

3. **文件上传**:
   - Railway 的文件系统是临时的
   - 建议使用对象存储服务(如 AWS S3, Cloudflare R2)来存储上传的文件

4. **域名**:
   - 可以在 Railway 控制台中添加自定义域名
   - Railway 会自动提供 HTTPS 证书

## 下一步

1. ✅ 完成上述所有设置步骤
2. 📝 更新 `FRONTEND_URL` 和 `APP_URL`
3. 🚀 部署应用: `railway up`
4. 🔍 监控日志: `railway logs`
5. 🎉 在浏览器中访问你的应用

## 相关资源

- [Railway 官方文档](https://docs.railway.app/)
- [Railway CLI 文档](https://docs.railway.app/develop/cli)
- [Railway 数据库指南](https://docs.railway.app/databases/postgresql)
