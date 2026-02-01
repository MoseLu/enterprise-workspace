#!/bin/bash

# K8s 增量部署脚本
# 仅更新变更的应用到 K8s 集群

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
GIT_SHA="${GIT_SHA:-}"
APPS_TO_DEPLOY="${APPS_TO_DEPLOY:-}"
DEPLOY_ALL="${DEPLOY_ALL:-false}"
DRY_RUN="${DRY_RUN:-false}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-300}"  # 5分钟超时

# 应用名称到 Deployment 名称的映射
declare -A DEPLOYMENT_NAMES=(
    ["system-app"]="btc-system-app"
    ["admin-app"]="btc-admin-app"
    ["logistics-app"]="btc-logistics-app"
    ["quality-app"]="btc-quality-app"
    ["production-app"]="btc-production-app"
    ["engineering-app"]="btc-engineering-app"
    ["finance-app"]="btc-finance-app"
)

# 所有应用列表
ALL_APPS=("system-app" "admin-app" "logistics-app" "quality-app" "production-app" "engineering-app" "finance-app")

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
        --sha)
            GIT_SHA="$2"
            shift 2
            ;;
        --apps)
            APPS_TO_DEPLOY="$2"
            shift 2
            ;;
        --all)
            DEPLOY_ALL=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --timeout)
            WAIT_TIMEOUT="$2"
            shift 2
            ;;
        --help|-h)
            echo "用法: $0 [OPTIONS]"
            echo ""
            echo "选项:"
            echo "  --registry <addr>   私有镜像仓库地址（必需）"
            echo "  --namespace <ns>    K8s 命名空间（默认: btc-shopflow）"
            echo "  --sha <hash>       镜像标签的 Git SHA（默认: 自动检测）"
            echo "  --apps <list>       要部署的应用列表，逗号分隔（如: system-app,admin-app）"
            echo "  --all               部署所有应用"
            echo "  --dry-run           仅显示将要部署的应用，不实际执行"
            echo "  --timeout <sec>     等待部署完成的超时时间（默认: 300秒）"
            echo "  --help, -h          显示帮助信息"
            echo ""
            echo "环境变量:"
            echo "  PRIVATE_REGISTRY    私有镜像仓库地址"
            echo "  K8S_NAMESPACE       K8s 命名空间"
            echo "  GIT_SHA             镜像标签的 Git SHA"
            echo "  APPS_TO_DEPLOY      要部署的应用列表（逗号分隔）"
            echo ""
            echo "示例:"
            echo "  $0 --registry 192.168.1.100:5000 --apps system-app,admin-app"
            echo "  $0 --registry 192.168.1.100:5000 --all"
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
    log_info "使用方法: $0 --registry <地址>"
    log_info "或设置环境变量: PRIVATE_REGISTRY=<地址>"
    exit 1
fi

# 检查 kubectl 是否可用
if ! command -v kubectl &> /dev/null; then
    log_error "kubectl 未安装或不在 PATH 中"
    exit 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 加载配置文件（如果存在）
if [ -f "$PROJECT_ROOT/.k8s-config" ]; then
    while IFS='=' read -r key value; do
        [[ "$key" =~ ^#.*$ ]] && continue
        [[ -z "$key" ]] && continue
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        if [ -n "$value" ]; then
            export "$key=$value"
        fi
    done < "$PROJECT_ROOT/.k8s-config"
fi

# 如果仍未设置，使用默认值或从环境变量获取
if [ -z "$PRIVATE_REGISTRY" ]; then
    PRIVATE_REGISTRY="${PRIVATE_REGISTRY:-}"
fi
if [ -z "$K8S_NAMESPACE" ]; then
    K8S_NAMESPACE="${K8S_NAMESPACE:-btc-shopflow}"
fi

# 自动检测 Git SHA（如果未指定）
if [ -z "$GIT_SHA" ]; then
    GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "⚙️  K8s 增量部署"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "私有仓库: $PRIVATE_REGISTRY"
log_info "命名空间: $K8S_NAMESPACE"
log_info "Git SHA: $GIT_SHA"
log_info ""

# 检查命名空间是否存在
if ! kubectl get namespace "$K8S_NAMESPACE" >/dev/null 2>&1; then
    log_warning "命名空间 $K8S_NAMESPACE 不存在，将创建..."
    if [ "$DRY_RUN" != true ]; then
        kubectl create namespace "$K8S_NAMESPACE"
        log_success "命名空间已创建"
    else
        log_info "[DRY RUN] 将创建命名空间: $K8S_NAMESPACE"
    fi
fi

# 确定要部署的应用列表
determine_apps_to_deploy() {
    local apps=()
    
    if [ "$DEPLOY_ALL" = true ]; then
        log_info "部署所有应用（--all 模式）"
        apps=("${ALL_APPS[@]}")
    elif [ -n "$APPS_TO_DEPLOY" ]; then
        log_info "使用指定的应用列表: $APPS_TO_DEPLOY"
        IFS=',' read -r -a apps <<< "$APPS_TO_DEPLOY"
    else
        log_error "未指定要部署的应用"
        log_info "使用方法:"
        log_info "  $0 --registry <地址> --apps <应用列表>"
        log_info "  $0 --registry <地址> --all"
        exit 1
    fi
    
    echo "${apps[@]}"
}

# 部署单个应用
deploy_app() {
    local app=$1
    local deployment_name="${DEPLOYMENT_NAMES[$app]}"
    local image_tag="$PRIVATE_REGISTRY/$app:$GIT_SHA"
    local image_tag_latest="$PRIVATE_REGISTRY/$app:latest"
    
    if [ -z "$deployment_name" ]; then
        log_error "未知应用: $app"
        return 1
    fi
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🚀 部署应用: $app"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Deployment: $deployment_name"
    log_info "镜像标签: $image_tag"
    log_info ""
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] 将部署: $deployment_name"
        log_info "[DRY RUN] 镜像: $image_tag"
        return 0
    fi
    
    # 检查 Deployment 是否存在
    if kubectl get deployment "$deployment_name" -n "$K8S_NAMESPACE" >/dev/null 2>&1; then
        log_info "Deployment 已存在，更新镜像..."
        
        # 更新镜像（使用容器名称，不是 Deployment 名称）
        if kubectl set image deployment/"$deployment_name" "$app=$image_tag" -n "$K8S_NAMESPACE" 2>&1; then
            log_success "✅ 镜像更新成功"
        else
            log_error "❌ 镜像更新失败"
            return 1
        fi
        
        # 等待滚动更新完成
        log_info "等待滚动更新完成（超时: ${WAIT_TIMEOUT}秒）..."
        if kubectl rollout status deployment/"$deployment_name" -n "$K8S_NAMESPACE" --timeout="${WAIT_TIMEOUT}s" 2>&1; then
            log_success "✅ 滚动更新完成"
        else
            log_error "❌ 滚动更新失败或超时"
            log_info "查看 Pod 状态:"
            kubectl get pods -n "$K8S_NAMESPACE" -l app="$deployment_name" 2>&1 || true
            log_info "查看事件:"
            kubectl describe deployment "$deployment_name" -n "$K8S_NAMESPACE" 2>&1 | tail -20 || true
            return 1
        fi
    else
        log_info "Deployment 不存在，创建新部署..."
        
        # 检查是否有对应的 YAML 文件
        local yaml_file="k8s/deployments/$app.yaml"
        if [ ! -f "$yaml_file" ]; then
            # 尝试查找在 all-apps.yaml 中
            log_warning "未找到 $yaml_file，尝试从 all-apps.yaml 提取..."
            yaml_file="k8s/deployments/all-apps.yaml"
        fi
        
        if [ -f "$yaml_file" ]; then
            # 临时修改镜像地址（使用 sed 或 envsubst）
            log_info "使用配置文件: $yaml_file"
            
            # 创建临时文件，替换镜像地址
            local temp_file=$(mktemp)
            sed "s|image:.*$app:.*|image: $image_tag|g" "$yaml_file" > "$temp_file"
            
            if kubectl apply -f "$temp_file" -n "$K8S_NAMESPACE" 2>&1; then
                log_success "✅ Deployment 创建成功"
                rm -f "$temp_file"
            else
                log_error "❌ Deployment 创建失败"
                rm -f "$temp_file"
                return 1
            fi
            
            # 等待部署就绪
            log_info "等待部署就绪（超时: ${WAIT_TIMEOUT}秒）..."
            if kubectl rollout status deployment/"$deployment_name" -n "$K8S_NAMESPACE" --timeout="${WAIT_TIMEOUT}s" 2>&1; then
                log_success "✅ 部署就绪"
            else
                log_error "❌ 部署未就绪或超时"
                return 1
            fi
        else
            log_error "未找到部署配置文件: $yaml_file"
            return 1
        fi
    fi
    
    # 验证部署状态
    log_info "验证部署状态..."
    local ready_replicas=$(kubectl get deployment "$deployment_name" -n "$K8S_NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    local desired_replicas=$(kubectl get deployment "$deployment_name" -n "$K8S_NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
    
    if [ "$ready_replicas" = "$desired_replicas" ] && [ "$ready_replicas" != "0" ]; then
        log_success "✅ 部署验证成功: $ready_replicas/$desired_replicas Pods 就绪"
    else
        log_warning "⚠️  部署状态: $ready_replicas/$desired_replicas Pods 就绪"
    fi
    
    log_info ""
    return 0
}

# 主函数
main() {
    # 确定要部署的应用
    local apps_raw
    apps_raw=$(determine_apps_to_deploy)
    read -r -a apps <<< "$apps_raw"
    
    if [ ${#apps[@]} -eq 0 ]; then
        log_warning "无应用需要部署"
        exit 0
    fi
    
    log_info "开始部署 ${#apps[@]} 个应用..."
    log_info ""
    
    # 部署每个应用
    local deploy_success=0
    local deploy_failed=0
    local failed_apps=()
    
    for app in "${apps[@]}"; do
        if deploy_app "$app"; then
            deploy_success=$((deploy_success + 1))
        else
            deploy_failed=$((deploy_failed + 1))
            failed_apps+=("$app")
        fi
    done
    
    # 输出总结
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "📊 部署总结"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "总计: ${#apps[@]} 个应用"
    log_success "成功: $deploy_success 个"
    if [ $deploy_failed -gt 0 ]; then
        log_error "失败: $deploy_failed 个"
        log_error "失败的应用: ${failed_apps[*]}"
    fi
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ $deploy_failed -gt 0 ]; then
        exit 1
    fi
}

# 运行主函数
main

