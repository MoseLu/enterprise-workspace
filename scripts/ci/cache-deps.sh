#!/bin/bash
# =============================================================================
# 依赖缓存脚本
# 功能：管理 CI/CD 中的依赖缓存
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

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# 缓存目录
CACHE_DIR="${CACHE_DIR:-$HOME/.cache/project-deps}"

# 操作类型: save, restore, clean
OPERATION=${1:-restore}

# 获取缓存键
get_cache_key() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)
    local node_version=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1,2 || echo "unknown")
    local project_hash=$(find . -name "package.json" -o -name "requirements.txt" -o -name "pom.xml" -o -name "go.mod" | sort | xargs cat 2>/dev/null | md5sum | cut -d' ' -f1 | head -c 16)
    
    echo "${os}-${arch}-node${node_version}-${project_hash}"
}

# 缓存目录路径
get_cache_path() {
    local key=$1
    echo "$CACHE_DIR/$key"
}

# 保存 Node.js 依赖缓存
save_node_cache() {
    local cache_path=$1
    local frontend_dir="$PROJECT_ROOT/frontend"
    local backend_dir="$PROJECT_ROOT/backend"
    
    log_info "保存 Node.js 依赖缓存..."
    
    mkdir -p "$cache_path/node"
    
    # 前端依赖
    if [ -d "$frontend_dir/node_modules" ]; then
        cp -r "$frontend_dir/node_modules" "$cache_path/node/frontend" 2>/dev/null || true
    fi
    
    # 后端依赖
    if [ -d "$backend_dir/node_modules" ]; then
        cp -r "$backend_dir/node_modules" "$cache_path/node/backend" 2>/dev/null || true
    fi
    
    # 缓存 package-lock.json
    [ -f "$frontend_dir/package-lock.json" ] && cp "$frontend_dir/package-lock.json" "$cache_path/node/" 2>/dev/null || true
    [ -f "$backend_dir/package-lock.json" ] && cp "$backend_dir/package-lock.json" "$cache_path/node/" 2>/dev/null || true
    
    log_info "Node.js 依赖缓存已保存: $cache_path/node"
}

# 保存 Python 依赖缓存
save_python_cache() {
    local cache_path=$1
    local backend_dir="$PROJECT_ROOT/backend"
    
    log_info "保存 Python 依赖缓存..."
    
    mkdir -p "$cache_path/python"
    
    # Python 虚拟环境
    if [ -d "$backend_dir/venv" ]; then
        cp -r "$backend_dir/venv" "$cache_path/python/venv" 2>/dev/null || true
    fi
    
    # Pip 缓存
    mkdir -p "$cache_path/python/pip-cache"
    pip download -d "$cache_path/python/pip-cache" -r "$backend_dir/requirements.txt" 2>/dev/null || true
    
    log_info "Python 依赖缓存已保存: $cache_path/python"
}

# 恢复 Node.js 依赖缓存
restore_node_cache() {
    local cache_path=$1
    local frontend_dir="$PROJECT_ROOT/frontend"
    local backend_dir="$PROJECT_ROOT/backend"
    
    log_info "恢复 Node.js 依赖缓存..."
    
    if [ -d "$cache_path/node/frontend" ]; then
        mkdir -p "$frontend_dir/node_modules"
        cp -r "$cache_path/node/frontend/"* "$frontend_dir/node_modules/" 2>/dev/null || true
        log_info "前端依赖已恢复"
    fi
    
    if [ -d "$cache_path/node/backend" ]; then
        mkdir -p "$backend_dir/node_modules"
        cp -r "$cache_path/node/backend/"* "$backend_dir/node_modules/" 2>/dev/null || true
        log_info "后端依赖已恢复"
    fi
}

# 恢复 Python 依赖缓存
restore_python_cache() {
    local cache_path=$1
    local backend_dir="$PROJECT_ROOT/backend"
    
    log_info "恢复 Python 依赖缓存..."
    
    if [ -d "$cache_path/python/venv" ]; then
        cp -r "$cache_path/python/venv" "$backend_dir/" 2>/dev/null || true
        log_info "Python 虚拟环境已恢复"
    fi
    
    if [ -d "$cache_path/python/pip-cache" ]; then
        pip install --no-index --find-links="$cache_path/python/pip-cache" -r "$backend_dir/requirements.txt" 2>/dev/null || true
        log_info "Python 依赖已从缓存安装"
    fi
}

# 保存缓存
save_cache() {
    local cache_key=$(get_cache_key)
    local cache_path=$(get_cache_path "$cache_key")
    
    echo ""
    echo "=========================================="
    echo "     保存依赖缓存"
    echo "=========================================="
    echo ""
    log_info "缓存键: $cache_key"
    log_info "缓存路径: $cache_path"
    echo ""
    
    # 确保缓存目录存在
    mkdir -p "$cache_path"
    
    # 保存各类依赖
    save_node_cache "$cache_path"
    save_python_cache "$cache_path"
    
    # 保存缓存信息
    cat > "$cache_path/cache-info.json" << EOF
{
    "key": "$cache_key",
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "project_root": "$PROJECT_ROOT"
}
EOF
    
    log_info "缓存保存完成"
    
    # 清理旧缓存
    clean_old_caches "$cache_key"
}

# 恢复缓存
restore_cache() {
    local cache_key=$(get_cache_key)
    local cache_path=$(get_cache_path "$cache_key")
    
    echo ""
    echo "=========================================="
    echo "     恢复依赖缓存"
    echo "=========================================="
    echo ""
    log_info "缓存键: $cache_key"
    log_info "缓存路径: $cache_path"
    echo ""
    
    if [ -d "$cache_path" ]; then
        log_info "找到缓存，正在恢复..."
        
        restore_node_cache "$cache_path"
        restore_python_cache "$cache_path"
        
        log_info "缓存恢复完成"
    else
        log_warn "未找到缓存，将从头安装依赖"
    fi
}

# 清理旧缓存
clean_old_caches() {
    local current_key=$1
    local max_caches=${MAX_CACHES:-5}
    
    log_info "清理旧缓存 (保留最新 $max_caches 个)..."
    
    # 获取所有缓存目录
    local caches=$(ls -t "$CACHE_DIR" 2>/dev/null | grep -v "$current_key" || true)
    local count=$(echo "$caches" | wc -l)
    
    if [ "$count" -ge "$max_caches" ]; then
        local to_delete=$(echo "$caches" | tail -n +$((max_caches + 1)))
        for cache in $to_delete; do
            rm -rf "$CACHE_DIR/$cache"
            log_info "已删除旧缓存: $cache"
        done
    fi
}

# 清理所有缓存
clean_cache() {
    echo ""
    echo "=========================================="
    echo "     清理依赖缓存"
    echo "=========================================="
    echo ""
    
    if [ -d "$CACHE_DIR" ]; then
        rm -rf "$CACHE_DIR"
        log_info "所有缓存已清理"
    else
        log_info "没有缓存需要清理"
    fi
}

# 显示缓存状态
show_cache_status() {
    local cache_key=$(get_cache_key)
    local cache_path=$(get_cache_path "$cache_key")
    
    echo ""
    echo "=========================================="
    echo "     缓存状态"
    echo "=========================================="
    echo ""
    log_info "缓存键: $cache_key"
    log_info "缓存目录: $CACHE_DIR"
    echo ""
    
    if [ -d "$cache_path" ]; then
        log_info "当前缓存: 已存在"
        echo ""
        echo "缓存内容:"
        ls -lh "$cache_path" 2>/dev/null || true
    else
        log_warn "当前缓存: 不存在"
    fi
    
    echo ""
    echo "所有缓存:"
    ls -lt "$CACHE_DIR" 2>/dev/null || echo "  无缓存"
}

# 主函数
main() {
    echo "=========================================="
    echo "     依赖缓存管理"
    echo "=========================================="
    echo ""
    log_info "操作: $OPERATION"
    log_info "项目根目录: $PROJECT_ROOT"
    log_info "缓存目录: $CACHE_DIR"
    echo ""
    
    case $OPERATION in
        save)
            save_cache
            ;;
        restore)
            restore_cache
            ;;
        clean)
            clean_cache
            ;;
        status)
            show_cache_status
            ;;
        *)
            log_error "未知操作: $OPERATION"
            echo ""
            echo "用法: $0 [save|restore|clean|status]"
            echo ""
            echo "  save     - 保存当前依赖到缓存"
            echo "  restore  - 从缓存恢复依赖"
            echo "  clean    - 清理所有缓存"
            echo "  status   - 显示缓存状态"
            exit 1
            ;;
    esac
}

main "$@"
