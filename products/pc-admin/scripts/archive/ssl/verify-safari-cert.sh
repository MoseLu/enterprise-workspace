#!/bin/bash

# Safari 证书验证脚本
# 验证证书文件是否正确配置

BUNDLE_SAFARI="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle_safari.pem"
BUNDLE_ORIGINAL="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
KEY_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn.key"
DOMAIN="mobile.bellis.com.cn"

echo "=========================================="
echo "Safari 证书验证工具"
echo "=========================================="
echo ""

# 1. 检查证书文件是否存在
echo "1. 检查证书文件..."
if [ -f "$BUNDLE_SAFARI" ]; then
    echo "   ✅ bellis.com.cn_bundle_safari.pem 存在"
    ls -lh "$BUNDLE_SAFARI"
    SAFARI_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_SAFARI" 2>/dev/null || echo "0")
    echo "   包含 $SAFARI_COUNT 个证书"
else
    echo "   ❌ bellis.com.cn_bundle_safari.pem 不存在！"
    echo "   请确保文件已上传到服务器"
fi

if [ -f "$BUNDLE_ORIGINAL" ]; then
    echo "   ✅ bellis.com.cn_bundle.pem 存在"
    ORIGINAL_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_ORIGINAL" 2>/dev/null || echo "0")
    echo "   包含 $ORIGINAL_COUNT 个证书"
fi

if [ -f "$KEY_FILE" ]; then
    echo "   ✅ bellis.com.cn.key 存在"
else
    echo "   ❌ bellis.com.cn.key 不存在！"
fi
echo ""

# 2. 检查 nginx 配置使用的证书文件
echo "2. 检查 nginx 配置..."
NGINX_CONF="/etc/nginx/sites-available/mobile.bellis.com.cn"
if [ ! -f "$NGINX_CONF" ]; then
    NGINX_CONF="/www/server/nginx/conf/vhost/mobile.bellis.com.cn.conf"
fi
if [ ! -f "$NGINX_CONF" ]; then
    NGINX_CONF="/etc/nginx/conf.d/mobile.bellis.com.cn.conf"
fi

if [ -f "$NGINX_CONF" ]; then
    echo "   找到配置文件: $NGINX_CONF"
    CERT_IN_CONF=$(grep "ssl_certificate" "$NGINX_CONF" | grep -v "#" | head -1)
    echo "   配置中的证书文件: $CERT_IN_CONF"
    
    if echo "$CERT_IN_CONF" | grep -q "bundle_safari"; then
        echo "   ✅ 配置使用的是 bundle_safari.pem"
    else
        echo "   ⚠️  配置使用的不是 bundle_safari.pem"
        echo "   需要更新配置或创建符号链接"
    fi
else
    echo "   ⚠️  未找到 nginx 配置文件"
    echo "   请手动检查配置"
fi
echo ""

# 3. 验证证书链
if [ -f "$BUNDLE_SAFARI" ]; then
    echo "3. 验证 Safari 证书链..."
    if openssl verify -CAfile "$BUNDLE_SAFARI" "$BUNDLE_SAFARI" >/dev/null 2>&1; then
        echo "   ✅ 证书链验证通过"
    else
        echo "   ⚠️  证书链验证失败（可能是正常的，如果缺少根证书）"
        openssl verify -CAfile "$BUNDLE_SAFARI" "$BUNDLE_SAFARI" 2>&1 | head -3
    fi
    echo ""
    
    echo "4. 检查证书信息..."
    echo "   服务器证书："
    openssl x509 -in "$BUNDLE_SAFARI" -noout -subject -issuer 2>/dev/null | head -2
    echo ""
    
    echo "   SAN (Subject Alternative Name):"
    openssl x509 -in "$BUNDLE_SAFARI" -noout -text 2>/dev/null | grep -A 3 "Subject Alternative Name" || echo "   未找到 SAN"
    echo ""
fi

# 5. 测试实际连接
echo "5. 测试实际 SSL 连接..."
if timeout 5 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" </dev/null 2>/dev/null | grep -q "Verify return code"; then
    echo "   ✅ SSL 连接成功"
    timeout 5 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" </dev/null 2>/dev/null | \
        grep -E "(Protocol|Cipher|Verify return code)" | head -3
else
    echo "   ❌ SSL 连接失败"
fi
echo ""

# 6. 检查 nginx 是否重新加载
echo "6. 检查 nginx 状态..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ nginx 配置测试通过"
    echo ""
    echo "   如果配置已更新，请重新加载 nginx:"
    echo "   nginx -s reload"
    echo "   或"
    echo "   systemctl reload nginx"
else
    echo "   ❌ nginx 配置测试失败"
    nginx -t 2>&1 | tail -5
fi
echo ""

echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""
echo "如果问题仍然存在，请检查："
echo "1. 证书文件是否正确上传到服务器"
echo "2. nginx 配置是否指向正确的证书文件"
echo "3. nginx 是否已重新加载配置"
echo "4. 浏览器缓存是否已清除"
echo ""

