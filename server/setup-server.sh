#!/bin/bash

# Virtual Try-On Server Setup Script
# For Ubuntu 20.04+ on Aliyun ECS
# Run with: sudo bash setup-server.sh

set -e

echo "========================================="
echo "Virtual Try-On Server Setup"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential tools
echo "🔧 Installing essential tools..."
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Set up Docker repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Start Docker service
    systemctl enable docker
    systemctl start docker

    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose (standalone, if needed)
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.24.5"
    curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Configure firewall
echo "🔥 Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Application port
echo "✅ Firewall configured"

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /opt/virtual-try-on
chown -R $SUDO_USER:$SUDO_USER /opt/virtual-try-on
echo "✅ Application directory created at /opt/virtual-try-on"

# Configure Docker to start on boot
systemctl enable docker
systemctl enable containerd

# Display versions
echo ""
echo "========================================="
echo "Installation Summary"
echo "========================================="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"
echo "Git version: $(git --version)"
echo ""
echo "✅ Server setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /opt/virtual-try-on"
echo "2. Configure .env.production with your settings"
echo "3. Run deploy.sh to start the application"
echo ""
echo "⚠️  IMPORTANT: Remember to configure Aliyun Security Group to allow ports 80, 443, and 3000"
echo ""
