#!/bin/bash

# 快速检查和修复证书链脚本

BUNDLE_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
BACKUP_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "证书链快速修复"
echo "=========================================="
echo ""

# 1. 检查当前状态
echo "1. 检查当前证书链..."
if [ ! -f "$BUNDLE_FILE" ]; then
    echo "   ❌ bundle.pem 文件不存在"
    exit 1
fi

CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE")
echo "   当前包含 $CERT_COUNT 个证书"
echo ""

# 2. 验证当前证书链
echo "2. 验证当前证书链..."
if openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过，无需修复"
    exit 0
else
    echo "   ❌ 证书链验证失败"
    openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" 2>&1 | head -3
    echo ""
fi

# 3. 修复：保留前3个证书（服务器证书 + 2个中间证书，排除根证书）
echo "3. 修复证书链..."
echo "   备份当前文件..."
cp "$BUNDLE_FILE" "$BACKUP_FILE"
echo "   ✅ 已备份到: $BACKUP_FILE"
echo ""

if [ "$CERT_COUNT" -ge 3 ]; then
    echo "   保留前 3 个证书（服务器证书 + 中间证书），排除根证书..."
    awk '/BEGIN CERTIFICATE/{i++} i<=3' "$BUNDLE_FILE" > "$BUNDLE_FILE.tmp"
    
    NEW_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE.tmp")
    if [ "$NEW_COUNT" -eq 3 ]; then
        mv "$BUNDLE_FILE.tmp" "$BUNDLE_FILE"
        chmod 644 "$BUNDLE_FILE"
        echo "   ✅ 证书链已修复，现在包含 $NEW_COUNT 个证书"
    else
        echo "   ❌ 修复失败"
        rm -f "$BUNDLE_FILE.tmp"
        exit 1
    fi
else
    echo "   ⚠️  证书数量不足，无法修复"
    exit 1
fi
echo ""

# 4. 验证修复后的证书链
echo "4. 验证修复后的证书链..."
if openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过！"
    echo ""
    echo "=========================================="
    echo "修复成功！"
    echo "=========================================="
    echo ""
    echo "下一步："
    echo "1. nginx -t"
    echo "2. nginx -s reload"
    echo ""
else
    echo "   ❌ 验证仍然失败"
    openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" 2>&1 | head -3
    echo ""
    echo "   尝试恢复原文件..."
    mv "$BACKUP_FILE" "$BUNDLE_FILE"
    echo "   已恢复原文件"
    exit 1
fi

