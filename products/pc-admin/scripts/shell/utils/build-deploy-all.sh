#!/bin/bash

# 触发 GitHub Actions 工作流：并行构建和部署所有应用到 K8s
# 使用新的工作流逻辑：每个应用独立完成构建→部署流程，互不等待

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

# 解析命令行参数
SKIP_BUILD=false
SKIP_DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --skip-build        跳过构建步骤（使用已有镜像）"
            echo "  --skip-deploy       跳过部署步骤（只构建）"
            echo "  --help, -h          显示帮助信息"
            echo ""
            echo "说明:"
            echo "  此命令会触发 GitHub Actions 工作流，并行构建和部署所有应用到 K8s"
            echo "  每个应用构建完成后立即部署，互不等待"
            echo ""
            echo "示例:"
            echo "  $0                   # 构建并部署所有应用"
            echo "  $0 --skip-build      # 只部署（使用已有镜像）"
            echo "  $0 --skip-deploy     # 只构建（不部署）"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 清理所有应用的 EPS 构建产物，确保每次重新生成
log_info "清理所有应用的 EPS 数据..."
EPS_DIRS_FOUND=false
while IFS= read -r -d '' eps_dir; do
    EPS_DIRS_FOUND=true
    rm -rf "$eps_dir"
    log_info "已删除: $eps_dir"
done < <(find apps -type d -path "*/build/eps" -print0 2>/dev/null)

if [ "$EPS_DIRS_FOUND" = false ]; then
    log_warning "未发现需要清理的 EPS 目录（apps/*/build/eps）"
fi
        
        # 获取 GITHUB_TOKEN
GITHUB_TOKEN=""
        
        # 方法1: 从环境变量获取
        if [ -n "${GITHUB_TOKEN}" ]; then
            GITHUB_TOKEN="${GITHUB_TOKEN}"
        fi
        
        # 方法2: 从 Git 凭据管理器获取
        if [ -z "$GITHUB_TOKEN" ] && command -v git-credential-manager > /dev/null 2>&1; then
            GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
        fi
        
        # 方法3: 从 Windows 用户级环境变量获取（通过 PowerShell）
        if [ -z "$GITHUB_TOKEN" ]; then
            IS_WINDOWS=false
            if [ -n "$WINDIR" ] || [ "$OS" = "Windows_NT" ] || [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ] || [ "$OSTYPE" = "win32" ]; then
                IS_WINDOWS=true
            fi
            
            if [ "$IS_WINDOWS" = "true" ] || command -v powershell.exe > /dev/null 2>&1; then
                if command -v powershell.exe > /dev/null 2>&1; then
                    PS_OUTPUT=$(powershell.exe -NoProfile -NonInteractive -Command "try { \$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\$token) { Write-Output \$token } } catch { }" 2>&1)
                    GITHUB_TOKEN=$(echo "$PS_OUTPUT" | grep -v "^PS " | grep -v "^所在位置" | grep -v "^标记" | grep -v "^CategoryInfo" | grep -v "^FullyQualifiedErrorId" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1)
                    if echo "$GITHUB_TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
                        GITHUB_TOKEN=""
                    fi
                    if [ -z "${GITHUB_TOKEN// }" ]; then
                        GITHUB_TOKEN=""
                    fi
                fi
            fi
        fi
        
        if [ -z "$GITHUB_TOKEN" ]; then
    log_error "未设置 GITHUB_TOKEN 环境变量，无法触发工作流"
    log_info "请设置 GITHUB_TOKEN 环境变量后重试"
    log_info "  Windows: 在用户环境变量中设置 GITHUB_TOKEN"
    log_info "  Linux/Mac: export GITHUB_TOKEN=your_token"
            exit 1
        fi
        
# 获取仓库信息
GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"
REPO_OWNER=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)
GIT_SHA=$(git rev-parse HEAD || echo "")

if [ -z "$GIT_SHA" ]; then
    log_error "无法获取 Git SHA，请确保在 Git 仓库中运行此命令"
    exit 1
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 触发并行构建和部署工作流"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "仓库: $GITHUB_REPO"
log_info "Git SHA: $GIT_SHA"
log_info "跳过构建: $SKIP_BUILD"
log_info "跳过部署: $SKIP_DEPLOY"
log_info ""

# 构建 client_payload
CLIENT_PAYLOAD="{"
CLIENT_PAYLOAD+="\"github_sha\":\"$GIT_SHA\""
if [ "$SKIP_BUILD" = "true" ]; then
    CLIENT_PAYLOAD+=",\"skip_build\":true"
fi
if [ "$SKIP_DEPLOY" = "true" ]; then
    CLIENT_PAYLOAD+=",\"skip_deploy\":true"
fi
CLIENT_PAYLOAD+="}"

# 触发工作流
log_info "正在触发工作流: build-deploy-all-apps.yml"
REPO_DISPATCH_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X POST \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GITHUB_TOKEN" \
            -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches" \
    -d "{
        \"event_type\": \"build-deploy-all-apps\",
        \"client_payload\": $CLIENT_PAYLOAD
    }" 2>&1)
        
REPO_DISPATCH_HTTP_CODE=$(echo "$REPO_DISPATCH_RESPONSE" | tail -n1)
REPO_DISPATCH_BODY=$(echo "$REPO_DISPATCH_RESPONSE" | sed '$d')
        
        if [ "$REPO_DISPATCH_HTTP_CODE" -eq 204 ]; then
    log_success "✅ 工作流已触发 (HTTP 204)"
    log_info ""
    log_info "可以在 GitHub Actions 页面查看进度:"
    log_info "  https://github.com/$GITHUB_REPO/actions/workflows/build-deploy-all-apps.yml"
    log_info ""
    log_info "工作流将并行构建和部署所有应用："
    log_info "  - system-app"
    log_info "  - admin-app"
    log_info "  - logistics-app"
    log_info "  - quality-app"
    log_info "  - production-app"
    log_info "  - engineering-app"
    log_info "  - finance-app"
    log_info ""
    log_warning "注意：以下应用未包含在并行工作流中："
    log_info "  - operations-app（需要添加到工作流）"
    log_info "  - dashboard-app（需要添加到工作流）"
    log_info "  - personnel-app（需要添加到工作流）"
    log_info "  - layout-app（使用静态文件部署）"
    log_info "  - docs-app（文档站点，静态部署）"
            log_info ""
    log_info "每个应用构建完成后立即部署，互不等待"
            exit 0
        else
    log_error "❌ 工作流触发失败 (HTTP $REPO_DISPATCH_HTTP_CODE)"
            if [ -n "$REPO_DISPATCH_BODY" ]; then
                log_error "响应: $REPO_DISPATCH_BODY"
            fi
            log_info ""
    
    # 根据不同的 HTTP 状态码提供具体的错误信息
    if [ "$REPO_DISPATCH_HTTP_CODE" -eq 404 ]; then
        log_error "🔴 工作流文件未找到"
        log_info "可能原因:"
        log_info "  1. 工作流文件尚未提交到 GitHub"
        log_info "  2. 工作流文件路径不正确"
        log_info "  3. 工作流文件尚未被 GitHub Actions 识别"
    log_info ""
        log_info "💡 解决方案:"
        log_info "  1. 确保工作流文件已提交并推送到 GitHub"
        log_info "  2. 等待几分钟让 GitHub Actions 识别新工作流"
        log_info "  3. 检查文件路径: .github/workflows/build-deploy-all-apps.yml"
    elif [ "$REPO_DISPATCH_HTTP_CODE" -eq 422 ]; then
        log_error "🔴 请求参数无效"
        log_info "可能原因:"
        log_info "  1. event_type 格式不正确"
        log_info "  2. client_payload 格式错误"
        log_info "  3. 工作流未配置 repository_dispatch 触发器"
    log_info ""
        log_info "💡 解决方案:"
        log_info "  1. 检查工作流文件是否配置了 repository_dispatch:"
        log_info "     .github/workflows/build-deploy-all-apps.yml"
        log_info "  2. 确保工作流中的 event_type 与脚本中的一致:"
        log_info "     脚本使用: build-deploy-all-apps"
        log_info "     工作流应监听: types: [build-deploy-all-apps]"
        log_info "  3. 检查工作流文件语法是否正确"
    elif [ "$REPO_DISPATCH_HTTP_CODE" -eq 401 ]; then
        log_error "🔴 认证失败"
        log_info "可能原因:"
        log_info "  1. GITHUB_TOKEN 无效或已过期"
        log_info "  2. Token 权限不足"
        log_info ""
        log_info "💡 解决方案:"
        log_info "  1. 检查 GITHUB_TOKEN 是否正确设置"
        log_info "  2. 确保 Token 有 actions:write 权限"
        log_info "  3. 重新生成 Token 并更新环境变量"
    else
        log_error "🔴 未知错误 [HTTP ${REPO_DISPATCH_HTTP_CODE}]"
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
    log_info "  - 仓库所有者: $REPO_OWNER"
    log_info "  - 仓库名称: $REPO_NAME"
    log_info "  - 事件类型: build-deploy-all-apps"
    log_info "  - 工作流文件: build-deploy-all-apps.yml"
    log_info "  - HTTP 状态码: $REPO_DISPATCH_HTTP_CODE"
    log_info "  - Git SHA: $GIT_SHA"
    
            exit 1
        fi
