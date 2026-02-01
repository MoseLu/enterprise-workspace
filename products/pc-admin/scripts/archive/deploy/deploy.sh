#!/bin/bash

# BTC ShopFlow 生产环境部署脚本
# 使用Docker Compose进行稳定可靠的部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查root权限
if [[ $EUID -ne 0 ]]; then
    log_error "需要root权限运行此脚本"
    exit 1
fi

echo "🚀 BTC ShopFlow 生产环境部署脚本"
echo "================================"

# 1. 检查Docker
log_info "检查Docker状态..."
if ! command -v docker &> /dev/null; then
    log_error "Docker未安装，请先安装Docker"
    exit 1
fi

if ! systemctl is-active --quiet docker; then
    log_info "启动Docker服务..."
    systemctl start docker
fi

log_success "Docker已就绪: $(docker --version)"

# 2. 检查项目
log_info "检查项目目录..."
if [ ! -d "/www/wwwroot/btc-shopflow-monorepo" ]; then
    log_error "项目目录不存在，请先克隆项目"
    exit 1
fi

cd /www/wwwroot/btc-shopflow-monorepo

# 3. 构建镜像
log_info "构建Docker镜像..."
chmod +x scripts/build-all.sh
./scripts/build-all.sh

# 4. 创建Docker Compose配置
log_info "创建Docker Compose配置..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  system-app:
    image: btc-shopflow/system-app:latest
    container_name: btc-system-app
    ports:
      - "30080:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

  admin-app:
    image: btc-shopflow/admin-app:latest
    container_name: btc-admin-app
    ports:
      - "30081:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

  finance-app:
    image: btc-shopflow/finance-app:latest
    container_name: btc-finance-app
    ports:
      - "30086:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

  logistics-app:
    image: btc-shopflow/logistics-app:latest
    container_name: btc-logistics-app
    ports:
      - "30082:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

  quality-app:
    image: btc-shopflow/quality-app:latest
    container_name: btc-quality-app
    ports:
      - "30083:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

  production-app:
    image: btc-shopflow/production-app:latest
    container_name: btc-production-app
    ports:
      - "30084:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

  engineering-app:
    image: btc-shopflow/engineering-app:latest
    container_name: btc-engineering-app
    ports:
      - "30085:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

  mobile-app:
    image: btc-shopflow/mobile-app:latest
    container_name: btc-mobile-app
    ports:
      - "30091:80"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    networks:
      - btc-network

networks:
  btc-network:
    driver: bridge
EOF

# 5. 安装Docker Compose（如果需要）
if ! command -v docker-compose &> /dev/null; then
    log_info "安装Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 6. 启动服务
log_info "启动应用服务..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d

# 7. 配置防火墙
log_info "配置防火墙..."
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-port=30080/tcp
    firewall-cmd --permanent --add-port=30081/tcp
    firewall-cmd --permanent --add-port=30082/tcp
    firewall-cmd --permanent --add-port=30083/tcp
    firewall-cmd --permanent --add-port=30084/tcp
    firewall-cmd --permanent --add-port=30085/tcp
    firewall-cmd --permanent --add-port=30086/tcp
    firewall-cmd --permanent --add-port=30091/tcp
    firewall-cmd --reload
    log_success "防火墙配置完成"
fi

# 8. 健康检查
log_info "执行健康检查..."
sleep 20

ports=(30080 30081 30082 30083 30084 30085 30086 30091)
app_names=("主应用" "管理后台" "物流系统" "质量系统" "生产系统" "工程系统" "财务系统" "移动端")

for i in "${!ports[@]}"; do
    port=${ports[$i]}
    app_name=${app_names[$i]}
    if curl -f -s --max-time 10 "http://localhost:$port" > /dev/null 2>&1; then
        log_success "$app_name ($port) 服务正常"
    else
        log_warning "$app_name ($port) 服务可能仍在启动"
    fi
done

# 9. 显示状态
log_info "服务状态:"
docker-compose -f docker-compose.prod.yml ps

# 10. 生成访问信息
SERVER_IP=$(hostname -I | awk '{print $1}')
cat << EOF

🎉 部署完成！

📱 访问地址:
- 主应用:   http://$SERVER_IP:30080
- 管理后台: http://$SERVER_IP:30081
- 物流系统: http://$SERVER_IP:30082
- 质量系统: http://$SERVER_IP:30083
- 生产系统: http://$SERVER_IP:30084
- 工程系统: http://$SERVER_IP:30085
- 财务系统: http://$SERVER_IP:30086
- 移动端:   http://$SERVER_IP:30091

🔧 管理命令:
- 查看状态: docker-compose -f docker-compose.prod.yml ps
- 查看日志: docker-compose -f docker-compose.prod.yml logs -f
- 重启服务: docker-compose -f docker-compose.prod.yml restart
- 停止服务: docker-compose -f docker-compose.prod.yml down

📋 下一步:
1. 在宝塔面板中配置反向代理
2. 申请SSL证书
3. 配置域名解析

EOF

log_success "生产环境部署完成！"
