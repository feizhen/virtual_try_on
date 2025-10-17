# 部署指南

## 后端部署 (Railway)

后端已部署到 Railway: https://web-production-8c703.up.railway.app

### 环境变量配置

在 Railway 项目中设置以下环境变量:

```bash
# 数据库
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# 前端 URL (用于 CORS)
FRONTEND_URL=https://your-frontend.vercel.app

# OAuth (可选)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

### 本地开发

```bash
cd server
pnpm install
pnpm start:dev
```

---

## 前端部署 (Vercel)

### 快速部署

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 导入 GitHub 仓库
3. Vercel 会自动检测 `vercel.json` 配置
4. 点击 Deploy

### 环境变量

在 Vercel 项目设置中添加:

```bash
VITE_API_URL=https://web-production-8c703.up.railway.app
```

### 本地开发

```bash
cd client
pnpm install
pnpm dev
```

### 本地构建测试

```bash
cd client
pnpm build        # 仅构建
pnpm build:check  # 构建 + TypeScript 类型检查
```

---

## 配置文件说明

### vercel.json
- 配置 Vercel 构建和部署
- 使用 npm 构建(避免 pnpm 兼容性问题)
- 配置 SPA 路由重写
- 添加安全响应头

### railway.json
- 配置 Railway 后端服务
- 健康检查路径
- 重启策略

### Dockerfile
- Railway 后端构建镜像
- 使用淘宝镜像加速

---

## 故障排查

### CORS 错误
确保 Railway 后端的 `FRONTEND_URL` 包含你的 Vercel 域名

### API 请求 404
检查 `VITE_API_URL` 是否正确设置

### 构建失败
查看 Vercel 构建日志,确认 `vercel.json` 配置正确

---

## 自动部署

- **后端**: 推送到 `main` 分支自动部署到 Railway
- **前端**: 推送到 `main` 分支自动部署到 Vercel
- **预览**: PR 会自动创建 Vercel 预览环境
