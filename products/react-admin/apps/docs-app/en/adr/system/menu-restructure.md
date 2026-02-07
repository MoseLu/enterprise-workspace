---
title: System Management Menu Refactoring - Reorganize Permission Management by Business Domain
type: adr
project: system
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- adr
- system
- menu
- restructure
sidebar_label: Menu Refactoring
sidebar_order: 3
sidebar_group: adr-system
---

# ADR: System Management Menu Refactoring

> **Status**: Accepted  
> **Date**: 2025-10-12  
> **Decision Maker**: System Architect  
> **Impact Scope**: System management interface and permission system  

---

## Context

**Problem**: Original menu structure used single-level nesting of "System Management > Permission Management", flattening all 10 pages at the same level: Domain, Plugin, Module, User, Tenant, Menu, Action, Role, Resource, Department.

**Pain Points**:
1. **Unclear Business Semantics**: Concepts from different business domains mixed together (platform vs organization vs access control)
2. **Poor Extensibility**: New binding pages and advanced features have no suitable home
3. **High Cognitive Load**: 10 pages flattened, difficult to quickly locate

**Trigger Factor**: User provided new permission system design, including 5 major business modules and 13 new page requirements.

## Options

### A. Keep Existing Structure, Add Parallel Modules
**Solution**: Add parallel sub-menus like "Platform Governance", "Organization & Account" under "System Management"

**Pros**:
- Minimal changes
- Old paths remain available

**Cons**:
- Deeper menu hierarchy (3-4 levels)
- "System Management" becomes bloated

### B. Complete Refactoring into 5 Major Business Modules (Selected)
**Solution**:
```
Platform Governance (Domain, Module, Plugin)
Organization & Account (Tenant, Department, User + Binding Management)
Access Control (Resource, Action, Permission, Role, Policy + Composition Tools)
Navigation & Visibility (Menu + Preview)
Operations & Audit (Log, Baseline, Simulator)
```

**Pros**:
- **Clear Business Semantics**: Grouped by domain
- **Strong Extensibility**: Each module can expand independently
- **Low Cognitive Load**: Flat hierarchy, clear classification

**Cons**:
- Need to migrate all page paths
- Old paths need compatibility handling

### C. Hybrid Solution

**Solution**: Keep some old paths, use new structure for new features

**Cons**:
- Inconsistent structure, more chaotic

## Decision

**Choose Solution B: Complete refactoring into 5 major business modules**

**Reasons**:
1. **Business Semantics First**: Clear domain division > keeping old paths
2. **Long-term Benefits**: Initial migration cost controllable, long-term maintenance cost reduced
3. **User Experience**: New users easier to understand system structure

**Implementation Strategy**:
1. Page migration: Physically move directories (10 pages)
2. Path updates: All routes from `/system/permission/*` to `/platform/*`, `/org/*`, etc.
3. Compatibility handling: tabRegistry keeps old path mapping to avoid refresh loss
4. New page creation: 13 new pages, using Mock data

## Consequences

### Positive

1. **Business Clarity**: 5 major modules semantically clear
2. **Easy to Extend**: Each module independent, doesn't interfere with each other
3. **Reduced Cognitive Load**: Menu items from 10 scattered to 5 modules, 2-6 items per module
4. **Support Advanced Features**: Binding management, composition tools, simulator all have reasonable homes

### Negative

1. **Path Changes**: Old bookmarks/links invalid (mitigated via tabRegistry compatibility)
2. **Migration Cost**: Need to update 13 files (routes, menus, search, i18n)
3. **Mock Data**: 13 new pages temporarily use Mock, replace when backend ready

## Implementation

### File Change Statistics

**New**: 23 pages
- 10 migrated pages (copied to new locations)
- 2 permission pages (permissions, policies)
- 4 binding management pages
- 5 advanced feature pages (perm-compose, menu-preview, audit, baseline, simulator)
- 1 Mock utility (utils/mock.ts)

**Modified**: 7 configuration files
- `router/index.ts` - Route configuration
- `micro/menus.ts` - Menu definition
- `layout/dynamic-menu/index.vue` - Menu rendering
- `layout/global-search/index.vue` - Search data
- `store/tabRegistry.ts` - Tab registration
- `i18n/locales/zh-CN.ts` - Chinese translations
- `i18n/locales/en-US.ts` - English translations

**Deleted**: 1 directory
- `pages/system/` - Old page directory

### New Menu Structure
```
Platform Governance (platform)
  Domain (domains)
  Module (modules)
  Plugin (plugins)
Organization & Account (org)
  Tenant (tenants)
  Department (departments)
  User (users)
Access Control (access)
  Resource (resources)
  Action (actions)
  Permission (permissions)
  Role (roles)
  Policy (policies)
  Permission Composition (permissions/compose)
Navigation & Visibility (navigation)
  Menu (menus)
  Menu Preview (menus/preview)
Operations & Audit (ops)
  Operation Log (audit)
  Permission Baseline (baseline)
  Policy Simulator (simulator)
```

### Mock Data Strategy

**Principles**:
- Use `localStorage` to simulate persistence
- Complete CRUD support (add/update/delete/page)
- Include default data for easy demonstration
- Provide `createMockCrudService` utility

**After Backend Ready**: Only need to replace service reference, page code doesn't need modification

## Risks & Mitigation

| Risk | Impact | Mitigation | Status |
|------|--------|------------|:------:|
| Old links invalid | Medium | tabRegistry compatibility mapping | |
| Mock data inconsistent with real API | Medium | Strictly follow existing service interface | |
| New page functionality incomplete | Low | Core CRUD implemented, advanced features to extend | |

## Review

**Expected Benefits**:
- Menu clarity improvement: ⭐⭐⭐⭐⭐
- Extensibility improvement: ⭐⭐⭐⭐⭐
- User experience improvement: ⭐⭐⭐⭐⭐

**Implementation Difficulty**: Medium

**Recommended Follow-up**:
1. Replace Mock services when backend API ready
2. Add actual functionality tests for binding management pages
3. Complete logic for advanced features (baseline comparison, simulator)
