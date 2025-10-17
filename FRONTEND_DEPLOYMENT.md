# 前端部署指南

本指南详细说明如何将React前端部署到Vercel。

## 目录

- [方案对比](#方案对比)
- [Vercel部署(推荐)](#vercel部署推荐)
- [Railway部署(备选)](#railway部署备选)
- [Netlify部署(备选)](#netlify部署备选)
- [故障排查](#故障排查)

---

## 方案对比

| 特性 | Vercel | Railway | Netlify |
|------|--------|---------|---------|
| 部署速度 | ⚡️⚡️⚡️ 极快 | ⚡️⚡️ 快 | ⚡️⚡️⚡️ 极快 |
| 免费额度 | 慷慨 | 有限 | 慷慨 |
| CDN覆盖 | 全球 | 有限 | 全球 |
| 配置复杂度 | 极简 | 中等 | 极简 |
| 与后端同平台 | ❌ | ✅ | ❌ |
| 自动HTTPS | ✅ | ✅ | ✅ |
| 预览部署 | ✅ | ✅ | ✅ |
| 推荐指数 | ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️⭐️ | ⭐️⭐️⭐️⭐️ |

**推荐**: Vercel (最佳性能和开发体验)

---

## Vercel部署(推荐)

### 前提条件

- GitHub账号
- 代码已推送到GitHub仓库
- 后端已部署到Railway并正常运行

### 步骤1: 连接仓库

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 "Add New..." → "Project"
3. 导入你的GitHub仓库
4. 授权Vercel访问仓库

### 步骤2: 配置项目

在项目配置页面设置:

#### 基本设置
- **Project Name**: `your-project-name` (可选)
- **Framework Preset**: Other (或Vite)
- **Root Directory**: 留空

#### 构建和输出设置
- **Build Command**:
  ```bash
  cd client && pnpm install && pnpm build
  ```
- **Output Directory**:
  ```
  client/dist
  ```
- **Install Command**:
  ```bash
  cd client && pnpm install
  ```

#### 环境变量
点击 "Environment Variables" 添加:

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `VITE_API_URL` | `https://your-backend.railway.app` | Production |
| `VITE_API_URL` | `https://your-backend.railway.app` | Preview |

> ⚠️ 注意: 将 `your-backend.railway.app` 替换为你的实际Railway后端URL

### 步骤3: 部署

1. 检查所有配置无误
2. 点击 "Deploy" 按钮
3. 等待构建完成(通常1-2分钟)
4. 获取Vercel部署URL: `https://your-project.vercel.app`

### 步骤4: 更新后端CORS配置

部署成功后,需要在Railway后端添加Vercel域名到CORS白名单:

1. 访问Railway项目
2. 进入后端服务的 "Variables" 标签
3. 添加或更新 `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```
4. 重新部署后端(Railway会自动重启)

> 💡 提示: 后端已配置自动允许所有 `.vercel.app` 域名,包括预览部署

### 步骤5: 验证部署

1. **访问前端URL**
   ```
   https://your-project.vercel.app
   ```

2. **测试功能**
   - ✅ 页面正常加载
   - ✅ 可以访问注册页面
   - ✅ 可以访问登录页面
   - ✅ API调用正常(检查浏览器Network标签)
   - ✅ 无CORS错误(检查Console)

3. **测试完整流程**
   ```
   注册 → 登录 → 访问首页 → 退出登录
   ```

---

## 自动部署配置

### Git集成

Vercel会自动监听GitHub仓库变化:

- **main分支**: 推送后自动部署到生产环境
- **其他分支**: 推送后自动创建预览部署
- **Pull Request**: 自动为每个PR创建预览环境

### 自定义域名(可选)

1. 在Vercel项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置DNS记录
4. Vercel自动配置HTTPS证书

---

## Railway部署(备选)

如果你希望前后端在同一平台管理,可以使用Railway部署前端。

### 创建Dockerfile

在项目根目录创建 `client.Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY client/package.json client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY client/ ./
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 创建Nginx配置

`client/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 在Railway创建服务

1. 在Railway项目中点击 "New Service"
2. 选择 "GitHub Repo"
3. 选择相同的仓库
4. 配置:
   - **Service Name**: `frontend`
   - **Dockerfile Path**: `client.Dockerfile`
   - **Environment Variables**:
     ```
     VITE_API_URL=https://your-backend.railway.app
     ```
5. 部署

---

## Netlify部署(备选)

Netlify是Vercel的优秀替代品。

### 部署步骤

1. 访问 [netlify.com](https://netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 连接GitHub仓库
4. 配置:
   - **Base directory**: 留空
   - **Build command**: `cd client && pnpm install && pnpm build`
   - **Publish directory**: `client/dist`
5. 添加环境变量:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
6. 部署

---

## 故障排查

### 问题1: 构建失败

**症状**: Vercel构建时报错

**解决方法**:
1. 检查Build Command是否正确:
   ```bash
   cd client && pnpm install && pnpm build
   ```
2. 检查Output Directory是否为 `client/dist`
3. 查看构建日志中的具体错误信息

### 问题2: CORS错误

**症状**: 浏览器Console显示CORS错误

**解决方法**:
1. 确认Railway后端的 `FRONTEND_URL` 环境变量已设置
2. 检查Vercel部署URL是否正确
3. 清除浏览器缓存并刷新
4. 检查后端CORS配置(server/src/main.ts)

### 问题3: API请求404

**症状**: 前端调用API返回404

**解决方法**:
1. 检查 `VITE_API_URL` 环境变量是否正确
2. 确认后端URL是否包含 `/api` 前缀
3. 查看Network标签中的实际请求URL
4. 确认后端服务正常运行

### 问题4: 路由404错误

**症状**: 直接访问 `/login` 或其他路由返回404

**解决方法**:
- Vercel: 已通过 `vercel.json` 配置重写规则,应该自动工作
- Railway: 确认nginx配置正确
- 检查 `vercel.json` 中的 rewrites 配置

### 问题5: 环境变量不生效

**症状**: `VITE_API_URL` 值不正确

**解决方法**:
1. 确认环境变量名称以 `VITE_` 开头
2. 重新部署项目(环境变量更改需要重新构建)
3. 检查 `client/src/api/client.ts` 中的读取方式

---

## 性能优化建议

### 1. 启用CDN缓存
Vercel自动配置CDN,静态资源会被全球缓存

### 2. 代码分割
已在 `vite.config.ts` 中配置:
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'axios-vendor': ['axios'],
}
```

### 3. 图片优化
- 使用WebP格式
- 懒加载图片
- 使用CDN服务(如Cloudinary)

### 4. 监控性能
使用Vercel Analytics监控:
1. 在Vercel项目设置中启用Analytics
2. 查看Core Web Vitals指标

---

## 相关文档

- [Vercel官方文档](https://vercel.com/docs)
- [Vite部署指南](https://vitejs.dev/guide/static-deploy.html)
- [React Router部署](https://reactrouter.com/en/main/guides/deploying)

---

## 下一步

部署完成后,你可以:

1. ✅ 配置自定义域名
2. ✅ 设置SSL证书(Vercel自动)
3. ✅ 配置预览环境
4. ✅ 设置部署通知
5. ✅ 启用分析工具

🎉 恭喜!你的前端应用已成功部署!
