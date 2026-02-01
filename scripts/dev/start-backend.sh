#!/bin/bash
# =============================================================================
# 启动后端服务脚本
# 功能：仅启动后端开发服务器
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
PORT=${1:-$BACKEND_PORT}
PORT=${PORT:-8080}

# 后端目录
BACKEND_DIR="$PROJECT_ROOT/backend"

# 检查目录是否存在
if [ ! -d "$BACKEND_DIR" ]; then
    log_error "未找到 backend 目录: $BACKEND_DIR"
    exit 1
fi

# 进入后端目录
cd "$BACKEND_DIR"

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

log_info "启动后端开发服务器..."
log_info "端口: $PORT"
log_info "API 地址: http://localhost:$PORT/api"
echo ""

# 根据项目类型选择启动方式
if [ -f "package.json" ]; then
    # Node.js/Express 项目
    exec npm run dev -- --port $PORT
    
elif [ -f "requirements.txt" ]; then
    # Python/FastAPI 项目
    exec python -m uvicorn main:app --host 0.0.0.0 --port $PORT --reload
    
elif [ -f "pom.xml" ]; then
    # Java/Maven 项目
    exec mvn spring-boot:run
    
elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
    # Java/Gradle 项目
    exec ./gradlew bootRun
    
else
    log_error "未识别后端项目类型，无法启动"
    exit 1
fi
