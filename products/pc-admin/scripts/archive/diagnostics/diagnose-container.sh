#!/bin/bash

# 诊断 Docker 容器状态和 serve 服务
# 用于排查生产环境 500 错误

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 诊断容器状态和 serve 服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CONTAINER_NAME="btc-system-app"

# 1. 检查容器是否存在
echo "📦 检查容器状态:"
if docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
else
    echo "❌ 容器 ${CONTAINER_NAME} 不存在"
    exit 1
fi
echo ""

# 2. 检查容器是否运行
echo "▶️  检查容器运行状态:"
if docker ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
    echo "✅ 容器正在运行"
else
    echo "❌ 容器未运行，尝试查看最后日志:"
    docker logs ${CONTAINER_NAME} --tail 30 2>&1
    exit 1
fi
echo ""

# 3. 检查容器内的 serve 进程
echo "🔍 检查容器内的 serve 进程:"
if docker exec ${CONTAINER_NAME} ps aux 2>/dev/null | grep -E "(serve|node)" | grep -v grep; then
    echo "✅ serve 进程正在运行"
else
    echo "❌ serve 进程未运行"
fi
echo ""

# 4. 检查 dist 目录
echo "📁 检查 dist 目录:"
if docker exec ${CONTAINER_NAME} test -d /app/dist 2>/dev/null; then
    echo "✅ /app/dist 目录存在"
    echo ""
    echo "📊 dist 目录内容:"
    docker exec ${CONTAINER_NAME} ls -la /app/dist 2>/dev/null | head -20
    echo ""
    echo "📏 dist 目录大小:"
    docker exec ${CONTAINER_NAME} du -sh /app/dist 2>/dev/null || echo "无法计算大小"
    
    # 检查关键文件
    if docker exec ${CONTAINER_NAME} test -f /app/dist/index.html 2>/dev/null; then
        echo "✅ index.html 存在"
    else
        echo "❌ index.html 不存在 - 这是问题所在！"
    fi
else
    echo "❌ /app/dist 目录不存在 - 这是问题所在！"
fi
echo ""

# 5. 检查容器内的工作目录
echo "📂 检查容器工作目录:"
docker exec ${CONTAINER_NAME} pwd 2>/dev/null || echo "无法获取工作目录"
docker exec ${CONTAINER_NAME} ls -la /app 2>/dev/null | head -10
echo ""

# 6. 查看容器日志（最后 50 行）
echo "📋 容器日志（最后 50 行）:"
docker logs ${CONTAINER_NAME} --tail 50 2>&1
echo ""

# 7. 测试容器端口连接
echo "🔌 测试容器端口连接:"
if curl -f -s -m 5 http://localhost:30080 > /dev/null 2>&1; then
    echo "✅ 端口 30080 可以访问"
    echo ""
    echo "📄 响应头:"
    curl -I http://localhost:30080 2>&1 | head -10
else
    echo "❌ 端口 30080 无法访问"
fi
echo ""

# 8. 检查容器环境变量
echo "🌍 检查容器环境变量:"
docker exec ${CONTAINER_NAME} env 2>/dev/null | grep -E "(APP_DIR|NODE_ENV|PATH)" | head -10
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 诊断完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

