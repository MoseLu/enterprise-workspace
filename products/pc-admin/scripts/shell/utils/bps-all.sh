#!/bin/bash

# BTC ShopFlow - 简化静态部署脚本
# 
# 本地模式：只构建，然后触发 GitHub Actions 工作流进行部署
# GitHub Actions 模式：构建并部署（如果跳过构建则只部署）
#
# 用法:
#   bps-all.sh [选项]
#
# 选项:
#   --skip-build    跳过构建步骤，直接使用已有的构建产物（仅 GitHub Actions 模式）
#   --help          显示帮助信息
#
# 本地使用：
#   只需要配置 GITHUB_TOKEN 环境变量
#   export GITHUB_TOKEN=your-github-token
#
# GitHub Actions 配置：
#   通过 Secrets 配置服务器信息

set -e

# 检查是否为 GitHub Actions 环境
is_github_actions() {
    [ -n "$GITHUB_ACTIONS" ]
}

# 解析命令行参数
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help|-h)
            cat << EOF
BTC ShopFlow 简化部署脚本

用法:
  $0 [选项]

选项:
  --skip-build    跳过构建步骤，直接使用已有的构建产物
  --help, -h      显示此帮助信息

示例:
  $0                 # 构建并部署所有应用
  $0 --skip-build    # 仅部署（跳过构建）

EOF
            exit 0
            ;;
        *)
            echo "错误: 未知参数: $1" >&2
            echo "使用 --help 查看帮助信息" >&2
            exit 1
            ;;
    esac
done

# 只在非 GitHub Actions 环境尝试加载本地配置文件
if ! is_github_actions && [ -f "$(dirname "${BASH_SOURCE[0]}")/deploy-config.sh" ]; then
    source "$(dirname "${BASH_SOURCE[0]}")/deploy-config.sh"
fi

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

# 服务器配置（只在 GitHub Actions 环境中使用）
# 本地环境中这些变量不会被使用，因为本地只构建和触发工作流
SERVER_HOST="${SERVER_HOST:-}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PASSWORD="${SERVER_PASSWORD:-}"
SERVER_PORT="${SERVER_PORT:-22}"
REMOTE_BASE_PATH="${REMOTE_BASE_PATH:-/www/wwwroot}"

# GitHub 配置（本地使用）
GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"

# SSH 连接选项（防止超时）
SSH_OPTS="-o StrictHostKeyChecking=no"
SSH_OPTS="$SSH_OPTS -o UserKnownHostsFile=/dev/null"
SSH_OPTS="$SSH_OPTS -o ConnectTimeout=30"
SSH_OPTS="$SSH_OPTS -o ServerAliveInterval=60"
SSH_OPTS="$SSH_OPTS -o ServerAliveCountMax=3"
SSH_OPTS="$SSH_OPTS -o TCPKeepAlive=yes"
SSH_OPTS="$SSH_OPTS -o BatchMode=no"
if [ -n "$SERVER_PORT" ] && [ "$SERVER_PORT" != "22" ]; then
    SSH_OPTS="$SSH_OPTS -p $SERVER_PORT"
fi

# 应用列表及其部署路径映射
declare -A APP_PATHS=(
    ["system-app"]="/www/wwwroot/bellis.com.cn"
    ["admin-app"]="/www/wwwroot/admin.bellis.com.cn"
    ["logistics-app"]="/www/wwwroot/logistics.bellis.com.cn"
    ["quality-app"]="/www/wwwroot/quality.bellis.com.cn"
    ["production-app"]="/www/wwwroot/production.bellis.com.cn"
    ["engineering-app"]="/www/wwwroot/engineering.bellis.com.cn"
    ["finance-app"]="/www/wwwroot/finance.bellis.com.cn"
    ["layout-app"]="/www/wwwroot/layout.bellis.com.cn"
)

# 应用列表（按构建顺序）
APPS=(
    "system-app"
    "admin-app"
    "finance-app"
    "logistics-app"
    "quality-app"
    "production-app"
    "engineering-app"
    "layout-app"
)

# 检查是否为 GitHub Actions 环境
is_github_actions() {
    [ -n "$GITHUB_ACTIONS" ]
}

# 检查必需工具
check_requirements() {
    log_info "检查必需工具..."
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装，请先安装 pnpm"
        exit 1
    fi
    
    # 如果是在 GitHub Actions 环境中，需要 sshpass 和 scp
    if is_github_actions; then
        if ! command -v sshpass &> /dev/null; then
            log_error "sshpass 未安装，无法自动输入密码"
            exit 1
        fi
        
        if ! command -v scp &> /dev/null; then
            log_error "scp 未安装，请先安装 SSH 客户端"
            exit 1
        fi
        
        # 验证密码是否已配置
        if [ -z "$SERVER_PASSWORD" ]; then
            log_error "SERVER_PASSWORD 未设置"
            log_info "请在 GitHub Secrets 中配置 SERVER_PASSWORD"
            exit 1
        fi
        
        USE_SSHPASS=true
        log_success "GitHub Actions 环境：工具检查完成"
    else
        # 本地环境：只需要 pnpm，不需要 SSH 工具
        log_success "本地环境：工具检查完成"
        log_info "本地只进行构建，部署将由 GitHub Actions 工作流处理"
    fi
    
    log_success "工具检查完成"
}

# SSH 执行命令（使用 sshpass 自动输入密码，带重试机制）
ssh_exec() {
    local cmd="$1"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        # 使用 sshpass 自动输入密码，隐藏密码输出
        if sshpass -p "$SERVER_PASSWORD" ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "$cmd" 2>/dev/null; then
            return 0
        fi
        
        # 如果失败，显示详细错误（但不显示密码）
        local exit_code=$?
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            log_warning "SSH 命令执行失败 (退出码: $exit_code)，${retry_count}/${max_retries} 次重试..."
            sleep 2
        else
            log_error "SSH 命令执行失败，已重试 ${max_retries} 次"
            # 最后一次尝试，显示错误信息
            sshpass -p "$SERVER_PASSWORD" ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "$cmd" || true
        fi
    done
    
    return 1
}

# SCP 上传文件（使用 sshpass 自动输入密码，带重试机制）
scp_upload() {
    local local_path="$1"
    local remote_path="$2"
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        # 使用 sshpass 自动输入密码
        if sshpass -p "$SERVER_PASSWORD" scp $SSH_OPTS -r "$local_path" "$SERVER_USER@$SERVER_HOST:$remote_path" 2>/dev/null; then
            return 0
        fi
        
        local exit_code=$?
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            log_warning "SCP 上传失败 (退出码: $exit_code)，${retry_count}/${max_retries} 次重试..."
            sleep 2
        else
            log_error "SCP 上传失败，已重试 ${max_retries} 次"
            # 最后一次尝试，显示错误信息
            sshpass -p "$SERVER_PASSWORD" scp $SSH_OPTS -r "$local_path" "$SERVER_USER@$SERVER_HOST:$remote_path" || true
        fi
    done
    
    return 1
}

# 步骤 1: 构建所有应用
build_all_apps() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "步骤 1: 构建所有应用"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 先构建 main-app 生成 EPS 数据
    log_info "构建 main-app（生成 EPS 数据）..."
    pnpm build:main || {
        log_error "main-app 构建失败"
        exit 1
    }
    
    # 复制 EPS 数据到其他应用
    log_info "复制 EPS 数据到其他应用..."
    node scripts/copy-eps-from-system.mjs || {
        log_error "EPS 数据复制失败"
        exit 1
    }
    
    # 构建所有应用
    log_info "构建所有应用..."
    pnpm build:all || {
        log_error "应用构建失败"
        exit 1
    }
    
    log_success "所有应用构建完成"
}

# 步骤 2: 删除服务器上的所有内容
clean_remote_server() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "步骤 2: 清理服务器部署目录"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    log_info "删除 $REMOTE_BASE_PATH 下的所有内容..."
    ssh_exec "rm -rf $REMOTE_BASE_PATH/*" || {
        log_error "清理服务器目录失败"
        exit 1
    }
    
    log_success "服务器目录清理完成"
}

# 步骤 3: 上传所有应用
upload_all_apps() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "步骤 3: 上传所有应用"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    local project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
    
    for app in "${APPS[@]}"; do
        local dist_path="$project_root/apps/$app/dist"
        local remote_path="${APP_PATHS[$app]}"
        
        if [ ! -d "$dist_path" ]; then
            log_warning "$app: dist 目录不存在，跳过"
            continue
        fi
        
        if [ -z "$remote_path" ]; then
            log_warning "$app: 未配置部署路径，跳过"
            continue
        fi
        
        log_info "上传 $app 到 $remote_path..."
        
        # 创建远程临时目录
        local temp_remote_path="${remote_path}.tmp"
        ssh_exec "rm -rf $temp_remote_path && mkdir -p $temp_remote_path" || {
            log_error "$app: 创建临时目录失败"
            continue
        }
        
        # 上传整个 dist 目录到临时位置
        scp_upload "$dist_path" "$temp_remote_path/" || {
            log_error "$app: 上传失败"
            ssh_exec "rm -rf $temp_remote_path" || true
            continue
        }
        
        # 移动文件到目标位置并清理
        ssh_exec "rm -rf $remote_path && mkdir -p $remote_path && mv $temp_remote_path/dist/* $remote_path/ && rm -rf $temp_remote_path" || {
            log_error "$app: 移动文件失败"
            ssh_exec "rm -rf $temp_remote_path" || true
            continue
        }
        
        log_success "$app: 上传完成"
    done
    
    log_success "所有应用上传完成"
}

# 步骤 4: 重启 Nginx
restart_nginx() {
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "步骤 4: 重启 Nginx"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    log_info "重启 Nginx 服务..."
    ssh_exec "systemctl restart nginx || service nginx restart || /etc/init.d/nginx restart" || {
        log_warning "Nginx 重启失败，请手动检查"
    }
    
    log_success "Nginx 重启完成"
}

# 触发 GitHub Actions 工作流
trigger_github_workflow() {
    if [ -z "$GITHUB_TOKEN" ]; then
        log_error "GITHUB_TOKEN 未设置，无法触发 GitHub Actions 工作流"
        log_info ""
        log_info "请设置环境变量："
        log_info "  export GITHUB_TOKEN=your-github-token"
        log_info "获取 Token: https://github.com/settings/tokens"
        log_info "Token 需要 'repo' 权限"
        return 1
    fi
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 触发 GitHub Actions 工作流"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 解析仓库信息
    REPO_OWNER=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
    REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)
    
    # 获取当前 Git SHA 和分支
    GIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "")
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    
    log_info "仓库: $GITHUB_REPO"
    log_info "分支: $GIT_BRANCH"
    log_info "提交: ${GIT_SHA:0:7}"
    log_info "工作流: Deploy with BPS All"
    log_info ""
    log_info "💡 提示: 工作流将在 GitHub Actions 中重新构建并部署"
    log_info "（本地构建产物不会上传，工作流会使用相同代码重新构建）"
    log_info ""
    log_info "发送请求到 GitHub..."
    
    # 使用 workflow_dispatch 触发工作流（不跳过构建，让工作流自己构建）
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/workflows/deploy-bps-all.yml/dispatches" \
        -d "{
            \"ref\": \"$GIT_BRANCH\",
            \"inputs\": {
                \"skip_build\": \"false\"
            }
        }" 2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 204 ]; then
        log_success "✅ GitHub Actions 工作流已触发"
        log_info ""
        log_info "📋 查看工作流状态:"
        log_info "   https://github.com/$REPO_OWNER/$REPO_NAME/actions/workflows/deploy-bps-all.yml"
        log_info ""
        log_info "💡 工作流将:"
        log_info "   1. 检出代码"
        log_info "   2. 构建所有应用"
        log_info "   3. 部署到服务器"
        return 0
    else
        log_error "❌ 触发工作流失败 (HTTP $HTTP_CODE)"
        if [ -n "$RESPONSE_BODY" ]; then
            log_warning "响应内容: $RESPONSE_BODY"
        fi
        
        if [ "$HTTP_CODE" -eq 401 ]; then
            log_error "🔴 GitHub Token 认证失败"
            log_info "请检查 GITHUB_TOKEN 是否正确，并确保有 'repo' 权限"
        elif [ "$HTTP_CODE" -eq 404 ]; then
            log_error "🔴 仓库或工作流不存在"
            log_info "请检查 GITHUB_REPO 和工作流文件路径"
        fi
        return 1
    fi
}

# 主函数
main() {
    log_info "🚀 BTC ShopFlow 简化部署脚本"
    
    # 检查项目目录
    if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
        log_error "请在项目根目录执行此脚本"
        exit 1
    fi
    
    check_requirements
    
    # 判断运行模式
    if is_github_actions; then
        # GitHub Actions 模式：执行部署
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "🌐 GitHub Actions 模式：执行部署"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
        log_info ""
        
        # 只在未指定跳过构建时执行构建
        if [ "$SKIP_BUILD" = false ]; then
            build_all_apps
        else
            log_info "⏭️  跳过构建步骤，使用已有构建产物"
            
            # 验证构建产物是否存在
            local project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
            local missing_builds=0
            for app in "${APPS[@]}"; do
                local dist_path="$project_root/apps/$app/dist"
                if [ ! -d "$dist_path" ]; then
                    log_warning "$app: dist 目录不存在"
                    missing_builds=$((missing_builds + 1))
                fi
            done
            
            if [ $missing_builds -gt 0 ]; then
                log_error "有 $missing_builds 个应用的构建产物不存在"
                exit 1
            fi
            
            log_success "所有构建产物验证通过"
        fi
        
        # 执行部署
        clean_remote_server
        upload_all_apps
        restart_nginx
        
        log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_success "✅ 部署完成！"
        log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        # 本地模式：只构建，然后触发工作流
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info "💻 本地模式：构建并触发 GitHub Actions 工作流"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info ""
        log_info "本地将只进行构建，部署由 GitHub Actions 工作流处理"
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # 执行构建
        if [ "$SKIP_BUILD" = false ]; then
            build_all_apps
        else
            log_info "⏭️  跳过构建步骤，直接触发工作流"
            
            # 验证构建产物是否存在
            local project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
            local missing_builds=0
            for app in "${APPS[@]}"; do
                local dist_path="$project_root/apps/$app/dist"
                if [ ! -d "$dist_path" ]; then
                    log_warning "$app: dist 目录不存在"
                    missing_builds=$((missing_builds + 1))
                fi
            done
            
            if [ $missing_builds -gt 0 ]; then
                log_error "有 $missing_builds 个应用的构建产物不存在"
                log_info "请先执行构建，或移除 --skip-build 选项"
                exit 1
            fi
        fi
        
        # 触发 GitHub Actions 工作流
        log_info ""
        log_info "本地构建已完成，现在触发 GitHub Actions 工作流进行部署..."
        if trigger_github_workflow; then
            log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_success "✅ 本地构建完成，工作流已触发！"
            log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info ""
            log_info "📝 注意: 工作流将在 GitHub Actions 中重新构建并部署"
            log_info "请在上面的链接中查看部署进度"
        else
            log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_error "❌ 工作流触发失败"
            log_error "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            exit 1
        fi
    fi
}

# 执行主函数
main "$@"

