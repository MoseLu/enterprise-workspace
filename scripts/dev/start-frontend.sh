#!/bin/bash
# =============================================================================
# 启动前端服务脚本
# 功能：仅启动前端开发服务器
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

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 端口配置
PORT=${1:-$FRONTEND_PORT}
PORT=${PORT:-3000}

# 前端目录
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# 检查目录是否存在
if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "未找到 frontend 目录: $FRONTEND_DIR"
    exit 1
fi

# 检查 package.json 是否存在
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    log_error "未找到 package.json 文件"
    exit 1
fi

# 检查端口是否被占用
check_port() {
    if lsof -i:$1 &> /dev/null; then
        return 0
    fi
    return 1
}

if check_port $PORT; then
    log_warn "端口 $PORT 已被占用，尝试停止占用进程..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 进入前端目录
cd "$FRONTEND_DIR"

log_info "启动前端开发服务器..."
log_info "端口: $PORT"
log_info "访问地址: http://localhost:$PORT"
echo ""

# 启动开发服务器
exec npm run dev -- --port $PORT
