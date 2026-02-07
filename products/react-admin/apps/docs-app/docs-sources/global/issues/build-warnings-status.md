# 各应用构建警告问题状态

## 问题概述

所有使用 `@btc/shared-components` 的应用都可能存在以下两个问题：
1. **内联CSS警告**：`assetsInlineLimit` 设置导致 CSS 可能内联到 JS 中
2. **循环依赖警告**：`shared-components` 通过 reexport 导出组件时的跨 chunk 警告

## 各应用状态

### ✅ 已修复

- **layout-app**: `assetsInlineLimit: 0` ✅
- **subapp** (所有子应用，包括 system-app): `assetsInlineLimit: 0` ✅ (刚修复)
- **rollup-config**: 循环依赖警告过滤 ✅ (刚修复)

### ⚠️ 需要修复

- **main-app**: `assetsInlineLimit: 10 * 1024` ❌ 需要修复
- **layout-app**: `onwarn` 配置缺少循环依赖过滤 ❌ 需要修复

### ℹ️ 无需修复

- **mobile-app**: 不使用 qiankun，可能有不同的配置需求

## 修复方案

### 1. main-app: 修复内联CSS问题

**文件**: `configs/vite/factories/mainapp.config.ts` (第303行)

**当前配置**:
```typescript
assetsInlineLimit: 10 * 1024,
```

**应改为**:
```typescript
// 关键：禁止资源内联，确保 CSS 被提取到独立文件中（qiankun 要求）
// 与 layout-app 和 subapp 保持一致，避免内联 CSS 导致样式丢失
assetsInlineLimit: 0,
```

### 2. layout-app: 添加循环依赖警告过滤

**文件**: `configs/vite/factories/layout.config.ts` (第453-463行)

**当前配置**:
```typescript
onwarn(warning: any, warn: (warning: any) => void) {
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
      (warning.message && typeof warning.message === 'string' &&
       warning.message.includes('dynamically imported') &&
       warning.message.includes('statically imported'))) {
    return;
  }
  if (warning.message && typeof warning.message === 'string' && warning.message.includes('Generated an empty chunk')) {
    return;
  }
  warn(warning);
},
```

**应添加循环依赖过滤**:
```typescript
onwarn(warning: any, warn: (warning: any) => void) {
  if (warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
      (warning.message && typeof warning.message === 'string' &&
       warning.message.includes('dynamically imported') &&
       warning.message.includes('statically imported'))) {
    return;
  }
  if (warning.message && typeof warning.message === 'string' && warning.message.includes('Generated an empty chunk')) {
    return;
  }
  // 过滤循环依赖警告（已知的安全警告）
  // 当 shared-components 通过 reexport 导出组件，且组件和业务代码在不同 chunk 时会产生此警告
  // 这是预期的拆分策略，不会影响功能，因为 chunk 加载顺序已经正确配置
  if (warning.code === 'CIRCULAR_DEPENDENCY' ||
      (warning.message && typeof warning.message === 'string' &&
       (warning.message.includes('was reexported through module') ||
        warning.message.includes('will end up in different chunks') ||
        warning.message.includes('circular dependency')))) {
    return;
  }
  warn(warning);
},
```

## 修复优先级

1. **高优先级**: main-app 的内联CSS问题（影响 qiankun 样式加载）
2. **中优先级**: layout-app 的循环依赖警告过滤（主要是日志清理）

## 修复后验证

修复后应验证：
1. 构建成功，警告减少
2. CSS 文件正确提取到独立文件
3. 应用功能正常（特别是样式显示）
4. qiankun 子应用样式正确加载
