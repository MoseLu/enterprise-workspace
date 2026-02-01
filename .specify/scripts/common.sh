#!/bin/bash
# SpecKit 公共脚本
# 提供 SpecKit 工作流程中常用的函数

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_prerequisites() {
    log_info "检查必要工具..."
    
    local missing_tools=()
    
    # 检查 Git
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    # 检查 uv
    if ! command -v uv &> /dev/null; then
        missing_tools+=("uv")
    fi
    
    # 检查 Python
    if ! command -v python3 &> /dev/null; then
        missing_tools+=("python3")
    fi
    
    # 检查 Node.js（可选）
    if ! command -v node &> /dev/null; then
        log_warning "Node.js 未安装，部分功能可能受限"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log_error "缺少必要工具: ${missing_tools[*]}"
        echo "请安装以下工具后重试:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        exit 1
    fi
    
    log_success "所有必要工具已安装"
}

# 检查 AI Agent
check_ai_agent() {
    log_info "检查 AI Agent..."
    
    local agent=""
    
    if command -v claude &> /dev/null; then
        agent="claude"
    elif command -v code &> /dev/null; then
        agent="codex"
    elif command -v cursor &> /dev/null; then
        agent="cursor"
    elif command -v windsurf &> /dev/null; then
        agent="windsurf"
    else
        log_warning "未检测到已安装的 AI Agent"
        log_info "可用的 AI Agent:"
        echo "  - Claude Code (https://claude.com/cli)"
        echo "  - Codex CLI (https://github.com/openai/codex)"
        echo "  - Cursor (https://cursor.sh/)"
        echo "  - Windsurf (https://windsurf.com/)"
        return 1
    fi
    
    log_success "检测到 AI Agent: $agent"
    echo "$agent"
}

# 获取 SpecKit 根目录
get_speckit_root() {
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local speckit_root="$(dirname "$script_dir")"
    echo "$speckit_root"
}

# 获取项目根目录
get_project_root() {
    local current_dir="$(pwd)"
    local speckit_root="$(get_speckit_root)"
    
    # 向上查找 .specify 目录
    local dir="$current_dir"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.specify" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    
    # 如果找不到，使用 SpecKit 根目录
    echo "$speckit_root"
}

# 初始化 SpecKit 环境
init_speckit_env() {
    local project_root="${1:-$(get_project_root)}"
    
    export SPECKIT_ROOT="$(get_speckit_root)"
    export PROJECT_ROOT="$project_root"
    export SPECS_DIR="$project_root/specs"
    export MEMORY_DIR="$project_root/.specify/memory"
    
    # 确保必要目录存在
    mkdir -p "$SPECS_DIR"
    mkdir -p "$MEMORY_DIR"
}

# 检查环境变量
check_env() {
    if [ -z "$SPECKIT_ROOT" ]; then
        log_error "SPECKIT_ROOT 未设置"
        return 1
    fi
    
    if [ ! -d "$MEMORY_DIR" ]; then
        log_error "Memory 目录不存在: $MEMORY_DIR"
        return 1
    fi
    
    return 0
}

# 创建功能分支
create_feature_branch() {
    local feature_name="$1"
    local branch_name="feature/$(echo "$feature_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
    
    log_info "创建功能分支: $branch_name"
    
    git checkout -b "$branch_name"
    
    echo "$branch_name"
}

# 生成功能编号
generate_feature_id() {
    local feature_name="$1"
    local timestamp=$(date +%Y%m%d%H%M)
    local id="FEATURE-${timestamp}"
    echo "$id"
 是否存在
check_con}

# 检查 Constitutionstitution() {
    if [ ! -f "$MEMORY_DIR/constitution.md" ]; then
        log_warning "Constitution 文件不存在"
        log_info "请先创建项目原则: /speckit.constitution"
        return 1
    fi
    
    log_success "Constitution 文件存在"
    return 0
}

# 显示帮助信息
show_help() {
    cat << EOF
SpecKit 公共脚本

用法: source scripts/common.sh

可用函数:
  check_prerequisites    检查必要工具
  check_ai_agent         检查 AI Agent
  get_speckit_root       获取 SpecKit 根目录
  get_project_root       获取项目根目录
  init_speckit_env       初始化 SpecKit 环境
  check_env              检查环境变量
  create_feature_branch  创建功能分支
  generate_feature_id    生成功能编号
  check_constitution     检查 Constitution 文件

示例:
  source scripts/common.sh
  check_prerequisites
  init_speckit_env
EOF
}

# 如果直接运行此脚本，显示帮助
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    show_help
fi
