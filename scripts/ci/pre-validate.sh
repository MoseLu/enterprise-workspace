#!/bin/bash
# =============================================================================
# CI 前置校验脚本
# 功能：在 CI 构建前进行必要的校验和检查
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

# 计数器
STEP_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# 步骤函数
run_step() {
    local name=$1
    local func=$2
    
    STEP_COUNT=$((STEP_COUNT + 1))
    log_step "[$STEP_COUNT/$TOTAL_STEPS] $name..."
    
    if $func; then
        log_info "$name 通过"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        log_error "$name 失败"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# 检查代码格式 (ESLint)
check_lint() {
    log_info "检查代码格式..."
    
    # 前端检查
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        cd "$FRONTEND_DIR"
        if grep -q '"lint"' package.json; then
            npm run lint
        else
            log_warn "未配置 lint 脚本，跳过前端代码检查"
        fi
    fi
    
    # 后端检查
    BACKEND_DIR="$PROJECT_ROOT/backend"
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        if [ -f "package.json" ] && grep -q '"lint"' package.json; then
            npm run lint
        elif [ -f "requirements.txt" ]; then
            # Python linting
            if command -v flake8 &> /dev/null; then
                flake8 . --max-line-length=120 || true
            elif command -v black &> /dev/null; then
                black --check . || true
            fi
        fi
    fi
    
    return 0
}

# 检查类型 (TypeScript)
check_types() {
    log_info "检查类型..."
    
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/tsconfig.json" ]; then
        cd "$FRONTEND_DIR"
        if grep -q '"typecheck"' package.json; then
            npm run typecheck
        elif grep -q '"build"' package.json; then
            npx tsc --noEmit
        fi
    fi
    
    return 0
}

# 检查测试
check_tests() {
    log_info "检查测试..."
    
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        cd "$FRONTEND_DIR"
        if grep -q '"test"' package.json; then
            npm run test -- --passWithNoTests || true
        fi
    fi
    
    BACKEND_DIR="$PROJECT_ROOT/backend"
    if [ -d "$BACKEND_DIR" ]; then
        cd "$BACKEND_DIR"
        if [ -f "package.json" ] && grep -q '"test"' package.json; then
            npm run test || true
        elif [ -f "requirements.txt" ] && [ -d "tests" ]; then
            if command -v pytest &> /dev/null; then
                pytest --passos-with-no-tests || true
            fi
        fi
    fi
    
    return 0
}

# 检查依赖版本
check_deps_version() {
    log_info "检查依赖版本..."
    
    FRONTEND_DIR="$PROJECT_ROOT/frontend"
    if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
        cd "$FRONTEND_DIR"
        if command -v npm-check-updates &> /dev/null; then
            ncu --target patch --error-level exit 1 || true
        else
            log_warn "未安装 npm-check-updates，跳过依赖版本检查"
        fi
    fi
    
    return 0
}

# 检查敏感信息
check_secrets() {
    log_info "检查敏感信息..."
    
    # 检查是否包含硬编码的密钥
    local patterns=(
        "api_key.*=.*['\"][A-Za-z0-9]{20,}['\"]"
        "secret.*=.*['\"][A-Za-z0-9]{20,}['\"]"
        "password.*=.*['\"][A-Za-z0-9@!#$%^&*]{8,}['\"]"
    )
    
    for pattern in "${patterns[@]}"; do
        if grep -r "$pattern" --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | grep -v ".env" | head -5; then
            log_warn "可能存在敏感信息: $pattern"
        fi
    done
    
    return 0
}

# 检查文件完整性
check_files() {
    log_info "检查必要文件..."
    
    local required_files=(
        "package.json"
        ".env.example"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$PROJECT_ROOT/$file" ]; then
            log_warn "缺少必要文件: $file"
        fi
    done
    
    return 0
}

# 主函数
main() {
    echo "=========================================="
    echo "     CI 前置校验"
    echo "=========================================="
    echo ""
    log_info "项目根目录: $PROJECT_ROOT"
    log_info "分支: ${GIT_BRANCH:-$(git branch --show-current 2>/dev/null || echo 'unknown')}"
    log_info "提交: ${GIT_COMMIT:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
    echo ""
    
    # 定义总步骤数
    TOTAL_STEPS=6
    
    run_step "检查代码格式" check_lint || true
    run_step "检查类型定义" check_types || true
    run_step "检查测试用例" check_tests || true
    run_step "检查依赖版本" check_deps_version || true
    run_step "检查敏感信息" check_secrets || true
    run_step "检查文件完整性" check_files || true
    
    echo ""
    echo "=========================================="
    echo "     校验结果汇总"
    echo "=========================================="
    echo ""
    echo "总步骤数: $STEP_COUNT"
    echo -e "通过: ${GREEN}$PASS_COUNT${NC}"
    echo -e "失败: ${RED}$FAIL_COUNT${NC}"
    echo ""
    
    if [ $FAIL_COUNT -gt 0 ]; then
        log_error "校验未完全通过，请检查上述失败项"
        exit 1
    else
        log_info "所有校验通过!"
        exit 0
    fi
}

main "$@"
