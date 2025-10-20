# Virtual Try-On Server

NestJS 后端服务，提供虚拟换装 API。

## 技术栈

- **框架**: NestJS
- **数据库**: PostgreSQL
- **缓存**: Redis
- **ORM**: Prisma
- **认证**: JWT + Google OAuth

## 快速开始

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动数据库
docker compose up -d

# 运行迁移
pnpm prisma:migrate

# 启动开发服务器
pnpm start:dev
```

### 生产环境

```bash
# 部署到服务器
bash deploy.sh
```

## 环境变量

参考 `.env.example` 配置以下变量：

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
REDIS_HOST="localhost"
OPENAI_API_KEY="..."
```

## 主要命令

```bash
pnpm start:dev       # 开发服务器
pnpm build           # 构建
pnpm start:prod      # 生产服务器
pnpm prisma:generate # 生成 Prisma Client
pnpm prisma:migrate  # 运行迁移
pnpm prisma:studio   # 数据库管理界面
```

## API 文档

启动服务后访问 `http://localhost:3000/api` 查看 Swagger 文档。
