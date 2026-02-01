#!/bin/bash

# SSL 证书链修复脚本
# 用于修复 Safari 无法建立安全连接的问题

set -e

BUNDLE_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
BACKUP_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)"
DOMAIN="mobile.bellis.com.cn"

echo "=========================================="
echo "SSL 证书链修复工具"
echo "=========================================="
echo ""

# 1. 备份当前文件
if [ -f "$BUNDLE_FILE" ]; then
    echo "1. 备份当前 bundle.pem 文件..."
    cp "$BUNDLE_FILE" "$BACKUP_FILE"
    echo "   ✅ 已备份到: $BACKUP_FILE"
else
    echo "   ⚠️  bundle.pem 文件不存在: $BUNDLE_FILE"
    exit 1
fi
echo ""

# 2. 检查当前证书数量
CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE" || echo "0")
echo "2. 当前 bundle.pem 包含 $CERT_COUNT 个证书"
echo ""

if [ "$CERT_COUNT" -ge 2 ]; then
    echo "   ℹ️  bundle.pem 文件看起来已经包含多个证书"
    echo "   但为了确保 Safari 兼容性，我们将重新生成..."
    echo ""
fi

# 3. 从实际连接中提取完整证书链
echo "3. 从 $DOMAIN:443 提取完整证书链..."
TEMP_CHAIN="/tmp/ssl_chain_$$.pem"

openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" -showcerts </dev/null 2>/dev/null | \
    sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > "$TEMP_CHAIN"

EXTRACTED_COUNT=$(grep -c "BEGIN CERTIFICATE" "$TEMP_CHAIN" || echo "0")
echo "   ✅ 提取了 $EXTRACTED_COUNT 个证书"
echo ""

if [ "$EXTRACTED_COUNT" -lt 2 ]; then
    echo "   ❌ 错误: 无法提取完整的证书链"
    rm -f "$TEMP_CHAIN"
    exit 1
fi

# 4. 分离证书（只取前两个：服务器证书 + 第一个中间证书）
# Safari 通常不需要根证书，只需要到中间证书即可
echo "4. 构建新的 bundle.pem（服务器证书 + 中间证书）..."

# 提取第一个证书（服务器证书）
FIRST_CERT_START=$(grep -n "BEGIN CERTIFICATE" "$TEMP_CHAIN" | head -1 | cut -d: -f1)
FIRST_CERT_END=$(grep -n "END CERTIFICATE" "$TEMP_CHAIN" | head -1 | cut -d: -f1)

# 提取第二个证书（第一个中间证书）
SECOND_CERT_START=$(grep -n "BEGIN CERTIFICATE" "$TEMP_CHAIN" | sed -n '2p' | cut -d: -f1)
SECOND_CERT_END=$(grep -n "END CERTIFICATE" "$TEMP_CHAIN" | sed -n '2p' | cut -d: -f1)

if [ -z "$SECOND_CERT_START" ]; then
    echo "   ⚠️  警告: 只找到一个证书，尝试使用所有证书..."
    # 如果只有一个证书，使用所有提取的证书
    cat "$TEMP_CHAIN" > "$BUNDLE_FILE.new"
else
    # 合并第一个和第二个证书
    sed -n "${FIRST_CERT_START},${FIRST_CERT_END}p" "$TEMP_CHAIN" > "$BUNDLE_FILE.new"
    echo "" >> "$BUNDLE_FILE.new"
    sed -n "${SECOND_CERT_START},${SECOND_CERT_END}p" "$TEMP_CHAIN" >> "$BUNDLE_FILE.new"
fi

# 5. 验证新文件
echo "5. 验证新的 bundle.pem 文件..."
NEW_CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE.new" || echo "0")
echo "   ✅ 新文件包含 $NEW_CERT_COUNT 个证书"
echo ""

# 6. 验证证书链
echo "6. 验证证书链..."
if openssl verify -CAfile "$BUNDLE_FILE.new" "$BUNDLE_FILE.new" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过"
else
    echo "   ⚠️  证书链验证失败，但继续执行..."
fi
echo ""

# 7. 替换原文件
echo "7. 替换 bundle.pem 文件..."
mv "$BUNDLE_FILE.new" "$BUNDLE_FILE"
echo "   ✅ 文件已更新"
echo ""

# 8. 清理临时文件
rm -f "$TEMP_CHAIN"
echo "8. 清理临时文件..."
echo "   ✅ 完成"
echo ""

# 9. 测试 nginx 配置
echo "9. 测试 nginx 配置..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ nginx 配置测试通过"
    echo ""
    echo "=========================================="
    echo "修复完成！"
    echo "=========================================="
    echo ""
    echo "下一步操作："
    echo "1. 重新加载 nginx: nginx -s reload"
    echo "2. 在 iOS Safari 中清除缓存并重新访问"
    echo "3. 如果问题仍然存在，检查其他可能的原因（见文档）"
    echo ""
else
    echo "   ❌ nginx 配置测试失败"
    echo "   请检查配置后手动重新加载"
    echo ""
fi

