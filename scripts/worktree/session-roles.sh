#!/usr/bin/env bash
#===============================================================================
# 会话角色识别脚本
# 功能：扫描所有会话，根据第一条消息识别角色
# 用法：./session-roles.sh
#===============================================================================

CLAUDE_DIR="$HOME/.claude"

echo ""
echo "═══════════════════════════════════════"
echo "     四角色会话状态监控"
echo "═══════════════════════════════════════"
echo ""

# 统计
planner_count=0
manager_count=0
worker_count=0
reviewer_count=0
unknown_count=0

for f in "$CLAUDE_DIR"/transcripts/ses_*.jsonl; do
    if [[ ! -f "$f" ]]; then
        continue
    fi

    session_id=$(basename "$f" .jsonl | sed 's/^ses_//')
    first_line=$(head -1 "$f")

    # 提取角色
    role=""
    project=""
    milestone=""
    task_id=""

    if echo "$first_line" | grep -q '"role".*planner'; then
        role="PLANNER"
        ((planner_count++))
        icon="🟢"
    elif echo "$first_line" | grep -q '"role".*manager'; then
        role="MANAGER"
        ((manager_count++))
        icon="🔵"
    elif echo "$first_line" | grep -q '"role".*worker'; then
        role="WORKER"
        ((worker_count++))
        icon="🟡"
    elif echo "$first_line" | grep -q '"role".*reviewer'; then
        role="REVIEWER"
        ((reviewer_count++))
        icon="🔴"
    else
        role="UNKNOWN"
        ((unknown_count++))
        icon="⚪"
    fi

    # 提取项目信息
    if echo "$first_line" | grep -q '"project"'; then
        project=$(echo "$first_line" | python3 -c "import sys, json; d=json.loads(sys.stdin.read()); print(d.get('content','')[:100] if isinstance(d.get('content'), str) else '')" 2>/dev/null | grep -o '"project"[^,]*' | cut -d'"' -f4 || echo "")
    fi

    echo "$icon [$role] $session_id"
    if [[ -n "$project" ]]; then
        echo "   项目: $project"
    fi
    echo ""
done

# 统计汇总
echo "═══════════════════════════════════════"
echo "     统计"
echo "═══════════════════════════════════════"
echo "  🟢 Planner:  $planner_count"
echo "  🔵 Manager:  $manager_count"
echo "  🟡 Worker:    $worker_count"
echo "  🔴 Reviewer:  $reviewer_count"
echo "  ⚪ 未知:      $unknown_count"
echo "  ─────────────────────"
echo "  总会话数:    $((planner_count + manager_count + worker_count + reviewer_count + unknown_count))"
echo ""
