#!/bin/bash

# 清理旧版本 releases，只保留最近 N 个版本
# 用法: ./clean-old-releases.sh [应用名称] [保留数量]
# 示例: ./clean-old-releases.sh logistics-app 3

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
KEEP_RELEASES="${2:-3}" # 默认保留 3 个版本

# 应用列表
ALL_APPS=(
    "bellis.com.cn"
    "admin.bellis.com.cn"
    "logistics.bellis.com.cn"
    "quality.bellis.com.cn"
    "production.bellis.com.cn"
    "engineering.bellis.com.cn"
    "finance.bellis.com.cn"
    "layout.bellis.com.cn"
)

# 获取要清理的应用
if [ -n "$1" ]; then
    case "$1" in
        system-app)
            APPS=("bellis.com.cn")
            ;;
        admin-app)
            APPS=("admin.bellis.com.cn")
            ;;
        logistics-app)
            APPS=("logistics.bellis.com.cn")
            ;;
        quality-app)
            APPS=("quality.bellis.com.cn")
            ;;
        production-app)
            APPS=("production.bellis.com.cn")
            ;;
        engineering-app)
            APPS=("engineering.bellis.com.cn")
            ;;
        finance-app)
            APPS=("finance.bellis.com.cn")
            ;;
        layout-app)
            APPS=("layout.bellis.com.cn")
            ;;
        all)
            APPS=("${ALL_APPS[@]}")
            ;;
        *)
            log_error "未知应用: $1"
            echo "用法: $0 [应用名称|all] [保留数量]"
            echo "应用列表: system-app, admin-app, logistics-app, quality-app, production-app, engineering-app, finance-app, layout-app"
            exit 1
            ;;
    esac
else
    log_error "请指定要清理的应用"
    echo "用法: $0 [应用名称|all] [保留数量]"
    echo "应用列表: system-app, admin-app, logistics-app, quality-app, production-app, engineering-app, finance-app, layout-app"
    exit 1
fi

# 检查服务器配置
if [ -z "$SERVER_HOST" ]; then
    log_error "SERVER_HOST 未设置，请设置环境变量："
    log_info "  export SERVER_HOST=your-server-ip"
    log_info "  export SERVER_USER=root"
    log_info "  export SERVER_PORT=22"
    log_info "  export SSH_KEY=~/.ssh/id_rsa"
    exit 1
fi

log_info "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
log_info "保留版本数: $KEEP_RELEASES"

SSH_OPTS="-i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=10"

# 清理单个应用的旧版本
clean_app_releases() {
    local domain=$1
    local base_dir="/www/wwwroot/$domain"
    local releases_dir="$base_dir/releases"
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "清理应用: $domain"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检查 releases 目录是否存在
    if ! ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "[ -d $releases_dir ]" 2>/dev/null; then
        log_warning "$domain 的 releases 目录不存在，跳过"
        return 0
    fi
    
    # 获取所有 release 目录（按时间倒序）
    local all_releases=$(ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" \
        "cd $releases_dir && ls -dt */ 2>/dev/null | tr -d '/' || true")
    
    if [ -z "$all_releases" ]; then
        log_info "$domain 没有任何 release，跳过"
        return 0
    fi
    
    local release_count=$(echo "$all_releases" | wc -l)
    log_info "当前 release 总数: $release_count"
    
    if [ "$release_count" -le "$KEEP_RELEASES" ]; then
        log_info "release 数量未超过保留数量 ($KEEP_RELEASES)，无需清理"
        return 0
    fi
    
    # 获取要删除的 releases（保留最新的 N 个）
    local to_delete=$(echo "$all_releases" | tail -n +$((KEEP_RELEASES + 1)))
    
    if [ -z "$to_delete" ]; then
        log_info "没有需要删除的 release"
        return 0
    fi
    
    log_info "准备删除以下 release："
    echo "$to_delete" | while read -r rel; do
        echo "  - $rel"
    done
    
    # 删除旧 releases
    echo "$to_delete" | while read -r rel; do
        if [ -n "$rel" ]; then
            log_info "删除: $releases_dir/$rel"
            ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" \
                "rm -rf $releases_dir/$rel" || log_warning "删除失败: $rel"
        fi
    done
    
    # 统计剩余数量
    local remaining=$(ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" \
        "cd $releases_dir && ls -d */ 2>/dev/null | wc -l || echo 0")
    log_success "$domain 清理完成，剩余 $remaining 个 release"
}

# 清理所有指定的应用
for app in "${APPS[@]}"; do
    clean_app_releases "$app"
done

log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "所有应用清理完成"
log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

