#!/bin/bash
# =============================================================================
# 依赖检查脚本
# 功能：检查开发环境所需的依赖是否已安装
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 计数器
CHECK_COUNT=0
PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# 检查函数
check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3
    
    CHECK_COUNT=$((CHECK_COUNT + 1))
    
    if command -v $cmd &> /dev/null; then
        if [ -n "$min_version" ]; then
            local version=$($cmd --version 2>/dev/null | head -n1)
            log_info "$name 已安装 (版本: $version)"
        else
            log_info "$name 已安装"
        fi
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        log_error "$name 未安装"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# 可选检查函数
check_optional() {
    local cmd=$1
    local name=$2
    
    CHECK_COUNT=$((CHECK_COUNT + 1))
    
    if command -v $cmd &> /dev/null; then
        local version=$($cmd --version 2>/dev/null | head -n1)
        log_success "$name 已安装 (版本: $version)"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        log_warn "$name 未安装 (可选)"
        WARN_COUNT=$((WARN_COUNT + 1))
        return 1
    fi
}

# 检查必需依赖
check_required_deps() {
    echo "=========================================="
    echo "     检查必需依赖"
    echo "=========================================="
    echo ""
    
    check_command "node" "Node.js" "version"
    check_command "npm" "npm" "version"
    check_command "git" "Git"
}

# 检查可选依赖
check_optional_deps() {
    echo ""
    echo "=========================================="
    echo "     检查可选依赖"
    echo "=========================================="
    echo ""
    
    check_optional "python3" "Python 3"
    check_optional "docker" "Docker"
    check_optional "mysql" "MySQL Client"
    check_optional "psql" "PostgreSQL Client"
}

# 检查项目依赖
check_project_deps() {
    echo ""
    echo "=========================================="
    echo "     检查项目依赖"
    echo "=========================================="
    echo ""
    
    # 检查前端依赖
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    if [ -d "$FRONTEND_DIR" ]; then
        CHECK_COUNT=$((CHECK_COUNT + 1))
        if [ -d "$FRONTEND_DIR/node_modules" ]; then
            log_success "前端依赖已安装"
            PASS_COUNT=$((PASS_COUNT + 1))
        else
            log_warn "前端依赖未安装 (需要运行 npm install)"
            WARN_COUNT=$((WARN_COUNT + 1))
        fi
    fi
    
    # 检查后端依赖
    BACKEND_DIR="$PROJECT_ROOT/backend"
    if [ -d "$BACKEND_DIR" ]; then
        CHECK_COUNT=$((CHECK_COUNT + 1))
        if [ -f "$BACKEND_DIR/package.json" ]; then
            if [ -d "$BACKEND_DIR/node_modules" ]; then
                log_success "后端依赖 (Node.js) 已安装"
                PASS_COUNT=$((PASS_COUNT + 1))
            else
                log_warn "后端依赖 (Node.js) 未安装"
                WARN_COUNT=$((WARN_COUNT + 1))
            fi
        elif [ -f "$BACKEND_DIR/requirements.txt" ]; then
            if [ -d "$BACKEND_DIR/venv" ] || command -v pip &> /dev/null; then
                log_success "后端依赖 (Python) 已安装"
                PASS_COUNT=$((PASS_COUNT + 1))
            else
                log_warn "后端依赖 (Python) 未安装"
                WARN_COUNT=$((WARN_COUNT + 1))
            fi
        fi
    fi
}

# 检查环境变量
check_env_vars() {
    echo ""
    echo "=========================================="
    echo "     检查环境变量"
    echo "=========================================="
    echo ""
    
    CHECK_COUNT=$((CHECK_COUNT + 1))
    ENV_FILE="$PROJECT_ROOT/.env"
    
    if [ -f "$ENV_FILE" ]; then
        log_success ".env 文件存在"
        PASS_COUNT=$((PASS_COUNT + 1))
        
        # 检查关键配置
        local required_vars=("DATABASE_URL" "JWT_SECRET")
        for var in "${required_vars[@]}"; do
            CHECK_COUNT=$((CHECK_COUNT + 1))
            if grep -q "^$var=" "$ENV_FILE" 2>/dev/null; then
                log_info "$var 已配置"
                PASS_COUNT=$((PASS_COUNT + 1))
            else
                log_warn "$var 未配置"
                WARN_COUNT=$((WARN_COUNT + 1))
            fi
        done
    else
        log_warn ".env 文件不存在"
        WARN_COUNT=$((WARN_COUNT + 1))
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "     依赖检查工具"
    echo "=========================================="
    echo ""
    log_info "项目根目录: $PROJECT_ROOT"
    echo ""
    
    check_required_deps
    check_optional_deps
    check_project_deps
    check_env_vars
    
    echo ""
    echo "=========================================="
    echo "     检查结果汇总"
    echo "=========================================="
    echo ""
    echo "总检查数: $CHECK_COUNT"
    echo -e "通过: ${GREEN}$PASS_COUNT${NC}"
    echo -e "警告: ${YELLOW}$WARN_COUNT${NC}"
    echo -e "失败: ${RED}$FAIL_COUNT${NC}"
    echo ""
    
    if [ $FAIL_COUNT -gt 0 ]; then
        log_error "存在未通过的检查项，请解决后再继续"
        exit 1
    elif [ $WARN_COUNT -gt 0 ]; then
        log_warn "存在警告，请检查相关配置"
    else
        log_success "所有检查已通过!"
    fi
}

main "$@"
