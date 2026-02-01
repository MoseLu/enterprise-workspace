#!/bin/bash
# 设置实施计划脚本
# 用于在创建功能的技术实施计划阶段提供辅助

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
MAGENTA='\033[0;35m'
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

print_section() {
    echo ""
    echo -e "${MAGENTA}## $1${NC}"
    echo ""
}

# 显示帮助信息
show_help() {
    cat << EOF
用法: $0 [选项]

选项:
  -h, --help              显示帮助信息
  --feature FEATURE_ID    指定功能编号 (默认: 查找当前分支)
  --ai AGENT              指定 AI Agent
  --skip-research         跳过技术调研
  --verbose               显示详细输出

示例:
  $0 --feature FEATURE-20260201-0001
  $0 --ai claude --skip-research
  $0 --verbose

描述:
  此脚本用于设置功能的技术实施计划阶段。
  它会检查必要条件并提供实施计划的模板。
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
            --feature)
                FEATURE_ID="$2"
                shift 2
                ;;
            --ai)
                AI_AGENT="$2"
                shift 2
                ;;
            --skip-research)
                SKIP_RESEARCH=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            -*)
                print_error "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                print_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# 从分支名称提取功能编号
extract_feature_id() {
    local branch_name=$(git branch --show-current 2>/dev/null || echo "")
    
    if [ -z "$branch_name" ]; then
        print_error "无法获取当前分支名称"
        return 1
    fi
    
    # 尝试从分支名称提取
    if [[ "$branch_name" =~ feature/(.+) ]]; then
        local feature_slug="${BASH_REMATCH[1]}"
        # 查找对应的功能目录
        local feature_dir=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "*$feature_slug*" | head -1)
        
        if [ -n "$feature_dir" ]; then
            FEATURE_ID=$(basename "$feature_dir" | grep -oP 'FEATURE-\d+-\d+')
            if [ -z "$FEATURE_ID" ]; then
                # 如果找不到标准格式，使用目录名
                FEATURE_ID=$(basename "$feature_dir")
            fi
            print_info "从分支检测到功能: $FEATURE_ID"
            return 0
        fi
    fi
    
    print_error "无法从当前分支确定功能编号"
    print_info "请使用 --feature 选项指定功能编号"
    return 1
}

# 检查功能目录
check_feature_dir() {
    if [ -z "$FEATURE_ID" ]; then
        extract_feature_id
    fi
    
    if [ -z "$FEATURE_ID" ]; then
        print_error "未指定功能编号"
        return 1
    fi
    
    FEATURE_DIR="$SPECS_DIR/$FEATURE_ID"*  # 支持带后缀的目录名
    
    if [ ! -d "$FEATURE_DIR" ]; then
        print_error "功能目录不存在: $FEATURE_DIR"
        print_info "可用功能:"
        ls -la "$SPECS_DIR" 2>/dev/null || print_info "暂无功能目录"
        return 1
    fi
    
    FEATURE_DIR=$(find "$SPECS_DIR" -maxdepth 1 -type d -name "*$FEATURE_ID*" | head -1)
    print_info "功能目录: $FEATURE_DIR"
}

# 检查前置条件
check_prerequisites_conditions() {
    print_section "检查前置条件"
    
    local missing=()
    
    # 检查 spec.md
    if [ ! -f "$FEATURE_DIR/spec.md" ]; then
        print_warning "spec.md 不存在"
        missing+=("spec.md")
    else
        print_success "spec.md 存在"
    fi
    
    # 检查 constitution
    if ! check_constitution > /dev/null 2>&1; then
        print_warning "constitution.md 未配置"
        missing+=("constitution")
    else
        print_success "constitution.md 已配置"
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_warning "缺少前置条件:"
        for item in "${missing[@]}"; do
            echo "  - $item"
        done
        echo ""
        print_info "建议操作:"
        echo "  1. 确保功能规格文档 (spec.md) 已创建"
        echo "  2. 运行 /speckit.constitution 创建项目原则"
        echo "  3. 运行 /speckit.specify 完善功能需求"
        echo ""
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 显示技术栈选项
show_tech_stack_options() {
    print_section "技术栈选项"
    
    echo "前端技术:"
    echo "  1. React 18 + TypeScript + Vite"
    echo "  2. Vue 3 + TypeScript + Vite"
    echo "  3. Next.js 14 + TypeScript"
    echo ""
    
    echo "后端技术:"
    echo "  1. Go + Gin + GORM"
    echo "  2. Python + FastAPI + SQLAlchemy"
    echo "  3. Node.js + Express + Prisma"
    echo ""
    
    echo "数据库:"
    echo "  1. PostgreSQL 14+"
    echo "  2. MongoDB 6+"
    echo "  3. MySQL 8+"
    echo ""
    
    echo "缓存:"
    echo "  1. Redis 7+"
    echo "  2. Memcached"
    echo ""
    
    echo "消息队列:"
    echo "  1. Kafka 3.x"
    echo "  2. RabbitMQ 3.12+"
    echo "  3. 无（同步调用）"
    echo ""
}

# 获取用户技术选择
get_tech_selections() {
    print_section "技术选型"
    
    echo "请选择技术栈（直接回车使用默认值）:"
    echo ""
    
    # 前端选择
    read -p "前端框架 [1-3, 默认: 1]: " frontend_choice
    frontend_choice=${frontend_choice:-1}
    
    case $frontend_choice in
        1) FRONTEND="React 18 + TypeScript + Vite" ;;
        2) FRONTEND="Vue 3 + TypeScript + Vite" ;;
        3) FRONTEND="Next.js 14 + TypeScript" ;;
        *) FRONTEND="React 18 + TypeScript + Vite" ;;
    esac
    print_info "前端: $FRONTEND"
    
    # 后端选择
    read -p "后端框架 [1-3, 默认: 1]: " backend_choice
    backend_choice=${backend_choice:-1}
    
    case $backend_choice in
        1) BACKEND="Go + Gin + GORM" ;;
        2) BACKEND="Python + FastAPI + SQLAlchemy" ;;
        3) BACKEND="Node.js + Express + Prisma" ;;
        *) BACKEND="Go + Gin + GORM" ;;
    esac
    print_info "后端: $BACKEND"
    
    # 数据库选择
    read -p "数据库 [1-3, 默认: 1]: " db_choice
    db_choice=${db_choice:-1}
    
    case $db_choice in
        1) DATABASE="PostgreSQL 14+" ;;
        2) DATABASE="MongoDB 6+" ;;
        3) DATABASE="MySQL 8+" ;;
        *) DATABASE="PostgreSQL 14+" ;;
    esac
    print_info "数据库: $DATABASE"
    
    # 缓存选择
    read -p "缓存 [1-2, 默认: 1]: " cache_choice
    cache_choice=${cache_choice:-1}
    
    case $cache_choice in
        1) CACHE="Redis 7+" ;;
        2) CACHE="Memcached" ;;
        *) CACHE="Redis 7+" ;;
    esac
    print_info "缓存: $CACHE"
    
    # 消息队列选择
    read -p "消息队列 [1-3, 默认: 3]: " mq_choice
    mq_choice=${mq_choice:-3}
    
    case $mq_choice in
        1) MESSAGE_QUEUE="Kafka 3.x" ;;
        2) MESSAGE_QUEUE="RabbitMQ 3.12+" ;;
        3) MESSAGE_QUEUE="无（同步调用）" ;;
        *) MESSAGE_QUEUE="无（同步调用）" ;;
    esac
    print_info "消息队列: $MESSAGE_QUEUE"
}

# 生成实施计划提示
generate_plan_prompts() {
    local plan_file="$FEATURE_DIR/plan_prompts.md"
    
    cat > "$plan_file" << EOF
# 实施计划提示

## 功能信息

- 功能编号: $FEATURE_ID
- 功能目录: $FEATURE_DIR

## 技术选型

- 前端: $FRONTEND
- 后端: $BACKEND
- 数据库: $DATABASE
- 缓存: $CACHE
- 消息队列: $MESSAGE_QUEUE

## AI Agent 提示词

运行 /speckit.plan 命令时，可以使用以下提示词：

\`\`\`
基于以下技术栈，创建 $FEATURE_ID 的详细技术实施计划：

前端技术: $FRONTEND
后端技术: $BACKEND
数据库: $DATABASE
缓存: $CACHE
消息队列: $MESSAGE_QUEUE

具体要求：
1. 详细的前端架构设计
2. 详细的后端架构设计
3. 数据库表结构设计
4. API 接口设计
5. 性能优化策略
6. 安全性设计
7. 部署方案
\`\`\`

## 实施计划模板位置

实施计划文件: $FEATURE_DIR/plan.md

请根据实际技术选型修改模板中的技术栈部分。
EOF
    
    print_success "实施计划提示已生成: $plan_file"
}

# 执行技术调研
do_research() {
    if [ "$SKIP_RESEARCH" == "true" ]; then
        print_info "跳过技术调研"
        return 0
    fi
    
    print_section "技术调研"
    
    print_info "检查已安装的工具版本..."
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        print_success "Node.js: $node_version"
    else
        print_warning "Node.js 未安装"
    fi
    
    # 检查 Go
    if command -v go &> /dev/null; then
        local go_version=$(go version | awk '{print $3}')
        print_success "Go: $go_version"
    else
        print_warning "Go 未安装"
    fi
    
    # 检查 Python
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version 2>&1)
        print_success "Python: $python_version"
    else
        print_warning "Python 未安装"
    fi
    
    # 检查 Docker
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version)
        print_success "Docker: $docker_version"
    else
        print_warning "Docker 未安装"
    fi
    
    echo ""
    print_info "如需安装特定版本，请参考 INSTALL.md"
}

# 生成研究文档
generate_research_doc() {
    local research_file="$FEATURE_DIR/research.md"
    
    cat > "$research_file" << EOF
# 技术调研文档

## 功能信息

- 功能编号: $FEATURE_ID
- 创建时间: $(date -Iseconds)

## 调研范围

本文档记录技术实施过程中的调研结果。

### 调研项 1

- **问题**: [问题描述]
- **调研结果**: [调研发现]
- **结论**: [最终结论]

### 调研项 2

- **问题**: [问题描述]
- **调研结果**: [调研发现]
- **结论**: [最终结论]

## 参考资源

- [资源1链接] - 描述
- [资源2链接] - 描述

## 待调研项

- [ ] 待调研项1
- [ ] 待调研项2

## 注意事项

- 本文档会根据实施过程持续更新
- 重要发现请及时记录
EOF
    
    print_success "研究文档已生成: $research_file"
}

# 创建 API 规范目录
create_api_spec_dir() {
    local contracts_dir="$FEATURE_DIR/contracts"
    mkdir -p "$contracts_dir"
    
    # 创建 API 规范文件
    cat > "$contracts_dir/api-spec.json" << 'EOF'
{
  "openapi": "3.0.3",
  "info": {
    "title": "API Specification",
    "version": "1.0.0"
  },
  "paths": {},
  "components": {
    "schemas": {},
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  }
}
EOF
    
    # 创建 SignalR 规范（如需要）
    cat > "$contracts_dir/signalr-spec.md" << 'EOF'
# SignalR 规范

## Hub 定义

### Hub 名称

\`\`\`csharp
public class [Feature]Hub : Hub
{
}
\`\`\`

## 客户端方法

| 方法名 | 参数 | 描述 |
|--------|------|------|
| OnConnected | - | 连接成功回调 |
| OnDisconnected | Exception | 断开连接回调 |
| ReceiveMessage | Message | 接收消息 |

## 服务器方法

| 方法名 | 参数 | 描述 |
|--------|------|------|
| SendMessage | Message | 发送消息 |
| Broadcast | object | 广播消息 |
| SendToGroup | string, object | 发送至分组 |
EOF
    
    print_success "API 规范目录已创建: $contracts_dir"
}

# 显示完成信息
show_completion() {
    print_header "实施计划设置完成"
    
    echo "功能信息:"
    echo "  - 编号: $FEATURE_ID"
    echo "  - 目录: $FEATURE_DIR"
    echo ""
    
    echo "技术选型:"
    echo "  - 前端: $FRONTEND"
    echo "  - 后端: $BACKEND"
    echo "  - 数据库: $DATABASE"
    echo "  - 缓存: $CACHE"
    echo "  - 消息队列: $MESSAGE_QUEUE"
    echo ""
    
    echo "生成的文件:"
    echo "  - plan_prompts.md (实施计划提示)"
    echo "  - research.md (研究文档)"
    echo "  - contracts/api-spec.json (API 规范)"
    echo "  - contracts/signalr-spec.md (SignalR 规范)"
    echo ""
    
    echo "下一步操作:"
    echo "  1. 运行 /speckit.plan 命令创建详细实施计划"
    echo "  2. 根据 plan.md 模板完善技术细节"
    echo "  3. 运行 /speckit.tasks 生成任务列表"
    echo "  4. 运行 /speckit.implement 开始开发"
    echo ""
    
    print_success "设置完成！"
}

# 主函数
main() {
    print_header "SpecKit 实施计划设置"
    
    # 解析参数
    parse_args "$@"
    
    # 初始化环境
    check_prerequisites
    init_speckit_env
    
    # 检查功能目录
    check_feature_dir
    
    # 检查前置条件
    check_prerequisites_conditions
    
    # 显示技术栈选项
    show_tech_stack_options
    
    # 获取技术选择
    get_tech_selections
    
    # 执行技术调研
    do_research
    
    # 生成实施计划提示
    generate_plan_prompts
    
    # 生成研究文档
    generate_research_doc
    
    # 创建 API 规范目录
    create_api_spec_dir
    
    # 显示完成信息
    show_completion
}

# 运行主函数
main "$@"
