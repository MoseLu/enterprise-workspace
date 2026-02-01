# 设计令牌结构说明

本文档说明 `@btc/design-tokens` 包中设计令牌的JSON结构和分类。

## 令牌文件组织

```
tokens/
├── base/              # 基础令牌（颜色、间距等）
│   ├── color.json     # 颜色令牌
│   └── spacing.json   # 间距和尺寸令牌
├── btc.json           # BTC 项目特定令牌（引用基础令牌）
└── components/        # 组件特定令牌（未来扩展）
```

## 令牌分类

### 1. 基础令牌（base/）

基础令牌定义项目的核心设计值，其他令牌可以引用这些值。

#### color.json - 颜色令牌

```json
{
  "color": {
    "base": {
      "primary": {
        "value": "var(--el-color-primary)",
        "type": "color",
        "description": "主色，引用 Element Plus 变量"
      },
      "text": {
        "primary": {
          "value": "var(--el-text-color-primary)",
          "type": "color",
          "description": "主要文本颜色，引用 Element Plus 变量"
        }
      }
    },
    "crud": {
      "button": {
        "value": "{color.base.text.primary}",
        "type": "color",
        "description": "CRUD 按钮的文字颜色"
      },
      "icon": {
        "value": "{color.base.primary}",
        "type": "color",
        "description": "CRUD 图标按钮的颜色"
      }
    },
    "icon": {
      "value": "{color.base.text.primary}",
      "type": "color",
      "description": "通用图标按钮的颜色"
    },
    "breath": {
      "value": "{color.base.primary}",
      "type": "color",
      "description": "通知/消息图标的呼吸灯动画颜色"
    },
    "table": {
      "button": {
        "value": "{color.base.primary}",
        "type": "color",
        "description": "表格工具栏按钮的颜色"
      }
    }
  }
}
```

**说明**：
- `color.base.*`：引用 Element Plus 变量的基础颜色
- `color.crud.*`：CRUD 组件相关的颜色
- `color.icon`：通用图标颜色
- `color.breath`：呼吸灯动画颜色
- `color.table.*`：表格相关颜色

#### spacing.json - 间距和尺寸令牌

```json
{
  "spacing": {
    "crud": {
      "gap": {
        "value": "10px",
        "type": "spacing",
        "description": "CRUD 组件行之间的垂直间距"
      },
      "opWidth": {
        "value": "220px",
        "type": "sizing",
        "description": "CRUD 操作列的固定宽度"
      },
      "searchWidth": {
        "value": "{spacing.crud.opWidth}",
        "type": "sizing",
        "description": "CRUD 搜索框的宽度，默认继承操作列宽度"
      }
    }
  }
}
```

**说明**：
- `spacing.crud.gap`：CRUD 行间距
- `spacing.crud.opWidth`：操作列宽度
- `spacing.crud.searchWidth`：搜索框宽度（引用 opWidth）

### 2. BTC 项目令牌（btc.json）

BTC 项目特定的令牌，引用基础令牌，生成最终的 `--btc-*` CSS 变量。

```json
{
  "btc": {
    "crud": {
      "gap": {
        "value": "{spacing.crud.gap}",
        "type": "spacing",
        "description": "CRUD 组件行之间的垂直间距"
      },
      "opWidth": {
        "value": "{spacing.crud.opWidth}",
        "type": "sizing",
        "description": "CRUD 操作列的固定宽度"
      },
      "searchWidth": {
        "value": "{spacing.crud.searchWidth}",
        "type": "sizing",
        "description": "CRUD 搜索框的宽度"
      },
      "buttonColor": {
        "value": "{color.crud.button}",
        "type": "color",
        "description": "CRUD 按钮的文字颜色"
      },
      "iconColor": {
        "value": "{color.crud.icon}",
        "type": "color",
        "description": "CRUD 图标按钮的颜色"
      }
    },
    "icon": {
      "color": {
        "value": "{color.icon}",
        "type": "color",
        "description": "通用图标按钮的颜色"
      }
    },
    "breath": {
      "color": {
        "value": "{color.breath}",
        "type": "color",
        "description": "通知/消息图标的呼吸灯动画颜色"
      }
    },
    "table": {
      "buttonColor": {
        "value": "{color.table.button}",
        "type": "color",
        "description": "表格工具栏按钮的颜色"
      }
    }
  }
}
```

**说明**：
- `btc.*` 令牌会编译为 `--btc-*` CSS 变量
- 例如：`btc.crud.gap` → `--btc-crud-gap`
- 所有 `btc.*` 令牌都引用基础令牌，确保设计一致性

## 令牌引用规则

### 1. 引用语法

使用 `{category.subcategory.token}` 格式引用其他令牌：

```json
{
  "value": "{spacing.crud.gap}",
  "value": "{color.base.primary}",
  "value": "{color.crud.button}"
}
```

### 2. 引用链

令牌可以形成引用链：

```
spacing.crud.searchWidth
  → {spacing.crud.opWidth}
    → "220px"
```

### 3. Element Plus 变量引用

基础颜色令牌引用 Element Plus 变量：

```json
{
  "value": "var(--el-color-primary)",
  "value": "var(--el-text-color-primary)"
}
```

## 编译输出

### CSS 变量格式

```css
:root {
  --btc-crud-gap: 10px;
  --btc-crud-op-width: 220px;
  --btc-crud-search-width: var(--btc-crud-op-width, 220px);
  --btc-crud-btn-color: var(--el-text-color-primary);
  --btc-crud-icon-color: var(--el-color-primary);
  --btc-icon-color: var(--el-text-color-primary);
  --btc-breath-color: var(--el-color-primary);
  --btc-table-button-color: var(--el-color-primary);
}
```

### SCSS 变量格式

```scss
$btc-crud-gap: 10px;
$btc-crud-op-width: 220px;
// ...
```

### TypeScript 格式

```typescript
export const tokens = {
  spacing: {
    crud: {
      gap: '10px',
      opWidth: '220px',
      // ...
    }
  },
  // ...
};
```

## 变量名转换规则

### CSS 变量名

- 路径：`btc.crud.gap`
- 转换：`--btc-crud-gap`
- 规则：跳过 `btc` 前缀，其余部分转换为 kebab-case

### SCSS 变量名

- 路径：`btc.crud.gap`
- 转换：`$btc-crud-gap`
- 规则：同上，但使用 `$` 前缀

### TypeScript 变量名

- 路径：`btc.crud.gap`
- 转换：`btc.crud.gap`（保持原样）
- 规则：使用 camelCase 嵌套对象

## 新增令牌指南

### 步骤 1：确定令牌类型

- **颜色** → `tokens/base/color.json`
- **间距/尺寸** → `tokens/base/spacing.json`
- **组件特定** → `tokens/components/*.json`

### 步骤 2：定义基础令牌（如果需要）

如果是一个新的设计值，先在基础令牌中定义：

```json
{
  "spacing": {
    "new": {
      "value": "16px",
      "type": "spacing",
      "description": "新的间距值"
    }
  }
}
```

### 步骤 3：在 btc.json 中引用

```json
{
  "btc": {
    "new": {
      "value": "{spacing.new}",
      "type": "spacing",
      "description": "新的 BTC 间距"
    }
  }
}
```

### 步骤 4：构建和验证

```bash
pnpm build
```

检查 `dist/css/variables.css` 中的输出是否正确。

## 注意事项

1. **不要直接定义值**：所有 `btc.*` 令牌都应该引用基础令牌
2. **保持语义化**：令牌名应该表达含义，而非具体值
3. **文档化**：每个令牌都应该有 `description` 字段
4. **类型正确**：确保 `type` 字段正确（color、spacing、sizing 等）
