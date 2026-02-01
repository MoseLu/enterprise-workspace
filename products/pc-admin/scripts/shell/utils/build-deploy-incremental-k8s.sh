#!/bin/bash

# K8s 增量构建和部署一键脚本
# 整合增量构建和增量部署流程，实现"修改代码仅增量构建、修改应用仅增量部署"

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

# 配置参数
PRIVATE_REGISTRY="${PRIVATE_REGISTRY:-}"
K8S_NAMESPACE="${K8S_NAMESPACE:-btc-shopflow}"
LAST_COMMIT="${LAST_COMMIT:-HEAD~1}"
BUILD_ALL="${BUILD_ALL:-false}"
DEPLOY_ALL="${DEPLOY_ALL:-false}"
SKIP_BUILD="${SKIP_BUILD:-false}"
SKIP_DEPLOY="${SKIP_DEPLOY:-false}"
DRY_RUN="${DRY_RUN:-false}"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 加载配置文件（如果存在）
if [ -f "$PROJECT_ROOT/.k8s-config" ]; then
    log_info "加载配置文件: .k8s-config"
    # 读取配置文件（支持 # 开头的注释和空行）
    while IFS='=' read -r key value; do
        # 跳过注释和空行
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        # 去除前后空格
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        # 如果值不为空，设置环境变量
        if [ -n "$value" ]; then
            export "$key=$value"
        fi
    done < "$PROJECT_ROOT/.k8s-config"
fi

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --registry)
            PRIVATE_REGISTRY="$2"
            shift 2
            ;;
        --namespace)
            K8S_NAMESPACE="$2"
            shift 2
            ;;
        --base)
            LAST_COMMIT="$2"
            shift 2
            ;;
        --all)
            BUILD_ALL=true
            DEPLOY_ALL=true
            shift
            ;;
        --build-all)
            BUILD_ALL=true
            shift
            ;;
        --deploy-all)
            DEPLOY_ALL=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-deploy)
            SKIP_DEPLOY=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --registry <addr>   私有镜像仓库地址（必需）"
            echo "  --namespace <ns>    K8s 命名空间（默认: btc-shopflow）"
            echo "  --base <ref>       对比的基准 Git 引用（默认: HEAD~1）"
            echo "  --all               构建和部署所有应用"
            echo "  --build-all         仅构建所有应用"
            echo "  --deploy-all        仅部署所有应用"
            echo "  --skip-build        跳过构建步骤（仅部署）"
            echo "  --skip-deploy       跳过部署步骤（仅构建）"
            echo "  --dry-run           仅显示将要执行的操作，不实际执行"
            echo "  --help, -h          显示帮助信息"
            echo ""
            echo "环境变量:"
            echo "  PRIVATE_REGISTRY    私有镜像仓库地址"
            echo "  K8S_NAMESPACE       K8s 命名空间"
            echo ""
            echo "示例:"
            echo "  $0 --registry 192.168.1.100:5000"
            echo "  $0 --registry 192.168.1.100:5000 --all"
            echo "  $0 --registry 192.168.1.100:5000 --skip-build  # 仅部署"
            echo "  $0 --registry 192.168.1.100:5000 --skip-deploy  # 仅构建"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 检查必需参数
if [ -z "$PRIVATE_REGISTRY" ]; then
    log_error "未指定私有镜像仓库地址"
    log_info ""
    log_info "解决方法："
    log_info "1. 使用命令行参数: $0 --registry <地址>"
    log_info "2. 设置环境变量: export PRIVATE_REGISTRY=<地址>"
    log_info "3. 创建配置文件: cp .k8s-config.example .k8s-config"
    log_info "   然后编辑 .k8s-config 文件，设置 PRIVATE_REGISTRY"
    log_info ""
    log_info "示例:"
    log_info "  $0 --registry 192.168.1.100:5000"
    log_info "  或"
    log_info "  export PRIVATE_REGISTRY=192.168.1.100:5000"
    log_info "  $0"
    exit 1
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🚀 K8s 增量构建和部署"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "私有仓库: $PRIVATE_REGISTRY"
log_info "命名空间: $K8S_NAMESPACE"
log_info "基准提交: $LAST_COMMIT"
log_info ""

# 步骤1: 增量构建
if [ "$SKIP_BUILD" != true ]; then
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "📦 步骤 1: 增量构建"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info ""
    
    BUILD_ARGS=(
        "--registry" "$PRIVATE_REGISTRY"
        "--base" "$LAST_COMMIT"
    )
    
    if [ "$BUILD_ALL" = true ]; then
        BUILD_ARGS+=("--all")
    fi
    
    if [ "$DRY_RUN" = true ]; then
        BUILD_ARGS+=("--dry-run")
    fi
    
    if bash "$SCRIPT_DIR/build-incremental-k8s.sh" "${BUILD_ARGS[@]}"; then
        log_success "✅ 增量构建完成"
    else
        log_error "❌ 增量构建失败"
        exit 1
    fi
    
    log_info ""
else
    log_info "跳过构建步骤（--skip-build）"
    log_info ""
fi

# 步骤2: 增量部署
if [ "$SKIP_DEPLOY" != true ]; then
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "⚙️  步骤 2: 增量部署"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info ""
    
    # 获取构建的应用列表（从构建脚本的输出或重新检测）
    # 如果构建失败或跳过，我们需要重新检测
    if [ "$SKIP_BUILD" = true ]; then
        log_info "检测需要部署的应用..."
        
        # 使用构建脚本的检测逻辑
        ALL_APPS=("system-app" "admin-app" "logistics-app" "quality-app" "production-app" "engineering-app" "finance-app")
        CHANGED_APPS=()
        
        if [ "$DEPLOY_ALL" = true ]; then
            CHANGED_APPS=("${ALL_APPS[@]}")
        else
            for app in "${ALL_APPS[@]}"; do
                if ! git diff --quiet "$LAST_COMMIT" HEAD -- "apps/$app/" 2>/dev/null; then
                    CHANGED_APPS+=("$app")
                fi
            done
        fi
        
        if [ ${#CHANGED_APPS[@]} -eq 0 ]; then
            log_warning "未检测到需要部署的应用"
            exit 0
        fi
        
        APPS_TO_DEPLOY=$(IFS=','; echo "${CHANGED_APPS[*]}")
    else
        # 从构建脚本的输出中提取应用列表
        # 这里简化处理，假设构建成功的应用都需要部署
        # 实际应该从构建脚本的输出中解析
        APPS_TO_DEPLOY=""  # 空值表示让部署脚本自动检测
    fi
    
    DEPLOY_ARGS=(
        "--registry" "$PRIVATE_REGISTRY"
        "--namespace" "$K8S_NAMESPACE"
    )
    
    if [ -n "$APPS_TO_DEPLOY" ]; then
        DEPLOY_ARGS+=("--apps" "$APPS_TO_DEPLOY")
    elif [ "$DEPLOY_ALL" = true ]; then
        DEPLOY_ARGS+=("--all")
    fi
    
    if [ "$DRY_RUN" = true ]; then
        DEPLOY_ARGS+=("--dry-run")
    fi
    
    if bash "$SCRIPT_DIR/deploy-incremental-k8s.sh" "${DEPLOY_ARGS[@]}"; then
        log_success "✅ 增量部署完成"
    else
        log_error "❌ 增量部署失败"
        exit 1
    fi
    
    log_info ""
else
    log_info "跳过部署步骤（--skip-deploy）"
    log_info ""
fi

# 总结
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "🎉 增量构建和部署流程完成"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info ""
log_info "查看部署状态:"
log_info "  kubectl get pods -n $K8S_NAMESPACE"
log_info "  kubectl get deployments -n $K8S_NAMESPACE"
log_info ""

