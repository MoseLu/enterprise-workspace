---
title: Quick Start
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- guides
- getting-started
sidebar_label: Quick Start
sidebar_order: 2
sidebar_group: guides
---

# Quick Start

This guide will help you quickly get started with BTC component library development.

## Environment Requirements

- Node.js >= 16.0.0
- pnpm >= 7.0.0
- Vue 3.0+
- TypeScript 4.0+

## Installation and Startup

### 1. Clone Project

```bash
git clone <repository-url>
cd btc-shopflow
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development Server

```bash
# Start main application
pnpm dev:main

# Start documentation application
pnpm dev:docs
```

## First Component

Create a simple CRUD page:

```vue
<template>
  <BtcCrud
    :api="userApi"
    :columns="userColumns"
    :form-schema="userFormSchema"
  />
</template>

<script setup lang="ts">
import { BtcCrud } from '@btc/shared-components';

// API configuration
const userApi = {
  list: (params) => fetch('/api/users', { params }),
  add: (data) => fetch('/api/users', { method: 'POST', body: data }),
  update: (id, data) => fetch(`/api/users/${id}`, { method: 'PUT', body: data }),
  remove: (id) => fetch(`/api/users/${id}`, { method: 'DELETE' }),
};

// Table column configuration
const userColumns = [
  { label: 'ID', prop: 'id', width: 80 },
  { label: 'Name', prop: 'name', searchable: true },
  { label: 'Email', prop: 'email', searchable: true },
  { label: 'Status', prop: 'status', type: 'select', options: [
    { label: 'Enabled', value: 1 },
    { label: 'Disabled', value: 0 }
  ]},
  { label: 'Actions', type: 'action', actions: ['edit', 'delete'] },
];

// Form configuration
const userFormSchema = {
  name: { label: 'Name', type: 'input', rules: [{ required: true }] },
  email: { label: 'Email', type: 'input', rules: [{ type: 'email' }] },
  status: { label: 'Status', type: 'radio', options: [
    { label: 'Enabled', value: 1 },
    { label: 'Disabled', value: 0 }
  ]},
};
</script>
```

## Next Steps

- [Component Development](/en/guides/components/) - Deep dive into component development standards
- [Form Processing](/en/guides/forms/) - Learn form design and validation
- [System Configuration](/en/guides/system/) - Configure development environment

---

## Common Questions

**Q: How to customize theme?**
A: Refer to the theme customization section in [System Configuration](/en/guides/system/)

**Q: How to add new components?**
A: Refer to component development standards in [Component Development](/en/guides/components/)

**Q: How to configure internationalization?**
A: Refer to internationalization configuration section in [System Configuration](/en/guides/system/)
