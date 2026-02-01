#!/bin/bash

# 本地构建并部署单个应用到服务器
# 流程：本地构建 -> 构建Docker镜像 -> 保存为tar.gz -> SCP上传 -> 触发GitHub Actions部署
# 用法: ./deploy-app-local.sh <app-name>
# 示例: ./deploy-app-local.sh system-app

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
SERVER_HOST="${SERVER_HOST:-47.112.31.96}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
REMOTE_PATH="${REMOTE_PATH:-/www/wwwroot/btc-shopflow-monorepo}"
TEMP_DIR="/tmp/btc-shopflow-deploy"
APP_NAME=""
# 尝试从环境变量获取 GITHUB_TOKEN，如果没有则尝试 SERVER_PAT（用于兼容）
GITHUB_TOKEN="${GITHUB_TOKEN:-${SERVER_PAT:-}}"
SKIP_LOCAL_BUILD="${SKIP_LOCAL_BUILD:-false}"

# 智能检测 SSH 密钥路径（支持 Windows 和 Linux）
if [ -z "$SSH_KEY" ]; then
    # 检测 Windows 用户名（支持多种环境）
    WIN_USER="${USERNAME:-${USER}}"
    
    # 可能的 SSH 密钥路径列表（按优先级排序）
    POSSIBLE_KEYS=(
        # Windows 路径（WSL/Git Bash）- 使用 mlu 作为用户名
        "/mnt/c/Users/mlu/.ssh/github_action_key"
        "/mnt/c/Users/mlu/.ssh/github_actions_key"
        "/mnt/c/Users/mlu/.ssh/id_rsa"
        # Windows 路径（MSYS2/Git Bash）
        "/c/Users/mlu/.ssh/github_action_key"
        "/c/Users/mlu/.ssh/github_actions_key"
        "/c/Users/mlu/.ssh/id_rsa"
        # Windows 路径（使用检测到的用户名）
        "/mnt/c/Users/$WIN_USER/.ssh/github_action_key"
        "/mnt/c/Users/$WIN_USER/.ssh/github_actions_key"
        "/mnt/c/Users/$WIN_USER/.ssh/id_rsa"
        "/c/Users/$WIN_USER/.ssh/github_action_key"
        "/c/Users/$WIN_USER/.ssh/github_actions_key"
        "/c/Users/$WIN_USER/.ssh/id_rsa"
        # Linux 路径
        "$HOME/.ssh/github_action_key"
        "$HOME/.ssh/github_actions_key"
        "$HOME/.ssh/id_rsa"
    )
    
    # 查找第一个存在的密钥文件
    SSH_KEY=""
    for key in "${POSSIBLE_KEYS[@]}"; do
        if [ -f "$key" ]; then
            SSH_KEY="$key"
            log_info "✅ 自动检测到 SSH 密钥: $SSH_KEY"
            break
        fi
    done
    
    # 如果仍未找到，尝试从 PowerShell 环境变量获取
    if [ -z "$SSH_KEY" ] && [ -n "$SSH_KEY_PATH" ]; then
        SSH_KEY="$SSH_KEY_PATH"
        log_info "📝 从环境变量 SSH_KEY_PATH 获取: $SSH_KEY"
    fi
    
    # 如果仍未找到，使用默认路径（会在后面验证时给出提示）
    if [ -z "$SSH_KEY" ]; then
        SSH_KEY="$HOME/.ssh/id_rsa"
    fi
else
    # 如果已设置 SSH_KEY，直接使用
    SSH_KEY="$SSH_KEY"
    log_info "📝 使用环境变量 SSH_KEY: $SSH_KEY"
fi

# 注意：默认值已在变量定义中设置
# 如果环境变量未设置，将使用默认值
# 可以通过环境变量覆盖默认值

# 应用端口映射
declare -A APP_PORTS=(
    ["system-app"]="30080"
    ["admin-app"]="30081"
    ["logistics-app"]="30082"
    ["quality-app"]="30083"
    ["production-app"]="30084"
    ["engineering-app"]="30085"
    ["finance-app"]="30086"
)

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build|--skip-local-build)
            SKIP_LOCAL_BUILD="true"
            shift
            ;;
        --help|-h)
            echo "用法: $0 <app-name> [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --skip-build, --skip-local-build    跳过本地构建（直接在 Docker 内构建）"
            echo "  --help, -h                           显示帮助信息"
            echo ""
            echo "环境变量:"
            echo "  SERVER_HOST         服务器地址（默认: 47.112.31.96）"
            echo "  SERVER_USER         服务器用户（默认: root）"
            echo "  SERVER_PORT         SSH端口（默认: 22）"
            echo "  SSH_KEY             SSH密钥路径（默认: ~/.ssh/id_rsa）"
            echo "  REMOTE_PATH         服务器上的项目路径（默认: /www/wwwroot/btc-shopflow-monorepo）"
            echo "  GITHUB_TOKEN        GitHub Token（用于触发工作流）"
            echo "  SKIP_LOCAL_BUILD    跳过本地构建（默认: false）"
            echo ""
            echo "示例:"
            echo "  $0 system-app"
            echo "  $0 system-app --skip-build"
            echo "  SERVER_HOST=192.168.1.100 $0 admin-app"
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
    log_error "请指定要部署的应用名称"
    echo "用法: $0 <app-name>"
    echo "示例: $0 system-app"
    exit 1
fi

# 验证应用是否在支持列表中
if [ -z "${APP_PORTS[$APP_NAME]}" ]; then
    log_error "不支持的应用: $APP_NAME"
    log_info "支持的应用: ${!APP_PORTS[@]}"
    exit 1
fi

# 验证服务器配置（现在有默认值，显示配置信息）
log_info "服务器配置:"
log_info "  SERVER_HOST: ${SERVER_HOST:-47.112.31.96}"
log_info "  SERVER_USER: ${SERVER_USER:-root}"
log_info "  SERVER_PORT: ${SERVER_PORT:-22}"
log_info "  REMOTE_PATH: ${REMOTE_PATH:-/www/wwwroot/btc-shopflow-monorepo}"
log_info "  SSH_KEY: $SSH_KEY"
if [ ! -f "$SSH_KEY" ]; then
    log_warning "⚠️  SSH 密钥文件不存在: $SSH_KEY"
    log_info "💡 提示: 可以通过 SSH_KEY 环境变量设置正确的密钥路径"
    log_info "  PowerShell: \$env:SSH_KEY=\"C:\\Users\\mlu\\.ssh\\github_action_key\""
    log_info "  Git Bash: export SSH_KEY=\"/mnt/c/Users/mlu/.ssh/github_action_key\""
fi
log_info ""
log_info "💡 提示: 可以通过环境变量覆盖默认值"
log_info "  PowerShell: \$env:SERVER_HOST=\"your_server_ip\""
log_info "  Git Bash: export SERVER_HOST=\"your_server_ip\""
echo ""

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 本地构建并部署应用"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "应用: $APP_NAME"
log_info "端口: ${APP_PORTS[$APP_NAME]}"
log_info "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo ""

# 检查是否在项目根目录
if [ ! -f "Dockerfile" ] || [ ! -d "apps/$APP_NAME" ]; then
    log_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查必需工具
log_info "检查必需工具..."
# 检测 Docker 命令（支持 Windows 和 Linux）
DOCKER_CMD="docker"
if ! command -v docker &> /dev/null; then
    # 尝试使用 Windows 的 docker.exe
    if command -v docker.exe &> /dev/null; then
        DOCKER_CMD="docker.exe"
        log_info "检测到 Windows Docker，使用 docker.exe"
    elif [ -f "/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe" ]; then
        DOCKER_CMD="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
        log_info "检测到 Windows Docker 路径，使用: $DOCKER_CMD"
    else
        log_error "Docker 未安装，请先安装 Docker Desktop"
        log_info "下载地址: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
fi

# 验证 Docker 是否可用
log_info "检查 Docker 连接..."
DOCKER_CHECK_OUTPUT=$($DOCKER_CMD info 2>&1)
DOCKER_CHECK_EXIT=$?

if [ $DOCKER_CHECK_EXIT -ne 0 ]; then
    log_error "Docker 连接失败"
    log_info ""
    if echo "$DOCKER_CHECK_OUTPUT" | grep -qiE "cannot connect|daemon|not running|npipe"; then
        log_info "💡 Docker Desktop 可能未运行或 WSL 集成未配置"
        log_info ""
        log_info "解决方案:"
        log_info "  1. 启动 Docker Desktop"
        log_info "  2. 在 Docker Desktop 设置中启用 WSL 集成:"
        log_info "     Settings -> Resources -> WSL Integration"
        log_info "     确保当前 WSL 发行版已启用"
        log_info "  3. 重启 Docker Desktop"
        log_info ""
        log_info "或者，如果使用 Windows 原生 Docker，请确保 Docker Desktop 正在运行"
    else
        log_info "错误信息:"
        echo "$DOCKER_CHECK_OUTPUT" | while IFS= read -r line; do
            log_info "  $line"
        done
    fi
    exit 1
fi

log_success "Docker 连接正常"

if ! command -v pnpm &> /dev/null; then
    log_error "pnpm 未安装，请先安装 pnpm"
    exit 1
fi

if ! command -v ssh &> /dev/null; then
    log_error "SSH 未安装，请先安装 SSH 客户端"
    exit 1
fi

if ! command -v scp &> /dev/null; then
    log_error "SCP 未安装，请先安装 SCP"
    exit 1
fi

log_success "所有必需工具已就绪"
echo ""

# 步骤1: 可选 - 本地构建应用（用于加速 Docker 构建，但可能因依赖问题失败）
# Dockerfile 会在容器内构建，但如果有预构建的 dist，可以优化构建速度
if [ "$SKIP_LOCAL_BUILD" = "true" ]; then
    log_info "步骤 1/5: 跳过本地构建（将在 Docker 内构建）..."
else
    log_info "步骤 1/5: 尝试本地构建（可选，用于加速）..."
    log_warning "💡 提示: 如果本地构建失败，Docker 会在容器内自动构建（这是正常的）"
    log_warning "   如果遇到依赖问题，可以使用 --skip-build 选项跳过本地构建"
    echo ""
    
    # 临时禁用 set -e，允许构建失败而不退出
    set +e
    
    # 检查并构建共享包（如果尚未构建）
    if [ ! -d "packages/shared-core/dist" ] || [ ! -f "packages/shared-core/dist/index.js" ]; then
        log_info "构建共享包..."
        if pnpm --filter @btc/vite-plugin run build >/dev/null 2>&1 && \
           pnpm --filter @btc/shared-utils run build >/dev/null 2>&1 && \
           pnpm --filter @btc/shared-core run build >/dev/null 2>&1 && \
           pnpm --filter @btc/shared-components run build >/dev/null 2>&1 && \
           pnpm --filter @btc/subapp-manifests run build >/dev/null 2>&1; then
            log_success "共享包构建完成"
        else
            log_warning "共享包构建失败，将在 Docker 内构建"
        fi
    else
        log_info "共享包已存在，跳过构建"
    fi
    
    # 尝试构建应用（如果失败，Docker 会在容器内构建）
    if [ ! -d "apps/$APP_NAME/dist" ] || [ -z "$(ls -A apps/$APP_NAME/dist 2>/dev/null)" ]; then
        log_info "构建应用 $APP_NAME..."
        if pnpm --filter "$APP_NAME" run build >/dev/null 2>&1; then
            log_success "应用构建完成"
        else
            log_warning "本地构建失败（可能是跨平台依赖问题，这是正常的）"
            log_info "💡 Docker 将在容器内自动构建，继续执行..."
        fi
    else
        log_info "应用已构建，跳过本地构建"
    fi
    
    # 恢复 set -e
    set -e
fi
echo ""

# 步骤3: 构建 Docker 镜像
log_info "步骤 3/5: 构建 Docker 镜像..."
export DOCKER_BUILDKIT=1

IMAGE_NAME="btc-shopflow/$APP_NAME:latest"
log_info "镜像名称: $IMAGE_NAME"

if $DOCKER_CMD build \
    --build-arg APP_DIR=apps/$APP_NAME \
    --tag "$IMAGE_NAME" \
    --file ./Dockerfile \
    --progress=plain \
    .; then
    log_success "Docker 镜像构建成功"
else
    log_error "Docker 镜像构建失败"
    exit 1
fi
echo ""

# 步骤4: 保存镜像为 tar.gz 文件
log_info "步骤 4/5: 保存 Docker 镜像..."
mkdir -p "$TEMP_DIR"
IMAGE_FILE="$TEMP_DIR/${APP_NAME}.tar.gz"

log_info "保存镜像到: $IMAGE_FILE"
if $DOCKER_CMD save "$IMAGE_NAME" | gzip > "$IMAGE_FILE"; then
    FILE_SIZE=$(du -h "$IMAGE_FILE" | cut -f1)
    log_success "镜像已保存 ($FILE_SIZE)"
else
    log_error "镜像保存失败"
    exit 1
fi
echo ""

# 步骤5: SCP 上传到服务器
log_info "步骤 5/5: 上传镜像到服务器..."

# 测试 SSH 连接
log_info "测试 SSH 连接..."
if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH 密钥文件不存在: $SSH_KEY"
    log_info ""
    log_info "💡 请设置 SSH_KEY 环境变量指向正确的密钥文件:"
    log_info ""
    log_info "  PowerShell:"
    log_info "    \$env:SSH_KEY=\"C:\\Users\\mlu\\.ssh\\github_action_key\""
    log_info ""
    log_info "  Git Bash:"
    log_info "    export SSH_KEY=\"/mnt/c/Users/mlu/.ssh/github_action_key\""
    log_info ""
    log_info "  或使用配置文件:"
    log_info "    . scripts/load-env.ps1    # PowerShell"
    log_info "    source scripts/load-env.sh  # Git Bash"
    log_info ""
    log_info "尝试检测的密钥路径:"
    if [ -n "$WIN_USER" ]; then
        log_info "  - /mnt/c/Users/mlu/.ssh/github_action_key"
        log_info "  - /c/Users/mlu/.ssh/github_action_key"
        log_info "  - /mnt/c/Users/$WIN_USER/.ssh/github_action_key"
        log_info "  - /c/Users/$WIN_USER/.ssh/github_action_key"
    fi
    log_info "  - $HOME/.ssh/github_action_key"
    exit 1
fi

# 处理 Windows 路径权限问题：如果是 Windows 路径，复制到 WSL 文件系统
if echo "$SSH_KEY" | grep -qE "^/(mnt/)?c/"; then
    log_info "检测到 Windows 路径，为避免权限问题，将复制到 WSL 文件系统..."
    WSL_SSH_DIR="$HOME/.ssh"
    WSL_SSH_KEY="$WSL_SSH_DIR/github_actions_key"
    
    # 创建 WSL .ssh 目录
    mkdir -p "$WSL_SSH_DIR"
    chmod 700 "$WSL_SSH_DIR" 2>/dev/null || true
    
    # 复制密钥文件（如果不存在或源文件更新）
    if [ ! -f "$WSL_SSH_KEY" ] || [ "$SSH_KEY" -nt "$WSL_SSH_KEY" ] 2>/dev/null; then
        log_info "复制密钥文件到: $WSL_SSH_KEY"
        cp "$SSH_KEY" "$WSL_SSH_KEY"
        chmod 600 "$WSL_SSH_KEY" 2>/dev/null || true
        log_success "密钥文件已复制并设置权限"
    else
        log_info "使用已存在的 WSL 密钥文件: $WSL_SSH_KEY"
    fi
    
    SSH_KEY="$WSL_SSH_KEY"
fi

# 设置 SSH 密钥权限（确保权限正确）
log_info "检查并修复 SSH 密钥文件权限..."
if [ -f "$SSH_KEY" ]; then
    chmod 600 "$SSH_KEY" 2>/dev/null || true
    KEY_PERMS=$(stat -c "%a" "$SSH_KEY" 2>/dev/null || ls -l "$SSH_KEY" 2>/dev/null | awk '{print $1}' || echo "")
    log_info "  密钥文件: $SSH_KEY"
    log_info "  权限: ${KEY_PERMS:-未知}"
fi

# 验证密钥文件
if [ ! -f "$SSH_KEY" ]; then
    log_error "SSH 密钥文件不存在: $SSH_KEY"
    exit 1
fi

# 显示更详细的连接信息
log_info "尝试 SSH 连接..."
log_info "  密钥路径: $SSH_KEY"
log_info "  服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"

# 测试 SSH 连接（显示详细错误信息）
log_info "执行 SSH 连接测试..."

# 如果是 Windows 路径且权限可能有问题，尝试使用宽松的权限检查
SSH_EXTRA_OPTS=""
if echo "$SSH_KEY" | grep -qE "^/(mnt/)?c/"; then
    # Windows 路径，可能需要额外选项来绕过权限检查（不推荐，但可以作为临时方案）
    log_warning "  检测到 Windows 路径，权限可能受限"
    log_info "  如果连接失败，请考虑将密钥复制到 WSL 文件系统"
fi

SSH_OUTPUT=$(ssh -v -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes \
    -o IdentitiesOnly=yes \
    -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'" 2>&1)
SSH_EXIT_CODE=$?

# 调试：显示 SSH 输出的最后部分
if [ $SSH_EXIT_CODE -ne 0 ]; then
    log_warning "SSH 命令执行失败，检查错误输出..."
    # 保存完整输出到临时文件以便调试
    echo "$SSH_OUTPUT" > "/tmp/ssh_debug_$$.log" 2>/dev/null || true
fi

if [ $SSH_EXIT_CODE -ne 0 ]; then
    log_error "SSH 连接失败 (退出代码: $SSH_EXIT_CODE)"
    
    # 解释退出代码含义
    log_info ""
    log_warning "退出代码说明:"
    case $SSH_EXIT_CODE in
        255)
            log_info "  退出代码 255: SSH 连接或认证失败"
            log_info "  常见原因:"
            log_info "    - 服务器上未配置对应的公钥 (authorized_keys)"
            log_info "    - 密钥文件格式不正确"
            log_info "    - 服务器拒绝密钥认证"
            log_info "    - 服务器上的 .ssh 目录权限不正确"
            ;;
        1)
            log_info "  退出代码 1: 远程命令执行失败"
            ;;
        *)
            log_info "  退出代码 $SSH_EXIT_CODE: 未知错误"
            ;;
    esac
    
    log_info ""
    log_info "请检查以下配置:"
    log_info "  - SERVER_HOST: $SERVER_HOST"
    log_info "  - SERVER_USER: $SERVER_USER"
    log_info "  - SERVER_PORT: $SERVER_PORT"
    log_info "  - SSH_KEY: $SSH_KEY"
    
    # 检查密钥文件
    if [ ! -f "$SSH_KEY" ]; then
        log_error "  ❌ 密钥文件不存在!"
    elif [ ! -r "$SSH_KEY" ]; then
        log_error "  ❌ 密钥文件不可读!"
    else
        log_info "  ✅ 密钥文件存在且可读"
        # 显示密钥文件权限
        KEY_PERMS=$(ls -l "$SSH_KEY" 2>/dev/null | awk '{print $1}')
        log_info "  - 密钥文件权限: ${KEY_PERMS:-未知}"
    fi
    
    log_info ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "SSH 连接详细调试信息:"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 显示完整的 SSH 输出（最后 50 行，通常包含关键错误信息）
    log_info ""
    log_warning "SSH 连接输出 (最后 50 行，包含关键错误信息):"
    echo "$SSH_OUTPUT" | tail -50 | while IFS= read -r line || [ -n "$line" ]; do
        # 高亮显示错误关键词
        if echo "$line" | grep -qE "error|denied|refused|timeout|permission|authentication|Permission denied|Connection refused|Connection timed out|authenticate|no mutual signature|sign_and_send_pubkey|key_load_public|Offering public key" -i 2>/dev/null; then
            log_error "  $line"
        else
            log_info "  $line"
        fi
    done || true
    
    log_info ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "关键错误信息提取:"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 提取关键错误信息
    ERROR_KEYWORDS="error|denied|refused|timeout|permission|authentication|Permission denied|Connection refused|Connection timed out|authenticate|no mutual signature|key_load_public|Offering public key|debug1.*error|debug2.*error|debug3.*error"
    
    ERROR_LINES=$(echo "$SSH_OUTPUT" | grep -E "$ERROR_KEYWORDS" -i 2>/dev/null)
    
    if [ -n "$ERROR_LINES" ]; then
        echo "$ERROR_LINES" | head -20 | while IFS= read -r line || [ -n "$line" ]; do
            log_error "  ⚠️  $line"
        done
    else
        log_warning "  未找到标准错误关键词，请查看上面的完整输出"
    fi
    
    log_info ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🔧 排查建议:"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info ""
    log_info "1️⃣  验证密钥文件格式:"
    log_info "   在本地运行: ssh-keygen -y -f \"$SSH_KEY\""
    log_info "   如果报错，说明密钥文件损坏或格式不正确"
    log_info ""
    log_info "2️⃣  检查服务器上的配置:"
    log_info "   登录服务器后运行以下命令:"
    log_info "   "
    log_info "   # 检查 authorized_keys 文件"
    log_info "   ls -la /root/.ssh/authorized_keys"
    log_info "   cat /root/.ssh/authorized_keys"
    log_info "   "
    log_info "   # 检查权限"
    log_info "   ls -ld /root/.ssh"
    log_info "   ls -l /root/.ssh/authorized_keys"
    log_info "   "
    log_info "   # 正确权限应该是:"
    log_info "   # drwx------ (700) for /root/.ssh"
    log_info "   # -rw------- (600) for /root/.ssh/authorized_keys"
    log_info ""
    log_info "3️⃣  手动测试 SSH 连接 (显示详细调试信息):"
    log_info "   ssh -vvv -i \"$SSH_KEY\" -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
    log_info ""
    log_info "4️⃣  验证公钥是否正确添加到服务器:"
    log_info "   在服务器上运行:"
    log_info "   ssh-keygen -y -f /root/.ssh/id_rsa  # 如果有服务器上的私钥"
    log_info "   或者比较本地公钥和服务器 authorized_keys 的内容"
    log_info ""
    log_info "5️⃣  检查服务器 SSH 配置:"
    log_info "   在服务器上运行:"
    log_info "   sudo grep -E '^(PubkeyAuthentication|AuthorizedKeysFile|PasswordAuthentication)' /etc/ssh/sshd_config"
    log_info "   确保 PubkeyAuthentication yes"
    log_info ""
    exit 1
fi

log_success "SSH 连接成功"

log_success "SSH 连接成功"

# 在服务器上创建临时目录
log_info "在服务器上创建临时目录..."
ssh -o StrictHostKeyChecking=no \
    -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" \
    "mkdir -p $REMOTE_PATH/tmp/docker-images" > /dev/null 2>&1

# 上传镜像文件
REMOTE_IMAGE_FILE="$REMOTE_PATH/tmp/docker-images/${APP_NAME}.tar.gz"
log_info "上传镜像文件到: $SERVER_USER@$SERVER_HOST:$REMOTE_IMAGE_FILE"

if scp -o StrictHostKeyChecking=no -P "$SERVER_PORT" -i "$SSH_KEY" \
    "$IMAGE_FILE" \
    "$SERVER_USER@$SERVER_HOST:$REMOTE_IMAGE_FILE"; then
    log_success "镜像上传成功"
else
    log_error "镜像上传失败"
    exit 1
fi
echo ""

# 步骤6: 创建部署标记文件并提交到 GitHub
log_info "步骤 6/6: 创建部署标记并提交到 GitHub..."

# 创建部署标记文件（.deploy/{app-name}/ 目录结构）
DEPLOY_APP_DIR=".deploy/$APP_NAME"
DEPLOY_INFO_FILE="$DEPLOY_APP_DIR/deploy.json"

# 确保 .deploy 目录存在
mkdir -p ".deploy" 2>/dev/null || true

# 清理旧格式的文件（如果存在）
if [ -f ".deploy/$APP_NAME" ]; then
    log_info "清理旧格式的部署标记文件..."
    rm -f ".deploy/$APP_NAME" ".deploy/${APP_NAME}.json" 2>/dev/null || true
fi

# 确保应用目录存在（如果已存在同名文件，先删除）
if [ -f "$DEPLOY_APP_DIR" ]; then
    log_info "检测到同名文件，删除后创建目录..."
    rm -f "$DEPLOY_APP_DIR" 2>/dev/null || true
fi

# 创建应用目录
mkdir -p "$DEPLOY_APP_DIR" 2>/dev/null || {
    log_error "⚠️  无法创建目录 $DEPLOY_APP_DIR"
    exit 1
}

# 创建部署标记文件（包含部署信息）
cat > "$DEPLOY_INFO_FILE" <<EOF
{
  "app_name": "$APP_NAME",
  "image_path": "$REMOTE_IMAGE_FILE",
  "environment": "production",
  "deployed_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "git_sha": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
}
EOF

log_info "部署标记文件已创建: $DEPLOY_INFO_FILE"

# 添加部署标记文件
log_info "添加部署标记文件到 Git..."
git add "$DEPLOY_INFO_FILE" 2>/dev/null || {
    log_error "⚠️  无法添加文件到 Git"
    exit 1
}

# 检查是否有需要提交的文件
if [ -z "$(git diff --cached --name-only)" ]; then
    log_warning "⚠️  没有需要提交的文件（部署标记文件可能已存在且未更改）"
    log_info "如果这是第一次运行，请检查文件是否正确创建"
    # 如果文件已存在，尝试强制添加并检查
    git add -f "$DEPLOY_INFO_FILE" 2>/dev/null || true
    if [ -z "$(git diff --cached --name-only)" ]; then
        log_info "部署标记文件已是最新，无需提交"
        log_info "如果需要重新触发部署，请删除标记文件后重新运行:"
        log_info "  rm -rf $DEPLOY_APP_DIR"
        exit 0
    fi
fi

# 提交更改（先尝试提交，如果失败再检查配置）
log_info "提交部署标记文件..."
COMMIT_OUTPUT=$(git commit -m "chore: trigger deployment for $APP_NAME

- App: $APP_NAME
- Image path: $REMOTE_IMAGE_FILE
- Environment: production
" 2>&1)
COMMIT_EXIT_CODE=$?

if [ $COMMIT_EXIT_CODE -ne 0 ]; then
    # 检查是否是 Git 配置问题
    if echo "$COMMIT_OUTPUT" | grep -qiE "author|user\.name|user\.email|identity|who you are"; then
        log_error "⚠️  Git 提交失败：缺少用户配置"
        log_info ""
        log_info "检测到您在 Windows 环境中已配置 Git，但在当前 bash 环境中可能未配置。"
        log_info ""
        log_info "请在当前 bash 环境中配置 Git 用户信息:"
        log_info "  git config user.name \"BellisGit\""
        log_info "  git config user.email \"1208136885@qq.com\""
        log_info ""
        log_info "或使用全局配置:"
        log_info "  git config --global user.name \"BellisGit\""
        log_info "  git config --global user.email \"1208136885@qq.com\""
        log_info ""
        log_info "配置完成后，请手动提交部署标记文件:"
        log_info "  git add $DEPLOY_INFO_FILE"
        log_info "  git commit -m 'chore: trigger deployment for $APP_NAME'"
        log_info "  git push origin develop"
        exit 1
    else
        log_error "⚠️  Git 提交失败"
        log_info "错误信息:"
        echo "$COMMIT_OUTPUT" | while IFS= read -r line; do
            log_info "  $line"
        done
        log_info ""
        log_info "请手动提交部署标记文件:"
        log_info "  git add $DEPLOY_INFO_FILE"
        log_info "  git commit -m 'chore: trigger deployment for $APP_NAME'"
        log_info "  git push origin develop"
        exit 1
    fi
fi

log_success "✅ 部署标记文件已提交"

# 推送到 GitHub
log_info "推送到 GitHub..."

# 自动配置：确保使用 SSH URL（免密推送）
CURRENT_REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if echo "$CURRENT_REMOTE_URL" | grep -qE "^https://"; then
    log_info "检测到 remote URL 使用 HTTPS，自动切换到 SSH URL..."
    
    # 直接切换到 SSH URL
    SSH_REMOTE_URL=$(echo "$CURRENT_REMOTE_URL" | sed 's|https://github.com/|git@github.com:|' | sed 's|\.git$|.git|')
    if git remote set-url origin "$SSH_REMOTE_URL" 2>/dev/null; then
        log_success "✅ 已自动切换到 SSH URL"
    else
        log_warning "⚠️  切换 SSH URL 失败，继续使用 HTTPS"
    fi
fi

# 查找 SSH 密钥（用于显示公钥，如果需要添加到 GitHub）
SSH_KEY_PUB=""
# 优先查找 github_actions_key.pub（用于部署的密钥）
for key_path in "/mnt/c/Users/mlu/.ssh/github_actions_key.pub" "$HOME/.ssh/github_actions_key.pub" "$HOME/.ssh/id_rsa.pub" "$HOME/.ssh/id_ed25519.pub" "/mnt/c/Users/mlu/.ssh/id_rsa.pub" "/mnt/c/Users/mlu/.ssh/id_ed25519.pub"; do
    if [ -f "$key_path" ] && [ -s "$key_path" ]; then
        SSH_KEY_PUB="$key_path"
        break
    fi
done

# 配置 SSH 使用指定的密钥（处理 Windows/WSL 权限问题）
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    log_info "配置 SSH 使用密钥: $SSH_KEY"
    
    # 如果密钥在 Windows 路径 (/mnt/c/)，复制到 WSL 文件系统以解决权限问题
    WSL_KEY_PATH=""
    if echo "$SSH_KEY" | grep -qE "^/mnt/c/|^/c/"; then
        log_info "检测到 Windows 路径，复制到 WSL 文件系统以解决权限问题..."
        WSL_KEY_NAME=$(basename "$SSH_KEY")
        WSL_KEY_DIR="$HOME/.ssh"
        WSL_KEY_PATH="$WSL_KEY_DIR/$WSL_KEY_NAME"
        
        mkdir -p "$WSL_KEY_DIR"
        cp "$SSH_KEY" "$WSL_KEY_PATH" 2>/dev/null && {
            chmod 600 "$WSL_KEY_PATH" 2>/dev/null
            log_success "✅ 密钥已复制到 WSL 文件系统: $WSL_KEY_PATH"
            SSH_KEY="$WSL_KEY_PATH"
        } || {
            log_warning "⚠️  无法复制密钥到 WSL 文件系统，继续使用原路径"
        }
    fi
    
    # 创建或更新 SSH config 文件
    SSH_CONFIG_DIR="$HOME/.ssh"
    SSH_CONFIG="$SSH_CONFIG_DIR/config"
    mkdir -p "$SSH_CONFIG_DIR"
    
    # 检查是否已有 GitHub 配置，如果没有则添加
    if [ ! -f "$SSH_CONFIG" ] || ! grep -q "^Host github.com" "$SSH_CONFIG" 2>/dev/null; then
        log_info "创建 SSH config 配置..."
        cat >> "$SSH_CONFIG" << EOF

Host github.com
    HostName github.com
    User git
    IdentityFile $SSH_KEY
    IdentitiesOnly yes
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOF
        chmod 600 "$SSH_CONFIG" 2>/dev/null || true
        log_success "✅ SSH config 已配置"
    else
        log_info "SSH config 已包含 GitHub 配置"
    fi
fi

# 确保 Git Credential Manager 已配置（自动保存凭据）
if [ -z "$(git config --global credential.helper)" ]; then
    log_info "自动配置 Git Credential Manager..."
    if git config --global credential.helper manager 2>/dev/null; then
        log_success "✅ 已配置 Git Credential Manager（将自动保存凭据）"
    elif git config --global credential.helper store 2>/dev/null; then
        log_success "✅ 已配置 Git Credential Store（将自动保存凭据）"
    fi
fi

# 尝试推送
log_info "尝试推送到 GitHub..."
PUSH_OUTPUT=$(git push origin develop 2>&1)
PUSH_EXIT_CODE=$?

if [ $PUSH_EXIT_CODE -eq 0 ]; then
    log_success "✅ 部署标记已推送到 GitHub"
    log_info "GitHub Actions 工作流将自动检测并部署"
    log_info "查看工作流状态: https://github.com/$GITHUB_REPO/actions"
else
    # 检查是否是 SSH 认证问题
    if echo "$PUSH_OUTPUT" | grep -qiE "Permission denied.*publickey|Could not read from remote"; then
        log_error "⚠️  SSH 密钥未添加到 GitHub"
        log_info ""
        log_info "📋 请将以下 SSH 公钥添加到 GitHub（只需添加一次）:"
        log_info "   访问: https://github.com/settings/keys"
        log_info "   点击 'New SSH key'，然后粘贴以下公钥内容:"
        log_info ""
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        if [ -n "$SSH_KEY_PUB" ] && [ -s "$SSH_KEY_PUB" ]; then
            cat "$SSH_KEY_PUB"
        else
            log_warning "未找到 SSH 公钥文件"
            log_info "请检查以下路径:"
            log_info "  /mnt/c/Users/mlu/.ssh/github_actions_key.pub"
            log_info "  ~/.ssh/id_rsa.pub"
            log_info "  ~/.ssh/id_ed25519.pub"
        fi
        log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log_info ""
        log_info "添加完成后，重新运行部署命令即可免密推送"
        log_info ""
        log_info "或者暂时切换回 HTTPS（需要输入一次凭据）:"
        log_info "  git remote set-url origin https://github.com/$GITHUB_REPO.git"
        log_info "  git push origin develop"
        exit 1
    elif echo "$PUSH_OUTPUT" | grep -qiE "Authentication failed|Invalid username|password|token|Username for"; then
        log_warning "⚠️  Git 推送需要认证"
        log_info ""
        log_info "💡 Git Credential Manager 已配置，请手动运行一次推送以保存凭据:"
        log_info "  git push origin develop"
        log_info ""
        log_info "输入一次用户名和密码后，凭据会被自动保存，后续无需再输入"
        exit 1
    else
        log_error "⚠️  Git 推送失败"
        echo "$PUSH_OUTPUT" | while IFS= read -r line; do
            log_info "  $line"
        done
        log_info ""
        log_info "请手动推送: git push origin develop"
        exit 1
    fi
fi

# 清理临时文件
log_info "清理临时文件..."
rm -rf "$TEMP_DIR"
log_success "清理完成"
echo ""

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "✅ 本地构建和上传完成！"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "📋 部署信息:"
log_info "  - 应用: $APP_NAME"
log_info "  - 端口: ${APP_PORTS[$APP_NAME]}"
log_info "  - 镜像文件: $REMOTE_IMAGE_FILE"
log_info ""
log_info "🚀 下一步:"
log_info "  1. GitHub Actions 工作流将自动部署容器"
log_info "  2. 或手动部署: SSH 到服务器后运行部署命令"
log_info ""
