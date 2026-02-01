#!/bin/bash

# Jenkins 配置检查脚本
# 用于验证 Jenkins 环境是否配置正确

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Jenkins 环境配置检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ERRORS=0

# 检查 Node.js
log_info "检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js 已安装: $NODE_VERSION"
    
    # 检查版本是否为 20.x
    if [[ "$NODE_VERSION" =~ ^v20\. ]]; then
        log_success "Node.js 版本符合要求 (>= 20.x)"
    else
        log_warning "Node.js 版本为 $NODE_VERSION，建议使用 20.x"
    fi
else
    log_error "Node.js 未安装"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 检查 pnpm
log_info "检查 pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    log_success "pnpm 已安装: $PNPM_VERSION"
else
    log_warning "pnpm 未安装，将在 Pipeline 中自动安装"
fi
echo ""

# 检查 Git
log_info "检查 Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    log_success "Git 已安装: $GIT_VERSION"
else
    log_error "Git 未安装"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 检查 SSH
log_info "检查 SSH..."
if command -v ssh &> /dev/null; then
    SSH_VERSION=$(ssh -V 2>&1 | head -1)
    log_success "SSH 已安装: $SSH_VERSION"
else
    log_error "SSH 未安装"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 检查 rsync（可选，用于部署）
log_info "检查 rsync（可选）..."
if command -v rsync &> /dev/null; then
    RSYNC_VERSION=$(rsync --version | head -1)
    log_success "rsync 已安装: $RSYNC_VERSION"
else
    log_warning "rsync 未安装，部署时将使用 scp（较慢）"
fi
echo ""

# 检查项目文件
log_info "检查项目文件..."
if [ -f "Jenkinsfile" ]; then
    log_success "Jenkinsfile 存在"
else
    log_error "Jenkinsfile 不存在"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "package.json" ]; then
    log_success "package.json 存在"
else
    log_error "package.json 不存在"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "scripts/deploy-static.sh" ]; then
    log_success "部署脚本存在: scripts/deploy-static.sh"
else
    log_error "部署脚本不存在: scripts/deploy-static.sh"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "deploy.config.example.json" ]; then
    log_success "部署配置示例存在: deploy.config.example.json"
    if [ ! -f "deploy.config.json" ]; then
        log_warning "deploy.config.json 不存在，建议复制示例文件："
        log_info "  cp deploy.config.example.json deploy.config.json"
    fi
else
    log_warning "deploy.config.example.json 不存在"
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    log_success "环境配置检查通过！"
    echo ""
    log_info "下一步："
    log_info "1. 配置 Jenkins Credentials（参考 jenkins/credentials-setup.md）"
    log_info "2. 在 Jenkins 中创建 Pipeline Job"
    log_info "3. 运行第一次构建"
else
    log_error "发现 $ERRORS 个错误，请先解决这些问题"
    exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
