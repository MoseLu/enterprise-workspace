---
title: Excel 导出插件
type: package
project: plugins
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- packages
- plugins
- excel
sidebar_label: Excel插件
sidebar_order: 13
sidebar_group: packages
---
# Excel 导出插件

基于 `xlsx` (SheetJS) 和 `file-saver` 的 Excel 导出工具

## 安装依赖

```bash
pnpm add xlsx file-saver
pnpm add -D @types/file-saver
```

## 基本使用

```typescript
import { exportJsonToExcel } from '@btc/shared-core';

// 导出数据
exportJsonToExcel({
header: ['姓名', '年龄', '邮箱'],
data: [
['张三', 25, 'zhangsan@example.com'],
['李四', 30, 'lisi@example.com'],
],
filename: '用户数据',
});
```

## API

### `exportJsonToExcel(options)`

#### 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `header` | `string[]` | ? | - | 表头 |
| `data` | `any[][]` | ? | - | 数据（二维数组） |
| `filename` | `string` | ? | `'excel-export'` | 文件名（不含扩展名） |
| `autoWidth` | `boolean` | ? | `true` | 是否自动调整列宽 |
| `bookType` | `XLSX.BookType` | ? | `'xlsx'` | 文件类型 |
| `multiHeader` | `string[][]` | ? | `[]` | 多级表头 |
| `merges` | `string[]` | ? | `[]` | 合并单元格配置 |

## 示例

### 1. 基础导出

```typescript
exportJsonToExcel({
header: ['用户名', '姓名', '邮箱', '状态'],
data: users.map(user => [
user.username,
user.name,
user.email,
user.status === 1 ? '正常' : '禁用',
]),
filename: `用户数据_${Date.now()}`,
});
```

### 2. 多级表头

```typescript
exportJsonToExcel({
multiHeader: [
['用户信息', '', '', '联系信息', ''],
['基本', '', '', '邮箱', '电话'],
],
header: ['ID', '姓名', '年龄', '邮箱', '电话'],
data: [[1, '张三', 25, 'zhang@example.com', '13800138000']],
merges: ['A1:C1', 'D1:E1'], // 合并第一行单元格
filename: '用户详细信息',
});
```

### 3. 自定义列宽

```typescript
exportJsonToExcel({
header: ['姓名', '备注'],
data: [
['张三', '这是一段很长的备注信息...'],
],
autoWidth: true, // 自动根据内容调整列宽（支持中文）
filename: '数据',
});
```

### 4. 导出为 CSV

```typescript
exportJsonToExcel({
header: ['姓名', '年龄'],
data: [['张三', 25]],
filename: '数据',
bookType: 'csv', // 导出为 CSV 格式
});
```

## 在 CRUD 中使用

```vue
<script setup lang="ts">
import { exportJsonToExcel, useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';

const { t } = useI18n();

const handleExport = () => {
const selection = crudRef.value?.crud.selection.value || [];
const dataToExport = selection.length > 0 ? selection : allData;

// 表头（国际化）
const header = [
t('user.field.username'),
t('user.field.name'),
t('user.field.email'),
t('user.field.status'),
];

// 数据转换
const data = dataToExport.map(user => [
user.username,
user.name,
user.email,
user.status === 1 ? t('user.status.active') : t('user.status.inactive'),
]);

// 导出
exportJsonToExcel({
header,
data,
filename: `用户数据_${new Date().toISOString().split('T')[0]}`,
autoWidth: true,
});

BtcMessage.success(`已导出 ${dataToExport.length} 条数据`);
};
</script>
```

## 特性

? **自动列宽** - 根据内容（支持中文）自动调整列宽
? **多级表头** - 支持复杂的表头结构
? **单元格合并** - 支持合并单元格
? **多种格式** - 支持 xlsxcsvxls 等格式
? **中文支持** - 完美支持中文字符
? **TypeScript** - 完整的类型定义

## 对比 CSV 导出

| 特性 | Excel (xlsx) | CSV |
|------|--------------|-----|
| 文件大小 | 稍大 | 小 |
| 格式保留 | ? 保留格式 | ? 纯文本 |
| 多级表头 | ? 支持 | ? 不支持 |
| 单元格合并 | ? 支持 | ? 不支持 |
| 自动列宽 | ? 支持 | ? 不支持 |
| 兼容性 | Excel/WPS | 所有表格软件 |

## 注意事项

1. 大数据导出（>10000 行）可能会影响性能，建议分批导出
2. 导出的文件会直接下载到用户的下载目录
3. 文件名会自动添加扩展名，不需要手动添加 `.xlsx`
4. 中文文件名在某些浏览器中可能被转码，这是正常的

