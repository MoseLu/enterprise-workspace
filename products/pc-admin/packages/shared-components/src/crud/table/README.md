# BtcTable 列宽调整功能

## 功能概述

BtcTable 基于 Element Plus 的 el-table 组件，**智能支持**用户通过拖拽方式自由调整列宽，所有表格默认启用此功能。

## 智能列宽调整规则

### 默认行为（自动启用）
- ✅ **所有列**：默认支持列宽调整
- ❌ **选择列** (`type: 'selection'`)：不支持调整，保持固定宽度
- ❌ **序号列** (`type: 'index'`)：不支持调整，保持固定宽度

### 自定义控制（可选）
```typescript
const columns = [
  { prop: 'name', label: '姓名' },                    // 默认可调整
  { prop: 'email', label: '邮箱' },                   // 默认可调整
  { prop: 'phone', label: '电话', resizable: false }, // 明确禁用
];
```

## 使用方法

### 基础用法（推荐）
```vue
<template>
  <BtcTable 
    :columns="columns" 
    :border="true" 
  />
</template>
```

### 配置选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `border` | `boolean` | `true` | 是否显示表格边框 |

### 列配置

在列配置中，您可以为每列设置初始宽度：

```typescript
const columns = [
  { prop: 'name', label: '姓名', width: 120 },
  { prop: 'email', label: '邮箱', width: 200 },
  { prop: 'phone', label: '电话', width: 150 },
  { prop: 'address', label: '地址', minWidth: 100 },
];
```

### 列宽调整事件

当用户调整列宽时，会触发 `header-dragend` 事件：

```vue
<template>
  <BtcTable 
    :columns="columns" 
    :resizable="true"
    @header-dragend="onColumnResize"
  />
</template>

<script setup>
const onColumnResize = (newWidth, oldWidth, column) => {
  console.log('列宽调整:', {
    column: column.property,
    newWidth,
    oldWidth
  });
  
  // 保存列宽到本地存储
  const savedWidths = JSON.parse(localStorage.getItem('table-column-widths') || '{}');
  savedWidths[column.property] = newWidth;
  localStorage.setItem('table-column-widths', JSON.stringify(savedWidths));
};
</script>
```

## 特性

### 1. 拖拽调整
- 用户可以通过拖拽列边界来调整列宽
- 提供视觉反馈，悬停时显示调整手柄
- 支持实时调整，无需刷新页面

### 2. 列宽持久化
- 自动保存列宽调整到本地存储
- 下次访问时恢复用户设置的列宽
- 支持多表格独立存储

### 3. 响应式设计
- 列宽调整不影响表格的响应式布局
- 支持最小宽度限制
- 自动处理内容溢出

## 样式定制

### 调整手柄样式

```scss
:deep(.el-table) {
  .el-table__header-wrapper {
    .el-table__header {
      th {
        &::after {
          background: #409eff; // 调整手柄颜色
          opacity: 0.3;        // 透明度
        }
      }
    }
  }
}
```

### 调整时的视觉反馈

```scss
:deep(.el-table) {
  .el-table__header-wrapper {
    .el-table__header {
      th {
        &.is-resizing {
          background-color: #f5f7fa; // 调整时的背景色
        }
      }
    }
  }
}
```

## 最佳实践

### 1. 设置合理的初始宽度
```typescript
const columns = [
  { prop: 'id', label: 'ID', width: 80 },           // 固定宽度
  { prop: 'name', label: '姓名', width: 120 },      // 固定宽度
  { prop: 'description', label: '描述', minWidth: 200 }, // 最小宽度
];
```

### 2. 处理长文本列
```typescript
const columns = [
  { 
    prop: 'content', 
    label: '内容', 
    minWidth: 300,
    showOverflowTooltip: true // 显示省略号和提示
  },
];
```

### 3. 保存和恢复列宽
```typescript
// 保存列宽
const saveColumnWidths = (widths) => {
  localStorage.setItem('table-column-widths', JSON.stringify(widths));
};

// 恢复列宽
const restoreColumnWidths = () => {
  const saved = localStorage.getItem('table-column-widths');
  return saved ? JSON.parse(saved) : {};
};
```

## 注意事项

1. **性能考虑**：大量数据时，频繁调整列宽可能影响性能
2. **移动端支持**：在移动设备上，列宽调整可能不够友好
3. **浏览器兼容性**：确保目标浏览器支持相关CSS属性

## 更新日志

- **v1.0.0**: 初始版本，支持基础列宽调整
- **v1.1.0**: 添加列宽持久化功能
- **v1.2.0**: 优化视觉反馈和用户体验
