#!/bin/bash

# 诊断 admin.bellis.com.cn 的 404 问题
# 检查服务器上的实际文件和 vendor 文件中的引用

set -e

# 配置
SERVER_HOST="${SERVER_HOST:-10.80.8.199}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

DEPLOY_PATH="/www/wwwroot/admin.bellis.com.cn"

echo "🔍 诊断 admin.bellis.com.cn 的 404 问题..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# SSH 连接参数
SSH_OPTS="-i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=10"

# 1. 检查部署目录是否存在
echo "1️⃣ 检查部署目录..."
if ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "[ -d $DEPLOY_PATH ]"; then
    echo "✅ 部署目录存在: $DEPLOY_PATH"
else
    echo "❌ 部署目录不存在: $DEPLOY_PATH"
    exit 1
fi

# 2. 列出所有 assets 文件
echo ""
echo "2️⃣ 列出所有 assets 文件..."
ASSETS_FILES=$(ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "find $DEPLOY_PATH/assets -type f -name '*.js' -o -name '*.css' 2>/dev/null | sort")
echo "$ASSETS_FILES" | head -20
TOTAL_FILES=$(echo "$ASSETS_FILES" | wc -l)
echo "总共 $TOTAL_FILES 个文件"

# 3. 查找 vendor 文件
echo ""
echo "3️⃣ 查找 vendor 文件..."
VENDOR_FILES=$(ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "find $DEPLOY_PATH/assets -name 'vendor-*.js' 2>/dev/null")
echo "$VENDOR_FILES"

# 4. 检查 vendor 文件中的引用
if [ -n "$VENDOR_FILES" ]; then
    VENDOR_FILE=$(echo "$VENDOR_FILES" | head -1)
    echo ""
    echo "4️⃣ 检查 vendor 文件中的资源引用: $VENDOR_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 提取引用的资源文件
    REFERENCED_FILES=$(ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" \
        "grep -oE '/assets/[^\"'\`\s]+\.(js|mjs|css)' $VENDOR_FILE 2>/dev/null | sort -u" || echo "")
    
    if [ -n "$REFERENCED_FILES" ]; then
        echo "引用的资源文件："
        echo "$REFERENCED_FILES" | head -20
        
        # 检查每个引用的文件是否存在
        echo ""
        echo "5️⃣ 检查引用的文件是否存在..."
        MISSING_FILES=()
        while IFS= read -r ref_file; do
            if [ -z "$ref_file" ]; then
                continue
            fi
            # 移除前导斜杠，转换为相对路径
            rel_path=$(echo "$ref_file" | sed 's|^/||')
            full_path="$DEPLOY_PATH/$rel_path"
            
            if ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "[ -f $full_path ]" 2>/dev/null; then
                echo "✅ $ref_file"
            else
                echo "❌ $ref_file (不存在)"
                MISSING_FILES+=("$ref_file")
            fi
        done <<< "$REFERENCED_FILES"
        
        if [ ${#MISSING_FILES[@]} -gt 0 ]; then
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "❌ 发现 ${#MISSING_FILES[@]} 个缺失的文件："
            for file in "${MISSING_FILES[@]}"; do
                echo "  - $file"
            done
            echo ""
            echo "可能的原因："
            echo "  1. 部署时没有完全清理旧文件"
            echo "  2. 构建产物中文件名不一致"
            echo "  3. 部署过程中文件传输不完整"
            echo ""
            echo "解决方案："
            echo "  1. 手动清理部署目录: ssh $SERVER_USER@$SERVER_HOST 'rm -rf $DEPLOY_PATH/*'"
            echo "  2. 重新部署: pnpm build-deploy:admin"
        else
            echo ""
            echo "✅ 所有引用的文件都存在"
        fi
    else
        echo "⚠️  无法从 vendor 文件中提取资源引用"
    fi
else
    echo "❌ 未找到 vendor 文件"
fi

# 6. 检查 index.html
echo ""
echo "6️⃣ 检查 index.html..."
if ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "[ -f $DEPLOY_PATH/index.html ]"; then
    echo "✅ index.html 存在"
    echo "index.html 中的 script 标签："
    ssh $SSH_OPTS "$SERVER_USER@$SERVER_HOST" "grep -oE '<script[^>]*src=[\"'][^\"']+[\"'][^>]*>' $DEPLOY_PATH/index.html 2>/dev/null | head -5" || echo "无"
else
    echo "❌ index.html 不存在"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "诊断完成"

