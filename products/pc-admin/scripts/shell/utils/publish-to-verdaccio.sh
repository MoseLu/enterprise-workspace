#!/bin/bash
# 发布共享组件库到 Verdaccio 私有仓库

set -e

echo "=== 发布共享组件库到 Verdaccio ==="

# 检查 Verdaccio 是否运行
if ! curl -s http://localhost:4873 > /dev/null 2>&1; then
    echo "警告: Verdaccio 未运行，请先启动 Verdaccio"
    echo "运行: ./scripts/start-verdaccio.sh"
    exit 1
fi

echo "✓ Verdaccio 正在运行"

# 检查是否已登录
echo ""
echo "检查登录状态..."
if ! npm whoami --registry http://localhost:4873 > /dev/null 2>&1; then
    echo "未登录，请先登录 Verdaccio"
    echo "运行: npm login --registry http://localhost:4873"
    exit 1
fi

WHOAMI=$(npm whoami --registry http://localhost:4873)
echo "✓ 已登录为: $WHOAMI"

# 定义要发布的包（按依赖顺序）
declare -a packages=(
    "shared-utils:packages/shared-utils"
    "shared-core:packages/shared-core"
    "subapp-manifests:packages/subapp-manifests"
    "vite-plugin:packages/vite-plugin"
    "shared-components:packages/shared-components"
)

# 构建所有包
echo ""
echo "=== 构建所有包 ==="
for pkg_info in "${packages[@]}"; do
    IFS=':' read -r pkg_name pkg_path <<< "$pkg_info"
    echo "构建 $pkg_name..."
    
    (
        cd "$pkg_path"
        
        # 检查是否有构建脚本
        if grep -q '"build"' package.json; then
            pnpm run build
            if [ $? -ne 0 ]; then
                echo "✗ $pkg_name 构建失败"
                exit 1
            fi
        fi
        echo "✓ $pkg_name 构建完成"
    )
done

# 发布所有包
echo ""
echo "=== 发布包到 Verdaccio ==="
for pkg_info in "${packages[@]}"; do
    IFS=':' read -r pkg_name pkg_path <<< "$pkg_info"
    echo "发布 $pkg_name..."
    
    (
        cd "$pkg_path"
        
        # 检查 dist 目录是否存在
        if [ ! -d "dist" ]; then
            echo "✗ $pkg_name dist 目录不存在，请先构建"
            exit 0
        fi
        
        # 发布包
        npm publish --registry http://localhost:4873
        if [ $? -eq 0 ]; then
            echo "✓ $pkg_name 发布成功"
        else
            echo "✗ $pkg_name 发布失败"
        fi
    )
done

echo ""
echo "=== 发布完成 ==="
echo "访问 Verdaccio Web UI: http://localhost:4873"

