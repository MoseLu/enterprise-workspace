#!/usr/bin/env bash
#===============================================================================
# Todolist 状态同步脚本
# 功能：同步四角色协作状态与 Todolist
# 用法：
#   ./todolist-sync.sh sync <task-id>                    # 同步任务状态
#   ./todolist-sync.sh claim <task-id> <worker-id>       # 领取任务
#   ./todolist-sync.sh progress <task-id> <percent>     # 更新进度
#   ./todolist-sync.sh report <task-id> <status>         # 报告状态
#   ./todolist-sync.sh done <task-id>                    # 标记完成
#   ./todolist-sync.sh list                              # 列出所有任务
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TODOLIST_DIR="${TODOLIST_DIR:-docs/10-todolist/todolist}"
TODOLIST_STRUCTURE_DIR="${TODOLIST_DIR}/02-product-modules"

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

#-------------------------------------------------------------------------------
# 任务状态映射
#-------------------------------------------------------------------------------
readonly TASK_STATUS_TODO="todo"
readonly TASK_STATUS_IN_PROGRESS="in_progress"
readonly TASK_STATUS_REVIEW="review"
readonly TASK_STATUS_DONE="done"
readonly TASK_STATUS_BLOCKED="blocked"

#-------------------------------------------------------------------------------
# 同步任务状态
#-------------------------------------------------------------------------------
cmd_sync() {
    local task_id="${1:-}"

    if [[ -z "$task_id" ]]; then
        log_error "用法: $0 sync <task-id>"
        return 1
    fi

    local task_file="$TODOLIST_STRUCTURE_DIR/$task_id/task.md"

    if [[ ! -f "$task_file" ]]; then
        log_error "任务文件不存在: $task_file"
        return 1
    fi

    log_info "同步任务状态: $task_id"
    echo ""

    # 读取当前状态
    local current_status
    current_status=$(grep -oP 'status:\s*\K\w+' "$task_file" 2>/dev/null || echo "unknown")

    echo "当前状态: $current_status"

    # 根据状态显示对应操作
    case "$current_status" in
        todo)
            echo ""
            echo "待办任务，可执行的操作:"
            echo "  ./todolist-sync.sh claim $task_id [worker-id]"
            echo "  ./todolist-sync.sh progress $task_id 0"
            ;;
        in_progress)
            echo ""
            echo "执行中，可执行的操作:"
            echo "  ./todolist-sync.sh progress $task_id 50"
            echo "  ./todolist-sync.sh report $task-id blocked"
            ;;
        review)
            echo ""
            echo "待审核，可执行的操作:"
            echo "  ./todolist-sync.sh done $task_id"
            echo "  ./todolist-sync.sh report $task_id blocked"
            ;;
        done)
            echo ""
            echo "任务已完成"
            ;;
        blocked)
            echo ""
            echo "任务被阻塞"
            echo "  ./todolist-sync.sh report $task_id todo"
            ;;
    esac

    echo ""
}

#-------------------------------------------------------------------------------
# 领取任务
#-------------------------------------------------------------------------------
cmd_claim() {
    local task_id="${1:-}"
    local worker_id="${2:-}"

    if [[ -z "$task_id" ]]; then
        log_error "用法: $0 claim <task-id> [worker-id]"
        return 1
    fi

    local task_file="$TODOLIST_STRUCTURE_DIR/$task_id/task.md"

    if [[ ! -f "$task_file" ]]; then
        log_error "任务文件不存在: $task_file"
        return 1
    fi

    # 检查当前状态
    local current_status
    current_status=$(grep -oP 'status:\s*\K\w+' "$task_file" 2>/dev/null || echo "unknown")

    if [[ "$current_status" != "todo" ]]; then
        log_error "任务不是待办状态，当前状态: $current_status"
        return 1
    fi

    # 确定 worker_id
    if [[ -z "$worker_id" ]]; then
        worker_id=$(git config user.name 2>/dev/null || echo "anonymous")
    fi

    log_info "领取任务: $task_id"
    log_info "执行者: $worker_id"
    log_info "时间: $(date +%Y-%m-%d\ %H:%M:%S)"

    # 更新状态
    update_task_status "$task_file" "$TASK_STATUS_IN_PROGRESS" "$worker_id"

    # 更新负责人
    sed -i "s/owner:.*/owner: $worker_id/" "$task_file" 2>/dev/null || \
    sed -i '' "s/owner:.*/owner: $worker_id/" "$task_file" 2>/dev/null || true

    # 添加开始时间
    sed -i "s/start_time:.*/start_time: $(date +%Y-%m-%d)/" "$task_file" 2>/dev/null || \
    sed -i '' "s/start_time:.*/start_time: $(date +%Y-%m-%d)/" "$task_file" 2>/dev/null || true

    log_success "任务已领取，状态更新为 in_progress"
    echo ""
    echo "下一步: 开始执行任务"
    echo "  ./worker-executor.sh check"
}

#-------------------------------------------------------------------------------
# 更新进度
#-------------------------------------------------------------------------------
cmd_progress() {
    local task_id="${1:-}"
    local percent="${2:-}"

    if [[ -z "$task_id" ]] || [[ -z "$percent" ]]; then
        log_error "用法: $0 progress <task-id> <percent>"
        return 1
    fi

    local task_file="$TODOLIST_STRUCTURE_DIR/$task_id/task.md"

    if [[ ! -f "$task_file" ]]; then
        log_error "任务文件不存在: $task_file"
        return 1
    fi

    # 验证百分比
    if ! [[ "$percent" =~ ^[0-9]+$ ]] || [[ "$percent" -gt 100 ]]; then
        log_error "无效的百分比: $percent"
        return 1
    fi

    log_info "更新任务进度: $task_id - $percent%"

    # 更新进度
    sed -i "s/progress:.*/progress: $percent%/" "$task_file" 2>/dev/null || \
    sed -i '' "s/progress:.*/progress: $percent%/" "$task_file" 2>/dev/null || true

    # 如果进度达到 100%，自动改为 review 状态
    if [[ "$percent" -ge 100 ]]; then
        log_info "进度达到 100%，自动更新为 review 状态"
        update_task_status "$task_file" "$TASK_STATUS_REVIEW"

        # 移除完成时间占位
        sed -i "s/completed_at:.*/completed_at: $(date +%Y-%m-%d)/" "$task_file" 2>/dev/null || \
        sed -i '' "s/completed_at:.*/completed_at: $(date +%Y-%m-%d)/" "$task_file" 2>/dev/null || true

        log_success "任务已提交审核，状态更新为 review"
    else
        log_success "进度已更新: $percent%"
    fi
}

#-------------------------------------------------------------------------------
# 报告状态
#-------------------------------------------------------------------------------
cmd_report() {
    local task_id="${1:-}"
    local status="${2:-}"

    if [[ -z "$task_id" ]] || [[ -z "$status" ]]; then
        log_error "用法: $0 report <task-id> <status>"
        return 1
    fi

    # 验证状态
    local valid_status="todo in_progress review done blocked"
    if [[ ! " $valid_status " =~ " $status " ]]; then
        log_error "无效状态: $status"
        echo "可用状态: $valid_status"
        return 1
    fi

    local task_file="$TODOLIST_STRUCTURE_DIR/$task_id/task.md"

    if [[ ! -f "$task_file" ]]; then
        log_error "任务文件不存在: $task_file"
        return 1
    fi

    log_info "报告任务状态: $task_id -> $status"

    # 添加阻塞原因注释（如果是 blocked 状态）
    if [[ "$status" == "blocked" ]]; then
        log_warn "任务被标记为阻塞状态"
        echo ""
        echo "请添加阻塞原因:"
        echo "  echo '阻塞原因...' >> $TODOLIST_STRUCTURE_DIR/$task_id/blocked-reasons.md"
    fi

    update_task_status "$task_file" "$status"
    log_success "状态已更新: $status"
}

#-------------------------------------------------------------------------------
# 标记完成
#-------------------------------------------------------------------------------
cmd_done() {
    local task_id="${1:-}"

    if [[ -z "$task_id" ]]; then
        log_error "用法: $0 done <task-id>"
        return 1
    fi

    local task_file="$TODOLIST_STRUCTURE_DIR/$task_id/task.md"

    if [[ ! -f "$task_file" ]]; then
        log_error "任务文件不存在: $task_file"
        return 1
    fi

    # 检查当前状态
    local current_status
    current_status=$(grep -oP 'status:\s*\K\w+' "$task_file" 2>/dev/null || echo "unknown")

    if [[ "$current_status" != "review" ]]; then
        log_warn "任务状态为 $current_status，建议先提交 review"
        log_info "是否继续? (y/N)"
        read -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi

    log_info "标记任务完成: $task_id"

    # 更新状态
    update_task_status "$task_file" "$TASK_STATUS_DONE"

    # 添加完成时间
    sed -i "s/completed_at:.*/completed_at: $(date +%Y-%m-%d)/" "$task_file" 2>/dev/null || \
    sed -i '' "s/completed_at:.*/completed_at: $(date +%Y-%m-%d)/" "$task_file" 2>/dev/null || true

    log_success "任务已完成!"
    echo ""
    echo "任务统计:"
    echo "  - 文件: $task_file"
    echo "  - 状态: done"
    echo "  - 完成时间: $(date +%Y-%m-%d)"
}

#-------------------------------------------------------------------------------
# 列出所有任务
#-------------------------------------------------------------------------------
cmd_list() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     Todolist 任务状态${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    if [[ ! -d "$TODOLIST_STRUCTURE_DIR" ]]; then
        log_info "Todolist 结构目录不存在"
        return 0
    fi

    # 初始化统计变量
    local TODO_COUNT=0
    local IN_PROGRESS_COUNT=0
    local REVIEW_COUNT=0
    local DONE_COUNT=0
    local BLOCKED_COUNT=0

    # 使用 find 查找所有 task.md 文件（支持嵌套目录）
    # 使用临时文件解决 Windows Git Bash 兼容性问题
    local temp_file
    temp_file=$(mktemp)
    find "$TODOLIST_STRUCTURE_DIR" -name "task.md" -type f 2>/dev/null > "$temp_file"

    while IFS= read -r task_file; do
        # 计算相对路径（从 TODOLIST_STRUCTURE_DIR 开始）
        local rel_path="${task_file#$TODOLIST_STRUCTURE_DIR/}"
        # 移除 /task.md 后缀
        rel_path="${rel_path%/task.md}"

        # 读取任务状态
        local status
        status=$(grep -oP 'status:\s*\K\w+' "$task_file" 2>/dev/null || echo "unknown")
        local progress
        progress=$(grep -oP 'progress:\s*\K[0-9]+%?' "$task_file" 2>/dev/null || echo "0%")
        local priority
        priority=$(grep -oP 'priority:\s*\K\w+' "$task_file" 2>/dev/null || echo "P3")

        # 状态颜色
        local status_color
        case "$status" in
            todo) status_color="${BLUE}" ;;
            in_progress) status_color="${YELLOW}" ;;
            review) status_color="${CYAN}" ;;
            done) status_color="${GREEN}" ;;
            blocked) status_color="${RED}" ;;
            *) status_color="${NC}" ;;
        esac

        # 优先级颜色
        local priority_color
        case "$priority" in
            P0) priority_color="${RED}" ;;
            P1) priority_color="${YELLOW}" ;;
            P2) priority_color="${BLUE}" ;;
            *) priority_color="${NC}" ;;
        esac

        echo -e "${priority_color}[$priority]${NC} ${status_color}[$status]${NC} $rel_path ($progress)"

        # 更新统计（使用 || true 避免 bash 返回 0 状态导致 set -e 退出）
        case "$status" in
            todo) TODO_COUNT=$((TODO_COUNT + 1)) ;;
            in_progress) IN_PROGRESS_COUNT=$((IN_PROGRESS_COUNT + 1)) ;;
            review) REVIEW_COUNT=$((REVIEW_COUNT + 1)) ;;
            done) DONE_COUNT=$((DONE_COUNT + 1)) ;;
            blocked) BLOCKED_COUNT=$((BLOCKED_COUNT + 1)) ;;
        esac
    done < "$temp_file"

    rm -f "$temp_file"

    echo ""
    echo "--- 统计 ---"
    echo -e "  ${BLUE}待办 (todo):${NC}        $TODO_COUNT"
    echo -e "  ${YELLOW}执行中 (in_progress):${NC} $IN_PROGRESS_COUNT"
    echo -e "  ${CYAN}待审 (review):${NC}       $REVIEW_COUNT"
    echo -e "  ${GREEN}完成 (done):${NC}        $DONE_COUNT"
    echo -e "  ${RED}阻塞 (blocked):${NC}       $BLOCKED_COUNT"
    echo "  ─────────────────────"
    echo "  总会话数: $((TODO_COUNT + IN_PROGRESS_COUNT + REVIEW_COUNT + DONE_COUNT + BLOCKED_COUNT))"
    echo ""
}

#-------------------------------------------------------------------------------
# 创建新任务
#-------------------------------------------------------------------------------
cmd_create() {
    local task_id="${1:-}"
    local title="${2:-}"
    local priority="${3:-P3}"

    if [[ -z "$task_id" ]] || [[ -z "$title" ]]; then
        log_error "用法: $0 create <task-id> <title> [priority]"
        return 1
    fi

    local task_dir="$TODOLIST_STRUCTURE_DIR/$task_id"
    mkdir -p "$task_dir"

    local today
    today=$(date +%Y-%m-%d)

    cat > "$task_dir/task.md" <<EOF
# $title

> Task ID: $task_id

## 基本信息

| 字段 | 值 |
|------|-----|
| status | todo |
| priority | $priority |
| progress | 0% |
| owner | - |
| created_at | $today |
| start_time | - |
| completed_at | - |

## 任务描述

<!-- 描述这个任务需要完成什么 -->

## 验收标准

- [ ] 标准 1
- [ ] 标准 2
- [ ] 标准 3

## 关联任务

<!-- 链接到相关任务 -->

## 备注

<!-- 其他信息 -->
EOF

    log_success "任务已创建: $task_id"
    echo ""
    echo "文件: $task_dir/task.md"
    echo ""
    echo "下一步:"
    echo "  ./todolist-sync.sh claim $task_id"
}

#-------------------------------------------------------------------------------
# 工具函数：更新任务状态
#-------------------------------------------------------------------------------
update_task_status() {
    local task_file="$1"
    local new_status="$2"
    local worker="${3:-}"

    # 更新状态行
    sed -i "s/status:.*/status: $new_status/" "$task_file" 2>/dev/null || \
    sed -i '' "s/status:.*/status: $new_status/" "$task_file" 2>/dev/null || true

    # 如果有 worker 参数，更新负责人
    if [[ -n "$worker" ]]; then
        sed -i "s/owner:.*/owner: $worker/" "$task_file" 2>/dev/null || \
        sed -i '' "s/owner:.*/owner: $worker/" "$task_file" 2>/dev/null || true
    fi
}

#-------------------------------------------------------------------------------
# 同步所有任务到状态中心
#-------------------------------------------------------------------------------
cmd_sync_all() {
    log_info "同步所有任务到状态中心..."

    if [[ ! -d "$TODOLIST_STRUCTURE_DIR" ]]; then
        log_error "Todolist 目录不存在"
        return 1
    fi

    local state_file="$HOME/.claude/state/todolist-status.json"

    echo "{}" > "$state_file"

    if command -v python3 &> /dev/null; then
        python3 << PYTHON
import json
import os

tasks = {}

for task_dir in os.listdir("$TODOLIST_STRUCTURE_DIR"):
    task_file = os.path.join("$TODOLIST_STRUCTURE_DIR", task_dir, "task.md")
    if os.path.isfile(task_file):
        task = {
            "id": task_dir,
            "status": "unknown",
            "priority": "P3",
            "progress": "0%",
            "owner": ""
        }

        with open(task_file, 'r') as f:
            content = f.read()

        for line in content.split('\n'):
            if line.startswith('status:'):
                task['status'] = line.split(':')[1].strip()
            elif line.startswith('priority:'):
                task['priority'] = line.split(':')[1].strip()
            elif line.startswith('progress:'):
                task['progress'] = line.split(':')[1].strip()
            elif line.startswith('owner:'):
                task['owner'] = line.split(':')[1].strip()

        tasks[task_dir] = task

with open("$state_file", 'w') as f:
    json.dump(tasks, f, indent=2, ensure_ascii=False)

print(f"已同步 {len(tasks)} 个任务到状态中心")
PYTHON
    fi

    log_success "任务状态已同步"
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-list}"

    case "$command" in
        sync|s)
            shift
            cmd_sync "$@"
            ;;
        claim|c)
            shift
            cmd_claim "$@"
            ;;
        progress|p)
            shift
            cmd_progress "$@"
            ;;
        report|r)
            shift
            cmd_report "$@"
            ;;
        done|d)
            shift
            cmd_done "$@"
            ;;
        list|l)
            cmd_list
            ;;
        create|n)
            shift
            cmd_create "$@"
            ;;
        sync-all|sa)
            cmd_sync_all
            ;;
        help|--help|-h)
            echo "Todolist 状态同步脚本"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  sync <task-id>           同步单个任务状态"
            echo "  claim <task-id> [worker] 领取任务 (todo → in_progress)"
            echo "  progress <task-id> <%>   更新进度 (100% → review)"
            echo "  report <task-id> <状态>  报告状态"
            echo "  done <task-id>          标记完成 (review → done)"
            echo "  list                     列出所有任务"
            echo "  create <id> <title> [P]  创建新任务"
            echo "  sync-all                 同步所有任务到状态中心"
            echo "  help                     显示帮助"
            echo ""
            echo "状态流转:"
            echo "  todo → in_progress → review → done"
            echo "  todo → blocked → todo"
            echo ""
            echo "示例:"
            echo "  ./todolist-sync.sh claim TASK-001 worker-01"
            echo "  ./todolist-sync.sh progress TASK-001 50"
            echo "  ./todolist-sync.sh report TASK-001 blocked"
            echo "  ./todolist-sync.sh done TASK-001"
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
