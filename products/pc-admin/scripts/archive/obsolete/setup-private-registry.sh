#!/bin/bash

# 私有镜像仓库设置脚本
# 用于在云服务器上启动 Docker Registry 并配置相关环境

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 配置参数
REGISTRY_PORT="${REGISTRY_PORT:-5000}"
REGISTRY_NAME="${REGISTRY_NAME:-private-registry}"
REGISTRY_DATA_DIR="${REGISTRY_DATA_DIR:-/var/lib/registry}"

# 检查是否在云服务器上执行
if [ -z "$SERVER_HOST" ] && [ -z "$1" ]; then
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🔧 私有镜像仓库设置指南"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info ""
    log_info "此脚本需要在云服务器上执行，用于："
    log_info "1. 启动 Docker Registry 容器"
    log_info "2. 配置本地 Docker 允许访问私有仓库"
    log_info "3. 创建 K8s imagePullSecrets（可选）"
    log_info ""
    log_info "使用方法："
    log_info "  在云服务器上执行："
    log_info "    bash scripts/setup-private-registry.sh"
    log_info ""
    log_info "  或通过 SSH 执行："
    log_info "    ssh user@server 'bash -s' < scripts/setup-private-registry.sh"
    log_info ""
    log_info "环境变量："
    log_info "  REGISTRY_PORT      镜像仓库端口（默认: 5000）"
    log_info "  REGISTRY_NAME      容器名称（默认: private-registry）"
    log_info "  REGISTRY_DATA_DIR  数据目录（默认: /var/lib/registry）"
    log_info ""
    exit 0
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 开始设置私有镜像仓库"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 步骤1: 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    log_error "Docker 未安装，请先安装 Docker"
    exit 1
fi
log_success "Docker 已安装"

# 步骤2: 检查 Registry 容器是否已存在
if docker ps -a --format "{{.Names}}" | grep -q "^${REGISTRY_NAME}$"; then
    log_warning "Registry 容器已存在: $REGISTRY_NAME"
    read -p "是否删除并重新创建? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "停止并删除现有容器..."
        docker stop "$REGISTRY_NAME" 2>/dev/null || true
        docker rm "$REGISTRY_NAME" 2>/dev/null || true
    else
        log_info "使用现有容器"
        if docker ps --format "{{.Names}}" | grep -q "^${REGISTRY_NAME}$"; then
            log_success "Registry 容器正在运行"
            exit 0
        else
            log_info "启动现有容器..."
            docker start "$REGISTRY_NAME"
            log_success "Registry 容器已启动"
            exit 0
        fi
    fi
fi

# 步骤3: 创建数据目录
log_info "创建数据目录: $REGISTRY_DATA_DIR"
sudo mkdir -p "$REGISTRY_DATA_DIR"
sudo chmod 755 "$REGISTRY_DATA_DIR"
log_success "数据目录已创建"

# 步骤4: 启动 Docker Registry
log_info "启动 Docker Registry 容器..."
log_info "  端口: $REGISTRY_PORT"
log_info "  数据目录: $REGISTRY_DATA_DIR"

docker run -d \
    --restart=always \
    --name "$REGISTRY_NAME" \
    -p "${REGISTRY_PORT}:5000" \
    -v "${REGISTRY_DATA_DIR}:/var/lib/registry" \
    registry:2

# 等待容器启动
sleep 2

# 验证容器是否运行
if docker ps --format "{{.Names}}" | grep -q "^${REGISTRY_NAME}$"; then
    log_success "Docker Registry 已启动"
else
    log_error "Docker Registry 启动失败"
    docker logs "$REGISTRY_NAME"
    exit 1
fi

# 步骤5: 获取服务器 IP 地址
SERVER_IP=$(hostname -I | awk '{print $1}' || echo "localhost")
if [ -z "$SERVER_IP" ] || [ "$SERVER_IP" = "localhost" ]; then
    SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "请手动设置")
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "✅ 私有镜像仓库设置完成"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info ""
log_info "仓库地址: $SERVER_IP:$REGISTRY_PORT"
log_info ""
log_info "下一步操作："
log_info ""
log_info "1. 配置本地 Docker 允许访问私有仓库"
log_info "   编辑 /etc/docker/daemon.json（Linux）或 Docker Desktop 设置（Windows/Mac）"
log_info "   添加："
log_info "   {"
log_info "     \"insecure-registries\": [\"$SERVER_IP:$REGISTRY_PORT\"]"
log_info "   }"
log_info "   然后重启 Docker"
log_info ""
log_info "2. 测试连接："
log_info "   docker pull alpine:latest"
log_info "   docker tag alpine:latest $SERVER_IP:$REGISTRY_PORT/alpine:latest"
log_info "   docker push $SERVER_IP:$REGISTRY_PORT/alpine:latest"
log_info ""
log_info "3. 创建 K8s imagePullSecrets（如果需要认证）："
log_info "   kubectl create secret docker-registry registry-secret \\"
log_info "     --docker-server=$SERVER_IP:$REGISTRY_PORT \\"
log_info "     --docker-username=<用户名> \\"
log_info "     --docker-password=<密码> \\"
log_info "     -n btc-shopflow"
log_info ""
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

