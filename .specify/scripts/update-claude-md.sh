#!/bin/bash
# 更新 CLAUDE.md 脚本
# 用于根据项目状态自动更新 CLAUDE.md 文件

set -e

# 引入公共脚本
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印彩色消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# 显示帮助信息
show_help() {
    cat << EOF
用法: $0 [选项]

选项:
  -h, --help              显示帮助信息
  --force                 强制覆盖现有文件
  --dry-run               预览更改，不实际写入
  --all                   显示所有项目信息

示例:
  $0 --dry-run            # 预览更改
  $0 --force              # 强制覆盖
  $0 --all                # 显示完整信息
EOF
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --all)
                SHOW_ALL=true
                shift
                ;;
            -*)
                print_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 获取项目中的产品列表
get_products() {
    local products_dir="$PROJECT_ROOT/products"
    local products=()
    
    if [ -d "$products_dir" ]; then
        for product in "$products_dir"/*; do
            if [ -d "$product" ]; then
                local product_name=$(basename "$product")
                if [ "$product_name" != "node_modules" ]; then
                    products+=("$product_name")
                fi
            fi
        done
    fi
    
    echo "${products[@]}"
}

# 获取功能列表
get_features() {
    local features_dir="$SPECS_DIR"
    local features=()
    
    if [ -d "$features_dir" ]; then
        for feature in "$features_dir"/*; do
            if [ -d "$feature" ]; then
                local feature_name=$(basename "$feature")
                features+=("$feature_name")
            fi
        done
    fi
    
    echo "${features[@]}"
}

# 获取当前 Git 分支
get_current_branch() {
    git branch --show-current 2>/dev/null || echo "未知"
}

# 获取最近提交
get_last_commit() {
    git log -1 --oneline 2>/dev/null || echo "无提交记录"
}

# 检查依赖版本
check_dependency_versions() {
    local versions=()
    
    # Node.js
    if command -v node &> /dev/null; then
        versions+=("Node.js: $(node --version)")
    fi
    
    # Go
    if command -v go &> /dev/null; then
        versions+=("Go: $(go version | awk '{print $3}')")
    fi
    
    # Python
    if command -v python3 &> /dev/null; then
        versions+=("Python: $(python3 --version 2>&1)")
    fi
    
    # Docker
    if command -v docker &> /dev/null; then
        versions+=("Docker: $(docker --version)")
    fi
    
    echo "${versions[@]}"
}

# 生成项目状态报告
generate_status_report() {
    local products=($(get_products))
    local features=($(get_features))
    local current_branch=$(get_current_branch)
    local last_commit=$(get_last_commit)
    local versions=($(check_dependency_versions))
    
    cat << EOF
## 项目状态

### 基本信息

- **项目名称**: 企业工作空间
- **当前分支**: $current_branch
- **最近提交**: $last_commit

### 产品模块

| 产品 | 状态 |
|------|------|
EOF

    for product in "${products[@]}"; do
        local product_path="$PROJECT_ROOT/products/$product"
        local product_status="开发中"
        
        if [ -f "$product_path/package.json" ]; then
            if [ -d "$product_path/node_modules" ]; then
                product_status="依赖已安装"
            else
                product_status="待安装依赖"
            fi
        elif [ -f "$product_path/go.mod" ]; then
            product_status="Go 项目"
        fi
        
        echo "| $product | $product_status |"
    done

    cat << EOF

### 功能规格

| 功能 | 状态 |
|------|------|
EOF

    for feature in "${features[@]}"; do
        local feature_status="待开发"
        local spec_file="$SPECS_DIR/$feature/spec.md"
        local plan_file="$SPECS_DIR/$feature/plan.md"
        local tasks_file="$SPECS_DIR/$feature/tasks.md"
        
        if [ -f "$spec_file" ] && [ -f "$plan_file" ] && [ -f "$tasks_file" ]; then
            feature_status="规划完成"
        elif [ -f "$spec_file" ]; then
            feature_status="规格定义中"
        fi
        
        echo "| $feature | $feature_status |"
    done

    cat << EOF

### 环境依赖

$(for version in "${versions[@]}"; do echo "- $version"; done)

EOF
}

# 生成 CLAUDE.md 内容
generate_claude_content() {
    local products=($(get_products))
    local features=($(get_features))
    local current_branch=$(get_current_branch)
    
    cat << 'EOF'
# CLAUDE.md

> 本文件为 Claude AI 助手提供项目指导和规范驱动开发工作流程。

## 项目概述

**企业工作空间**是一个全链路协同编程系统，采用 SpecKit 规范驱动开发方法论。

EOF

    echo "## 产品目录"
    echo ""
    echo "本项目包含以下核心产品："
    echo ""
    
    for product in "${products[@]}"; do
        local product_readme="$PROJECT_ROOT/products/$product/README.md"
        local product_desc="暂无描述"
        
        if [ -f "$product_readme" ]; then
            product_desc=$(head -n 1 "$product_readme" 2>/dev/null || echo "暂无描述")
        fi
        
        echo "### $product"
        echo ""
        echo "$product_desc"
        echo ""
    done

    cat << 'EOF'
## 开发流程

### 规范驱动开发

本项目采用 GitHub SpecKit 规范驱动开发方法论：

```
需求定义 → 规格说明 → 技术规划 → 任务分解 → 实施开发 → 测试验收
```

### 可用命令

在项目根目录运行 Claude 时，可使用以下命令：

#### 核心命令

| 命令 | 描述 |
|------|------|
| `/speckit.constitution` | 创建或更新项目治理原则 |
| `/speckit.specify` | 定义要构建的功能需求 |
| `/speckit.plan` | 创建技术实施计划 |
| `/speckit.tasks` | 生成可执行的任务列表 |
| `/speckit.implement` | 执行所有任务，构建功能 |

#### 辅助命令

| 命令 | 描述 |
|------|------|
| `/speckit.clarify` | 澄清规格中未明确的部分 |
| `/speckit.analyze` | 跨工件的一致性和覆盖度分析 |
| `/speckit.checklist` | 生成质量检查清单 |

EOF

    echo "## 当前开发状态"
    echo ""
    echo "- **当前分支**: $current_branch"
    echo ""
    
    if [ ${#features[@]} -gt 0 ]; then
        echo "### 进行中的功能"
        echo ""
        for feature in "${features[@]}"; do
            echo "- $feature"
        done
        echo ""
    fi

    cat << 'EOF'
## 项目结构

```
.enterprise-workspace/
├── .specify/                    # SpecKit 配置
│   ├── memory/
│   │   └── constitution.md      # 项目原则
│   ├── templates/
│   │   ├── spec-template.md     # 规格模板
│   │   ├── plan-template.md     # 实施计划模板
│   │   └── tasks-template.md    # 任务分解模板
│   ├── scripts/
│   │   ├── common.sh            # 公共函数
│   │   ├── create-new-feature.sh # 创建功能
│   │   └── setup-plan.sh        # 设置实施计划
│   └── INSTALL.md              # 安装指南
├── products/                    # 产品目录
│   ├── agent-cli-web/
│   ├── agent-orchestrator/
│   ├── ops-platform/
│   └── pc-admin/
├── docs/                        # 文档目录
├── scripts/                     # 脚本目录
├── .github/                     # GitHub 配置
├── .cicd/                       # CI/CD 配置
└── docker-compose.yml          # Docker 编排
```

## 开发规范

### 代码规范

所有代码必须符合以下标准：

- **TypeScript**：严格模式启用，所有类型显式定义
- **Go**：静态分析工具检查，错误处理规范
- **代码质量**：遵循项目 constitution.md 中的原则
- **测试覆盖**：核心业务逻辑不低于 80%

### Git 提交规范

```
<类型>(<范围>): <描述>

# 类型：feat/fix/docs/style/refactor/test/chore
# 范围：affected-module
```

### 分支策略

- **main**：生产分支
- **develop**：开发分支
- **feature/**：功能分支
- **bugfix/**：修复分支
- **hotfix/**：紧急修复分支

## 技术栈指南

### 前端技术

- **框架**：React 18+ / Vue 3
- **状态管理**：Zustand / Pinia
- **UI 组件**：Ant Design / Element Plus
- **构建工具**：Vite
- **样式方案**：Tailwind CSS / CSS Modules

### 后端技术

- **语言**：Go 1.21+ / Python 3.11+
- **框架**：Gin / FastAPI
- **数据库**：PostgreSQL 14+ / MongoDB
- **缓存**：Redis 7+
- **消息队列**：Kafka / RabbitMQ

### 基础设施

- **容器化**：Docker
- **编排**：Kubernetes / Docker Compose
- **CI/CD**：GitHub Actions / Jenkins
- **监控**：Prometheus / Grafana

## 常用命令

### 开发环境启动

```bash
# 启动所有服务
./scripts/dev/start-all.sh

# 仅启动后端
./scripts/dev/start-backend.sh

# 仅启动前端
./scripts/dev/start-frontend.sh
```

### 代码检查

```bash
# 安装依赖
npm install

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit
```

## 故障排查

### 常见问题

1. **依赖安装失败**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **数据库连接失败**
   - 检查 PostgreSQL 服务是否启动
   - 验证数据库连接字符串

### 日志位置

- **前端日志**：浏览器开发者工具
- **后端日志**：`./logs/server.log`
- **Docker 日志**：`docker-compose logs`

## 资源链接

- [项目规范文档](docs/development/系统开发规范.md)
- [CI/CD 配置](.cicd/)
- [API 文档](docs/)
- [架构文档](docs/architecture/)
EOF
}

# 主函数
main() {
    print_header "CLAUDE.md 更新工具"
    
    # 解析参数
    parse_args "$@"
    
    # 初始化环境
    check_prerequisites
    init_speckit_env
    
    # 检查 CLAUDE.md
    local claude_file="$PROJECT_ROOT/CLAUDE.md"
    
    if [ -f "$claude_file" ] && [ "$FORCE" != "true" ]; then
        print_warning "CLAUDE.md 已存在"
        print_info "使用 --force 强制覆盖"
        print_info "使用 --dry-run 预览更改"
        echo ""
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
    
    # 生成内容
    print_info "生成 CLAUDE.md 内容..."
    local content=$(generate_claude_content)
    
    if [ "$DRY_RUN" == "true" ]; then
        print_info "预览生成的 CLAUDE.md："
        echo ""
        echo "$content"
    else
        # 写入文件
        echo "$content" > "$claude_file"
        print_success "CLAUDE.md 已更新: $claude_file"
    fi
    
    if [ "$SHOW_ALL" == "true" ]; then
        echo ""
        generate_status_report
    fi
}

# 运行主函数
main "$@"
