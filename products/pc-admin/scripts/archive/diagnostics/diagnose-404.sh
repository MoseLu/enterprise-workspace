#!/bin/bash

# 诊断 404 问题的脚本
# 在服务器上运行此脚本

echo "========== 诊断 logistics.bellis.com.cn 404 问题 =========="
echo ""

APP_DOMAIN="logistics.bellis.com.cn"
DEPLOY_BASE="/www/wwwroot/$APP_DOMAIN"
CURRENT_LINK="$DEPLOY_BASE/current"

echo "1. 检查目录结构:"
echo "   部署基础路径: $DEPLOY_BASE"
if [ -d "$DEPLOY_BASE" ]; then
    echo "   ✓ 基础目录存在"
    ls -la "$DEPLOY_BASE" | head -10
else
    echo "   ✗ 基础目录不存在"
    exit 1
fi

echo ""
echo "2. 检查 current 符号链接:"
if [ -L "$CURRENT_LINK" ]; then
    TARGET=$(readlink -f "$CURRENT_LINK")
    echo "   ✓ current 符号链接存在"
    echo "   指向: $TARGET"
    if [ -d "$TARGET" ]; then
        echo "   ✓ 目标目录存在"
    else
        echo "   ✗ 目标目录不存在"
        exit 1
    fi
else
    echo "   ✗ current 符号链接不存在"
    exit 1
fi

echo ""
echo "3. 检查 index.html:"
if [ -f "$CURRENT_LINK/index.html" ]; then
    echo "   ✓ index.html 存在"
    echo "   文件大小: $(ls -lh "$CURRENT_LINK/index.html" | awk '{print $5}')"
    echo "   文件路径: $CURRENT_LINK/index.html"
else
    echo "   ✗ index.html 不存在"
    echo "   current 目录内容:"
    ls -la "$CURRENT_LINK/" | head -10
fi

echo ""
echo "4. 检查 assets 目录:"
if [ -d "$CURRENT_LINK/assets" ]; then
    echo "   ✓ assets 目录存在"
    ASSET_COUNT=$(find "$CURRENT_LINK/assets" -type f | wc -l)
    echo "   文件数量: $ASSET_COUNT"
    echo "   assets 目录内容（前10个）:"
    ls -lh "$CURRENT_LINK/assets" | head -10
else
    echo "   ✗ assets 目录不存在"
    echo "   current 目录内容:"
    ls -la "$CURRENT_LINK/" | head -20
fi

echo ""
echo "5. 检查特定文件 (index-D5B5b1S8.js):"
JS_FILE="$CURRENT_LINK/assets/index-D5B5b1S8.js"
if [ -f "$JS_FILE" ]; then
    echo "   ✓ 文件存在: $JS_FILE"
    ls -lh "$JS_FILE"
else
    echo "   ✗ 文件不存在: $JS_FILE"
    echo "   查找类似的 JS 文件:"
    find "$CURRENT_LINK/assets" -name "*.js" -type f | head -5
fi

echo ""
echo "6. 检查 Nginx 配置:"
NGINX_CONF="/etc/nginx/conf.d/subdomains.conf"
if [ -f "$NGINX_CONF" ]; then
    echo "   ✓ Nginx 配置文件存在"
    echo "   logistics 相关的 root/alias 配置:"
    grep -A 2 -B 2 "logistics.bellis.com.cn" "$NGINX_CONF" | grep -E "root|alias" | head -10
else
    echo "   ✗ Nginx 配置文件不存在"
fi

echo ""
echo "7. 测试 Nginx 路径解析:"
echo "   根据配置 location /assets/ { root $DEPLOY_BASE/current; }"
echo "   Nginx 会查找: $DEPLOY_BASE/current/assets/index-D5B5b1S8.js"
if [ -f "$DEPLOY_BASE/current/assets/index-D5B5b1S8.js" ]; then
    echo "   ✓ 文件存在（路径正确）"
else
    echo "   ✗ 文件不存在（路径可能有问题）"
    echo "   实际路径应该是: $CURRENT_LINK/assets/index-D5B5b1S8.js"
    if [ -f "$CURRENT_LINK/assets/index-D5B5b1S8.js" ]; then
        echo "   ✓ 通过符号链接可以访问"
    fi
fi

echo ""
echo "8. 检查 Nginx 错误日志:"
NGINX_ERROR_LOG="/var/log/nginx/error.log"
if [ -f "$NGINX_ERROR_LOG" ]; then
    echo "   最近的错误日志（最后10行）:"
    tail -10 "$NGINX_ERROR_LOG" | grep -i "logistics\|404" || echo "   没有相关错误"
else
    echo "   ⚠ Nginx 错误日志不存在或无法访问"
fi

echo ""
echo "9. 检查 Nginx 访问日志:"
NGINX_ACCESS_LOG="/var/log/nginx/access.log"
if [ -f "$NGINX_ACCESS_LOG" ]; then
    echo "   最近的访问日志（最后5行，包含 404）:"
    tail -20 "$NGINX_ACCESS_LOG" | grep "404" | tail -5 || echo "   没有 404 错误"
else
    echo "   ⚠ Nginx 访问日志不存在或无法访问"
fi

echo ""
echo "========== 诊断完成 =========="

