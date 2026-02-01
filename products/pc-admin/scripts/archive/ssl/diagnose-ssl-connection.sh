#!/bin/bash

# SSL 连接诊断脚本
# 用于诊断 SSL Labs 测试失败的问题

DOMAIN="mobile.bellis.com.cn"
BUNDLE_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
KEY_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn.key"

echo "=========================================="
echo "SSL 连接诊断工具"
echo "=========================================="
echo ""

# 1. 检查端口监听
echo "1. 检查 443 端口监听状态..."
if netstat -tlnp 2>/dev/null | grep -q ":443 "; then
    echo "   ✅ 443 端口正在监听"
    netstat -tlnp 2>/dev/null | grep ":443 " | head -3
else
    echo "   ❌ 443 端口未监听！"
    echo "   这是主要问题 - nginx 可能没有正确启动或配置未加载"
fi
echo ""

# 2. 检查 nginx 进程
echo "2. 检查 nginx 进程..."
if pgrep -x nginx > /dev/null; then
    echo "   ✅ nginx 进程正在运行"
    ps aux | grep nginx | grep -v grep | head -3
else
    echo "   ❌ nginx 进程未运行！"
fi
echo ""

# 3. 检查证书文件
echo "3. 检查证书文件..."
if [ -f "$BUNDLE_FILE" ]; then
    echo "   ✅ bundle.pem 文件存在"
    ls -lh "$BUNDLE_FILE"
    CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE")
    echo "   包含 $CERT_COUNT 个证书"
else
    echo "   ❌ bundle.pem 文件不存在: $BUNDLE_FILE"
fi

if [ -f "$KEY_FILE" ]; then
    echo "   ✅ key 文件存在"
    ls -lh "$KEY_FILE"
else
    echo "   ❌ key 文件不存在: $KEY_FILE"
fi
echo ""

# 4. 检查证书文件权限
echo "4. 检查证书文件权限..."
if [ -f "$BUNDLE_FILE" ]; then
    PERMS=$(stat -c "%a" "$BUNDLE_FILE" 2>/dev/null || stat -f "%OLp" "$BUNDLE_FILE" 2>/dev/null)
    echo "   bundle.pem 权限: $PERMS"
    if [ "$PERMS" != "644" ] && [ "$PERMS" != "600" ] && [ "$PERMS" != "640" ]; then
        echo "   ⚠️  建议权限: 644 或 600"
    fi
fi

if [ -f "$KEY_FILE" ]; then
    PERMS=$(stat -c "%a" "$KEY_FILE" 2>/dev/null || stat -f "%OLp" "$KEY_FILE" 2>/dev/null)
    echo "   key 文件权限: $PERMS"
    if [ "$PERMS" != "600" ] && [ "$PERMS" != "640" ]; then
        echo "   ⚠️  建议权限: 600 或 640（更安全）"
    fi
fi
echo ""

# 5. 测试本地 SSL 连接
echo "5. 测试本地 SSL 连接..."
if timeout 5 openssl s_client -connect localhost:443 -servername "$DOMAIN" </dev/null 2>/dev/null | grep -q "Verify return code"; then
    echo "   ✅ 本地 SSL 连接成功"
    timeout 5 openssl s_client -connect localhost:443 -servername "$DOMAIN" </dev/null 2>/dev/null | \
        grep -E "(Protocol|Cipher|Verify return code)" | head -3
else
    echo "   ❌ 本地 SSL 连接失败"
    echo "   这可能是主要问题 - nginx 可能没有正确配置 SSL"
fi
echo ""

# 6. 测试外部连接
echo "6. 测试外部 SSL 连接..."
if timeout 5 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" </dev/null 2>/dev/null | grep -q "Verify return code"; then
    echo "   ✅ 外部 SSL 连接成功"
    timeout 5 openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" </dev/null 2>/dev/null | \
        grep -E "(Protocol|Cipher|Verify return code)" | head -3
else
    echo "   ❌ 外部 SSL 连接失败"
    echo "   可能的原因："
    echo "   - 防火墙阻止了 443 端口"
    echo "   - 安全组未开放 443 端口"
    echo "   - DNS 解析问题"
fi
echo ""

# 7. 检查 nginx 配置
echo "7. 检查 nginx 配置..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ nginx 配置测试通过"
else
    echo "   ❌ nginx 配置测试失败"
    nginx -t 2>&1 | tail -5
fi
echo ""

# 8. 检查 nginx 错误日志
echo "8. 检查最近的 nginx 错误日志..."
if [ -f /var/log/nginx/error.log ]; then
    echo "   最近的 SSL 相关错误："
    tail -20 /var/log/nginx/error.log | grep -i "ssl\|certificate\|443" | tail -5 || echo "   未发现 SSL 相关错误"
elif [ -f /www/server/nginx/logs/error.log ]; then
    echo "   最近的 SSL 相关错误："
    tail -20 /www/server/nginx/logs/error.log | grep -i "ssl\|certificate\|443" | tail -5 || echo "   未发现 SSL 相关错误"
else
    echo "   ⚠️  未找到 nginx 错误日志文件"
fi
echo ""

# 9. 检查防火墙
echo "9. 检查防火墙状态..."
if command -v firewall-cmd &> /dev/null; then
    if firewall-cmd --list-ports 2>/dev/null | grep -q "443"; then
        echo "   ✅ 防火墙已开放 443 端口"
    else
        echo "   ⚠️  防火墙可能未开放 443 端口"
        echo "   运行: firewall-cmd --add-service=https --permanent && firewall-cmd --reload"
    fi
elif command -v ufw &> /dev/null; then
    if ufw status 2>/dev/null | grep -q "443"; then
        echo "   ✅ UFW 已开放 443 端口"
    else
        echo "   ⚠️  UFW 可能未开放 443 端口"
        echo "   运行: ufw allow 443/tcp"
    fi
else
    echo "   ℹ️  未检测到常见防火墙工具"
fi
echo ""

echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""
echo "如果发现问题，请："
echo "1. 修复证书文件权限（如果需要）"
echo "2. 检查并修复 nginx 配置"
echo "3. 确保防火墙开放 443 端口"
echo "4. 重新加载或重启 nginx: nginx -s reload 或 systemctl restart nginx"
echo ""

