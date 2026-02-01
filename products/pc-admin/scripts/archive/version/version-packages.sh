#!/bin/bash

# 批量更新共享组件库版本号

set -e

if [ $# -lt 1 ]; then
    echo "用法: $0 <patch|minor|major|prepatch|preminor|premajor> [custom-version]"
    echo ""
    echo "示例:"
    echo "  $0 patch              # 更新补丁版本 (1.0.0 -> 1.0.1)"
    echo "  $0 minor              # 更新次要版本 (1.0.0 -> 1.1.0)"
    echo "  $0 major              # 更新主版本 (1.0.0 -> 2.0.0)"
    echo "  $0 patch 1.0.5       # 使用自定义版本号"
    exit 1
fi

TYPE=$1
CUSTOM_VERSION=$2

# 验证版本类型
if [ -z "$CUSTOM_VERSION" ]; then
    case $TYPE in
        patch|minor|major|prepatch|preminor|premajor)
            ;;
        *)
            echo "错误: 无效的版本类型: $TYPE"
            echo "有效类型: patch, minor, major, prepatch, preminor, premajor"
            exit 1
            ;;
    esac
fi

echo -e "\e[36m=== 更新共享组件库版本号 ===\e[0m"

# 定义要更新的包（按依赖顺序）
PACKAGES=(
    "packages/shared-utils"
    "packages/shared-core"
    "packages/subapp-manifests"
    "packages/vite-plugin"
    "packages/shared-components"
)

if [ -n "$CUSTOM_VERSION" ]; then
    echo -e "\n\e[33m使用自定义版本号: $CUSTOM_VERSION\e[0m"
    
    for PKG_PATH in "${PACKAGES[@]}"; do
        PKG_NAME=$(basename "$PKG_PATH")
        echo -e "\e[90m更新 $PKG_NAME 版本为 $CUSTOM_VERSION...\e[0m"
        
        (cd "$PKG_PATH" && \
            OLD_VERSION=$(node -p "require('./package.json').version") && \
            node -e "const pkg = require('./package.json'); pkg.version = '$CUSTOM_VERSION'; require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');" && \
            echo -e "  \e[32m✓ $PKG_NAME: $OLD_VERSION -> $CUSTOM_VERSION\e[0m")
    done
else
    echo -e "\n\e[33m使用版本类型: $TYPE\e[0m"
    
    for PKG_PATH in "${PACKAGES[@]}"; do
        PKG_NAME=$(basename "$PKG_PATH")
        echo -e "\e[90m更新 $PKG_NAME ($TYPE)...\e[0m"
        
        (cd "$PKG_PATH" && \
            OLD_VERSION=$(node -p "require('./package.json').version") && \
            pnpm version $TYPE --no-git-tag-version && \
            NEW_VERSION=$(node -p "require('./package.json').version") && \
            echo -e "  \e[32m✓ $PKG_NAME: $OLD_VERSION -> $NEW_VERSION\e[0m")
    done
fi

echo -e "\n\e[36m=== 版本号更新完成 ===\e[0m"
echo -e "\n\e[33m下一步：\e[0m"
echo -e "  \e[90m1. 构建所有包: pnpm run predev:all\e[0m"
echo -e "  \e[90m2. 发布到 Verdaccio: bash scripts/publish-with-pnpm.sh\e[0m"

