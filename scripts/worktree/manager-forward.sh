#!/usr/bin/env bash
#===============================================================================
# Manager 产物转发脚本
# 功能：收集 Worker 产物，转发给 Reviewer 进行全局校验
# 用法：
#   ./manager-forward.sh collect <project> <milestone>         # 收集所有 Worker 产物
#   ./manager-forward.sh forward <project> <milestone>         # 转发给 Reviewer
#   ./manager-forward.sh status <project> <milestone>          # 查看收集状态
#   ./manager-forward.sh request-worker <project> <worker-id>   # 请求新 Worker
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${STATE_DIR:-$HOME/.claude/state}"
FORWARD_DIR="$STATE_DIR/forwarding"

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
# 工具函数
#-------------------------------------------------------------------------------
ensure_dir() { mkdir -p "$1"; }

#-------------------------------------------------------------------------------
# 收集 Worker 产物
#-------------------------------------------------------------------------------
cmd_collect() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]] || [[ -z "$milestone" ]]; then
        log_error "用法: $0 collect <project> <milestone>"
        return 1
    fi

    local project_dir="$STATE_DIR/projects/$project"
    local forward_dir="$FORWARD_DIR/$project/$milestone"

    if [[ ! -d "$project_dir" ]]; then
        log_error "项目不存在: $project"
        return 1
    fi

    ensure_dir "$forward_dir/artifacts"
    ensure_dir "$forward_dir/reports"

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     收集 Worker 产物${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    log_info "项目: $project / $milestone"
    echo ""

    local collected_count=0
    local workers_dir="$project_dir/workers"

    # 检查 Workers
    if [[ -d "$workers_dir" ]]; then
        for worker_dir in "$workers_dir"/*/; do
            if [[ -d "$worker_dir" ]]; then
                local worker_id
                worker_id=$(basename "$worker_dir")
                local result_file="$worker_dir/result.json"

                if [[ -f "$result_file" ]]; then
                    log_info "收集 Worker: $worker_id"

                    # 复制结果文件
                    cp "$result_file" "$forward_dir/workers/$worker_id-result.json"
                    ((collected_count++))

                    # 提取 Worker 提交的产物
                    local worker_artifacts_dir="$forward_dir/artifacts/$worker_id"
                    ensure_dir "$worker_artifacts_dir"

                    # 从 result.json 提取文件列表
                    if command -v python3 &> /dev/null; then
                        python3 << PYTHON
import json

with open('$result_file', 'r') as f:
    data = json.load(f)

# 获取修改和新增的文件
files = data.get('files', {})
modified = files.get('modified', [])
added = files.get('added', [])

print(f"  修改: {len(modified)} 个文件")
print(f"  新增: {len(added)} 个文件")
PYTHON
                    fi
                fi
            fi
        done
    fi

    # 生成收集摘要
    local summary_file="$forward_dir/collection-summary.json"
    cat > "$summary_file" <<EOF
{
  "project": "$project",
  "milestone": "$milestone",
  "collected_at": "$(date -Iseconds)",
  "workers_collected": $collected_count,
  "status": "ready_for_review"
}
EOF

    echo ""
    log_success "产物收集完成: $collected_count 个 Worker"
    echo ""
    log_info "收集产物保存在: $forward_dir"
}

#-------------------------------------------------------------------------------
# 转发给 Reviewer
#-------------------------------------------------------------------------------
cmd_forward() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]] || [[ -z "$milestone" ]]; then
        log_error "用法: $0 forward <project> <milestone>"
        return 1
    fi

    local forward_dir="$FORWARD_DIR/$project/$milestone"
    local collection_summary="$forward_dir/collection-summary.json"

    if [[ ! -f "$collection_summary" ]]; then
        log_error "请先收集产物: $0 collect $project $milestone"
        return 1
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     转发产物给 Reviewer${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    log_info "项目: $project / $milestone"
    echo ""

    # 读取收集摘要
    local workers_collected
    workers_collected=$(grep -o '"workers_collected"' "$collection_summary" | head -1 || echo "0")

    # 生成转发模板
    local forward_template="$forward_dir/reviewer-forwarding.md"
    cat > "$forward_template" <<EOF
---
role: reviewer
project: $project
milestone: $milestone
---
## 产物转发

**项目**: $project
**里程碑**: $milestone
**转发时间**: $(date +%Y-%m-%d\ %H:%M:%S)
**收集 Worker 数**: $workers_collected

## 产物清单

### Workers 提交

| Worker ID | 状态 | 文件数 | 自检结果 |
|-----------|------|--------|----------|
EOF

    # 添加 Worker 详情
    local project_dir="$STATE_DIR/projects/$project"
    if [[ -d "$project_dir/workers" ]]; then
        for worker_dir in "$project_dir/workers"/*/; do
            if [[ -d "$worker_dir" ]]; then
                local worker_id
                worker_id=$(basename "$worker_dir")
                local result_file="$worker_dir/result.json"

                if [[ -f "$result_file" ]]; then
                    local status="已提交"
                    local files_count=0

                    if command -v python3 &> /dev/null; then
                        files_count=$(python3 << PYTHON
import json
with open('$result_file') as f:
    data = json.load(f)
files = data.get('files', {})
print(len(files.get('modified', [])) + len(files.get('added', [])))
PYTHON
                        2>/dev/null || echo "0")
                    fi

                    echo "| $worker_id | $status | $files_count | 自检通过 |" >> "$forward_template"
                fi
            fi
        done
    fi

    cat >> "$forward_template" <<EOF

## 验收指标

请参考 Planner 输出的验收指标进行校验：
- Token 覆盖率 >= 100%
- 类型错误 = 0
- 单元测试覆盖率 >= 80%

## 下一步

请 Reviewer 执行全局校验：
1. 跨模块兼容性检查
2. 样式冲突检测
3. 性能影响评估
4. 安全漏洞扫描
5. 生成审核报告
EOF

    # 更新收集摘要
    sed -i 's/"status": "ready_for_review"/"status": "forwarded"/' "$collection_summary" 2>/dev/null || \
    sed -i '' 's/"status": "ready_for_review"/"status": "forwarded"/' "$collection_summary" 2>/dev/null || true

    # 添加转发时间
    sed -i "s/\"collected_at\": \"/\"forwarded_at\": \"/" "$collection_summary" 2>/dev/null || true

    log_success "产物转发模板已生成: $forward_template"
    echo ""
    log_info "请复制以上内容到 Reviewer 会话进行审核"
    echo ""
    echo -e "${YELLOW}提示:${NC} 转发后请在 Audit 终端创建 Reviewer 会话"
    echo ""
}

#-------------------------------------------------------------------------------
# 查看收集状态
#-------------------------------------------------------------------------------
cmd_status() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]]; then
        log_error "用法: $0 status <project> [milestone]"
        return 1
    fi

    local forward_dir="$FORWARD_DIR/$project"

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     产物收集状态: $project${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    if [[ -d "$forward_dir" ]]; then
        for milestone_dir in "$forward_dir"/*/; do
            if [[ -d "$milestone_dir" ]]; then
                local m
                m=$(basename "$milestone_dir")
                local summary_file="$milestone_dir/collection-summary.json"

                if [[ -f "$summary_file" ]]; then
                    local status
                    status=$(grep -oP '"status":\s*"\K[^"]+' "$summary_file" 2>/dev/null || echo "unknown")

                    # 状态颜色
                    local status_color
                    case "$status" in
                        ready_for_review) status_color="${YELLOW}" ;;
                        forwarded) status_color="${BLUE}" ;;
                        reviewed) status_color="${GREEN}" ;;
                        *) status_color="${NC}" ;;
                    esac

                    echo -e "${status_color}[$status]${NC} $m"

                    local workers=$(grep -oP '"workers_collected":\s*\K\d+' "$summary_file" 2>/dev/null || echo "0")
                    echo "    Workers: $workers"
                    echo ""
                fi
            fi
        done
    else
        log_info "暂无收集记录"
    fi
}

#-------------------------------------------------------------------------------
# 请求新 Worker
#-------------------------------------------------------------------------------
cmd_request_worker() {
    local project="${1:-}"
    local worker_id="${2:-}"

    if [[ -z "$project" ]] || [[ -z "$worker_id" ]]; then
        log_error "用法: $0 request-worker <project> <worker-id>"
        return 1
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     请求新 Worker${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""
    log_info "项目: $project"
    log_info "Worker ID: $worker_id"
    echo ""

    # 生成 Worker 请求模板
    cat <<EOF
## Worker 请求

**项目**: $project
**请求时间**: $(date +%Y-%m-%d\ %H:%M:%S)
**请求类型**: 新建 Worker

### 原因

请在 Claude Desktop 中新建一个 Worktree 终端会话：

1. 创建 Worktree:
   \`\`\`bash
   bash scripts/worktree/worktree-manager.sh create $worker_id
   \`\`\`

2. 在新终端中初始化 Worker 会话，使用以下模板：

\`\`\`markdown
---
role: worker
project: $project
task_id: $worker_id
---
执行原子任务: $worker_id

**任务描述**: [待填写]

**验收标准**:
- [ ] 任务完成
- [ ] 自检通过
- [ ] 产物已提交
\`\`\`

EOF

    echo ""
    log_info "请按照上述步骤创建新 Worker"
    echo ""
}

#-------------------------------------------------------------------------------
# 生成转发报告
#-------------------------------------------------------------------------------
cmd_generate_report() {
    local project="${1:-}"
    local milestone="${2:-}"

    if [[ -z "$project" ]] || [[ -z "$milestone" ]]; then
        log_error "用法: $0 generate-report <project> <milestone>"
        return 1
    fi

    local forward_dir="$FORWARD_DIR/$project/$milestone"

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo -e "${CYAN}     生成转发报告${NC}"
    echo -e "${CYAN}═══════════════════════════════════════${NC}"
    echo ""

    # 统计信息
    local project_dir="$STATE_DIR/projects/$project"
    local modified_count=0
    local added_count=0
    local worker_count=0

    if [[ -d "$project_dir/workers" ]]; then
        worker_count=$(find "$project_dir/workers" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)

        for worker_dir in "$project_dir/workers"/*/; do
            if [[ -d "$worker_dir" ]]; then
                local result_file="$worker_dir/result.json"
                if [[ -f "$result_file" ]] && command -v python3 &> /dev/null; then
                    local m
                    local a
                    m=$(python3 -c "
import json
with open('$result_file') as f:
    data = json.load(f)
print(len(data.get('files', {}).get('modified', [])))
" 2>/dev/null || echo "0")
                    a=$(python3 -c "
import json
with open('$result_file') as f:
    data = json.load(f)
print(len(data.get('files', {}).get('added', [])))
" 2>/dev/null || echo "0")
                    modified_count=$((modified_count + m))
                    added_count=$((added_count + a))
                fi
            fi
        done
    fi

    local report_file="$forward_dir/forwarding-report.json"
    cat > "$report_file" <<EOF
{
  "project": "$project",
  "milestone": "$milestone",
  "report_time": "$(date -Iseconds)",
  "statistics": {
    "total_workers": $worker_count,
    "modified_files": $modified_count,
    "added_files": $added_count,
    "total_files": $((modified_count + added_count))
  },
  "status": "forwarded",
  "reviewer_assigned": false,
  "review_completed": false
}
EOF

    log_success "转发报告已生成: $report_file"
    echo ""
    echo "统计:"
    echo "  Workers: $worker_count"
    echo "  修改文件: $modified_count"
    echo "  新增文件: $added_count"
    echo ""
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-status}"

    ensure_dir "$FORWARD_DIR"

    case "$command" in
        collect|c)
            shift
            cmd_collect "$@"
            ;;
        forward|f)
            shift
            cmd_forward "$@"
            ;;
        status|s)
            shift
            cmd_status "$@"
            ;;
        request-worker|rw)
            shift
            cmd_request_worker "$@"
            ;;
        generate-report|gr)
            shift
            cmd_generate_report "$@"
            ;;
        help|--help|-h)
            echo "Manager 产物转发脚本"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  collect <project> <milestone> 收集所有 Worker 产物"
            echo "  forward <project> <milestone> 转发给 Reviewer"
            echo "  status <project> [milestone] 查看收集状态"
            echo "  request-worker <project> <id> 请求新建 Worker"
            echo "  generate-report <project> <milestone> 生成转发报告"
            echo "  help 显示帮助"
            echo ""
            echo "示例:"
            echo "  $0 collect DesignToken v1.0"
            echo "  $0 forward DesignToken v1.0"
            echo "  $0 status DesignToken"
            echo "  $0 request-worker DesignToken worker-03"
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
