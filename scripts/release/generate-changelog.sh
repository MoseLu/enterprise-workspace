#!/bin/bash
# =============================================================================
# 生成变更日志脚本
# 功能：根据 Git 提交历史生成变更日志
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 版本范围
FROM_TAG=${1:-}
TO_TAG=${2:-HEAD}

# 输出文件
OUTPUT_FILE=${3:-}
# 是否输出到控制台
VERBOSE=${VERBOSE:-true}

# 是否自动提交
COMMIT_CHANGELOG=${COMMIT_CHANGELOG:-false}

# 变更日志格式
FORMAT=${FORMAT:-markdown}

# GitHub 项目地址（用于生成链接）
GITHUB_REPO=${GITHUB_REPO:-}

# 变更类型分类
declare -A COMMIT_TYPES
COMMIT_TYPES["feat"]="新功能"
COMMIT_TYPES["fix"]="Bug 修复"
COMMIT_TYPES["docs"]="文档更新"
COMMIT_TYPES["style"]="代码格式"
COMMIT_TYPES["refactor"]="代码重构"
COMMIT_TYPES["perf"]="性能优化"
COMMIT_TYPES["test"]="测试相关"
COMMIT_TYPES["chore"]="构建过程"
COMMIT_TYPES["ci"]="CI/CD 相关"
COMMIT_TYPES["build"]="构建相关"
COMMIT_TYPES["revert"]="回滚提交"

# 获取标签列表
list_tags() {
    log_info "获取可用标签..."
    
    cd "$PROJECT_ROOT"
    git tag -l --sort=-version:refname | head -20
    
    echo ""
}

# 解析提交类型
parse_commit_type() {
    local commit=$1
    
    # 尝试从提交信息中提取类型
    local type=$(echo "$commit" | sed -n 's/^\([^:]*\):.*/\1/p' | tr '[:upper:]' '[:lower:]')
    
    # 检查是否是合并提交
    if echo "$commit" | grep -q "^Merge"; then
        echo "merge"
        return
    fi
    
    # 检查是否是已知类型
    if [ -n "${COMMIT_TYPES[$type]}" ]; then
        echo "$type"
    else
        echo "other"
    fi
}

# 提取提交信息
extract_commit_message() {
    local commit=$1
    
    # 移除类型前缀
    local message=$(echo "$commit" | sed 's/^[a-zA-Z]*: //' | sed 's/^[A-Z]*-[0-9]* //')
    
    # 首字母大写
    echo "$message" | sed 's/^./\U&/'
}

# 生成变更日志内容
generate_changelog() {
    log_info "生成变更日志..."
    
    cd "$PROJECT_ROOT"
    
    # 确定版本范围
    if [ -z "$FROM_TAG" ]; then
        # 获取上一个标签
        FROM_TAG=$(git describe --tags --always HEAD~1 2>/dev/null || echo "")
        if [ -z "$FROM_TAG" ]; then
            FROM_TAG="HEAD~1"
        fi
    fi
    
    log_info "从 $FROM_TAG 到 $TO_TAG"
    
    # 创建临时文件存储变更日志
    local temp_file=$(mktemp)
    
    # 写入变更日志头部
    cat > "$temp_file" << EOF
# 变更日志

**生成时间:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## 版本信息

- **起始版本:** ${FROM_TAG}
- **结束版本:** ${TO_TAG}
- **项目:** ${GITHUB_REPO:-$(basename "$PROJECT_ROOT")}

---

EOF
    
    # 获取提交历史
    local commits=$(git log --oneline "$FROM_TAG..$TO_TAG" 2>/dev/null || git log --oneline -20)
    
    if [ -z "$commits" ]; then
        log_warn "未找到提交历史"
        echo "暂无变更" >> "$temp_file"
        cat "$temp_file"
        return
    fi
    
    # 按类型分类提交
    declare -A categorized_commits
    
    while IFS= read -r line; do
        local commit_hash=$(echo "$line" | awk '{print $1}')
        local commit_msg=$(echo "$line" | sed 's/^[a-f0-9]* //')
        local commit_type=$(parse_commit_type "$commit_msg")
        
        if [ -n "${COMMIT_TYPES[$commit_type]}" ]; then
            if [ -z "${categorized_commits[$commit_type]}" ]; then
                categorized_commits[$commit_type]=""
            fi
            categorized_commits[$commit_type]="${categorized_commits[$commit_type]}- $commit_msg"
            categorized_commits[$commit_type]="${categorized_commits[$commit_type]}"$'\n'
        fi
    done <<< "$commits"
    
    # 按优先级输出各类型
    local type_order=("feat" "fix" "perf" "refactor" "docs" "style" "test" "ci" "chore" "build" "revert" "other")
    
    for type in "${type_order[@]}"; do
        if [ -n "${categorized_commits[$type]}" ]; then
            local type_name=${COMMIT_TYPES[$type]:-$type}
            echo "### $type_name" >> "$temp_file"
            echo "" >> "$temp_file"
            echo "${categorized_commits[$type]}" >> "$temp_file"
            echo "" >> "$temp_file"
        fi
    done
    
    # 添加贡献者信息
    echo "## 贡献者" >> "$temp_file"
    echo "" >> "$temp_file"
    echo "感谢以下贡献者的贡献:" >> "$temp_file"
    echo "" >> "$temp_file"
    git log --oneline "$FROM_TAG..$TO_TAG" --format='- %an (%ae)' 2>/dev/null | sort -u >> "$temp_file"
    echo "" >> "$temp_file"
    
    # 添加完整提交列表
    echo "## 完整提交列表" >> "$temp_file"
    echo "" >> "$temp_file"
    echo "\`\`\`" >> "$temp_file"
    echo "$commits" | while IFS= read -r line; do
        local hash=$(echo "$line" | awk '{print $1}')
        local msg=$(echo "$line" | sed 's/^[a-f0-9]* //')
        if [ -n "$GITHUB_REPO" ]; then
            echo "- [\`$hash\`]($GITHUB_REPO/commit/$hash) $msg" >> "$temp_file"
        else
            echo "- \`$hash\` $msg" >> "$temp_file"
        fi
    done
    echo "\`\`\`" >> "$temp_file"
    
    # 输出结果
    if [ -n "$OUTPUT_FILE" ]; then
        cp "$temp_file" "$OUTPUT_FILE"
        log_info "变更日志已保存到: $OUTPUT_FILE"
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        cat "$temp_file"
    else
        log_info "变更日志已生成"
    fi
    
    # 清理临时文件
    rm -f "$temp_file"
}

# 生成发布公告
generate_announcement() {
    log_info "生成发布公告..."
    
    local temp_file=$(mktemp)
    
    cat > "$temp_file" << EOF
# 🚀 新版本发布公告

## 版本信息

- **版本号:** ${TO_TAG}
- **发布时间:** $(date -u +"%Y年%m月%d日 %H:%M:%S UTC")
- **项目:** ${GITHUB_REPO:-$(basename "$PROJECT_ROOT")}

## 📝 更新内容

$(generate_changelog | grep -A 100 "^## " | head -50)

## 📦 安装更新

\`\`\`bash
# npm
npm update

# yarn
yarn upgrade

# pnpm
pnpm update
\`\`\`

## 🔗 相关链接

- [完整变更日志](CHANGELOG.md)
- [版本发布页面](${GITHUB_REPO:-#}/releases)
- [问题反馈](${GITHUB_REPO:-#}/issues)

---

感谢您的支持！
EOF
    
    if [ -n "$OUTPUT_FILE" ]; then
        cp "$temp_file" "$OUTPUT_FILE"
        log_info "发布公告已保存到: $OUTPUT_FILE"
    fi
    
    cat "$temp_file"
    rm -f "$temp_file"
}

# 提交变更日志
commit_changelog() {
    if [ "$COMMIT_CHANGELOG" != "true" ]; then
        return 0
    fi
    
    log_info "提交变更日志..."
    
    cd "$PROJECT_ROOT"
    
    if [ -f "CHANGELOG.md" ]; then
        git add CHANGELOG.md
        git commit -m "docs: update changelog $(date +%Y-%m-%d)"
        log_info "变更日志已提交"
    fi
}

# 主函数
main() {
    echo "=========================================="
    echo "     生成变更日志"
    echo "=========================================="
    echo ""
    log_info "项目目录: $PROJECT_ROOT"
    log_info "起始版本: ${FROM_TAG:-最新标签}"
    log_info "结束版本: $TO_TAG"
    log_info "输出文件: ${OUTPUT_FILE:-无}"
    echo ""
    
    # 如果指定了 --list-tags，列出可用标签
    if [ "$1" = "--list-tags" ]; then
        list_tags
        exit 0
    fi
    
    # 生成变更日志
    generate_changelog
    
    # 如果需要，提交变更日志
    if [ "$COMMIT_CHANGELOG" = "true" ]; then
        commit_changelog
    fi
    
    echo ""
    echo "=========================================="
    log_info "变更日志生成完成!"
    echo "=========================================="
    echo ""
}

main "$@"
