#!/bin/bash
# =============================================================================
# 测试环境部署脚本
# 功能：将代码部署到测试环境
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
ENV=${1:-test}
DEPLOY_DIR="${DEPLOY_DIR:-/opt/project/test}"
SERVER_HOST="${TEST_SERVER_HOST:-localhost}"
SERVER_USER="${TEST_SERVER_USER:-deploy}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups}"

# 构建产物目录
BUILD_DIR="${BUILD_DIR:-$PROJECT_ROOT/dist}"

# 步骤计数器
STEP=0
TOTAL_STEPS=8

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

# 准备构建
prepare_build() {
    log_info "准备构建环境..."
    
    # 确保在项目根目录
    cd "$PROJECT_ROOT"
    
    # 检查 Git 状态
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log_warn "存在未提交的更改，这些更改不会被部署"
    fi
    
    # 获取当前分支
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    log_info "当前分支: $CURRENT_BRANCH"
    
    # 获取提交哈希
    COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null | cut -c1-8 || echo "unknown")
    log_info "提交哈希: $COMMIT_HASH"
}

# 构建前端
build_frontend() {
    log_info "构建前端应用..."
    
    local frontend_dir="$PROJECT_ROOT/frontend"
    
    if [ ! -d "$frontend_dir" ]; then
        log_warn "未找到前端目录，跳过前端构建"
        return 0
    fi
    
    cd "$frontend_dir"
    
    # 安装依赖
    npm ci --prefer-offline --no-audit || npm install
    
    # 构建
    npm run build
    
    log_info "前端构建完成"
}

# 构建后端
build_backend() {
    log_info "构建后端应用..."
    
    local backend_dir="$PROJECT_ROOT/backend"
    
    if [ ! -d "$backend_dir" ]; then
        log_warn "未找到后端目录，跳过后端构建"
        return 0
    fi
    
    cd "$backend_dir"
    
    if [ -f "package.json" ]; then
        # Node.js 项目
        npm ci --prefer-offline --no-audit || npm install
    elif [ -f "requirements.txt" ]; then
        # Python 项目
        if [ -z "$VIRTUAL_ENV" ]; then
            python -m venv venv
            source venv/bin/activate
        fi
        pip install -r requirements.txt
    fi
    
    log_info "后端构建完成"
}

# 创建部署包
create_package() {
    log_info "创建部署包..."
    
    cd "$PROJECT_ROOT"
    
    # 创建临时目录
    local temp_dir=$(mktemp -d)
    local package_name="deploy-${ENV}-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # 复制前端构建产物
    if [ -d "$BUILD_DIR" ]; then
        cp -r "$BUILD_DIR" "$temp_dir/public"
        log_info "已包含前端产物"
    fi
    
    # 复制后端代码
    if [ -d "$PROJECT_ROOT/backend" ]; then
        cp -r "$PROJECT_ROOT/backend" "$temp_dir/backend"
        log_info "已包含后端代码"
    fi
    
    # 复制配置文件
    if [ -f "$PROJECT_ROOT/.env.$ENV" ]; then
        cp "$PROJECT_ROOT/.env.$ENV" "$temp_dir/backend/.env"
        log_info "已包含环境配置"
    elif [ -f "$PROJECT_ROOT/.env" ]; then
        cp "$PROJECT_ROOT/.env" "$temp_dir/backend/.env"
        log_info "已包含默认配置"
    fi
    
    # 创建压缩包
    tar -czf "$package_name" -C "$temp_dir" .
    
    # 清理临时目录
    rm -rf "$temp_dir"
    
    log_info "部署包已创建: $package_name"
    echo "$package_name"
}

# 备份当前版本
backup_current() {
    log_info "备份当前版本..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    local backup_name="backup-${ENV}-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    if ssh "$SERVER_USER@$SERVER_HOST" "test -d $DEPLOY_DIR" 2>/dev/null; then
        ssh "$SERVER_USER@$SERVER_HOST" "tar -czf $BACKUP_DIR/$backup_name -C $DEPLOY_DIR ."
        log_info "已备份到: $BACKUP_DIR/$backup_name"
    else
        log_warn "当前部署目录不存在，跳过备份"
    fi
}

# 上传部署包
upload_package() {
    log_info "上传部署包到服务器..."
    
    local package_name=$1
    
    # 确保远程目录存在
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $DEPLOY_DIR"
    
    # 上传
    scp "$package_name" "$SERVER_USER@$SERVER_HOST:$DEPLOY_DIR/"
    
    log_info "部署包已上传到服务器"
}

# 解压部署
extract_package() {
    log_info "解压并部署..."
    
    local package_name=$1
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        cd $DEPLOY_DIR
        tar -xzf $package_name
        rm -f $package_name
    "
    
    log_info "部署包已解压"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        # 重启后端服务
        if pm2 list | grep -q 'backend'; then
            pm2 restart backend
        fi
        
        # 重启 Nginx
        if systemctl is-active --quiet nginx; then
            systemctl reload nginx
        fi
    "
    
    log_info "服务已重启"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    local test_url="http://${SERVER_HOST}:${FRONTEND_PORT:-80}/health"
    
    # 等待服务启动
    sleep 5
    
    # 检查健康端点
    if curl -sf "$test_url" > /dev/null 2>&1; then
        log_info "健康检查通过"
        return 0
    else
        log_warn "健康检查未通过，可能需要更多时间启动"
        return 0
    fi
}

# 清理本地文件
cleanup() {
    log_info "清理本地文件..."
    
    local package_name=$1
    if [ -f "$package_name" ]; then
        rm -f "$package_name"
        log_info "已删除本地部署包"
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "     测试环境部署脚本"
    echo "=========================================="
    echo ""
    log_info "环境: $ENV"
    log_info "目标服务器: $SERVER_USER@$SERVER_HOST"
    log_info "部署目录: $DEPLOY_DIR"
    echo ""
    
    # 运行部署步骤
    run_step "准备构建环境" prepare_build
    run_step "构建前端应用" build_frontend
    run_step "构建后端应用" build_backend
    run_step "创建部署包" create_package
    run_step "备份当前版本" backup_current
    run_step "上传部署包" upload_package
    run_step "解压部署" extract_package
    run_step "重启服务" restart_services
    run_step "验证部署" verify_deployment
    
    echo ""
    echo "=========================================="
    log_info "测试环境部署完成!"
    echo "=========================================="
    echo ""
    echo "访问地址: http://$SERVER_HOST"
    echo ""
}

main "$@"
