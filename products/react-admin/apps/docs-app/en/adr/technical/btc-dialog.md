---
title: Create BtcDialog and BtcViewGroup Components
type: adr
project: technical
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- adr
- technical
- components
- dialog
sidebar_label: BtcDialog Component
sidebar_order: 3
sidebar_group: adr-technical
---

# ADR: Create BtcDialog and BtcViewGroup Components

> **Status**: Accepted  
> **Date**: 2025-10-12  
> **Decision Maker**: Development Team  
> **Impact Scope**: Component library and UI system  

---

## Context

Current system uses Element Plus's `el-dialog` as dialog component, but lacks the following features:
1. Fullscreen/minimize controls
2. Double-click title bar to quickly toggle fullscreen
3. Custom control buttons
4. KeepAlive caching

Meanwhile, permission management pages (e.g., user list) need left-right split layout (left tree menu + right CRUD table), but there's no ready-made component.

Referencing cool-admin's `cl-dialog` and `cl-view-group` components, decided to create corresponding enhanced components for BTC project.

## Options

### Option A: Continue using el-dialog
- No additional development needed
- Element Plus native support
- Limited functionality
- Need to repeat fullscreen logic in each page

### Option B: Directly reuse cool-admin components
- Complete functionality
- Depends on @cool-vue/crud
- Inconsistent with BTC component system
- Inconsistent style

### Option C: Create BtcDialog and BtcViewGroup (Selected)
- Complete functionality and meets BTC needs
- Independent implementation, no external dependencies
- Consistent with existing component system
- Supports auto-import
- Requires development and maintenance

## Decision

**Choose Option C**: Create `BtcDialog` and `BtcViewGroup` components

**Reasons**:
1. **Functional Completeness**: Provides enhanced features like fullscreen, minimize, custom controls
2. **Independence**: No dependency on external CRUD library, reduces dependencies
3. **Consistency**: Consistent with BTC component naming and style
4. **Maintainability**: Clean code, easy to understand and modify
5. **Auto-Import**: Auto-import via unplugin-vue-components, ready to use

## Implementation

### 1. BtcDialog Component

**Location**: `packages/shared-components/src/common/dialog/index.vue`

**Features**:
- Encapsulated based on `el-dialog`
- Supports fullscreen/minimize controls
- Supports double-click title bar fullscreen
- Supports custom control buttons
- Supports KeepAlive caching
- Supports el-scrollbar scrolling
- Supports transparent background

**API**:
- Props: `modelValue`, `title`, `width`, `height`, `padding`, `keepAlive`, `fullscreen`, `controls`, `hideHeader`, `beforeClose`, `scrollbar`, `transparent`
- Events: `update:modelValue`, `fullscreen-change`
- Expose: `visible`, `isFullscreen`, `open()`, `close()`, `toggleFullscreen()`

### 2. BtcViewGroup Component

**Location**: `packages/shared-components/src/common/view-group/index.vue`

**Features**:
- Left-right split layout
- Left side supports tree structure or list
- Responsive design (mobile collapse)
- Keyword search
- Lazy loading (infinite scroll)
- Refresh/add/right-click menu

**API**:
- Props: `options` (configuration object)
- Slots: `left`, `right`, `left-op`, `right-op`, `title`, `item`, `item-name`
- Expose: `list`, `selected`, `expand()`, `select()`, `refresh()`, `edit()`, `remove()`

### 3. BtcUpsert Upgrade

**Changes**:
- Replace internal `el-dialog` with `BtcDialog`
- Remove `closeOnClickModal` prop (pass via `dialogProps` instead)
- Optimize form cleanup logic on close

**Affected Pages**: 10 permission management pages (auto-upgraded, no manual modification needed)

## Consequences

### Positive Impact

1. **User Experience Improvement**:
   - Long forms can be edited in fullscreen, improving efficiency
   - Double-click quick toggle, smoother operation
   - Unified visual style, more professional

2. **Development Experience Improvement**:
   - Auto-import, no manual import needed
   - Simplified API, easy to use
   - Complete TypeScript type support

3. **Maintainability Improvement**:
   - Components independent, easy to test and modify
   - Complete documentation, easy for newcomers
   - Unified management, reduces duplicate code

4. **Functional Extensibility**:
   - Can easily add more control buttons
   - Supports custom styles and behaviors
   - Reserves space for future features

### Negative Impact

1. **Maintenance Cost**:
   - Need to maintain two new components
   - Need to sync with Element Plus updates

2. **Learning Cost**:
   - Developers need to understand new component APIs
   - Need to read related documentation

3. **Breaking Changes**:
   - Removed `closeOnClickModal` prop (minor impact)
   - Code using this prop needs migration

### Mitigation Measures

1. **Complete Documentation**:
   - Create detailed README and usage examples
   - Provide migration guide and best practices
   - Record CHANGELOG

2. **Automatic Upgrade**:
   - `BtcUpsert` upgrade is transparent
   - Most pages don't need code modification

3. **Backward Compatibility**:
   - Keep `dialogProps` property, allows flexible configuration
   - Default behavior consistent with `el-dialog`

---

## Related Files

- `packages/shared-components/src/common/dialog/index.vue`
- `packages/shared-components/src/common/dialog/README.md`
- `packages/shared-components/src/common/view-group/index.vue`
- `packages/shared-components/src/common/view-group/README.md`
- `packages/shared-components/src/crud/upsert/index.vue`
- `packages/shared-components/CHANGELOG.md`
- `docs/UPSERT-DIALOG-UPGRADE.md`
- `docs/BTC-GLOBAL-COMPONENTS.md`
