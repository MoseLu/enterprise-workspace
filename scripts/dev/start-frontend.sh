#!/bin/bash
# =============================================================================
# 启动前端服务脚本（DevStation 版本）
# 功能：启动 DevStation 前端开发服务器
# 特性：自动检测并停止占用端口的旧进程
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

# 端口配置（默认 8080）
PORT=${1:-$FRONTEND_PORT}
PORT=${PORT:-8080}

# 前端目录（DevStation）
FRONTEND_DIR="$PROJECT_ROOT/products/devstation/ui"

# 检查目录是否存在
if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "未找到前端目录: $FRONTEND_DIR"
    exit 1
fi

# 检查 package.json 是否存在
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    log_error "未找到 package.json 文件"
    exit 1
fi

# 检查 pnpm 是否可用
if ! command -v pnpm &> /dev/null; then
    log_error "未找到 pnpm，请先安装 pnpm: npm install -g pnpm"
    exit 1
fi

# 检测操作系统
detect_os() {
    case "$(uname -s)" in
        CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
        *) echo "linux" ;;
    esac
}

OS_TYPE=$(detect_os)

# 检查端口是否被占用的函数
check_port() {
    local port=$1
    if [ "$OS_TYPE" = "windows" ]; then
        netstat -ano | findstr /R /C:"\:$port " > /dev/null 2>&1
        return $?
    else
        lsof -i:$port > /dev/null 2>&1
        return $?
    fi
}

# 停止占用端口的进程
stop_port_process() {
    local port=$1

    if ! check_port $port; then
        log_info "端口 $port 未被占用"
        return 0
    fi

    log_warn "检测到端口 $port 已被占用，正在清理..."

    if [ "$OS_TYPE" = "windows" ]; then
        # Windows PowerShell 方式
        local pids=$(powershell -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess" 2>/dev/null)

        if [ -n "$pids" ]; then
            for pid in $pids; do
                log_info "终止进程 PID: $pid"
                powershell -Command "Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue" 2>/dev/null || true
            done
        fi

        # 也尝试用 taskkill
        local listen_pids=$(netstat -ano | findstr /R /C:"\:$port " | findstr LISTENING | for /f "tokens=5" %a in ('more') do @echo %a)
        for pid in $listen_pids; do
            log_info "额外终止进程 PID: $pid"
            taskkill /F /PID $pid 2>/dev/null || true
        done
    else
        # Linux/macOS
        local pids=$(lsof -ti:$port 2>/dev/null)
        for pid in $pids; do
            log_info "终止进程 PID: $pid"
            kill -9 $pid 2>/dev/null || true
        done
    fi

    sleep 2

    if check_port $port; then
        log_error "无法释放端口 $port，请手动终止相关进程"
        log_info "可以使用以下命令终止: lsof -i:$port 或 netstat -ano | findstr :$port"
        exit 1
    fi

    log_info "端口 $port 已释放"
}

# 检查端口占用
log_info "检查端口 $PORT 占用情况..."
stop_port_process $PORT

# 进入前端目录
cd "$FRONTEND_DIR"

log_info "启动前端开发服务器..."
log_info "端口: $PORT"
log_info "访问地址: http://localhost:$PORT"
log_info "IP访问: http://0.0.0.0:$PORT"
log_info "使用包管理器: pnpm"
echo ""

# 启动开发服务器
exec pnpm run dev -- --port $PORT
