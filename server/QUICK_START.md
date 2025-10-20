# 🚀 快速部署指南

## 最快 5 分钟部署到阿里云

### 前提条件
- ✅ 已有阿里云 Ubuntu 服务器 (2核4G+)
- ✅ 已获取服务器 root 权限
- ✅ 代码已推送到 Git 仓库

---

## 📋 三步部署

### 第一步: 初始化服务器 (2分钟)

```bash
# SSH 登录服务器
ssh root@your-server-ip

# 下载并运行初始化脚本
cd ~
git clone your-repository-url virtual-try-on
cd virtual-try-on/server
sudo bash setup-server.sh
```

**配置阿里云安全组**: 开放端口 22, 80, 443, 3000

---

### 第二步: 配置环境变量 (2分钟)

```bash
cd /opt/virtual-try-on/server

# 复制环境变量模板
cp .env.production .env.production.local

# 编辑配置 (必须修改!)
vim .env.production.local
```

**最少必改项**:
```bash
# 1. 修改服务器地址
APP_URL=http://your-server-ip:3000

# 2. 生成并修改 JWT 密钥
openssl rand -base64 32  # 复制输出到 JWT_SECRET
openssl rand -base64 32  # 复制输出到 JWT_REFRESH_SECRET

# 3. 修改数据库密码
DB_PASSWORD=your_strong_password

# 4. 修改 Redis 密码
REDIS_PASSWORD=your_redis_password

# 5. 配置 API 密钥
GEMINI_API_KEY=your_api_key
```

---

### 第三步: 一键部署 (1分钟)

```bash
cd /opt/virtual-try-on/server
bash deploy.sh
```

等待部署完成,看到 "✅ Deployment completed!" 即成功!

---

## 🎉 验证部署

```bash
# 测试 API
curl http://your-server-ip:3000/api/health

# 应该返回: {"status":"ok"}
```

在浏览器访问: `http://your-server-ip:3000`

---

## 🔄 配置自动部署 (可选)

```bash
# 添加 cron job,每 5 分钟自动检查更新
crontab -e

# 添加这一行:
*/5 * * * * /opt/virtual-try-on/server/deploy-webhook.sh >> /var/log/deploy-cron.log 2>&1
```

现在,每次 `git push` 后,服务器会在 5 分钟内自动更新!

---

## 📚 完整文档

详细部署文档: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🆘 常见问题

### 问题 1: 容器启动失败
```bash
docker compose -f docker-compose.prod.yml logs
```

### 问题 2: 外网无法访问
1. 检查阿里云安全组是否开放 3000 端口
2. 检查防火墙: `sudo ufw status`

### 问题 3: 数据库连接失败
```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d vibe_db
```

---

## 📞 获取帮助

- 查看日志: `docker compose -f docker-compose.prod.yml logs -f`
- 重启服务: `bash deploy.sh`
- 完整文档: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎯 快速命令参考

```bash
# 查看状态
docker compose -f docker-compose.prod.yml ps

# 查看日志
docker compose -f docker-compose.prod.yml logs -f app

# 重启应用
docker compose -f docker-compose.prod.yml restart app

# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 重新部署
bash deploy.sh

# 进入容器
docker compose -f docker-compose.prod.yml exec app sh

# 备份数据库
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres vibe_db > backup.sql
```

---

**祝部署顺利! 🎉**
