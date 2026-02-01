#!/bin/bash

# 诊断服务器上的 nginx 进程来源
# 用于识别哪些 nginx 进程来自 Docker 容器

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 诊断 Nginx 进程来源"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 检查所有 nginx 进程
echo "📋 所有 Nginx 进程:"
ps aux | grep nginx | grep -v grep | head -20
echo ""

# 2. 检查 Docker 容器状态
echo "📦 Docker 容器状态:"
docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}" 2>/dev/null || echo "Docker 未运行或无法访问"
echo ""

# 3. 检查容器内是否有 nginx
echo "🔍 检查容器内的 nginx 进程:"
for container in $(docker ps -q 2>/dev/null); do
  container_name=$(docker inspect --format '{{.Name}}' "$container" 2>/dev/null | sed 's/^\///')
  image=$(docker inspect --format '{{.Config.Image}}' "$container" 2>/dev/null)
  
  # 检查容器是否使用 nginx 镜像或包含 nginx
  if echo "$image" | grep -qi nginx || docker exec "$container" which nginx >/dev/null 2>&1; then
    echo "容器: $container_name (镜像: $image)"
    echo "  进程:"
    docker top "$container" 2>/dev/null | grep nginx || echo "    未发现 nginx 进程"
    echo ""
  fi
done

# 4. 检查是否有 btc-shopflow 容器
echo "📦 btc-shopflow 相关容器:"
docker ps -a --filter "name=btc-" --format "table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}" 2>/dev/null || echo "未发现 btc- 相关容器"
echo ""

# 5. 检查主机上的其他 nginx 服务
echo "🌐 检查主机上的 nginx 服务:"
systemctl status nginx 2>/dev/null | head -5 || echo "nginx 服务未通过 systemd 管理"
echo ""

# 6. 检查宝塔面板相关
echo "🔧 检查宝塔面板:"
if command -v bt >/dev/null 2>&1; then
  echo "宝塔面板已安装"
  bt status 2>/dev/null | head -5 || true
else
  echo "未检测到宝塔面板命令"
fi
echo ""

# 7. 检查端口占用（nginx 通常监听 80/443）
echo "🔌 检查端口占用 (80, 443):"
netstat -tlnp 2>/dev/null | grep -E ':(80|443)\s' || ss -tlnp 2>/dev/null | grep -E ':(80|443)\s' || echo "无法检查端口占用"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 诊断完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
