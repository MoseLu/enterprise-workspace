#!/bin/bash

# 证书合并脚本 - 为 Safari/iOS 优化证书链
# 从 certs 目录读取证书文件，合并为 Safari 需要的格式

set -e

CERT_DIR="$(cd "$(dirname "$0")/../certs" && pwd)"
OUTPUT_DIR="$(cd "$(dirname "$0")/../certs" && pwd)"

BUNDLE_PEM="$CERT_DIR/bellis.com.cn_bundle.pem"
BUNDLE_CRT="$CERT_DIR/bellis.com.cn_bundle.crt"
KEY_FILE="$CERT_DIR/bellis.com.cn.key"
OUTPUT_BUNDLE="$OUTPUT_DIR/bellis.com.cn_bundle_safari.pem"

echo "=========================================="
echo "Safari/iOS 证书链合并工具"
echo "=========================================="
echo ""

# 1. 检查输入文件
echo "1. 检查证书文件..."
FILES_FOUND=0

if [ -f "$BUNDLE_PEM" ]; then
    echo "   ✅ 找到: bellis.com.cn_bundle.pem"
    PEM_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_PEM" 2>/dev/null || echo "0")
    echo "      包含 $PEM_COUNT 个证书"
    FILES_FOUND=$((FILES_FOUND + 1))
    SOURCE_FILE="$BUNDLE_PEM"
elif [ -f "$BUNDLE_CRT" ]; then
    echo "   ✅ 找到: bellis.com.cn_bundle.crt"
    CRT_COUNT=$(grep -c "BEGIN CERTIFICATE" "$BUNDLE_CRT" 2>/dev/null || echo "0")
    echo "      包含 $CRT_COUNT 个证书"
    FILES_FOUND=$((FILES_FOUND + 1))
    SOURCE_FILE="$BUNDLE_CRT"
else
    echo "   ❌ 未找到 bundle.pem 或 bundle.crt 文件"
    exit 1
fi

if [ -f "$KEY_FILE" ]; then
    echo "   ✅ 找到: bellis.com.cn.key"
    FILES_FOUND=$((FILES_FOUND + 1))
else
    echo "   ⚠️  未找到 key 文件（可选）"
fi

echo ""
echo "   找到 $FILES_FOUND 个相关文件"
echo ""

# 2. 分析证书链结构
echo "2. 分析证书链结构..."
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
' "$SOURCE_FILE"

CERT_COUNT=$(ls -1 "$TEMP_DIR"/cert_*.pem 2>/dev/null | wc -l)
echo "   分离出 $CERT_COUNT 个证书"
echo ""

# 3. 分析每个证书
echo "3. 分析每个证书..."
ROOT_CERT_NUM=""
for i in $(seq 1 $CERT_COUNT); do
    CERT_FILE="$TEMP_DIR/cert_${i}.pem"
    if [ -f "$CERT_FILE" ]; then
        SUBJECT=$(openssl x509 -in "$CERT_FILE" -noout -subject 2>/dev/null | sed 's/subject=//' | head -c 80)
        ISSUER=$(openssl x509 -in "$CERT_FILE" -noout -issuer 2>/dev/null | sed 's/issuer=//' | head -c 80)
        
        # 检查是否是根证书（自签名）
        SUBJECT_CN=$(echo "$SUBJECT" | grep -o "CN = [^,]*" | head -1)
        ISSUER_CN=$(echo "$ISSUER" | grep -o "CN = [^,]*" | head -1)
        
        if [ "$SUBJECT_CN" = "$ISSUER_CN" ] && [ -n "$SUBJECT_CN" ]; then
            ROOT_CERT_NUM=$i
            echo "   证书 $i: [根证书] $SUBJECT_CN"
            echo "      ⚠️  这是根证书（自签名），将被排除"
        else
            echo "   证书 $i: $SUBJECT_CN"
            echo "      Issuer: $ISSUER_CN"
        fi
    fi
done
echo ""

# 4. 构建 Safari 优化的证书链
echo "4. 构建 Safari 优化的证书链..."

if [ -n "$ROOT_CERT_NUM" ]; then
    echo "   排除根证书（证书 $ROOT_CERT_NUM），保留前 $((ROOT_CERT_NUM - 1)) 个证书"
    CERT_TO_KEEP=$((ROOT_CERT_NUM - 1))
else
    # 如果没有找到明显的根证书，但证书数量>=4，通常最后一个可能是根证书
    if [ "$CERT_COUNT" -ge 4 ]; then
        echo "   未找到明显的根证书，但证书数量>=4"
        echo "   保留前 3 个证书（通常：服务器证书 + 2个中间证书）"
        CERT_TO_KEEP=3
    else
        echo "   保留所有 $CERT_COUNT 个证书"
        CERT_TO_KEEP=$CERT_COUNT
    fi
fi

# 合并证书
> "$OUTPUT_BUNDLE"
for i in $(seq 1 $CERT_TO_KEEP); do
    if [ -f "$TEMP_DIR/cert_${i}.pem" ]; then
        cat "$TEMP_DIR/cert_${i}.pem" >> "$OUTPUT_BUNDLE"
        echo "" >> "$OUTPUT_BUNDLE"
    fi
done

FINAL_COUNT=$(grep -c "BEGIN CERTIFICATE" "$OUTPUT_BUNDLE")
echo "   ✅ 新证书链包含 $FINAL_COUNT 个证书"
echo ""

# 5. 验证证书链
echo "5. 验证证书链..."
if openssl verify -CAfile "$OUTPUT_BUNDLE" "$OUTPUT_BUNDLE" >/dev/null 2>&1; then
    echo "   ✅ 证书链验证通过！"
else
    echo "   ⚠️  证书链验证失败（这可能是正常的，如果缺少根证书）"
    echo "   验证输出："
    openssl verify -CAfile "$OUTPUT_BUNDLE" "$OUTPUT_BUNDLE" 2>&1 | head -3
    echo ""
    echo "   注意：Safari 不需要根证书，验证失败可能是正常的"
fi
echo ""

# 6. 显示证书信息
echo "6. 最终证书链信息..."
echo "   服务器证书："
openssl x509 -in "$OUTPUT_BUNDLE" -noout -subject -issuer 2>/dev/null | head -2
echo ""

# 7. 清理
rm -rf "$TEMP_DIR"

echo "=========================================="
echo "合并完成！"
echo "=========================================="
echo ""
echo "输出文件: $OUTPUT_BUNDLE"
echo "包含证书: $FINAL_COUNT 个"
echo ""
echo "使用方法："
echo "1. 将 $OUTPUT_BUNDLE 上传到服务器"
echo "2. 替换 /home/ssl/bellis.com.cn_nginx/bellis.com.cn_bundle.pem"
echo "3. 重新加载 nginx: nginx -s reload"
echo ""

