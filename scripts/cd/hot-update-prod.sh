#!/bin/bash
# =============================================================================
# 生产热更新脚本
# 功能：对生产环境进行热更新（无需停机）
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 部署配置
ENV=${1:-prod}
DEPLOY_DIR="${DEPLOY_DIR:-/opt/project/${ENV}}"
SERVER_HOST="${${ENV^^}_SERVER_HOST:-}"
SERVER_USER="${${ENV^^}_SERVER_USER:-deploy}"

# 热更新类型: file, patch, bundle
UPDATE_TYPE=${2:-file}

# 步骤计数器
STEP=0
TOTAL_STEPS=7

# 确认热更新
confirm_hot_update() {
    if [ -n "$AUTO_CONFIRM" ]; then
        return 0
    fi
    
    echo ""
    echo "=========================================="
    echo -e "${YELLOW}注意: 即将进行热更新!${NC}"
    echo "=========================================="
    echo ""
    echo "环境: $ENV"
    echo "更新类型: $UPDATE_TYPE"
    echo ""
    
    read -p "确认执行热更新? (输入 'hotupdate' 继续): " -r
    echo ""
    
    if [ "$REPLY" != "hotupdate" ]; then
        log_info "已取消热更新"
        exit 0
    fi
}

# 步骤函数
run_step() {
    local name=$1
    local func=$2
    
    STEP=$((STEP + 1))
    log_step "[$STEP/$TOTAL_STEPS] $name..."
    
    if $func; then
        log_info "$name 完成"
        return 0
    else
        log_error "$name 失败"
        return 1
    fi
}

# 准备更新包
prepare_update() {
    log_info "准备更新包..."
    
    cd "$PROJECT_ROOT"
    
    # 根据更新类型准备不同的更新包
    case $UPDATE_TYPE in
        file)
            # 单文件更新
            if [ -z "$UPDATE_FILE" ]; then
                log_error "请指定更新文件 (UPDATE_FILE=path/to/file)"
                exit 1
            fi
            if [ ! -f "$UPDATE_FILE" ]; then
                log_error "文件不存在: $UPDATE_FILE"
                exit 1
            fi
            log_info "更新文件: $UPDATE_FILE"
            ;;
            
        patch)
            # 补丁更新 - 创建 diff
            log_info "创建补丁..."
            git diff HEAD~1 --stat > /tmp/patch-files.txt
            log_info "补丁文件列表:"
            cat /tmp/patch-files.txt
            ;;
            
        bundle)
            # 整包更新
            log_info "准备整包更新..."
            npm run build
            ;;
    esac
    
    log_info "更新包准备完成"
}

# 创建热更新清单
create_manifest() {
    log_info "创建热更新清单..."
    
    local manifest_file="/tmp/hot-update-manifest.json"
    
    cat > "$manifest_file" << EOF
{
    "environment": "$ENV",
    "update_type": "$UPDATE_TYPE",
    "update_time": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "commit_hash": "$(git rev-parse HEAD)",
    "files": [
        $(git diff --name-only HEAD~1 2>/dev/null | sed 's/^/"/;s/$/"/' | tr '\n' ',' | sed 's/,$//')
    ]
}
EOF
    
    log_info "热更新清单已创建"
    echo "$manifest_file"
}

# 上传更新文件
upload_update() {
    log_info "上传更新文件..."
    
    local update_file=$1
    
    scp "$update_file" "$SERVER_USER@$SERVER_HOST:/tmp/"
    
    log_info "更新文件已上传"
}

# 执行热更新
apply_update() {
    log_info "执行热更新..."
    
    case $UPDATE_TYPE in
        file)
            # 备份原文件
            ssh "$SERVER_USER@$SERVER_HOST" "
                if [ -f '$DEPLOY_DIR/$UPDATE_FILE' ]; then
                    cp '$DEPLOY_DIR/$UPDATE_FILE' '$DEPLOY_DIR/$UPDATE_FILE.bak'
                fi
                
                # 替换文件
                cp /tmp/$(basename $UPDATE_FILE) '$DEPLOY_DIR/$UPDATE_FILE'
                
                # 设置权限
                chmod 644 '$DEPLOY_DIR/$UPDATE_FILE'
            "
            ;;
            
        patch)
            # 应用补丁
            ssh "$SERVER_USER@$SERVER_HOST" "
                cd $DEPLOY_DIR
                git apply /tmp/hot-update.patch
            "
            ;;
            
        bundle)
            # 整包更新 - 增量更新
            ssh "$SERVER_USER@$SERVER_HOST" "
                cd $DEPLOY_DIR
                
                # 只更新变化的静态文件
                tar -xzf /tmp/update-bundle.tar.gz -C /tmp/update-temp
                
                # 同步更新
                rsync -av --delete /tmp/update-temp/ $DEPLOY_DIR/
                
                # 清理
                rm -rf /tmp/update-temp /tmp/update-bundle.tar.gz
            "
            ;;
    esac
    
    log_info "热更新已应用"
}

# 清理缓存
clear_cache() {
    log_info "清理缓存..."
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        # 清理 CDN 缓存（如果使用）
        # curl -X PURGE 'http://cdn.example.com/...' 2>/dev/null || true
        
        # 清理 Nginx 缓存
        rm -rf /var/cache/nginx/* 2>/dev/null || true
        
        # 通知应用清理内部缓存
        # curl -X POST 'http://localhost/api/admin/clear-cache' 2>/dev/null || true
    "
    
    log_info "缓存已清理"
}

# 重新加载应用
reload_application() {
    log_info "重新加载应用..."
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        # 对于 Node.js 应用，使用 PM2 的 reload
        if pm2 list | grep -q 'backend'; then
            pm2 reload backend --update-env
        fi
        
        # 对于 Nginx
        if systemctl is-active --quiet nginx; then
            nginx -t && systemctl reload nginx
        fi
    "
    
    log_info "应用已重新加载"
}

# 验证更新
verify_update() {
    log_info "验证更新..."
    
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "验证尝试 $attempt/$max_attempts..."
        
        # 检查应用是否正常运行
        if ssh "$SERVER_USER@$SERVER_HOST" "pm2 list | grep -q 'backend' && pm2 jlist backend 2>/dev/null | grep -q 'online'"; then
            log_info "应用运行正常"
            return 0
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_warn "验证未通过，请手动检查"
    return 1
}

# 回滚热更新（如果更新失败）
rollback_hot_update() {
    log_info "回滚热更新..."
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        # 恢复备份文件
        if [ -f '$DEPLOY_DIR/$UPDATE_FILE.bak' ]; then
            mv '$DEPLOY_DIR/$UPDATE_FILE.bak' '$DEPLOY_DIR/$UPDATE_FILE'
        fi
        
        # 重新加载应用
        pm2 restart backend
    "
    
    log_info "热更新已回滚"
}

# 主函数
main() {
    echo "=========================================="
    echo "     生产热更新脚本"
    echo "=========================================="
    echo ""
    log_info "环境: $ENV"
    log_info "更新类型: $UPDATE_TYPE"
    log_info "目标服务器: $SERVER_USER@$SERVER_HOST"
    echo ""
    
    # 确认热更新
    confirm_hot_update
    
    # 执行热更新步骤
    run_step "准备更新包" prepare_update
    run_step "创建更新清单" create_manifest
    run_step "上传更新文件" upload_update
    run_step "应用热更新" apply_update
    run_step "清理缓存" clear_cache
    run_step "重新加载应用" reload_application
    run_step "验证更新" verify_update
    
    echo ""
    echo "=========================================="
    log_info "热更新完成!"
    echo "=========================================="
    echo ""
    echo "更新类型: $UPDATE_TYPE"
    echo "更新时间: $(date)"
    echo ""
}

main "$@"
