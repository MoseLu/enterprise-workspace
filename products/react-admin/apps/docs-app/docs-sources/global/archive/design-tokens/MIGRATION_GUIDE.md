# BTC 变量迁移指南

本文档说明如何将现有的 CSS 变量迁移到设计令牌系统。

## 迁移策略

### 阶段1：准备阶段（已完成）

1. ✅ 创建 `@btc/design-tokens` 包
2. ✅ 配置 Style Dictionary
3. ✅ 定义基础令牌结构
4. ✅ 创建令牌文件

### 阶段2：逐步迁移

由于变量使用范围广泛（116个文件，1314处使用），采用渐进式迁移：

1. **先迁移核心变量**：`_tokens.scss` 中定义的变量
2. **更新样式文件**：使用编译后的设计令牌
3. **验证功能**：确保样式正常
4. **逐步扩展**：迁移其他变量

## 迁移步骤

### 步骤1：构建设计令牌

```bash
cd packages/design-tokens
pnpm install
pnpm build
```

### 步骤2：在 shared-components 中使用设计令牌

更新 `packages/shared-components/src/styles/index.scss`：

```scss
// 导入设计令牌（必须在最前面）
@use '@btc/design-tokens/scss' as *;

// 其他样式...
```

### 步骤3：更新 _tokens.scss

将 `_tokens.scss` 改为导入编译后的令牌：

```scss
// 导入编译后的设计令牌
@use '@btc/design-tokens/scss' as *;

// 保留向后兼容的变量定义（可选）
:root {
  --btc-crud-gap: var(--btc-crud-gap, 10px);
  // ...
}
```

### 步骤4：验证

1. 构建 shared-components
2. 在应用中使用，验证样式正常
3. 检查浏览器开发者工具，确认变量正确加载

## 变量映射表

| 现有变量 | 设计令牌路径 | 编译后变量 |
|---------|------------|-----------|
| `--btc-crud-gap` | `btc.crud.gap` | `--btc-crud-gap` |
| `--btc-crud-op-width` | `btc.crud.opWidth` | `--btc-crud-op-width` |
| `--btc-crud-search-width` | `btc.crud.searchWidth` | `--btc-crud-search-width` |
| `--btc-crud-btn-color` | `btc.crud.buttonColor` | `--btc-crud-btn-color` |
| `--btc-crud-icon-color` | `btc.crud.iconColor` | `--btc-crud-icon-color` |
| `--btc-icon-color` | `btc.icon.color` | `--btc-icon-color` |
| `--btc-breath-color` | `btc.breath.color` | `--btc-breath-color` |
| `--btc-table-button-color` | `btc.table.buttonColor` | `--btc-table-button-color` |

## 注意事项

1. **保持向后兼容**：迁移期间，保留原有的变量定义，确保现有代码继续工作
2. **逐步迁移**：不要一次性迁移所有变量，分批次进行
3. **充分测试**：每次迁移后都要测试，确保样式正常
4. **文档更新**：迁移完成后，更新相关文档

## 回滚计划

如果迁移出现问题，可以：

1. 恢复 `_tokens.scss` 的原始内容
2. 移除设计令牌包的导入
3. 继续使用原有的变量定义
