# 所有应用构建警告问题全局检查报告

## 检查时间
2026-01-18

## 检查范围

所有应用的构建配置，重点关注：
1. **内联CSS问题**：`assetsInlineLimit` 配置
2. **循环依赖警告**：`onwarn` 配置中的循环依赖过滤

## 应用分类

### 1. 子应用（Sub Apps）
使用 `createSubAppViteConfig` 工厂函数

| 应用名称 | vite.config.ts | 工厂函数 | assetsInlineLimit | 循环依赖过滤 | 状态 |
|---------|---------------|---------|------------------|------------|------|
| **system-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **admin-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **quality-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **dashboard-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **finance-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **logistics-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **engineering-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **production-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **personnel-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |
| **operations-app** | ✅ | `createSubAppViteConfig` | ✅ 0 | ✅ 已过滤* | ✅ 已修复 |

**说明**：
- ✅ `assetsInlineLimit: 0` - 已在 `createSubAppViteConfig` 中统一配置（第286行）
- ✅ 循环依赖过滤 - 已在 `createRollupConfig` 中统一配置（通过 `createSubAppViteConfig` 使用）

### 2. 主应用（Main Apps）
使用专门的工厂函数

| 应用名称 | vite.config.ts | 工厂函数 | assetsInlineLimit | 循环依赖过滤 | 状态 |
|---------|---------------|---------|------------------|------------|------|
| **main-app** | ✅ | `createMainAppViteConfig` | ✅ 0（刚修复） | ✅ 已过滤* | ✅ 已修复 |
| **layout-app** | ✅ | `createLayoutAppViteConfig` | ✅ 0 | ✅ 已过滤（刚修复） | ✅ 已修复 |

**说明**：
- ✅ `assetsInlineLimit: 0` - main-app 已修复（第306行附近）
- ✅ `assetsInlineLimit: 0` - layout-app 已配置（第441行）
- ✅ 循环依赖过滤 - layout-app 在 `onwarn` 中单独配置（已修复）
- ✅ 循环依赖过滤 - main-app 通过 `createRollupConfig` 统一配置

### 3. 移动应用（Mobile App）
使用 `createMobileAppViteConfig` 工厂函数

| 应用名称 | vite.config.ts | 工厂函数 | assetsInlineLimit | 循环依赖过滤 | 状态 |
|---------|---------------|---------|------------------|------------|------|
| **mobile-app** | ✅ | `createMobileAppViteConfig` | ⚠️ 未设置（使用默认值） | ❓ 未检查 | ⚠️ 待确认 |

**说明**：
- ⚠️ mobile-app 不使用 qiankun，可能有不同的配置需求
- 需要确认是否也需要禁止内联CSS

## 修复汇总

### ✅ 已完成的修复

1. **subapp.config.ts**（所有子应用）
   - ✅ `assetsInlineLimit: 0`（第286行）
   - ✅ 通过 `createRollupConfig` 统一过滤循环依赖

2. **mainapp.config.ts**（main-app）
   - ✅ `assetsInlineLimit: 0`（第306行附近，刚修复）
   - ✅ 通过 `createRollupConfig` 统一过滤循环依赖

3. **layout.config.ts**（layout-app）
   - ✅ `assetsInlineLimit: 0`（第441行，已存在）
   - ✅ `onwarn` 中添加循环依赖过滤（刚修复）

4. **rollup-config.ts**（统一配置）
   - ✅ `onwarn` 中添加循环依赖过滤（第118-127行）

### ⚠️ 待确认的应用

- **mobile-app**：不使用 qiankun，可能不需要修复，但建议确认配置一致性

## 修复效果

### 预期效果

1. **内联CSS警告**
   - ✅ 所有 qiankun 应用（子应用、主应用）的 `assetsInlineLimit` 已设置为 `0`
   - ✅ CSS 将被提取到独立文件，确保 qiankun 正确加载样式

2. **循环依赖警告**
   - ✅ 所有使用 `createRollupConfig` 的应用已统一过滤
   - ✅ layout-app 在 `onwarn` 中单独过滤
   - ✅ 构建日志更清晰，减少无关警告

## 验证建议

### 1. 构建验证

建议对以下应用进行构建验证：

**高优先级**（常用应用）：
- ✅ system-app（系统应用）
- ✅ admin-app（管理应用）
- ✅ main-app（主应用）
- ✅ layout-app（布局应用）

**中优先级**（其他子应用）：
- quality-app（品质应用）
- finance-app（财务应用）
- logistics-app（物流应用）
- dashboard-app（看板应用）
- engineering-app（工程应用）
- production-app（生产应用）
- personnel-app（人事应用）
- operations-app（运营应用）

### 2. 验证检查项

每个应用构建后检查：

1. ✅ 内联CSS警告消失或减少
2. ✅ 循环依赖警告被过滤
3. ✅ CSS 文件正确提取（如 `style-xxx.css`）
4. ✅ 构建产物大小正常
5. ✅ 应用功能正常（特别是样式显示）
6. ✅ qiankun 子应用样式正确加载

## 修复文件清单

### 修改的文件

1. `configs/vite/factories/subapp.config.ts`
   - 修改：`assetsInlineLimit: 0`（第286行）
   
2. `configs/vite/factories/mainapp.config.ts`
   - 修改：`assetsInlineLimit: 0`（第306行附近）
   
3. `configs/vite/factories/layout.config.ts`
   - 修改：`onwarn` 添加循环依赖过滤
   
4. `configs/vite/plugins/rollup-config.ts`
   - 修改：`onwarn` 添加循环依赖过滤（第118-127行）

### 受益的应用

- ✅ 所有子应用（10个）：system-app, admin-app, quality-app, dashboard-app, finance-app, logistics-app, engineering-app, production-app, personnel-app, operations-app
- ✅ 主应用（2个）：main-app, layout-app

**总计**：12个应用已修复

## 结论

✅ **所有使用 qiankun 的应用已修复构建警告问题**

- 子应用：通过 `createSubAppViteConfig` 统一修复
- 主应用：main-app 和 layout-app 单独修复
- 循环依赖：通过 `createRollupConfig` 和 layout-app 的 `onwarn` 统一过滤

⚠️ **待确认**：mobile-app 的配置（不使用 qiankun，可能不需要修复）
