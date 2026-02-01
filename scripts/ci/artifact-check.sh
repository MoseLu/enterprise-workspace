#!/bin/bash
# =============================================================================
# 产物校验脚本
# 功能：检查 CI 构建产物的完整性和正确性
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

log_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 产物目录
ARTIFACT_DIR="${ARTIFACT_DIR:-$PROJECT_ROOT/dist}"

# 检查计数器
CHECK_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# 检查函数
run_check() {
    local name=$1
    local result=$2
    
    CHECK_COUNT=$((CHECK_COUNT + 1))
    if [ "$result" = "pass" ]; then
        log_check "$name: 通过"
        PASS_COUNT=$((PASS_COUNT + 1))
        return 0
    else
        log_error "$name: 失败"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        return 1
    fi
}

# 检查前端产物
check_frontend_artifact() {
    log_info "检查前端产物..."
    
    local frontend_dist="$PROJECT_ROOT/frontend/dist"
    
    if [ ! -d "$frontend_dist" ]; then
        run_check "前端产物目录" "fail"
        return 1
    fi
    
    # 检查 index.html 是否存在
    if [ -f "$frontend_dist/index.html" ]; then
        run_check "index.html 存在" "pass"
    else
        run_check "index.html 存在" "fail"
    fi
    
    # 检查 JS 文件
    local js_count=$(find "$frontend_dist" -name "*.js" 2>/dev/null | wc -l)
    if [ "$js_count" -gt 0 ]; then
        run_check "JS 文件数量 ($js_count)" "pass"
    else
        run_check "JS 文件存在" "fail"
    fi
    
    # 检查 CSS 文件
    local css_count=$(find "$frontend_dist" -name "*.css" 2>/dev/null | wc -l)
    if [ "$css_count" -gt 0 ]; then
        run_check "CSS 文件数量 ($css_count)" "pass"
    else
        run_check "CSS 文件存在" "fail"
    fi
    
    # 检查资源文件
    local assets_count=$(find "$frontend_dist/assets" 2>/dev/null | wc -l)
    if [ "$assets_count" -gt 0 ]; then
        run_check "资源文件数量 ($assets_count)" "pass"
    else
        run_check "资源文件" "warn"
    fi
}

# 检查后端产物
check_backend_artifact() {
    log_info "检查后端产物..."
    
    local backend_dist="$PROJECT_ROOT/backend/dist"
    
    # 如果是 TypeScript 项目
    if [ -d "$backend_dist" ]; then
        # 检查编译产物
        local ts_count=$(find "$backend_dist" -name "*.js" 2>/dev/null | wc -l)
        if [ "$ts_count" -gt 0 ]; then
            run_check "编译产物 JS 文件 ($ts_count)" "pass"
        else
            run_check "编译产物" "fail"
        fi
    else
        run_check "后端编译产物" "warn"
    fi
}

# 检查产物大小
check_artifact_size() {
    log_info "检查产物大小..."
    
    # 前端产物大小
    if [ -d "$ARTIFACT_DIR" ]; then
        local total_size=$(du -sh "$ARTIFACT_DIR" 2>/dev/null | cut -f1)
        log_info "前端产物总大小: $total_size"
        
        # 检查是否超过阈值 (例如 10MB)
        local size_mb=$(du -m "$ARTIFACT_DIR" 2>/dev/null | cut -f1)
        if [ "$size_mb" -gt 10 ]; then
            log_warn "产物大小超过 10MB: ${size_mb}MB"
            run_check "产物大小" "warn"
        else
            run_check "产物大小 ($total_size)" "pass"
        fi
    fi
}

# 检查产物完整性
check_artifact_integrity() {
    log_info "检查产物完整性..."
    
    # 检查文件数量
    local file_count=$(find "$ARTIFACT_DIR" -type f 2>/dev/null | wc -l)
    log_info "产物文件总数: $file_count"
    
    if [ "$file_count" -gt 0 ]; then
        run_check "文件数量 ($file_count)" "pass"
    else
        run_check "文件存在" "fail"
    fi
    
    # 检查空文件
    local empty_count=$(find "$ARTIFACT_DIR" -size 0 -type f 2>/dev/null | wc -l)
    if [ "$empty_count" -gt 0 ]; then
        log_warn "发现 $empty_count 个空文件"
        run_check "空文件检查" "fail"
    else
        run_check "空文件检查" "pass"
    fi
    
    # 检查大文件 (>5MB)
    local big_count=$(find "$ARTIFACT_DIR" -size +5M -type f 2>/dev/null | wc -l)
    if [ "$big_count" -gt 0 ]; then
        log_warn "发现 $big_count 个大文件 (>5MB)"
        run_check "大文件检查" "warn"
    else
        run_check "大文件检查" "pass"
    fi
}

# 检查 HTML 引用
check_html_references() {
    log_info "检查 HTML 引用..."
    
    local index_html="$ARTIFACT_DIR/index.html"
    
    if [ ! -f "$index_html" ]; then
        log_warn "未找到 index.html"
        return 0
    fi
    
    # 检查是否存在损坏的引用
    local broken_refs=$(grep -oE 'href="[^"]*"|src="[^"]*"' "$index_html" | grep -v "^http" | grep -v "^#" | grep -v "^/" | wc -l)
    
    if [ "$broken_refs" -gt 0 ]; then
        log_warn "可能存在相对路径引用: $broken_refs 个"
        run_check "HTML 引用路径" "warn"
    else
        run_check "HTML 引用路径" "pass"
    fi
    
    # 检查 CDN 引用
    local cdn_refs=$(grep -c "cdn\|jsdelivr\|unpkg" "$index_html" 2>/dev/null || echo "0")
    if [ "$cdn_refs" -gt 0 ]; then
        log_info "发现 CDN 引用: $cdn_refs 个"
        run_check "CDN 引用" "pass"
    fi
}

# 生成产物报告
generate_report() {
    local report_file="$PROJECT_ROOT/artifact-check-report.json"
    
    log_info "生成产物检查报告..."
    
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "project_root": "$PROJECT_ROOT",
    "artifact_dir": "$ARTIFACT_DIR",
    "check_results": {
        "total": $CHECK_COUNT,
        "passed": $PASS_COUNT,
        "failed": $FAIL_COUNT
    },
    "artifact_info": {
        "file_count": $(find "$ARTIFACT_DIR" -type f 2>/dev/null | wc -l),
        "total_size": "$(du -sh "$ARTIFACT_DIR" 2>/dev/null | cut -f1)"
    }
}
EOF
    
    log_info "报告已生成: $report_file"
}

# 主函数
main() {
    echo "=========================================="
    echo "     产物校验工具"
    echo "=========================================="
    echo ""
    log_info "项目根目录: $PROJECT_ROOT"
    log_info "产物目录: $ARTIFACT_DIR"
    echo ""
    
    check_frontend_artifact
    check_backend_artifact
    check_artifact_size
    check_artifact_integrity
    check_html_references
    
    # 生成报告
    generate_report
    
    echo ""
    echo "=========================================="
    echo "     校验结果汇总"
    echo "=========================================="
    echo ""
    echo "总检查数: $CHECK_COUNT"
    echo -e "通过: ${GREEN}$PASS_COUNT${NC}"
    echo -e "失败: ${RED}$FAIL_COUNT${NC}"
    echo ""
    
    if [ $FAIL_COUNT -gt 0 ]; then
        log_error "产物校验未通过"
        exit 1
    else
        log_info "产物校验通过!"
        exit 0
    fi
}

main "$@"
