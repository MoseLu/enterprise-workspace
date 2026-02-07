---
title: Directory-Based Layout Architecture
type: adr
project: system
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- adr
- system
- layout
sidebar_label: Directory Layout Architecture
sidebar_order: 1
sidebar_group: adr-system
---

# ADR: Directory-Based Layout Architecture

> **Status**: Accepted  
> **Date**: 2025-10-11  
> **Decision Maker**: Development Team  
> **Impact Scope**: Component architecture and development process  

---

## Context
Layout components (Topbar, Sidebar, Process, etc.) were originally stored as single files in `layout/components/` directory. As functionality grew, single files became difficult to extend, related logic, types, and styles mixed together, making maintenance difficult.

Constraints:
- Need to support component logic splitting (composables, types)
- Need to align with modern frontend ecosystem (Nuxt, unplugin-vue-router)
- Need clear functional boundaries

## Options
- **Option A**: Keep single files
- Pros: Simple and direct
- Cons: Difficult to maintain when components grow, cannot extend in place

- **Option B**: Directory-as-component
- Pros: Extensible, clear responsibilities, aligns with ecosystem
- Cons: More directories initially

- **Option C**: Hybrid mode
- Pros: Flexible
- Cons: Inconsistent standards, chaotic

## Decision
Adopt Option B: Directory-as-component architecture

Core reasons:
- Extensibility: Can add composables.ts, types.ts, styles.scss when components grow
- Ecosystem alignment: Nuxt, unplugin-vue-router default to this pattern
- Collaboration-friendly: Newcomers understand component boundaries at a glance

Structure:
```
layout/
├── topbar/
│   ├── index.vue
│   └── README.md
├── sidebar/
│   ├── index.vue
│   └── README.md
└── index.vue
```

Naming conventions:
- Directory name: kebab-case (theme-switcher)
- Component name: PascalCase (LayoutThemeSwitcher)
- Main file: Unified index.vue

## Consequences
Positive Impact:
- Component logic can be split, easier to maintain
- Directory as functional boundary, clear responsibilities
- Future switch to file-based routing almost zero cost

Negative Impact/Notes:
- Import paths become longer: ./topbar/index.vue
- Need unified standards to avoid chaos

Action Items:
- [x] Create new directory structure
- [x] Migrate all layout components
- [x] Update import paths
- [x] Add README.md for each component
- [ ] Other applications (logistics, engineering, etc.) gradually follow

---

**Status**: Implemented
**Last Review**: 2025-10-13
**Next Review**: 2025-11-13
