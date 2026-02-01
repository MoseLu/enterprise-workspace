# BtcImportExportGroup 导入导出套装组件

一个封装了导入和导出功能的套装组件，自动处理文件名匹配，确保导入的文件名与导出的文件名一致。

## 特性

- ✅ **自动文件名匹配**：通过 provide/inject 机制，自动确保导入文件名与导出文件名一致
- ✅ **禁止关键词校验**：自动校验文件名中是否包含禁止的关键词（如 SysPro、BOM表等）
- ✅ **灵活配置**：支持自定义导入/导出列、提示文本、按钮样式等
- ✅ **插槽支持**：支持通过插槽自定义导入/导出按钮

## 基本用法

```vue
<template>
  <BtcMasterTableGroup>
    <template #add-btn>
      <BtcImportExportGroup
        :export-filename="t('menu.inventory.dataSource.list')"
        :forbidden-keywords="['SysPro', 'BOM表', '(', ')', '（', '）']"
        :import-columns="materialColumns"
        :export-columns="materialExportColumns"
        :on-import-submit="handleImport"
        :import-tips="t('inventory.dataSource.list.import.tips')"
      />
    </template>
  </BtcTableGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BtcImportExportGroup } from '@btc/shared-components';
import type { TableColumn } from '@btc/shared-components';

const materialColumns = computed<TableColumn[]>(() => [
  { prop: 'partName', label: '物料编码' },
  { prop: 'partQty', label: '数量' },
  { prop: 'position', label: '仓位' },
]);

const materialExportColumns = computed<TableColumn[]>(() => [
  { prop: 'partName', label: '物料编码' },
  { prop: 'partQty', label: '数量' },
  { prop: 'position', label: '仓位' },
]);

const handleImport = async (data: any, { done, close }: { done: () => void; close: () => void }) => {
  // 处理导入逻辑
  // ...
  close();
};
</script>
```

## Props

### 必填属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `exportFilename` | `string` | 导出文件名（必填，用于导出和导入文件名匹配） |

### 可选属性

#### 通用配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `forbiddenKeywords` | `string[]` | `['SysPro', 'BOM表', '(', ')', '（', '）']` | 禁止的文件名关键词 |
| `disabled` | `boolean` | `false` | 是否禁用所有按钮 |

#### 导入配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `importColumns` | `TableColumn[]` | - | 导入按钮的列配置（可选，如果不提供则从 CRUD 上下文获取） |
| `onImportSubmit` | `Function` | - | 导入提交处理函数 |
| `importTips` | `string` | - | 导入提示文本 |
| `importTemplate` | `string` | - | 导入模板下载地址 |
| `importLimitSize` | `number` | `10` | 导入文件大小限制（MB） |
| `importButtonType` | `string` | `'success'` | 导入按钮类型 |

#### 导出配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `exportColumns` | `TableColumn[]` | - | 导出按钮的列配置（可选，如果不提供则从 CRUD 上下文获取） |
| `exportData` | `any[]` | - | 导出数据（可选，如果不提供则从 CRUD 上下文获取） |
| `exportAutoWidth` | `boolean` | `true` | 导出是否自动列宽 |
| `exportBookType` | `'xlsx' \| 'xls'` | `'xlsx'` | 导出文件类型 |
| `exportMaxLimit` | `number` | - | 导出最大条数限制 |
| `exportButtonText` | `string` | - | 导出按钮文本 |
| `exportButtonVariant` | `'button' \| 'icon'` | `'button'` | 导出按钮渲染模式 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `import-change` | `data: any[]` | 导入数据变更时触发 |
| `filename-validate` | `isValid: boolean` | 文件名校验结果变更时触发 |

## Slots

| 插槽名 | 说明 |
|--------|------|
| `import` | 自定义导入按钮 |
| `export` | 自定义导出按钮 |

## 工作原理

1. **文件名匹配**：组件内部使用 `provide` 提供 `exportFilename` 和 `forbiddenKeywords`，`BtcImportBtn` 通过 `inject` 获取这些值进行文件名校验。

2. **自动校验**：当用户上传文件时，`BtcImportBtn` 会自动校验：
   - 文件名是否与导出文件名一致（允许添加数字/下划线后缀，如 `文件名_2025.xlsx`）
   - 文件名是否包含禁止的关键词

3. **灵活使用**：如果只需要导入或导出功能，可以通过插槽替换对应的按钮。

## 完整示例

```vue
<template>
  <div class="inventory-page">
    <BtcMasterTableGroup>
      <template #add-btn>
        <BtcImportExportGroup
          :export-filename="exportFilename"
          :forbidden-keywords="['SysPro', 'BOM表', '(', ')', '（', '）']"
          :import-columns="columns"
          :export-columns="exportColumns"
          :on-import-submit="handleImport"
          :import-tips="t('inventory.dataSource.list.import.tips')"
          @import-change="handleImportChange"
          @filename-validate="handleFilenameValidate"
        />
      </template>
    </BtcTableGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcImportExportGroup } from '@btc/shared-components';
import type { TableColumn } from '@btc/shared-components';

const { t } = useI18n();

const exportFilename = computed(() => t('menu.inventory.dataSource.list'));

const columns = computed<TableColumn[]>(() => [
  { prop: 'partName', label: '物料编码' },
  { prop: 'partQty', label: '数量' },
]);

const exportColumns = computed<TableColumn[]>(() => [
  { prop: 'partName', label: '物料编码' },
  { prop: 'partQty', label: '数量' },
]);

const handleImport = async (data: any, { done, close }: { done: () => void; close: () => void }) => {
  try {
    // 处理导入逻辑
    // ...
    close();
  } catch (error) {
    done();
  }
};

const handleImportChange = (data: any[]) => {
  console.log('导入数据变更:', data);
};

const handleFilenameValidate = (isValid: boolean) => {
  console.log('文件名校验结果:', isValid);
};
</script>
```

