# React 前端应用

这是一个基于 React + TypeScript + Vite 构建的前端应用,提供用户登录、注册和首页功能。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速开发构建工具
- **React Router v6** - 路由管理
- **Axios** - HTTP 客户端
- **Context API** - 状态管理

## 功能特性

- ✅ 用户注册
- ✅ 用户登录
- ✅ Google OAuth 登录
- ✅ JWT Token 认证
- ✅ 自动 Token 刷新
- ✅ 路由守卫
- ✅ 响应式设计
- ✅ 表单验证
- ✅ 错误处理

## 项目结构

```
src/
├── api/              # API 调用封装
│   ├── client.ts    # Axios 实例配置
│   └── auth.ts      # 认证相关 API
├── components/       # 可复用组件
│   └── ProtectedRoute.tsx
├── contexts/         # Context 状态管理
│   └── AuthContext.tsx
├── pages/           # 页面组件
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Home.tsx
│   └── Callback.tsx
├── types/           # TypeScript 类型定义
│   └── auth.ts
├── utils/           # 工具函数
│   └── token.ts
├── App.tsx          # 根组件
└── main.tsx         # 入口文件
```

## 开始使用

### 安装依赖

```bash
pnpm install
```

### 环境变量

复制 `.env.example` 为 `.env` 并配置:

```env
VITE_API_URL=http://localhost:3000
```

### 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:5173/` 启动。

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 页面说明

### 登录页面 (`/login`)

- 邮箱和密码登录
- Google OAuth 登录
- 跳转注册页面链接
- 已登录用户自动跳转首页

### 注册页面 (`/register`)

- 用户名、邮箱、密码注册
- 密码确认验证
- 跳转登录页面链接
- 已登录用户自动跳转首页

### 首页 (`/`)

- 显示欢迎信息
- 展示用户资料
- 退出登录功能
- 受保护的路由(需要登录)

### OAuth 回调页面 (`/auth/callback`)

- 处理 Google OAuth 回调
- 自动保存 token
- 跳转到首页

## API 集成

前端通过以下 API 端点与后端通信:

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录
- `GET /auth/me` - 获取当前用户信息
- `POST /auth/logout` - 退出登录
- `POST /auth/refresh` - 刷新 token
- `GET /auth/google` - Google OAuth 登录

## 认证流程

1. 用户登录/注册后,后端返回 `accessToken` 和 `refreshToken`
2. Token 存储在 `localStorage` 中
3. 每次 API 请求自动在 Header 中添加 `Authorization: Bearer {token}`
4. 当 token 过期(401 错误)时,自动使用 `refreshToken` 刷新
5. 刷新失败则清除 token 并跳转到登录页

## 路由守卫

使用 `ProtectedRoute` 组件保护需要认证的路由:

```tsx
<Route
  path="/"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/>
```

## 开发建议

1. 确保后端 API 服务已启动(默认 `http://localhost:3000`)
2. 如果遇到 CORS 错误,检查后端 CORS 配置
3. Token 保存在 localStorage,清除浏览器数据会导致登出

## 样式定制

全局样式变量在 `src/index.css` 中定义:

```css
:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --error-color: #ef4444;
  /* ... */
}
```

修改这些变量可以快速定制主题。
