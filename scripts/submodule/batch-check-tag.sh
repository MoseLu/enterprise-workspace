#!/bin/bash
# =============================================================================
# 批量检查标签脚本
# 功能：批量检查多个仓库的标签版本
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

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[1]}")/../.." && pwd)"

# 仓库列表配置文件
REPO_CONFIG="${REPO_CONFIG:-$PROJECT_ROOT/.repo-list}"
# 是否检查远程标签
CHECK_REMOTE=${CHECK_REMOTE:-true}
# 是否输出 JSON 格式
JSON_OUTPUT=${JSON_OUTPUT:-false}
# 最小版本号（低于此版本的仓库会被标记）
MIN_VERSION=${MIN_VERSION:-0.0.0}

# 输出格式
print_header() {
    if [ "$JSON_OUTPUT" = "true" ]; then
        return
    fi
    
    printf "%-40s %-15s %-15s %s\n" "仓库" "本地标签" "远程标签" "状态"
    printf "%-40s %-15s %-15s %s\n" "----------------------------------------" "---------------" "---------------" "------"
}

print_row() {
    local repo=$1
    local local_tag=$2
    local remote_tag=$3
    local status=$4
    
    if [ "$JSON_OUTPUT" = "true" ]; then
        return
    fi
    
    printf "%-40s %-15s %-15s %s\n" "$repo" "$local_tag" "$remote_tag" "$status"
}

# 解析版本号
parse_version() {
    local version=$1
    echo "$version" | sed 's/^v//' | tr '-' '~'
}

# 比较版本号
compare_version() {
    local v1=$(parse_version "$1")
    local v2=$(parse_version "$2")
    
    # 使用 sort -V 进行版本比较
    local result=$(printf "%s\n%s\n" "$v1" "$v2" | sort -V | head -1)
    
    if [ "$v1" = "$v2" ]; then
        echo "equal"
    elif [ "$v1" = "$result" ]; then
        echo "less"
    else
        echo "greater"
    fi
}

# 获取本地最新标签
get_local_tag() {
    local dir=$1
    
    if [ ! -d "$dir/.git" ]; then
        echo ""
        return
    fi
    
    cd "$dir"
    git describe --tags --always 2>/dev/null || echo ""
}

# 获取远程最新标签
get_remote_tag() {
    local dir=$1
    
    if [ "$CHECK_REMOTE" != "true" ]; then
        echo ""
        return
    fi
    
    if [ ! -d "$dir/.git" ]; then
        echo ""
        return
    fi
    
    cd "$dir"
    
    # 尝试获取远程标签
    git fetch --tags --quiet 2>/dev/null || true
    git describe --tags --always origin/$(git branch --show-current 2>/dev/null || echo "main") 2>/dev/null || echo ""
}

# 检查仓库
check_repo() {
    local repo_path=$1
    local repo_name=$(basename "$repo_path")
    
    # 获取标签
    local local_tag=$(get_local_tag "$repo_path")
    local remote_tag=$(get_remote_tag "$repo_path")
    
    # 清理标签名称
    [ -z "$local_tag" ] && local_tag="-"
    [ -z "$remote_tag" ] && remote_tag="-"
    
    # 确定状态
    local status="OK"
    if [ "$local_tag" != "$remote_tag" ] && [ "$remote_tag" != "-" ]; then
        status="有更新"
    fi
    
    # 检查版本号
    local version_cmp=$(compare_version "$local_tag" "$MIN_VERSION")
    if [ "$version_cmp" = "less" ]; then
        status="低版本"
    fi
    
    print_row "$repo_name" "$local_tag" "$remote_tag" "$status"
}

# 从配置文件读取仓库列表
load_repo_config() {
    if [ ! -f "$REPO_CONFIG" ]; then
        log_error "配置文件不存在: $REPO_CONFIG"
        exit 1
    fi
    
    local repos=()
    
    while IFS= read -r line; do
        # 跳过注释和空行
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue
        
        local repo_path=$(echo "$line" | awk '{print $1}')
        
        # 转换为绝对路径
        if [[ ! "$repo_path" = /* ]]; then
            repo_path="$PROJECT_ROOT/$repo_path"
        fi
        
        if [ -d "$repo_path" ]; then
            repos+=("$repo_path")
        else
            log_warn "仓库不存在: $repo_path"
        fi
    done < "$REPO_CONFIG"
    
    echo "${repos[@]}"
}

# 检查所有仓库
check_all_repos() {
    local repos=($(load_repo_config))
    
    if [ ${#repos[@]} -eq 0 ]; then
        log_warn "没有找到需要检查的仓库"
        return
    fi
    
    if [ "$JSON_OUTPUT" = "true" ]; then
        echo "{"
        echo "  \"check_time\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\","
        echo "  \"min_version\": \"$MIN_VERSION\","
        echo "  \"repos\": ["
    else
        print_header
    fi
    
    local first=true
    for repo in "${repos[@]}"; do
        local repo_name=$(basename "$repo")
        local local_tag=$(get_local_tag "$repo")
        local remote_tag=$(get_remote_tag "$repo")
        
        [ -z "$local_tag" ] && local_tag="-"
        [ -z "$remote_tag" ] && remote_tag="-"
        
        local status="OK"
        if [ "$local_tag" != "$remote_tag" ] && [ "$remote_tag" != "-" ]; then
            status="有更新"
        fi
        
        local version_cmp=$(compare_version "$local_tag" "$MIN_VERSION")
        if [ "$version_cmp" = "less" ]; then
            status="低版本"
        fi
        
        if [ "$JSON_OUTPUT" = "true" ]; then
            if [ "$first" = true ]; then
                first=false
            else
                echo ","
            fi
            cat << EOF
    {
      "name": "$repo_name",
      "path": "$repo",
      "local_tag": "$local_tag",
      "remote_tag": "$remote_tag",
      "status": "$status"
    }
EOF
        else
            print_row "$repo_name" "$local_tag" "$remote_tag" "$status"
        fi
    done
    
    if [ "$JSON_OUTPUT" = "true" ]; then
        echo "  ]"
        echo "}"
    fi
}

# 检查单个仓库
check_single_repo() {
    local repo_path=$1
    
    if [ ! -d "$repo_path" ]; then
        log_error "仓库不存在: $repo_path"
        exit 1
    fi
    
    print_header
    check_repo "$repo_path"
}

# 列出所有标签
list_all_tags() {
    local repos=($(load_repo_config))
    
    if [ "$JSON_OUTPUT" = "true" ]; then
        echo "{"
        echo "  \"repos\": ["
    fi
    
    local first=true
    for repo in "${repos[@]}"; do
        local repo_name=$(basename "$repo")
        
        if [ "$JSON_OUTPUT" = "true" ]; then
            if [ "$first" = true ]; then
                first=false
            else
                echo ","
            fi
            echo "    {"
            echo "      \"name\": \"$repo_name\","
            echo "      \"tags\": ["
        else
            echo ""
            echo "仓库: $repo_name"
            echo "标签: $(git -C "$repo" tag -l --sort=-version:refname | head -10 | tr '\n' ' ')"
            echo ""
        fi
        
        # 列出标签
        local tags=$(git -C "$repo" tag -l --sort=-version:refname 2>/dev/null | head -10)
        local tag_first=true
        for tag in $tags; do
            if [ "$JSON_OUTPUT" = "true" ]; then
                if [ "$tag_first" = true ]; then
                    tag_first=false
                else
                    echo ","
                fi
                echo "        \"$tag\""
            else
                echo "  - $tag"
            fi
        done
        
        if [ "$JSON_OUTPUT" = "true" ]; then
            echo "      ]"
            echo "    }"
        fi
    done
    
    if [ "$JSON_OUTPUT" = "true" ]; then
        echo "  ]"
        echo "}"
    fi
}

# 生成汇总报告
generate_summary() {
    log_info "生成汇总报告..."
    
    local repos=($(load_repo_config))
    local total=${#repos[@]}
    local up_to_date=0
    local has_updates=0
    local low_version=0
    local errors=0
    
    for repo in "${repos[@]}"; do
        local local_tag=$(get_local_tag "$repo")
        local remote_tag=$(get_remote_tag "$repo")
        
        [ -z "$local_tag" ] && local_tag="-"
        [ -z "$remote_tag" ] && remote_tag="-"
        
        if [ "$local_tag" = "-" ] || [ "$remote_tag" = "-" ]; then
            errors=$((errors + 1))
        elif [ "$local_tag" != "$remote_tag" ]; then
            has_updates=$((has_updates + 1))
        else
            up_to_date=$((up_to_date + 1))
        fi
        
        local version_cmp=$(compare_version "$local_tag" "$MIN_VERSION")
        if [ "$version_cmp" = "less" ]; then
            low_version=$((low_version + 1))
        fi
    done
    
    echo ""
    echo "=========================================="
    echo "     汇总报告"
    echo "=========================================="
    echo ""
    echo "总仓库数: $total"
    echo -e "最新: ${GREEN}$up_to_date${NC}"
    echo -e "有更新: ${YELLOW}$has_updates${NC}"
    echo -e "低版本: ${RED}$low_version${NC}"
    echo -e "错误: ${RED}$errors${NC}"
    echo ""
}

# 主函数
main() {
    echo "=========================================="
    echo "     批量检查标签"
    echo "=========================================="
    echo ""
    log_info "项目目录: $PROJECT_ROOT"
    log_info "配置文件: $REPO_CONFIG"
    log_info "检查远程: $CHECK_REMOTE"
    log_info "最低版本: $MIN_VERSION"
    echo ""
    
    # 检查是否是帮助命令
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "用法: $0 [命令] [选项]"
        echo ""
        echo "命令:"
        echo "  (无)     - 检查所有仓库的标签"
        echo "  list     - 列出所有标签"
        echo "  summary  - 生成汇总报告"
        echo "  <路径>   - 检查单个仓库"
        echo ""
        echo "选项:"
        echo "  CHECK_REMOTE=true   - 检查远程标签"
        echo "  JSON_OUTPUT=true    - 输出 JSON 格式"
        echo "  MIN_VERSION=1.0.0   - 最低版本要求"
        echo ""
        exit 0
    fi
    
    local command=${1:-}
    
    case $command in
        list)
            list_all_tags
            ;;
        summary)
            check_all_repos
            generate_summary
            ;;
        "")
            check_all_repos
            ;;
        *)
            if [ -d "$command" ]; then
                check_single_repo "$command"
            else
                log_error "未知命令或路径: $command"
                exit 1
            fi
            ;;
    esac
    
    echo ""
}

main "$@"
