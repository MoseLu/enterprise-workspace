#!/bin/bash

# 在服务器上直接运行此脚本，将现有部署迁移到 releases 结构
# 用法: bash migrate-to-releases-on-server.sh

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
    
    # 检查目录是否存在
    if [ ! -d "$base_dir" ]; then
        log_warning "目录不存在: $base_dir，跳过"
        return 0
    fi
    
    cd "$base_dir"
    
    # 如果 current 已经是符号链接，说明已经迁移过了
    if [ -L "current" ]; then
        log_success "已经是 releases 结构，跳过"
        return 0
    fi
    
    # 如果 releases 目录已存在且有内容，说明可能已迁移
    if [ -d "releases" ] && [ "$(ls -A releases 2>/dev/null)" ]; then
        log_warning "releases 目录已存在且有内容，跳过"
        return 0
    fi
    
    # 生成时间戳
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local init_release="init-$timestamp"
    
    log_info "创建 releases 目录..."
    mkdir -p "releases/$init_release"
    
    # 将所有现有文件移到初始 release（排除 releases 目录本身）
    log_info "移动现有文件到 releases/$init_release/..."
    local moved_count=0
    for item in *; do
        if [ "$item" != "releases" ] && [ -e "$item" ]; then
            mv "$item" "releases/$init_release/" && moved_count=$((moved_count + 1))
        fi
    done
    
    # 包括隐藏文件
    for item in .[!.]*; do
        if [ -e "$item" ]; then
            mv "$item" "releases/$init_release/" 2>/dev/null || true
        fi
    done
    
    log_info "已移动 $moved_count 个文件/目录"
    
    # 创建 current 符号链接
    log_info "创建符号链接..."
    ln -sfn "releases/$init_release" current
    
    # 设置权限
    log_info "设置权限..."
    chown -R www:www "releases" "current" 2>/dev/null || true
    chmod -R 755 "releases" 2>/dev/null || true
    find "releases" -type f -exec chmod 644 {} \; 2>/dev/null || true
    
    log_success "$domain 迁移完成"
    log_info "  - Release: releases/$init_release"
    log_info "  - Current -> releases/$init_release"
}

# 开始迁移
log_info "=================================="
log_info "开始迁移所有应用到 releases 结构"
log_info "=================================="
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
log_info "2. 如有必要，重载 Nginx: nginx -s reload"
log_info "3. 后续使用 deploy-static.sh 部署时会自动创建新 release"
log_info "4. 定期运行清理脚本移除旧版本（可选）"

