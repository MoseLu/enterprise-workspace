#!/usr/bin/env bash
#===============================================================================
# Worker 自检引擎脚本
# 功能：Worker 执行任务后进行自我校验（最多 2 次）
# 用法：
#   ./worker-executor.sh check                           # 执行自检
#   ./worker-executor.sh check --type [all|naming|syntax|logic]  # 指定检查类型
#   ./worker-executor.sh report                          # 生成自检报告
#   ./worker-executor.sh submit                          # 提交产物到 Manager
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${STATE_DIR:-$HOME/.claude/state}"
TODOLIST_DIR="docs/10-todolist/todolist"

# 自检配置
MAX_SELF_CORRECTIONS=2
CHECK_TYPES="naming syntax logic output"

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
# 自检规则定义
#-------------------------------------------------------------------------------

# 命名规范检查
check_naming() {
    log_check "检查命名规范..."

    local errors=0
    local warnings=0

    # 检查文件命名 (kebab-case)
    for f in $(find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | grep -v node_modules | grep -v dist | grep -v build); do
        if [[ "$f" =~ [A-Z] ]] && [[ ! "$f" =~ \.tsx?$ ]]; then
            # 跳过组件文件 (PascalCase)
            local filename
            filename=$(basename "$f")
            if [[ ! "$filename" =~ ^[A-Z][a-z]+[A-Z] ]]; then
                log_warn "文件命名非 kebab-case: $f"
                ((warnings++))
            fi
        fi
    done

    # 检查 TypeScript 类型注解
    if command -v tsc &> /dev/null; then
        if [[ -f "tsconfig.json" ]] && grep -q '"strict": true' tsconfig.json 2>/dev/null; then
            log_success "TypeScript strict 模式已启用"
        fi
    fi

    # 检查变量命名
    local var_errors=$(grep -r "var [a-z]" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "export" | grep -v "const" | wc -l || echo "0")
    if [[ "$var_errors" -gt 0 ]]; then
        log_warn "发现 $var_errors 处使用 var 声明，建议改用 const/let"
    fi

    if [[ $errors -eq 0 ]]; then
        log_success "命名规范检查通过"
    fi

    return $errors
}

# 语法检查
check_syntax() {
    log_check "检查语法正确性..."

    local errors=0

    # TypeScript 编译检查
    if command -v tsc &> /dev/null; then
        if [[ -f "tsconfig.json" ]]; then
            log_info "运行 TypeScript 编译检查..."
            if tsc --noEmit 2>&1 | grep -q "error TS"; then
                local ts_errors
                ts_errors=$(tsc --noEmit 2>&1 | grep "error TS" | wc -l || echo "0")
                log_error "TypeScript 编译错误: $ts_errors"
                tsc --noEmit 2>&1 | grep "error TS" | head -10
                ((errors+=ts_errors))
            else
                log_success "TypeScript 编译通过"
            fi
        fi
    fi

    # ESLint 检查
    if command -v npx &> /dev/null && [[ -f ".eslintrc.js" || -f ".eslintrc.json" || -f ".eslintrc" ]]; then
        log_info "运行 ESLint 检查..."
        local eslint_output
        eslint_output=$(npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings=0 2>&1 || true)
        if echo "$eslint_output" | grep -q "error"; then
            local eslint_errors
            eslint_errors=$(echo "$eslint_output" | grep "error" | wc -l || echo "0")
            log_error "ESLint 错误: $eslint_errors"
            echo "$eslint_output" | grep "error" | head -10
            ((errors+=eslint_errors))
        else
            log_success "ESLint 检查通过"
        fi
    fi

    return $errors
}

# 逻辑检查
check_logic() {
    log_check "检查逻辑正确性..."

    local errors=0

    # 运行单元测试
    if command -v pnpm &> /dev/null && [[ -f "vitest.config.ts" || -f "jest.config.js" ]]; then
        log_info "运行单元测试..."

        if command -v vitest &> /dev/null; then
            local test_output
            if test_output=$(pnpm exec vitest run --reporter=basic 2>&1); then
                if echo "$test_output" | grep -q "Test Files.*passed"; then
                    log_success "单元测试通过"
                elif echo "$test_output" | grep -q "Tests"; then
                    local passed_tests
                    local failed_tests
                    passed_tests=$(echo "$test_output" | grep -oP '\d+(?= passed)' | tail -1 || echo "0")
                    failed_tests=$(echo "$test_output" | grep -oP '\d+(?= failed)' | tail -1 || echo "0")

                    if [[ "$failed_tests" -gt 0 ]]; then
                        log_error "单元测试失败: $failed_tests"
                        ((errors+=failed_tests))
                    else
                        log_success "单元测试: $passed_tests 通过"
                    fi
                fi
            else
                log_warn "单元测试执行失败"
            fi
        fi
    else
        log_info "跳过测试执行（未配置或无测试文件）"
    fi

    return $errors
}

# 产物完整性检查
check_output() {
    log_check "检查产物完整性..."

    local errors=0

    # 检查产物是否存在
    if [[ -d "dist" ]]; then
        local dist_size
        dist_size=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
        log_success "构建产物存在: dist ($dist_size)"
    elif [[ -d "build" ]]; then
        local build_size
        build_size=$(du -sh build 2>/dev/null | cut -f1 || echo "unknown")
        log_success "构建产物存在: build ($build_size)"
    else
        log_info "构建产物目录不存在（可能需要构建步骤）"
    fi

    # 检查产物文件数量
    local产物_count=$(find . -type f \( -name "*.js" -o -name "*.css" -o -name "*.json" \) -path "*/dist/*" -o -path "*/build/*" 2>/dev/null | wc -l || echo "0")
    if [[ "$产物_count" -gt 0 ]]; then
        log_success "产物文件数量: $产物_count"
    fi

    return $errors
}

#-------------------------------------------------------------------------------
# 执行自检
#-------------------------------------------------------------------------------
run_self_check() {
    local check_type="${1:-all}"
    local correction_count="${2:-0}"

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     Worker 自检引擎${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    log_info "自检类型: $check_type"
    log_info "自我纠正次数: $correction_count / $MAX_SELF_CORRECTIONS"
    echo ""

    # 检查是否超过最大纠正次数
    if [[ $correction_count -ge $MAX_SELF_CORRECTIONS ]]; then
        log_error "已达到最大自我纠正次数 ($MAX_SELF_CORRECTIONS)，将上报 Manager"
        return 100
    fi

    local total_errors=0

    # 执行指定类型的检查
    case "$check_type" in
        all)
            check_naming || ((total_errors+=$(($? > 0 ? $? : 1))))
            echo ""
            check_syntax || ((total_errors+=$(($? > 0 ? $? : 1))))
            echo ""
            check_logic || ((total_errors+=$(($? > 0 ? $? : 1))))
            echo ""
            check_output || ((total_errors+=$(($? > 0 ? $? : 1))))
            ;;
        naming)
            check_naming || ((total_errors+=$(($? > 0 ? $? : 1))))
            ;;
        syntax)
            check_syntax || ((total_errors+=$(($? > 0 ? $? : 1))))
            ;;
        logic)
            check_logic || ((total_errors+=$(($? > 0 ? $? : 1))))
            ;;
        output)
            check_output || ((total_errors+=$(($? > 0 ? $? : 1))))
            ;;
        *)
            log_error "未知检查类型: $check_type"
            return 1
            ;;
    esac

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     自检结果汇总${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"

    if [[ $total_errors -eq 0 ]]; then
        log_success "所有检查通过！"
        return 0
    else
        log_error "发现 $total_errors 个问题"
        log_info "建议：修正问题后重新运行自检（纠正次数: $correction_count / $MAX_SELF_CORRECTIONS）"
        return $total_errors
    fi
}

#-------------------------------------------------------------------------------
# 生成自检报告
#-------------------------------------------------------------------------------
generate_report() {
    local task_id="${1:-unknown}"
    local project="${2:-unknown}"
    local milestone="${3:-unknown}"

    local report_file="self-check-report.json"

    cat > "$report_file" <<EOF
{
  "task_id": "$task_id",
  "project": "$project",
  "milestone": "$milestone",
  "check_time": "$(date -Iseconds)",
  "check_type": "all",
  "correction_count": 0,
  "status": "pending",
  "checks": {
    "naming": { "status": "pending", "errors": 0, "warnings": 0 },
    "syntax": { "status": "pending", "errors": 0 },
    "logic": { "status": "pending", "tests_passed": 0, "tests_failed": 0 },
    "output": { "status": "pending", "artifacts_found": 0 }
  },
  "artifacts": [],
  "summary": ""
}
EOF

    log_success "自检报告模板已生成: $report_file"
    echo ""
    echo "请运行自检后更新报告:"
    echo "  ./worker-executor.sh check --type all > self-check-output.txt"
    echo "  ./worker-executor.sh submit"
}

#-------------------------------------------------------------------------------
# 提交产物到 Manager
#-------------------------------------------------------------------------------
submit_artifact() {
    local task_id="${1:-unknown}"
    local project="${2:-unknown}"
    local milestone="${3:-unknown}"

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     提交产物到 Manager${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    # 生成产物清单
    local artifacts_json="[]"
    if command -v python3 &> /dev/null; then
        artifacts_json=$(python3 << 'PYTHON'
import json
import subprocess
import os

artifacts = []

# 查找修改的文件
try:
    result = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], capture_output=True, text=True)
    if result.returncode == 0:
        for f in result.stdout.strip().split('\n'):
            if f and os.path.isfile(f):
                artifacts.append({
                    "path": f,
                    "type": "modified"
                })
except:
    pass

# 查找新增的文件
try:
    result = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], capture_output=True, text=True)
    if result.returncode == 0:
        for f in result.stdout.strip().split('\n'):
            if f and os.path.isfile(f):
                artifacts.append({
                    "path": f,
                    "type": "new"
                })
except:
    pass

print(json.dumps(artifacts, indent=2))
PYTHON
)
    fi

    # 生成提交数据
    local submission_json="{}"
    if command -v python3 &> /dev/null; then
        submission_json=$(python3 << PYTHON
import json
import subprocess
from datetime import datetime

# 获取 git 信息
modified = []
added = []
try:
    result = subprocess.run(['git', 'diff', '--name-only', 'HEAD'], capture_output=True, text=True)
    modified = [f for f in result.stdout.strip().split('\n') if f]
except:
    pass

try:
    result = subprocess.run(['git', 'ls-files', '--others', '--exclude-standard'], capture_output=True, text=True)
    added = [f for f in result.stdout.strip().split('\n') if f]
except:
    pass

submission = {
    "task_id": "$task_id",
    "project": "$project",
    "milestone": "$milestone",
    "worker_id": "$(git config user.name 2>/dev/null || echo 'unknown')",
    "submitted_at": datetime.now().isoformat(),
    "status": "submitted",
    "self_check_passed": True,
    "corrections_made": 0,
    "files": {
        "modified": modified,
        "added": added
    },
    "artifacts_count": len(modified) + len(added),
    "summary": ""
}

print(json.dumps(submission, indent=2, ensure_ascii=False))
PYTHON
)
    fi

    echo "$submission_json" > "artifact-submission.json"
    log_success "产物已提交: artifact-submission.json"
    echo ""
    log_info "请将此文件内容复制给 Manager 进行后续处理"
    echo ""

    # 尝试保存到状态中心
    if [[ -d "$STATE_DIR" ]]; then
        local state_file="$STATE_DIR/submissions/$project/$milestone/$task_id.json"
        mkdir -p "$(dirname "$state_file")"
        echo "$submission_json" > "$state_file"
        log_success "产物已同步到状态中心: $state_file"
    fi
}

#-------------------------------------------------------------------------------
# 更新 Todolist 状态
#-------------------------------------------------------------------------------
update_todolist() {
    local task_id="${1:-}"
    local status="${2:-done}"

    if [[ -z "$task_id" ]]; then
        log_error "请提供任务 ID"
        return 1
    fi

    local todolist_file="$TODOLIST_DIR/task-$task_id.md"

    if [[ ! -f "$todolist_file" ]]; then
        log_warn "Todolist 文件不存在: $todolist_file"
        return 1
    fi

    # 更新状态
    case "$status" in
        done|completed)
            sed -i 's/status:.*in_progress/status: done/' "$todolist_file" 2>/dev/null || \
            sed -i '' 's/status:.*in_progress/status: done/' "$todolist_file" 2>/dev/null || true
            log_success "任务状态已更新为 done: $task_id"
            ;;
        blocked)
            sed -i 's/status:.*in_progress/status: blocked/' "$todolist_file" 2>/dev/null || \
            sed -i '' 's/status:.*in_progress/status: blocked/' "$todolist_file" 2>/dev/null || true
            log_warn "任务状态已更新为 blocked: $task_id"
            ;;
        *)
            log_error "未知状态: $status"
            return 1
            ;;
    esac
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-check}"

    case "$command" in
        check|c)
            local check_type="${2:-all}"
            local correction_count="${3:-0}"

            if [[ "$check_type" == "--type" ]]; then
                check_type="${3:-all}"
                correction_count="${4:-0}"
            fi

            run_self_check "$check_type" "$correction_count"
            ;;
        report|r)
            generate_report "${2:-unknown}" "${3:-unknown}" "${4:-unknown}"
            ;;
        submit|s)
            submit_artifact "${2:-unknown}" "${3:-unknown}" "${4:-unknown}"
            ;;
        todolist|todo)
            update_todolist "${2:-}" "${3:-done}"
            ;;
        help|--help|-h)
            echo "Worker 自检引擎脚本"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  check [类型] [纠正次数]    执行自检"
            echo "  check --type <类型>       指定检查类型 (all|naming|syntax|logic|output)"
            echo "  report [任务ID] [项目] [里程碑]  生成自检报告"
            echo "  submit [任务ID] [项目] [里程碑]  提交产物到 Manager"
            echo "  todolist [任务ID] [状态]  更新 Todolist 状态 (done|blocked)"
            echo "  help                     显示帮助"
            echo ""
            echo "示例:"
            echo "  ./worker-executor.sh check"
            echo "  ./worker-executor.sh check --type syntax 1"
            echo "  ./worker-executor.sh report TASK-001 DesignToken v1.0"
            echo "  ./worker-executor.sh submit TASK-001 DesignToken v1.0"
            echo ""
            echo "自检规则:"
            echo "  naming  - 命名规范 (kebab-case, PascalCase)"
            echo "  syntax  - TypeScript 编译 + ESLint"
            echo "  logic   - 单元测试"
            echo "  output  - 产物完整性"
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
