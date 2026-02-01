#!/bin/bash

# BTC ShopFlow - 构建所有 Docker 镜像脚本
# 用于宝塔面板部署

set -e

echo "🚀 开始构建 BTC ShopFlow 所有应用镜像..."

# 项目根目录
PROJECT_ROOT=$(pwd)
REGISTRY="btc-shopflow"

# 应用列表（排除docs-app，它是文档站点，不需要Docker构建）
APPS=(
    "system-app"
    "admin-app" 
    "finance-app"
    "logistics-app"
    "quality-app"
    "production-app"
    "engineering-app"
)

# 构建函数
build_app() {
    local app_name=$1
    local app_path="apps/${app_name}"
    
    echo "📦 构建 ${app_name}..."
    
    if [ ! -d "${app_path}" ]; then
        echo "⚠️  警告: ${app_path} 目录不存在，跳过构建"
        return
    fi
    
    # 提示：如果本地未构建，建议先构建
    if [ ! -d "${app_path}/dist" ] || [ -z "$(ls -A ${app_path}/dist 2>/dev/null)" ]; then
        echo "💡 提示: ${app_name} 尚未构建，将在Docker中完整构建（较慢）"
        echo "   如果想加速，可以先运行: pnpm --filter ${app_name} run build"
    fi
    
    # 检查本地是否已经构建好（优先使用预构建的dist）
    USE_PREBUILT=false
    if [ -d "${app_path}/dist" ] && [ -n "$(ls -A ${app_path}/dist 2>/dev/null)" ]; then
        echo "📦 检测到本地已构建的 ${app_name}，使用预构建版本（更快！）..."
        USE_PREBUILT=true
        
        # 使用预构建版本的简化Dockerfile
        # 检查是否有nginx配置
        if [ -f "${app_path}/nginx.conf" ]; then
            echo "📋 检测到nginx配置，将在Dockerfile中包含"
            cat > "${app_path}/Dockerfile" << EOF
# Use pre-built application
FROM nginx:alpine

# 复制预构建的构建产物
COPY dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
        else
            cat > "${app_path}/Dockerfile" << EOF
# Use pre-built application
FROM nginx:alpine

# 复制预构建的构建产物
COPY dist /usr/share/nginx/html

# 创建 nginx 配置
RUN echo 'server { listen 80; location / { try_files \$uri \$uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
        fi
    elif [ ! -f "${app_path}/Dockerfile" ]; then
        echo "📝 创建 ${app_name} 的 Dockerfile（完整构建模式）..."
        cat > "${app_path}/Dockerfile" << EOF
# Multi-stage build for ${app_name}
FROM node:20-alpine AS builder

WORKDIR /app

# 复制所有 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY auth/ ./auth/
COPY scripts/ ./scripts/
COPY configs/ ./configs/

# 安装 pnpm
RUN npm install -g pnpm

# 安装所有依赖（并清理缓存以节省空间）
RUN pnpm install --no-frozen-lockfile && \
    pnpm store prune && \
    rm -rf ~/.pnpm-store/v3/files/* || true

# 构建依赖包（按依赖顺序）
RUN pnpm --filter @btc/vite-plugin run build
RUN pnpm --filter @btc/shared-utils run build
RUN pnpm --filter @btc/shared-core run build
RUN pnpm --filter @btc/shared-components run build
RUN pnpm --filter @btc/subapp-manifests run build

# 构建应用
RUN cd apps/${app_name} && pnpm run build

# 清理构建依赖以节省空间
RUN rm -rf node_modules packages/*/node_modules apps/*/node_modules && \
    rm -rf packages/*/src apps/${app_name}/src && \
    find /app -name "*.ts" -not -path "*/node_modules/*" -delete 2>/dev/null || true && \
    find /app -name "tsconfig*.json" -not -path "*/node_modules/*" -delete 2>/dev/null || true

# Production stage
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/apps/${app_name}/dist /usr/share/nginx/html

# 创建 nginx 配置
RUN echo 'server { listen 80; location / { try_files \$uri \$uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
    fi
    
    # 构建镜像（根据是否使用预构建版本选择不同的上下文）
    if [ "$USE_PREBUILT" = "true" ]; then
        # 使用预构建版本：上下文是应用目录（只需要dist和nginx.conf）
        echo "🔨 构建Docker镜像（使用预构建版本）..."
        docker build -t "${REGISTRY}/${app_name}:latest" -f "${app_path}/Dockerfile" "${app_path}"
    else
        # 完整构建：上下文是项目根目录（需要所有源码）
        echo "🔨 构建Docker镜像（完整构建模式，可能较慢）..."
    docker build -t "${REGISTRY}/${app_name}:latest" -f "${app_path}/Dockerfile" .
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ ${app_name} 构建成功"
    else
        echo "❌ ${app_name} 构建失败"
        exit 1
    fi
}

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    echo "❌ 请在项目根目录执行此脚本"
    exit 1
fi

# 构建所有应用
for app in "${APPS[@]}"; do
    build_app "$app"
done

echo ""
echo "🎉 所有应用镜像构建完成！"
echo ""
echo "📋 构建的镜像列表:"
for app in "${APPS[@]}"; do
    if docker images "${REGISTRY}/${app}:latest" --format "table {{.Repository}}:{{.Tag}}" | grep -q "${app}"; then
        echo "  ✅ ${REGISTRY}/${app}:latest"
    fi
done

echo ""
echo "🚀 接下来可以执行部署命令:"
echo "   cd k8s && ./deploy.sh"
