#!/bin/bash

# Safari 证书部署脚本
# 将优化后的证书部署到服务器

set -e

BUNDLE_SAFARI="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle_safari.pem"
BUNDLE_TARGET="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
BACKUP_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem.bak.$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "Safari 证书部署工具"
echo "=========================================="
echo ""

# 1. 检查 Safari 证书文件
echo "1. 检查 Safari 证书文件..."
if [ ! -f "$BUNDLE_SAFARI" ]; then
    echo "   ❌ bellis.com.cn_bundle_safari.pem 不存在！"
    echo "   请先运行合并脚本生成证书文件"
    echo "   或手动上传 bellis.com.cn_bundle_safari.pem 到服务器"
    exit 1
fi

SAFARI_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_SAFARI" 2>/dev/null || echo "0")
echo "   ✅ bellis.com.cn_bundle_safari.pem 存在"
echo "   包含 $SAFARI_COUNT 个证书"
echo ""

# 2. 备份原文件
if [ -f "$BUNDLE_TARGET" ]; then
    echo "2. 备份原证书文件..."
    cp "$BUNDLE_TARGET" "$BACKUP_FILE"
    echo "   ✅ 已备份到: $BACKUP_FILE"
else
    echo "2. 原证书文件不存在，将创建新文件"
fi
echo ""

# 3. 验证 Safari 证书
echo "3. 验证 Safari 证书..."
if openssl verify -CAfile "$BUNDLE_SAFARI" "$BUNDLE_SAFARI" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过"
else
    echo "   ⚠️  证书链验证失败（可能是正常的，如果缺少根证书）"
    openssl verify -CAfile "$BUNDLE_SAFARI" "$BUNDLE_SAFARI" 2>&1 | head -3
    echo "   注意：Safari 不需要根证书，验证失败可能是正常的"
fi
echo ""

# 4. 替换证书文件
echo "4. 部署证书文件..."
cp "$BUNDLE_SAFARI" "$BUNDLE_TARGET"
chmod 644 "$BUNDLE_TARGET"
echo "   ✅ 证书文件已部署"
echo ""

# 5. 验证部署后的文件
echo "5. 验证部署后的文件..."
FINAL_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_TARGET" 2>/dev/null || echo "0")
echo "   最终证书数量: $FINAL_COUNT"
echo ""

# 6. 测试 nginx 配置
echo "6. 测试 nginx 配置..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ nginx 配置测试通过"
    echo ""
    echo "=========================================="
    echo "部署完成！"
    echo "=========================================="
    echo ""
    echo "下一步操作："
    echo "1. 重新加载 nginx: nginx -s reload"
    echo "2. 等待 1-2 分钟让配置生效"
    echo "3. 在 iOS Safari 中："
    echo "   - 清除缓存（设置 → Safari → 清除历史记录与网站数据）"
    echo "   - 重新访问 https://mobile.bellis.com.cn"
    echo "4. 使用在线工具测试："
    echo "   https://www.ssllabs.com/ssltest/analyze.html?d=mobile.bellis.com.cn"
    echo ""
else
    echo "   ❌ nginx 配置测试失败"
    nginx -t 2>&1 | tail -5
    echo ""
    echo "   请修复配置错误后重新部署"
    exit 1
fi

