#!/bin/bash

# 触发 GitHub Actions 部署工作流
# 用于快速触发远程部署，无需重新构建

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

# 默认配置
GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# 解析参数
APPS=""
GITHUB_SHA=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --apps)
            APPS="$2"
            shift 2
            ;;
        --sha)
            GITHUB_SHA="$2"
            shift 2
            ;;
        --environment|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help|-h)
            echo "用法: $0 [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --apps <apps>          逗号分隔的应用列表 (如: logistics-app,admin-app)"
            echo "  --sha <sha>            Git commit SHA (可选，默认使用当前 HEAD)"
            echo "  --environment <env>    部署环境 (production/staging, 默认: production)"
            echo "  --help, -h             显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0 --apps logistics-app"
            echo "  $0 --apps logistics-app,admin-app"
            echo "  $0 --apps logistics-app --sha abc1234"
            echo "  $0 --apps logistics-app --environment staging"
            exit 0
            ;;
        *)
            # 如果没有指定 --apps，将参数视为应用列表
            if [ -z "$APPS" ]; then
                APPS="$1"
            else
                log_error "未知参数: $1"
                echo "使用 --help 查看帮助信息"
                exit 1
            fi
            shift
            ;;
    esac
done

# 验证 GITHUB_TOKEN（尝试多种方式获取）
if [ -z "$GITHUB_TOKEN" ]; then
    # 尝试从 Git 凭据管理器获取（Windows）
    if command -v git-credential-manager > /dev/null 2>&1; then
        GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
    fi
fi

# Windows 上尝试从注册表读取用户级环境变量（通过 PowerShell）
# 检测 Windows 环境：检查 WINDIR 或 OSTYPE，或者直接尝试 PowerShell
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
    log_info "  PowerShell (永久设置，推荐):"
    log_info "    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token_here', 'User')"
    log_info "    然后刷新环境变量: . scripts/refresh-env.ps1"
    log_info ""
    log_info "  PowerShell (当前会话，临时):"
    log_info "    \$env:GITHUB_TOKEN=\"your_token_here\""
    log_info "    然后运行: bash -c \"export GITHUB_TOKEN=\\$env:GITHUB_TOKEN; bash scripts/trigger-deploy.sh --apps system-app\""
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

# 如果没有指定应用，使用默认值（所有应用）
if [ -z "$APPS" ]; then
    APPS="system-app,admin-app,logistics-app,quality-app,production-app,engineering-app,finance-app"
    log_warning "未指定应用列表，将部署所有应用"
fi

# 如果没有指定 SHA，使用当前 HEAD
if [ -z "$GITHUB_SHA" ]; then
    GITHUB_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
fi

# 获取仓库 owner 和 repo 名称
REPO_OWNER=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 触发部署工作流"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "仓库: $GITHUB_REPO"
log_info "应用: $APPS"
log_info "环境: $ENVIRONMENT"
log_info "SHA: $GITHUB_SHA"
echo ""

# 验证 Token 是否有效
log_info "验证 GitHub Token..."
TOKEN_CHECK=$(curl -s -w "\n%{http_code}" \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    "https://api.github.com/user" 2>&1)

TOKEN_CHECK_CODE=$(echo "$TOKEN_CHECK" | tail -n1)
TOKEN_CHECK_BODY=$(echo "$TOKEN_CHECK" | sed '$d')

if [ "$TOKEN_CHECK_CODE" -ne 200 ]; then
    log_error "❌ GitHub Token 验证失败 (HTTP $TOKEN_CHECK_CODE)"
    log_warning "响应: $TOKEN_CHECK_BODY"
    log_info ""
    log_info "💡 解决方案:"
    log_info "  1. 检查 Token 是否有效: https://github.com/settings/tokens"
    log_info "  2. 确认 Token 未过期"
    log_info "  3. 重新生成 Token 并设置:"
    log_info "     PowerShell: \$env:GITHUB_TOKEN=\"your_new_token\""
    log_info "     Git Bash: export GITHUB_TOKEN=\"your_new_token\""
    log_info "  4. 确保 Token 具有以下权限:"
    log_info "     - ✅ write:packages (推送镜像)"
    log_info "     - ✅ actions:write 或 workflow (触发工作流)"
    log_info "     - ✅ repo (如果仓库是私有的)"
    exit 1
fi

log_success "✅ GitHub Token 验证通过"
echo ""

# 触发 GitHub Actions 工作流
log_info "触发部署工作流..."

# 构建请求体
PAYLOAD=$(cat <<EOF
{
  "ref": "develop",
  "inputs": {
    "apps": "$APPS",
    "environment": "$ENVIRONMENT",
    "github_sha": "$GITHUB_SHA"
  }
}
EOF
)

# 方法1: 尝试使用 repository_dispatch API（更可靠）
log_info "尝试使用 repository_dispatch 触发 deploy-only 工作流..."
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches" \
    -d "{
        \"event_type\": \"deploy-apps\",
        \"client_payload\": {
            \"apps\": \"$APPS\",
            \"environment\": \"$ENVIRONMENT\",
            \"github_sha\": \"$GITHUB_SHA\"
        }
    }" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

# 如果 repository_dispatch 失败，尝试 workflow_dispatch
if [ "$HTTP_CODE" -ne 204 ]; then
    log_warning "repository_dispatch 失败 (HTTP $HTTP_CODE)，尝试 workflow_dispatch..."
    
    # 方法2: 使用 workflow_dispatch API
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/deploy-only.yml/dispatches" \
        -d "$PAYLOAD" 2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
fi

if [ "$HTTP_CODE" -eq 204 ]; then
    log_success "✅ 部署工作流已触发"
    echo ""
    log_info "📋 部署信息:"
    log_info "  - 应用列表: $APPS"
    log_info "  - 环境: $ENVIRONMENT"
    log_info "  - Commit SHA: $GITHUB_SHA"
    echo ""
    log_info "🔗 查看工作流运行状态:"
    log_info "  https://github.com/$GITHUB_REPO/actions"
    echo ""
else
    log_error "⚠️  触发部署工作流失败 (HTTP $HTTP_CODE)"
    if [ -n "$RESPONSE_BODY" ]; then
        log_error "响应: $RESPONSE_BODY"
    fi
    echo ""
    
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
        log_info "     - ✅ actions:write 或 workflow (触发工作流)"
        log_info "     - ✅ repo (如果仓库是私有的)"
        log_info "  3. 如果权限不足，重新生成 Token 并选择所有需要的权限"
    elif [ "$HTTP_CODE" -eq 404 ]; then
        log_error "❌ 工作流未找到: deploy-only.yml 可能尚未被 GitHub 识别"
        log_info ""
        log_info "💡 解决方案:"
        log_info "  1. 等待 2-5 分钟让 GitHub 识别新工作流"
        log_info "  2. 访问: https://github.com/$GITHUB_REPO/actions 查看工作流列表"
        log_info "  3. 手动在 GitHub 网页上触发工作流:"
        log_info "     https://github.com/$GITHUB_REPO/actions/workflows/deploy-only.yml"
    fi
    echo ""
    log_info "排查建议:"
    log_info "  1. 检查 GITHUB_TOKEN 是否有效"
    log_info "  2. 确认 token 具有 'workflow' 权限"
    log_info "  3. 验证仓库名称是否正确: $GITHUB_REPO"
    log_info "  4. 检查工作流文件是否存在: .github/workflows/deploy-only.yml"
    exit 1
fi

