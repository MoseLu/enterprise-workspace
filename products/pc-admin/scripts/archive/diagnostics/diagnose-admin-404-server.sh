#!/bin/bash

# 诊断 admin.bellis.com.cn 的 404 问题（服务器端运行版本）
# 在服务器上直接运行此脚本，检查实际文件和 vendor 文件中的引用

set -e

DEPLOY_PATH="/www/wwwroot/admin.bellis.com.cn"

echo "🔍 诊断 admin.bellis.com.cn 的 404 问题（服务器端）..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 检查部署目录是否存在
echo "1️⃣ 检查部署目录..."
if [ -d "$DEPLOY_PATH" ]; then
    echo "✅ 部署目录存在: $DEPLOY_PATH"
else
    echo "❌ 部署目录不存在: $DEPLOY_PATH"
    exit 1
fi

# 2. 列出所有 assets 文件
echo ""
echo "2️⃣ 列出所有 assets 文件..."
if [ -d "$DEPLOY_PATH/assets" ]; then
    ASSETS_FILES=$(find "$DEPLOY_PATH/assets" -type f \( -name "*.js" -o -name "*.css" \) 2>/dev/null | sort)
    echo "$ASSETS_FILES" | head -20
    TOTAL_FILES=$(echo "$ASSETS_FILES" | wc -l)
    echo "总共 $TOTAL_FILES 个文件"
else
    echo "❌ assets 目录不存在"
    exit 1
fi

# 3. 查找 vendor 文件
echo ""
echo "3️⃣ 查找 vendor 文件..."
VENDOR_FILES=$(find "$DEPLOY_PATH/assets" -name "vendor-*.js" 2>/dev/null)
if [ -n "$VENDOR_FILES" ]; then
    echo "$VENDOR_FILES"
    VENDOR_FILE=$(echo "$VENDOR_FILES" | head -1)
    
    # 4. 检查 vendor 文件中的引用
    echo ""
    echo "4️⃣ 检查 vendor 文件中的资源引用: $VENDOR_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 提取引用的资源文件（支持多种格式）
    # 匹配 import('/assets/xxx.js'), import("/assets/xxx.js"), new URL('/assets/xxx.js')
    REFERENCED_FILES=$(grep -oE '(import\s*\(|new\s+URL\s*\()\s*["'\''](/assets/[^"'\''`\s]+\.(js|mjs|css))["'\'']' "$VENDOR_FILE" 2>/dev/null | \
        sed -E 's/.*["'\''](\/assets\/[^"'\''`\s]+\.(js|mjs|css))["'\''].*/\1/' | \
        sort -u || echo "")
    
    # 如果上面没找到，尝试直接匹配 /assets/ 路径
    if [ -z "$REFERENCED_FILES" ]; then
        REFERENCED_FILES=$(grep -oE '/assets/[^"'\''`\s<>]+\.(js|mjs|css)' "$VENDOR_FILE" 2>/dev/null | sort -u || echo "")
    fi
    
    if [ -n "$REFERENCED_FILES" ]; then
        echo "引用的资源文件（前20个）："
        echo "$REFERENCED_FILES" | head -20
        TOTAL_REFERENCED=$(echo "$REFERENCED_FILES" | wc -l)
        echo "总共引用 $TOTAL_REFERENCED 个文件"
        
        # 检查每个引用的文件是否存在
        echo ""
        echo "5️⃣ 检查引用的文件是否存在..."
        MISSING_FILES=()
        EXISTING_COUNT=0
        
        while IFS= read -r ref_file; do
            if [ -z "$ref_file" ]; then
                continue
            fi
            # 移除前导斜杠，转换为完整路径
            rel_path=$(echo "$ref_file" | sed 's|^/||')
            full_path="$DEPLOY_PATH/$rel_path"
            
            if [ -f "$full_path" ]; then
                EXISTING_COUNT=$((EXISTING_COUNT + 1))
                if [ $EXISTING_COUNT -le 5 ]; then
                    echo "✅ $ref_file"
                fi
            else
                echo "❌ $ref_file (不存在)"
                MISSING_FILES+=("$ref_file")
            fi
        done <<< "$REFERENCED_FILES"
        
        if [ $EXISTING_COUNT -gt 5 ]; then
            echo "... (还有 $((EXISTING_COUNT - 5)) 个文件存在)"
        fi
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        if [ ${#MISSING_FILES[@]} -gt 0 ]; then
            echo "❌ 发现 ${#MISSING_FILES[@]} 个缺失的文件："
            for file in "${MISSING_FILES[@]}"; do
                echo "  - $file"
            done
            echo ""
            echo "可能的原因："
            echo "  1. 部署时没有完全清理旧文件"
            echo "  2. 构建产物中文件名不一致"
            echo "  3. 部署过程中文件传输不完整"
            echo ""
            echo "解决方案："
            echo "  1. 清理 assets 目录: rm -rf $DEPLOY_PATH/assets"
            echo "  2. 重新部署应用"
            echo "  3. 或者手动检查构建产物中的文件名"
        else
            echo "✅ 所有引用的文件都存在（共 $EXISTING_COUNT 个）"
        fi
    else
        echo "⚠️  无法从 vendor 文件中提取资源引用"
    fi
else
    echo "❌ 未找到 vendor 文件"
fi

# 6. 检查 index.html
echo ""
echo "6️⃣ 检查 index.html..."
if [ -f "$DEPLOY_PATH/index.html" ]; then
    echo "✅ index.html 存在"
    echo "index.html 中的 script 和 link 标签（前10个）："
    grep -oE '<(script|link)[^>]*(src|href)=["'"'"'][^"'"'"']+["'"'"'][^>]*>' "$DEPLOY_PATH/index.html" 2>/dev/null | head -10 || echo "无"
    
    # 检查 index.html 中引用的 assets 文件是否存在
    echo ""
    echo "6️⃣.1 检查 index.html 中引用的 assets 文件..."
    HTML_REFERENCED=$(grep -oE '(src|href)=["'"'"']/assets/[^"'"'"']+\.(js|mjs|css)["'"'"']' "$DEPLOY_PATH/index.html" 2>/dev/null | \
        sed -E 's/.*["'"'"'](\/assets\/[^"'"'"']+\.(js|mjs|css))["'"'"'].*/\1/' | \
        sort -u || echo "")
    
    if [ -n "$HTML_REFERENCED" ]; then
        HTML_MISSING=()
        HTML_EXISTING=0
        while IFS= read -r ref_file; do
            if [ -z "$ref_file" ]; then
                continue
            fi
            rel_path=$(echo "$ref_file" | sed 's|^/||')
            full_path="$DEPLOY_PATH/$rel_path"
            
            if [ -f "$full_path" ]; then
                HTML_EXISTING=$((HTML_EXISTING + 1))
            else
                HTML_MISSING+=("$ref_file")
            fi
        done <<< "$HTML_REFERENCED"
        
        echo "index.html 引用了 $(echo "$HTML_REFERENCED" | wc -l) 个 assets 文件"
        echo "存在: $HTML_EXISTING 个"
        
        if [ ${#HTML_MISSING[@]} -gt 0 ]; then
            echo "❌ index.html 中缺失的文件（${#HTML_MISSING[@]} 个）："
            for file in "${HTML_MISSING[@]}"; do
                echo "  - $file"
            done
        else
            echo "✅ index.html 中引用的所有文件都存在"
        fi
    fi
else
    echo "❌ index.html 不存在"
fi

# 7. 检查是否有重复的文件名（不同 hash）
echo ""
echo "7️⃣ 检查是否有重复的文件名（不同 hash）..."
DUPLICATE_NAMES=$(find "$DEPLOY_PATH/assets" -type f -name "*.js" -o -name "*.css" 2>/dev/null | \
    sed 's|.*/||' | \
    sed 's/-[A-Za-z0-9]\{8,\}\.\(js\|css\)$//' | \
    sort | uniq -d)
if [ -n "$DUPLICATE_NAMES" ]; then
    echo "⚠️  发现可能有重复的文件名（不同 hash）："
    echo "$DUPLICATE_NAMES" | head -10
    echo ""
    echo "这可能导致新旧文件混在一起，建议清理 assets 目录后重新部署"
else
    echo "✅ 没有发现重复的文件名"
fi

# 8. 列出所有 vendor 和 index 文件（检查是否有多个版本）
echo ""
echo "8️⃣ 检查是否有多个版本的 vendor 或 index 文件..."
VENDOR_COUNT=$(find "$DEPLOY_PATH/assets" -name "vendor-*.js" 2>/dev/null | wc -l)
INDEX_COUNT=$(find "$DEPLOY_PATH/assets" -name "index-*.js" 2>/dev/null | wc -l)
echo "vendor 文件数量: $VENDOR_COUNT"
echo "index 文件数量: $INDEX_COUNT"
if [ "$VENDOR_COUNT" -gt 1 ] || [ "$INDEX_COUNT" -gt 1 ]; then
    echo "⚠️  发现多个版本的 vendor 或 index 文件，建议清理 assets 目录"
    echo "vendor 文件列表："
    find "$DEPLOY_PATH/assets" -name "vendor-*.js" 2>/dev/null
    echo "index 文件列表："
    find "$DEPLOY_PATH/assets" -name "index-*.js" 2>/dev/null
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "诊断完成"
echo ""
echo "如果发现问题，可以运行以下命令清理并重新部署："
echo "  rm -rf $DEPLOY_PATH/assets"
echo "  # 然后重新部署应用"

