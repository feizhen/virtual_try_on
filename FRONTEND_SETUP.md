# 前端项目设置指南

## 项目概述

已成功创建基于 React + TypeScript 的前端应用,集成了用户认证功能。

## 项目结构

```
vibe_coding_template_nestjs/
├── client/                    # React 前端项目
│   ├── src/
│   │   ├── api/              # API 调用
│   │   │   ├── client.ts     # Axios 配置
│   │   │   └── auth.ts       # 认证 API
│   │   ├── components/       # 组件
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/         # Context
│   │   │   └── AuthContext.tsx
│   │   ├── pages/            # 页面
│   │   │   ├── Login.tsx     # 登录页
│   │   │   ├── Register.tsx  # 注册页
│   │   │   ├── Home.tsx      # 首页
│   │   │   ├── Callback.tsx  # OAuth 回调
│   │   │   ├── Auth.css      # 认证页面样式
│   │   │   └── Home.css      # 首页样式
│   │   ├── types/            # 类型定义
│   │   │   └── auth.ts
│   │   ├── utils/            # 工具函数
│   │   │   └── token.ts      # Token 管理
│   │   ├── App.tsx           # 根组件
│   │   ├── main.tsx          # 入口文件
│   │   ├── index.css         # 全局样式
│   │   └── vite-env.d.ts     # Vite 类型定义
│   ├── .env                   # 环境变量
│   ├── vite.config.ts        # Vite 配置
│   └── package.json
└── src/                       # NestJS 后端 (已有)
```

## 快速开始

### 1. 启动后端服务

在项目根目录:

```bash
pnpm start:dev
```

后端将运行在 `http://localhost:3000`

### 2. 启动前端服务

在 `client/` 目录:

```bash
cd client
pnpm dev
```

前端将运行在 `http://localhost:5173`

## 主要功能

### ✅ 已实现功能

1. **用户注册**
   - 表单验证(用户名、邮箱、密码)
   - 密码确认
   - 错误提示

2. **用户登录**
   - 邮箱密码登录
   - Google OAuth 登录
   - 记住登录状态

3. **首页**
   - 显示用户信息
   - 欢迎消息
   - 账号详情
   - 退出登录

4. **认证机制**
   - JWT Token 存储
   - 自动 Token 刷新
   - 路由守卫
   - 未登录自动跳转

### 🎨 UI 设计

- 现代化渐变背景
- 响应式设计(支持移动端)
- 流畅的动画效果
- 友好的错误提示
- 统一的设计风格

## API 端点

前端通过以下端点与后端通信:

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户 |
| POST | `/api/auth/logout` | 退出登录 |
| POST | `/api/auth/refresh` | 刷新 token |
| GET | `/api/auth/google` | Google OAuth |

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- React Router v6
- Axios
- CSS3

### 后端 (已有)
- NestJS
- Prisma
- PostgreSQL
- JWT
- Passport

## 环境变量

### 前端 (client/.env)

```env
VITE_API_URL=http://localhost:3000
```

### 后端 (.env) - 已配置

- 数据库连接
- JWT 密钥
- Google OAuth 配置

## 使用说明

### 1. 注册新用户

访问 `http://localhost:5173/register`:

- 输入用户名
- 输入邮箱
- 设置密码(至少6位)
- 确认密码
- 点击注册

### 2. 登录

访问 `http://localhost:5173/login`:

**方式一: 邮箱密码登录**
- 输入注册的邮箱
- 输入密码
- 点击登录

**方式二: Google 登录**
- 点击 "使用 Google 登录" 按钮
- 完成 Google 授权流程

### 3. 访问首页

登录成功后自动跳转到首页,显示:
- 用户头像(首字母)
- 用户名和邮箱
- 注册时间
- 最后更新时间

### 4. 退出登录

在首页点击 "退出登录" 按钮

## 路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 需要登录 |
| `/login` | 登录 | 已登录自动跳转首页 |
| `/register` | 注册 | 已登录自动跳转首页 |
| `/auth/callback` | OAuth 回调 | 处理 Google 登录 |

## 状态管理

使用 React Context API 管理全局认证状态:

```tsx
const { user, login, register, logout, isAuthenticated } = useAuth();
```

## Token 管理

- Token 存储在 localStorage
- 每次请求自动添加 Authorization header
- Token 过期自动刷新
- 刷新失败自动跳转登录页

## 样式定制

全局样式变量在 `client/src/index.css`:

```css
:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  --error-color: #ef4444;
  /* ... 更多变量 */
}
```

修改这些变量即可定制主题颜色。

## 开发提示

1. **CORS 配置**: 后端已配置允许来自前端的跨域请求
2. **代理设置**: Vite 已配置代理,前端 `/api` 请求自动转发到后端
3. **热更新**: 前后端都支持热更新,修改代码自动刷新
4. **类型安全**: 全程 TypeScript,提供完整的类型提示

## 常见问题

### Q: 登录后刷新页面会退出吗?
A: 不会。Token 存储在 localStorage,刷新页面会自动加载用户信息。

### Q: Token 过期怎么办?
A: 系统会自动使用 refresh token 刷新,无需手动操作。

### Q: 如何清除登录状态?
A: 点击退出登录,或者清除浏览器 localStorage。

### Q: 能同时运行多个标签页吗?
A: 可以,但 logout 操作只会清除当前标签页的状态。

## 下一步计划

可以考虑添加的功能:
- [ ] 忘记密码
- [ ] 邮箱验证
- [ ] 个人资料编辑
- [ ] 头像上传
- [ ] 更多 OAuth 提供商(GitHub, Facebook 等)
- [ ] 双因素认证 (2FA)

## 技术文档

- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [React Router 文档](https://reactrouter.com/)
- [Axios 文档](https://axios-http.com/)
- [NestJS 文档](https://docs.nestjs.com/)
