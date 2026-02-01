#!/bin/bash
# 启动 Verdaccio 私有仓库

set -e

# 检查 Verdaccio 是否已安装
if ! command -v verdaccio &> /dev/null; then
    echo "错误: Verdaccio 未安装"
    echo "请运行: pnpm add -g verdaccio"
    exit 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_DIR="$PROJECT_ROOT/configs/verdaccio"

# 确定配置文件位置
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash)
    VERDACCIO_CONFIG_DIR="$APPDATA/verdaccio"
else
    # Linux/Mac
    VERDACCIO_CONFIG_DIR="$HOME/.config/verdaccio"
fi

# 如果配置文件不存在，从项目复制
if [ ! -f "$VERDACCIO_CONFIG_DIR/config.yaml" ]; then
    echo "配置文件不存在，正在创建..."
    mkdir -p "$VERDACCIO_CONFIG_DIR"
    cp "$CONFIG_DIR/config.yaml" "$VERDACCIO_CONFIG_DIR/config.yaml"
    echo "配置文件已创建: $VERDACCIO_CONFIG_DIR/config.yaml"
fi

# 启动 Verdaccio
echo "正在启动 Verdaccio..."
echo "访问地址: http://localhost:4873"
verdaccio
