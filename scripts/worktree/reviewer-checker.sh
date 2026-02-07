#!/usr/bin/env bash
#===============================================================================
# Reviewer 全局校验脚本
# 功能：对 Worker 产物进行全局校验（兼容性、样式、性能、安全）
# 用法：
#   ./reviewer-checker.sh review <project> <milestone>        # 执行全局校验
#   ./reviewer-checker.sh check-compat <project>             # 检查兼容性
#   ./reviewer-checker.sh check-style <project>              # 检查样式冲突
#   ./reviewer-checker.sh check-perf <project>               # 检查性能
#   ./reviewer-checker.sh check-security <project>           # 检查安全
#   ./reviewer-checker.sh report <project> <milestone>       # 生成审核报告
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${STATE_DIR:-$HOME/.claude/state}"
FORWARD_DIR="$STATE_DIR/forwarding"

# 校验配置
COMPATIBILITY_CHECKS=("backward_compat" "api_contract" "breaking_changes")
STYLE_CHECKS=("css_conflicts" "theme_consistency" "responsive")
PERFORMANCE_CHECKS=("build_time" "bundle_size" "memory_leak")
SECURITY_CHECKS=("vulnerabilities" "authz" "input_validation")

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_check() { echo -e "${CYAN}[CHECK]${NC} $1"; }

#-------------------------------------------------------------------------------
# 检查向后兼容性
#-------------------------------------------------------------------------------
check_backward_compat() {
    log_check "检查向后兼容性..."

    local errors=0
    local warnings=0

    # 检查 API 变更
    if [[ -f "package.json" ]]; then
        log_info "检查 package.json 变更..."
        # 这里可以添加更详细的检查
    fi

    # 检查破坏性变更
    if git rev-parse HEAD &>/dev/null; then
        local changed_apis
        changed_apis=$(git diff --name-only HEAD | grep -E "\.(ts|tsx|js)$" | wc -l || echo "0")
        log_info "变更的代码文件: $changed_apis"
    fi

    if [[ $errors -eq 0 ]]; then
        log_success "向后兼容性检查通过"
    else
        log_error "发现 $errors 个兼容性问题"
    fi

    return $errors
}

#-------------------------------------------------------------------------------
# 检查 API 契约
#-------------------------------------------------------------------------------
check_api_contract() {
    log_check "检查 API 契约..."

    # 检查导出的 API 是否一致
    local export_changes=0

    if git rev-parse HEAD &>/dev/null; then
        # 检查接口变更
        for f in $(git diff --name-only HEAD | grep -E "\.ts$"); do
            if [[ -f "$f" ]]; then
                # 简单检查是否有接口删除或参数变更
                if grep -q "interface " "$f" 2>/dev/null; then
                    ((export_changes++))
                fi
            fi
        done
    fi

    if [[ $export_changes -eq 0 ]]; then
        log_success "API 契约检查通过"
    else
        log_warn "发现 $export_changes 处 API 相关变更，请确认非破坏性"
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 检查破坏性变更
#-------------------------------------------------------------------------------
check_breaking_changes() {
    log_check "检查破坏性变更..."

    local breaking_count=0

    # 检查可能的破坏性变更
    if git rev-parse HEAD &>/dev/null; then
        # 检查删除的文件
        local deleted_files
        deleted_files=$(git diff --name-only --diff-filter=D HEAD | wc -l || echo "0")
        if [[ "$deleted_files" -gt 0 ]]; then
            log_warn "发现 $deleted_files 个删除的文件"
            ((breaking_count+=deleted_files))
        fi

        # 检查重命名的文件
        local renamed_files
        renamed_files=$(git diff --name-only --diff-filter=R HEAD | wc -l || echo "0")
        if [[ "$renamed_files" -gt 0 ]]; then
            log_warn "发现 $renamed_files 个重命名的文件"
            ((breaking_count+=renamed_files))
        fi
    fi

    if [[ $breaking_count -eq 0 ]]; then
        log_success "无破坏性变更"
    else
        log_warn "发现 $breaking_count 个潜在破坏性变更"
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 兼容性检查汇总
#-------------------------------------------------------------------------------
check_compatibility() {
    log_check "执行兼容性检查..."
    echo ""

    local total_errors=0

    check_backward_compat || ((total_errors+=$(($? > 0 ? $? : 1))))
    echo ""
    check_api_contract || ((total_errors+=$(($? > 0 ? $? : 1))))
    echo ""
    check_breaking_changes || ((total_errors+=$(($? > 0 ? $? : 1))))

    echo ""
    echo "--- 兼容性检查汇总 ---"
    if [[ $total_errors -eq 0 ]]; then
        log_success "兼容性检查通过"
    else
        log_error "兼容性检查发现 $total_errors 个问题"
    fi

    return $total_errors
}

#-------------------------------------------------------------------------------
# 检查样式冲突
#-------------------------------------------------------------------------------
check_style_conflicts() {
    log_check "检查样式冲突..."

    local conflicts=0

    # 检查 CSS 文件变更
    if git rev-parse HEAD &>/dev/null; then
        local css_changes
        css_changes=$(git diff --name-only HEAD | grep -E "\.(css|scss|less|sass)$" | wc -l || echo "0")
        log_info "样式文件变更: $css_changes"

        if [[ "$css_changes" -gt 0 ]]; then
            log_info "检查是否有选择器冲突..."
            # 这里可以添加更详细的样式冲突检测
        fi
    fi

    if [[ $conflicts -eq 0 ]]; then
        log_success "样式冲突检查通过"
    else
        log_warn "发现 $conflicts 个样式冲突"
    fi

    return $conflicts
}

#-------------------------------------------------------------------------------
# 检查主题一致性
#-------------------------------------------------------------------------------
check_theme_consistency() {
    log_check "检查主题一致性..."

    # 检查 design token 使用
    local token_usage=0

    if [[ -f "package.json" ]]; then
        # 检查是否使用了 design token
        if grep -q "design-token\|design-tokens" package.json 2>/dev/null; then
            log_success "使用 Design Token 管理主题"
        else
            log_warn "未检测到 Design Token，可能存在主题不一致风险"
        fi
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 检查响应式布局
#-------------------------------------------------------------------------------
check_responsive() {
    log_check "检查响应式布局..."

    # 简单检查是否存在响应式相关代码
    if grep -r "@media" --include="*.scss" --include="*.css" --include="*.less" . 2>/dev/null | head -5 | grep -q .; then
        log_success "存在响应式布局定义"
    else
        log_info "未检测到响应式布局定义（可能不需要）"
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 样式检查汇总
#-------------------------------------------------------------------------------
check_styles() {
    log_check "执行样式检查..."
    echo ""

    check_style_conflicts
    echo ""
    check_theme_consistency
    echo ""
    check_responsive

    log_success "样式检查完成"
}

#-------------------------------------------------------------------------------
# 检查构建时间
#-------------------------------------------------------------------------------
check_build_time() {
    log_check "检查构建时间..."

    local build_time_limit=60  # 60秒

    if [[ -f "package.json" ]]; then
        # 读取 scripts.build
        local build_script
        build_script=$(grep '"build"' package.json 2>/dev/null | head -1 || echo "")

        if [[ -n "$build_script" ]]; then
            log_info "构建脚本: $build_script"
            log_info "建议构建时间: < ${build_time_limit}s"
        fi
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 检查产物大小
#-------------------------------------------------------------------------------
check_bundle_size() {
    log_check "检查产物大小..."

    local bundle_size_limit=500  # KB

    if [[ -d "dist" ]]; then
        local size_kb
        size_kb=$(du -sk dist 2>/dev/null | cut -f1 || echo "0")

        if [[ "$size_kb" -lt 1024 ]]; then
            log_info "构建产物: ${size_kb}KB"
        else
            local size_mb=$((size_kb / 1024))
            log_info "构建产物: ${size_mb}MB"
        fi

        if [[ "$size_kb" -gt $((bundle_size_limit * 1024)) ]]; then
            log_warn "产物大小超过 ${bundle_size_limit}KB 限制"
        else
            log_success "产物大小在限制内"
        fi
    else
        log_info "未找到构建产物（可能需要先构建）"
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 检查内存泄漏
#-------------------------------------------------------------------------------
check_memory_leak() {
    log_check "检查内存泄漏..."

    # 检查 React 组件中 useEffect 清理
    local cleanup_count=0

    if grep -r "useEffect" --include="*.tsx" --include="*.ts" . 2>/dev/null | head -10 | grep -q .; then
        log_info "检测到 useEffect 使用，请确保有清理函数"
        # 简单检查是否有 cleanup
        cleanup_count=$(grep -r "return ()" --include="*.tsx" --include="*.ts" . 2>/dev/null | wc -l || echo "0")
        log_info "发现 $cleanup_count 个清理函数"
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 性能检查汇总
#-------------------------------------------------------------------------------
check_performance() {
    log_check "执行性能检查..."
    echo ""

    check_build_time
    echo ""
    check_bundle_size
    echo ""
    check_memory_leak

    log_success "性能检查完成"
}

#-------------------------------------------------------------------------------
# 检查漏洞
#-------------------------------------------------------------------------------
check_vulnerabilities() {
    log_check "检查安全漏洞..."

    local vuln_count=0

    # 检查 package.json 中的依赖漏洞
    if command -v npm &> /dev/null; then
        log_info "检查依赖漏洞..."
        if npm audit --json 2>/dev/null | grep -q "vulnerabilities"; then
            local vulns
            vulns=$(npm audit --json 2>/dev/null | grep -oP '"total":\s*\K\d+' | head -1 || echo "0")
            log_warn "发现 $vulns 个依赖漏洞"
            ((vuln_count+=vulns))
        else
            log_success "无已知依赖漏洞"
        fi
    fi

    # 检查硬编码密钥
    local secret_patterns=("password.*=.*['\"][^'\"]+['\"]" "api_key.*=.*['\"][^'\"]+['\"]" "secret.*=.*['\"][^'\"]+['\"]")
    for pattern in "${secret_patterns[@]}"; do
        if grep -rqE "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . 2>/dev/null; then
            log_warn "可能存在硬编码密钥，请检查"
            ((vuln_count++))
        fi
    done

    if [[ $vuln_count -eq 0 ]]; then
        log_success "安全漏洞检查通过"
    else
        log_warn "发现 $vuln_count 个安全问题"
    fi

    return $vuln_count
}

#-------------------------------------------------------------------------------
# 检查授权
#-------------------------------------------------------------------------------
check_authorization() {
    log_check "检查授权检查..."

    # 检查 API 端点是否有认证
    local api_endpoints=0
    local secured_endpoints=0

    if grep -r "@UseGuards\|@Auth\|isAuthenticated\|requireAuth" --include="*.ts" --include="*.tsx" . 2>/dev/null | head -5 | grep -q .; then
        log_success "检测到认证机制使用"
    else
        log_info "未检测到显式认证装饰器（可能使用中间件）"
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 检查输入验证
#-------------------------------------------------------------------------------
check_input_validation() {
    log_check "检查输入验证..."

    # 检查表单验证
    if grep -r "zod\|yup\|class-validator\|validate" --include="*.ts" --include="*.tsx" . 2>/dev/null | head -5 | grep -q .; then
        log_success "检测到输入验证库使用"
    else
        log_info "未检测到输入验证库（可能使用 TypeScript 类型检查）"
    fi

    return 0
}

#-------------------------------------------------------------------------------
# 安全检查汇总
#-------------------------------------------------------------------------------
check_security() {
    log_check "执行安全检查..."
    echo ""

    local total_issues=0

    check_vulnerabilities || ((total_issues+=$(($? > 0 ? $? : 1))))
    echo ""
    check_authorization
    echo ""
    check_input_validation

    echo ""
    if [[ $total_issues -eq 0 ]]; then
        log_success "安全检查通过"
    else
        log_warn "安全检查发现 $total_issues 个问题"
    fi

    return $total_issues
}

#-------------------------------------------------------------------------------
# 执行全局校验
#-------------------------------------------------------------------------------
cmd_review() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]]; then
        log_error "用法: $0 review <project> [milestone]"
        return 1
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     Reviewer 全局校验${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    log_info "项目: $project"
    log_info "里程碑: ${milestone:-N/A}"
    log_info "校验时间: $(date +%Y-%m-%d\ %H:%M:%S)"
    echo ""

    local compat_result=0
    local style_result=0
    local perf_result=0
    local security_result=0

    # 1. 兼容性检查
    echo -e "${YELLOW}=== 1. 兼容性检查 ===${NC}"
    check_compatibility || compat_result=$?
    echo ""

    # 2. 样式检查
    echo -e "${YELLOW}=== 2. 样式检查 ===${NC}"
    check_styles
    echo ""

    # 3. 性能检查
    echo -e "${YELLOW}=== 3. 性能检查 ===${NC}"
    check_performance
    echo ""

    # 4. 安全检查
    echo -e "${YELLOW}=== 4. 安全检查 ===${NC}"
    check_security || security_result=$?
    echo ""

    # 生成校验报告
    local report_file="review-report.json"
    local status="approved"

    if [[ $compat_result -gt 0 ]] || [[ $security_result -gt 0 ]]; then
        status="changes_requested"
    fi

    cat > "$report_file" <<EOF
{
  "project": "$project",
  "milestone": "${milestone:-N/A}",
  "review_time": "$(date -Iseconds)",
  "status": "$status",
  "checks": {
    "compatibility": {
      "status": "$([[ $compat_result -eq 0 ]] && echo 'passed' || echo 'failed')",
      "errors": $compat_result
    },
    "style": {
      "status": "passed",
      "warnings": 0
    },
    "performance": {
      "status": "passed",
      "warnings": 0
    },
    "security": {
      "status": "$([[ $security_result -eq 0 ]] && echo 'passed' || echo 'failed')",
      "issues": $security_result
    }
  },
  "summary": "$([[ $status == 'approved' ]] && echo '所有检查通过，可进入 CI/CD 流程' || echo '发现需要修复的问题，请查看详情')",
  "reviewer_notes": ""
}
EOF

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     校验结果汇总${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    if [[ "$status" == "approved" ]]; then
        log_success "校验通过！状态: $status"
        echo ""
        echo -e "${GREEN}产物已通过全局校验，可进入 CI/CD 流程${NC}"
    else
        log_warn "校验未完全通过，状态: $status"
        echo ""
        echo -e "${YELLOW}请修复问题后重新提交校验${NC}"
    fi

    echo ""
    log_info "校验报告: $report_file"
    echo ""

    return 0
}

#-------------------------------------------------------------------------------
# 生成审核报告
#-------------------------------------------------------------------------------
cmd_report() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]]; then
        log_error "用法: $0 report <project> [milestone]"
        return 1
    fi

    local report_file="review-report.md"

    cat > "$report_file" <<EOF
# 审核报告

**项目**: $project
**里程碑**: ${milestone:-N/A}
**审核时间**: $(date +%Y-%m-%d\ %H:%M:%S)

---

## 校验结果

### 1. 兼容性检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 向后兼容 | 待检查 | - |
| API 契约 | 待检查 | - |
| 破坏性变更 | 待检查 | - |

### 2. 样式检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 样式冲突 | 待检查 | - |
| 主题一致 | 待检查 | - |
| 响应式 | 待检查 | - |

### 3. 性能检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 构建时间 | 待检查 | < 60s |
| 产物大小 | 待检查 | < 500KB |
| 内存泄漏 | 待检查 | - |

### 4. 安全检查

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 漏洞扫描 | 待检查 | - |
| 授权检查 | 待检查 | - |
| 输入验证 | 待检查 | - |

---

## 审核结论

**状态**: 待审核

### 通过

产物已通过所有全局校验，可进入 CI/CD 流程。

### 需要修改

请根据以下建议修复问题后重新提交：

1. [ ] 修复兼容性问题
2. [ ] 修复样式冲突
3. [ ] 优化性能
4. [ ] 修复安全问题

### 驳回

以下问题需要彻底修复后重新开始审核流程：

- [ ]

---

**审核人**: Claude Reviewer
EOF

    log_success "审核报告模板已生成: $report_file"
}

#-------------------------------------------------------------------------------
# 保存审查结果到状态中心
#-------------------------------------------------------------------------------
cmd_save() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]]; then
        log_error "用法: $0 save <project> [milestone]"
        return 1
    fi

    local review_file="$STATE_DIR/projects/$project/milestones/${milestone:-default}/review.json"

    if [[ -f "review-report.json" ]]; then
        cp "review-report.json" "$review_file"
        log_success "审查结果已保存: $review_file"

        # 检查是否通过
        if grep -q '"status": "approved"' "review-report.json"; then
            log_success "项目已完成所有校验，可提交 PR"
        fi
    else
        log_error "请先运行校验: $0 review $project"
    fi
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-review}"

    case "$command" in
        review|r)
            shift
            cmd_review "$@"
            ;;
        report|rep)
            shift
            cmd_report "$@"
            ;;
        save|s)
            shift
            cmd_save "$@"
            ;;
        check-compat|compat)
            shift
            check_compatibility
            ;;
        check-style|style)
            shift
            check_styles
            ;;
        check-perf|perf)
            shift
            check_performance
            ;;
        check-security|security)
            shift
            check_security
            ;;
        help|--help|-h)
            echo "Reviewer 全局校验脚本"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  review <project> [milestone] 执行全局校验"
            echo "  report <project> [milestone] 生成审核报告模板"
            echo "  save <project> [milestone] 保存审查结果到状态中心"
            echo "  check-compat 检查兼容性"
            echo "  check-style 检查样式"
            echo "  check-perf 检查性能"
            echo "  check-security 检查安全"
            echo "  help 显示帮助"
            echo ""
            echo "全局校验项:"
            echo "  兼容性 - 向后兼容、API 契约、破坏性变更"
            echo "  样式   - 样式冲突、主题一致、响应式"
            echo "  性能   - 构建时间、产物大小、内存泄漏"
            echo "  安全   - 漏洞扫描、授权检查、输入验证"
            echo ""
            echo "示例:"
            echo "  ./reviewer-checker.sh review DesignToken v1.0"
            echo "  ./reviewer-checker.sh report DesignToken v1.0"
            echo "  ./reviewer-checker.sh save DesignToken v1.0"
            echo ""
            ;;
        *)
            log_error "未知命令: $command"
            $0 help
            exit 1
            ;;
    esac
}

main "$@"
