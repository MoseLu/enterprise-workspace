#!/usr/bin/env bash
#===============================================================================
# 归档工具脚本
# 功能：管理会话归档流程
# 用法：
#   ./session-archive.sh auto                    # 自动检测并归档
#   ./session-archive.sh archive <会话ID>        # 归档指定会话
#   ./session-archive.sh restore <任务ID>       # 恢复归档
#   ./session-archive.sh list                   # 列出归档任务
#   ./session-archive.sh summary <任务ID>      # 显示归档摘要
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARCHIVE_DIR="$HOME/.claude/archives"
CLAUDE_DIR="$HOME/.claude"
TEMPLATE_FILE="$ARCHIVE_DIR/TEMPLATE-summary.json"

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
    ls -t "$CLAUDE_DIR"/transcripts/ses_*.jsonl 2>/dev/null | head -1 | sed 's/.*ses_\([^.]*\)\.jsonl/\1/' || echo ""
}

#-------------------------------------------------------------------------------
# 工具函数：生成任务 ID
#-------------------------------------------------------------------------------
generate_task_id() {
    local project="${1:-unknown}"
    local milestone="${2:-v1.0}"
    local timestamp
    timestamp=$(date +%Y%m%d-%H%M%S)
    echo "TASK-${timestamp}-${project}-${milestone}"
}

#-------------------------------------------------------------------------------
# 工具函数：检测归档条件
#-------------------------------------------------------------------------------
check_archive_conditions() {
    local session_id="$1"
    local session_file="$CLAUDE_DIR/transcripts/ses_${session_id}.jsonl"

    local conditions=()
    local reasons=()

    # 条件 1：会话闲置超过 7 天
    local mtime
    mtime=$(stat -c %Y "$session_file" 2>/dev/null || stat -f %m "$session_file" 2>/dev/null || echo "0")
    local now
    now=$(date +%s)
    local days_ago=$(( (now - mtime) / 86400 ))

    if [[ $days_ago -ge 7 ]]; then
        conditions+=("session_idle_7d")
        reasons+=("会话已闲置 $days_ago 天")
    fi

    # 条件 2：消息数量超过阈值
    local msg_count
    msg_count=$(wc -l < "$session_file" 2>/dev/null || echo "0")
    if [[ $msg_count -ge 50 ]]; then
        conditions+=("message_count_high")
        reasons+=("消息数量: $msg_count (阈值: 50)")
    fi

    # 条件 3：检测到完成标记
    if grep -q "/complete\|任务完成\|已完成" "$session_file" 2>/dev/null; then
        conditions+=("completion_detected")
        reasons+=("检测到完成标记")
    fi

    # 返回结果
    if [[ ${#conditions[@]} -gt 0 ]]; then
        echo "true"
        printf "%s\n" "${reasons[@]}"
    else
        echo "false"
    fi
}

#-------------------------------------------------------------------------------
# 工具函数：生成归档摘要
#-------------------------------------------------------------------------------
generate_summary() {
    local session_id="$1"
    local task_id="$2"
    local project="$3"
    local milestone="$4"

    local session_file="$CLAUDE_DIR/transcripts/ses_${session_id}.jsonl"

    # 生成摘要 JSON - 使用更健壮的解析
    python3 << PYEOF
import json
from datetime import datetime
import sys

session_file = "$session_file"

try:
    # 读取会话文件
    messages = []
    with open(session_file, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                msg = json.loads(line)
                messages.append(msg)
            except json.JSONDecodeError as e:
                continue  # 跳过格式错误的行

    if not messages:
        raise ValueError("无法解析会话文件")

    # 提取信息
    user_messages = [m for m in messages if m.get('type') == 'user']
    assistant_messages = [m for m in messages if m.get('type') in ['assistant', 'tool_use', 'tool_result']]

    # 计算时长
    start_time = datetime.fromisoformat(messages[0]['timestamp'].replace('Z', '+00:00'))
    end_time = datetime.fromisoformat(messages[-1]['timestamp'].replace('Z', '+00:00'))
    duration = end_time - start_time
    duration_str = f"{duration.seconds // 3600}h{(duration.seconds % 3600) // 60}m"

    # 构建摘要
    summary = {
        "version": "1.0",
        "meta": {
            "taskId": "$task_id",
            "project": "$project",
            "milestone": "$milestone",
            "createdAt": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "completedAt": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "duration": duration_str
        },
        "objectives": [],
        "completedTasks": [],
        "keyDecisions": [],
        "changedFiles": [],
        "artifacts": [],
        "issues": [],
        "lessonsLearned": [],
        "checklist": {
            "codeReview": False,
            "testsPass": False,
            "documentationUpdated": False,
            "breakingChanges": False
        },
        "participants": {
            "planner": "",
            "manager": "",
            "reviewer": "",
            "workers": []
        },
        "stats": {
            "totalMessages": len(messages),
            "userMessages": len(user_messages),
            "assistantMessages": len(assistant_messages)
        }
    }

    # 提取任务目标（从用户消息）
    for msg in user_messages:
        content = msg.get('content', '')
        if '/plan' in content:
            obj_desc = content.replace('/plan', '').strip()[:200]
            if obj_desc:
                summary['objectives'].append({
                    "id": "OBJ-001",
                    "description": obj_desc,
                    "status": "completed"
                })

    print(json.dumps(summary, ensure_ascii=False, indent=2))

except Exception as e:
    # 如果解析失败，生成基本摘要
    import os
    basic_summary = {
        "version": "1.0",
        "meta": {
            "taskId": "$task_id",
            "project": "$project",
            "milestone": "$milestone",
            "createdAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "completedAt": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "duration": "未知"
        },
        "objectives": [],
        "completedTasks": [],
        "keyDecisions": [],
        "changedFiles": [],
        "artifacts": [],
        "issues": [],
        "lessonsLearned": [],
        "checklist": {
            "codeReview": False,
            "testsPass": False,
            "documentationUpdated": False,
            "breakingChanges": False
        },
        "participants": {
            "planner": "",
            "manager": "",
            "reviewer": "",
            "workers": []
        },
        "stats": {
            "totalMessages": 0,
            "userMessages": 0,
            "assistantMessages": 0
        }
    }
    print(json.dumps(basic_summary, ensure_ascii=False, indent=2))
PYEOF
}

#-------------------------------------------------------------------------------
# 功能：自动归档检测
#-------------------------------------------------------------------------------
cmd_auto() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     自动归档检测${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    local found_to_archive=false

    # 检查最近修改的会话
    for session_file in "$CLAUDE_DIR"/transcripts/ses_*.jsonl; do
        if [[ -f "$session_file" ]]; then
            local session_id
            session_id=$(basename "$session_file" .jsonl | sed 's/^ses_//')

            # 检测归档条件
            local conditions
            conditions=$(check_archive_conditions "$session_id")

            if [[ "$conditions" == "true" ]]; then
                found_to_archive=true
                echo -e "${YELLOW}发现可归档会话:${NC}"
                echo "  会话 ID: $session_id"

                # 显示归档原因
                echo "  归档原因:"
                check_archive_conditions "$session_id" | tail -n +2 | while read -r reason; do
                    echo "    - $reason"
                done

                echo ""
                echo -e "${BLUE}建议归档命令:${NC}"
                echo "  ./session-archive.sh archive $session_id"
                echo ""
            fi
        fi
    done

    if [[ "$found_to_archive" == "false" ]]; then
        log_info "未检测到需要归档的会话"
    fi

    echo ""
    log_info "归档条件:"
    echo "  1. 会话闲置超过 7 天"
    echo "  2. 消息数量超过 50 条"
    echo "  3. 检测到完成标记 (/complete)"
    echo ""
}

#-------------------------------------------------------------------------------
# 功能：归档指定会话
#-------------------------------------------------------------------------------
cmd_archive() {
    local session_id="$1"

    if [[ -z "$session_id" ]]; then
        log_error "请指定会话 ID"
        echo "用法: $0 archive <会话ID> [项目] [里程碑]"
        return 1
    fi

    local session_file="$CLAUDE_DIR/transcripts/ses_${session_id}.jsonl"

    if [[ ! -f "$session_file" ]]; then
        log_error "会话不存在: $session_id"
        return 1
    fi

    local project="${2:-unknown}"
    local milestone="${3:-v1.0}"
    local task_id
    task_id=$(generate_task_id "$project" "$milestone")

    log_info "开始归档会话: $session_id"
    echo "  任务 ID: $task_id"
    echo "  项目: $project"
    echo "  里程碑: $milestone"
    echo ""

    # 创建归档目录
    local archive_path="$ARCHIVE_DIR/$(date +%Y-%m)/$task_id"
    mkdir -p "$archive_path/artifacts"

    # 生成摘要
    log_info "生成归档摘要..."
    local summary
    summary=$(generate_summary "$session_id" "$task_id" "$project" "$milestone")
    echo "$summary" > "$archive_path/summary.json"

    # 复制会话文件
    log_info "保存会话记录..."
    cp "$session_file" "$archive_path/session.jsonl"

    # 创建任务列表（如果有）
    > "$archive_path/tasks.json"

    log_success "归档完成!"
    echo ""
    echo "归档路径: $archive_path"
    echo ""

    # 显示摘要
    echo -e "${CYAN}归档摘要:${NC}"
    python3 -c "
import json
with open('$archive_path/summary.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f\"  任务 ID: {data['meta']['taskId']}\")
print(f\"  项目: {data['meta']['project']}\")
print(f\"  里程碑: {data['meta']['milestone']}\")
print(f\"  创建时间: {data['meta']['createdAt']}\")
print(f\"  完成时间: {data['meta']['completedAt']}\")
print(f\"  总耗时: {data['meta']['duration']}\")
print(f\"  消息统计: {data['stats']['totalMessages']} 条\")
"

    echo ""
    log_info "查看归档: ./session-archive.sh summary $task_id"
}

#-------------------------------------------------------------------------------
# 功能：列出归档任务
#-------------------------------------------------------------------------------
cmd_list() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     归档任务列表${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    if [[ ! -d "$ARCHIVE_DIR" ]]; then
        log_warn "归档目录不存在"
        return 1
    fi

    local total_tasks=0

    for month_dir in "$ARCHIVE_DIR"/*/; do
        if [[ -d "$month_dir" ]]; then
            local month
            month=$(basename "$month_dir")

            echo -e "${BLUE}$month:${NC}"

            local month_tasks=0
            for task_dir in "$month_dir"*/; do
                if [[ -d "$task_dir" ]]; then
                    local task_id
                    task_id=$(basename "$task_dir")

                    # 读取摘要
                    local summary_file="$task_dir/summary.json"
                    if [[ -f "$summary_file" ]]; then
                        local project milestone duration
                        project=$(python3 -c "
import json
with open('$summary_file', 'r') as f:
    print(json.load(f)['meta'].get('project', 'unknown'))
" 2>/dev/null || echo "unknown")

                        milestone=$(python3 -c "
import json
with open('$summary_file', 'r') as f:
    print(json.load(f)['meta'].get('milestone', 'unknown'))
" 2>/dev/null || echo "unknown")

                        duration=$(python3 -c "
import json
with open('$summary_file', 'r') as f:
    print(json.load(f)['meta'].get('duration', 'unknown'))
" 2>/dev/null || echo "unknown")

                        echo "  ├── $task_id"
                        echo "  │   ├── 项目: $project"
                        echo "  │   ├── 里程碑: $milestone"
                        echo "  │   └── 耗时: $duration"

                        ((month_tasks++))
                    else
                        echo "  ├── $task_id (无摘要)"
                    fi
                fi
            done

            if [[ $month_tasks -eq 0 ]]; then
                echo "  └── 无任务"
            else
                echo "  └── 共 $month_tasks 个任务"
                ((total_tasks += month_tasks))
            fi

            echo ""
        fi
    done

    echo -e "${GREEN}总会话数: $total_tasks${NC}"
    echo ""
}

#-------------------------------------------------------------------------------
# 功能：显示归档摘要
#-------------------------------------------------------------------------------
cmd_summary() {
    local task_id="$1"

    if [[ -z "$task_id" ]]; then
        log_error "请指定任务 ID"
        echo "用法: $0 summary <任务ID>"
        return 1
    fi

    # 查找任务
    local task_dir
    task_dir=$(find "$ARCHIVE_DIR" -type d -name "$task_id" 2>/dev/null | head -1)

    if [[ -z "$task_dir" ]]; then
        # 尝试模糊匹配
        task_dir=$(find "$ARCHIVE_DIR" -type d -name "*${task_id}*" 2>/dev/null | head -1)
    fi

    if [[ -z "$task_dir" ]]; then
        log_error "任务不存在: $task_id"
        echo ""
        echo "可用任务:"
        $0 list | grep "TASK-" | sed 's/.*\([A-Z0-9-]*\)/\1/' | sort -u
        return 1
    fi

    local summary_file="$task_dir/summary.json"

    if [[ ! -f "$summary_file" ]]; then
        log_error "摘要文件不存在"
        return 1
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     归档摘要: $task_id${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    python3 << EOF
import json

with open('$summary_file', 'r', encoding='utf-8') as f:
    data = json.load(f)

meta = data.get('meta', {})
stats = data.get('stats', {})

print(f"{'任务ID:':<15} {meta.get('taskId', 'N/A')}")
print(f"{'项目:':<15} {meta.get('project', 'N/A')}")
print(f"{'里程碑:':<15} {meta.get('milestone', 'N/A')}")
print(f"{'创建时间:':<15} {meta.get('createdAt', 'N/A')}")
print(f"{'完成时间:':<15} {meta.get('completedAt', 'N/A')}")
print(f"{'总耗时:':<15} {meta.get('duration', 'N/A')}")
print()
print(f"{'消息统计:':<15} {stats.get('totalMessages', 0)} 条 (用户: {stats.get('userMessages', 0)}, AI: {stats.get('assistantMessages', 0)})")
print()

# 目标
objectives = data.get('objectives', [])
if objectives:
    print("目标:")
    for obj in objectives:
        status = "✓" if obj.get('status') == 'completed' else "○"
        print(f"  [{status}] {obj.get('description', 'N/A')[:60]}")

# 完成的任务
tasks = data.get('completedTasks', [])
if tasks:
    print()
    print(f"完成任务 ({len(tasks)}):")
    for task in tasks[:5]:  # 只显示前5个
        print(f"  - [{task.get('id', 'N/A')}] {task.get('description', 'N/A')[:50]}")

# 关键决策
decisions = data.get('keyDecisions', [])
if decisions:
    print()
    print(f"关键决策 ({len(decisions)}):")
    for decision in decisions[:3]:
        print(f"  - {decision.get('description', 'N/A')[:50]}")

# 变更文件
files = data.get('changedFiles', [])
if files:
    print()
    print(f"变更文件 ({len(files)}):")
    for f in files[:5]:
        print(f"  [{f.get('type', '?')}] {f.get('path', 'N/A')[:50]}")
    if len(files) > 5:
        print(f"  ... 还有 {len(files) - 5} 个文件")

# 归档路径
print()
print(f"归档路径: $task_dir")
EOF

    echo ""
}

#-------------------------------------------------------------------------------
# 功能：恢复归档
#-------------------------------------------------------------------------------
cmd_restore() {
    local task_id="$1"

    if [[ -z "$task_id" ]]; then
        log_error "请指定任务 ID"
        echo "用法: $0 restore <任务ID>"
        return 1
    fi

    # 查找任务
    local task_dir
    task_dir=$(find "$ARCHIVE_DIR" -type d -name "$task_id" 2>/dev/null | head -1)

    if [[ -z "$task_dir" ]]; then
        log_error "任务不存在: $task_id"
        return 1
    fi

    log_warn "恢复归档会创建新的会话，无法直接恢复旧的会话上下文"
    echo ""
    echo "归档包含:"
    echo "  - 会话记录: $task_dir/session.jsonl"
    echo "  - 摘要: $task_dir/summary.json"
    echo "  - 任务列表: $task_dir/tasks.json"
    echo ""
    echo "要查看归档内容，请使用:"
    echo "  ./session-archive.sh summary $task_id"
    echo ""
    log_info "如需恢复上下文，请在新的会话中引用归档摘要"
}

#-------------------------------------------------------------------------------
# 功能：清理归档
#-------------------------------------------------------------------------------
cmd_cleanup() {
    local days="${1:-30}"

    log_warn "此操作将删除 $days 天前的归档"
    echo ""
    read -p "确认清理? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "已取消"
        return 0
    fi

    local deleted=0
    local threshold=$(date -d "-${days} days" +%Y-%m-%d 2>/dev/null || date -v-${days}d +%Y-%m-%d 2>/dev/null || echo "")

    if [[ -n "$threshold" ]]; then
        for month_dir in "$ARCHIVE_DIR"/*/; do
            if [[ -d "$month_dir" ]]; then
                local month
                month=$(basename "$month_dir")
                if [[ "$month" < "$threshold" ]]; then
                    local count
                    count=$(find "$month_dir" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
                    rm -rf "$month_dir"
                    ((deleted += count))
                    log_info "已删除: $month ($count 个任务)"
                fi
            fi
        done
    fi

    if [[ $deleted -gt 0 ]]; then
        log_success "已删除 $deleted 个归档任务"
    else
        log_info "没有需要清理的归档"
    fi
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-auto}"

    case "$command" in
        auto|a)
            cmd_auto
            ;;
        archive|arc)
            cmd_archive "${2:-}" "${3:-unknown}" "${4:-v1.0}"
            ;;
        list|l)
            cmd_list
            ;;
        summary|sum)
            cmd_summary "${2:-}"
            ;;
        restore|r)
            cmd_restore "${2:-}"
            ;;
        cleanup|c)
            cmd_cleanup "${2:-30}"
            ;;
        help|--help|-h)
            echo "归档工具脚本 - 四角色协作模式"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  auto              自动检测可归档的会话"
            echo "  archive <ID> [项目] [里程碑]  归档指定会话"
            echo "  list              列出所有归档任务"
            echo "  summary <任务ID>   显示归档摘要"
            echo "  restore <任务ID>  恢复归档（查看内容）"
            echo "  cleanup [天数]    清理旧归档（默认 30 天）"
            echo "  help              显示帮助"
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
