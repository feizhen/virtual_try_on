# 📋 部署检查清单

在部署到生产环境之前,请确保完成以下所有检查项。

---

## 🔐 安全检查

### 环境变量配置
- [ ] 已复制 `.env.production` 为 `.env.production.local`
- [ ] 已修改 `DB_PASSWORD` 为强密码
- [ ] 已修改 `REDIS_PASSWORD` 为强密码
- [ ] 已使用 `openssl rand -base64 32` 生成 `JWT_SECRET`
- [ ] 已使用 `openssl rand -base64 32` 生成 `JWT_REFRESH_SECRET`
- [ ] 已更新 `APP_URL` 为实际服务器地址
- [ ] 已更新 `FRONTEND_URL` 为实际前端地址
- [ ] 已配置正确的 `GEMINI_API_KEY`
- [ ] 已验证所有 API 密钥有效

### 服务器安全
- [ ] 已禁用 root 直接 SSH 登录
- [ ] 已配置 SSH 密钥登录
- [ ] 已修改 SSH 默认端口 (可选)
- [ ] 已配置防火墙 (ufw)
- [ ] 已设置失败登录自动封禁 (fail2ban, 可选)

---

## 🌐 网络配置

### 阿里云安全组
- [ ] 已开放 SSH 端口 (22)
- [ ] 已开放 HTTP 端口 (80)
- [ ] 已开放 HTTPS 端口 (443)
- [ ] 已开放应用端口 (3000 或自定义端口)
- [ ] 已限制数据库端口 (5432) 仅内网访问
- [ ] 已限制 Redis 端口 (6379) 仅内网访问

### 域名配置 (如果使用域名)
- [ ] 已配置 A 记录指向服务器 IP
- [ ] 已配置 SSL 证书
- [ ] 已更新 `APP_URL` 为域名
- [ ] 已测试 HTTPS 访问

---

## 🐳 Docker 配置

### Docker 安装
- [ ] 已安装 Docker (运行 `docker --version`)
- [ ] 已安装 Docker Compose (运行 `docker compose version`)
- [ ] 已配置 Docker 开机自启 (`systemctl enable docker`)
- [ ] 已将用户添加到 docker 组 (可选)

### Docker Compose 文件
- [ ] 已检查 `docker-compose.prod.yml` 配置
- [ ] 已配置数据卷持久化
- [ ] 已配置健康检查
- [ ] 已配置重启策略

---

## 📦 应用配置

### 代码准备
- [ ] 已推送最新代码到 Git 仓库
- [ ] 已在服务器克隆代码
- [ ] 已检出正确的分支
- [ ] 已删除敏感测试数据

### 数据库配置
- [ ] 已确认 Prisma schema 正确
- [ ] 已准备好数据库迁移文件
- [ ] 已测试迁移脚本
- [ ] 已配置数据库备份计划 (可选)

### 文件上传配置
- [ ] 已创建 `uploads` 目录
- [ ] 已配置 `uploads` 目录映射到宿主机
- [ ] 已设置正确的文件权限
- [ ] 已配置上传文件大小限制

---

## 🚀 部署执行

### 初次部署
- [ ] 已运行 `setup-server.sh`
- [ ] 已配置 `.env.production.local`
- [ ] 已运行 `deploy.sh`
- [ ] 已验证所有容器正常运行
- [ ] 已检查应用日志无错误

### 验证测试
- [ ] 已测试健康检查端点 `/health`
- [ ] 已测试数据库连接 `/health/db`
- [ ] 已测试用户注册功能
- [ ] 已测试用户登录功能
- [ ] 已测试文件上传功能
- [ ] 已测试 AI 虚拟试衣功能
- [ ] 已从外网访问应用

---

## 🔄 自动部署配置 (可选)

### Cron Job 方式
- [ ] 已添加 cron 任务
- [ ] 已测试自动部署脚本
- [ ] 已配置日志轮转
- [ ] 已设置通知 (可选)

### Git Webhook 方式
- [ ] 已安装 webhook 服务
- [ ] 已配置 webhook.json
- [ ] 已在 Git 平台配置 webhook
- [ ] 已测试 webhook 触发

---

## 📊 监控和日志

### 日志配置
- [ ] 已配置应用日志级别
- [ ] 已配置日志轮转
- [ ] 已确认日志目录有足够空间
- [ ] 已测试日志查看命令

### 监控配置 (可选)
- [ ] 已配置系统资源监控
- [ ] 已配置应用性能监控
- [ ] 已配置错误报警
- [ ] 已配置磁盘空间监控

---

## 💾 备份配置

### 数据备份
- [ ] 已配置数据库自动备份
- [ ] 已配置上传文件备份
- [ ] 已测试备份恢复流程
- [ ] 已确认备份存储位置

### 定期维护
- [ ] 已制定备份保留策略
- [ ] 已制定系统更新计划
- [ ] 已制定容器镜像更新计划
- [ ] 已制定磁盘清理计划

---

## 📝 文档更新

### 项目文档
- [ ] 已更新 README.md 包含部署信息
- [ ] 已记录服务器配置信息
- [ ] 已记录域名和 DNS 配置
- [ ] 已记录重要账号和密钥位置 (安全存储)

### 团队知识共享
- [ ] 已分享部署文档给团队
- [ ] 已记录常见问题解决方案
- [ ] 已记录应急联系方式
- [ ] 已进行部署流程培训

---

## ✅ 最终检查

### 上线前检查
- [ ] 已完成所有安全配置
- [ ] 已完成所有功能测试
- [ ] 已配置监控和报警
- [ ] 已准备回滚方案
- [ ] 已通知相关人员

### 上线后检查
- [ ] 已验证应用正常运行
- [ ] 已检查错误日志
- [ ] 已监控系统资源使用
- [ ] 已测试主要功能
- [ ] 已更新部署文档

---

## 🆘 应急预案

### 问题联系人
- 运维负责人: _______________
- 开发负责人: _______________
- 应急电话: _______________

### 快速回滚
```bash
# 查看容器历史
docker compose -f docker-compose.prod.yml ps -a

# 回滚到上一个版本
git checkout <previous-commit>
bash deploy.sh

# 恢复数据库备份
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres vibe_db < backup.sql
```

### 常用排查命令
```bash
# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 检查容器状态
docker compose -f docker-compose.prod.yml ps

# 重启服务
docker compose -f docker-compose.prod.yml restart app

# 进入容器调试
docker compose -f docker-compose.prod.yml exec app sh
```

---

**部署日期**: _______________
**部署人员**: _______________
**版本号**: _______________
**备注**: _______________
