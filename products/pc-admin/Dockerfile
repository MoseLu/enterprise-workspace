# syntax=docker/dockerfile:1.7
# 优化后的 Dockerfile：仅负责运行，不进行构建
# 依赖于外部（CI Runner）已经构建好的 dist 目录

ARG APP_DIR=apps/admin-app
FROM nginx:alpine

ARG APP_DIR
ENV APP_DIR=${APP_DIR}

# 复制 Nginx 配置文件（先复制配置文件，利用 Docker 缓存）
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到 Nginx 默认目录（最后复制，因为 dist 内容变化最频繁）
COPY ${APP_DIR}/dist /usr/share/nginx/html

# 验证 dist 目录（简化验证，减少镜像层）
RUN test -d /usr/share/nginx/html && test -n "$(ls -A /usr/share/nginx/html 2>/dev/null)" || \
    (echo "ERROR: dist directory is empty or does not exist!" && exit 1)

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
