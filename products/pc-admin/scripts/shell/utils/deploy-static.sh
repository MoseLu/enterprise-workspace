#!/bin/bash

# BTC ShopFlow - 静态文件部署脚本
# 将构建好的 dist 目录直接部署到宝塔面板服务器，无需 Docker
# 支持单应用或批量部署

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

# 配置（从环境变量或参数读取）
SERVER_HOST="${SERVER_HOST:-}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
DEPLOY_CONFIG="${DEPLOY_CONFIG:-deploy.config.json}"
GITHUB_REPO="${GITHUB_REPO:-BellisGit/btc-shopflow-monorepo}"

# 自动获取 GITHUB_TOKEN（参考 build-and-push-local.sh 的逻辑）
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
if [ -z "$GITHUB_TOKEN" ]; then
    # 尝试从 git credential 获取
    if command -v git-credential-manager > /dev/null 2>&1; then
        GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep "^password=" | cut -d'=' -f2 | tr -d '\r\n' || echo "")
    fi
    
    # 尝试从 Windows 环境变量获取（PowerShell）
    if [ -z "$GITHUB_TOKEN" ] && command -v powershell.exe > /dev/null 2>&1; then
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

# 应用列表
APPS=(
    "system-app"
    "admin-app"
    "dashboard-app"
    "engineering-app"
    "finance-app"
    "logistics-app"
    "operations-app"
    "personnel-app"
    "production-app"
    "quality-app"
    "layout-app"
)

# 显示帮助信息
show_help() {
    cat << EOF
BTC ShopFlow 静态文件部署脚本

用法:
  $0 [选项]

选项:
  --app <name>      部署指定应用（如: admin-app）
  --all             部署所有应用
  --config <file>   指定部署配置文件（默认: deploy.config.json）
  --help            显示此帮助信息

示例:
  $0 --app admin-app
  $0 --all
  $0 --app system-app --config custom.config.json

环境变量:
  SERVER_HOST       服务器地址（必需，GitHub Actions 会自动设置）
  SERVER_USER       服务器用户名（默认: root，GitHub Actions 会自动设置）
  SERVER_PORT       SSH 端口（默认: 22，GitHub Actions 会自动设置）
  SSH_KEY           SSH 私钥路径（默认: ~/.ssh/id_rsa，GitHub Actions 会自动设置）

EOF
}

# 解析参数
DEPLOY_MODE=""
TARGET_APP=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --app)
            DEPLOY_MODE="single"
            TARGET_APP="$2"
            shift 2
            ;;
        --all)
            DEPLOY_MODE="all"
            shift
            ;;
        --config)
            DEPLOY_CONFIG="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查必需工具
check_requirements() {
    log_info "检查必需工具..."
    
    if ! command -v rsync &> /dev/null && ! command -v scp &> /dev/null; then
        log_error "需要安装 rsync 或 scp"
        exit 1
    fi
    
    if ! command -v ssh &> /dev/null; then
        log_error "SSH 未安装，请先安装 SSH 客户端"
        exit 1
    fi
    
    log_success "所有必需工具已就绪"
}

# 检查服务器配置
check_server_config() {
    # 如果在 GitHub Actions 环境中，必须配置服务器信息
    if [ -n "$GITHUB_ACTIONS" ]; then
        if [ -z "$SERVER_HOST" ]; then
            log_error "在 GitHub Actions 中，SERVER_HOST 必须从 secrets 设置"
            exit 1
        fi
    else
        # 本地环境：如果没有配置服务器信息，只验证构建产物，不执行部署
        if [ -z "$SERVER_HOST" ]; then
            log_warning "SERVER_HOST 未设置，将只验证构建产物，不执行部署"
            log_info "如需部署，请在 GitHub Actions 中运行，或设置环境变量："
            log_info "  export SERVER_HOST=your-server-ip"
            log_info "  export SERVER_USER=root"
            log_info "  export SERVER_PORT=22"
            log_info "  export SSH_KEY=~/.ssh/id_rsa"
            return 1
        fi
    fi
    
    log_info "服务器配置: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
    
    # 测试 SSH 连接
    log_info "测试 SSH 连接..."
    if ssh -i "$SSH_KEY" -p "$SERVER_PORT" -o ConnectTimeout=5 -o StrictHostKeyChecking=no \
        "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'" &>/dev/null; then
        log_success "SSH 连接成功"
    else
        log_error "SSH 连接失败，请检查服务器配置和 SSH 密钥"
        exit 1
    fi
}

# 读取部署配置
read_deploy_config() {
    if [ ! -f "$DEPLOY_CONFIG" ]; then
        log_warning "部署配置文件不存在: $DEPLOY_CONFIG"
        log_info "将使用默认部署路径（基于应用名称）"
        log_info "如需自定义路径，请创建配置文件，参考: deploy.config.example.json"
        return 1
    fi
    
    # 检查 jq 是否可用（用于解析 JSON）
    if command -v jq &> /dev/null; then
        log_info "使用 jq 解析配置文件: $DEPLOY_CONFIG"
        return 0
    else
        log_warning "jq 未安装，将使用默认部署路径"
        return 1
    fi
}

# 获取应用的部署路径
get_app_deploy_path() {
    local app_name=$1
    
    if command -v jq &> /dev/null && [ -f "$DEPLOY_CONFIG" ]; then
        local path=$(jq -r ".apps.\"$app_name\".deployPath // empty" "$DEPLOY_CONFIG" 2>/dev/null)
        if [ -n "$path" ] && [ "$path" != "null" ]; then
            echo "$path"
            return 0
        fi
    fi
    
    # 默认路径（基于应用名称）
    # 注意：子应用直接部署到各自的子域目录根路径
    case $app_name in
        system-app)
            echo "/www/wwwroot/bellis.com.cn"
            ;;
        admin-app)
            echo "/www/wwwroot/admin.bellis.com.cn"
            ;;
        logistics-app)
            echo "/www/wwwroot/logistics.bellis.com.cn"
            ;;
        quality-app)
            echo "/www/wwwroot/quality.bellis.com.cn"
            ;;
        production-app)
            echo "/www/wwwroot/production.bellis.com.cn"
            ;;
        engineering-app)
            echo "/www/wwwroot/engineering.bellis.com.cn"
            ;;
        finance-app)
            echo "/www/wwwroot/finance.bellis.com.cn"
            ;;
        layout-app)
            echo "/www/wwwroot/layout.bellis.com.cn"
            ;;
        *)
            log_warning "未知应用: $app_name，使用默认路径"
            echo "/www/wwwroot/$app_name"
            ;;
    esac
}

# 验证构建产物（不执行部署）
verify_app_build() {
    local app_name=$1
    local app_dir="apps/$app_name"
    local dist_dir="$app_dir/dist"
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "验证应用: $app_name"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检查 dist 目录是否存在
    if [ ! -d "$dist_dir" ] || [ -z "$(ls -A "$dist_dir" 2>/dev/null)" ]; then
        log_error "$app_name 的 dist 目录不存在或为空"
        log_info "请先运行: pnpm --filter $app_name build"
        return 1
    fi
    
    log_info "构建产物目录: $dist_dir"
    log_info "文件统计:"
    find "$dist_dir" -type f | wc -l | xargs echo "  总文件数:"
    du -sh "$dist_dir" | awk '{print "  总大小: " $1}'
    log_success "$app_name 构建产物验证通过"
    return 0
}

# 部署单个应用
deploy_app() {
    local app_name=$1
    local app_dir="apps/$app_name"
    local dist_dir="$app_dir/dist"
    local deploy_base=$(get_app_deploy_path "$app_name")
    local release_name=""
    local git_short_sha=""
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "部署应用: $app_name"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 检查 dist 目录是否存在
    if [ ! -d "$dist_dir" ] || [ -z "$(ls -A "$dist_dir" 2>/dev/null)" ]; then
        log_error "$app_name 的 dist 目录不存在或为空"
        log_info "请先运行: pnpm --filter $app_name build"
        return 1
    fi
    
    log_info "构建产物目录: $dist_dir"
    log_info "部署目标路径: $deploy_base"
    log_info "部署模式: releases/current（原子切换，避免生产环境出现 assets 404 窗口）"
    
    # 检查并复制 EPS 数据到 dist 目录（如果存在）
    local eps_dir="$app_dir/build/eps"
    if [ -d "$eps_dir" ] && [ -n "$(ls -A "$eps_dir" 2>/dev/null)" ]; then
        log_info "发现 EPS 数据，复制到 dist 目录..."
        mkdir -p "$dist_dir/build/eps"
        cp -r "$eps_dir"/* "$dist_dir/build/eps/" 2>/dev/null || {
            log_warning "EPS 数据复制失败，继续部署"
        }
        log_success "EPS 数据已复制到构建产物"
    else
        log_warning "未找到 EPS 数据目录，跳过"
    fi
    
    # SSH 连接参数（优化连接稳定性）
    # 增加超时时间和重试机制，避免大文件传输时连接中断
    local ssh_opts="-i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=30 -o ServerAliveCountMax=10 -o TCPKeepAlive=yes -o Compression=yes"
    
    # 生成 release 名称（时间戳 + git 短 SHA，可选）
    git_short_sha=$(git rev-parse --short HEAD 2>/dev/null || echo "")
    if [ -n "$git_short_sha" ]; then
        release_name="$(date +%Y%m%d_%H%M%S)-$git_short_sha"
    else
        release_name="$(date +%Y%m%d_%H%M%S)"
    fi
    local remote_release_dir="$deploy_base/releases/$release_name"

    # 预备 releases/current 结构（如果服务器尚未迁移，自动初始化一次）
    log_info "确保 releases/current 结构存在（必要时自动初始化）..."
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "bash -lc '
        set -e
        mkdir -p \"$deploy_base\"
        mkdir -p \"$deploy_base/releases\"

        if [ ! -L \"$deploy_base/current\" ]; then
          ts=\"init-$(date +%Y%m%d_%H%M%S)\"
          mkdir -p \"$deploy_base/releases/$ts\"
          # 将现有文件迁移到 init release（排除 releases/current）
          shopt -s dotglob nullglob
          for item in \"$deploy_base\"/*; do
            base=\$(basename \"\$item\")
            if [ \"\$base\" != \"releases\" ] && [ \"\$base\" != \"current\" ]; then
              mv \"\$item\" \"$deploy_base/releases/$ts/\" 2>/dev/null || true
            fi
          done
          ln -sfn \"releases/$ts\" \"$deploy_base/current\"
        fi
      '" || {
      log_error "无法准备 releases/current 结构: $deploy_base"
        return 1
    }
    
    # 创建新的 release 目录
    log_info "创建 release: $remote_release_dir"
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "mkdir -p \"$remote_release_dir\"" || {
      log_error "无法创建 release 目录: $remote_release_dir"
      return 1
    }
    
    # 检查服务器上是否有 rsync（更可靠的方法）
    local use_rsync=false
    if command -v rsync &> /dev/null; then
        # 检查服务器上是否也有 rsync
        if ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "command -v rsync" &>/dev/null; then
            use_rsync=true
        fi
    fi
    
    # 同步文件到 release 目录（先上传完毕，再切换 current，避免中途 404）
    if [ "$use_rsync" = true ]; then
        log_info "使用 rsync 同步文件到 release 目录..."
        if rsync -avz --delete \
            -e "ssh $ssh_opts" \
            --exclude='*.map' \
            --exclude='.DS_Store' \
            --exclude='releases' \
            --exclude='current' \
            --timeout=300 \
            "$dist_dir/" \
            "$SERVER_USER@$SERVER_HOST:$remote_release_dir/"; then
            log_success "文件同步成功"
        else
            log_error "rsync 同步失败，尝试使用 scp..."
            use_rsync=false
        fi
    fi
    
    if [ "$use_rsync" = false ]; then
        # 使用 tar+ssh 上传（较慢，但兼容性更好）
        # 添加重试机制，最多重试 3 次
        log_info "打包并上传文件到 release 目录..."
        local retry_count=0
        local max_retries=3
        local upload_success=false
        
        while [ $retry_count -lt $max_retries ]; do
            if [ $retry_count -gt 0 ]; then
                log_warning "第 $retry_count 次重试上传..."
                sleep 2
            fi
            
            # 保存当前目录
            local original_dir=$(pwd)
            
            if cd "$dist_dir" && tar czf - . | ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
                "cd \"$remote_release_dir\" && tar xzf -" 2>&1; then
                upload_success=true
                cd "$original_dir" > /dev/null
                break
            else
                retry_count=$((retry_count + 1))
                log_warning "上传失败，已重试 $retry_count/$max_retries 次"
                # 确保返回原目录
                cd "$original_dir" > /dev/null 2>&1 || true
            fi
        done
        
        if [ "$upload_success" = false ]; then
            log_error "文件上传失败（已重试 $max_retries 次）"
            return 1
        fi
    fi
    
    # 验证 release 目录关键文件存在（避免切换后白屏）
    log_info "验证 release 产物完整性..."
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "bash -lc '
      set -e
      test -f \"$remote_release_dir/index.html\"
      # layout-app 必须有 assets/layout（共享资源）
      if [ \"$app_name\" = \"layout-app\" ]; then
        test -d \"$remote_release_dir/assets/layout\"
      else
        test -d \"$remote_release_dir/assets\"
      fi
    '" || {
      log_error "release 验证失败：关键文件缺失（不会切换 current）"
      return 1
    }

    # 原子切换 current
    log_info "切换 current -> releases/$release_name"
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "bash -lc '
      set -e
      cd \"$deploy_base\"
      ln -sfn \"releases/$release_name\" current
    '" || {
      log_error "切换 current 失败"
      return 1
    }
    
    # 设置权限
    log_info "设置文件权限..."
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
        "chown -R www:www \"$deploy_base/releases/$release_name\" 2>/dev/null || true; \
         chown -h www:www \"$deploy_base/current\" 2>/dev/null || true; \
         find \"$deploy_base/releases/$release_name\" -type d -exec chmod 755 {} \; 2>/dev/null || true; \
         find \"$deploy_base/releases/$release_name\" -type f -exec chmod 644 {} \; 2>/dev/null || true" || {
        log_warning "权限设置失败，但不影响部署"
    }
    
    log_success "$app_name 部署完成 -> $deploy_base/current (release: $release_name)"
    
    # 单个应用部署时立即重载 Nginx
    # 批量部署时将在所有应用完成后统一重载（避免多次重载）
    if [ "$DEPLOY_MODE" != "all" ]; then
        log_info "重载 Nginx 配置..."
        ssh -i "$SSH_KEY" -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
            "nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true" || {
            log_warning "Nginx 重载失败，但不影响部署结果"
        }
    fi
    
    return 0
}

# 触发 GitHub Actions 工作流
trigger_github_workflow() {
    local app_input="$1"
    
    if [ -z "$GITHUB_TOKEN" ]; then
        log_warning "GITHUB_TOKEN 未设置，无法触发 GitHub Actions 工作流"
        log_info "如需触发工作流，请设置环境变量："
        log_info "  export GITHUB_TOKEN=your-github-token"
        log_info "获取 Token: https://github.com/settings/tokens"
        return 1
    fi
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 触发 GitHub Actions 工作流"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "应用: $app_input"
    log_info "工作流: Deploy Static Files"
    log_info ""
    
    # 解析仓库信息
    REPO_OWNER=$(echo "$GITHUB_REPO" | cut -d'/' -f1)
    REPO_NAME=$(echo "$GITHUB_REPO" | cut -d'/' -f2)
    
    # 获取当前 Git SHA
    GIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "")
    
    log_info "发送 repository_dispatch 请求到 GitHub..."
    
    # 构建 payload
    local payload_app="$app_input"
    if [ "$app_input" = "all" ]; then
        payload_app="all"
    fi
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GITHUB_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        -H "Content-Type: application/json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/dispatches" \
        -d "{
            \"event_type\": \"deploy-static\",
            \"client_payload\": {
                \"app\": \"$payload_app\",
                \"skip_build\": \"false\",
                \"github_sha\": \"$GIT_SHA\"
            }
        }" 2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 204 ]; then
        log_success "✅ GitHub Actions 工作流已触发"
        log_info ""
        log_info "📋 查看工作流状态:"
        log_info "   https://github.com/$REPO_OWNER/$REPO_NAME/actions/workflows/deploy-static.yml"
        return 0
    else
        log_error "❌ 触发工作流失败 (HTTP $HTTP_CODE)"
        if [ -n "$RESPONSE_BODY" ]; then
            log_warning "响应内容: $RESPONSE_BODY"
        fi
        
        if [ "$HTTP_CODE" -eq 401 ]; then
            log_error "🔴 GitHub Token 认证失败"
            log_info "请检查 GITHUB_TOKEN 是否正确"
        elif [ "$HTTP_CODE" -eq 404 ]; then
            log_error "🔴 仓库或工作流不存在"
            log_info "请检查 GITHUB_REPO 和工作流文件路径"
        fi
        return 1
    fi
}

# 主函数
main() {
    log_info "🚀 BTC ShopFlow 静态文件部署"
    echo "================================"
    
    # 检查项目目录
    if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
        log_error "请在项目根目录执行此脚本"
        exit 1
    fi
    
    check_requirements
    
    # 检查服务器配置（如果失败，进入验证模式或触发工作流）
    local can_deploy=true
    if ! check_server_config; then
        can_deploy=false
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        # 如果提供了 GITHUB_TOKEN，尝试触发 GitHub Actions 工作流
        if [ -n "$GITHUB_TOKEN" ]; then
            log_info "检测到 GITHUB_TOKEN，将触发 GitHub Actions 工作流进行部署"
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            # 确定要部署的应用
            local app_to_trigger="all"
            if [ "$DEPLOY_MODE" = "single" ] && [ -n "$TARGET_APP" ]; then
                app_to_trigger="$TARGET_APP"
            fi
            
            if trigger_github_workflow "$app_to_trigger"; then
                log_success "工作流触发成功，部署将在 GitHub Actions 中执行"
                exit 0
            else
                log_warning "工作流触发失败，将只验证构建产物"
            fi
        else
            log_info "进入验证模式：只验证构建产物，不执行部署"
            log_info ""
            if [ -z "$GITHUB_TOKEN" ]; then
                log_warning "⚠️  未检测到 GITHUB_TOKEN，无法自动触发 GitHub Actions 工作流"
                log_info ""
                log_info "💡 提示：脚本已自动尝试从以下位置获取 GITHUB_TOKEN："
                log_info "   - 环境变量 GITHUB_TOKEN"
                log_info "   - Git 凭据管理器"
                log_info "   - Windows 用户环境变量"
                log_info ""
                log_info "如果仍未找到，请设置 GITHUB_TOKEN 环境变量："
                log_info "  PowerShell: \$env:GITHUB_TOKEN=\"your-token\""
                log_info "  Git Bash: export GITHUB_TOKEN=your-token"
                log_info ""
                log_info "或者："
                log_info "  - 在 GitHub 网页上手动触发："
                log_info "    https://github.com/$GITHUB_REPO/actions/workflows/deploy-static.yml"
                log_info "  - 推送到 develop/main 分支（会自动触发）"
            fi
        fi
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        read_deploy_config || true
    fi
    
    # 根据模式执行部署或验证
    if [ "$DEPLOY_MODE" = "single" ]; then
        if [ -z "$TARGET_APP" ]; then
            log_error "请指定要部署的应用名称"
            exit 1
        fi
        
        # 验证应用名称
        if [[ ! " ${APPS[@]} " =~ " ${TARGET_APP} " ]]; then
            log_error "无效的应用名称: $TARGET_APP"
            log_info "可用应用: ${APPS[*]}"
            exit 1
        fi
        
        if [ "$can_deploy" = true ]; then
            deploy_app "$TARGET_APP"
        else
            verify_app_build "$TARGET_APP"
        fi
        
    elif [ "$DEPLOY_MODE" = "all" ]; then
        if [ "$can_deploy" = true ]; then
            log_info "批量并行部署所有应用..."
        else
            log_info "批量验证所有应用构建产物..."
        fi
        
        local failed_apps=()
        local pids=()
        local results=()
        
        # 创建临时文件用于存储每个应用的结果
        local temp_dir=$(mktemp -d)
        trap "rm -rf $temp_dir" EXIT
        
        # 限制并发数（避免 SSH 连接过多导致连接被关闭）
        # 减少并发数，避免大文件传输时连接中断
        local max_concurrent=2
        
        # 并行执行部署或验证（带并发限制）
        log_info "准备部署的应用列表: ${APPS[*]}"
        log_info "应用总数: ${#APPS[@]}"
        for app in "${APPS[@]}"; do
            log_info "开始处理应用: $app"
            # 等待直到有可用的并发槽位
            while [ ${#pids[@]} -ge $max_concurrent ]; do
                sleep 0.5
                # 检查已完成的进程并移除
                local new_pids=()
                for pid in "${pids[@]}"; do
                    if kill -0 $pid 2>/dev/null; then
                        new_pids+=($pid)
                    fi
                done
                pids=("${new_pids[@]}")
            done
            
            local result_file="$temp_dir/${app}.result"
            (
                # 确保结果文件在子进程中创建
                touch "$result_file" 2>/dev/null || true
                if [ "$can_deploy" = true ]; then
                    if deploy_app "$app"; then
                        echo "success" > "$result_file"
                        echo "$app 部署成功" >> "$result_file"
                    else
                        echo "failed" > "$result_file"
                        echo "$app 部署失败" >> "$result_file"
                    fi
                else
                    if verify_app_build "$app"; then
                        echo "success" > "$result_file"
                        echo "$app 验证成功" >> "$result_file"
                    else
                        echo "failed" > "$result_file"
                        echo "$app 验证失败" >> "$result_file"
                    fi
                fi
            ) &
            local pid=$!
            pids+=($pid)
            log_info "应用 $app 的部署任务已启动 (PID: $pid)"
        done
        
        # 等待所有后台进程完成
        log_info "等待所有任务完成（最大并发数: $max_concurrent）..."
        for pid in "${pids[@]}"; do
            wait $pid
        done
        
        # 收集结果
        for app in "${APPS[@]}"; do
            local result_file="$temp_dir/${app}.result"
            if [ -f "$result_file" ]; then
                local status=$(head -n1 "$result_file")
                local message=$(tail -n+2 "$result_file")
                
                if [ "$status" = "success" ]; then
                    log_success "$message"
                else
                    log_error "$message"
                    failed_apps+=("$app")
                fi
            else
                log_error "$app 执行异常（结果文件不存在）"
                failed_apps+=("$app")
            fi
        done
        
        # 所有部署完成后，统一重载 Nginx（仅在实际部署时）
        if [ "$can_deploy" = true ] && [ ${#failed_apps[@]} -eq 0 ]; then
            log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log_info "重载 Nginx 配置..."
            ssh -i "$SSH_KEY" -p "$SERVER_PORT" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" \
                "nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || true" || {
                log_warning "Nginx 重载失败，但不影响部署结果"
            }
            log_success "Nginx 配置已重载"
        fi
        
        # 汇总结果
        echo ""
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        if [ ${#failed_apps[@]} -eq 0 ]; then
            if [ "$can_deploy" = true ]; then
                log_success "所有应用部署成功！"
                
                # 部署成功后触发测试
                if [ -f "$SCRIPT_DIR/trigger-deployment-test.sh" ]; then
                    echo ""
                    log_info "开始执行部署测试..."
                    if bash "$SCRIPT_DIR/trigger-deployment-test.sh" "$TARGET_APP" || true; then
                        log_success "部署测试完成"
                    else
                        log_warning "部署测试失败，但不影响部署结果"
                    fi
                fi
            else
                log_success "所有应用构建产物验证通过！"
                log_info "提示：在 GitHub Actions 中运行以执行实际部署"
            fi
        else
            if [ "$can_deploy" = true ]; then
                log_error "以下应用部署失败: ${failed_apps[*]}"
            else
                log_error "以下应用验证失败: ${failed_apps[*]}"
            fi
            exit 1
        fi
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        log_error "请指定部署模式: --app <name> 或 --all"
        show_help
        exit 1
    fi
}

# 执行主函数
main

