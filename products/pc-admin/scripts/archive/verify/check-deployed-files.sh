#!/bin/bash

# 检查服务器上部署的文件是否正确

SERVER_HOST="${SERVER_HOST:-10.80.8.199}"
SERVER_USER="${SERVER_USER:-root}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

DOMAIN="admin.bellis.com.cn"
DEPLOY_PATH="/www/wwwroot/$DOMAIN"

echo "🔍 检查服务器上部署的文件..."
echo "服务器: $SERVER_HOST"
echo "路径: $DEPLOY_PATH"
echo ""

# 检查 vendor 文件
echo "📁 检查 vendor 文件:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
  if [ -d \"$DEPLOY_PATH/assets\" ]; then
    echo '找到的 vendor 文件:'
    ls -lh \"$DEPLOY_PATH/assets/vendor-\"*.js 2>/dev/null | head -5
    echo ''
    echo '检查 vendor 文件中的旧引用:'
    for file in \"$DEPLOY_PATH/assets/vendor-\"*.js; do
      if [ -f \"\$file\" ]; then
        echo \"检查: \$(basename \$file)\"
        if grep -q 'B2xaJ9jT\|Ct0QBumG\|B9_7Pxt3\|xGZ3tz7L\|BvEZP9Mb' \"\$file\" 2>/dev/null; then
          echo '  ❌ 发现旧引用!'
          grep -o '/assets/[a-zA-Z0-9_-]*\.js' \"\$file\" | grep -E '(B2xaJ9jT|Ct0QBumG|B9_7Pxt3|xGZ3tz7L|BvEZP9Mb)' | head -5
        else
          echo '  ✅ 未发现旧引用'
        fi
        break
      fi
    done
  else
    echo '❌ assets 目录不存在'
  fi
"

echo ""
echo "📄 检查 index.html:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
  if [ -f \"$DEPLOY_PATH/index.html\" ]; then
    echo 'index.html 中的引用:'
    grep -o 'href=\"/assets/[^\"]*\"' \"$DEPLOY_PATH/index.html\" | head -10
    echo ''
    if grep -q 'B2xaJ9jT\|Ct0QBumG\|B9_7Pxt3\|xGZ3tz7L\|BvEZP9Mb' \"$DEPLOY_PATH/index.html\" 2>/dev/null; then
      echo '❌ index.html 中包含旧引用!'
    else
      echo '✅ index.html 中没有旧引用'
    fi
  else
    echo '❌ index.html 不存在'
  fi
"

