#!/bin/bash
# =============================================================================
# 环境初始化脚本
# 功能：初始化开发环境，安装依赖，配置必要的环境变量
# =============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "=========================================="
echo "     开发环境初始化脚本"
echo "=========================================="
echo ""

# 检查 Node.js 版本
check_node() {
    log_info "检查 Node.js 环境..."
    if ! command -v node &> /dev/null; then
        log_error "未找到 Node.js，请先安装 Node.js (建议 v18+)"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    log_info "Node.js 版本: $NODE_VERSION"
    
    # 检查版本是否满足要求
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -lt 18 ]; then
        log_warn "Node.js 版本低于 v18，某些功能可能不兼容"
    fi
}

# 检查 npm 版本
check_npm() {
    log_info "检查 npm 环境..."
    if ! command -v npm &> /dev/null; then
        log_error "未找到 npm，请检查 Node.js 安装"
        exit 1
    fi
    
    NPM_VERSION=$(npm -v)
    log_info "npm 版本: $NPM_VERSION"
}

# 安装前端依赖
install_frontend_deps() {
    log_info "安装前端依赖..."
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        npm install
        log_info "前端依赖安装完成"
    else
        log_warn "未找到 frontend 目录，跳过前端依赖安装"
    fi
}

# 安装后端依赖
install_backend_deps() {
    log_info "安装后端依赖..."
    BACKEND_DIR="$PROJECT_ROOT/backend"
    
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        if [ -f "package.json" ]; then
            npm install
        elif [ -f "requirements.txt" ]; then
            pip install -r requirements.txt
        fi
        log_info "后端依赖安装完成"
    else
        log_warn "未找到 backend 目录，跳过后端依赖安装"
    fi
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."
    ENV_FILE="$PROJECT_ROOT/.env.example"
    
    if [ -f "$ENV_FILE" ]; then
        if [ ! -f "$PROJECT_ROOT/.env" ]; then
            cp "$ENV_FILE" "$PROJECT_ROOT/.env"
            log_info "已从 .env.example 创建 .env 文件，请根据需要修改配置"
        else
            log_info ".env 文件已存在，跳过创建"
        fi
    else
        log_warn "未找到 .env.example 文件"
    fi
}

# 检查数据库连接
check_database() {
    log_info "检查数据库配置..."
    # 预留：后续添加数据库连接检查逻辑
    log_warn "数据库连接检查待实现"
}

# 主函数
main() {
    log_info "开始初始化开发环境..."
    
    check_node
    check_npm
    
    # 可选：安装依赖
    read -p "是否安装前端依赖? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_frontend_deps
    fi
    
    read -p "是否安装后端依赖? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_backend_deps
    fi
    
    setup_env
    check_database
    
    echo ""
    echo "=========================================="
    log_info "环境初始化完成!"
    echo "=========================================="
    echo ""
    echo "后续步骤："
    echo "1. 修改 .env 文件中的配置"
    echo "2. 运行 ./scripts/dev/start-all.sh 启动所有服务"
    echo ""
}

main "$@"
