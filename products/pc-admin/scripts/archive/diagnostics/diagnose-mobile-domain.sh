#!/bin/bash

# 诊断 mobile.bellis.com.cn 域名配置问题

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

DOMAIN="mobile.bellis.com.cn"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 诊断 $DOMAIN 配置问题"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 检查 DNS 解析
log_info "1. 检查 DNS 解析..."
DNS_IP=$(dig +short $DOMAIN 2>/dev/null || nslookup $DOMAIN 2>/dev/null | grep -A 1 "Name:" | tail -1 | awk '{print $2}' || echo "")
if [ -n "$DNS_IP" ]; then
    log_success "DNS 解析正常: $DOMAIN -> $DNS_IP"
else
    log_error "DNS 解析失败，请检查 DNS 配置"
fi
echo ""

# 2. 检查配置文件是否存在
log_info "2. 检查配置文件..."
CONF_FILES=(
    "/www/server/nginx/conf/vhost/$DOMAIN.conf"
    "/etc/nginx/sites-available/$DOMAIN.conf"
    "/etc/nginx/sites-enabled/$DOMAIN.conf"
    "/www/server/panel/vhost/nginx/$DOMAIN.conf"
    "/www/server/nginx/conf/conf.d/$DOMAIN.conf"
)

FOUND_CONF=""
for conf_file in "${CONF_FILES[@]}"; do
    if [ -f "$conf_file" ]; then
        log_success "找到配置文件: $conf_file"
        FOUND_CONF="$conf_file"
        break
    fi
done

if [ -z "$FOUND_CONF" ]; then
    log_warning "未找到标准位置的配置文件"
    log_info "搜索所有包含 $DOMAIN 的配置文件..."
    find /www/server/nginx/conf /etc/nginx -name "*.conf" -type f 2>/dev/null | xargs grep -l "$DOMAIN" 2>/dev/null | head -5 || log_error "未找到任何包含 $DOMAIN 的配置文件"
fi
echo ""

# 3. 检查配置文件是否被包含
log_info "3. 检查配置文件是否被包含到主配置..."
MAIN_NGINX_CONF="/etc/nginx/nginx.conf"
if [ ! -f "$MAIN_NGINX_CONF" ]; then
    MAIN_NGINX_CONF="/www/server/nginx/conf/nginx.conf"
fi

if [ -f "$MAIN_NGINX_CONF" ]; then
    if grep -q "$DOMAIN" "$MAIN_NGINX_CONF" 2>/dev/null || grep -q "include.*$DOMAIN" "$MAIN_NGINX_CONF" 2>/dev/null; then
        log_success "主配置文件中包含 $DOMAIN 配置"
    else
        log_warning "主配置文件中未找到 $DOMAIN 配置"
        log_info "检查 include 指令..."
        grep -E "include.*conf" "$MAIN_NGINX_CONF" | head -5 || log_warning "未找到 include 指令"
    fi
else
    log_error "未找到主 nginx 配置文件"
fi
echo ""

# 4. 检查 nginx 配置语法
log_info "4. 检查 nginx 配置语法..."
if command -v nginx >/dev/null 2>&1; then
    if nginx -t 2>&1 | grep -q "successful"; then
        log_success "Nginx 配置语法正确"
    else
        log_error "Nginx 配置语法错误:"
        nginx -t 2>&1 | grep -i error || true
    fi
else
    log_warning "未找到 nginx 命令，无法检查配置语法"
fi
echo ""

# 5. 检查 SSL 证书
log_info "5. 检查 SSL 证书..."
SSL_CERT_PATHS=(
    "/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
    "/www/server/nginx/ssl/bellis.com.cn/fullchain.pem"
    "/etc/nginx/ssl/bellis.com.cn/fullchain.pem"
)

FOUND_CERT=""
for cert_path in "${SSL_CERT_PATHS[@]}"; do
    if [ -f "$cert_path" ]; then
        log_success "找到 SSL 证书: $cert_path"
        FOUND_CERT="$cert_path"
        # 检查证书有效期
        if command -v openssl >/dev/null 2>&1; then
            CERT_EXPIRY=$(openssl x509 -in "$cert_path" -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
            if [ -n "$CERT_EXPIRY" ]; then
                log_info "证书有效期至: $CERT_EXPIRY"
            fi
        fi
        break
    fi
done

if [ -z "$FOUND_CERT" ]; then
    log_error "未找到 SSL 证书文件"
fi
echo ""

# 6. 检查静态文件目录
log_info "6. 检查静态文件目录..."
STATIC_DIR="/www/wwwroot/$DOMAIN"
if [ -d "$STATIC_DIR" ]; then
    log_success "静态文件目录存在: $STATIC_DIR"
    if [ -f "$STATIC_DIR/index.html" ]; then
        log_success "找到 index.html 文件"
        INDEX_SIZE=$(du -h "$STATIC_DIR/index.html" | cut -f1)
        log_info "index.html 大小: $INDEX_SIZE"
    else
        log_warning "未找到 index.html 文件"
    fi
    
    # 检查 assets 目录
    if [ -d "$STATIC_DIR/assets" ]; then
        ASSET_COUNT=$(find "$STATIC_DIR/assets" -type f | wc -l)
        log_info "assets 目录包含 $ASSET_COUNT 个文件"
    else
        log_warning "未找到 assets 目录"
    fi
else
    log_error "静态文件目录不存在: $STATIC_DIR"
fi
echo ""

# 7. 测试 HTTP 连接
log_info "7. 测试 HTTP 连接..."
if command -v curl >/dev/null 2>&1; then
    # 测试 HTTP (应该重定向到 HTTPS)
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        log_success "HTTP 重定向正常 (状态码: $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "000" ]; then
        log_error "无法连接到 $DOMAIN (HTTP)"
    else
        log_warning "HTTP 响应异常 (状态码: $HTTP_CODE)"
    fi
    
    # 测试 HTTPS
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k "https://$DOMAIN" 2>/dev/null || echo "000")
    if [ "$HTTPS_CODE" = "200" ]; then
        log_success "HTTPS 连接正常 (状态码: $HTTPS_CODE)"
    elif [ "$HTTPS_CODE" = "000" ]; then
        log_error "无法连接到 $DOMAIN (HTTPS)"
    else
        log_warning "HTTPS 响应异常 (状态码: $HTTPS_CODE)"
    fi
else
    log_warning "未找到 curl 命令，无法测试连接"
fi
echo ""

# 8. 检查 nginx 错误日志
log_info "8. 检查 nginx 错误日志..."
ERROR_LOG_PATHS=(
    "/var/log/nginx/error.log"
    "/www/wwwlogs/nginx_error.log"
    "/var/log/nginx/${DOMAIN}.error.log"
)

for log_path in "${ERROR_LOG_PATHS[@]}"; do
    if [ -f "$log_path" ]; then
        log_info "检查日志: $log_path"
        RECENT_ERRORS=$(grep -i "$DOMAIN\|mobile" "$log_path" 2>/dev/null | tail -5 || echo "")
        if [ -n "$RECENT_ERRORS" ]; then
            log_warning "最近的错误日志:"
            echo "$RECENT_ERRORS" | sed 's/^/  /'
        else
            log_success "未发现相关错误"
        fi
        break
    fi
done
echo ""

# 9. 检查端口监听
log_info "9. 检查端口监听..."
if command -v netstat >/dev/null 2>&1; then
    PORT_80=$(netstat -tlnp 2>/dev/null | grep ":80 " || echo "")
    PORT_443=$(netstat -tlnp 2>/dev/null | grep ":443 " || echo "")
elif command -v ss >/dev/null 2>&1; then
    PORT_80=$(ss -tlnp 2>/dev/null | grep ":80 " || echo "")
    PORT_443=$(ss -tlnp 2>/dev/null | grep ":443 " || echo "")
fi

if [ -n "$PORT_80" ]; then
    log_success "端口 80 正在监听"
    echo "$PORT_80" | sed 's/^/  /'
else
    log_warning "端口 80 未监听"
fi

if [ -n "$PORT_443" ]; then
    log_success "端口 443 正在监听"
    echo "$PORT_443" | sed 's/^/  /'
else
    log_warning "端口 443 未监听"
fi
echo ""

# 10. 检查 nginx 服务状态
log_info "10. 检查 nginx 服务状态..."
if systemctl is-active --quiet nginx 2>/dev/null; then
    log_success "Nginx 服务正在运行"
    systemctl status nginx --no-pager -l | head -3 | sed 's/^/  /'
else
    log_error "Nginx 服务未运行"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 诊断完成"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 建议："
echo "1. 如果配置文件不存在，请确保 mobile.bellis.com.cn.conf 已部署到服务器"
echo "2. 如果配置文件存在但未被加载，请检查主 nginx.conf 中的 include 指令"
echo "3. 如果配置语法错误，请修复后运行: nginx -t && systemctl reload nginx"
echo "4. 如果静态文件目录不存在，请确保应用已正确构建和部署"

