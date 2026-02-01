#!/bin/bash
# =============================================================================
# 回滚脚本
# 功能：回滚到之前的版本
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
BACKUP_DIR="${BACKUP_DIR:-/opt/backups}"

# 回滚目标
TARGET_VERSION=${2:-}

# 步骤计数器
STEP=0
TOTAL_STEPS=6

# 确认回滚
confirm_rollback() {
    if [ -n "$AUTO_CONFIRM" ]; then
        return 0
    fi
    
    echo ""
    echo "=========================================="
    echo -e "${RED}警告: 即将回滚 ${ENV} 环境!${NC}"
    echo "=========================================="
    echo ""
    
    if [ -n "$TARGET_VERSION" ]; then
        echo "回滚目标版本: $TARGET_VERSION"
    else
        echo "将回滚到上一个版本"
    fi
    
    echo ""
    read -p "确认回滚? (输入 'rollback' 继续): " -r
    echo ""
    
    if [ "$REPLY" != "rollback" ]; then
        log_info "已取消回滚"
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

# 获取可用备份列表
list_backups() {
    log_info "获取可用备份列表..."
    
    echo ""
    echo "可用备份:"
    echo "--------"
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        ls -lt $BACKUP_DIR/backup-${ENV}-*.tar.gz 2>/dev/null | head -20 || echo '没有找到备份'
    "
    
    echo ""
}

# 获取上一个备份
get_previous_backup() {
    local backup_file=$(ssh "$SERVER_USER@$SERVER_HOST" "
        ls -t $BACKUP_DIR/backup-${ENV}-*.tar.gz 2>/dev/null | head -1
    ")
    
    if [ -z "$backup_file" ]; then
        log_error "没有找到可用的备份"
        return 1
    fi
    
    echo "$backup_file"
}

# 执行回滚
perform_rollback() {
    log_info "执行回滚..."
    
    local backup_file=$1
    
    # 确保部署目录存在
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $DEPLOY_DIR"
    
    # 解压备份
    ssh "$SERVER_USER@$SERVER_HOST" "
        cd $DEPLOY_DIR
        tar -xzf $backup_file
        
        # 设置权限
        chmod +x backend/*.sh 2>/dev/null || true
    "
    
    log_info "已从备份恢复: $backup_file"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        # 重新加载后端
        if pm2 list | grep -q 'backend'; then
            pm2 restart backend
        fi
        
        # 重载 Nginx
        if systemctl is-active --quiet nginx; then
            nginx -t && systemctl reload nginx
        fi
    "
    
    log_info "服务已重启"
}

# 验证回滚
verify_rollback() {
    log_info "验证回滚..."
    
    local health_url="http://${SERVER_HOST}/api/health"
    local max_attempts=15
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log_info "健康检查尝试 $attempt/$max_attempts..."
        
        if curl -sf "$health_url" > /dev/null 2>&1; then
            log_info "健康检查通过"
            return 0
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_warn "健康检查未通过，请手动检查"
    return 1
}

# 回滚 Git 代码
rollback_git() {
    if [ -z "$TARGET_VERSION" ]; then
        log_info "未指定目标版本，跳过代码回滚"
        return 0
    fi
    
    log_info "回滚代码到: $TARGET_VERSION"
    
    cd "$PROJECT_ROOT"
    
    # 检查是否是有效的 commit
    if git rev-parse --verify "$TARGET_VERSION" > /dev/null 2>&1; then
        git checkout "$TARGET_VERSION"
        log_info "代码已回滚到 $TARGET_VERSION"
    else
        log_error "无效的版本: $TARGET_VERSION"
        return 1
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "     回滚脚本"
    echo "=========================================="
    echo ""
    log_info "环境: $ENV"
    log_info "目标服务器: $SERVER_USER@$SERVER_HOST"
    log_info "部署目录: $DEPLOY_DIR"
    echo ""
    
    # 确认回滚
    confirm_rollback
    
    # 列出可用备份
    list_backups
    
    # 获取回滚目标
    if [ -z "$TARGET_VERSION" ]; then
        TARGET_VERSION=$(get_previous_backup)
        if [ $? -ne 0 ]; then
            log_error "无法获取上一个备份"
            exit 1
        fi
        log_info "将回滚到备份: $TARGET_VERSION"
    fi
    
    # 执行回滚步骤
    run_step "执行回滚" "perform_rollback $TARGET_VERSION"
    run_step "重启服务" restart_services
    run_step "验证回滚" verify_rollback
    
    # 可选：回滚代码
    if [ -n "$ROLLBACK_CODE" ]; then
        run_step "回滚代码" rollback_git
    fi
    
    echo ""
    echo "=========================================="
    log_info "回滚完成!"
    echo "=========================================="
    echo ""
    echo "已回滚到: $TARGET_VERSION"
    echo "请验证功能是否正常"
    echo ""
}

main "$@"
