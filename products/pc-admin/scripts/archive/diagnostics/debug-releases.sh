#!/bin/bash

# 在服务器上运行此脚本，检查 releases 结构状态

echo "========== 检查 logistics.bellis.com.cn =========="
cd /www/wwwroot/logistics.bellis.com.cn || exit 1

echo "1. 目录结构:"
ls -la

echo ""
echo "2. current 符号链接:"
ls -la current 2>/dev/null || echo "current 不存在"

echo ""
echo "3. releases 目录:"
ls -la releases/ 2>/dev/null || echo "releases 不存在"

echo ""
echo "4. current 指向的目录内容:"
if [ -L "current" ]; then
    echo "符号链接指向: $(readlink current)"
    ls -la current/ | head -20
else
    echo "current 不是符号链接"
fi

echo ""
echo "5. index.html 是否存在:"
if [ -f "current/index.html" ]; then
    echo "✓ current/index.html 存在"
    ls -lh current/index.html
else
    echo "✗ current/index.html 不存在"
fi

echo ""
echo "6. assets 目录是否存在:"
if [ -d "current/assets" ]; then
    echo "✓ current/assets 目录存在"
    echo "assets 目录内容（前10个文件）:"
    ls -lh current/assets/ | head -15
else
    echo "✗ current/assets 目录不存在"
    echo "current 目录下的所有内容:"
    find current -maxdepth 2 -type f -o -type d | head -20
fi

echo ""
echo "7. Nginx 配置中的路径:"
grep -n "logistics.bellis.com.cn" /etc/nginx/conf.d/*.conf 2>/dev/null | grep "root\|alias" | head -10

echo ""
echo "8. 测试 Nginx 路径解析（/assets/index-D5B5b1S8.js）:"
echo "根据配置，Nginx 会查找: /www/wwwroot/logistics.bellis.com.cn/current/assets/index-D5B5b1S8.js"
if [ -f "/www/wwwroot/logistics.bellis.com.cn/current/assets/index-D5B5b1S8.js" ]; then
    echo "✓ 文件存在"
    ls -lh /www/wwwroot/logistics.bellis.com.cn/current/assets/index-D5B5b1S8.js
else
    echo "✗ 文件不存在"
    echo "assets 目录中的 JS 文件:"
    ls -lh current/assets/*.js 2>/dev/null | head -5 || echo "没有找到 JS 文件"
fi

