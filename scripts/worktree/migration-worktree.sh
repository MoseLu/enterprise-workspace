#!/usr/bin/env bash
#===============================================================================
# PC-Admin → React-Admin 迁移 Worktree 管理脚本
# 功能：批量创建和管理迁移专用的 git worktree
# 用法：
#   ./migration-worktree.sh create <phase>
#   ./migration-worktree.sh create-all
#   ./migration-worktree.sh run <phase> <command>
#   ./migration-worktree.sh status
#   ./migration-worktree.sh cleanup
#===============================================================================

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/migration-config.json"
MAPPING_FILE="${SCRIPT_DIR}/module-mapping.json"
WORKTREE_BASE="../worktrees/migration"
BRANCH="${GIT_BRANCH:-$(git branch --show-current 2>/dev/null || echo 'feature/first-feature-branch')}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_phase() { echo -e "${CYAN}[PHASE]${NC} $1"; }

#-------------------------------------------------------------------------------
# 读取配置
#-------------------------------------------------------------------------------
get_phase_apps() {
    local phase="$1"
    local apps

    # 使用 jq 解析 JSON
    if command -v jq &> /dev/null; then
        apps=$(jq -r ".phases[] | select(.name == \"$phase\") | .apps[]" "$CONFIG_FILE" 2>/dev/null || echo "")
    else
        # 备用：使用 grep 解析
        apps=$(grep -A50 "\"$phase\"" "$CONFIG_FILE" | grep -A20 "apps" | grep '"' | head -10 | tr -d ' ",:' | tr '\n' ' ' || echo "")
    fi

    echo "$apps"
}

get_all_migration_apps() {
    if command -v jq &> /dev/null; then
        jq -r '.phases[].apps[]' "$CONFIG_FILE" 2>/dev/null | sort -u || echo ""
    else
        echo ""
    fi
}

#-------------------------------------------------------------------------------
# 创建迁移 worktree
#-------------------------------------------------------------------------------
create_migration_worktree() {
    local app="$1"
    local worktree_path="${WORKTREE_BASE}/${app}"
    local source_path="products/pc-admin/apps/${app}"
    local target_path="products/react-admin/apps/${app}"

    log_info "为迁移 [$app] 创建 worktree..."

    # 检查源应用是否存在
    if [[ ! -d "$source_path" ]]; then
        log_error "源应用不存在: $source_path"
        return 1
    fi

    # 创建父目录
    mkdir -p "$WORKTREE_BASE"

    # 如果目标目录已存在，说明已迁移
    if [[ -d "$target_path" ]]; then
        log_warn "目标应用已存在: $target_path (已迁移?)"
    fi

    # 创建 worktree
    if [[ -d "$worktree_path" ]]; then
        log_warn "Worktree 已存在: $worktree_path"
        cd "$worktree_path"
        git fetch origin "$BRANCH" 2>/dev/null || true
        git checkout "$BRANCH" 2>/dev/null || true
        return 0
    fi

    # 创建 worktree
    if git worktree add "$worktree_path" "$BRANCH" 2>/dev/null; then
        log_success "Worktree 创建成功: $worktree_path"

        # 在 worktree 中创建指向 react-admin 的符号链接
        cd "$worktree_path"

        # 检查是否需要创建迁移报告
        cat > "${worktree_path}/MIGRATION_NOTES.md" << EOF
# ${app} 迁移笔记

## 源信息
- 源路径: products/pc-admin/apps/${app}
- 目标路径: products/react-admin/apps/${app}

## 待完成任务
- [ ] 分析 Vue 组件结构
- [ ] 识别可复用逻辑
- [ ] 创建 React 组件
- [ ] 更新路由配置
- [ ] 更新样式
- [ ] 测试功能

## 注意事项
- 使用 @enterprise-workspace/frontend 作为组件库
- 使用 Zustand 替代 Pinia
- 使用 React Router 替代 Vue Router
EOF

        # 设置上游分支跟踪
        git branch --set-upstream-to="origin/$BRANCH" "$BRANCH" 2>/dev/null || true

        return 0
    else
        log_error "Worktree 创建失败: $app"
        return 1
    fi
}

#-------------------------------------------------------------------------------
# 批量创建
#-------------------------------------------------------------------------------
create_all_worktrees() {
    local apps=("$@")
    local created=()
    local failed=()

    if [[ ${#apps[@]} -eq 0 ]]; then
        # 从配置读取所有应用
        apps=($(get_all_migration_apps))
    fi

    if [[ ${#apps[@]} -eq 0 ]]; then
        log_error "没有指定应用且无法从配置读取"
        return 1
    fi

    log_phase "批量创建 ${#apps[@]} 个迁移 worktree..."
    echo ""

    for app in "${apps[@]}"; do
        if create_migration_worktree "$app"; then
            created+=("$app")
        else
            failed+=("$app")
        fi
    done

    echo ""
    log_success "成功: ${#created[@]} 个"
    [[ ${#failed[@]} -gt 0 ]] && log_error "失败: ${#failed[@]} 个: ${failed[*]}"

    # 输出创建结果
    echo ""
    log_info "Worktree 列表:"
    git worktree list --porcelain | grep "$WORKTREE_BASE" || echo "  (无)"
}

#-------------------------------------------------------------------------------
# 执行迁移命令
#-------------------------------------------------------------------------------
run_migration_command() {
    local phase="$1"
    local command="${2:-echo '迁移任务可在此执行'}"

    local apps
    apps=$(get_phase_apps "$phase")

    if [[ -z "$apps" ]]; then
        log_error "未找到阶段: $phase"
        return 1
    fi

    log_phase "在阶段 [$phase] 的 worktree 中执行命令: $command"
    echo ""

    for app in $apps; do
        local worktree_path="${WORKTREE_BASE}/${app}"

        if [[ -d "$worktree_path" ]]; then
            log_info "执行: $command (在 $worktree_path)"
            cd "$worktree_path"
            eval "$command" || log_warn "命令执行失败: $app"
        else
            log_warn "Worktree 不存在: $app"
        fi
    done
}

#-------------------------------------------------------------------------------
# 列出迁移状态
#-------------------------------------------------------------------------------
show_status() {
    echo ""
    echo "==============================================================================="
    echo "                    PC-Admin → React-Admin 迁移状态"
    echo "==============================================================================="
    echo ""
    echo "当前分支: $BRANCH"
    echo "Worktree 基础目录: $(realpath "$WORKTREE_BASE" 2>/dev/null || echo "$WORKTREE_BASE")"
    echo ""

    # 读取配置中的阶段信息
    if command -v jq &> /dev/null; then
        echo "--- 迁移阶段 ---"
        jq -r '.phases[] | "[\(.status)] \(.name) - \(.description)"' "$CONFIG_FILE" 2>/dev/null || echo "  (无法读取配置)"
        echo ""

        echo "--- Worktree 状态 ---"
        for app in $(get_all_migration_apps); do
            local worktree_path="${WORKTREE_BASE}/${app}"
            local target_path="products/react-admin/apps/${app}"
            local source_path="products/pc-admin/apps/${app}"

            if [[ -d "$target_path" ]]; then
                echo "[✓] $app → 已迁移"
            elif [[ -d "$worktree_path" ]]; then
                echo "[~] $app → worktree 已创建 (迁移中)"
            elif [[ -d "$source_path" ]]; then
                echo "[ ] $app → 待迁移"
            else
                echo "[?] $app → 源路径不存在"
            fi
        done
    else
        echo "需要 jq 命令来解析配置"
    fi

    echo ""
    echo "--- Git Worktree 列表 (迁移相关) ---"
    git worktree list --porcelain | grep "$WORKTREE_BASE" || echo "  (无迁移 worktree)"
    echo ""
}

#-------------------------------------------------------------------------------
# 清理迁移 worktree
#-------------------------------------------------------------------------------
cleanup_migration_worktrees() {
    log_info "清理迁移 worktree..."

    # 列出所有迁移相关的 worktree
    local worktrees
    worktrees=$(git worktree list --porcelain 2>/dev/null | grep "$WORKTREE_BASE" | awk '{print $2}' || echo "")

    if [[ -z "$worktrees" ]]; then
        log_info "没有需要清理的迁移 worktree"
        return 0
    fi

    for wt in $worktrees; do
        log_info "清理: $wt"
        git worktree remove "$wt" --force 2>/dev/null || rm -rf "$wt"
    done

    git worktree prune 2>/dev/null || true
    log_success "清理完成"
}

#-------------------------------------------------------------------------------
# 初始化 React-Admin 应用结构
#-------------------------------------------------------------------------------
init_react_app() {
    local app="$1"

    local source_path="products/pc-admin/apps/${app}"
    local target_path="products/react-admin/apps/${app}"

    if [[ ! -d "$target_path" ]]; then
        log_info "创建 React 应用结构: $app"

        # 创建基础目录结构
        mkdir -p "${target_path}/src"
        mkdir -p "${target_path}/config"

        # 创建 package.json
        cat > "${target_path}/package.json" << EOF
{
  "name": "@enterprise-workspace/${app}",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@enterprise-workspace/frontend": "workspace:*",
    "antd": ">=5.0.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "react-router-dom": ">=6.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
EOF

        # 创建 vite.config.ts
        cat > "${target_path}/vite.config.ts" << EOF
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@enterprise-workspace/frontend': path.resolve(
        __dirname,
        '../../../common/frontend'
      ),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
EOF

        # 创建 tsconfig.json
        cat > "${target_path}/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@enterprise-workspace/frontend/*": ["../../../common/frontend/*"]
    }
  },
  "include": ["src", "vite.config.ts"]
}
EOF

        # 创建基础文件
        cat > "${target_path}/index.html" << EOF
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${app}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

        # 创建 main.tsx
        cat > "${target_path}/src/main.tsx" << EOF
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
EOF

        # 创建 App.tsx (占位符)
        cat > "${target_path}/src/App.tsx" << EOF
import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>${app}</Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={2}>迁移自 Vue 的 React 应用</Title>
        <p>此应用从 products/pc-admin/apps/${app} 迁移而来。</p>
      </Content>
    </Layout>
  );
}

export default App;
EOF

        # 创建 index.css
        cat > "${target_path}/src/index.css" << EOF
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
EOF

        log_success "创建完成: $target_path"
    else
        log_warn "目标已存在: $target_path"
    fi
}

#-------------------------------------------------------------------------------
# 主入口
#-------------------------------------------------------------------------------
main() {
    local command="${1:-status}"

    case "$command" in
        create|c)
            if [[ -z "${2:-}" ]]; then
                log_error "用法: $0 create <app>"
                exit 1
            fi
            create_migration_worktree "$2"
            ;;
        create-all|ca)
            shift
            create_all_worktrees "$@"
            ;;
        init|i)
            if [[ -z "${2:-}" ]]; then
                log_error "用法: $0 init <app>"
                exit 1
            fi
            init_react_app "$2"
            ;;
        init-phase|ip)
            local phase="${2:-}"
            if [[ -z "$phase" ]]; then
                log_error "用法: $0 init-phase <phase>"
                exit 1
            fi
            for app in $(get_phase_apps "$phase"); do
                init_react_app "$app"
            done
            ;;
        run|r)
            shift
            if [[ -z "${1:-}" ]]; then
                log_error "用法: $0 run <phase> <command>"
                exit 1
            fi
            run_migration_command "$1" "${2:-}"
            ;;
        status|s)
            show_status
            ;;
        cleanup|rm)
            cleanup_migration_worktrees
            ;;
        help|--help|-h)
            echo "PC-Admin → React-Admin 迁移 Worktree 管理脚本"
            echo ""
            echo "用法: $0 <命令> [参数]"
            echo ""
            echo "命令:"
            echo "  create <app>           为单个应用创建迁移 worktree"
            echo "  create-all [apps...]    批量创建迁移 worktree"
            echo "  init <app>             初始化 React 应用结构"
            echo "  init-phase <phase>     批量初始化 React 应用结构"
            echo "  run <phase> <command>  在指定阶段的 worktree 中执行命令"
            echo "  status                 显示迁移状态"
            echo "  cleanup                清理所有迁移 worktree"
            echo ""
            echo "示例:"
            echo "  $0 create admin-app"
            echo "  $0 init admin-app"
            echo "  $0 run phase-1 'pnpm run build'"
            echo "  $0 status"
            echo ""
            ;;
        *)
            log_error "未知命令: $command"
            exit 1
            ;;
    esac
}

main "$@"
