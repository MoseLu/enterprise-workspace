#!/bin/bash

# 检查宝塔面板的 Nginx 配置

echo "========== 检查宝塔 Nginx 配置 =========="
echo ""

NGINX_CONF="/www/server/nginx/conf/nginx.conf"
echo "1. 主配置文件: $NGINX_CONF"
if [ -f "$NGINX_CONF" ]; then
    echo "   ✓ 文件存在"
    echo "   包含的配置文件:"
    grep -E "include" "$NGINX_CONF" | grep -v "^[[:space:]]*#" | head -10
else
    echo "   ✗ 文件不存在"
fi

echo ""
echo "2. 检查 vhost 目录（宝塔的虚拟主机配置）:"
VHOST_DIR="/www/server/panel/vhost/nginx"
if [ -d "$VHOST_DIR" ]; then
    echo "   ✓ vhost 目录存在: $VHOST_DIR"
    echo "   查找包含 logistics 的配置:"
    find "$VHOST_DIR" -name "*.conf" -type f | xargs grep -l "logistics.bellis.com.cn" 2>/dev/null | while read file; do
        echo "   → $file"
    done
else
    echo "   ✗ vhost 目录不存在"
fi

echo ""
echo "3. 检查 conf.d 目录:"
CONF_D_DIR="/www/server/nginx/conf/conf.d"
if [ -d "$CONF_D_DIR" ]; then
    echo "   ✓ conf.d 目录存在: $CONF_D_DIR"
    echo "   查找包含 logistics 的配置:"
    find "$CONF_D_DIR" -name "*.conf" -type f | xargs grep -l "logistics.bellis.com.cn" 2>/dev/null | while read file; do
        echo "   → $file"
    done
else
    echo "   ✗ conf.d 目录不存在"
fi

echo ""
echo "4. 在所有可能的配置目录中查找 logistics 配置:"
for dir in /www/server/nginx/conf /www/server/panel/vhost/nginx /etc/nginx/conf.d /etc/nginx/sites-enabled; do
    if [ -d "$dir" ]; then
        echo "   检查: $dir"
        find "$dir" -name "*.conf" -type f 2>/dev/null | xargs grep -l "logistics.bellis.com.cn" 2>/dev/null | while read file; do
            echo "      → $file"
        done
    fi
done

echo ""
echo "5. 显示找到的 logistics 配置内容（前50行）:"
CONFIG_FILE=$(find /www/server/nginx/conf /www/server/panel/vhost/nginx /etc/nginx -name "*.conf" -type f 2>/dev/null | xargs grep -l "logistics.bellis.com.cn" 2>/dev/null | head -1)
if [ -n "$CONFIG_FILE" ]; then
    echo "   配置文件: $CONFIG_FILE"
    echo "   logistics 相关的配置:"
    grep -A 10 -B 5 "logistics.bellis.com.cn" "$CONFIG_FILE" | head -50
else
    echo "   ✗ 未找到包含 logistics 的配置文件"
fi

