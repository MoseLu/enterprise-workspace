#!/bin/bash

# K8s 增量构建脚本
# 检测变更的应用，仅对变更的应用执行增量构建并推送到私有镜像仓库

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
LAST_COMMIT="${LAST_COMMIT:-HEAD~1}"
BUILD_ALL="${BUILD_ALL:-false}"
DRY_RUN="${DRY_RUN:-false}"

# 所有应用列表
ALL_APPS=("system-app" "admin-app" "logistics-app" "quality-app" "production-app" "engineering-app" "finance-app")

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --registry)
            PRIVATE_REGISTRY="$2"
            shift 2
            ;;
        --base)
            LAST_COMMIT="$2"
            shift 2
            ;;
        --all)
            BUILD_ALL=true
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
            echo "  --registry <addr>  私有镜像仓库地址（必需，如: 192.168.1.100:5000）"
            echo "  --base <ref>       对比的基准 Git 引用（默认: HEAD~1）"
            echo "  --all              构建所有应用（默认: 仅构建变更的应用）"
            echo "  --dry-run          仅显示将要构建的应用，不实际执行"
            echo "  --help, -h         显示帮助信息"
            echo ""
            echo "环境变量:"
            echo "  PRIVATE_REGISTRY   私有镜像仓库地址"
            echo ""
            echo "示例:"
            echo "  $0 --registry 192.168.1.100:5000"
            echo "  $0 --registry 192.168.1.100:5000 --base origin/develop"
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

# 获取 Git SHA（短提交哈希）
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "🔨 K8s 增量构建"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "私有仓库: $PRIVATE_REGISTRY"
log_info "Git SHA: $GIT_SHA"
log_info "基准提交: $LAST_COMMIT"
log_info ""

# 检测变更的应用
detect_changed_apps() {
    local changed_apps=()
    
    if [ "$BUILD_ALL" = true ]; then
        log_info "构建所有应用（--all 模式）"
        changed_apps=("${ALL_APPS[@]}")
        echo "${changed_apps[@]}"
        return 0
    fi
    
    log_info "检测变更的应用（相对于 $LAST_COMMIT）..."
    
    # 检查基准提交是否存在
    if ! git rev-parse --verify "$LAST_COMMIT" >/dev/null 2>&1; then
        log_warning "基准提交 $LAST_COMMIT 不存在，将构建所有应用"
        changed_apps=("${ALL_APPS[@]}")
        echo "${changed_apps[@]}"
        return 0
    fi
    
    # 检测每个应用的变更
    for app in "${ALL_APPS[@]}"; do
        local app_dir="apps/$app"
        
        # 检查应用目录是否存在变更
        if git diff --quiet "$LAST_COMMIT" HEAD -- "$app_dir/" 2>/dev/null; then
            # 检查共享包是否有变更（可能影响所有应用）
            local shared_changed=false
            if ! git diff --quiet "$LAST_COMMIT" HEAD -- packages/ configs/ scripts/ turbo.json package.json pnpm-lock.yaml 2>/dev/null; then
                shared_changed=true
            fi
            
            if [ "$shared_changed" = true ]; then
                log_info "⚠️  $app: 共享包有变更，需要重新构建"
                changed_apps+=("$app")
            else
                log_info "✅ $app: 无变更，跳过构建"
            fi
        else
            log_info "⚠️  $app: 有变更，需要构建"
            changed_apps+=("$app")
        fi
    done
    
    if [ ${#changed_apps[@]} -eq 0 ]; then
        log_warning "未检测到需要构建的应用"
        return 1
    fi
    
    log_success "检测到 ${#changed_apps[@]} 个需要构建的应用: ${changed_apps[*]}"
    echo "${changed_apps[@]}"
    return 0
}

# 增量构建应用
build_app() {
    local app=$1
    local image_tag="$PRIVATE_REGISTRY/$app:$GIT_SHA"
    local image_tag_latest="$PRIVATE_REGISTRY/$app:latest"
    local app_dir="apps/$app"
    
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "🔨 构建应用: $app"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "应用目录: $app_dir"
    log_info "镜像标签: $image_tag"
    log_info ""
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY RUN] 将构建: $image_tag"
        return 0
    fi
    
    # 检查应用目录是否存在
    if [ ! -d "$app_dir" ]; then
        log_error "应用目录不存在: $app_dir"
        return 1
    fi
    
    # 使用 Docker Buildx 增量构建
    log_info "开始增量构建（使用缓存加速）..."
    
    # 构建镜像（使用 BuildKit 缓存）
    if docker buildx build \
        --platform linux/amd64 \
        --cache-from=type=local,src=/var/lib/docker/buildkit/cache \
        --cache-to=type=local,dest=/var/lib/docker/buildkit/cache,mode=max \
        --build-arg APP_DIR="$app_dir" \
        -t "$image_tag" \
        -t "$image_tag_latest" \
        -f Dockerfile \
        . 2>&1 | tee /tmp/docker-build-${app}.log; then
        log_success "✅ 镜像构建成功: $image_tag"
    else
        log_error "❌ 镜像构建失败: $app"
        return 1
    fi
    
    # 推送镜像到私有仓库
    log_info "推送镜像到私有仓库..."
    
    if docker push "$image_tag" 2>&1; then
        log_success "✅ 镜像推送成功: $image_tag"
    else
        log_error "❌ 镜像推送失败: $image_tag"
        return 1
    fi
    
    # 同时推送 latest 标签
    if docker push "$image_tag_latest" 2>&1; then
        log_success "✅ latest 标签推送成功"
    else
        log_warning "⚠️  latest 标签推送失败（可忽略）"
    fi
    
    log_info ""
    return 0
}

# 主函数
main() {
    # 检测变更的应用
    local changed_apps_raw
    if ! changed_apps_raw=$(detect_changed_apps); then
        log_warning "无应用需要构建"
        exit 0
    fi
    
    # 解析应用列表
    read -r -a changed_apps <<< "$changed_apps_raw"
    
    if [ ${#changed_apps[@]} -eq 0 ]; then
        log_warning "无应用需要构建"
        exit 0
    fi
    
    log_info ""
    log_info "开始构建 ${#changed_apps[@]} 个应用..."
    log_info ""
    
    # 构建每个变更的应用
    local build_success=0
    local build_failed=0
    local failed_apps=()
    
    for app in "${changed_apps[@]}"; do
        if build_app "$app"; then
            build_success=$((build_success + 1))
        else
            build_failed=$((build_failed + 1))
            failed_apps+=("$app")
        fi
        log_info ""
    done
    
    # 输出总结
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "📊 构建总结"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "总计: ${#changed_apps[@]} 个应用"
    log_success "成功: $build_success 个"
    if [ $build_failed -gt 0 ]; then
        log_error "失败: $build_failed 个"
        log_error "失败的应用: ${failed_apps[*]}"
    fi
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 输出镜像标签列表（供部署脚本使用）
    if [ $build_success -gt 0 ]; then
        log_info ""
        log_info "构建成功的镜像标签："
        for app in "${changed_apps[@]}"; do
            if [[ ! " ${failed_apps[@]} " =~ " ${app} " ]]; then
                echo "  $PRIVATE_REGISTRY/$app:$GIT_SHA"
            fi
        done
    fi
    
    if [ $build_failed -gt 0 ]; then
        exit 1
    fi
}

# 运行主函数
main

