#!/bin/bash

# 将 main-app 的 EPS 产物复制到其他子应用
# 确保所有子应用都能共享相同的 EPS 数据

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

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# main-app 的 EPS 数据源
MAIN_EPS_DIR="apps/main-app/build/eps"

# 需要复制 EPS 数据的子应用列表
SUB_APPS=(
  "admin-app"
  "logistics-app"
  "engineering-app"
  "quality-app"
  "production-app"
  "finance-app"
  "system-app"
)

# 检查 main-app 的 EPS 数据是否存在
if [ ! -d "$MAIN_EPS_DIR" ]; then
  log_error "main-app 的 EPS 数据目录不存在: $MAIN_EPS_DIR"
  log_info "请先构建 main-app 以生成 EPS 数据"
  exit 1
fi

# 检查 EPS 数据文件是否存在
if [ ! -f "$MAIN_EPS_DIR/eps.json" ]; then
  log_error "main-app 的 EPS 数据文件不存在: $MAIN_EPS_DIR/eps.json"
  log_info "请先构建 main-app 以生成 EPS 数据"
  exit 1
fi

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "📦 复制 main-app 的 EPS 数据到其他子应用"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "EPS 数据源: $MAIN_EPS_DIR"
log_info ""

# 复制 EPS 数据到每个子应用
for app in "${SUB_APPS[@]}"; do
  app_dir="apps/$app"
  target_eps_dir="$app_dir/build/eps"
  
  if [ ! -d "$app_dir" ]; then
    log_warning "应用目录不存在，跳过: $app_dir"
    continue
  fi
  
  log_info "复制 EPS 数据到 $app..."
  
  # 创建目标目录
  mkdir -p "$target_eps_dir"
  
  # 复制所有 EPS 文件
  if [ -f "$MAIN_EPS_DIR/eps.json" ]; then
    cp "$MAIN_EPS_DIR/eps.json" "$target_eps_dir/eps.json"
    log_info "  ✓ 复制 eps.json"
  fi
  
  if [ -f "$MAIN_EPS_DIR/eps.d.ts" ]; then
    cp "$MAIN_EPS_DIR/eps.d.ts" "$target_eps_dir/eps.d.ts"
    log_info "  ✓ 复制 eps.d.ts"
  fi
  
  # 复制其他可能存在的 EPS 相关文件
  if [ -d "$MAIN_EPS_DIR" ]; then
    for file in "$MAIN_EPS_DIR"/*; do
      if [ -f "$file" ] && [[ "$(basename "$file")" != "eps.json" ]] && [[ "$(basename "$file")" != "eps.d.ts" ]]; then
        cp "$file" "$target_eps_dir/$(basename "$file")"
        log_info "  ✓ 复制 $(basename "$file")"
      fi
    done
  fi
  
  log_success "✅ $app 的 EPS 数据已更新"
done

log_info ""
log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "✅ EPS 数据复制完成"
log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

