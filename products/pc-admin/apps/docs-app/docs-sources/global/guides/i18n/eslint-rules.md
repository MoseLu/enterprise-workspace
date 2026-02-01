# ESLint 国际化规范检查规则

## 概述

项目已集成 `eslint-plugin-i18n` 和自定义规则，用于自动检测和修复国际化不规范问题，确保代码符合项目的国际化规范。

## 已配置的规则

### 1. `i18n/no-chinese-character` - 禁止硬编码中文文本

**作用**：检测代码中直接写死的中文文本，强制使用国际化 key。

**配置**：
```javascript
'i18n/no-chinese-character': [
  'error',
  {
    ignoreComments: true,        // 允许在注释中使用中文
    ignoreStrings: false,         // 不允许在字符串中使用中文
    ignoreTemplateLiterals: false, // 不允许在模板字符串中使用中文
    ignoreRegExpLiterals: true,   // 允许在正则表达式中使用中文
  },
]
```

**示例**：

❌ **错误**：
```vue
<template>
  <div>打印工单</div>
  <button>{{ "确认" }}</button>
</template>
```

✅ **正确**：
```vue
<template>
  <div>{{ $t('menu.test_features.inventory_ticket_print.title') }}</div>
  <button>{{ $t('common.confirm') }}</button>
</template>
```

### 2. `i18n-custom/i18n-key-format` - 强制国际化 key 格式规范

**作用**：强制国际化 key 使用 `snake_case` 格式，且符合层级结构。

**配置**：
```javascript
'i18n-custom/i18n-key-format': [
  'error',
  {
    format: 'snake_case',           // 强制使用 snake_case
    minLevels: 2,                   // 最少 2 层
    maxLevels: 5,                   // 最多 5 层
    allowedPrefixes: [              // 允许的前缀
      'app', 'auth', 'common', 'menu', 'btc',
      'inventory', 'org', 'access', 'navigation',
      'ops', 'strategy', 'governance', 'data', 'test_features'
    ],
  },
]
```

**检查项**：
1. ✅ 使用 `snake_case` 格式（全小写，下划线分隔）
2. ✅ 符合层级结构（2-5 层，如 `menu.platform.domains`）
3. ✅ 前缀在允许列表中
4. ❌ 禁止使用 `PascalCase`（如 `AdminInventoryTicketPrint`）
5. ❌ 禁止使用 `camelCase`（如 `inventoryTicketPrint`）
6. ❌ 禁止使用中文 key（如 `"盘点票打印"`）

**示例**：

❌ **错误**：
```javascript
$t('AdminInventoryTicketPrint')        // ❌ PascalCase
$t('inventoryTicketPrint')             // ❌ camelCase
$t('盘点票打印')                        // ❌ 中文 key
$t('menu.platform')                    // ❌ 层级不足（只有 2 层，但可能不符合业务需求）
$t('invalid.prefix.key')               // ❌ 前缀不在允许列表中
```

✅ **正确**：
```javascript
$t('menu.test_features.inventory_ticket_print.title')
$t('common.confirm')
$t('app.name')
$t('menu.platform.domains')
```

## 使用方法

### 运行 ESLint 检查

```bash
# 检查所有文件
pnpm run lint

# 检查特定文件
npx eslint src/views/Inventory.vue

# 自动修复（部分规则支持）
npx eslint --fix src/views/Inventory.vue
```

### 在 IDE 中使用

如果使用 VS Code，安装 ESLint 扩展后，编辑器会自动显示错误提示：

1. 红色波浪线：表示错误（error）
2. 黄色波浪线：表示警告（warning）
3. 悬停查看：鼠标悬停在错误上可查看详细说明

### 在 CI/CD 中使用

在 CI/CD 流程中添加 ESLint 检查，确保代码提交前通过规范检查：

```yaml
# .github/workflows/lint.yml
- name: Run ESLint
  run: pnpm run lint
```

## 规则配置说明

### 忽略特定文件或代码

如果某些文件或代码需要忽略检查，可以使用 ESLint 的注释：

```javascript
// 忽略整个文件
/* eslint-disable i18n/no-chinese-character */

// 忽略下一行
// eslint-disable-next-line i18n/no-chinese-character
const text = "打印工单";

// 忽略代码块
/* eslint-disable i18n/no-chinese-character */
const config = {
  title: "系统配置",
  description: "系统基本配置信息"
};
/* eslint-enable i18n/no-chinese-character */
```

### 调整规则严格程度

如果需要调整规则的严格程度，可以修改 `.eslintrc.js`：

```javascript
rules: {
  // 'error' - 错误（红色，会阻止构建）
  // 'warn'  - 警告（黄色，不会阻止构建）
  // 'off'   - 关闭规则
  'i18n/no-chinese-character': 'warn',  // 改为警告
  'i18n-custom/i18n-key-format': 'off', // 关闭规则
}
```

## 常见问题

### 1. 为什么某些中文没有被检测到？

可能的原因：
- 中文在注释中（已配置 `ignoreComments: true`）
- 中文在正则表达式中（已配置 `ignoreRegExpLiterals: true`）
- 文件被 `.eslintignore` 忽略

### 2. 如何添加新的允许前缀？

编辑 `.eslintrc.js`，在 `allowedPrefixes` 数组中添加：

```javascript
allowedPrefixes: [
  'app', 'auth', 'common', 'menu', 'btc',
  'your_new_prefix',  // 添加新前缀
]
```

### 3. 如何调整层级范围？

编辑 `.eslintrc.js`，修改 `minLevels` 和 `maxLevels`：

```javascript
{
  minLevels: 1,  // 最少 1 层（如 'app.name'）
  maxLevels: 6,  // 最多 6 层
}
```

## 与现有规范的结合

这些 ESLint 规则与项目的国际化规范文档（`docs/I18N-NAMING-CONVENTION.md`）完全一致：

- ✅ 命名风格：`snake_case`
- ✅ 层级格式：`{category}.{module}.{feature}.{element}`
- ✅ 禁止硬编码文本
- ✅ 前缀规范

## 扩展功能

### 检测未使用的 key

目前 `eslint-plugin-i18n` 不支持检测未使用的 key。可以使用以下工具：

1. **自定义脚本**：`scripts/check-unused-i18n-keys.js`
2. **第三方工具**：`i18n-unused-keys` 等

### 检测缺失的 key

目前需要手动检查。可以在 CI/CD 中添加自动化检查脚本。

## 参考文档

- [国际化命名规范](./I18N-NAMING-CONVENTION.md)
- [国际化加载顺序](./I18N-LOADING-ORDER.md)
- [ESLint 官方文档](https://eslint.org/docs/latest/)
