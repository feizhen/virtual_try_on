# Virtual Try-On 阿里云部署指南

## 📋 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [自动部署配置](#自动部署配置)
- [常见问题](#常见问题)
- [运维管理](#运维管理)

---

## 🔧 环境要求

### 服务器配置
- **操作系统**: Ubuntu 20.04+ (阿里云 ECS)
- **CPU**: 2核或以上
- **内存**: 4GB 或以上
- **存储**: 20GB 或以上
- **网络**: 公网 IP

### 软件依赖
- Docker 24.0+
- Docker Compose 2.20+
- Git 2.0+

---

## 🚀 快速开始

### 1. 服务器初始化

```bash
# 1. SSH 登录到阿里云服务器
ssh root@your-server-ip

# 2. 下载并运行服务器初始化脚本
wget https://your-repo/server/setup-server.sh
sudo bash setup-server.sh
```

### 2. 配置阿里云安全组

在阿里云控制台配置安全组规则,开放以下端口:

| 端口 | 协议 | 用途 |
|------|------|------|
| 22   | TCP  | SSH |
| 80   | TCP  | HTTP |
| 443  | TCP  | HTTPS |
| 3000 | TCP  | 应用端口 |

### 3. 部署应用

```bash
# 1. 克隆代码
cd /opt/virtual-try-on
git clone your-repository-url .

# 2. 进入 server 目录
cd server

# 3. 配置环境变量
cp .env.production .env.production.local
vim .env.production.local

# 4. 必须修改的配置项:
# - APP_URL: 改为你的服务器 IP 或域名
# - DB_PASSWORD: 修改数据库密码
# - REDIS_PASSWORD: 修改 Redis 密码
# - JWT_SECRET: 生成新的密钥
# - JWT_REFRESH_SECRET: 生成新的密钥
# - GEMINI_API_KEY: 你的 API 密钥

# 5. 生成 JWT 密钥 (可选)
openssl rand -base64 32  # 用于 JWT_SECRET
openssl rand -base64 32  # 用于 JWT_REFRESH_SECRET

# 6. 运行部署脚本
bash deploy.sh
```

### 4. 验证部署

```bash
# 检查容器状态
docker compose -f docker-compose.prod.yml ps

# 访问健康检查
curl http://localhost:3000/api/health

# 查看日志
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 📚 详细步骤

### 步骤 1: 服务器初始化

`setup-server.sh` 脚本会自动完成以下操作:

1. 更新系统软件包
2. 安装 Docker 和 Docker Compose
3. 安装必要工具 (Git, curl, vim 等)
4. 配置防火墙规则
5. 创建应用目录 `/opt/virtual-try-on`

```bash
sudo bash setup-server.sh
```

### 步骤 2: 克隆代码

```bash
# 使用 HTTPS
cd /opt/virtual-try-on
git clone https://github.com/your-username/virtual-try-on.git .

# 或使用 SSH (需要配置 SSH 密钥)
git clone git@github.com:your-username/virtual-try-on.git .
```

### 步骤 3: 配置环境变量

```bash
cd server
cp .env.production .env.production.local
```

重要配置项说明:

```bash
# 应用配置
APP_URL=http://your-server-ip:3000        # 改为实际地址
PORT=3000

# 数据库配置
DB_PASSWORD=strong_password_here          # 修改为强密码
DB_USER=postgres
DB_NAME=vibe_db

# JWT 配置 (必须修改!)
JWT_SECRET=your_generated_secret          # 使用 openssl rand -base64 32 生成
JWT_REFRESH_SECRET=your_generated_secret  # 使用 openssl rand -base64 32 生成

# Redis 配置
REDIS_PASSWORD=strong_redis_password      # 修改为强密码

# API 配置
GEMINI_API_KEY=your_api_key              # 你的 Gemini API 密钥

# 前端 URL (如果前端也部署在同一服务器)
FRONTEND_URL=http://your-server-ip:5173
```

### 步骤 4: 部署应用

```bash
# 首次部署
bash deploy.sh
```

部署脚本会自动完成:
1. 停止旧容器
2. 构建 Docker 镜像
3. 启动所有服务 (PostgreSQL, Redis, App)
4. 执行数据库迁移
5. 生成 Prisma Client
6. 健康检查

### 步骤 5: 验证部署

```bash
# 1. 检查容器状态
docker compose -f docker-compose.prod.yml ps

# 应该看到 3 个容器在运行:
# - virtual_tryon_postgres (healthy)
# - virtual_tryon_redis (healthy)
# - virtual_tryon_app (running)

# 2. 测试 API
curl http://localhost:3000/api/health

# 应该返回: {"status":"ok"}

# 3. 从外部访问
curl http://your-server-ip:3000/api/health
```

---

## 🔄 自动部署配置

### 方式一: Cron Job (推荐,简单)

每 5 分钟检查一次代码更新并自动部署:

```bash
# 1. 编辑 crontab
crontab -e

# 2. 添加以下行
*/5 * * * * /opt/virtual-try-on/server/deploy-webhook.sh >> /var/log/virtual-try-on-cron.log 2>&1

# 3. 查看日志
tail -f /var/log/virtual-try-on-deploy.log
tail -f /var/log/virtual-try-on-cron.log
```

### 方式二: Git Webhook

如果你的代码托管在 GitHub/GitLab:

1. 在服务器上安装简单的 webhook 服务:

```bash
# 安装 webhook
sudo apt-get install webhook

# 创建 webhook 配置
cat > /opt/virtual-try-on/webhook.json <<EOF
[
  {
    "id": "deploy-app",
    "execute-command": "/opt/virtual-try-on/server/deploy-webhook.sh",
    "command-working-directory": "/opt/virtual-try-on/server",
    "response-message": "Deployment triggered",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "your-webhook-secret",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# 启动 webhook 服务
webhook -hooks /opt/virtual-try-on/webhook.json -port 9000
```

2. 在 GitHub 设置 Webhook:
   - URL: `http://your-server-ip:9000/hooks/deploy-app`
   - Content type: `application/json`
   - Secret: `your-webhook-secret`
   - Events: Push events

3. 配置阿里云安全组,开放 9000 端口(或使用 Nginx 反向代理)

---

## 🛠️ 运维管理

### 查看日志

```bash
# 查看所有日志
docker compose -f docker-compose.prod.yml logs -f

# 查看应用日志
docker compose -f docker-compose.prod.yml logs -f app

# 查看数据库日志
docker compose -f docker-compose.prod.yml logs -f postgres

# 查看 Redis 日志
docker compose -f docker-compose.prod.yml logs -f redis
```

### 重启服务

```bash
# 重启应用
docker compose -f docker-compose.prod.yml restart app

# 重启所有服务
docker compose -f docker-compose.prod.yml restart

# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 启动所有服务
docker compose -f docker-compose.prod.yml up -d
```

### 进入容器

```bash
# 进入应用容器
docker compose -f docker-compose.prod.yml exec app sh

# 进入数据库容器
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d vibe_db
```

### 数据库操作

```bash
# 查看数据库状态
docker compose -f docker-compose.prod.yml exec app npx prisma migrate status

# 执行数据库迁移
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 打开 Prisma Studio (仅开发环境)
docker compose -f docker-compose.prod.yml exec app npx prisma studio
```

### 备份和恢复

```bash
# 备份数据库
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres vibe_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres vibe_db < backup_20250120_120000.sql

# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz uploads/
```

### 更新应用

```bash
# 手动更新
cd /opt/virtual-try-on
git pull origin main
cd server
bash deploy.sh

# 如果配置了自动部署,只需推送代码
git push origin main
# 等待自动部署完成 (约 2-5 分钟)
```

### 监控

```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 清理 Docker 空间
docker system prune -a
```

---

## ❓ 常见问题

### 1. 容器启动失败

```bash
# 查看错误日志
docker compose -f docker-compose.prod.yml logs

# 常见原因:
# - 端口被占用: 修改 .env.production 中的 PORT
# - 环境变量错误: 检查 .env.production 配置
# - 内存不足: 升级服务器配置
```

### 2. 数据库连接失败

```bash
# 检查数据库容器状态
docker compose -f docker-compose.prod.yml ps postgres

# 检查数据库日志
docker compose -f docker-compose.prod.yml logs postgres

# 测试数据库连接
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d vibe_db -c "SELECT 1"
```

### 3. 外网无法访问

1. 检查阿里云安全组规则是否正确开放端口
2. 检查服务器防火墙:
   ```bash
   sudo ufw status
   sudo ufw allow 3000/tcp
   ```
3. 检查应用是否监听正确端口:
   ```bash
   netstat -tulpn | grep 3000
   ```

### 4. 上传文件丢失

确保 `uploads` 目录已映射到宿主机:

```bash
# 检查 docker-compose.prod.yml 中的 volumes 配置
# 应该有: ./uploads:/app/uploads
```

### 5. 内存不足

优化 Docker Compose 配置,限制容器内存:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```

---

## 🔒 安全建议

1. **修改默认密码**: 务必修改 `.env.production` 中的所有密码
2. **使用 HTTPS**: 生产环境建议配置域名和 SSL 证书
3. **定期更新**: 定期更新系统和 Docker 镜像
4. **备份数据**: 定期备份数据库和上传文件
5. **限制端口**: 只开放必要的端口,关闭不使用的服务
6. **使用防火墙**: 配置 ufw 或阿里云安全组

---

## 📞 技术支持

如有问题,请:
1. 查看应用日志: `docker compose -f docker-compose.prod.yml logs -f app`
2. 查看部署日志: `/var/log/virtual-try-on-deploy.log`
3. 提交 Issue 到项目仓库

---

## 📝 更新日志

- 2025-01-20: 初始版本
  - Docker Compose 部署
  - 自动部署脚本
  - Nginx 反向代理配置

---

## 📄 License

MIT License
