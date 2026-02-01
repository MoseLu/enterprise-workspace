#!/bin/bash

# Docker 远程连接环境变量配置
# 使用: source scripts/load-env.sh

export SERVER_HOST="47.112.31.96"
export SERVER_USER="root"
export SERVER_PORT="22"
export REMOTE_PATH="/www/wwwroot/btc-shopflow-monorepo"
export SSH_KEY="/mnt/c/Users/mlu/.ssh/github_action_key"

# 如果配置了 SSH config，可以使用直接连接模式
# export DOCKER_HOST="ssh://btc-shopflow-server"

echo "Docker 远程连接已配置:"
echo "  SERVER_HOST: $SERVER_HOST"
echo "  SERVER_USER: $SERVER_USER"
echo "  SERVER_PORT: $SERVER_PORT"
echo "  REMOTE_PATH: $REMOTE_PATH"
echo "  SSH_KEY: $SSH_KEY"
if [ -n "$DOCKER_HOST" ]; then
    echo "  DOCKER_HOST: $DOCKER_HOST"
fi
echo ""
echo "现在可以使用: pnpm build-deploy:system"

