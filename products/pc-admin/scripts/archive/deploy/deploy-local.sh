#!/bin/bash

# BTC ShopFlow - 本地构建并部署脚本
# 在本地构建所有产物和Docker镜像，然后通过SCP上传到服务器
# 优点：避免服务器磁盘空间问题，大幅缩短部署时间

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

# 配置（可以从环境变量或参数读取）
SERVER_HOST="${SERVER_HOST:-}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"
REMOTE_PATH="${REMOTE_PATH:-/www/wwwroot/btc-shopflow-monorepo}"
REGISTRY="btc-shopflow"
TEMP_DIR="/tmp/btc-shopflow-deploy"

# 应用列表
APPS=(
    "system-app"
    "admin-app"
    "finance-app"
    "logistics-app"
    "quality-app"
    "production-app"
    "engineering-app"
    "mobile-app"
)

log_info "🚀 BTC ShopFlow 本地构建部署脚本"
echo "================================"

# 1. 检查必需工具
log_info "检查必需工具..."

if ! command -v docker &> /dev/null; then
    log_error "Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    log_error "pnpm未安装，请先安装pnpm"
    exit 1
fi

if ! command -v ssh &> /dev/null; then
    log_error "SSH未安装，请先安装SSH客户端"
    exit 1
fi

log_success "所有必需工具已就绪"

# 2. 检查服务器配置
if [ -z "$SERVER_HOST" ]; then
    log_warning "SERVER_HOST未设置，请输入服务器地址："
    read -r SERVER_HOST
fi

log_info "服务器配置: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"

# 3. 检查项目目录
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    log_error "请在项目根目录执行此脚本"
    exit 1
fi

# 4. 安装依赖（如果还没安装）
log_info "检查依赖..."
if [ ! -d "node_modules" ] || [ ! -f "pnpm-lock.yaml" ]; then
    log_info "安装依赖..."
    pnpm install --no-frozen-lockfile
else
    log_info "依赖已存在，跳过安装"
fi

# 5. 构建共享包
log_info "构建共享包..."
pnpm --filter @btc/vite-plugin run build
pnpm --filter @btc/shared-utils run build
pnpm --filter @btc/shared-core run build
pnpm --filter @btc/shared-components run build
pnpm --filter @btc/subapp-manifests run build

log_success "共享包构建完成"

# 6. 构建所有应用
log_info "构建所有应用..."
for app in "${APPS[@]}"; do
    log_info "构建 $app..."
    pnpm --filter "$app" run build
done

log_success "所有应用构建完成"

# 7. 创建临时目录
log_info "创建临时目录..."
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# 8. 构建Docker镜像（使用预构建的dist）
log_info "构建Docker镜像..."
for app in "${APPS[@]}"; do
    log_info "构建 $app 的Docker镜像..."
    app_path="apps/$app"
    
    if [ ! -d "$app_path/dist" ] || [ -z "$(ls -A $app_path/dist 2>/dev/null)" ]; then
        log_error "$app 尚未构建，请先运行构建步骤"
        exit 1
    fi
    
    # 创建简化的Dockerfile
    if [ -f "$app_path/nginx.conf" ]; then
        cat > "$app_path/Dockerfile.local" << EOF
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
    else
        cat > "$app_path/Dockerfile.local" << EOF
FROM nginx:alpine
COPY dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { try_files \$uri \$uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
    fi
    
    # 构建镜像
    docker build -t "${REGISTRY}/${app}:latest" -f "$app_path/Dockerfile.local" "$app_path"
    
    # 保存镜像为tar文件
    log_info "保存 $app 镜像为tar文件..."
    docker save "${REGISTRY}/${app}:latest" | gzip > "$TEMP_DIR/${app}.tar.gz"
    
    log_success "$app 镜像已保存"
done

log_success "所有Docker镜像构建完成"

# 9. 上传镜像到服务器
log_info "上传镜像到服务器..."
log_info "SSH密钥: $SSH_KEY"

# 测试SSH连接
log_info "测试SSH连接..."
if ! ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 \
    -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'"; then
    log_error "SSH连接失败，请检查配置"
    exit 1
fi

log_success "SSH连接成功"

# 在服务器上创建临时目录
log_info "在服务器上创建临时目录..."
ssh -o StrictHostKeyChecking=no \
    -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" \
    "mkdir -p $REMOTE_PATH/tmp/docker-images"

# 上传所有镜像
log_info "上传Docker镜像（这可能需要一些时间）..."
for app in "${APPS[@]}"; do
    log_info "上传 $app 镜像..."
    scp -o StrictHostKeyChecking=no -P "$SERVER_PORT" -i "$SSH_KEY" \
        "$TEMP_DIR/${app}.tar.gz" \
        "$SERVER_USER@$SERVER_HOST:$REMOTE_PATH/tmp/docker-images/"
    log_success "$app 镜像上传完成"
done

log_success "所有镜像上传完成"

# 10. 在服务器上加载镜像并部署
log_info "在服务器上加载镜像并部署..."
ssh -o StrictHostKeyChecking=no \
    -i "$SSH_KEY" -p "$SERVER_PORT" \
    "$SERVER_USER@$SERVER_HOST" << REMOTE_SCRIPT
set -e

REMOTE_PATH="$REMOTE_PATH"
cd "\$REMOTE_PATH"

echo "[INFO] 加载Docker镜像..."
for image in tmp/docker-images/*.tar.gz; do
    if [ -f "$image" ]; then
        app_name=$(basename "$image" .tar.gz)
        echo "[INFO] 加载 $app_name 镜像..."
        docker load < "$image"
    fi
done

echo "[INFO] 创建Docker Compose配置..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  system-app:
    image: btc-shopflow/system-app:latest
    container_name: btc-system-app
    ports:
      - "30080:80"
    restart: unless-stopped
    networks:
      - btc-network

  admin-app:
    image: btc-shopflow/admin-app:latest
    container_name: btc-admin-app
    ports:
      - "30081:80"
    restart: unless-stopped
    networks:
      - btc-network

  finance-app:
    image: btc-shopflow/finance-app:latest
    container_name: btc-finance-app
    ports:
      - "30086:80"
    restart: unless-stopped
    networks:
      - btc-network

  logistics-app:
    image: btc-shopflow/logistics-app:latest
    container_name: btc-logistics-app
    ports:
      - "30082:80"
    restart: unless-stopped
    networks:
      - btc-network

  quality-app:
    image: btc-shopflow/quality-app:latest
    container_name: btc-quality-app
    ports:
      - "30083:80"
    restart: unless-stopped
    networks:
      - btc-network

  production-app:
    image: btc-shopflow/production-app:latest
    container_name: btc-production-app
    ports:
      - "30084:80"
    restart: unless-stopped
    networks:
      - btc-network

  engineering-app:
    image: btc-shopflow/engineering-app:latest
    container_name: btc-engineering-app
    ports:
      - "30085:80"
    restart: unless-stopped
    networks:
      - btc-network

  mobile-app:
    image: btc-shopflow/mobile-app:latest
    container_name: btc-mobile-app
    ports:
      - "30091:80"
    restart: unless-stopped
    networks:
      - btc-network

networks:
  btc-network:
    driver: bridge
EOF

echo "[INFO] 启动服务..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d

echo "[INFO] 清理临时文件..."
rm -rf tmp/docker-images

echo "[SUCCESS] 部署完成！"
REMOTE_SCRIPT

log_success "部署完成！"

# 11. 清理本地临时文件
log_info "清理本地临时文件..."
rm -rf "$TEMP_DIR"

log_success "本地临时文件已清理"

# 12. 显示部署信息
cat << EOF

🎉 本地构建部署完成！

📊 构建统计:
- 共享包: 5个
- 应用: ${#APPS[@]}个
- Docker镜像: ${#APPS[@]}个

📱 访问地址:
- 主应用:   http://$SERVER_HOST:30080
- 管理后台: http://$SERVER_HOST:30081
- 物流系统: http://$SERVER_HOST:30082
- 质量系统: http://$SERVER_HOST:30083
- 生产系统: http://$SERVER_HOST:30084
- 工程系统: http://$SERVER_HOST:30085
- 财务系统: http://$SERVER_HOST:30086
- 移动端:   http://$SERVER_HOST:30091

⚡ 优势:
- ✅ 避免了服务器磁盘空间问题
- ✅ 大幅缩短部署时间（本地构建更快）
- ✅ 利用本地构建缓存
- ✅ 减少服务器IO压力

EOF

log_success "所有步骤完成！"

