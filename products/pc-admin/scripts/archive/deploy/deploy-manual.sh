#!/bin/bash

# 手动部署脚本
# 用于将 build-dist:all 生成的构建产物部署到服务器

set -e

# 配置
SERVER_HOST="${SERVER_HOST:-10.80.8.199}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

# 应用和域名的映射
declare -A APP_DOMAIN_MAP=(
    ["admin-app"]="admin.bellis.com.cn"
    ["logistics-app"]="logistics.bellis.com.cn"
    ["quality-app"]="quality.bellis.com.cn"
    ["production-app"]="production.bellis.com.cn"
    ["engineering-app"]="engineering.bellis.com.cn"
    ["finance-app"]="finance.bellis.com.cn"
    ["system-app"]="bellis.com.cn"
    ["layout-app"]="layout.bellis.com.cn"
    ["mobile-app"]="mobile.bellis.com.cn"
    ["monitor-app"]="monitor.bellis.com.cn"
    ["docs-app"]="docs.bellis.com.cn"
)

# 获取构建产物目录（兼容两条链路）：
# 1) build-dist:all -> $ROOT_DIR/dist/<domain>
# 2) pnpm build / pnpm build:system -> $ROOT_DIR/apps/<app>/dist
get_source_dir() {
    local app_name=$1
    local domain=$2
    local from_build_dist="$DIST_DIR/$domain"
    local from_app_dist="$ROOT_DIR/apps/$app_name/dist"

    if [ -d "$from_build_dist" ] && [ -n "$(ls -A "$from_build_dist" 2>/dev/null)" ]; then
        echo "$from_build_dist"
        return 0
    fi

    if [ -d "$from_app_dist" ] && [ -n "$(ls -A "$from_app_dist" 2>/dev/null)" ]; then
        echo "$from_app_dist"
        return 0
    fi

    echo ""
    return 1
}

# 使用说明
usage() {
    echo "使用方法: $0 [应用名]"
    echo ""
    echo "应用名:"
    for app in "${!APP_DOMAIN_MAP[@]}"; do
        echo "  - $app -> ${APP_DOMAIN_MAP[$app]}"
    done
    echo ""
    echo "或者使用 --all 部署所有应用"
    echo ""
    echo "环境变量:"
    echo "  SERVER_HOST - 服务器地址 (默认: 10.80.8.199)"
    echo "  SERVER_USER - 服务器用户 (默认: root)"
    echo "  SSH_KEY - SSH 密钥路径 (默认: ~/.ssh/id_rsa)"
    echo ""
    echo "构建产物来源（两者都支持）："
    echo "  - pnpm build-dist:all -> dist/<domain>"
    echo "  - pnpm build / pnpm build:system -> apps/<app>/dist"
    exit 1
}

# 部署单个应用
deploy_app() {
    local app_name=$1
    local domain=${APP_DOMAIN_MAP[$app_name]}
    
    if [ -z "$domain" ]; then
        echo "❌ 未知的应用: $app_name"
        return 1
    fi
    
    local source_dir
    source_dir=$(get_source_dir "$app_name" "$domain" || true)
    local deploy_base="/www/wwwroot/$domain"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 部署应用: $app_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "源目录: $source_dir"
    echo "目标路径: $deploy_base (releases/current)"
    echo ""
    
    # 检查源目录是否存在
    if [ -z "$source_dir" ] || [ ! -d "$source_dir" ]; then
        echo "❌ 构建产物不存在（dist/<domain> 或 apps/<app>/dist 都没找到）"
        echo "建议先运行："
        echo "  - system-app: pnpm build:system"
        echo "  - 其他应用: pnpm --filter $app_name build"
        echo "  或者：pnpm build-dist:all"
        return 1
    fi
    
    # 验证构建产物
    echo "🔍 验证构建产物..."
    local assets_dir="$source_dir/assets"
    if [ -d "$assets_dir" ]; then
        local file_count=$(find "$assets_dir" -type f \( -name "*.js" -o -name "*.css" \) 2>/dev/null | wc -l)
        echo "  assets 文件数: $file_count"
        
        # 检查重复文件
        local duplicate_names=$(find "$assets_dir" -type f \( -name "*.js" -o -name "*.css" \) 2>/dev/null | \
            sed 's|.*/||' | \
            sed -E 's/-[A-Za-z0-9]{8,}\.(js|css)$//' | \
            sort | uniq -d)
        
        if [ -n "$duplicate_names" ]; then
            echo "  ⚠️  警告：发现重复的文件名（不同 hash）"
            echo "  这可能导致部署后新旧文件混在一起"
            read -p "  是否继续部署？(y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "部署已取消"
                return 1
            fi
        fi
    fi
    
    # SSH 连接参数
    local ssh_opts="-i $SSH_KEY -p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=30"
    
    # 确认操作
    echo ""
    read -p "⚠️  将部署到 $deploy_base/releases 并原子切换 current，是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "部署已取消"
        return 1
    fi
    
    # 生成 release 名称（时间戳）
    local release_name="$(date +%Y%m%d_%H%M%S)"
    local remote_release_dir="$deploy_base/releases/$release_name"

    echo ""
    echo "📁 准备 releases/current 结构..."
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "bash -lc '
        set -e
        mkdir -p \"$deploy_base\"
        mkdir -p \"$deploy_base/releases\"
        if [ ! -L \"$deploy_base/current\" ]; then
          ts=\"init-$(date +%Y%m%d_%H%M%S)\"
          mkdir -p \"$deploy_base/releases/$ts\"
          shopt -s dotglob nullglob
          for item in \"$deploy_base\"/*; do
            base=\$(basename \"\$item\")
            if [ \"\$base\" != \"releases\" ] && [ \"\$base\" != \"current\" ]; then
              mv \"\$item\" \"$deploy_base/releases/$ts/\" 2>/dev/null || true
            fi
          done
          ln -sfn \"releases/$ts\" \"$deploy_base/current\"
        fi
        mkdir -p \"$remote_release_dir\"
      '" || {
      echo "❌ 无法准备 releases/current 结构"
      return 1
    }
    echo "✅ release 目录已创建: $remote_release_dir"
    
    # 上传文件
    echo ""
    echo "📤 上传文件到 release 目录..."
    cd "$source_dir"
    if tar czf - . | ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
        "cd \"$remote_release_dir\" && tar xzf -" 2>&1; then
        echo "✅ 文件上传成功"
    else
        echo "❌ 文件上传失败"
        return 1
    fi

    # 验证 release 关键文件存在
    echo ""
    echo "🔍 验证 release 产物完整性..."
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "bash -lc '
      set -e
      test -f \"$remote_release_dir/index.html\"
      if [ \"$app_name\" = \"layout-app\" ]; then
        test -d \"$remote_release_dir/assets/layout\"
      else
        test -d \"$remote_release_dir/assets\"
      fi
    '" || {
      echo "❌ release 验证失败：关键文件缺失（不会切换 current）"
      return 1
    }

    # 原子切换 current
    echo ""
    echo "🔁 切换 current -> releases/$release_name"
    ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" "bash -lc '
      set -e
      cd \"$deploy_base\"
      ln -sfn \"releases/$release_name\" current
    '" || {
      echo "❌ 切换 current 失败"
      return 1
    }
    
    # 验证部署结果
    echo ""
    echo "🔍 验证部署结果..."
    local local_count=$(find "$source_dir" -type f 2>/dev/null | wc -l)
    local remote_count=$(ssh $ssh_opts "$SERVER_USER@$SERVER_HOST" \
        "find \"$remote_release_dir\" -type f 2>/dev/null | wc -l" || echo "0")
    
    if [ "$remote_count" -eq "$local_count" ]; then
        echo "✅ 部署验证通过（文件数: $remote_count）"
    else
        echo "⚠️  文件数量不匹配（本地: $local_count, 远程: $remote_count）"
    fi
    
    echo ""
    echo "✅ $app_name 部署完成"
    return 0
}

# 主函数
main() {
    if [ $# -eq 0 ]; then
        usage
    fi
    
    if [ "$1" = "--all" ]; then
        # 部署所有应用
        local failed=0
        for app in "${!APP_DOMAIN_MAP[@]}"; do
            if ! deploy_app "$app"; then
                failed=$((failed + 1))
            fi
            echo ""
        done
        
        if [ $failed -eq 0 ]; then
            echo "✅ 所有应用部署完成"
        else
            echo "❌ $failed 个应用部署失败"
            exit 1
        fi
    else
        # 部署单个应用
        deploy_app "$1"
    fi
}

main "$@"

