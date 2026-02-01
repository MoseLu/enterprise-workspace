#!/bin/bash
# =============================================================================
# 创建版本标签脚本
# 功能：创建并推送版本标签
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

# 版本号
VERSION=${1:-}
# 标签前缀
TAG_PREFIX=${TAG_PREFIX:-v}
# 是否推送到远程
PUSH=${PUSH:-false}
# 是否创建 GitHub Release
GITHUB_RELEASE=${GITHUB_RELEASE:-false}

# 步骤计数器
STEP=0
TOTAL_STEPS=6

# 获取当前版本
get_current_version() {
    # 尝试从多个来源获取版本
    local version=""
    
    # 1. 从 package.json 获取
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        version=$(grep '"version"' "$PROJECT_ROOT/package.json" | head -1 | sed 's/.*:.*"\(.*\)".*/\1/')
    fi
    
    # 2. 从 pyproject.toml 获取
    if [ -z "$version" ] && [ -f "$PROJECT_ROOT/pyproject.toml" ]; then
        version=$(grep '^version' "$PROJECT_ROOT/pyproject.toml" | head -1 | sed 's/.*=.*"\(.*\)".*/\1/')
    fi
    
    # 3. 从 git tag 获取
    if [ -z "$version" ]; then
        version=$(git describe --tags --always 2>/dev/null | sed 's/^v//')
    fi
    
    echo "$version"
}

# 生成新版本号
generate_version() {
    local current_version=$1
    local version_type=${2:-patch}
    
    # 解析版本号
    local major=$(echo "$current_version" | cut -d'.' -f1)
    local minor=$(echo "$current_version" | cut -d'.' -f2)
    local patch=$(echo "$current_version" | cut -d'.' -f3)
    
    # 处理非数字版本
    if ! [[ "$major" =~ ^[0-9]+$ ]]; then
        major=0
    fi
    if ! [[ "$minor" =~ ^[0-9]+$ ]]; then
        minor=0
    fi
    if ! [[ "$patch" =~ ^[0-9]+$ ]]; then
        patch=0
    fi
    
    # 根据类型递增版本号
    case $version_type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
        *)
            patch=$((patch + 1))
            ;;
    esac
    
    echo "${major}.${minor}.${patch}"
}

# 确认版本
confirm_version() {
    local new_version=$1
    
    echo ""
    echo "=========================================="
    echo "     创建版本标签"
    echo "=========================================="
    echo ""
    log_info "当前版本: $(get_current_version)"
    log_info "新版本: $new_version"
    log_info "标签: ${TAG_PREFIX}${new_version}"
    log_info "提交: $(git rev-parse HEAD | cut -c1-8)"
    log_info "提交信息: $(git log -1 --pretty=%B | head -1)"
    echo ""
    
    if [ -n "$AUTO_CONFIRM" ]; then
        return 0
    fi
    
    read -p "确认创建标签? (输入 'tag' 继续): " -r
    echo ""
    
    if [ "$REPLY" != "tag" ]; then
        log_info "已取消创建标签"
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

# 检查工作区状态
check_workspace() {
    log_info "检查工作区状态..."
    
    cd "$PROJECT_ROOT"
    
    # 检查是否有未提交的更改
    if ! git diff --quiet || ! git diff --cached --quiet; then
        log_warn "存在未提交的更改"
        log_info "未提交的更改不会被包含在标签中"
    fi
    
    # 检查远程分支
    local current_branch=$(git branch --show-current 2>/dev/null || echo "main")
    if ! git ls-remote --heads origin "$current_branch" | grep -q "$current_branch"; then
        log_warn "本地分支 '$current_branch' 不存在于远程"
    fi
    
    log_info "工作区状态正常"
}

# 更新版本号
update_version() {
    local new_version=$1
    
    log_info "更新版本号到: $new_version"
    
    cd "$PROJECT_ROOT"
    
    # 更新 package.json
    if [ -f "package.json" ]; then
        local current_version=$(grep '"version"' package.json | head -1 | sed 's/.*:.*"\(.*\)".*/\1/')
        if [ -n "$current_version" ]; then
            sed -i "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" package.json
            log_info "已更新 package.json"
        fi
    fi
    
    # 更新 pyproject.toml
    if [ -f "pyproject.toml" ]; then
        local current_version=$(grep '^version' pyproject.toml | head -1 | sed 's/.*=.*"\(.*\)".*/\1/')
        if [ -n "$current_version" ]; then
            sed -i "s/^version = \"$current_version\"/version = \"$new_version\"/" pyproject.toml
            log_info "已更新 pyproject.toml"
        fi
    fi
    
    # 提交版本更新
    if git diff --quiet; then
        log_info "版本文件未变化，无需提交"
    else
        git add -A
        git commit -m "chore: bump version to $new_version"
        log_info "已提交版本更新"
    fi
}

# 创建标签
create_tag() {
    local version=$1
    
    log_info "创建标签: ${TAG_PREFIX}${version}"
    
    cd "$PROJECT_ROOT"
    
    # 创建注释标签
    git tag -a "${TAG_PREFIX}${version}" -m "Release ${version}
    
Generated by create-tag.sh
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
Commit: $(git rev-parse HEAD)
    
Changelog:
$(git log --oneline $(git describe --tags --always HEAD~1 2>/dev/null || HEAD~1)..HEAD 2>/dev/null | sed 's/^/  - /')
"
    
    log_info "标签已创建: ${TAG_PREFIX}${version}"
}

# 推送标签
push_tag() {
    local version=$1
    
    log_info "推送标签到远程..."
    
    cd "$PROJECT_ROOT"
    
    git push origin "${TAG_PREFIX}${version}"
    
    log_info "标签已推送: ${TAG_PREFIX}${version}"
}

# 推送代码更新
push_code() {
    log_info "推送代码更新..."
    
    cd "$PROJECT_ROOT"
    
    local current_branch=$(git branch --show-current 2>/dev/null || echo "main")
    git push origin "$current_branch"
    
    log_info "代码已推送"
}

# 创建 GitHub Release
create_github_release() {
    local version=$1
    
    if [ "$GITHUB_RELEASE" != "true" ]; then
        log_info "跳过 GitHub Release 创建"
        return 0
    fi
    
    log_info "创建 GitHub Release..."
    
    cd "$PROJECT_ROOT"
    
    # 检查 gh CLI 是否可用
    if ! command -v gh &> /dev/null; then
        log_warn "未安装 gh CLI，无法创建 GitHub Release"
        return 0
    fi
    
    # 生成 Release 笔记
    local release_notes=$(cat << EOF
## Release ${version}

**Tag:** ${TAG_PREFIX}${version}
**Commit:** $(git rev-parse HEAD)
**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

### Changes

$(git log --oneline $(git describe --tags --always HEAD~1 2>/dev/null || HEAD~1)..HEAD 2>/dev/null | sed 's/^/- /')

### Installation

\`\`\`bash
npm install package@${version}
\`\`\`

---
*Generated by create-tag.sh*
EOF
)
    
    # 创建 Release
    gh release create "${TAG_PREFIX}${version}" \
        --title "Release ${version}" \
        --notes "$release_notes" \
        --draft=false \
        --prerelease=false
    
    log_info "GitHub Release 已创建"
}

# 主函数
main() {
    local version_type=${1:-patch}
    
    # 如果指定了版本号，使用指定版本
    if [ -n "$2" ]; then
        VERSION=$2
    fi
    
    echo "=========================================="
    echo "     创建版本标签"
    echo "=========================================="
    echo ""
    log_info "版本类型: $version_type"
    log_info "标签前缀: $TAG_PREFIX"
    log_info "推送到远程: $PUSH"
    log_info "创建 GitHub Release: $GITHUB_RELEASE"
    echo ""
    
    # 获取或生成版本号
    if [ -z "$VERSION" ]; then
        local current_version=$(get_current_version)
        VERSION=$(generate_version "$current_version" "$version_type")
    fi
    
    # 确认版本
    confirm_version "$VERSION"
    
    # 执行标签创建步骤
    run_step "检查工作区状态" check_workspace
    run_step "更新版本号" "update_version $VERSION"
    run_step "创建标签" "create_tag $VERSION"
    
    # 如果需要推送
    if [ "$PUSH" = "true" ]; then
        run_step "推送代码更新" push_code
        run_step "推送标签" "push_tag $VERSION"
        run_step "创建 GitHub Release" "create_github_release $VERSION"
    fi
    
    echo ""
    echo "=========================================="
    log_info "版本标签创建完成!"
    echo "=========================================="
    echo ""
    echo "标签: ${TAG_PREFIX}${VERSION}"
    echo "版本号: $VERSION"
    echo ""
    
    if [ "$PUSH" != "true" ]; then
        echo "推送命令: git push origin ${TAG_PREFIX}${VERSION}"
    fi
    
    echo ""
}

main "$@"
