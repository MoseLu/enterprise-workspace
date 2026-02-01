#!/bin/bash
# 创建新功能脚本
# 用于快速初始化新功能的工作目录结构

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
用法: $0 [选项] <功能名称>

选项:
  -h, --help              显示帮助信息
  -f, --force             强制创建（覆盖已存在的目录）
  --ai AGENT              指定 AI Agent (claude/codex/cursor/windsurf)
  --no-git                不创建 Git 分支

参数:
  功能名称                新功能的名称（必填）

示例:
  $0 "用户认证模块"
  $0 "订单处理系统" --ai claude
  $0 "报表导出功能" --force --no-git

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
            -f|--force)
                FORCE=true
                shift
                ;;
            --ai)
                AI_AGENT="$2"
                shift 2
                ;;
            --no-git)
                NO_GIT=true
                shift
                ;;
            -*)
                print_error "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                FEATURE_NAME="$1"
                shift
                ;;
        esac
    done
}

# 验证输入
validate_input() {
    if [ -z "$FEATURE_NAME" ]; then
        print_error "请指定功能名称"
        show_help
        exit 1
    fi
    
    # 检查名称是否包含特殊字符
    if [[ ! "$FEATURE_NAME" =~ ^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$ ]]; then
        print_error "功能名称包含无效字符"
        exit 1
    fi
}

# 清理文件名
sanitize_name() {
    echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-'
}

# 生成功能编号
generate_feature_id() {
    local date_prefix=$(date +%Y%m%d)
    local random_suffix=$(head /dev/urandom | tr -dc '0123456789' | head -c 4)
    echo "FEATURE-${date_prefix}-${random_suffix}"
}

# 检查并创建目录
create_feature_dir() {
    local feature_dir="$SPECS_DIR/$FEATURE_ID-$FEATURE_SLUG"
    
    if [ -d "$feature_dir" ]; then
        if [ "$FORCE" == "true" ]; then
            print_warning "目录已存在，将被覆盖: $feature_dir"
            rm -rf "$feature_dir"
        else
            print_error "目录已存在: $feature_dir"
            print_info "使用 --force 选项覆盖，或使用不同的功能名称"
            exit 1
        fi
    fi
    
    mkdir -p "$feature_dir"
    echo "$feature_dir"
}

# 复制模板
copy_templates() {
    local feature_dir="$1"
    local templates_dir="$SPECKIT_ROOT/templates"
    
    print_info "复制模板文件..."
    
    # 复制规格模板
    cp "$templates_dir/spec-template.md" "$feature_dir/spec.md"
    
    # 复制实施计划模板
    cp "$templates_dir/plan-template.md" "$feature_dir/plan.md"
    
    # 复制任务模板
    cp "$templates_dir/tasks-template.md" "$feature_dir/tasks.md"
    
    # 创建快速开始指南
    cat > "$feature_dir/quickstart.md" << 'EOF'
# 快速开始指南

## 功能概述

[功能名称]

## 前置条件

- [ ] 环境配置完成
- [ ] 依赖已安装
- [ ] 数据库已迁移

## 开发步骤

1. **需求确认**
   - 阅读 `spec.md` 了解功能需求
   - 与产品经理确认需求

2. **技术设计**
   - 阅读 `plan.md` 了解技术方案
   - 根据实际情况调整设计

3. **任务分解**
   - 查看 `tasks.md` 了解任务列表
   - 根据实际情况调整任务

4. **开发实现**
   - 按任务顺序开发
   - 遵循代码规范
   - 编写测试用例

5. **测试验证**
   - 单元测试
   - 集成测试
   - E2E 测试

6. **代码审查**
   - 提交 Pull Request
   - 通过代码审查

7. **部署上线**
   - 合并到主分支
   - 部署到测试环境
   - 部署到生产环境

## 常用命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint
```

## 注意事项

- 请遵循项目开发规范
- 确保代码质量
- 及时更新文档
EOF

    # 替换模板中的占位符
    sed -i "s/\[功能名称\]/$FEATURE_NAME/g" "$feature_dir"/*.md
    sed -i "s/\[FEATURE-XXX\]/$FEATURE_ID/g" "$feature_dir"/*.md
    
    print_success "模板文件已复制"
}

# 初始化 Git
init_git() {
    if [ "$NO_GIT" == "true" ]; then
        print_info "跳过 Git 初始化"
        return 0
    fi
    
    # 检查是否在 Git 仓库中
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_warning "当前目录不是 Git 仓库"
        return 0
    fi
    
    print_info "创建功能分支: $BRANCH_NAME"
    
    # 获取当前分支
    local current_branch=$(git branch --show-current)
    
    # 创建并切换到新分支
    git checkout -b "$BRANCH_NAME"
    
    # 添加文件
    git add "$SPECS_DIR/$FEATURE_ID-$FEATURE_SLUG"
    
    # 创建初始提交
    git commit -m "feat: 初始化 $FEATURE_NAME 功能规格

- 添加功能规格文档
- 添加技术实施计划
- 添加任务分解

[$FEATURE_ID]"
    
    print_success "Git 分支已创建: $BRANCH_NAME"
    print_info "当前分支: $(git branch --show-current)"
}

# 创建 AI Agent 配置文件
create_agent_config() {
    local feature_dir="$1"
    
    if [ -n "$AI_AGENT" ]; then
        cat > "$feature_dir/.ai-config" << EOF
{
  "agent": "$AI_AGENT",
  "feature": "$FEATURE_NAME",
  "feature_id": "$FEATURE_ID",
  "created_at": "$(date -Iseconds)"
}
EOF
        print_info "AI Agent 配置已创建: $AI_AGENT"
    fi
}

# 显示完成信息
show_completion() {
    local feature_dir="$SPECS_DIR/$FEATURE_ID-$FEATURE_SLUG"
    
    print_header "功能创建完成"
    
    echo "功能信息:"
    echo "  - 名称: $FEATURE_NAME"
    echo "  - 编号: $FEATURE_ID"
    echo "  - 分支: $BRANCH_NAME"
    echo "  - 目录: $feature_dir"
    echo ""
    
    echo "创建的文件:"
    echo "  - spec.md (功能规格文档)"
    echo "  - plan.md (技术实施计划)"
    echo "  - tasks.md (任务分解)"
    echo "  - quickstart.md (快速开始指南)"
    echo ""
    
    echo "下一步操作:"
    echo "  1. 编辑 spec.md，填写功能需求"
    echo "  2. 运行 AI Agent，使用 /speckit.specify 命令完善规格"
    echo "  3. 运行 /speckit.plan 命令创建技术实施计划"
    echo "  4. 运行 /speckit.tasks 命令生成任务列表"
    echo "  5. 运行 /speckit.implement 命令开始开发"
    echo ""
    
    if [ "$NO_GIT" != "true" ]; then
        echo "当前 Git 分支: $BRANCH_NAME"
        echo "请在此分支上进行开发"
        echo ""
    fi
    
    print_success "开始您的规范驱动开发之旅！"
}

# 主函数
main() {
    print_header "SpecKit 功能创建向导"
    
    # 解析参数
    parse_args "$@"
    
    # 验证输入
    validate_input
    
    # 初始化环境
    check_prerequisites
    init_speckit_env
    check_env
    
    # 生成信息
    FEATURE_SLUG=$(sanitize_name)
    FEATURE_ID=$(generate_feature_id)
    BRANCH_NAME="feature/${FEATURE_SLUG}"
    
    print_info "功能名称: $FEATURE_NAME"
    print_info "功能编号: $FEATURE_ID"
    print_info "功能目录: $FEATURE_SLUG"
    
    # 创建功能目录
    FEATURE_DIR=$(create_feature_dir)
    
    # 复制模板
    copy_templates "$FEATURE_DIR"
    
    # 创建 AI Agent 配置
    create_agent_config "$FEATURE_DIR"
    
    # 初始化 Git
    init_git
    
    # 显示完成信息
    show_completion
}

# 运行主函数
main "$@"
