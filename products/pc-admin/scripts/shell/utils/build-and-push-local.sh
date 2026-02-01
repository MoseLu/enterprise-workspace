#!/bin/bash

# 本地构建应用并触发 GitHub Actions 工作流构建 Docker 镜像和部署
# 镜像构建在 GitHub Actions 中完成，避免本地 Windows/WSL 路径问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 如果脚本在 WSL 中运行，自动切换到 Windows Git Bash，避免 Linux 可选依赖缺失
# 检测逻辑：只有在真正的 WSL 环境中才触发
# 最可靠的检测方法：检查 /proc/version 文件是否存在且包含 "microsoft"
# 如果 /proc/version 不存在，说明不在 WSL 中（可能是 Git Bash 或 PowerShell）
IS_WSL=false

# 检查 /proc/version 文件（WSL 特有）
if [ -f "/proc/version" ] && [ -r "/proc/version" ]; then
    # 文件存在，检查是否包含 WSL 标识
    if grep -qi "microsoft\|WSL" /proc/version 2>/dev/null; then
        IS_WSL=true
    fi
fi

# 如果检测到 WSL 且未强制跳过，则切换到 Windows Git Bash
if [ "$IS_WSL" = true ] && [ -z "$BTC_SHOPFLOW_FORCE_WSL" ]; then
    # 尝试查找 Windows Git Bash
    for candidate in "/mnt/c/Program Files/Git/bin/bash.exe" "/mnt/c/Program Files (x86)/Git/bin/bash.exe" "/c/Program Files/Git/bin/bash.exe" "/c/Program Files (x86)/Git/bin/bash.exe"; do
        if [ -x "$candidate" ]; then
            WIN_GIT_BASH="$candidate"
            break
        fi
    done

    if [ -n "$WIN_GIT_BASH" ] && command -v wslpath >/dev/null 2>&1; then
        WIN_SCRIPT_PATH=$(wslpath -w "$0")
        log_warning "检测到 WSL 环境，自动使用 Windows Git Bash 重新执行脚本，以复用 Windows node_modules"
        exec "$WIN_GIT_BASH" "$WIN_SCRIPT_PATH" "$@"
    else
        log_warning "检测到 WSL 环境，但未找到 Git Bash。"
        log_info ""
        log_info "将在 WSL 环境中继续运行（使用 WSL 的 node_modules）。"
        log_info "如果遇到依赖问题，请："
        log_info "  1. 在 PowerShell 中使用 Git Bash 运行（如果已安装 Git Bash）"
        log_info "  2. 或者设置环境变量跳过 WSL 检测："
        log_info "     export BTC_SHOPFLOW_FORCE_WSL=1"
        log_info "  3. 或者安装 Git Bash：https://git-scm.com/download/win"
        log_info ""
        # 继续运行，不退出
    fi
fi

# 默认配置
GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"
REPO_LOWER=$(echo "$GITHUB_REPO" | tr '[:upper:]' '[:lower:]')
REGISTRY="ghcr.io"
APP_NAME=""
AUTO_DEPLOY=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --auto-deploy)
            AUTO_DEPLOY=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 <app-name> [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --auto-deploy    构建应用后自动触发 GitHub Actions 工作流构建镜像和部署"
            echo "  --help, -h        显示帮助信息"
            echo ""
            echo "环境变量:"
            echo "  GITHUB_TOKEN     GitHub Personal Access Token（必需，用于触发工作流）"
            echo "  GITHUB_REPO      GitHub 仓库（默认: BellisGit/btc-shopflow-monorepo）"
            echo ""
            echo "示例:"
            echo "  $0 system-app"
            echo "  $0 admin-app --auto-deploy"
            echo "  $0 logistics-app --no-push"
            exit 0
            ;;
        *)
            if [ -z "$APP_NAME" ]; then
                APP_NAME="$1"
            else
                log_error "未知参数: $1"
                exit 1
            fi
            shift
            ;;
    esac
done

# 验证应用名称
if [ -z "$APP_NAME" ]; then
    log_error "请指定要构建的应用名称"
    echo "用法: $0 <app-name> [OPTIONS]"
    echo "示例: $0 system-app"
    echo "示例: $0 admin-app --auto-deploy"
    exit 1
fi

# 检查是否在项目根目录

# 检查是否在项目根目录
if [ ! -f "Dockerfile" ]; then
    log_error "未找到 Dockerfile，请在项目根目录运行此脚本"
    exit 1
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 本地构建并推送 Docker 镜像"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "应用: $APP_NAME"
log_info "仓库: $GITHUB_REPO"
log_info "注册表: $REGISTRY"
echo ""

# 检查 GitHub Token（尝试多种方式获取）
if [ -z "$GITHUB_TOKEN" ]; then
    # 尝试从 Git 凭据管理器获取（Windows）
    if command -v git-credential-manager > /dev/null 2>&1; then
        GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
    fi
fi

# Windows 上尝试从注册表读取用户级环境变量（通过 PowerShell）
if [ -z "$GITHUB_TOKEN" ]; then
    # 检测是否为 Windows 环境
    IS_WINDOWS=false
    if [ -n "$WINDIR" ] || [ "$OS" = "Windows_NT" ] || [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ] || [ "$OSTYPE" = "win32" ]; then
        IS_WINDOWS=true
    fi
    
    # 如果检测到 Windows 或者 PowerShell 可用，尝试读取
    if [ "$IS_WINDOWS" = "true" ] || command -v powershell.exe > /dev/null 2>&1; then
        if command -v powershell.exe > /dev/null 2>&1; then
            # 使用和测试脚本完全相同的命令（已验证可以工作）
            # 注意：在双引号中使用 \$ 转义，确保 bash 不解释 PowerShell 变量
            PS_OUTPUT=$(powershell.exe -NoProfile -NonInteractive -Command "try { \$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\$token) { Write-Output \$token } } catch { }" 2>&1)
            # 清理输出：移除回车符、换行符和可能的 PowerShell 提示符
            GITHUB_TOKEN=$(echo "$PS_OUTPUT" | grep -v "^PS " | grep -v "^所在位置" | grep -v "^标记" | grep -v "^CategoryInfo" | grep -v "^FullyQualifiedErrorId" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1)
            # 如果读取成功但包含错误信息，清空变量
            if echo "$GITHUB_TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
                GITHUB_TOKEN=""
            fi
            # 如果结果为空或只包含空白字符，清空变量
            if [ -z "${GITHUB_TOKEN// }" ]; then
                GITHUB_TOKEN=""
            fi
        fi
    fi
fi

if [ -z "$GITHUB_TOKEN" ]; then
    log_error "未设置 GITHUB_TOKEN 环境变量"
    log_info ""
    log_info "📝 设置方法:"
    log_info ""
    log_info "  PowerShell (当前会话):"
    log_info "    \$env:GITHUB_TOKEN=\"your_token_here\""
    log_info ""
    log_info "  PowerShell (永久设置，推荐):"
    log_info "    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token_here', 'User')"
    log_info "    然后刷新环境变量: . scripts/refresh-env.ps1"
    log_info "    或者重新打开 PowerShell 终端"
    log_info ""
    log_info "  Git Bash / WSL:"
    log_info "    export GITHUB_TOKEN=your_token_here"
    log_info "    或者在 ~/.bashrc 中添加: export GITHUB_TOKEN=your_token_here"
    log_info ""
    log_info "🔑 创建 GitHub Token:"
    log_info "  1. 访问: https://github.com/settings/tokens"
    log_info "  2. 点击 'Generate new token' -> 'Generate new token (classic)'"
    log_info "  3. 设置过期时间并选择以下权限:"
    log_info "     - ✅ write:packages (推送镜像到 GHCR)"
    log_info "     - ✅ actions:write (触发 GitHub Actions 工作流)"
    log_info "     - ✅ repo (如果仓库是私有的)"
    log_info "  4. 生成后复制 token（只显示一次！）"
    log_info ""
    log_info "💡 提示:"
    log_info "  - 永久设置后，运行: . scripts/refresh-env.ps1"
    log_info "  - 或者重新打开 PowerShell 终端"
    exit 1
fi

# 获取当前 Git SHA（固定使用 7 位，确保与部署工作流一致）
GIT_SHA=$(git rev-parse HEAD 2>/dev/null | cut -c1-7 || echo "latest")

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 本地构建应用并触发 GitHub Actions"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "应用: $APP_NAME"
log_info "仓库: $GITHUB_REPO"
log_info "Git SHA: $GIT_SHA"
echo ""

# 本地构建应用（Docker 镜像构建将在 GitHub Actions 中完成）
log_info "📦 在本地构建应用..."
log_info "执行: pnpm --filter $APP_NAME build"
if pnpm --filter "$APP_NAME" build; then
    log_success "应用构建成功"
else
    log_error "应用构建失败"
    exit 1
fi
echo ""

# 验证 dist 目录是否存在
DIST_PATH="apps/$APP_NAME/dist"
if [ ! -d "$DIST_PATH" ]; then
    log_error "构建产物目录不存在: $DIST_PATH"
    log_info "请确保应用构建成功"
    exit 1
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "✅ 应用构建完成！"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "📋 构建信息:"
log_info "  - 应用: $APP_NAME"
log_info "  - 构建产物: $DIST_PATH"
log_info "  - Git SHA: $GIT_SHA"
echo ""

# 提示用户提交代码
log_info "💡 下一步："
log_info "  1. 提交构建产物到 Git:"
log_info "     git add apps/$APP_NAME/dist"
log_info "     git commit -m \"build($APP_NAME): 构建应用\""
log_info "     git push"
log_info ""
log_info "  2. 或者使用 --auto-deploy 选项自动触发工作流（需要先提交代码）"
echo ""

# 自动触发部署工作流
if [ "$AUTO_DEPLOY" = true ]; then
    log_info "🚀 自动触发部署工作流..."
    
    # 获取仓库 owner 和 repo 名称
    REPO_OWNER=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
    REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)
    
    # 验证 Token 是否有效并检查权限
    log_info "验证 GitHub Token 和权限..."
    
    # 1. 验证 Token 基本有效性
    TOKEN_CHECK=$(curl -s -w "\n%{http_code}" \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/user" 2>&1)
    
    TOKEN_CHECK_CODE=$(echo "$TOKEN_CHECK" | tail -n1)
    TOKEN_CHECK_BODY=$(echo "$TOKEN_CHECK" | sed '$d')
    
    if [ "$TOKEN_CHECK_CODE" -ne 200 ]; then
        log_error "❌ GitHub Token 验证失败 (HTTP $TOKEN_CHECK_CODE)"
        if [ -n "$TOKEN_CHECK_BODY" ]; then
            log_warning "响应: $TOKEN_CHECK_BODY"
        fi
        log_info ""
        log_error "🔴 PAT 问题诊断:"
        log_info "  1. Token 可能已过期或无效"
        log_info "  2. Token 可能被撤销"
        log_info "  3. Token 格式可能不正确"
        log_info ""
        log_info "💡 解决方案:"
        log_info "  1. 访问: https://github.com/settings/tokens"
        log_info "  2. 检查现有 Token 是否有效"
        log_info "  3. 如果无效，创建新 Token:"
        log_info "     - 点击 'Generate new token' -> 'Generate new token (classic)'"
        log_info "     - 设置过期时间（建议 90 天或更长）"
        log_info "     - 必须勾选以下权限:"
        log_info "       ✅ repo (全选，包括 repo:status, repo_deployment, public_repo)"
        log_info "       ✅ write:packages (推送镜像到 GHCR)"
        log_info "       ✅ actions:write (触发 GitHub Actions 工作流)"
        log_info "  4. 复制新 Token 并设置:"
        log_info "     PowerShell (永久):"
        log_info "       [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_new_token', 'User')"
        log_info "     PowerShell (临时):"
        log_info "       \$env:GITHUB_TOKEN=\"your_new_token\""
        log_info "     Git Bash:"
        log_info "       export GITHUB_TOKEN=\"your_new_token\""
        exit 1
    fi
    
    # 2. 检查 Token 权限（通过尝试访问仓库信息）
    REPO_CHECK=$(curl -s -w "\n%{http_code}" \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME" 2>&1)
    
    REPO_CHECK_CODE=$(echo "$REPO_CHECK" | tail -n1)
    REPO_CHECK_BODY=$(echo "$REPO_CHECK" | sed '$d')
    
    if [ "$REPO_CHECK_CODE" -ne 200 ]; then
        log_error "❌ 无法访问仓库 (HTTP $REPO_CHECK_CODE)"
        if [ "$REPO_CHECK_CODE" -eq 404 ]; then
            log_error "   仓库不存在或 Token 没有访问权限"
        elif [ "$REPO_CHECK_CODE" -eq 403 ]; then
            log_error "   Token 缺少 'repo' 权限"
        fi
        log_info ""
        log_info "💡 解决方案:"
        log_info "  1. 确保 Token 具有 'repo' 权限（全选）"
        log_info "  2. 如果仓库是私有的，必须勾选 'repo' 权限"
        log_info "  3. 重新生成 Token 并设置正确的权限"
        exit 1
    fi
    
    # 3. 检查 actions:write 权限（通过尝试获取工作流列表）
    ACTIONS_CHECK=$(curl -s -w "\n%{http_code}" \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows?per_page=1" 2>&1)
    
    ACTIONS_CHECK_CODE=$(echo "$ACTIONS_CHECK" | tail -n1)
    
    if [ "$ACTIONS_CHECK_CODE" -ne 200 ]; then
        log_warning "⚠️  无法获取工作流列表 (HTTP $ACTIONS_CHECK_CODE)"
        if [ "$ACTIONS_CHECK_CODE" -eq 403 ]; then
            log_error "   Token 可能缺少 'actions:write' 权限"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 确保 Token 具有 'actions:write' 权限"
            log_info "  2. 重新生成 Token 并勾选 'actions:write' 权限"
        fi
    fi
    
    log_success "✅ GitHub Token 验证通过"
    log_info "   - Token 有效"
    log_info "   - 可以访问仓库"
    if [ "$ACTIONS_CHECK_CODE" -eq 200 ]; then
        log_info "   - 可以访问 Actions API"
    fi
    
    # 触发 GitHub Actions 工作流
    # 根据应用名称确定工作流文件
    WORKFLOW_FILE="deploy-${APP_NAME}.yml"
    WORKFLOW_PATH=".github/workflows/${WORKFLOW_FILE}"
    log_info "触发部署工作流: $APP_NAME"
    log_info "工作流文件: $WORKFLOW_FILE"
    
    # 先尝试直接获取特定工作流的信息（使用文件名）
    # 这样可以避免依赖工作流列表 API
    log_info "尝试直接获取工作流信息..."
    WORKFLOW_INFO_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_FILE" 2>&1)
    
    WORKFLOW_INFO_HTTP_CODE=$(echo "$WORKFLOW_INFO_RESPONSE" | tail -n1)
    WORKFLOW_INFO_BODY=$(echo "$WORKFLOW_INFO_RESPONSE" | sed '$d')
    
    if [ "$WORKFLOW_INFO_HTTP_CODE" -eq 200 ]; then
        # 成功获取工作流信息，提取 ID
        WORKFLOW_ID=$(echo "$WORKFLOW_INFO_BODY" | grep -oE "\"id\":[0-9]+" | head -1 | cut -d':' -f2 | tr -d ' ')
        if [ -n "$WORKFLOW_ID" ]; then
            log_info "✅ 成功获取工作流 ID: $WORKFLOW_ID"
        fi
    else
        log_warning "无法直接获取工作流信息 (HTTP $WORKFLOW_INFO_HTTP_CODE)"
        if [ "$WORKFLOW_INFO_HTTP_CODE" -eq 404 ]; then
            log_info "💡 提示：工作流可能还没有被 GitHub 识别"
            log_info "💡 解决方案："
            log_info "   1. 在 GitHub 网页上手动触发一次工作流："
            log_info "      https://github.com/$GITHUB_REPO/actions/workflows/$WORKFLOW_FILE"
            log_info "   2. 或者创建一个测试提交来触发 push 事件，让工作流运行一次"
            log_info "   3. 等待几分钟后重试"
        fi
        log_info "尝试获取工作流列表..."
    fi
    
    # 如果直接获取失败，尝试获取工作流列表
    if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
        log_info "检查工作流是否存在（获取工作流列表）..."
        WORKFLOWS_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows?per_page=100" 2>&1)
    
    WORKFLOWS_HTTP_CODE=$(echo "$WORKFLOWS_RESPONSE" | tail -n1)
    WORKFLOWS_BODY=$(echo "$WORKFLOWS_RESPONSE" | sed '$d')
    
    WORKFLOW_ID=""
    if [ "$WORKFLOWS_HTTP_CODE" -eq 200 ]; then
        # GitHub API 返回格式: {"total_count":N,"workflows":[{"id":123,"node_id":"...","name":"...","path":".github/workflows/deploy-system-app.yml",...},...]}
        # 使用 jq 或更可靠的 JSON 解析方式提取工作流 ID
        # 方法1: 直接使用 jq（如果可用）
        if command -v jq > /dev/null 2>&1; then
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | jq -r ".workflows[] | select(.path == \"$WORKFLOW_PATH\" or .path | endswith(\"$WORKFLOW_FILE\")) | .id" | head -1)
        fi
        
        # 方法2: 如果 jq 不可用，使用 grep 和 sed
        if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
            # 提取包含工作流路径的所有行，然后提取 ID
            # GitHub API 返回的 JSON 格式中，path 和 id 可能在同一个对象中
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | grep -oE "\"id\":[0-9]+[^}]*\"path\":\"[^\"]*${WORKFLOW_FILE}\"" | grep -oE "\"id\":([0-9]+)" | head -1 | cut -d':' -f2 | tr -d ' ')
        fi
        
        # 方法3: 使用完整路径匹配
        if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | grep -oE "\"id\":[0-9]+[^}]*\"path\":\"${WORKFLOW_PATH}\"" | grep -oE "\"id\":([0-9]+)" | head -1 | cut -d':' -f2 | tr -d ' ')
        fi
        
        # 方法4: 反向匹配 - 先找路径再找 ID
        if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
            # 找到包含路径的行，然后向前查找 ID
            WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | grep -B 20 "\"path\":\".*${WORKFLOW_FILE}\"" | grep -oE "\"id\":[0-9]+" | tail -1 | cut -d':' -f2 | tr -d ' ')
        fi
        
        if [ -n "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
            log_info "找到工作流 ID: $WORKFLOW_ID"
        else
            log_warning "工作流 $WORKFLOW_FILE 未在可用工作流列表中找到"
            log_info "调试信息 - 可用工作流列表："
            echo "$WORKFLOWS_BODY" | grep -oE "\"path\":\"[^\"]*\"" | sed 's/"path":"//;s/"//' | grep -E "deploy-.*\.yml" | head -10
            
            # 调试：输出完整的 JSON 响应以便排查（保存到临时文件）
            DEBUG_FILE=$(mktemp 2>/dev/null || echo "/tmp/workflows-debug-$$.json")
            echo "$WORKFLOWS_BODY" > "$DEBUG_FILE"
            log_info "完整工作流列表已保存到: $DEBUG_FILE"
            log_info "工作流列表 API 响应（前 3000 字符）："
            echo "$WORKFLOWS_BODY" | head -c 3000
            echo ""
            
            # 调试：检查工作流列表是否包含我们的工作流（使用不同的匹配方式）
            if echo "$WORKFLOWS_BODY" | grep -q "$WORKFLOW_PATH"; then
                log_info "✅ 在响应中找到完整路径 $WORKFLOW_PATH"
                # 如果找到了路径但没提取到 ID，尝试更精确的提取
                log_info "尝试更精确地提取工作流 ID..."
                WORKFLOW_ID=$(echo "$WORKFLOWS_BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); wf=[w for w in data.get('workflows',[]) if w.get('path')=='$WORKFLOW_PATH']; print(wf[0]['id'] if wf else '')" 2>/dev/null || echo "")
            elif echo "$WORKFLOWS_BODY" | grep -q "$WORKFLOW_FILE"; then
                log_info "✅ 在响应中找到文件名 $WORKFLOW_FILE"
            else
                log_warning "⚠️  在响应中未找到工作流 $WORKFLOW_FILE 或 $WORKFLOW_PATH"
                log_info "💡 提示：工作流文件可能刚提交，GitHub 需要一些时间才能识别"
                log_info "💡 或者工作流文件可能有语法错误，导致 GitHub 无法识别"
            fi
        fi
    else
        log_warning "无法获取工作流列表 (HTTP $WORKFLOWS_HTTP_CODE)，将尝试使用完整路径触发..."
    fi
    
    # 统一使用 repository_dispatch 触发所有应用的工作流
    # 每个应用都有自己特定的工作流和事件类型
    case "$APP_NAME" in
        system-app)
            EVENT_TYPE="deploy-system-app"
            TARGET_WORKFLOW="deploy-system-app.yml"
            TARGET_WORKFLOW_NAME="Deploy System App"
            ;;
        admin-app)
            EVENT_TYPE="deploy-admin-app"
            TARGET_WORKFLOW="deploy-admin-app.yml"
            TARGET_WORKFLOW_NAME="Deploy Admin App"
            ;;
        logistics-app)
            EVENT_TYPE="deploy-logistics-app"
            TARGET_WORKFLOW="deploy-logistics-app.yml"
            TARGET_WORKFLOW_NAME="Deploy Logistics App"
            ;;
        quality-app)
            EVENT_TYPE="deploy-quality-app"
            TARGET_WORKFLOW="deploy-quality-app.yml"
            TARGET_WORKFLOW_NAME="Deploy Quality App"
            ;;
        production-app)
            EVENT_TYPE="deploy-production-app"
            TARGET_WORKFLOW="deploy-production-app.yml"
            TARGET_WORKFLOW_NAME="Deploy Production App"
            ;;
        engineering-app)
            EVENT_TYPE="deploy-engineering-app"
            TARGET_WORKFLOW="deploy-engineering-app.yml"
            TARGET_WORKFLOW_NAME="Deploy Engineering App"
            ;;
        finance-app)
            EVENT_TYPE="deploy-finance-app"
            TARGET_WORKFLOW="deploy-finance-app.yml"
            TARGET_WORKFLOW_NAME="Deploy Finance App"
            ;;
        *)
            log_error "未知的应用名称: $APP_NAME"
            log_info "支持的应用: system-app, admin-app, logistics-app, quality-app, production-app, engineering-app, finance-app"
            exit 1
            ;;
    esac
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 触发部署工作流"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "应用: $APP_NAME"
    log_info "工作流: $TARGET_WORKFLOW"
    log_info "事件类型: $EVENT_TYPE"
    log_info ""
    
    # 使用 repository_dispatch 触发（所有应用统一使用）
    # 注意：Docker 镜像构建将在 GitHub Actions 工作流中完成
    log_info "使用 repository_dispatch 触发 $TARGET_WORKFLOW 工作流..."
    log_info "工作流将自动构建 Docker 镜像并部署"
    log_info "发送 API 请求到 GitHub..."
    
    REPO_DISPATCH_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches" \
        -d "{
            \"event_type\": \"$EVENT_TYPE\",
            \"client_payload\": {
                \"app_name\": \"$APP_NAME\",
                \"apps\": \"$APP_NAME\",
                \"environment\": \"production\",
                \"github_sha\": \"$GIT_SHA\",
                \"image_tag\": \"$IMAGE_TAG_SHA\"
            }
        }" 2>&1)
    
    REPO_DISPATCH_HTTP_CODE=$(echo "$REPO_DISPATCH_RESPONSE" | tail -n1)
    REPO_DISPATCH_BODY=$(echo "$REPO_DISPATCH_RESPONSE" | sed '$d')
    
    # 详细错误处理
    if [ "$REPO_DISPATCH_HTTP_CODE" -ne 204 ]; then
        log_error "❌ repository_dispatch 请求失败 (HTTP $REPO_DISPATCH_HTTP_CODE)"
        if [ -n "$REPO_DISPATCH_BODY" ]; then
            log_warning "响应内容: $REPO_DISPATCH_BODY"
        fi
        log_info ""
        
        # 根据 HTTP 状态码提供具体的错误诊断
        if [ "$REPO_DISPATCH_HTTP_CODE" -eq 401 ]; then
            log_error "🔴 PAT 认证失败"
            log_info ""
            log_info "可能原因:"
            log_info "  1. Token 无效或已过期"
            log_info "  2. Token 格式不正确（可能包含多余的空格或换行）"
            log_info "  3. Token 已被撤销"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token: https://github.com/settings/tokens"
            log_info "  2. 如果 Token 无效，创建新 Token:"
            log_info "     - 访问: https://github.com/settings/tokens/new"
            log_info "     - 选择 'Generate new token (classic)'"
            log_info "     - 设置过期时间"
            log_info "     - 必须勾选权限: repo (全选), write:packages, actions:write"
            log_info "  3. 设置新 Token:"
            log_info "     PowerShell: [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')"
            log_info "     然后刷新环境变量或重新打开终端"
            
        elif [ "$REPO_DISPATCH_HTTP_CODE" -eq 403 ]; then
            log_error "🔴 PAT 权限不足"
            log_info ""
            log_info "可能原因:"
            log_info "  1. Token 缺少 'repo' 权限（必需）"
            log_info "  2. Token 缺少 'actions:write' 权限（触发工作流必需）"
            log_info "  3. 仓库设置了分支保护，限制了 API 触发"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token 权限: https://github.com/settings/tokens"
            log_info "  2. 确保 Token 具有以下权限:"
            log_info "     ✅ repo (全选，包括所有子权限)"
            log_info "     ✅ write:packages (推送镜像)"
            log_info "     ✅ actions:write (触发工作流)"
            log_info "  3. 如果权限不足，重新生成 Token 并勾选所有必需权限"
            log_info "  4. 检查仓库设置: Settings -> Actions -> General"
            log_info "     确保 'Allow GitHub Actions to create and approve pull requests' 已启用"
            
        elif [ "$REPO_DISPATCH_HTTP_CODE" -eq 404 ]; then
            log_error "🔴 仓库或端点不存在"
            log_info ""
            log_info "可能原因:"
            log_info "  1. 仓库名称或所有者不正确"
            log_info "  2. 仓库不存在或无权访问"
            log_info "  3. GitHub API 端点错误"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查仓库名称: $GITHUB_REPO"
            log_info "  2. 确认仓库存在且可访问"
            log_info "  3. 检查脚本中的 REPO_OWNER 和 REPO_NAME 变量"
            
        elif [ "$REPO_DISPATCH_HTTP_CODE" -eq 422 ]; then
            log_error "🔴 请求参数无效"
            log_info ""
            log_info "可能原因:"
            log_info "  1. event_type 格式不正确"
            log_info "  2. client_payload 格式错误"
            log_info "  3. 工作流未配置 repository_dispatch 触发器"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查工作流文件是否配置了 repository_dispatch:"
            log_info "     .github/workflows/$TARGET_WORKFLOW"
            log_info "  2. 确保工作流中的 event_type 与脚本中的一致:"
            log_info "     脚本使用: $EVENT_TYPE"
            log_info "     工作流应监听: types: [$EVENT_TYPE]"
            log_info "  3. 检查工作流文件语法是否正确"
            
        else
            log_error "🔴 未知错误 (HTTP $REPO_DISPATCH_HTTP_CODE)"
            log_info ""
            log_info "可能原因:"
            log_info "  - GitHub API 临时问题"
            log_info "  - 网络连接问题"
            log_info "  - 速率限制"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 等待几分钟后重试"
            log_info "  2. 检查网络连接"
            log_info "  3. 查看 GitHub Status: https://www.githubstatus.com/"
        fi
        
        log_info ""
        log_info "📋 调试信息:"
        log_info "  - 仓库: $GITHUB_REPO"
        log_info "  - 事件类型: $EVENT_TYPE"
        log_info "  - 工作流: $TARGET_WORKFLOW"
        log_info "  - HTTP 状态码: $REPO_DISPATCH_HTTP_CODE"
        
        # 尝试回退到 workflow_dispatch
        log_info ""
        log_warning "尝试使用 workflow_dispatch 作为备选方案..."
        # 继续执行 workflow_dispatch 逻辑
    else
        # 成功发送 repository_dispatch 请求
        log_success "✅ repository_dispatch 请求已发送 (HTTP 204)"
        log_info "等待工作流启动（最多等待 15 秒）..."
        
        # 等待几秒后验证工作流是否真的启动了
        sleep 5
        
        # 查询最近的工作流运行记录
        WORKFLOW_RUNS=$(curl -s \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/runs?per_page=10&event=repository_dispatch" 2>&1)
        
        # 检查是否有新的运行记录
        if echo "$WORKFLOW_RUNS" | grep -q '"workflow_runs"'; then
            # 尝试查找目标工作流
            WORKFLOW_NAME_MATCH=$(echo "$WORKFLOW_RUNS" | grep -i "$TARGET_WORKFLOW_NAME\|$TARGET_WORKFLOW" | head -1)
            
            if [ -n "$WORKFLOW_NAME_MATCH" ]; then
                # 提取运行信息
                LATEST_RUN=$(echo "$WORKFLOW_RUNS" | jq -r '.workflow_runs[0].id' 2>/dev/null || echo "$WORKFLOW_RUNS" | grep -oE '"id":[0-9]+' | head -1 | cut -d':' -f2 | tr -d ' ')
                RUN_STATUS=$(echo "$WORKFLOW_RUNS" | jq -r '.workflow_runs[0].status' 2>/dev/null || echo "$WORKFLOW_RUNS" | grep -oE '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
                RUN_URL=$(echo "$WORKFLOW_RUNS" | jq -r '.workflow_runs[0].html_url' 2>/dev/null || echo "$WORKFLOW_RUNS" | grep -oE '"html_url":"[^"]*"' | head -1 | cut -d'"' -f4)
                WORKFLOW_NAME=$(echo "$WORKFLOW_RUNS" | jq -r '.workflow_runs[0].name' 2>/dev/null || echo "$WORKFLOW_RUNS" | grep -oE '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
                
                if [ -n "$LATEST_RUN" ] && [ -n "$RUN_URL" ]; then
                    log_success "✅ 工作流已成功启动！"
                    log_info ""
                    log_info "📋 工作流信息:"
                    log_info "  - 运行 ID: $LATEST_RUN"
                    log_info "  - 工作流: ${WORKFLOW_NAME:-$TARGET_WORKFLOW_NAME}"
                    log_info "  - 状态: ${RUN_STATUS:-unknown}"
                    log_info "  - 查看: $RUN_URL"
                    log_info ""
                    log_info "📋 部署信息:"
                    log_info "  - 应用: $APP_NAME"
                    log_info "  - 工作流: $TARGET_WORKFLOW"
                    log_info "  - 环境: production"
                    log_info "  - SHA: $GIT_SHA"
                    log_info "  - 镜像标签: $IMAGE_TAG_SHA（将在工作流中构建）"
                    log_info "  - 分支: develop"
                    exit 0
                fi
            fi
        fi
        
        # 如果没找到运行记录，但 API 返回 204，说明请求已接受
        log_warning "⚠️  工作流可能还在启动中，或工作流文件尚未被 GitHub 识别"
        log_info ""
        log_info "💡 提示:"
        log_info "  1. repository_dispatch 请求已成功发送 (HTTP 204)"
        log_info "  2. 工作流可能需要几秒钟才能出现在 Actions 页面"
        log_info "  3. 如果工作流未出现，请检查:"
        log_info "     - 工作流文件是否正确配置了 repository_dispatch 触发器"
        log_info "     - 工作流文件中的 event_type 是否与脚本中的一致"
        log_info "     - 工作流文件语法是否正确"
        log_info ""
        log_info "查看工作流运行状态: https://github.com/$GITHUB_REPO/actions"
        log_info "查找 '$TARGET_WORKFLOW_NAME' 工作流的最新运行"
        exit 0
    fi
    
    # 如果 repository_dispatch 失败，尝试 workflow_dispatch（备选方案）
    if [ "$REPO_DISPATCH_HTTP_CODE" -ne 204 ]; then
        log_warning "repository_dispatch 失败，尝试使用 workflow_dispatch 作为备选方案..."
        if [ -n "$REPO_DISPATCH_BODY" ]; then
            log_info "repository_dispatch 响应: $REPO_DISPATCH_BODY"
        fi
        
        # 回退到 workflow_dispatch
        # 优先使用工作流 ID，其次尝试文件名，最后使用完整路径
        if [ -n "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
            WORKFLOW_IDENTIFIER="$WORKFLOW_ID"
            log_info "使用工作流 ID 触发: $WORKFLOW_IDENTIFIER"
        else
            WORKFLOW_IDENTIFIER="$WORKFLOW_FILE"
            log_info "尝试使用文件名触发: $WORKFLOW_IDENTIFIER"
        fi
        
        log_info "使用 workflow_dispatch 触发 $WORKFLOW_FILE 工作流..."
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
            -H "Content-Type: application/json" \
            "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_IDENTIFIER/dispatches" \
            -d "{
                \"ref\": \"develop\"
            }" 2>&1)
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
        
        # 如果使用文件名失败，尝试使用完整路径
        if [ "$HTTP_CODE" -eq 404 ] && [ "$WORKFLOW_IDENTIFIER" = "$WORKFLOW_FILE" ]; then
            log_warning "使用文件名触发失败，尝试使用完整路径..."
            WORKFLOW_IDENTIFIER="$WORKFLOW_PATH"
            log_info "使用完整路径触发: $WORKFLOW_IDENTIFIER"
            
            RESPONSE=$(curl -s -w "\n%{http_code}" \
                -X POST \
                -H "Accept: application/vnd.github+json" \
                -H "Authorization: Bearer $GITHUB_TOKEN" \
                -H "X-GitHub-Api-Version: 2022-11-28" \
                -H "Content-Type: application/json" \
                "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_IDENTIFIER/dispatches" \
                -d "{
                    \"ref\": \"develop\"
                }" 2>&1)
            
            HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
            RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
        fi
    fi
    
    if [ "$HTTP_CODE" -eq 204 ]; then
        log_success "✅ 工作流已触发 (workflow_dispatch)"
        log_info "查看工作流运行状态: https://github.com/$GITHUB_REPO/actions"
        log_info "查找 'Deploy $APP_NAME' 工作流的最新运行"
        log_info ""
        log_info "📋 部署信息:"
        log_info "  - 应用: $APP_NAME"
        log_info "  - 工作流: $WORKFLOW_FILE"
        log_info "  - 环境: production"
        log_info "  - SHA: $GIT_SHA"
        log_info "  - 分支: develop"
    else
        log_error "⚠️  触发部署工作流失败 (HTTP $HTTP_CODE)"
        if [ -n "$RESPONSE_BODY" ]; then
            log_warning "响应: $RESPONSE_BODY"
        fi
        log_info ""
        
        if [ "$HTTP_CODE" -eq 404 ]; then
            log_error "❌ 工作流未找到: $WORKFLOW_FILE 可能不在 develop 分支上"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 确保 .github/workflows/$WORKFLOW_FILE 文件存在于 develop 分支"
            log_info "  2. 检查工作流文件路径是否正确"
            log_info "  3. 确保工作流文件已提交并推送到 develop 分支"
            log_info "  4. 检查工作流文件名是否正确（应该是 deploy-${APP_NAME}.yml）"
        elif [ "$HTTP_CODE" -eq 401 ]; then
            log_error "❌ 认证失败: Token 无效或已过期"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token 是否有效: https://github.com/settings/tokens"
            log_info "  2. 如果 Token 已过期，重新生成"
            log_info "  3. 确保 Token 有 actions:write 权限"
        elif [ "$HTTP_CODE" -eq 403 ]; then
            log_error "❌ 权限不足: Token 缺少必要的权限"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 确保 Token 具有以下权限:"
            log_info "     - actions:write (触发工作流)"
            log_info "     - repo (如果仓库是私有的)"
            log_info "  2. 重新生成 Token 并设置正确的权限"
        else
            log_error "❌ 未知错误 (HTTP $HTTP_CODE)"
            log_info ""
            log_info "💡 可能的原因:"
            log_info "  - 工作流文件语法错误"
            log_info "  - 工作流文件不在 develop 分支上"
            log_info "  - GitHub API 临时问题"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 手动在 GitHub 上触发工作流测试"
            log_info "  2. 检查工作流文件: .github/workflows/deploy-only.yml"
            log_info "  3. 确保工作流文件已提交到 develop 分支"
        fi
        exit 1
    fi
    else
        log_error "⚠️  触发部署工作流失败 (HTTP $HTTP_CODE)"
        log_warning "响应: $RESPONSE_BODY"
        log_info ""
        
        if [ "$HTTP_CODE" -eq 401 ]; then
            log_error "❌ 认证失败: Token 无效或已过期"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token 是否有效: https://github.com/settings/tokens"
            log_info "  2. 如果 Token 已过期，重新生成:"
            log_info "     - 访问: https://github.com/settings/tokens/new"
            log_info "     - 选择权限: write:packages, actions:write, repo"
            log_info "  3. 设置新 Token:"
            log_info "     PowerShell: \$env:GITHUB_TOKEN=\"your_new_token\""
            log_info "     Git Bash: export GITHUB_TOKEN=\"your_new_token\""
        elif [ "$HTTP_CODE" -eq 403 ]; then
            log_error "❌ 权限不足: Token 缺少必要的权限"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token 权限: https://github.com/settings/tokens"
            log_info "  2. 确保勾选了以下权限:"
            log_info "     - ✅ write:packages (推送镜像)"
            log_info "     - ✅ actions:write (触发工作流)"
            log_info "     - ✅ repo (如果仓库是私有的)"
            log_info "  3. 如果权限不足，重新生成 Token 并选择所有需要的权限"
        elif [ "$HTTP_CODE" -eq 404 ]; then
            log_error "❌ 工作流未找到: deploy-only.yml 可能尚未被 GitHub 识别"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 等待 2-5 分钟让 GitHub 识别新工作流"
            log_info "  2. 访问: https://github.com/$GITHUB_REPO/actions 查看工作流列表"
            log_info "  3. 手动触发部署:"
            log_info "     pnpm deploy:$APP_NAME"
            log_info "  4. 或在 GitHub 网页上手动触发:"
            log_info "     https://github.com/$GITHUB_REPO/actions/workflows/deploy-only.yml"
        else
            log_error "❌ 未知错误 (HTTP $HTTP_CODE)"
            log_info ""
            log_info "💡 可能的原因:"
            log_info "  1. Token 权限不足"
            log_info "  2. 工作流文件尚未被 GitHub 识别"
            log_info "  3. 网络连接问题"
            log_info ""
            log_info "💡 解决方案:"
            log_info "  1. 检查 Token: https://github.com/settings/tokens"
            log_info "  2. 等待几分钟后重试"
            log_info "  3. 手动触发部署:"
            log_info "     pnpm deploy:$APP_NAME"
        fi
    fi
    echo ""
fi

if [ "$AUTO_DEPLOY" = false ]; then
    log_info "🚀 下一步："
    log_info "  1. 提交代码到 GitHub:"
    log_info "     git add apps/$APP_NAME/dist"
    log_info "     git commit -m \"build($APP_NAME): 构建应用\""
    log_info "     git push"
    log_info ""
    log_info "  2. GitHub Actions 将自动构建 Docker 镜像并部署"
    log_info ""
    log_info "  3. 或者使用 --auto-deploy 选项自动触发工作流（需要先提交代码）"
    echo ""
fi
