#!/bin/bash
# 检查 Verdaccio 状态和包发布情况

set -e

echo "=== Verdaccio 状态检查 ==="

# 1. 检查 Verdaccio 是否运行
echo ""
echo "1. 检查 Verdaccio 服务..."
if curl -s http://localhost:4873 > /dev/null 2>&1; then
    echo "✓ Verdaccio 正在运行"
    echo "  访问地址: http://localhost:4873"
else
    echo "✗ Verdaccio 未运行"
    echo "  请运行: ./scripts/start-verdaccio.sh"
    exit 1
fi

# 2. 检查登录状态
echo ""
echo "2. 检查登录状态..."
if npm whoami --registry http://localhost:4873 > /dev/null 2>&1; then
    WHOAMI=$(npm whoami --registry http://localhost:4873)
    echo "✓ 已登录为: $WHOAMI"
else
    echo "✗ 未登录"
    echo "  请运行: npm login --registry http://localhost:4873"
    exit 1
fi

# 3. 检查已发布的包
echo ""
echo "3. 检查已发布的包..."
declare -a packages=(
    "@btc/shared-utils"
    "@btc/shared-core"
    "@btc/subapp-manifests"
    "@btc/vite-plugin"
    "@btc/shared-components"
)

ALL_PUBLISHED=true
for pkg in "${packages[@]}"; do
    if npm view "$pkg" --registry http://localhost:4873 > /dev/null 2>&1; then
        echo "  ✓ $pkg 已发布"
    else
        echo "  ✗ $pkg 未发布"
        ALL_PUBLISHED=false
    fi
done

if [ "$ALL_PUBLISHED" = true ]; then
    echo ""
    echo "✓ 所有包已发布，可以使用 npm/pnpm 安装"
    echo ""
    echo "使用示例:"
    echo "  pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests"
else
    echo ""
    echo "✗ 部分包未发布，请运行发布脚本"
    echo "  运行: ./scripts/publish-to-verdaccio.sh"
fi

