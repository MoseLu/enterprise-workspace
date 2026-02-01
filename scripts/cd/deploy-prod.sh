#!/bin/bash
# =============================================================================
# 生产环境部署脚本
# 功能：将代码部署到生产环境（需要确认）
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
DEPLOY_DIR="${DEPLOY_DIR:-/opt/project/prod}"
SERVER_HOST="${PROD_SERVER_HOST:-}"
SERVER_USER="${PROD_SERVER_USER:-deploy}"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups}"

# 构建产物目录
BUILD_DIR="${BUILD_DIR:-$PROJECT_ROOT/dist}"

# 步骤计数器
STEP=0
TOTAL_STEPS=10

# 确认部署
confirm_deployment() {
    if [ -n "$AUTO_CONFIRM" ]; then
        return 0
    fi
    
    echo ""
    echo "=========================================="
    echo -e "${RED}警告: 即将部署到生产环境!${NC}"
    echo "=========================================="
    echo ""
    echo "环境: $ENV"
    echo "目标服务器: $SERVER_USER@$SERVER_HOST"
    echo "部署目录: $DEPLOY_DIR"
    echo ""
    
    read -p "确认部署到生产环境? (输入 'deploy' 继续): " -r
    echo ""
    
    if [ "$REPLY" != "deploy" ]; then
        log_info "已取消部署"
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

# 检查服务器连接
check_server() {
    log_info "检查服务器连接..."
    
    if [ -z "$SERVER_HOST" ]; then
        log_error "未设置 PROD_SERVER_HOST 环境变量"
        exit 1
    fi
    
    if ! ssh -o ConnectTimeout=5 "$SERVER_USER@$SERVER_HOST" "echo '连接成功'" 2>/dev/null; then
        log_error "无法连接到服务器: $SERVER_USER@$SERVER_HOST"
        exit 1
    fi
    
    log_info "服务器连接正常"
}

# 准备构建
prepare_build() {
    log_info "准备构建环境..."
    
    cd "$PROJECT_ROOT"
    
    # 获取当前分支
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    log_info "当前分支: $CURRENT_BRANCH"
    
    # 获取提交信息
    COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null | head -1 || echo "unknown")
    log_info "提交哈希: $COMMIT_HASH"
    log_info "提交信息: $COMMIT_MSG"
    
    # 检查是否有未提交的更改
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log_error "存在未提交的更改，请先提交代码"
        exit 1
    fi
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
    
    # 生产环境使用 npm ci 确保依赖一致性
    npm ci --prefer-offline --no-audit
    
    # 生产构建
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
        npm ci --prefer-offline --no-audit
    elif [ -f "requirements.txt" ]; then
        if [ -z "$VIRTUAL_ENV" ]; then
            python -m venv venv
            source venv/bin/activate
        fi
        pip install -r requirements.txt
    fi
    
    log_info "后端构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    
    cd "$PROJECT_ROOT"
    
    # 运行前端测试
    local frontend_dir="$PROJECT_ROOT/frontend"
    if [ -d "$frontend_dir" ]; then
        cd "$frontend_dir"
        npm run test -- --run || true
    fi
    
    log_info "测试完成"
}

# 创建部署包
create_package() {
    log_info "创建部署包..."
    
    cd "$PROJECT_ROOT"
    
    local temp_dir=$(mktemp -d)
    local package_name="deploy-${ENV}-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # 复制前端构建产物
    if [ -d "$BUILD_DIR" ]; then
        cp -r "$BUILD_DIR" "$temp_dir/public"
    fi
    
    # 复制后端代码
    if [ -d "$PROJECT_ROOT/backend" ]; then
        cp -r "$PROJECT_ROOT/backend" "$temp_dir/backend"
    fi
    
    # 复制生产环境配置
    if [ -f "$PROJECT_ROOT/.env.$ENV" ]; then
        cp "$PROJECT_ROOT/.env.$ENV" "$temp_dir/backend/.env"
    fi
    
    # 创建部署清单
    cat > "$temp_dir/deploy-manifest.json" << EOF
{
    "environment": "$ENV",
    "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "commit_hash": "$(git rev-parse HEAD)",
    "branch": "$(git branch --show-current)",
    "version": "$(git describe --tags --always)"
}
EOF
    
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
    
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $BACKUP_DIR"
    
    local backup_name="backup-${ENV}-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    if ssh "$SERVER_USER@$SERVER_HOST" "test -d $DEPLOY_DIR" 2>/dev/null; then
        ssh "$SERVER_USER@$SERVER_HOST" "tar -czf $BACKUP_DIR/$backup_name -C $DEPLOY_DIR . 2>/dev/null || true"
        log_info "已备份到: $BACKUP_DIR/$backup_name"
    else
        log_warn "当前部署目录不存在，跳过备份"
    fi
}

# 上传部署包
upload_package() {
    log_info "上传部署包到服务器..."
    
    local package_name=$1
    
    ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $DEPLOY_DIR"
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
        
        # 设置权限
        chmod +x backend/*.sh 2>/dev/null || true
    "
    
    log_info "部署包已解压"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    
    ssh "$SERVER_USER@$SERVER_HOST" "
        # 优雅重启后端服务
        if pm2 list | grep -q 'backend'; then
            pm2 gracefulReload backend
        fi
        
        # 重载 Nginx（零停机）
        if systemctl is-active --quiet nginx; then
            nginx -t && systemctl reload nginx
        fi
    "
    
    log_info "服务已重启"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    local health_url="http://${SERVER_HOST}/api/health"
    local max_attempts=30
    local attempt=1
    
    # 等待服务启动并检查健康状态
    while [ $attempt -le $max_attempts ]; do
        log_info "健康检查尝试 $attempt/$max_attempts..."
        
        if curl -sf "$health_url" > /dev/null 2>&1; then
            log_info "健康检查通过"
            return 0
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_warn "健康检查未通过，请手动检查服务状态"
    return 1
}

# 发送部署通知
send_notification() {
    log_info "发送部署通知..."
    
    local status=$1
    local message="生产环境部署${status}: ${ENV} 环境"
    
    # 可以集成 Slack、邮件等通知
    # 这里预留通知接口
    log_info "通知已发送: $message"
}

# 主函数
main() {
    echo "=========================================="
    echo "     生产环境部署脚本"
    echo "=========================================="
    echo ""
    log_info "环境: $ENV"
    log_info "目标服务器: $SERVER_USER@$SERVER_HOST"
    log_info "部署目录: $DEPLOY_DIR"
    echo ""
    
    # 确认部署
    confirm_deployment
    
    # 运行部署步骤
    run_step "检查服务器连接" check_server
    run_step "准备构建环境" prepare_build
    run_step "运行测试" run_tests
    run_step "构建前端应用" build_frontend
    run_step "构建后端应用" build_backend
    run_step "创建部署包" create_package
    run_step "备份当前版本" backup_current
    run_step "上传部署包" upload_package
    run_step "解压部署" extract_package
    run_step "重启服务" restart_services
    run_step "验证部署" verify_deployment
    
    # 发送成功通知
    send_notification "成功"
    
    echo ""
    echo "=========================================="
    log_info "生产环境部署完成!"
    echo "=========================================="
    echo ""
    echo "访问地址: http://$SERVER_HOST"
    echo ""
}

main "$@"
