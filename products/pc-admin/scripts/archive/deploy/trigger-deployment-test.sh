#!/bin/bash

# 触发部署测试脚本
# 在部署完成后自动触发测试

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

# 解析参数
APPS="${1:-}"
TIMEOUT="${2:-30000}"
BASE_URL="${3:-}"
MAX_RETRIES="${4:-3}"
RETRY_DELAY="${5:-300}"

# 检查是否启用自动测试
AUTO_TEST="${AUTO_TEST:-true}"
if [ "$AUTO_TEST" != "true" ]; then
  log_info "自动测试已禁用 (AUTO_TEST=false)"
  exit 0
fi

log_info "🚀 触发部署测试..."

# 构建测试命令
TEST_CMD="node scripts/test-deployment.mjs"

# 添加应用参数
if [ -n "$APPS" ]; then
  # 检查是单个应用还是多个应用
  if [[ "$APPS" == *","* ]]; then
    TEST_CMD="$TEST_CMD --apps $APPS"
  else
    TEST_CMD="$TEST_CMD --app $APPS"
  fi
else
  TEST_CMD="$TEST_CMD --all"
fi

# 添加超时参数
if [ -n "$TIMEOUT" ]; then
  TEST_CMD="$TEST_CMD --timeout $TIMEOUT"
fi

# 添加基础URL参数
if [ -n "$BASE_URL" ]; then
  TEST_CMD="$TEST_CMD --base-url $BASE_URL"
fi

# 设置输出目录
TEST_CMD="$TEST_CMD --output test-results"

log_info "执行命令: $TEST_CMD"

# 执行测试（最多重试指定次数）
RETRY_COUNT=0
TEST_SUCCESS=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  log_info ""
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log_info "第 $((RETRY_COUNT + 1)) 次测试尝试"
  log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  if eval "$TEST_CMD"; then
    TEST_SUCCESS=true
    log_success "测试通过！"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      log_warning "测试失败，将在 ${RETRY_DELAY} 秒后重试..."
      log_info "剩余重试次数: $((MAX_RETRIES - RETRY_COUNT))"
      sleep $RETRY_DELAY
    else
      log_error "测试失败，已达到最大重试次数"
    fi
  fi
done

if [ "$TEST_SUCCESS" = true ]; then
  log_success "✅ 部署测试完成并通过"
  exit 0
else
  log_error "❌ 部署测试失败"
  exit 1
fi

