---
title: Component Development Operating Procedures
type: sop
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- sop
- components
- development
sidebar_label: Component Development
sidebar_order: 2
sidebar_group: sop-components
---

# Component Development Operating Procedures

This section provides standard operating procedures related to component development, including new components, icon management, component maintenance, and other component development operations.

## Operating Procedures

### Component Creation
- **[Add Layout Component](/en/sop/components/add-layout-component)** - Standard process for adding new layout components

### Resource Management
- **[Add SVG Icon](/en/sop/components/add-new-svg-icon)** - Standard steps for adding new SVG icons

---

## Development Standards

### 1. Naming Conventions
- Component names use PascalCase
- File names use kebab-case
- Directory names use kebab-case

### 2. File Structure
- Each component has independent directory
- Include component file, style file, test file
- Provide complete documentation

### 3. Code Standards
- Write using TypeScript
- Follow Vue 3 Composition API
- Provide complete type definitions

---

## Component Categories

### Basic Components
- Basic UI components like buttons, inputs, selectors
- Provide unified styles and interactions

### Business Components
- Business-related components like CRUD, forms, tables
- Encapsulate common business logic

### Layout Components
- Layout components like header, sidebar, content area
- Provide flexible layout solutions

---

## Development Tools

### Component Library
- **Element Plus** - Basic UI component library
- **Vue 3** - Frontend framework
- **TypeScript** - Type support

### Development Tools
- **Vite** - Build tool
- **Vitest** - Testing framework
- **Storybook** - Component documentation

---

## Related Documentation

- [Component Documentation](/components)
- [Component Development Guide](/en/guides/components)
- [Design Standards](/en/guides/design)
