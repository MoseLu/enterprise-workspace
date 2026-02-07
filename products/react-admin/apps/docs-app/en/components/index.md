---
title: Component Documentation
type: guide
project: components
owner: dev-team
created: 2025-10-13
updated: 2025-10-13
publish: true
tags:
- components
sidebar_label: Component Documentation
sidebar_order: 1
sidebar_group: components
---

# Component Overview

BTC component library is built on Element Plus, providing complete CRUD, forms, layouts, and other business components.

<ClientOnly>
<ComponentOverview />
</ClientOnly>

---

## Design Philosophy

- **Declarative First**: Driven by configuration to reduce boilerplate code
- **Type Safety**: Complete TypeScript type support
- **Auto Import**: Automatic import via unplugin-vue-components
- **Consistent Style**: Maintains consistency with cool-admin-vue design

---

## Quick Start

### Auto Import

All BTC components support auto import, no manual import needed:

```vue
<template>
<!-- Use directly without import -->
<BtcCrud ref="crudRef">
<BtcTable />
<BtcUpsert />
</BtcCrud>
</template>

<script setup lang="ts">
// No import needed, auto import is configured
const crudRef = ref();
</script>
```

### Manual Import (Optional)

If you need explicit import:

```typescript
import { BtcCrud, BtcTable, BtcUpsert } from '@btc/shared-components';
```

---

## Usage Guide

### CRUD Page Development Workflow

1. **Create page component**
2. **Wrap with BtcCrud**
3. **Configure BtcTable for list display**
4. **Configure BtcUpsert for edit form**
5. **Done! Automatically has CRUD functionality**

### Component Selection Guide

| Scenario | Recommended Component |
|------|---------|
| Data list (CRUD) | BtcCrud + BtcTable + BtcUpsert |
| Standalone form | BtcForm |
| Enhanced dialog | BtcDialog |
| Left tree right table layout | BtcViewGroup |
| Regular dialog | el-dialog |

---

## Tips

::: tip Recommended Reading Order
1. First read [BTC CRUD](../packages/components/btc-crud.md) to understand the CRUD system
2. Then read [BtcUpsert](../packages/components/btc-upsert.md) and [BtcDialog](../packages/components/btc-dialog.md)
3. Finally check other components as needed
:::

::: warning Notes
- BtcUpsert must be used inside BtcCrud
- BtcForm is for standalone forms in non-CRUD scenarios
- Layout components are already integrated in the main application, sub-applications don't need to use them
:::
