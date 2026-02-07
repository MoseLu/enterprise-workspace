---
title: Component Package Documentation
type: package
project: components
owner: dev-team
created: 2025-10-13
updated: 2025-01-27
publish: true
tags:
- packages
- components
sidebar_label: Component Package
sidebar_order: 1
sidebar_group: packages
---

# @btc/shared-components

BTC shared component library providing reusable Vue components for all applications in the project.

## 📦 Installation

```bash
pnpm add @btc/shared-components
```

## 🚀 Quick Start

```typescript
import { BtcCrud, BtcForm, BtcDialog } from '@btc/shared-components';
```

## 📚 Component List

### Common Components

#### Base Components
- **BtcButton** - Button component
- **BtcSvg** - SVG icon component providing unified icon management
- **BtcContainer** - Container component providing unified layout container
  - 📄 [Documentation](../../../packages/shared-components/src/common/container/README.md)

#### Form Components
- **BtcForm** - Form component supporting complex form scenarios and validation
- **BtcFormCard** - Form card component for form grouping
- **BtcFormTabs** - Form tabs component for form pagination
- **BtcSearch** - Search component for quick search functionality
  - 📄 [Documentation](../../../packages/shared-components/src/common/search/README.md)

#### Layout Components
- **BtcViewGroup** - View group component supporting multiple view modes
- **BtcGridGroup** - Grid group component for grid layouts
  - 📄 [Documentation](../../../packages/shared-components/src/common/grid-group/README.md)
- **BtcSelectButton** - Select button component

#### Interactive Components
- **BtcDialog** - Dialog and modal component supporting multiple interaction modes

### Business Components

- **BtcMasterList** - General master list component for handling master-detail relationship scenarios (e.g., department-user, role-permission, etc.)
  - 📄 [Documentation](../../../packages/shared-components/src/components/btc-master-list/README.md)
- **BtcCard** - Card component
- **BtcTabs** - Tabs component
- **BtcViewsTabsGroup** - View tabs group component supporting tab switching for multiple views
  - 📄 [Documentation](../../../packages/shared-components/src/components/btc-views-tabs-group/README.md)
- **BtcCascader** - Cascader component
  - 📄 [Documentation](../../../packages/shared-components/src/components/btc-cascader/README.md)
- **BtcMasterTableGroup** - Master list table group component, left MasterList + right CRUD table
  - 📄 [Documentation](../../../packages/shared-components/src/components/data/btc-master-table-group/README.md)
- **BtcDoubleGroup** - Double column group component providing double left sidebar + CRUD linkage
  - 📄 [Documentation](../../../packages/shared-components/src/components/btc-double-group/README.md)
- **BtcMessage** - Message notification component (global API)
  - 📄 [Documentation](../../../packages/shared-components/src/components/btc-message/README.md)
- **BtcNotification** - Notification component (global API)
  - 📄 [Documentation](../../../packages/shared-components/src/components/btc-notification/README.md)
- **BtcUpload** - File upload component (requires separate import)

### CRUD Components

The CRUD system provides a complete data operation solution:

#### Core Components
- **BtcCrud** - CRUD context component providing global state management
- **BtcTable** - Data table component supporting sorting, filtering, pagination, etc.
  - 📄 [Documentation](../../../packages/shared-components/src/crud/table/README.md)
- **BtcUpsert** - Create/Edit component providing unified data operation interface

#### Auxiliary Components
- **BtcPagination** - Pagination component
- **BtcAddBtn** - Add button
- **BtcRefreshBtn** - Refresh button
- **BtcMultiDeleteBtn** - Batch delete button
- **BtcCrudRow** - Row component
- **BtcCrudFlex1** - Flex layout component
- **BtcCrudSearchKey** - Search keyword component
- **BtcMenuExp** - Menu expand component

### Chart Components

Chart components based on ECharts:

- **BtcLineChart** - Line chart component
- **BtcBarChart** - Bar chart component
- **BtcPieChart** - Pie chart component

```typescript
import { BtcLineChart, BtcBarChart, BtcPieChart } from '@btc/shared-components';
```

### Plugin System

#### Excel Plugin
Provides Excel import/export functionality:
- **BtcExportBtn** - Export button component
- **BtcImportBtn** - Import button component

```typescript
import { ExcelPlugin, BtcExportBtn, BtcImportBtn } from '@btc/shared-components';
```

#### Code Plugin
Provides code display functionality:
- **BtcCodeJson** - JSON code display component

```typescript
import { CodePlugin, BtcCodeJson } from '@btc/shared-components';
```

## 📖 Detailed Documentation

Each component has corresponding README documentation located in the component directory. Main component documentation:

- [BtcTable Documentation](../../../packages/shared-components/src/crud/table/README.md) - Data table component
- [BtcMasterList Documentation](../../../packages/shared-components/src/components/btc-master-list/README.md) - Master list component
- [BtcContainer Documentation](../../../packages/shared-components/src/common/container/README.md) - Container component
- [BtcSearch Documentation](../../../packages/shared-components/src/common/search/README.md) - Search component
- [BtcGridGroup Documentation](../../../packages/shared-components/src/common/grid-group/README.md) - Grid group component
- [BtcViewsTabsGroup Documentation](../../../packages/shared-components/src/components/btc-views-tabs-group/README.md) - View tabs group component
- [BtcMasterTableGroup Documentation](../../../packages/shared-components/src/components/data/btc-master-table-group/README.md) - Master list table group component
- [BtcDoubleGroup Documentation](../../../packages/shared-components/src/components/btc-double-group/README.md) - Double column group component
- [BtcCascader Documentation](../../../packages/shared-components/src/components/btc-cascader/README.md) - Cascader component
- [BtcMessage Documentation](../../../packages/shared-components/src/components/btc-message/README.md) - Message notification component
- [BtcNotification Documentation](../../../packages/shared-components/src/components/btc-notification/README.md) - Notification component

## 🔧 Usage Examples

### Complete CRUD Example

```vue
<template>
  <BtcCrud :service="userService">
    <template #table>
      <BtcTable :columns="columns" />
    </template>
    <template #upsert>
      <BtcUpsert :items="formItems" />
    </template>
  </BtcCrud>
</template>

<script setup lang="ts">
import { BtcCrud, BtcTable, BtcUpsert } from '@btc/shared-components';
import { createCrudService } from '@btc/shared-core';

const userService = createCrudService('user');
const columns = [/* ... */];
const formItems = [/* ... */];
</script>
```

### Form Example

```vue
<template>
  <BtcForm :items="formItems" :model="formData" @submit="handleSubmit" />
</template>

<script setup lang="ts">
import { BtcForm } from '@btc/shared-components';
</script>
```

### Dialog Example

```vue
<template>
  <BtcDialog v-model="visible" title="Edit User">
    <!-- Dialog content -->
  </BtcDialog>
</template>

<script setup lang="ts">
import { BtcDialog } from '@btc/shared-components';
</script>
```

### Chart Example

```vue
<template>
  <BtcLineChart :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { BtcLineChart } from '@btc/shared-components';
</script>
```

## 🎨 Design Philosophy

### 1. Consistency
- Unified visual design language
- Consistent interaction patterns
- Standardized API design

### 2. Extensibility
- Flexible configuration options
- Rich customization capabilities
- Plugin-based extension mechanism

### 3. Usability
- Simple API design
- Complete documentation
- Rich usage examples

## 🏗️ Architecture Features

### Based on Element Plus
- Inherits Element Plus design language
- Extends Element Plus functionality
- Maintains API consistency

### TypeScript Support
- Complete type definitions
- Intelligent code suggestions
- Compile-time type checking

### Responsive Design
- Mobile support
- Flexible layout system
- Adaptive component sizes

## 📦 Exports

### Component Exports
All components are exported from the main entry:

```typescript
import {
  // Common components
  BtcButton,
  BtcSvg,
  BtcDialog,
  BtcViewGroup,
  BtcForm,
  BtcFormCard,
  BtcFormTabs,
  BtcSelectButton,
  BtcContainer,
  BtcGridGroup,
  BtcSearch,
  
  // Business components
  BtcMasterList,
  BtcCard,
  BtcTabs,
  BtcViewsTabsGroup,
  BtcCascader,
  BtcMasterTableGroup,
  BtcMessage,
  BtcNotification,
  
  // CRUD components
  BtcCrud,
  BtcTable,
  BtcUpsert,
  BtcPagination,
  BtcAddBtn,
  BtcRefreshBtn,
  BtcMultiDeleteBtn,
  BtcCrudRow,
  BtcCrudFlex1,
  BtcCrudSearchKey,
  BtcMenuExp,
  
  // Chart components
  BtcLineChart,
  BtcBarChart,
  BtcPieChart,
  
  // Plugin components
  BtcExportBtn,
  BtcImportBtn,
  BtcCodeJson,
  
  // Plugin objects
  ExcelPlugin,
  CodePlugin,
} from '@btc/shared-components';
```

### Utility Function Exports

```typescript
import { CommonColumns } from '@btc/shared-components';
```

### Type Exports

```typescript
import type {
  TableColumn,
  OpButton,
  FormItem,
  UpsertPlugin,
  UpsertProps,
  DialogProps,
  BtcFormItem,
  BtcFormConfig,
  BtcFormProps,
  BtcViewsTabsGroupConfig,
  TabViewConfig,
  TableGroupProps,
  TableGroupEmits,
  TableGroupExpose,
  BtcContainerProps,
  BtcGridGroupProps,
} from '@btc/shared-components';
```

### Locale Exports

```typescript
import {
  sharedLocalesZhCN,
  sharedLocalesEnUS,
} from '@btc/shared-components';
```

## 🔗 Related Dependencies

- `@btc/shared-core` - Core business logic
- `@btc/shared-utils` - Utility function library
- `element-plus` - UI component library
- `vue` - Vue framework
- `echarts` - Chart library
- `vue-echarts` - Vue ECharts wrapper

## 📝 Development Standards

- All components are named with `btc-` prefix
- Each component should include complete TypeScript type definitions
- Components should support dark mode
- Styles should use global style files, avoid inline styles
- New components need corresponding README documentation

## 🤝 Contributing

Contributions are welcome! Please follow the project's development standards and code style.

## 📄 License

[MIT](../../../packages/shared-components/LICENSE)
