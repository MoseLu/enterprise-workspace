#!/bin/bash

# SSL 证书链检查脚本
# 用于诊断 Safari 无法建立安全连接的问题

echo "=========================================="
echo "SSL 证书链诊断工具"
echo "=========================================="
echo ""

BUNDLE_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
KEY_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn.key"
DOMAIN="mobile.bellis.com.cn"

echo "1. 检查 bundle.pem 文件是否存在..."
if [ ! -f "$BUNDLE_FILE" ]; then
    echo "❌ 错误: bundle.pem 文件不存在: $BUNDLE_FILE"
    exit 1
fi
echo "✅ bundle.pem 文件存在"
echo ""

echo "2. 检查 bundle.pem 文件中的证书数量..."
CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE")
echo "   发现 $CERT_COUNT 个证书"
echo ""

if [ "$CERT_COUNT" -lt 2 ]; then
    echo "⚠️  警告: bundle.pem 文件可能不完整！"
    echo "   Safari 需要完整的证书链（至少包含服务器证书和中间证书）"
    echo ""
fi

echo "3. 检查服务器证书信息..."
openssl x509 -in "$BUNDLE_FILE" -noout -subject -issuer 2>/dev/null | head -2
echo ""

echo "4. 检查证书的 Subject Alternative Name (SAN)..."
openssl x509 -in "$BUNDLE_FILE" -noout -text 2>/dev/null | grep -A 5 "Subject Alternative Name" || echo "   未找到 SAN 扩展"
echo ""

echo "5. 检查证书有效期..."
openssl x509 -in "$BUNDLE_FILE" -noout -dates 2>/dev/null
echo ""

echo "6. 验证证书链（本地验证）..."
openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" 2>&1
echo ""

echo "7. 测试实际服务器连接..."
echo "   连接到 $DOMAIN:443..."
echo ""
openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" -showcerts </dev/null 2>/dev/null | \
    grep -E "(depth=|verify return code|subject=|issuer=)" | head -10
echo ""

echo "8. 检查 nginx 配置..."
if command -v nginx &> /dev/null; then
    echo "   测试 nginx 配置..."
    nginx -t 2>&1 | grep -E "(successful|failed)"
else
    echo "   nginx 命令未找到"
fi
echo ""

echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""
echo "如果 bundle.pem 文件不完整，需要重新生成："
echo "1. 从证书提供商获取完整的证书链"
echo "2. 按照以下顺序合并证书："
echo "   - 服务器证书（第一个）"
echo "   - 中间证书（第二个）"
echo "   - 其他中间证书（如果有）"
echo "3. 不要包含根证书（Safari 不需要）"
echo ""
echo "合并命令示例："
echo "  cat server.crt intermediate.crt > bellis.com.cn_bundle.pem"

