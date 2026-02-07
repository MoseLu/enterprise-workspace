---
title: EPS Service Sharing Solution
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- eps
- architecture
sidebar_label: EPS Sharing Solution
sidebar_order: 3
sidebar_group: deployment
---

# EPS Service Sharing Solution

## Problem Description

Currently, each application during build will:
1. Generate independent `build/eps` directory (EPS data files)
2. Generate EPS service code through `virtual:eps` virtual module
3. Package into independent `eps-service-xxx.js` chunk

This leads to:
- Each application contains duplicate EPS service code
- Build artifact size increases
- Not truly achieving sharing benefits

## Solution

### Solution 1: Extract EPS Service Code to Shared Package (Recommended)

Extract EPS service code to `@btc/shared-core` as part of shared logic.

**Advantages**:
- Truly achieves sharing, all apps reference the same package
- Reduces build artifact size
- Aligns with "shared logic level" positioning

**Disadvantages**:
- Requires modifying existing code structure
- EPS data still needs to be copied from main-app

### Solution 2: Optimize Build Configuration, Share EPS Chunk

Through build configuration, let all apps share the same EPS chunk (loaded via CDN or shared location).

**Advantages**:
- Doesn't require major code structure changes
- Can achieve runtime sharing

**Disadvantages**:
- Requires additional CDN or shared location configuration
- Still need to generate EPS data during build

### Solution 3: Publish EPS Service Code as Independent npm Package

Extract EPS service code as independent `@btc/shared-eps` package.

**Advantages**:
- Completely independent, easy to manage
- Can have independent version control

**Disadvantages**:
- Increases package management complexity
- EPS data still needs handling

## Recommended Solution: Solution 1

Extract EPS service code to `@btc/shared-core` because:
1. EPS service code is shared logic, aligning with `@btc/shared-core` positioning
2. All apps use the same EPS data (copied from main-app)
3. Can reduce number of packages, simplify dependency management

## Implementation Steps (Completed)

1. **✅ Create EPS Service Module in `@btc/shared-core`**
   - Created `packages/shared-core/src/eps/service.ts`
   - Provides unified EPS service loading functions: `loadEpsService`, `getGlobalEpsService`, `createEpsService`, `exportEpsServiceToGlobal`

2. **✅ Modify EPS Plugin**
   - Modified EPS plugin in `@btc/vite-plugin`
   - Added `sharedEpsDir` option, supports reading EPS data from shared location
   - Sub-apps prioritize reading EPS data from `main-app/build/eps`

3. **✅ Modify Application Code**
   - All apps' `src/services/eps.ts` updated to use shared EPS service module
   - Use `loadEpsService` function to uniformly load EPS service

4. **✅ Optimize Build Configuration**
   - `manualChunks` configuration optimized, EPS service code packaged into `eps-service` chunk
   - All apps share the same EPS chunk (via `virtual:eps` virtual module)

5. **✅ Update Build Scripts**
   - Sub-app configuration updated, automatically read EPS data from `main-app/build/eps`
   - Build process unchanged, but sub-apps no longer independently generate EPS data

## Notes

1. **EPS Data Still Needs to be Copied from main-app**
   - EPS data is dynamically generated, needs to be obtained from main-app
   - But service code can be shared

2. **Maintain Backward Compatibility**
   - During migration, maintain compatibility with existing code
   - Gradual migration, avoid one-time major changes

3. **Version Management**
   - EPS service code version should be synchronized with `@btc/shared-core`
   - Ensure all apps use the same version of EPS service code
