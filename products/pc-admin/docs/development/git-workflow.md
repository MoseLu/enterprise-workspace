# Git 标签规范指南

## 概述

Git 标签（tag）用于标记项目的重要里程碑，通常是版本发布点。标签可以记录在文档中，便于团队查看版本历史和发布记录。

## 标签命名规范

### 格式

```
v<major>.<minor>.<patch>
```

- **前缀**：必须使用 `v` 前缀（小写）
- **版本号**：遵循[语义化版本规范](https://semver.org/lang/zh-CN/)（Semantic Versioning）

### 版本号规则

- **主版本号（major）**：不兼容的 API 修改
- **次版本号（minor）**：向下兼容的功能性新增
- **修订号（patch）**：向下兼容的问题修正

### 示例

```
v1.0.0    # 第一个正式版本
v1.0.1    # 修复 bug
v1.1.0    # 新增功能
v1.1.1    # 修复 bug
v2.0.0    # 重大更新（可能不兼容）
```

### 错误示例

```
❌ 1.0.0        # 缺少 v 前缀
❌ V1.0.0       # v 应该是小写
❌ v1.0         # 缺少修订号
❌ v1.0.0-beta  # 预发布版本应使用其他方式（如 v1.0.0-beta.1）
```

## 标签类型

### 1. 轻量标签（Lightweight Tag）

简单指向特定提交的指针，不包含额外信息。

```bash
git tag v1.0.0
```

**适用场景**：临时标记、个人使用

### 2. 附注标签（Annotated Tag）

包含完整信息的标签对象，推荐使用。

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

**包含信息**：
- 标签名称
- 标签创建者
- 创建时间
- 标签消息（附注）
- 指向的提交

**适用场景**：正式版本发布（推荐）

## 标签消息规范

### 格式

```
版本 <version>

<主要更新说明>

<详细变更列表>
```

### 示例

```
版本 v1.0.7

主要更新:
- 存储系统重构: 引入 pinia-plugin-persistedstate，统一管理所有 Store 持久化
- 存储工具重组: 统一到 utils/storage/ 目录，新增 SessionStorage 和 IndexedDB 工具
- 重构所有 Store: 移除手动持久化逻辑，使用插件自动管理
- 新增 IndexedDB 工具: 基于 Dexie.js，支持大容量历史数据查询（可视化看板场景）
```

### 消息内容建议

1. **版本号**：明确标注版本
2. **主要更新**：列出重要变更
3. **详细列表**：使用列表形式说明具体改动
4. **破坏性变更**：如有，明确标注 `BREAKING CHANGE`

## 标签在文档中的记录

### 1. CHANGELOG.md（推荐）

在项目根目录创建 `CHANGELOG.md`，记录所有版本变更。

**✨ 自动同步功能**：项目已配置自动更新 CHANGELOG.md 的功能。使用发布脚本创建标签后，会自动更新 CHANGELOG.md。

```markdown
# 更新日志

## [1.0.7] - 2026-01-07

### 变更
- 存储系统重构: 引入 pinia-plugin-persistedstate
- 存储工具重组: 统一到 utils/storage/ 目录
- 新增 IndexedDB 工具: 基于 Dexie.js

## [1.0.6] - 2025-12-29

### 变更
- 加载样式系统优化
```

#### 手动更新 CHANGELOG

如果需要手动更新或修复 CHANGELOG：

```bash
# 更新指定版本的 CHANGELOG
node scripts/update-changelog.mjs 1.0.8

# 如果不提供版本号，会使用最新的标签
node scripts/update-changelog.mjs
```

### 2. RELEASES.md

专门记录发布信息的文档：

```markdown
# 版本发布记录

## v1.0.7 (2024-01-15)

**标签**: [v1.0.7](https://github.com/your-org/your-repo/releases/tag/v1.0.7)

**主要更新**:
- 存储系统重构
- 新增 IndexedDB 工具

**完整变更**: 查看 [CHANGELOG.md](../CHANGELOG.md#107---2024-01-15)

---

## v1.0.6 (2024-01-10)

**标签**: [v1.0.6](https://github.com/your-org/your-repo/releases/tag/v1.0.6)

**主要更新**:
- 修复菜单国际化问题
```

### 3. README.md

在 README 中记录最新版本：

```markdown
## 版本信息

当前版本: **v1.0.7**

[查看所有版本](https://github.com/your-org/your-repo/releases) | [更新日志](CHANGELOG.md)
```

## 创建标签

### 使用发布脚本（推荐）

```bash
# 使用自动化脚本创建标签
pnpm release 1.0.8
# 或
node scripts/release-version.mjs 1.0.8
```

脚本会自动：
- 创建附注标签
- 提示输入标签消息
- 推送到远程

### 手动创建标签

#### 创建附注标签

```bash
# 基本用法
git tag -a v1.0.8 -m "版本 v1.0.8"

# 使用编辑器输入详细消息
git tag -a v1.0.8

# 从文件读取消息（推荐，避免编码问题）
git tag -a v1.0.8 -F release-notes.txt
```

#### 创建轻量标签

```bash
git tag v1.0.8
```

### 推送标签

```bash
# 推送单个标签
git push origin v1.0.8

# 推送所有标签
git push origin --tags

# 推送所有标签（包括已存在的）
git push origin --tags --force
```

## 查看标签

### 列出所有标签

```bash
# 按字母顺序
git tag

# 按版本号排序
git tag --sort=-version:refname

# 过滤标签
git tag -l "v1.0.*"
```

### 查看标签信息

```bash
# 查看标签详细信息
git show v1.0.7

# 查看标签列表和消息
git tag -n

# 查看特定标签的消息
git tag -l -n9 v1.0.7
```

### 查看标签对应的提交

```bash
# 查看标签指向的提交
git log v1.0.7

# 查看两个标签之间的提交
git log v1.0.6..v1.0.7

# 查看标签的提交哈希
git rev-list -n 1 v1.0.7
```

## 删除标签

### 删除本地标签

```bash
git tag -d v1.0.8
```

### 删除远程标签

```bash
git push origin --delete v1.0.8
# 或
git push origin :refs/tags/v1.0.8
```

### 删除本地和远程标签

```bash
git tag -d v1.0.8
git push origin --delete v1.0.8
```

## 标签与 GitHub Releases

### 创建 Release

1. 访问 GitHub 仓库的 Releases 页面
2. 点击 "Draft a new release"
3. 选择标签（如果不存在，可以先创建标签）
4. 填写 Release 标题和描述
5. 上传构建产物（如需要）
6. 发布

### Release 描述模板

```markdown
## 🎉 版本 v1.0.8 发布

### ✨ 新功能
- 新增功能 A
- 新增功能 B

### 🐛 修复
- 修复问题 X
- 修复问题 Y

### 📝 改进
- 优化性能
- 改进用户体验

### 📦 完整变更
查看 [CHANGELOG.md](../../CHANGELOG.md#108---2024-01-20) 了解完整变更列表

### 🔗 相关链接
- [文档](https://your-docs-url)
- [升级指南](https://your-upgrade-guide)
```

## 最佳实践

### 1. 标签命名

- ✅ 始终使用 `v` 前缀
- ✅ 遵循语义化版本规范
- ✅ 使用附注标签（包含消息）
- ❌ 不要使用特殊字符
- ❌ 不要重复使用已存在的标签名

### 2. 标签消息

- ✅ 清晰描述版本内容
- ✅ 列出主要变更
- ✅ 使用列表格式
- ❌ 避免过长的消息
- ❌ 不要包含敏感信息

### 3. 标签管理

- ✅ 在 main 分支上创建标签
- ✅ 及时推送到远程
- ✅ 在文档中记录标签信息
- ✅ 使用自动化脚本减少错误
- ❌ 不要删除已发布的标签（除非有严重问题）

### 4. 文档记录

- ✅ 在 CHANGELOG.md 中记录所有版本
- ✅ 在 GitHub Releases 中创建 Release
- ✅ 在 README 中更新版本信息
- ✅ 保持文档与标签同步

## 常见问题

### Q: 标签可以修改吗？

A: 可以，但不推荐修改已发布的标签。如果必须修改：
1. 删除本地标签：`git tag -d v1.0.8`
2. 删除远程标签：`git push origin --delete v1.0.8`
3. 重新创建标签：`git tag -a v1.0.8 -m "新消息"`
4. 推送标签：`git push origin v1.0.8`

### Q: 标签和分支的区别？

A:
- **标签**：指向特定提交的静态引用，不会移动
- **分支**：指向提交的动态引用，会随着新提交移动

### Q: 如何回滚到某个标签？

A:
```bash
# 查看标签
git checkout v1.0.7

# 创建新分支（推荐）
git checkout -b hotfix/v1.0.7 v1.0.7
```

### Q: 标签可以包含在文档中吗？

A: 可以，推荐在以下文档中记录：
- `CHANGELOG.md`：详细变更日志
- `RELEASES.md`：发布记录
- `README.md`：版本信息
- GitHub Releases：在线发布说明

## 相关资源

- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Git 标签文档](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E6%89%93%E6%A0%87%E7%AD%BE)
- [GitHub Releases 指南](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)
