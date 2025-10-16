# API 文档

完整的 REST API 接口文档。

## 基础信息

- **Base URL**: `http://localhost:3000/api` (开发环境)
- **生产 URL**: `https://your-app.railway.app/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

## 统一响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "HTTP_400",
    "message": "Validation failed",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

## 认证端点

### 注册新用户

创建新用户账号。

**端点**: `POST /api/auth/register`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**字段说明**:
- `email` (string, required): 用户邮箱,必须是有效的邮箱格式
- `password` (string, required): 密码,至少 8 位,必须包含大小写字母和数字/特殊字符
- `name` (string, required): 用户姓名

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "provider": "local",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/register"
}
```

**错误响应**:
- `400 Bad Request`: 验证失败
- `409 Conflict`: 邮箱已存在

**示例**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

---

### 用户登录

使用邮箱和密码登录。

**端点**: `POST /api/auth/login`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": null,
      "provider": "local",
      "isActive": true,
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/login"
}
```

**错误响应**:
- `400 Bad Request`: 该账号使用 OAuth 登录
- `401 Unauthorized`: 凭据无效
- `401 Unauthorized`: 账号已停用

**示例**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Google OAuth 登录

发起 Google OAuth 登录流程。

**端点**: `GET /api/auth/google`

**流程**:
1. 前端重定向用户到此端点
2. 用户被重定向到 Google 授权页面
3. 用户授权后,Google 重定向回 `/api/auth/google/callback`
4. 后端处理后重定向到前端,URL 中携带令牌

**前端重定向示例**:
```javascript
window.location.href = 'http://localhost:3000/api/auth/google';
```

**回调处理**:

用户授权后,会重定向到:
```
http://localhost:5173/auth/callback?token=ACCESS_TOKEN&refresh=REFRESH_TOKEN
```

前端需要捕获这些令牌并存储。

---

### Google OAuth 回调

处理 Google OAuth 回调 (由 Google 自动调用)。

**端点**: `GET /api/auth/google/callback`

**查询参数**:
- `code`: Google 授权码 (由 Google 提供)

此端点会:
1. 验证 Google 授权码
2. 获取用户信息
3. 创建或更新用户
4. 生成 JWT 令牌
5. 重定向到前端

---

### 刷新访问令牌

使用刷新令牌获取新的访问令牌。

**端点**: `POST /api/auth/refresh`

**请求头**:
```
Content-Type: application/json
```

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/refresh"
}
```

**错误响应**:
- `401 Unauthorized`: 刷新令牌无效或过期

**示例**:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

---

### 退出登录

使刷新令牌失效。

**端点**: `POST /api/auth/logout`

**认证**: 需要

**请求头**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/logout"
}
```

**示例**:
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-access-token" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

---

### 获取当前用户信息

获取已登录用户的完整信息。

**端点**: `GET /api/auth/me`

**认证**: 需要

**请求头**:
```
Authorization: Bearer <access_token>
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "provider": "local",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/auth/me"
}
```

**错误响应**:
- `401 Unauthorized`: 未提供令牌或令牌无效

**示例**:
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer your-access-token"
```

---

## 用户端点

### 获取个人资料

获取当前用户的个人资料。

**端点**: `GET /api/users/profile`

**认证**: 需要

**请求头**:
```
Authorization: Bearer <access_token>
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "provider": "local",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users/profile"
}
```

**示例**:
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer your-access-token"
```

---

### 更新个人资料

更新当前用户的个人资料信息。

**端点**: `PATCH /api/users/profile`

**认证**: 需要

**请求头**:
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**请求体**:
```json
{
  "name": "Jane Doe",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**字段说明**:
- `name` (string, optional): 新的用户姓名
- `avatar` (string, optional): 新的头像 URL

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar": "https://example.com/new-avatar.jpg",
    "provider": "local",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T01:00:00.000Z",
  "path": "/api/users/profile"
}
```

**示例**:
```bash
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-access-token" \
  -d '{
    "name": "Jane Doe",
    "avatar": "https://example.com/new-avatar.jpg"
  }'
```

---

### 删除账户

永久停用当前用户账户 (软删除)。

**端点**: `DELETE /api/users/account`

**认证**: 需要

**请求头**:
```
Authorization: Bearer <access_token>
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Account successfully deleted"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users/account"
}
```

**注意**: 这是软删除,用户记录仍保留在数据库中,但 `isActive` 设置为 `false`,用户无法再登录。

**示例**:
```bash
curl -X DELETE http://localhost:3000/api/users/account \
  -H "Authorization: Bearer your-access-token"
```

---

## 健康检查端点

### 应用健康检查

检查应用是否正常运行。

**端点**: `GET /health`

**认证**: 不需要

**成功响应** (200 OK):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

**字段说明**:
- `status`: 应用状态 ("ok")
- `timestamp`: 当前时间戳
- `uptime`: 应用运行时间 (秒)
- `environment`: 运行环境

**示例**:
```bash
curl -X GET http://localhost:3000/health
```

---

### 数据库健康检查

检查数据库连接是否正常。

**端点**: `GET /health/db`

**认证**: 不需要

**成功响应** (200 OK):
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**错误响应** (200 OK):
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Error message here",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**示例**:
```bash
curl -X GET http://localhost:3000/health/db
```

---

## HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200    | 成功 |
| 201    | 创建成功 |
| 400    | 请求参数错误 |
| 401    | 未授权 |
| 403    | 禁止访问 |
| 404    | 资源不存在 |
| 409    | 资源冲突 |
| 500    | 服务器内部错误 |

---

## 错误代码

| 代码 | 说明 |
|------|------|
| HTTP_400 | 请求验证失败 |
| HTTP_401 | 认证失败 |
| HTTP_403 | 权限不足 |
| HTTP_404 | 资源不存在 |
| HTTP_409 | 资源冲突 (如邮箱已存在) |
| HTTP_500 | 服务器错误 |

---

## 认证流程示例

### 完整的注册 + 登录流程

```bash
# 1. 注册新用户
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "name": "Test User"
  }')

# 提取 access token
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.refreshToken')

# 2. 使用 access token 访问受保护的端点
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. 更新个人资料
curl -X PATCH http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Updated Name"
  }'

# 4. 刷新令牌
NEW_TOKENS=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $NEW_TOKENS | jq -r '.data.accessToken')

# 5. 退出登录
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

---

## Postman Collection

建议创建 Postman Collection 来测试 API:

1. 创建环境变量:
   - `base_url`: `http://localhost:3000`
   - `access_token`: 从登录响应中获取
   - `refresh_token`: 从登录响应中获取

2. 设置自动化脚本更新令牌:

在登录请求的 "Tests" 标签中:
```javascript
const response = pm.response.json();
if (response.success && response.data.accessToken) {
  pm.environment.set("access_token", response.data.accessToken);
  pm.environment.set("refresh_token", response.data.refreshToken);
}
```

---

## WebSocket 支持 (未来功能)

计划支持 WebSocket 用于实时通信:

```javascript
// 连接示例
const socket = io('ws://localhost:3000', {
  auth: {
    token: 'your-access-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});
```

---

## GraphQL 支持 (未来功能)

计划添加 GraphQL API:

```graphql
query {
  me {
    id
    email
    name
    avatar
  }
}
```

---

如有问题或需要更多示例,请参考项目 README 或创建 Issue。
