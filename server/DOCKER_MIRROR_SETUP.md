# Docker 镜像加速器配置指南

在中国大陆部署时,需要配置 Docker 镜像加速器以解决镜像拉取问题。

---

## 🚀 快速配置(推荐)

在阿里云服务器上执行:

```bash
cd /opt/virtual-try-on/server

# 运行配置脚本
sudo bash setup-docker-mirror.sh
```

这个脚本会自动:
1. 配置多个国内 Docker 镜像源
2. 重启 Docker 服务
3. 验证配置是否生效

---

## 📋 手动配置

如果自动脚本不工作,可以手动配置:

### 1. 创建或编辑 Docker 配置文件

```bash
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

### 2. 添加以下内容

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://dockerproxy.com",
    "https://docker.nju.edu.cn",
    "https://docker.mirrors.sjtug.sjtu.edu.cn"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 3. 重启 Docker

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 4. 验证配置

```bash
docker info | grep -A 10 "Registry Mirrors"
```

---

## 🎯 测试镜像拉取

配置完成后,测试是否能正常拉取镜像:

```bash
# 测试拉取 node 镜像
docker pull node:20-alpine

# 应该能看到下载进度
# Pulling from library/node
# ...
```

---

## 🔧 Dockerfile 已优化

项目的 Dockerfile 已经配置使用国内镜像源:

- **Docker 镜像**: `docker.m.daocloud.io/library/node:20-alpine`
- **Alpine APK**: 阿里云镜像 `mirrors.aliyun.com`
- **NPM/PNPM**: 淘宝镜像 `registry.npmmirror.com`

---

## 💡 可用的国内镜像源

### Docker 镜像源

1. **DaoCloud** (推荐)
   ```
   https://docker.m.daocloud.io
   ```

2. **DockerProxy**
   ```
   https://dockerproxy.com
   ```

3. **南京大学**
   ```
   https://docker.nju.edu.cn
   ```

4. **上海交通大学**
   ```
   https://docker.mirrors.sjtug.sjtu.edu.cn
   ```

### NPM 镜像源

**淘宝镜像** (推荐)
```bash
npm config set registry https://registry.npmmirror.com
pnpm config set registry https://registry.npmmirror.com
```

### Alpine APK 镜像源

**阿里云镜像** (推荐)
```bash
sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
```

---

## 🆘 常见问题

### 问题 1: 配置后仍无法拉取镜像

```bash
# 1. 检查配置文件是否正确
cat /etc/docker/daemon.json

# 2. 重启 Docker
sudo systemctl restart docker

# 3. 查看 Docker 日志
sudo journalctl -u docker -n 50

# 4. 尝试手动拉取测试
docker pull docker.m.daocloud.io/library/node:20-alpine
```

### 问题 2: 某个镜像源不可用

配置文件中已包含多个镜像源,Docker 会自动尝试下一个。如果某个源失效,可以:

1. 编辑 `/etc/docker/daemon.json`
2. 删除或注释掉失效的镜像源
3. 重启 Docker

### 问题 3: 阿里云特定配置

阿里云提供专属的镜像加速器:

1. 登录 [阿里云容器镜像服务](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)
2. 获取你的专属加速器地址
3. 添加到 `registry-mirrors` 数组首位

---

## 📚 参考资源

- [Docker 官方文档](https://docs.docker.com/registry/recipes/mirror/)
- [DaoCloud 镜像站](https://www.daocloud.io/mirror)
- [淘宝 NPM 镜像](https://npmmirror.com/)
- [阿里云容器镜像服务](https://help.aliyun.com/document_detail/60750.html)

---

## ✅ 配置完成后

执行部署脚本即可:

```bash
cd /opt/virtual-try-on/server
bash deploy.sh
```

Docker 将自动使用配置的镜像源,大大提升构建速度! 🚀
