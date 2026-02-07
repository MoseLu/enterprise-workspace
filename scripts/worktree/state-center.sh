#!/usr/bin/env bash
#===============================================================================
# 状态中心管理脚本
# 功能：管理四角色协作的共享状态
# 用法：
#   ./state-center.sh init <project> <milestone>     # 初始化项目状态
#   ./state-center.sh plan <project> <milestone>      # 保存 Planner 方案
#   ./state-center.sh tasks <project> <milestone>     # 保存任务列表
#   ./state-center.sh result <project> <worker>       # 保存 Worker 结果
#   ./state-center.sh review <project> <milestone>    # 保存审查结果
#   ./state-center.sh get <project> <milestone>       # 获取项目状态
#   ./state-center.sh list                            # 列出所有项目
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${STATE_DIR:-$HOME/.claude/state}"
PROJECTS_DIR="$STATE_DIR/projects"

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
# 工具函数：确保目录存在
#-------------------------------------------------------------------------------
ensure_dir() {
    mkdir -p "$1"
}

#-------------------------------------------------------------------------------
# 功能：初始化项目状态
#-------------------------------------------------------------------------------
cmd_init() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]] || [[ -z "$milestone" ]]; then
        log_error "用法: $0 init <project> <milestone>"
        return 1
    fi

    local project_dir="$PROJECTS_DIR/$project"
    local milestone_dir="$project_dir/milestones/$milestone"
    local workers_dir="$project_dir/workers"

    # 创建目录结构
    ensure_dir "$milestone_dir"
    ensure_dir "$workers_dir"

    # 创建项目配置文件
    local project_yaml="$project_dir/project.yaml"
    cat > "$project_yaml" <<EOF
# 项目配置
# 生成时间: $(date +%Y-%m-%d\ %H:%M:%S)

project: $project
milestone: $milestone
status: planning  # planning | executing | reviewing | completed
created_at: $(date -Iseconds)
updated_at: $(date -Iseconds)

planner: ""
manager: ""
reviewer: ""
workers: []

objectives: []
completed_objectives: []
EOF

    # 创建里程碑占位文件
    echo "{}" > "$milestone_dir/plan.json"
    echo "{}" > "$milestone_dir/tasks.json"
    echo "{}" > "$milestone_dir/review.json"

    log_success "项目状态已初始化: $project/$milestone"
    echo ""
    echo "目录结构:"
    echo "  $project_dir/"
    echo "  ├── project.yaml       # 项目配置"
    echo "  ├── milestones/"
    echo "  │   └── $milestone/"
    echo "  │       ├── plan.json    # Planner 方案"
    echo "  │       ├── tasks.json   # 任务列表"
    echo "  │       └── review.json  # 审查结果"
    echo "  └── workers/           # Worker 状态"
    echo ""
}

#-------------------------------------------------------------------------------
# 功能：保存 Planner 方案
#-------------------------------------------------------------------------------
cmd_plan() {
    local project="${1:-}"
    local milestone="${2:-}"
    local plan_file="$PROJECTS_DIR/$project/milestones/$milestone/plan.json"

    if [[ ! -f "$plan_file" ]]; then
        log_error "项目不存在，请先运行: $0 init $project $milestone"
        return 1
    fi

    # 从 stdin 读取 JSON 数据
    local plan_data
    plan_data=$(cat)

    if [[ -z "$plan_data" ]] || [[ "$plan_data" == "{}" ]]; then
        log_error "请提供 JSON 数据"
        return 1
    fi

    echo "$plan_data" > "$plan_file"

    # 更新项目状态
    local project_yaml="$PROJECTS_DIR/$project/project.yaml"
    sed -i "s/status: planning/status: executing/" "$project_yaml" 2>/dev/null || \
    sed -i '' "s/status: planning/status: executing/" "$project_yaml" 2>/dev/null || true

    log_success "Planner 方案已保存: $project/$milestone"
}

#-------------------------------------------------------------------------------
# 功能：保存任务列表
#-------------------------------------------------------------------------------
cmd_tasks() {
    local project="${1:-}"
    local milestone="${2:-}"
    local tasks_file="$PROJECTS_DIR/$project/milestones/$milestone/tasks.json"

    if [[ ! -f "$tasks_file" ]]; then
        log_error "项目不存在，请先运行: $0 init $project $milestone"
        return 1
    fi

    # 从 stdin 读取 JSON 数据
    local tasks_data
    tasks_data=$(cat)

    if [[ -z "$tasks_data" ]] || [[ "$tasks_data" == "{}" ]]; then
        log_error "请提供 JSON 数据"
        return 1
    fi

    echo "$tasks_data" > "$tasks_file"

    log_success "任务列表已保存: $project/$milestone"
}

#-------------------------------------------------------------------------------
# 功能：保存 Worker 结果
#-------------------------------------------------------------------------------
cmd_result() {
    local project="${1:-}"
    local worker_id="${2:-}"
    local result_file="$PROJECTS_DIR/$project/workers/$worker_id/result.json"

    if [[ ! -d "$PROJECTS_DIR/$project/workers/$worker_id" ]]; then
        ensure_dir "$PROJECTS_DIR/$project/workers/$worker_id"
    fi

    # 从 stdin 读取 JSON 数据
    local result_data
    result_data=$(cat)

    if [[ -z "$result_data" ]] || [[ "$result_data" == "{}" ]]; then
        log_error "请提供 JSON 数据"
        return 1
    fi

    echo "$result_data" > "$result_file"

    log_success "Worker 结果已保存: $project/$worker_id"
}

#-------------------------------------------------------------------------------
# 功能：保存审查结果
#-------------------------------------------------------------------------------
cmd_review() {
    local project="${1:-}"
    local milestone="${2:-}"
    local review_file="$PROJECTS_DIR/$project/milestones/$milestone/review.json"

    if [[ ! -f "$review_file" ]]; then
        log_error "项目不存在，请先运行: $0 init $project $milestone"
        return 1
    fi

    # 从 stdin 读取 JSON 数据
    local review_data
    review_data=$(cat)

    if [[ -z "$review_data" ]] || [[ "$review_data" == "{}" ]]; then
        log_error "请提供 JSON 数据"
        return 1
    fi

    echo "$review_data" > "$review_file"

    # 更新项目状态
    local project_yaml="$PROJECTS_DIR/$project/project.yaml"

    # 检查审查是否通过
    if echo "$review_data" | grep -q '"status".*"approved"'; then
        sed -i "s/status: executing/status: completed/" "$project_yaml" 2>/dev/null || \
        sed -i '' "s/status: executing/status: completed/" "$project_yaml" 2>/dev/null || true
        log_success "审查通过，项目已完成: $project/$milestone"
    else
        log_info "审查未通过，请查看详情: $review_file"
    fi
}

#-------------------------------------------------------------------------------
# 功能：获取项目状态
#-------------------------------------------------------------------------------
cmd_get() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]]; then
        log_error "用法: $0 get <project> [milestone]"
        return 1
    fi

    local project_dir="$PROJECTS_DIR/$project"

    if [[ ! -d "$project_dir" ]]; then
        log_error "项目不存在: $project"
        return 1
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     项目状态: $project${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    if [[ -f "$project_dir/project.yaml" ]]; then
        cat "$project_dir/project.yaml"
        echo ""
    fi

    if [[ -n "$milestone" ]]; then
        local milestone_dir="$project_dir/milestones/$milestone"

        if [[ -d "$milestone_dir" ]]; then
            echo -e "${BLUE}里程碑: $milestone${NC}"

            if [[ -f "$milestone_dir/plan.json" ]]; then
                echo -e "${GREEN}  [✓] plan.json${NC}"
            fi
            if [[ -f "$milestone_dir/tasks.json" ]]; then
                echo -e "${GREEN}  [✓] tasks.json${NC}"
            fi
            if [[ -f "$milestone_dir/review.json" ]]; then
                echo -e "${GREEN}  [✓] review.json${NC}"
            fi
        fi
    fi

    echo ""
    echo -e "${BLUE}Workers:${NC}"
    if [[ -d "$project_dir/workers" ]]; then
        for worker_dir in "$project_dir/workers"/*/; do
            if [[ -d "$worker_dir" ]]; then
                local worker_id
                worker_id=$(basename "$worker_dir")
                echo "  - $worker_id"
            fi
        done
    fi

    echo ""
}

#-------------------------------------------------------------------------------
# 功能：列出所有项目
#-------------------------------------------------------------------------------
cmd_list() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     状态中心项目列表${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    if [[ ! -d "$PROJECTS_DIR" ]]; then
        log_info "暂无项目"
        return 0
    fi

    local project_count=0
    for project_dir in "$PROJECTS_DIR"/*/; do
        if [[ -d "$project_dir" ]]; then
            local project
            project=$(basename "$project_dir")
            local status="未知"
            local milestones=0
            local workers=0

            # 读取状态
            if [[ -f "$project_dir/project.yaml" ]]; then
                status=$(grep "^status:" "$project_dir/project.yaml" 2>/dev/null | cut -d' ' -f2 || echo "未知")
            fi

            # 统计里程碑
            if [[ -d "$project_dir/milestones" ]]; then
                milestones=$(find "$project_dir/milestones" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
            fi

            # 统计 Workers
            if [[ -d "$project_dir/workers" ]]; then
                workers=$(find "$project_dir/workers" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
            fi

            # 状态颜色
            local status_color
            case "$status" in
                planning) status_color="${YELLOW}" ;;
                executing) status_color="${BLUE}" ;;
                reviewing) status_color="${CYAN}" ;;
                completed) status_color="${GREEN}" ;;
                *) status_color="${NC}" ;;
            esac

            echo -e "${status_color}[$status]${NC} $project"
            echo "    里程碑: $milestones | Workers: $workers"
            echo ""
            ((project_count++))
        fi
    done

    if [[ $project_count -eq 0 ]]; then
        log_info "暂无项目"
    else
        echo "总会话数: $project_count"
    fi

    echo ""
}

#-------------------------------------------------------------------------------
# 功能：创建 Worker 任务状态
#-------------------------------------------------------------------------------
cmd_worker_task() {
    local project="${1:-}"
    local worker_id="${2:-}"

    if [[ -z "$project" ]] || [[ -z "$worker_id" ]]; then
        log_error "用法: $0 worker-task <project> <worker_id>"
        return 1
    fi

    local worker_dir="$PROJECTS_DIR/$project/workers/$worker_id"
    ensure_dir "$worker_dir"

    # 从 stdin 读取任务数据
    local task_data
    task_data=$(cat)

    if [[ -z "$task_data" ]] || [[ "$task_data" == "{}" ]]; then
        log_error "请提供 JSON 数据"
        return 1
    fi

    echo "$task_data" > "$worker_dir/task.json"

    log_success "Worker 任务已分配: $project/$worker_id"
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-list}"

    # 确保基础目录存在
    ensure_dir "$PROJECTS_DIR"

    case "$command" in
        init|i)
            shift
            cmd_init "$@"
            ;;
        plan|p)
            shift
            cmd_plan "$@"
            ;;
        tasks|t)
            shift
            cmd_tasks "$@"
            ;;
        result|r)
            shift
            cmd_result "$@"
            ;;
        review|rev)
            shift
            cmd_review "$@"
            ;;
        get|g)
            shift
            cmd_get "$@"
            ;;
        list|l)
            cmd_list
            ;;
        worker-task|wt)
            shift
            cmd_worker_task "$@"
            ;;
        help|--help|-h)
            echo "状态中心管理脚本 - 四角色协作"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  init <project> <milestone>  初始化项目状态"
            echo "  plan <project> <milestone>  保存 Planner 方案 (从 stdin 读取 JSON)"
            echo "  tasks <project> <milestone> 保存任务列表 (从 stdin 读取 JSON)"
            echo "  result <project> <worker>   保存 Worker 结果 (从 stdin 读取 JSON)"
            echo "  review <project> <milestone> 保存审查结果 (从 stdin 读取 JSON)"
            echo "  worker-task <project> <id>   分配 Worker 任务 (从 stdin 读取 JSON)"
            echo "  get <project> [milestone]    获取项目状态"
            echo "  list                         列出所有项目"
            echo ""
            echo "示例:"
            echo "  $0 init DesignToken v1.0"
            echo "  echo '{\"version\":\"1.0\"}' | $0 plan DesignToken v1.0"
            echo "  $0 get DesignToken v1.0"
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
