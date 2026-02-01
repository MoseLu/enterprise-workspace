---
title: Fix SVG Plugin Double Hyphen Bug
type: adr
project: technical
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- adr
- technical
- svg
- plugin
sidebar_label: SVG Plugin Fix
sidebar_order: 1
sidebar_group: adr-technical
---

# ADR: Fix SVG Plugin Double Hyphen Bug

> **Status**: Accepted  
> **Date**: 2025-10-11  
> **Decision Maker**: Development Team  
> **Impact Scope**: SVG icon system and build tools  

---

## Context
SVG plugin, when scanning `src/assets/icons/` directory, generated symbol IDs with double hyphens (`icon--lang`), causing btc-svg component lookup failure (looking for `icon-lang`).

Root cause:
- Plugin, when scanning non-module directories, `moduleName` is empty string
- Concatenation logic: `moduleName + '-' + baseName` → `'' + '-' + 'lang'` → `'-lang'`
- Final generated ID: `icon-` + `-lang` = `icon--lang`

## Options
- **Option A: Modify btc-svg component lookup logic**
- Pros: Don't change plugin
- Cons: Violates intuition, IDs shouldn't have double hyphens

- **Option B: Fix plugin concatenation logic**
- Pros: Solve from root, ID naming standardized
- Cons: Need to rebuild plugin

- **Option C: Skip empty directory scanning**
- Pros: Simple
- Cons: Cannot use assets/icons directory

## Decision
Adopt **Option B: Fix plugin concatenation logic**

Add check in `packages/vite-plugin/src/svg/index.ts`:
```typescript
// If moduleName is empty, skip concatenation
if (!moduleName) {
  shouldSkip = true;
}
```

This way:
- `moduleName` is empty → `shouldSkip = true` → `iconName = baseName`
- Generated ID: `icon-` + `lang` = `icon-lang`

## Consequences
**Positive Impact**:
- Symbol ID naming standardized, no double hyphens
- Consistent with btc-svg component lookup logic
- Good extensibility, future new icon directories will work normally

**Negative Impact/Notes**:
- Need to rebuild plugin package: `pnpm --filter @btc/vite-plugin build`
- Need to restart application to take effect

**Action Items**:
- [x] Modify plugin code
- [x] Rebuild plugin
- [x] Verify icons display normally
