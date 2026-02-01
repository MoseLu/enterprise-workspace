#!/bin/bash

# SSL 证书链优化脚本
# 移除根证书，只保留服务器证书和中间证书（Safari 最佳实践）

set -e

BUNDLE_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
BACKUP_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)"
TEMP_FILE="/tmp/optimized_bundle_$$.pem"

echo "=========================================="
echo "SSL 证书链优化工具"
echo "=========================================="
echo ""

# 1. 检查文件是否存在
if [ ! -f "$BUNDLE_FILE" ]; then
    echo "❌ 错误: bundle.pem 文件不存在: $BUNDLE_FILE"
    exit 1
fi

# 2. 备份当前文件
echo "1. 备份当前 bundle.pem 文件..."
cp "$BUNDLE_FILE" "$BACKUP_FILE"
echo "   ✅ 已备份到: $BACKUP_FILE"
echo ""

# 3. 检查当前证书数量
CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE")
echo "2. 当前 bundle.pem 包含 $CERT_COUNT 个证书"
echo ""

if [ "$CERT_COUNT" -le 2 ]; then
    echo "   ℹ️  证书数量正常（≤2），但为了确保 Safari 兼容性，将重新优化..."
    echo ""
fi

# 4. 分离证书
echo "3. 分离证书..."

# 使用 awk 分离每个证书
awk '
    /-----BEGIN CERTIFICATE-----/ {
        cert_num++
        if (cert_num > 0) {
            print cert > "/tmp/cert_" cert_num-1 ".pem"
            close("/tmp/cert_" cert_num-1 ".pem")
        }
        cert = $0
        next
    }
    {
        cert = cert "\n" $0
    }
    /-----END CERTIFICATE-----/ {
        print cert > "/tmp/cert_" cert_num ".pem"
        close("/tmp/cert_" cert_num ".pem")
    }
' "$BUNDLE_FILE"

# 5. 检查每个证书的 issuer 和 subject
echo "4. 分析证书链结构..."

for i in $(seq 1 $CERT_COUNT); do
    CERT_FILE="/tmp/cert_${i}.pem"
    if [ -f "$CERT_FILE" ]; then
        SUBJECT=$(openssl x509 -in "$CERT_FILE" -noout -subject 2>/dev/null | sed 's/subject=//')
        ISSUER=$(openssl x509 -in "$CERT_FILE" -noout -issuer 2>/dev/null | sed 's/issuer=//')
        
        echo "   证书 $i:"
        echo "      Subject: $SUBJECT"
        echo "      Issuer:  $ISSUER"
        
        # 检查是否是根证书（issuer == subject）
        if [ "$SUBJECT" = "$ISSUER" ]; then
            echo "     ⚠️  这是根证书（自签名），Safari 不需要，将被移除"
            ROOT_CERT=$i
        fi
        echo ""
    fi
done

# 6. 构建优化后的证书链（只包含服务器证书和中间证书，排除根证书）
echo "5. 构建优化后的证书链..."

# Safari 最佳实践：只包含服务器证书 + 中间证书（最多 2 个）
# 移除根证书和多余的中间证书

> "$TEMP_FILE"

# 添加第一个证书（服务器证书）
if [ -f "/tmp/cert_1.pem" ]; then
    cat "/tmp/cert_1.pem" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "   ✅ 添加服务器证书"
fi

# 添加第二个证书（第一个中间证书）
if [ -f "/tmp/cert_2.pem" ]; then
    cat "/tmp/cert_2.pem" >> "$TEMP_FILE"
    echo "   ✅ 添加中间证书"
fi

# 如果还有第三个证书且不是根证书，也添加（某些情况下需要两个中间证书）
if [ -f "/tmp/cert_3.pem" ] && [ "$ROOT_CERT" != "3" ]; then
    cat "/tmp/cert_3.pem" >> "$TEMP_FILE"
    echo "   ✅ 添加第二个中间证书"
fi

echo ""

# 7. 验证新文件
echo "6. 验证优化后的证书链..."
NEW_CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$TEMP_FILE" || echo "0")
echo "   ✅ 优化后的文件包含 $NEW_CERT_COUNT 个证书"
echo ""

# 8. 验证证书链
echo "7. 验证证书链..."
if openssl verify -CAfile "$TEMP_FILE" "$TEMP_FILE" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过"
else
    echo "   ⚠️  证书链验证失败，但继续执行..."
    openssl verify -CAfile "$TEMP_FILE" "$TEMP_FILE" 2>&1 | head -5
fi
echo ""

# 9. 替换原文件
echo "8. 替换 bundle.pem 文件..."
mv "$TEMP_FILE" "$BUNDLE_FILE"
chmod 644 "$BUNDLE_FILE"
echo "   ✅ 文件已更新"
echo ""

# 10. 清理临时文件
echo "9. 清理临时文件..."
rm -f /tmp/cert_*.pem
echo "   ✅ 完成"
echo ""

# 11. 测试 nginx 配置
echo "10. 测试 nginx 配置..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ nginx 配置测试通过"
    echo ""
    echo "=========================================="
    echo "优化完成！"
    echo "=========================================="
    echo ""
    echo "下一步操作："
    echo "1. 重新加载 nginx: nginx -s reload"
    echo "2. 在 iOS Safari 中："
    echo "   - 清除缓存（设置 → Safari → 清除历史记录与网站数据）"
    echo "   - 重新访问 https://mobile.bellis.com.cn"
    echo ""
    echo "如果问题仍然存在，请检查："
    echo "- iOS 设备时间设置是否正确"
    echo "- 网络环境（尝试切换网络）"
    echo "- 使用在线工具测试：https://www.ssllabs.com/ssltest/"
    echo ""
else
    echo "   ❌ nginx 配置测试失败"
    echo "   请检查配置后手动重新加载"
    echo ""
fi

