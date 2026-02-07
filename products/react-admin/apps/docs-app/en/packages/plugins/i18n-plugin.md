---
title: i18n Plugin Usage Guide
type: package
project: plugins
owner: dev-team
created: '2025-10-09'
updated: '2025-10-13'
publish: true
tags:
  - packages
  - plugins
  - i18n
sidebar_label: i18n Plugin
sidebar_order: 14
sidebar_group: packages
---

# i18n Plugin Usage Guide

## Language Code Standards

**Important**: This project strictly uses standard language code format:

- ✅ **Supported Languages**: `zh-CN` (Simplified Chinese), `en-US` (American English)
- ❌ **Unsupported Aliases**: `zh`, `en`, `zh_CN`, `zh_cn` and other formats

All language pack files, configurations, and code must use `zh-CN` or `en-US` format.

## i18n Architecture in Micro Frontend

### Architecture Pattern: Independent + Synchronized

Each application (main app and sub-apps) has its own i18n instance, synchronized through qiankun GlobalState for language switching

## Usage Examples

### 1. Main Application (admin-app)

```typescript
// admin-app/src/main.ts
import { createI18nPlugin } from '@btc/shared-core';
import { initGlobalState } from 'qiankun';

// Create main app's i18n
const i18nPlugin = createI18nPlugin({
  loadFromApi: true,
  apiUrl: '/api/admin/i18n/messages',
  scope: 'common', // Load common translations
  messages: {
    'zh-CN': {
      main: { title: 'BTC Micro Frontend System' },
    },
  },
});

app.use(i18nPlugin);

// Initialize qiankun global state
const actions = initGlobalState({
  locale: i18nPlugin.i18n.global.locale.value,
});

// Listen to language switch, sync to sub-apps
watch(i18nPlugin.i18n.global.locale, (newLocale) => {
  actions.setGlobalState({ locale: newLocale });
});
```

### 2. Sub Application (logistics-app)

```typescript
// logistics-app/src/main.ts
import { createI18nPlugin } from '@btc/shared-core';

let i18nInstance: any = null;

export async function mount(props: any) {
  const { container, onGlobalStateChange } = props;

  // Create logistics app's i18n (independent instance)
  const i18nPlugin = createI18nPlugin({
    loadFromApi: true,
    apiUrl: '/api/admin/i18n/messages',
    scope: 'logistics', // Load logistics domain translations
    messages: {
      'zh-CN': {
        logistics: {
          order: 'Order',
          warehouse: 'Warehouse',
          procurement: 'Procurement',
          inbound: 'Inbound',
          outbound: 'Outbound',
        },
      },
      'en-US': {
        logistics: {
          order: 'Order',
          warehouse: 'Warehouse',
          procurement: 'Procurement',
          inbound: 'Inbound',
          outbound: 'Outbound',
        },
      },
    },
  });

  i18nInstance = i18nPlugin.i18n;
  app.use(i18nPlugin);

  // Listen to main app's language switch
  onGlobalStateChange?.((state: any) => {
    if (state.locale && state.locale !== i18nInstance.global.locale.value) {
      i18nInstance.global.locale.value = state.locale;
    }
  }, true);

  app.mount(container);
}
```

### 3. Sub Application (production-app)

```typescript
// production-app/src/main.ts
const i18nPlugin = createI18nPlugin({
  loadFromApi: true,
  apiUrl: '/api/admin/i18n/messages',
  scope: 'production', // Load production domain translations
  messages: {
    'zh-CN': {
      production: {
        plan: 'Production Plan',
        schedule: 'Schedule',
        material: 'Material',
        workstation: 'Workstation',
      },
    },
  },
});
```

## Workflow

### First Visit

```
1. Main app initialization
Local language pack (zh-CN.ts) immediately displayed
API: /api/admin/i18n/messages?locale=zh-CN&scope=common
Cache: i18n_common_zh-CN

2. User clicks "Logistics Management"
Load logistics-app
Local language pack + logistics custom
API: /api/admin/i18n/messages?locale=zh-CN&scope=logistics
Cache: i18n_logistics_zh-CN

3. User switches to "Production Management"
Load production-app
API: /api/admin/i18n/messages?locale=zh-CN&scope=production
Cache: i18n_production_zh-CN
```

### Language Switch

```
1. User switches language in main app (zh-CN en-US)

2. Main app
i18n.global.locale = 'en-US'
setGlobalState({ locale: 'en-US' })
API: /api/admin/i18n/messages?locale=en-US&scope=common

3. Currently active sub-app (logistics-app)
Listens to GlobalState change
i18n.global.locale = 'en-US'
API: /api/admin/i18n/messages?locale=en-US&scope=logistics
```

## Backend API Design

### API Specification

```
GET /api/admin/i18n/messages?locale={locale}&scope={scope}
```

**Parameters**:

- `locale`: zh-CN | en-US | ja-JP
- `scope`: common | logistics | production | warehouse

**Response**:

```json
{
  "code": 2000,
  "msg": "Operation successful",
  "data": {
    "currentLanguage": "zh_CN",
    "currentLocale": "zh_CN",
    "messages": {
      "button.add.new": "Add",
      "sys.menu.update.success": "Menu updated successfully",
      "logistics.order.create": "Create Order",
      "logistics.warehouse.select": "Select Warehouse"
    }
  }
}
```

### Backend Table Design Example

```sql
CREATE TABLE sys_i18n (
id BIGINT PRIMARY KEY,
i18n_key VARCHAR(200), -- e.g.: logistics.order.create
locale VARCHAR(10), -- e.g.: zh_CN
value TEXT, -- e.g.: Create Order
scope VARCHAR(50), -- e.g.: logistics
INDEX idx_locale_scope (locale, scope)
);
```

## Caching Strategy

### localStorage Cache Structure

```javascript
localStorage:
i18n_common_zh-CN: { "button.save": "Save", ... }
i18n_common_en-US: { "button.save": "Save", ... }
i18n_logistics_zh-CN: { "logistics.order": "Order", ... }
i18n_logistics_en-US: { "logistics.order": "Order", ... }
i18n_production_zh-CN: { "production.plan": "Plan", ... }
locale: "zh-CN"  // Must use zh-CN or en-US format
```

**Advantages**:

- Domain-separated cache, no interference
- Common translations (common) shared by all apps
- Domain-level translations loaded on demand
- 1 day expiration, auto-update

## Data Flow Diagram

```
Main App (admin-app)
i18n: scope=common
GlobalState: { locale: 'zh-CN' }

Language Switch

logistics-app production-app warehouse-app
scope=logistics scope=production scope=warehouse
Listen GlobalState Listen GlobalState Listen GlobalState

Independent i18n Independent i18n Independent i18n
```

## Best Practices

### DO

- Each app independently creates i18n instance
- Use scope to isolate domain-level translations
- Sync language through GlobalState
- Cache stored by domain

### DON'T

- Don't share i18n instance (too coupled)
- Don't modify main app's language in sub-apps
- Don't load all domain translations in full

---

**Summary**: Each app is independent but coordinated, synchronized through GlobalState, isolated through scope!
