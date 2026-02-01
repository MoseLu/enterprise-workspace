#!/bin/bash

# SSL 问题修复脚本
# 修复诊断发现的问题

set -e

BUNDLE_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
KEY_FILE="/home/ssl/bellis.com.cn_nginx/bellis.com.cn.key"
BACKUP_DIR="/home/ssl/bellis.com.cn_nginx/backup_$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "SSL 问题修复工具"
echo "=========================================="
echo ""

# 1. 修复 key 文件权限
echo "1. 修复 key 文件权限..."
if [ -f "$KEY_FILE" ]; then
    CURRENT_PERMS=$(stat -c "%a" "$KEY_FILE" 2>/dev/null || stat -f "%OLp" "$KEY_FILE" 2>/dev/null)
    if [ "$CURRENT_PERMS" != "600" ]; then
        chmod 600 "$KEY_FILE"
        echo "   ✅ key 文件权限已从 $CURRENT_PERMS 改为 600"
    else
        echo "   ✅ key 文件权限已经是 600"
    fi
else
    echo "   ❌ key 文件不存在: $KEY_FILE"
    exit 1
fi
echo ""

# 2. 优化证书链（移除根证书）
echo "2. 优化证书链（移除根证书）..."
if [ -f "$BUNDLE_FILE" ]; then
    CERT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE")
    echo "   当前包含 $CERT_COUNT 个证书"
    
    if [ "$CERT_COUNT" -gt 3 ]; then
        echo "   ⚠️  检测到超过 3 个证书，可能包含根证书"
        echo "   Safari 需要服务器证书和所有中间证书，但不需要根证书"
        echo ""
        
        # 创建备份目录
        mkdir -p "$BACKUP_DIR"
        cp "$BUNDLE_FILE" "$BACKUP_DIR/bellis.com.cn_bundle.pem.bak"
        echo "   ✅ 已备份到: $BACKUP_DIR"
        echo ""
        
        # 分析证书链，识别根证书（自签名证书）
        echo "   分析证书链结构..."
        TEMP_DIR="/tmp/cert_analysis_$$"
        mkdir -p "$TEMP_DIR"
        
        # 分离每个证书
        awk '
            /-----BEGIN CERTIFICATE-----/ {
                cert_num++
                if (cert_num > 1) {
                    print cert > "'"$TEMP_DIR"'/cert_" (cert_num-1) ".pem"
                    close("'"$TEMP_DIR"'/cert_" (cert_num-1) ".pem")
                }
                cert = $0
                next
            }
            {
                cert = cert "\n" $0
            }
            /-----END CERTIFICATE-----/ {
                print cert > "'"$TEMP_DIR"'/cert_" cert_num ".pem"
                close("'"$TEMP_DIR"'/cert_" cert_num ".pem")
            }
        ' "$BUNDLE_FILE"
        
        # 检查每个证书，找出根证书（issuer == subject）
        ROOT_CERT_NUM=""
        for i in $(seq 1 $CERT_COUNT); do
            CERT_FILE="$TEMP_DIR/cert_${i}.pem"
            if [ -f "$CERT_FILE" ]; then
                SUBJECT=$(openssl x509 -in "$CERT_FILE" -noout -subject 2>/dev/null | sed 's/subject=//')
                ISSUER=$(openssl x509 -in "$CERT_FILE" -noout -issuer 2>/dev/null | sed 's/issuer=//')
                if [ "$SUBJECT" = "$ISSUER" ]; then
                    ROOT_CERT_NUM=$i
                    echo "   发现根证书（证书 $i）：自签名证书"
                    break
                fi
            fi
        done
        
        # 构建新的证书链（排除根证书）
        if [ -n "$ROOT_CERT_NUM" ]; then
            echo "   构建新证书链（排除根证书）..."
            > "$BUNDLE_FILE.tmp"
            for i in $(seq 1 $((ROOT_CERT_NUM - 1))); do
                if [ -f "$TEMP_DIR/cert_${i}.pem" ]; then
                    cat "$TEMP_DIR/cert_${i}.pem" >> "$BUNDLE_FILE.tmp"
                    echo "" >> "$BUNDLE_FILE.tmp"
                fi
            done
            
            NEW_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE.tmp")
            if [ "$NEW_COUNT" -gt 0 ]; then
                mv "$BUNDLE_FILE.tmp" "$BUNDLE_FILE"
                chmod 644 "$BUNDLE_FILE"
                echo "   ✅ 证书链已优化，现在包含 $NEW_COUNT 个证书（已排除根证书）"
            else
                echo "   ⚠️  优化失败，保留原文件"
                rm -f "$BUNDLE_FILE.tmp"
            fi
        else
            # 如果没有找到根证书，但证书数量超过3个，保留前3个（通常是服务器+2个中间证书）
            echo "   未找到明显的根证书，保留前 3 个证书..."
            awk '/BEGIN CERTIFICATE/{i++} i<=3' "$BUNDLE_FILE" > "$BUNDLE_FILE.tmp"
            NEW_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE.tmp")
            if [ "$NEW_COUNT" -eq 3 ]; then
                mv "$BUNDLE_FILE.tmp" "$BUNDLE_FILE"
                chmod 644 "$BUNDLE_FILE"
                echo "   ✅ 证书链已优化，现在包含 $NEW_COUNT 个证书"
            else
                echo "   ⚠️  优化失败，保留原文件"
                rm -f "$BUNDLE_FILE.tmp"
            fi
        fi
        
        # 清理临时文件
        rm -rf "$TEMP_DIR"
    elif [ "$CERT_COUNT" -eq 4 ]; then
        # 如果有4个证书，很可能是：服务器 + 中间1 + 中间2 + 根证书
        # 保留前3个（排除最后一个根证书）
        echo "   检测到 4 个证书，保留前 3 个（排除根证书）..."
        
        # 创建备份
        mkdir -p "$BACKUP_DIR"
        cp "$BUNDLE_FILE" "$BACKUP_DIR/bellis.com.cn_bundle.pem.bak"
        echo "   ✅ 已备份到: $BACKUP_DIR"
        echo ""
        
        # 保留前3个证书
        awk '/BEGIN CERTIFICATE/{i++} i<=3' "$BUNDLE_FILE" > "$BUNDLE_FILE.tmp"
        NEW_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_FILE.tmp")
        if [ "$NEW_COUNT" -eq 3 ]; then
            mv "$BUNDLE_FILE.tmp" "$BUNDLE_FILE"
            chmod 644 "$BUNDLE_FILE"
            echo "   ✅ 证书链已优化，现在包含 $NEW_COUNT 个证书"
        else
            echo "   ⚠️  优化失败，保留原文件"
            rm -f "$BUNDLE_FILE.tmp"
        fi
    else
        echo "   ✅ 证书数量正常（≤2），无需优化"
    fi
else
    echo "   ❌ bundle.pem 文件不存在: $BUNDLE_FILE"
    exit 1
fi
echo ""

# 3. 检查并处理多个 nginx 进程
echo "3. 检查 nginx 进程..."
NGINX_COUNT=$(pgrep -x nginx | wc -l)
MASTER_COUNT=$(ps aux | grep "nginx: master" | grep -v grep | wc -l)

echo "   发现 $NGINX_COUNT 个 nginx 进程"
echo "   发现 $MASTER_COUNT 个 nginx master 进程"

if [ "$MASTER_COUNT" -gt 1 ]; then
    echo "   ⚠️  警告: 检测到多个 nginx master 进程"
    echo "   这可能导致配置冲突"
    echo ""
    echo "   当前运行的 nginx 进程："
    ps aux | grep "nginx: master" | grep -v grep
    echo ""
    echo "   建议："
    echo "   1. 检查是否有多个 nginx 配置文件"
    echo "   2. 停止不需要的 nginx 实例"
    echo "   3. 确保只有一个 nginx master 进程在运行"
    echo ""
    echo "   如果需要停止额外的 nginx 实例，请手动执行："
    echo "   kill <PID>  # 替换 <PID> 为不需要的进程 ID"
else
    echo "   ✅ nginx 进程正常"
fi
echo ""

# 4. 验证证书链
echo "4. 验证优化后的证书链..."
if openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过"
else
    echo "   ⚠️  证书链验证失败"
    openssl verify -CAfile "$BUNDLE_FILE" "$BUNDLE_FILE" 2>&1 | head -3
fi
echo ""

# 5. 测试 nginx 配置
echo "5. 测试 nginx 配置..."
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ nginx 配置测试通过"
    echo ""
    echo "=========================================="
    echo "修复完成！"
    echo "=========================================="
    echo ""
    echo "下一步操作："
    echo "1. 重新加载 nginx: nginx -s reload"
    echo "2. 等待几分钟后，在 SSL Labs 重新测试："
    echo "   https://www.ssllabs.com/ssltest/analyze.html?d=mobile.bellis.com.cn"
    echo "3. 在 iOS Safari 中清除缓存并重新访问"
    echo ""
    echo "如果仍有多个 nginx master 进程，请手动处理"
    echo ""
else
    echo "   ❌ nginx 配置测试失败"
    nginx -t 2>&1 | tail -5
    echo ""
fi

