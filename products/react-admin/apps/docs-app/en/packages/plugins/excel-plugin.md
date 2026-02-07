---
title: Excel Export Plugin
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
sidebar_label: Excel Plugin
sidebar_order: 13
sidebar_group: packages
---
# Excel Export Plugin

Excel export tool based on `xlsx` (SheetJS) and `file-saver`

## Install Dependencies

```bash
pnpm add xlsx file-saver
pnpm add -D @types/file-saver
```

## Basic Usage

```typescript
import { exportJsonToExcel } from '@btc/shared-core';

// Export data
exportJsonToExcel({
header: ['Name', 'Age', 'Email'],
data: [
['John', 25, 'john@example.com'],
['Jane', 30, 'jane@example.com'],
],
filename: 'User Data',
});
```

## API

### `exportJsonToExcel(options)`

#### Parameters

| Parameter | Type | Required | Default | Description |
|------|------|------|--------|------|
| `header` | `string[]` | ? | - | Table header |
| `data` | `any[][]` | ? | - | Data (2D array) |
| `filename` | `string` | ? | `'excel-export'` | Filename (without extension) |
| `autoWidth` | `boolean` | ? | `true` | Whether to auto-adjust column width |
| `bookType` | `XLSX.BookType` | ? | `'xlsx'` | File type |
| `multiHeader` | `string[][]` | ? | `[]` | Multi-level headers |
| `merges` | `string[]` | ? | `[]` | Cell merge configuration |

## Examples

### 1. Basic Export

```typescript
exportJsonToExcel({
header: ['Username', 'Name', 'Email', 'Status'],
data: users.map(user => [
user.username,
user.name,
user.email,
user.status === 1 ? 'Active' : 'Inactive',
]),
filename: `User Data_${Date.now()}`,
});
```

### 2. Multi-level Headers

```typescript
exportJsonToExcel({
multiHeader: [
['User Info', '', '', 'Contact Info', ''],
['Basic', '', '', 'Email', 'Phone'],
],
header: ['ID', 'Name', 'Age', 'Email', 'Phone'],
data: [[1, 'John', 25, 'john@example.com', '13800138000']],
merges: ['A1:C1', 'D1:E1'], // Merge first row cells
filename: 'User Details',
});
```

### 3. Custom Column Width

```typescript
exportJsonToExcel({
header: ['Name', 'Remarks'],
data: [
['John', 'This is a very long remark...'],
],
autoWidth: true, // Auto-adjust column width based on content (supports Chinese)
filename: 'Data',
});
```

### 4. Export as CSV

```typescript
exportJsonToExcel({
header: ['Name', 'Age'],
data: [['John', 25]],
filename: 'Data',
bookType: 'csv', // Export as CSV format
});
```

## Usage in CRUD

```vue
<script setup lang="ts">
import { exportJsonToExcel, useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';

const { t } = useI18n();

const handleExport = () => {
const selection = crudRef.value?.crud.selection.value || [];
const dataToExport = selection.length > 0 ? selection : allData;

// Headers (internationalized)
const header = [
t('user.field.username'),
t('user.field.name'),
t('user.field.email'),
t('user.field.status'),
];

// Data transformation
const data = dataToExport.map(user => [
user.username,
user.name,
user.email,
user.status === 1 ? t('user.status.active') : t('user.status.inactive'),
]);

// Export
exportJsonToExcel({
header,
data,
filename: `User Data_${new Date().toISOString().split('T')[0]}`,
autoWidth: true,
});

BtcMessage.success(`Exported ${dataToExport.length} records`);
};
</script>
```

## Features

✅ **Auto Column Width** - Auto-adjust column width based on content (supports Chinese)
✅ **Multi-level Headers** - Supports complex header structures
✅ **Cell Merging** - Supports cell merging
✅ **Multiple Formats** - Supports xlsx, csv, xls and other formats
✅ **Chinese Support** - Perfect support for Chinese characters
✅ **TypeScript** - Complete type definitions

## Comparison with CSV Export

| Feature | Excel (xlsx) | CSV |
|------|--------------|-----|
| File Size | Slightly larger | Small |
| Format Retention | ✅ Retains format | ❌ Plain text |
| Multi-level Headers | ✅ Supported | ❌ Not supported |
| Cell Merging | ✅ Supported | ❌ Not supported |
| Auto Column Width | ✅ Supported | ❌ Not supported |
| Compatibility | Excel/WPS | All spreadsheet software |

## Notes

1. Large data export (>10000 rows) may affect performance, recommend batch export
2. Exported files will be directly downloaded to user's download directory
3. Filename will automatically add extension, no need to manually add `.xlsx`
4. Chinese filenames may be encoded in some browsers, this is normal
