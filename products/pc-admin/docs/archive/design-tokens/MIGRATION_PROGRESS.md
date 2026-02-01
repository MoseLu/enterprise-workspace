# 迁移进度跟踪

本文档跟踪设计令牌迁移的实际执行进度。

## 里程碑完成状态

| 里程碑 | 状态 | 完成时间 | 备注 |
|--------|------|---------|------|
| M1 | ✅ 已完成 | 2026-01-13 | 设计令牌包构建成功，输出文件验证通过 |
| M2 | ✅ 已完成 | 2026-01-13 | 设计令牌包已集成到 shared-components |
| M3 | ⏳ 待开始 | - | 核心样式文件迁移 |
| M4 | ⏳ 待开始 | - | CRUD相关样式迁移 |
| M5 | ⏳ 待开始 | - | 组件样式文件迁移 |
| M6 | ⏳ 待开始 | - | 所有变量迁移完成 |
| M7 | ⏳ 待开始 | - | 全面测试 |
| M8 | ⏳ 待开始 | - | 文档更新和清理 |

## 已完成步骤详情

### 里程碑 M1：设计令牌包就绪

**完成时间**：2026-01-13

**完成步骤**：
- ✅ 步骤1.1：安装设计令牌包依赖
- ✅ 步骤1.2：首次构建设计令牌包
- ✅ 步骤1.3：验证变量名格式
- ✅ 步骤1.4：验证变量值正确性

**验证结果**：
- ✅ 设计令牌包构建成功
- ✅ 生成三个输出文件：
  - `dist/css/variables.css` - 包含8个 `--btc-*` CSS变量
  - `dist/scss/_variables.scss` - 包含8个 `$btc-*` SCSS变量
  - `dist/ts/tokens.ts` - TypeScript类型定义
- ✅ 所有8个BTC变量都已生成
- ✅ 变量名格式正确（`--btc-*` 和 `$btc-*`）
- ✅ 变量值正确

**输出文件内容**：
```css
:root {
  --btc-crud-gap: 10px;
  --btc-crud-op-width: 220px;
  --btc-crud-search-width: 220px;
  --btc-crud-button-color: var(--el-text-color-primary);
  --btc-crud-icon-color: var(--el-color-primary);
  --btc-icon-color: var(--el-text-color-primary);
  --btc-breath-color: var(--el-color-primary);
  --btc-table-button-color: var(--el-color-primary);
}
```

**配置修复**：
- 添加了 `filter` 函数，只输出 `btc.*` 路径的变量
- 修复了 `variableNameTransform` 函数，正确跳过 `btc` 前缀

---

### 里程碑 M2：设计令牌包集成完成

**完成时间**：2026-01-13

**完成步骤**：
- ✅ 步骤2.1：添加 design-tokens 依赖到 shared-components
- ✅ 步骤2.2：安装 shared-components 依赖
- ✅ 步骤2.3：更新 _tokens.scss 导入设计令牌
- ✅ 步骤2.4：构建 shared-components 验证集成
- ⏳ 步骤2.5：验证浏览器中的变量加载（需要在浏览器中验证）

**验证结果**：
- ✅ shared-components 构建成功
- ✅ 设计令牌包已正确导入
- ✅ 无构建错误
- ⏳ 浏览器验证待完成（需要实际运行应用）

**文件变更**：
- `packages/shared-components/package.json` - 添加 `@btc/design-tokens: workspace:*`
- `packages/shared-components/src/styles/_tokens.scss` - 添加 `@use '@btc/design-tokens/scss' as *;`

**注意事项**：
- 保留了原有变量定义，确保向后兼容
- 设计令牌变量和原有变量同时存在，不会冲突

---

## 待执行步骤

### 里程碑 M3：核心样式文件迁移完成

**待执行步骤**：
- ⏳ 步骤3.1.1-3.1.4：迁移 crud/_base.scss
- ⏳ 步骤3.2.1-3.2.4：迁移 crud/_button.scss
- ⏳ 步骤3.3.1-3.3.4：迁移 _components.scss
- ⏳ 步骤3.4：批次1完整验证

**预计时间**：2-3天

---

### 里程碑 M4-M8

按照 [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) 中的步骤逐步执行。

---

## 遇到的问题和解决方案

### 问题1：Style Dictionary 输出了所有变量

**症状**：初始构建时，输出了基础变量（`--color-*`, `--spacing-*`）和BTC变量（`--btc-*`）

**原因**：配置中没有过滤，Style Dictionary 处理了所有令牌文件

**解决方案**：在配置文件中添加 `filter` 函数，只输出 `btc.*` 路径的变量

**修复文件**：`config/style-dictionary.config.js`

---

### 问题2：变量名格式不正确

**症状**：初始构建时，变量名不是 `--btc-*` 格式

**原因**：`variableNameTransform` 函数的路径处理逻辑有误

**解决方案**：修复路径处理，正确跳过 `btc` 前缀

**修复文件**：`config/style-dictionary.config.js`

---

### 问题3：令牌冲突警告

**症状**：构建时出现 "Token collisions detected" 警告

**原因**：多个JSON文件都包含 `$schema` 字段

**影响**：不影响功能，只是警告

**解决方案**：可以忽略，或移除部分文件的 `$schema` 字段（当前选择忽略）

---

## 下一步行动

1. **完成浏览器验证**（步骤2.5）
   - 启动一个应用（如 admin-app）
   - 在浏览器开发者工具中检查 `:root` 的 CSS 变量
   - 确认设计令牌变量正确加载

2. **开始里程碑 M3**
   - 按照原子步骤文档执行批次1迁移
   - 逐个文件迁移和验证

3. **持续跟踪进度**
   - 更新本文档
   - 更新里程碑文档中的进度跟踪表

---

## 注意事项

1. **向后兼容**：当前保留了原有变量定义，确保现有代码继续工作
2. **逐步迁移**：变量迁移需要逐步进行，充分测试
3. **浏览器验证**：步骤2.5需要在浏览器中实际验证

---

## 更新日志

- 2026-01-13：完成里程碑 M1 和 M2
- 2026-01-13：创建进度跟踪文档
