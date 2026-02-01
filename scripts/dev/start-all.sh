#!/bin/bash
# =============================================================================
# 一键启动所有服务脚本
# 功能：同时启动前端和后端服务
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_service() {
    echo -e "${BLUE}[SERVICE]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 服务配置
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-8080}

# 前端服务 PID
FRONTEND_PID=""
# 后端服务 PID
BACKEND_PID=""

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -i:$port &> /dev/null; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 启动前端服务
start_frontend() {
    log_service "启动前端服务..."
    
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        log_error "未找到 frontend 目录"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # 检查端口是否被占用
    if check_port $FRONTEND_PORT; then
        log_warn "前端端口 $FRONTEND_PORT 已被占用，尝试停止占用进程..."
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    # 启动前端开发服务器
    npm run dev &
    FRONTEND_PID=$!
    
    log_info "前端服务已启动 (PID: $FRONTEND_PID, 端口: $FRONTEND_PORT)"
    
    # 等待服务启动
    sleep 3
    
    # 检查服务是否正常运行
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        log_error "前端服务启动失败"
        return 1
    fi
}

# 启动后端服务
start_backend() {
    log_service "启动后端服务..."
    
    BACKEND_DIR="$PROJECT_ROOT/backend"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        log_error "未找到 backend 目录"
        return 1
    fi
    
    cd "$BACKEND_DIR"
    
    # 检查端口是否被占用
    if check_port $BACKEND_PORT; then
        log_warn "后端端口 $BACKEND_PORT 已被占用，尝试停止占用进程..."
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    # 根据项目类型启动后端服务
    if [ -f "package.json" ]; then
        npm run dev &
        BACKEND_PID=$!
    elif [ -f "requirements.txt" ]; then
        python -m uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT &
        BACKEND_PID=$!
    else
        log_error "未找到后端启动配置"
        return 1
    fi
    
    log_info "后端服务已启动 (PID: $BACKEND_PID, 端口: $BACKEND_PORT)"
    
    # 等待服务启动
    sleep 3
    
    # 检查服务是否正常运行
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        log_error "后端服务启动失败"
        return 1
    fi
}

# 停止所有服务
stop_all() {
    log_info "停止所有服务..."
    
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        log_info "已停止前端服务 (PID: $FRONTEND_PID)"
    fi
    
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        log_info "已停止后端服务 (PID: $BACKEND_PID)"
    fi
    
    # 清理残留进程
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "uvicorn" 2>/dev/null || true
}

# 等待用户中断
wait_for_interrupt() {
    log_info "服务正在运行，按 Ctrl+C 停止所有服务..."
    
    # 捕获中断信号
    trap stop_all INT
    
    # 等待
    while true; do
        sleep 1
    done
}

# 主函数
main() {
    echo "=========================================="
    echo "     一键启动所有服务"
    echo "=========================================="
    echo ""
    log_info "项目根目录: $PROJECT_ROOT"
    log_info "前端端口: $FRONTEND_PORT"
    log_info "后端端口: $BACKEND_PORT"
    echo ""
    
    # 启动服务
    start_frontend || log_warn "前端服务启动失败"
    start_backend || log_warn "后端服务启动失败"
    
    echo ""
    echo "=========================================="
    log_info "所有服务启动完成!"
    echo "=========================================="
    echo ""
    echo "服务状态:"
    [ -n "$FRONTEND_PID" ] && echo "  - 前端: http://localhost:$FRONTEND_PORT (PID: $FRONTEND_PID)"
    [ -n "$BACKEND_PID" ] && echo "  - 后端: http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)"
    echo ""
    
    # 等待用户中断
    wait_for_interrupt
}

main "$@"
