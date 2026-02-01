#!/bin/bash

# 查找 Nginx 配置文件位置

echo "========== 查找 Nginx 配置文件 =========="
echo ""

echo "1. 检查常见的 Nginx 配置目录:"
for dir in /etc/nginx/conf.d /etc/nginx/sites-enabled /etc/nginx/sites-available /usr/local/nginx/conf /etc/nginx; do
    if [ -d "$dir" ]; then
        echo "   ✓ $dir 存在"
        if [ -f "$dir/subdomains.conf" ]; then
            echo "      → 找到 subdomains.conf"
        fi
        if [ -f "$dir/bellis.com.cn.nginx.conf" ]; then
            echo "      → 找到 bellis.com.cn.nginx.conf"
        fi
        # 查找包含 logistics 的配置文件
        grep -l "logistics.bellis.com.cn" "$dir"/*.conf 2>/dev/null | while read file; do
            echo "      → 找到包含 logistics 的配置: $file"
        done
    fi
done

echo ""
echo "2. 检查 Nginx 主配置文件:"
NGINX_CONF="/etc/nginx/nginx.conf"
if [ -f "$NGINX_CONF" ]; then
    echo "   ✓ 主配置文件存在: $NGINX_CONF"
    echo "   包含的配置文件:"
    grep -E "include|conf.d" "$NGINX_CONF" | grep -v "^#" | head -5
else
    echo "   ✗ 主配置文件不存在"
fi

echo ""
echo "3. 查找所有包含 logistics.bellis.com.cn 的文件:"
find /etc/nginx -type f -name "*.conf" 2>/dev/null | xargs grep -l "logistics.bellis.com.cn" 2>/dev/null | while read file; do
    echo "   → $file"
done

echo ""
echo "4. 检查 Nginx 进程和配置测试:"
if command -v nginx &> /dev/null; then
    echo "   Nginx 版本:"
    nginx -v 2>&1
    echo ""
    echo "   测试配置:"
    nginx -t 2>&1 | head -10
else
    echo "   ⚠ Nginx 命令不存在"
fi

