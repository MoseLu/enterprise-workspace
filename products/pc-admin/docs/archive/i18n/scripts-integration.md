# 国际化脚本集成说明

## 📦 新增脚本

项目中新增了三个国际化优化脚本:

1. **migrate-flat-to-nested.mjs** - 格式迁移工具
2. **check-completeness.mjs** - 完整性检查工具
3. **find-duplicates.mjs** - 重复检测工具

## 🔧 package.json 更新

在项目根目录的 `package.json` 中添加以下脚本配置:

```json
{
  "scripts": {
    "i18n:check:completeness": "node scripts/i18n/check-completeness.mjs",
    "i18n:check:duplicates": "node scripts/i18n/find-duplicates.mjs",
    "i18n:migrate": "node scripts/i18n/migrate-flat-to-nested.mjs",
    "i18n:migrate:file": "node scripts/i18n/migrate-flat-to-nested.mjs file",
    "i18n:migrate:dir": "node scripts/i18n/migrate-flat-to-nested.mjs dir",
    "i18n:check:all": "pnpm run i18n:check:completeness && pnpm run i18n:check:duplicates"
  }
}
```

## 📋 与现有脚本的关系

### 现有脚本

项目中已有的 i18n 相关脚本:

```json
{
  "check:i18n": "node scripts/check-i18n-keys.js",
  "check:i18n:apps": "node scripts/check-i18n-keys.js apps",
  "locale:merge": "node scripts/locale-merge.mjs",
  "locale:merge:all": "node scripts/locale-merge.mjs --all"
}
```

### 新增脚本

新增的脚本专注于优化和重构:

```json
{
  "i18n:check:completeness": "检查翻译完整性",
  "i18n:check:duplicates": "检查重复翻译",
  "i18n:migrate": "迁移配置格式",
  "i18n:check:all": "运行所有检查"
}
```

### 区别

| 脚本类型 | 现有脚本 | 新增脚本 |
|---------|---------|---------|
| **目的** | 日常开发检查 | 优化和重构 |
| **使用场景** | CI/CD, 开发时 | 代码优化, 重构时 |
| **检查内容** | Key 格式, 基本完整性 | 深度完整性, 重复分析 |
| **输出** | 简单错误信息 | 详细报告和建议 |

## 🚀 使用场景

### 日常开发

```bash
# 使用现有脚本
pnpm check:i18n          # 检查 key 格式
pnpm locale:merge        # 合并翻译文件
```

### 代码优化

```bash
# 使用新增脚本
pnpm i18n:check:completeness  # 检查翻译覆盖率
pnpm i18n:check:duplicates    # 查找重复翻译
pnpm i18n:check:all           # 运行所有新检查
```

### 格式迁移

```bash
# 迁移单个文件
pnpm i18n:migrate:file apps/system-app/src/locales/zh-CN.json output.ts

# 迁移整个目录
pnpm i18n:migrate:dir apps/system-app/src/locales locales/apps/system
```

## 📊 完整的工作流

### 1. 评估阶段

```bash
# Step 1: 检查现有问题
pnpm check:i18n

# Step 2: 深度分析
pnpm i18n:check:all

# Step 3: 查看详细报告
cat i18n-duplicates-report.json
```

### 2. 优化阶段

```bash
# Step 1: 备份
git checkout -b refactor/i18n-optimization

# Step 2: 迁移配置
pnpm i18n:migrate:dir apps/system-app/src/locales temp/system

# Step 3: 手动整理和合并
# 提取共享翻译到 locales/shared/

# Step 4: 验证
pnpm i18n:check:completeness
```

### 3. 验证阶段

```bash
# Step 1: 检查格式
pnpm check:i18n

# Step 2: 检查完整性
pnpm i18n:check:all

# Step 3: 运行应用测试
pnpm dev:all
```

## 🔄 CI/CD 集成建议

### GitHub Actions

```yaml
# .github/workflows/i18n-check.yml
name: I18n Quality Check

on:
  pull_request:
    paths:
      - 'apps/**/locales/**'
      - 'apps/**/i18n/**'
      - 'packages/**/locales/**'
      - 'locales/**'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Check i18n key format
        run: pnpm check:i18n
      
      - name: Check i18n completeness
        run: pnpm i18n:check:completeness
      
      - name: Check for duplicates
        run: pnpm i18n:check:duplicates
        continue-on-error: true  # 允许失败但记录警告
      
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: i18n-reports
          path: |
            completeness-report.txt
            i18n-duplicates-report.json
```

### Pre-commit Hook (可选)

如果要在提交时检查 (但可能会比较慢):

```bash
# .husky/pre-commit
#!/bin/sh

# 检查是否修改了国际化文件
if git diff --cached --name-only | grep -q "locales\|i18n"; then
  echo "🔍 检查国际化文件..."
  pnpm check:i18n
  
  # 可选: 也运行完整性检查
  # pnpm i18n:check:completeness
fi
```

## 💡 最佳实践

### 1. 定期检查

```bash
# 每周运行一次重复检测
pnpm i18n:check:duplicates

# 每次 PR 前检查完整性
pnpm i18n:check:completeness
```

### 2. 持续优化

```bash
# 发现重复后立即优化
pnpm i18n:check:duplicates
# 查看报告,提取共享翻译
```

### 3. 文档同步

```bash
# 更新翻译后更新文档
pnpm i18n:check:all
# 确保所有检查通过后提交
```

## 📞 常见问题

### Q: 为什么不合并到现有脚本?

A: 
- 现有脚本专注于日常开发检查 (快速、轻量)
- 新脚本专注于深度分析和重构 (详细、全面)
- 分离可以保持各自的独立性和灵活性

### Q: 需要安装新的依赖吗?

A: 是的,需要安装 `glob`:

```bash
pnpm add -D glob
```

### Q: 会影响现有的工作流吗?

A: 不会,新脚本是额外的工具,不影响现有脚本和工作流。

### Q: 什么时候使用哪个脚本?

A:
- **日常开发**: 使用 `check:i18n`
- **PR 前检查**: 使用 `i18n:check:completeness`
- **代码优化**: 使用 `i18n:check:duplicates`
- **格式迁移**: 使用 `i18n:migrate`

## 📚 相关文档

- [国际化优化分析](./i18n-optimization-analysis.md) - 详细的问题分析和优化方案
- [国际化快速开始](./i18n-quick-start.md) - 5分钟快速上手
- [脚本使用文档](../scripts/i18n/README.md) - 脚本详细说明

## ✅ 集成检查清单

- [ ] 在 `package.json` 中添加新脚本
- [ ] 安装必要的依赖 (`pnpm add -D glob`)
- [ ] 测试所有新脚本是否能正常运行
- [ ] (可选) 配置 CI/CD 集成
- [ ] (可选) 配置 pre-commit hook
- [ ] 更新团队文档
- [ ] 通知团队成员新工具的使用方法

---

**准备好了吗?** 先运行一次检查看看效果:

```bash
pnpm i18n:check:duplicates
```
