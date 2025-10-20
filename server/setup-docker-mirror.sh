#!/bin/bash

# Docker 镜像加速器配置脚本
# 适用于阿里云服务器

set -e

echo "🔧 配置 Docker 镜像加速器..."

# 创建 Docker 配置目录
mkdir -p /etc/docker

# 配置多个镜像源(按优先级)
cat > /etc/docker/daemon.json <<EOF
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
EOF

echo "✅ Docker 配置文件已创建"

# 重启 Docker 服务
echo "🔄 重启 Docker 服务..."
systemctl daemon-reload
systemctl restart docker

# 验证配置
echo "✅ Docker 镜像加速器配置完成"
echo ""
echo "当前配置的镜像源:"
docker info | grep -A 10 "Registry Mirrors" || echo "配置已生效,正在应用中..."

echo ""
echo "🎉 配置完成!现在可以正常拉取镜像了"
