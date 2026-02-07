---
title: 'BTC Shared Utils Library'
type: package
project: utils
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- packages
- utils
- shared-utils
sidebar_label: Shared Utils
sidebar_order: 11
sidebar_group: packages
---
# BTC Shared Utils Library

> **Version**: 1.0.0
> **Type**: Utility Function Library
> **Purpose**: Cross-application shared pure function utilities

---

## Contents

### Utility Functions

| Function | Description | Use Cases |
|------|------|---------|
| `storage` | Local storage wrapper | localStorage/sessionStorage |
| `formHook` | Form data transformation | Form submit/binding |
| `http` | HTTP request wrapper | API calls |
| `date` | Date utilities | Date formatting |
| `tree` | Tree data processing | Menu/organization tree |

---

## Quick Start

### Installation

```bash
pnpm add @btc/shared-utils
```

### Usage

#### Storage

```typescript
import { storage } from '@btc/shared-utils';

// Save data
storage.set('user', { name: 'John' });

// Read data
const user = storage.get('user');

// Remove data
storage.remove('user');

// Clear all
storage.clear();
```

#### Form Hook

```typescript
import { formHook } from '@btc/shared-utils';

// Number conversion
formHook.bind({ prop: 'age', value: '18', hook: 'number' });
// value becomes: 18 (number)

// Split string
formHook.bind({ prop: 'tags', value: 'a,b,c', hook: 'split' });
// value becomes: ['a', 'b', 'c']

// Date range
formHook.submit({ prop: 'dateRange', value: [start, end], hook: 'datetimeRange' });
// value becomes: { startTime: 'xxx', endTime: 'xxx' }
```

#### HTTP

```typescript
import { http } from '@btc/shared-utils';

// GET request
const data = await http.get('/api/users');

// POST request
await http.post('/api/users', { name: 'John' });

// PUT request
await http.put('/api/users/1', { name: 'Jane' });

// DELETE request
await http.delete('/api/users/1');
```

---

## API Documentation

### storage

```typescript
interface Storage {
get<T>(key: string): T | null;
set<T>(key: string, value: T, ttl?: number): void;
remove(key: string): void;
clear(): void;
}
```

### formHook

```typescript
interface FormHook {
bind(options: HookOptions): any;
submit(options: HookOptions): any;
}

// Supported transformation types
type HookType =
| 'number' // string → number
| 'string' // any → string
| 'split' // string → array
| 'join' // array → string
| 'boolean' // any → boolean
| 'datetimeRange' // [Date, Date] → {startTime, endTime}
| 'json' // object → JSON string
| 'empty'; // null/undefined → undefined
```

### http

```typescript
interface Http {
get<T>(url: string, params?: any): Promise<T>;
post<T>(url: string, data?: any): Promise<T>;
put<T>(url: string, data?: any): Promise<T>;
delete<T>(url: string): Promise<T>;
}
```

---

## Development

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

---

## License

MIT
