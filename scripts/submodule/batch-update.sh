#!/bin/bash
# =============================================================================
# 批量更新子模块脚本
# 功能：批量更新所有 Git 子模块
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 操作类型
OPERATION=${1:-status}
# 是否递归更新
RECURSIVE=${RECURSIVE:-true}
# 是否推送到远程
PUSH=${PUSH:-false}

# 子模块列表（配置文件路径）
SUBMODULE_CONFIG="${SUBMODULE_CONFIG:-$PROJECT_ROOT/.submodules}"

# 步骤计数器
STEP=0
TOTAL_STEPS=5

# 确认操作
confirm_operation() {
    if [ -n "$AUTO_CONFIRM" ]; then
        return 0
    fi
    
    echo ""
    echo "=========================================="
    echo "     子模块批量操作"
    echo "=========================================="
    echo ""
    log_info "操作: $OPERATION"
    log_info "递归更新: $RECURSIVE"
    log_info "推送到远程: $PUSH"
    echo ""
    
    read -p "确认执行? (输入 'yes' 继续): " -r
    echo ""
    
    if [ "$REPLY" != "yes" ]; then
        log_info "已取消操作"
        exit 0
    fi
}

# 步骤函数
run_step() {
    local name=$1
    local func=$2
    
    STEP=$((STEP + 1))
    log_step "[$STEP/$TOTAL_STEPS] $name..."
    
    if $func; then
        log_info "$name 完成"
        return 0
    else
        log_error "$name 失败"
        return 1
    fi
}

# 获取子模块列表
get_submodules() {
    cd "$PROJECT_ROOT"
    
    # 检查是否是 Git 仓库
    if [ ! -d ".git" ]; then
        log_error "当前目录不是 Git 仓库"
        exit 1
    fi
    
    # 获取所有子模块
    local submodules=$(git submodule status 2>/dev/null | awk '{print $2}')
    
    if [ -z "$submodules" ]; then
        log_warn "未找到子模块"
        return 1
    fi
    
    echo "$submodules"
}

# 显示子模块状态
show_submodule_status() {
    log_info "子模块状态..."
    
    cd "$PROJECT_ROOT"
    
    echo ""
    echo "子模块列表:"
    echo "----------"
    printf "%-40s %-15s %s\n" "子模块路径" "当前提交" "状态"
    echo "----------"
    
    git submodule status | while read line; do
        local path=$(echo "$line" | awk '{print $2}')
        local commit=$(echo "$line" | awk '{print $1}')
        local status=$(echo "$line" | awk '{print $1}' | cut -c1)
        
        local status_text=""
        case $status in
            "+")
                status_text="有更新"
                ;;
            "-")
                status_text="未初始化"
                ;;
            "U")
                status_text="有冲突"
                ;;
            "")
                status_text="正常"
                ;;
            *)
                status_text="未知"
                ;;
        esac
        
        printf "%-40s %-15s %s\n" "$path" "${commit:0:8}" "$status_text"
    done
    
    echo ""
}

# 初始化子模块
init_submodules() {
    log_info "初始化子模块..."
    
    cd "$PROJECT_ROOT"
    
    # 初始化子模块
    git submodule init
    
    # 更新子模块
    git submodule update --init --recursive
    
    log_info "子模块初始化完成"
}

# 更新子模块到最新
update_submodules() {
    log_info "更新子模块..."
    
    cd "$PROJECT_ROOT"
    
    # 获取当前分支的远程跟踪分支
    local current_branch=$(git branch --show-current 2>/dev/null || echo "main")
    
    # 获取上游分支
    local upstream_branch=$(git config "branch.$current_branch.remote" 2>/dev/null || echo "origin")
    local remote_branch=$(git config "branch.$current_branch.merge" 2>/dev/null | sed 's|refs/heads/||')
    
    # 更新所有子模块到其远程分支的最新提交
    git submodule foreach "
        echo '更新子模块: \$name'
        git fetch --all
        
        # 尝试更新到主分支
        if git rev-parse origin/main >/dev/null 2>&1; then
            git merge origin/main --ff-only
        elif git rev-parse origin/master >/dev/null 2>&1; then
            git merge origin/master --ff-only
        fi
    "
    
    # 更新父仓库的子模块引用
    git submodule update --remote --merge
    
    log_info "子模块更新完成"
}

# 推送到远程
push_submodules() {
    log_info "推送子模块更新..."
    
    cd "$PROJECT_ROOT"
    
    # 获取子模块列表
    local submodules=$(get_submodules)
    
    for submodule in $submodules; do
        cd "$PROJECT_ROOT/$submodule"
        
        log_info "推送子模块: $submodule"
        
        # 获取当前分支
        local branch=$(git branch --show-current 2>/dev/null || echo "main")
        
        # 推送到远程
        git push origin "$branch"
    done
    
    # 更新父仓库的子模块引用
    git add .
    git commit -m "chore: update submodules $(date +%Y-%m-%d)"
    git push origin $(git branch --show-current)
    
    log_info "子模块推送完成"
}

# 同步子模块配置
sync_submodule_config() {
    log_info "同步子模块配置..."
    
    cd "$PROJECT_ROOT"
    
    # 检查子模块配置文件
    if [ -f "$SUBMODULE_CONFIG" ]; then
        log_info "从配置文件读取子模块列表..."
        
        while IFS= read -r line; do
            # 跳过注释和空行
            [[ "$line" =~ ^#.*$ ]] && continue
            [[ -z "$line" ]] && continue
            
            local repo_url=$(echo "$line" | awk '{print $1}')
            local path=$(echo "$line" | awk '{print $2}')
            local branch=$(echo "$line" | awk '{print $3}')
            
            if [ -n "$path" ]; then
                # 添加或更新子模块
                if ! git submodule status | grep -q "$path"; then
                    git submodule add -b "${branch:-main}" "$repo_url" "$path"
                fi
            fi
        done < "$SUBMODULE_CONFIG"
    fi
    
    log_info "子模块配置同步完成"
}

# 批量检查子模块状态
check_submodules() {
    log_info "检查子模块状态..."
    
    cd "$PROJECT_ROOT"
    
    local issues=()
    
    # 检查每个子模块
    git submodule status | while read line; do
        local path=$(echo "$line" | awk '{print $2}')
        local commit=$(echo "$line" | awk '{print $1}')
        local status=$(echo "$line" | cut -c1)
        
        if [ "$status" = "U" ]; then
            issues+=("子模块 $path 有合并冲突")
        elif [ "$status" = "+" ]; then
            issues+=("子模块 $path 有未提交的更新")
        elif [ "$status" = "-" ]; then
            issues+=("子模块 $path 未初始化")
        fi
        
        # 检查子模块是否有未提交更改
        if [ -d "$path/.git" ]; then
            cd "$path"
            if ! git diff --quiet || ! git diff --cached --quiet; then
                issues+=("子模块 $path 存在未提交的更改")
            fi
            cd "$PROJECT_ROOT"
        fi
    done
    
    if [ ${#issues[@]} -gt 0 ]; then
        echo ""
        log_warn "发现问题:"
        for issue in "${issues[@]}"; do
            echo "  - $issue"
        done
        return 1
    else
        log_info "所有子模块状态正常"
        return 0
    fi
}

# 清理子模块
clean_submodules() {
    log_info "清理子模块..."
    
    cd "$PROJECT_ROOT"
    
    # 清理未跟踪的文件
    git submodule foreach "git clean -fd"
    
    # 重置子模块
    git submodule foreach "git reset --hard"
    
    log_info "子模块清理完成"
}

# 主函数
main() {
    echo "=========================================="
    echo "     子模块批量操作"
    echo "=========================================="
    echo ""
    log_info "项目目录: $PROJECT_ROOT"
    log_info "操作类型: $OPERATION"
    log_info "递归更新: $RECURSIVE"
    echo ""
    
    # 确认操作
    confirm_operation
    
    # 根据操作类型执行
    case $OPERATION in
        status)
            show_submodule_status
            check_submodules
            ;;
        init)
            run_step "初始化子模块" init_submodules
            ;;
        update)
            run_step "同步配置" sync_submodule_config
            run_step "更新子模块" update_submodules
            ;;
        sync)
            run_step "同步配置" sync_submodule_config
            run_step "初始化子模块" init_submodules
            run_step "更新子模块" update_submodules
            ;;
        push)
            if [ "$PUSH" = "true" ]; then
                run_step "推送子模块" push_submodules
            else
                log_warn "未启用推送功能 (需要设置 PUSH=true)"
            fi
            ;;
        check)
            check_submodules
            ;;
        clean)
            run_step "清理子模块" clean_submodules
            ;;
        *)
            log_error "未知操作: $OPERATION"
            echo ""
            echo "可用操作:"
            echo "  status  - 查看子模块状态"
            echo "  init    - 初始化子模块"
            echo "  update  - 更新子模块"
            echo "  sync    - 同步配置并更新"
            echo "  push    - 推送到远程"
            echo "  check   - 检查子模块状态"
            echo "  clean   - 清理子模块"
            exit 1
            ;;
    esac
    
    echo ""
    echo "=========================================="
    log_info "操作完成!"
    echo "=========================================="
    echo ""
}

main "$@"
