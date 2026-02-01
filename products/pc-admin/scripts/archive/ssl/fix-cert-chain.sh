#!/bin/bash

# 证书链修复脚本 - 保留所有中间证书，排除根证书

set -e

BUNDLE_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
BACKUP_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "证书链修复工具"
echo "=========================================="
echo ""

# 1. 备份
if [ ! -f "$BUNDLE_FILE" ]; then
    echo "❌ 错误: bundle.pem 文件不存在: $BUNDLE_FILE"
    exit 1
fi

echo "1. 备份当前文件..."
cp "$BUNDLE_FILE" "$BACKUP_FILE"
echo "   ✅ 已备份到: $BACKUP_FILE"
echo ""

# 2. 检查证书数量
CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE")
echo "2. 当前包含 $CERT_COUNT 个证书"
echo ""

if [ "$CERT_COUNT" -lt 3 ]; then
    echo "   ⚠️  证书数量少于 3 个，可能不完整"
    echo "   建议保留所有证书"
    exit 1
fi

# 3. 分析证书链
echo "3. 分析证书链结构..."

# 分离每个证书到临时文件
TEMP_DIR="/tmp/cert_chain_$$"
mkdir -p "$TEMP_DIR"

awk '
    /-----BEGIN CERTIFICATE-----/ {
        cert_num++
        if (cert_num > 1) {
            print cert > "'"$TEMP_DIR"'/cert_" (cert_num-1) ".pem"
            close("'"$TEMP_DIR"'/cert_" (cert_num-1) ".pem")
        }
        cert = $0
        next
    }
    {
        cert = cert "\n" $0
    }
    /-----END CERTIFICATE-----/ {
        print cert > "'"$TEMP_DIR"'/cert_" cert_num ".pem"
        close("'"$TEMP_DIR"'/cert_" cert_num ".pem")
    }
' "$BUNDLE_FILE"

# 分析每个证书
ROOT_CERT_NUM=""
echo "   证书链分析："
for i in $(seq 1 $CERT_COUNT); do
    CERT_FILE="$TEMP_DIR/cert_${i}.pem"
    if [ -f "$CERT_FILE" ]; then
        SUBJECT=$(openssl x509 -in "$CERT_FILE" -noout -subject 2>/dev/null | sed 's/subject=//' | cut -d',' -f1 | sed 's/CN = //')
        ISSUER=$(openssl x509 -in "$CERT_FILE" -noout -issuer 2>/dev/null | sed 's/issuer=//' | cut -d',' -f1 | sed 's/CN = //')
        
        echo "   证书 $i: Subject=$SUBJECT, Issuer=$ISSUER"
        
        # 检查是否是根证书（自签名）
        if [ "$SUBJECT" = "$ISSUER" ]; then
            ROOT_CERT_NUM=$i
            echo "      ⚠️  这是根证书（自签名），将被排除"
        fi
    fi
done
echo ""

# 4. 构建新证书链
echo "4. 构建新证书链..."

if [ -n "$ROOT_CERT_NUM" ]; then
    echo "   排除根证书（证书 $ROOT_CERT_NUM），保留前 $((ROOT_CERT_NUM - 1)) 个证书"
    > "$BUNDLE_FILE.new"
    for i in $(seq 1 $((ROOT_CERT_NUM - 1))); do
        if [ -f "$TEMP_DIR/cert_${i}.pem" ]; then
            cat "$TEMP_DIR/cert_${i}.pem" >> "$BUNDLE_FILE.new"
            echo "" >> "$BUNDLE_FILE.new"
        fi
    done
elif [ "$CERT_COUNT" -eq 4 ]; then
    # 如果有4个证书且未找到明显的根证书，通常最后一个就是根证书
    echo "   保留前 3 个证书（排除最后一个，通常是根证书）"
    awk '/BEGIN CERTIFICATE/{i++} i<=3' "$BUNDLE_FILE" > "$BUNDLE_FILE.new"
else
    echo "   ⚠️  无法确定根证书位置，保留所有证书"
    cp "$BUNDLE_FILE" "$BUNDLE_FILE.new"
fi

# 5. 验证新证书链
echo "5. 验证新证书链..."
NEW_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE.new")
echo "   新证书链包含 $NEW_COUNT 个证书"
echo ""

if openssl verify -CAfile "$BUNDLE_FILE.new" "$BUNDLE_FILE.new" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过"
else
    echo "   ⚠️  证书链验证失败，但继续执行..."
    echo "   验证输出："
    openssl verify -CAfile "$BUNDLE_FILE.new" "$BUNDLE_FILE.new" 2>&1 | head -3
    echo ""
    echo "   如果验证失败，可能需要包含更多中间证书"
    echo "   尝试保留所有证书（包括根证书）..."
    
    # 如果验证失败，尝试保留所有证书
    cp "$BACKUP_FILE" "$BUNDLE_FILE.new"
    NEW_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE.new")
    echo "   已恢复为包含 $NEW_COUNT 个证书的完整链"
fi
echo ""

# 6. 替换原文件
echo "6. 替换 bundle.pem 文件..."
mv "$BUNDLE_FILE.new" "$BUNDLE_FILE"
chmod 644 "$BUNDLE_FILE"
echo "   ✅ 文件已更新"
echo ""

# 7. 清理
rm -rf "$TEMP_DIR"
echo "7. 清理临时文件..."
echo "   ✅ 完成"
echo ""

# 8. 最终验证
echo "8. 最终验证..."
FINAL_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE")
echo "   最终证书数量: $FINAL_COUNT"
echo ""

if openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" >/dev/null 2>&1; then
    echo "   ✅ 最终验证通过"
else
    echo "   ⚠️  最终验证失败"
    openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" 2>&1 | head -3
fi
echo ""

echo "=========================================="
echo "修复完成！"
echo "=========================================="
echo ""
echo "下一步操作："
echo "1. 测试 nginx 配置: nginx -t"
echo "2. 重新加载 nginx: nginx -s reload"
echo "3. 等待几分钟后，在 SSL Labs 重新测试"
echo "4. 在 iOS Safari 中清除缓存并重新访问"
echo ""

