#!/bin/bash

# 将现有部署迁移到 releases 结构
# 此脚本会在服务器上创建 releases 目录，并将现有文件移入初始 release

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

# 配置
SERVER_HOST="${SERVER_HOST:-}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

# 检查配置
if [ -z "$SERVER_HOST" ]; then
    log_error "SERVER_HOST 未设置，请设置环境变量："
    log_info "  export SERVER_HOST=your-server-ip"
    log_info "  export SERVER_USER=root"
    log_info "  export SERVER_PORT=22"
    log_info "  export SSH_KEY=~/.ssh/id_rsa"
    exit 1
fi

log_info "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"

SSH_OPTS="-i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=10"

# 所有需要迁移的域名
DOMAINS=(
    "bellis.com.cn"
    "admin.bellis.com.cn"
    "logistics.bellis.com.cn"
    "quality.bellis.com.cn"
    "production.bellis.com.cn"
    "engineering.bellis.com.cn"
    "finance.bellis.com.cn"
    "layout.bellis.com.cn"
)

# 迁移单个域名
migrate_domain() {
    local domain=$1
    local base_dir="/www/wwwroot/$domain"
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "迁移: $domain"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 在服务器上执行迁移
    ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" bash << EOF
set -e

BASE_DIR="$base_dir"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
INIT_RELEASE="init-\$TIMESTAMP"

# 检查目录是否存在
if [ ! -d "\$BASE_DIR" ]; then
    echo "目录不存在: \$BASE_DIR，跳过"
    exit 0
fi

cd "\$BASE_DIR"

# 如果 current 已经是符号链接，说明已经迁移过了
if [ -L "current" ]; then
    echo "已经是 releases 结构，跳过"
    exit 0
fi

# 如果 releases 目录已存在且有内容，说明可能已迁移
if [ -d "releases" ] && [ "\$(ls -A releases 2>/dev/null)" ]; then
    echo "releases 目录已存在且有内容，跳过"
    exit 0
fi

# 创建 releases 目录
mkdir -p "releases/\$INIT_RELEASE"

# 将所有现有文件移到初始 release（排除 releases 目录本身）
echo "移动现有文件到 releases/\$INIT_RELEASE/..."
find . -maxdepth 1 -mindepth 1 ! -name releases -exec mv {} "releases/\$INIT_RELEASE/" \; 2>/dev/null || true

# 创建 current 符号链接
ln -sfn "releases/\$INIT_RELEASE" current

# 设置权限
chown -R www:www "releases" "current" 2>/dev/null || true

echo "迁移完成: \$BASE_DIR"
echo "  - Release: releases/\$INIT_RELEASE"
echo "  - Current -> releases/\$INIT_RELEASE"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "$domain 迁移完成"
    else
        log_error "$domain 迁移失败"
        return 1
    fi
}

# 迁移所有域名
log_info "开始迁移所有应用到 releases 结构..."
echo ""

for domain in "${DOMAINS[@]}"; do
    migrate_domain "$domain"
    echo ""
done

log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "所有应用迁移完成"
log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info ""
log_info "下一步："
log_info "1. 验证所有网站是否正常访问"
log_info "2. 运行 pnpm build-deploy:static:all 部署新版本"
log_info "3. 定期运行 ./scripts/clean-old-releases.sh all 3 清理旧版本"

