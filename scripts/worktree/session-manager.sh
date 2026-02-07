#!/usr/bin/env bash
#===============================================================================
# 会话管理脚本
# 功能：管理四角色协作模式下的会话生命周期
# 用法：
#   ./session-manager.sh status                    # 查看会话状态
#   ./session-manager.sh rename <新名称>           # 重命名当前会话
#   ./session-manager.sh role [planner|manager|worker|reviewer]  # 设置角色
#   ./session-manager.sh init <角色>               # 初始化新会话
#   ./session-manager.sh list                      # 列出所有会话
#   ./session-manager.sh check                     # 检查会话健康
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE_DIR="$HOME/.claude/archives"
CLAUDE_DIR="$HOME/.claude"
CURRENT_PROJECT="${PWD}"

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
# 工具函数：获取会话 ID
#-------------------------------------------------------------------------------
get_session_id() {
    local session_file
    session_file=$(ls -t "$CLAUDE_DIR"/transcripts/ses_*.jsonl 2>/dev/null | head -1)
    if [[ -n "$session_file" ]]; then
        basename "$session_file" .jsonl | sed 's/^ses_//'
    else
        echo ""
    fi
}

#-------------------------------------------------------------------------------
# 工具函数：检测当前会话角色
#-------------------------------------------------------------------------------
detect_role() {
    local session_id
    session_id=$(get_session_id)

    if [[ -z "$session_id" ]]; then
        echo "unknown"
        return
    fi

    # 检查会话文件名
    local session_file="$CLAUDE_DIR/transcripts/ses_${session_id}.jsonl"
    if [[ -f "$session_file" ]]; then
        # 读取第一行的用户消息，检测角色
        local first_message
        first_message=$(head -1 "$session_file" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('content','')[:100])" 2>/dev/null || echo "")

        case "$first_message" in
            *"/plan"*|*Planner"*|*规划"*|*需求"*)
                echo "planner"
                ;;
            *"/execute"*|*Worker"*|*执行"*)
                echo "worker"
                ;;
            *"/review"*|*Reviewer"*|*审核"*|*审查"*)
                echo "reviewer"
                ;;
            *"/split"*|*"/distribute"*|*Manager"*|*管理"*)
                echo "manager"
                ;;
            *)
                # 检查会话目录或标签
                if [[ -f "$CLAUDE_DIR/projects/${session_id}.jsonl" ]]; then
                    grep -q "role.*planner" "$CLAUDE_DIR/projects/${session_id}.jsonl" 2>/dev/null && echo "planner" && return
                    grep -q "role.*manager" "$CLAUDE_DIR/projects/${session_id}.jsonl" 2>/dev/null && echo "manager" && return
                    grep -q "role.*worker" "$CLAUDE_DIR/projects/${session_id}.jsonl" 2>/dev/null && echo "worker" && return
                    grep -q "role.*reviewer" "$CLAUDE_DIR/projects/${session_id}.jsonl" 2>/dev/null && echo "reviewer" && return
                fi
                echo "unknown"
                ;;
        esac
    else
        echo "unknown"
    fi
}

#-------------------------------------------------------------------------------
# 工具函数：生成会话名称
#-------------------------------------------------------------------------------
generate_session_name() {
    local role="$1"
    local topic="${2:-}"
    local date
    date=$(date +%Y-%m-%d)

    case "$role" in
        planner)
            echo "planner-${topic:-unknown}-${date}"
            ;;
        manager)
            echo "manager-${topic:-unknown}-${date}"
            ;;
        worker)
            local module="${3:-unknown}"
            echo "worker-${module}-${date}"
            ;;
        reviewer)
            echo "reviewer-${topic:-unknown}-${date}"
            ;;
        *)
            echo "session-$(date +%Y%m%d-%H%M%S)"
            ;;
    esac
}

#-------------------------------------------------------------------------------
# 功能：显示会话状态
#-------------------------------------------------------------------------------
cmd_status() {
    local session_id
    session_id=$(get_session_id)
    local role
    role=$(detect_role)

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     会话状态${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    echo "当前会话 ID: ${session_id:-未知}"
    echo "当前角色: ${role:-未知}"
    echo "当前项目: $CURRENT_PROJECT"
    echo "会话日期: $(date +%Y-%m-%d)"
    echo ""

    # 显示会话历史统计
    echo -e "${BLUE}会话统计:${NC}"
    local total_sessions
    total_sessions=$(ls -1 "$CLAUDE_DIR"/transcripts/ses_*.jsonl 2>/dev/null | wc -l)
    echo "  总会话数: $total_sessions"

    # 显示归档统计
    if [[ -d "$ARCHIVE_DIR" ]]; then
        local archived_tasks
        archived_tasks=$(find "$ARCHIVE_DIR" -maxdepth 2 -mindepth 2 -type d 2>/dev/null | wc -l)
        echo "  已归档任务: $archived_tasks"
    fi

    echo ""
    echo -e "${GREEN}命令速查:${NC}"
    echo "  ./session-manager.sh status    - 查看状态"
    echo "  ./session-manager.sh rename <名称> - 重命名会话"
    echo "  ./session-manager.sh role [角色] - 设置/检测角色"
    echo "  ./session-manager.sh init <角色>  - 初始化新会话"
    echo "  ./session-manager.sh list        - 列出所有会话"
    echo "  ./session-manager.sh check       - 健康检查"
    echo ""
}

#-------------------------------------------------------------------------------
# 功能：重命名会话
#-------------------------------------------------------------------------------
cmd_rename() {
    local new_name="$1"

    if [[ -z "$new_name" ]]; then
        log_error "请指定新名称"
        echo "用法: $0 rename <新名称>"
        return 1
    fi

    local session_id
    session_id=$(get_session_id)

    if [[ -z "$session_id" ]]; then
        log_error "无法获取当前会话 ID"
        return 1
    fi

    log_info "会话重命名功能说明:"
    echo ""
    echo "由于 Claude Code 会话 ID 由系统管理，无法直接重命名。"
    echo ""
    echo "建议在会话开始时使用 /rename 命令:"
    echo ""
    echo -e "${GREEN}示例:${NC}"
    echo "  /rename planner-DesignToken-2026-02-07"
    echo "  /rename manager-TASK-042-v1.0"
    echo "  /rename worker-devstation-TASK-001"
    echo ""

    # 生成建议名称
    local role
    role=$(detect_role)
    local suggested_name
    suggested_name=$(generate_session_name "$role")

    echo -e "${YELLOW}建议名称:${NC} $suggested_name"
    echo ""
    log_info "请在 Claude 对话中使用 /rename 命令重命名会话"
}

#-------------------------------------------------------------------------------
# 功能：设置/检测角色
#-------------------------------------------------------------------------------
cmd_role() {
    local requested_role="${1:-}"

    if [[ -n "$requested_role" ]]; then
        # 设置角色
        local valid_roles="planner manager worker reviewer"
        if [[ ! " $valid_roles " =~ " $requested_role " ]]; then
            log_error "无效角色: $requested_role"
            echo "可用角色: $valid_roles"
            return 1
        fi

        log_success "角色已设置为: $requested_role"
        echo ""
        echo -e "${BLUE}角色职责:${NC}"

        case "$requested_role" in
            planner)
                echo "  - 接收需求，输出规划方案"
                echo "  - 技术选型、原子拆分、全局规则"
                ;;
            manager)
                echo "  - 拆解任务，分配给执行者"
                echo "  - 协调冲突，产物转发审查者"
                ;;
            worker)
                echo "  - 执行原子任务"
                echo "  - 自我校验（≤2次），输出产物"
                ;;
            reviewer)
                echo "  - 全局校验：兼容性、样式、性能、安全"
                echo "  - 沉淀规则，输出审核报告"
                ;;
        esac

        # 保存角色信息到会话
        local session_id
        session_id=$(get_session_id)
        if [[ -n "$session_id" ]]; then
            echo "[role:$requested_role]" >> "$CLAUDE_DIR/projects/${session_id}.jsonl" 2>/dev/null || true
        fi
    else
        # 检测角色
        local role
        role=$(detect_role)
        echo "当前检测到的角色: $role"

        if [[ "$role" == "unknown" ]]; then
            echo ""
            log_warn "无法自动检测角色，请手动设置:"
            echo "  $0 role planner    # 设置为计划者"
            echo "  $0 role manager    # 设置为管理者"
            echo "  $0 role worker     # 设置为执行者"
            echo "  $0 role reviewer  # 设置为审查者"
        fi
    fi
}

#-------------------------------------------------------------------------------
# 功能：初始化新会话
#-------------------------------------------------------------------------------
cmd_init() {
    local role="${1:-}"

    if [[ -z "$role" ]]; then
        log_error "请指定角色"
        echo "用法: $0 init <角色> [主题]"
        echo ""
        echo "可用角色:"
        echo "  planner   - 计划者：需求理解、顶层规划"
        echo "  manager   - 管理者：任务分配、结果汇总"
        echo "  worker    - 执行者：原子任务执行"
        echo "  reviewer  - 审查者：质量审核、规则沉淀"
        return 1
    fi

    local valid_roles="planner manager worker reviewer"
    if [[ ! " $valid_roles " =~ " $role " ]]; then
        log_error "无效角色: $role"
        return 1
    fi

    log_success "初始化 $role 会话..."
    echo ""

    # 显示角色指引
    case "$role" in
        planner)
            echo -e "${CYAN}【计划者会话】${NC}"
            echo "核心命令:"
            echo "  /plan [需求]  - 开始理解需求，输出规划方案"
            echo "  /approve-plan - 用户确认方案后，触发 Manager"
            echo ""
            echo "协作流程:"
            echo "  用户需求 → Planner 规划 → 用户确认 → Manager 分配"
            ;;
        manager)
            echo -e "${CYAN}【管理者会话】${NC}"
            echo "核心命令:"
            echo "  /split      - 拆分任务为原子任务"
            echo "  /distribute - 分配任务给 Workers"
            echo "  /tasks      - 显示任务看板"
            echo "  /complete   - 任务完成，触发归档"
            echo ""
            echo "协作流程:"
            echo "  接收规划 → 拆分任务 → 分配执行 → 协调冲突 → 转发审查 → 归档"
            ;;
        worker)
            echo -e "${CYAN}【执行者会话】${NC}"
            echo "核心命令:"
            echo "  /execute [任务ID] - 开始执行原子任务"
            echo "  /self-check      - 自我校验（最多 2 次）"
            echo "  /report-done     - 报告完成，上报产物"
            echo "  /report-block    - 报告阻塞，请求协助"
            echo ""
            echo "协作流程:"
            echo "  接收任务 → 执行 → 自我校验（≤2次）→ 输出产物"
            ;;
        reviewer)
            echo -e "${CYAN}【审查者会话】${NC}"
            echo "核心命令:"
            echo "  /review [产物]      - 开始全局校验"
            echo "  /check-style        - 检查样式冲突"
            echo "  /check-compat       - 检查兼容性"
            echo "  /approve            - 产物通过"
            echo "  /rules              - 沉淀规则"
            echo ""
            echo "协作流程:"
            echo "  接收产物 → 全局校验 → 输出报告 → 通过/修改/驳回 → 沉淀规则"
            ;;
    esac

    echo ""
    log_info "会话已初始化为: $role"

    # 设置角色标签
    cmd_role "$role"
}

#-------------------------------------------------------------------------------
# 功能：列出所有会话
#-------------------------------------------------------------------------------
cmd_list() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     所有会话${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    # 当前活跃会话
    echo -e "${GREEN}活跃会话:${NC}"
    local active_count=0
    for session_file in "$CLAUDE_DIR"/transcripts/ses_*.jsonl; do
        if [[ -f "$session_file" ]]; then
            local session_id
            session_id=$(basename "$session_file" .jsonl | sed 's/^ses_//')
            local role
            role=$(detect_role 2>/dev/null || echo "unknown")

            # 检测最后活跃时间
            local mtime
            mtime=$(stat -c %y "$session_file" 2>/dev/null | cut -d' ' -f1 || stat -f "%Sm" -t "%Y-%m-%d" "$session_file" 2>/dev/null | cut -d' ' -f1 || echo "未知")

            echo "  [$role] $session_id ($mtime)"
            ((active_count++))
        fi
    done

    if [[ $active_count -eq 0 ]]; then
        echo "  无活跃会话"
    fi

    echo ""

    # 归档任务
    echo -e "${BLUE}归档任务:${NC}"
    if [[ -d "$ARCHIVE_DIR" ]]; then
        local archive_count=0
        for month_dir in "$ARCHIVE_DIR"/*/; do
            if [[ -d "$month_dir" ]]; then
                local month
                month=$(basename "$month_dir")
                local task_count
                task_count=$(find "$month_dir" -maxdepth 1 -mindepth 1 -type d 2>/dev/null | wc -l)

                if [[ $task_count -gt 0 ]]; then
                    echo "  $month: $task_count 个任务"
                    ((archive_count++))
                fi
            fi
        done

        if [[ $archive_count -eq 0 ]]; then
            echo "  无归档任务"
        fi
    else
        echo "  归档目录不存在"
    fi

    echo ""
}

#-------------------------------------------------------------------------------
# 功能：健康检查
#-------------------------------------------------------------------------------
cmd_check() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     会话健康检查${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    # 检查基础目录
    echo -e "${BLUE}目录检查:${NC}"
    local all_ok=true

    for dir in "$CLAUDE_DIR/transcripts" "$ARCHIVE_DIR"; do
        if [[ -d "$dir" ]]; then
            echo -e "  [✓] $dir"
        else
            echo -e "  [✗] $dir (不存在)"
            all_ok=false
        fi
    done

    echo ""

    # 检查会话
    echo -e "${BLUE}会话检查:${NC}"
    local session_id
    session_id=$(get_session_id)

    if [[ -n "$session_id" ]]; then
        local session_file="$CLAUDE_DIR/transcripts/ses_${session_id}.jsonl"
        if [[ -f "$session_file" ]]; then
            local size
            size=$(stat -c %s "$session_file" 2>/dev/null || stat -f %z "$session_file" 2>/dev/null || echo "0")
            echo -e "  [✓] 会话 ID: $session_id"
            echo -e "  [✓] 会话大小: $size bytes"
            echo -e "  [✓] 角色: $(detect_role)"
        else
            echo -e "  [✗] 会话文件不存在"
            all_ok=false
        fi
    else
        echo -e "  [!] 无活跃会话"
    fi

    echo ""

    # 检查 Worktree
    echo -e "${BLUE}Worktree 检查:${NC}"
    local worktree_base="../worktrees"
    if [[ -d "$worktree_base" ]]; then
        local worktree_count
        worktree_count=$(find "$worktree_base" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
        echo -e "  [✓] Worktree 数量: $worktree_count"
    else
        echo -e "  [!] Worktree 目录不存在"
    fi

    echo ""

    # 总体状态
    if $all_ok; then
        log_success "健康检查通过"
    else
        log_warn "存在一些问题，请检查上述输出"
    fi

    echo ""
    echo -e "${GREEN}快速命令:${NC}"
    echo "  ./session-manager.sh status   - 查看状态"
    echo "  ./session-manager.sh init     - 初始化会话"
    echo "  ./session-manager.sh list    - 列出所有"
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-status}"

    case "$command" in
        status|s)
            cmd_status
            ;;
        rename|r)
            cmd_rename "${2:-}"
            ;;
        role)
            cmd_role "${2:-}"
            ;;
        init|i)
            cmd_init "${2:-}"
            ;;
        list|l)
            cmd_list
            ;;
        check|c)
            cmd_check
            ;;
        help|--help|-h)
            echo "会话管理脚本 - 四角色协作模式"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  status          查看当前会话状态"
            echo "  rename <名称>   重命名会话（提示）"
            echo "  role [角色]     设置/检测当前角色"
            echo "  init <角色>     初始化新会话"
            echo "  list            列出所有会话"
            echo "  check           健康检查"
            echo "  help            显示帮助"
            echo ""
            echo "角色:"
            echo "  planner   计划者：需求理解、顶层规划"
            echo "  manager   管理者：任务分配、结果汇总"
            echo "  worker    执行者：原子任务执行"
            echo "  reviewer  审查者：质量审核、规则沉淀"
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
