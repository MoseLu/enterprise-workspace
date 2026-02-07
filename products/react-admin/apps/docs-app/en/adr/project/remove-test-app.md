---
title: Remove Duplicate test-app Application
type: adr
project: project
owner: dev-team
created: '2025-10-11'
updated: '2025-10-13'
publish: true
tags:
- adr
- project
- cleanup
sidebar_label: Remove Test Application
sidebar_order: 1
sidebar_group: adr-project
---

# ADR: Remove Duplicate test-app Application

> **Status**: Accepted  
> **Date**: 2025-10-11  
> **Decision Maker**: Development Team  
> **Impact Scope**: Project structure and maintenance costs  

---

## Context
test-app was initially created as a "Vite plugin test application", but actually contains complete business pages (system management, permission configuration, etc.), 100% duplicating admin-app functionality.

Issues:
- Maintenance cost doubled (every change needs to sync two applications)
- Technical debt accumulation (test-app uses old architecture)
- Ambiguous positioning (named test, actually business copy)
- Resource consumption (~500KB code, 100+ duplicate files)

## Options
- **Option A: Keep test-app, maintain in sync**
- Pros: Has independent test environment
- Cons: High maintenance cost, technical debt continues

- **Option B: Delete test-app**
- Pros: Eliminate duplication, reduce maintenance cost
- Cons: Lose independent test application

- **Option C: Simplify to pure plugin testing**
- Pros: Keep test environment, reduce code
- Cons: Still needs maintenance, limited benefit

## Decision
Adopt **Option B: Delete test-app**

Core reasons:
1. admin-app has fully verified all plugin functionality
2. Plugin testing should use unit tests (Vitest), not full application
3. Eliminate 100% duplicate code, focus on 5 official applications

Plugin testing alternatives:
- Unit tests: `packages/vite-plugin/test/*.test.ts`
- Actual usage: admin-app is the best test environment

## Consequences
**Positive Impact**:
- Save ~500KB code
- Reduce ~100 duplicate files
- Maintenance cost halved
- Project structure clearer

**Negative Impact/Notes**:
- Lose independent test environment (replaced with unit tests)
- Need to update related documentation and configuration

**Action Items**:
- [x] Delete apps/test-app/ directory
- [x] Update apps/README.md
- [ ] Add unit tests for vite-plugin (future)
