#!/bin/bash
# 快速提交到 GitHub develop 分支
# 用法: bash scripts/quick-commit.sh [提交信息]

MESSAGE="${1:-chore: update}"

# 检查是否在项目根目录
if [ ! -d "btc-shopflow-monorepo" ] && [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 获取当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo "📋 当前分支: $CURRENT_BRANCH"

# 检查是否有未提交的更改
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ 没有未提交的更改"
    exit 0
fi

# 显示变更摘要
echo ""
echo "📝 变更文件:"
git status --short

# 切换到 develop 分支（如果不在）
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo ""
    echo "🔄 切换到 develop 分支..."
    git checkout develop || exit 1
fi

# 添加所有更改
echo ""
echo "📦 添加所有更改..."
git add . || exit 1

# 提交更改
echo ""
echo "💾 提交更改: $MESSAGE"
git commit -m "$MESSAGE" || exit 1

# 推送到远程
echo ""
echo "🚀 推送到 origin/develop..."
git push origin develop || exit 1

echo ""
echo "✅ 提交成功并已推送到 GitHub develop 分支"
echo "   提交信息: $MESSAGE"
echo "   分支: develop"

