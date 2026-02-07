# BTC-Shopflow 国际化配置分析与优化方案 v2

> **重要更新**：本版本基于扁平结构的技术限制进行了修订
> 
> **背景**：由于一级菜单使用 `_` 键无法正常翻译，项目采用扁平结构而非嵌套结构。
> 详见：[扁平结构技术背景](./i18n-flat-structure-rationale.md)

## 📊 当前架构分析（保持不变）

当前文件组织和问题分析与 v1 版本相同，主要问题：
- 🔴 94+ 个国际化文件分散
- 🔴 大量重复翻译
- 🔴 复杂的处理逻辑 (626 行)
- 🟡 维护困难

## 🎯 修订的优化方案

### 方案 A：改进的扁平结构（推荐 ⭐）

**核心思路**：保持扁平格式，优化组织和减少重复

#### 新的目录结构

```
btc-shopflow-monorepo/
├── locales/                          # 🆕 顶级国际化目录
│   ├── shared/                       # 共享翻译（扁平格式）
│   │   ├── common.ts                 # 通用词条
│   │   ├── crud.ts                   # CRUD 操作
│   │   ├── theme.ts                  # 主题设置
│   │   ├── auth.ts                   # 认证相关
│   │   └── index.ts                  # 统一导出
│   │
│   ├── domains/                      # 领域翻译（扁平格式）
│   │   ├── warehouse.ts              # 仓储领域
│   │   ├── procurement.ts            # 采购领域
│   │   ├── inventory.ts              # 盘点领域
│   │   └── index.ts
│   │
│   └── apps/                         # 应用特定翻译
│       ├── system.ts
│       ├── admin.ts
│       ├── logistics.ts
│       └── index.ts
│
├── apps/*/src/
│   └── i18n/
│       └── index.ts                  # 仅组合和导入
│
└── packages/shared-core/src/utils/i18n/
    └── simple-loader.ts              # 🆕 简化的加载器（无需转换）
```

#### 扁平格式示例

```typescript
// locales/shared/common.ts
export const common = {
  'zh-CN': {
    // 按钮 - 扁平格式
    'common.button.save': '保存',
    'common.button.cancel': '取消',
    'common.button.confirm': '确认',
    'common.button.delete': '删除',
    'common.button.search': '搜索',
    'common.button.reset': '重置',
    'common.button.add': '新增',
    'common.button.edit': '编辑',
    'common.button.refresh': '刷新',
    
    // 表单
    'common.form.please_enter': '请输入',
    'common.form.please_select': '请选择',
    'common.form.required': '此项为必填',
    
    // 表格
    'common.table.index': '序号',
    'common.table.operation': '操作',
    'common.table.empty': '暂无数据',
    
    // 消息
    'common.message.success': '操作成功',
    'common.message.error': '操作失败',
    'common.message.save_success': '保存成功',
    'common.message.delete_confirm': '确定要删除吗?'
  },
  'en-US': {
    'common.button.save': 'Save',
    'common.button.cancel': 'Cancel',
    // ...
  }
};
```

```typescript
// locales/domains/warehouse.ts
export const warehouse = {
  'zh-CN': {
    // 模块信息
    'warehouse.module.name': '仓储管理',
    'warehouse.module.description': '仓库、物料、库存管理',
    
    // 菜单（扁平格式，避免父子键冲突）
    'warehouse.menu.root': '仓储',
    'warehouse.menu.material': '物料管理',
    'warehouse.menu.material.list': '物料列表',
    'warehouse.menu.material.import': '导入物料',
    'warehouse.menu.inventory': '库存管理',
    'warehouse.menu.inventory.check': '库存盘点',
    
    // 页面字段
    'warehouse.material.fields.material_code': '物料编码',
    'warehouse.material.fields.material_name': '物料名称',
    'warehouse.material.fields.material_type': '物料类型',
    'warehouse.material.fields.specification': '规格型号',
    
    // 操作
    'warehouse.action.add_material': '新增物料',
    'warehouse.action.edit_material': '编辑物料',
    'warehouse.action.delete_material': '删除物料',
    
    // 消息
    'warehouse.message.save_success': '物料保存成功',
    'warehouse.message.delete_confirm': '确定删除该物料吗?'
  },
  'en-US': {
    'warehouse.module.name': 'Warehouse Management',
    'warehouse.module.description': 'Warehouse, material and inventory management',
    // ...
  }
};
```

#### 简化的加载器

```typescript
// packages/shared-core/src/utils/i18n/simple-loader.ts

/**
 * 简化的扁平格式加载器
 * 因为所有源都是扁平格式，只需要简单合并
 */
export function loadFlatI18nMessages(
  sources: Array<{
    'zh-CN': Record<string, string>;
    'en-US': Record<string, string>;
  }>
) {
  const messages = {
    'zh-CN': {} as Record<string, string>,
    'en-US': {} as Record<string, string>
  };
  
  // 简单的对象合并，无需复杂转换
  for (const source of sources) {
    Object.assign(messages['zh-CN'], source['zh-CN'] || {});
    Object.assign(messages['en-US'], source['en-US'] || {});
  }
  
  return messages;
}
```

#### 应用中的使用

```typescript
// apps/system-app/src/i18n/index.ts
import { createI18n } from 'vue-i18n';
import { loadFlatI18nMessages } from '@btc/shared-core/utils/i18n/simple-loader';

// 导入共享和领域翻译
import { common } from '@workspace/locales/shared/common';
import { crud } from '@workspace/locales/shared/crud';
import { warehouse } from '@workspace/locales/domains/warehouse';
import { inventory } from '@workspace/locales/domains/inventory';

// 应用特定翻译
import systemApp from './system-app-flat';

// 简单合并，无需转换
const messages = loadFlatI18nMessages([
  common,
  crud,
  warehouse,
  inventory,
  systemApp
]);

export const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
});
```

#### 命名规范（扁平格式）

```
<domain>.<category>[.<subcategory>].<item>

层级结构：
- 2层：通用功能
  common.button
  crud.dialog
  
- 3层：领域根节点或通用子类
  warehouse.module
  common.button.save
  
- 4层：领域具体项
  warehouse.material.fields
  warehouse.menu.material.list
  
- 最多5层
```

**示例**：

```typescript
✅ 好的命名
'common.button.save'                           // 3层
'warehouse.module.name'                        // 3层
'warehouse.menu.material'                      // 3层
'warehouse.material.fields.material_code'      // 4层
'warehouse.menu.material.list'                 // 4层

❌ 避免的命名
'save'                                         // 太短，容易冲突
'warehouse.material.fields.properties.code'    // 太深（5层+）
```

#### 优点

- ✅ **兼容性**：保持与现有系统完全兼容
- ✅ **简单性**：加载逻辑从 626 行减少到 ~50 行
- ✅ **性能**：无需复杂的 flatten/unflatten 转换
- ✅ **可维护**：通过良好组织仍然易于维护
- ✅ **渐进式**：可以逐步迁移，不影响现有功能

#### 缺点

- ⚠️ key 较长
- ⚠️ 无法利用嵌套的类型提示（但可通过工具补偿）

### 方案 B：引入自定义翻译函数（中长期）

如果未来想使用嵌套结构，可以创建支持 `_` 键的翻译函数：

```typescript
// packages/shared-core/src/utils/i18n/smart-translator.ts

/**
 * 支持 _ 键的智能翻译函数
 */
export function createSmartTranslator(i18n: any) {
  return function $ts(key: string, ...args: any[]) {
    let result = i18n.t(key, ...args);
    
    // 如果返回对象且有 _ 键，使用 _ 的值
    if (typeof result === 'object' && result !== null && '_' in result) {
      return result._;
    }
    
    return result;
  };
}

// 在组件中使用
import { useI18n } from 'vue-i18n';
import { createSmartTranslator } from '@btc/shared-core/utils/i18n/smart-translator';

export function useSmartI18n() {
  const i18n = useI18n();
  const $ts = createSmartTranslator(i18n.global);
  
  return {
    t: i18n.t,        // 原始函数（扁平格式）
    ts: $ts,          // 智能函数（支持 _ 键）
    locale: i18n.locale
  };
}
```

这样可以逐步迁移到嵌套结构。

## 📋 实施步骤（修订版）

### 阶段一：准备工作（1天）

```bash
# 1. 运行分析
pnpm exec node scripts/i18n/find-duplicates.mjs
pnpm exec node scripts/i18n/check-completeness.mjs

# 2. 查看报告
cat i18n-duplicates-report.json

# 3. 创建新目录
mkdir -p locales/shared
mkdir -p locales/domains
mkdir -p locales/apps
```

### 阶段二：提取共享翻译（2-3天）

```typescript
// 1. 创建共享翻译文件
// locales/shared/common.ts
export const common = {
  'zh-CN': {
    // 从各应用提取重复的 common.* 翻译
    'common.button.save': '保存',
    // ...
  },
  'en-US': {
    'common.button.save': 'Save',
    // ...
  }
};

// 2. 创建 CRUD 共享翻译
// locales/shared/crud.ts
export const crud = {
  'zh-CN': {
    'crud.button.add': '新增',
    'crud.button.edit': '编辑',
    'crud.button.delete': '删除',
    // ...
  },
  'en-US': {
    // ...
  }
};

// 3. 统一导出
// locales/shared/index.ts
export { common } from './common';
export { crud } from './crud';
export { theme } from './theme';
export { auth } from './auth';
```

### 阶段三：提取领域翻译（2-3天）

```typescript
// locales/domains/warehouse.ts
export const warehouse = {
  'zh-CN': {
    // 从 system-app 和 logistics-app 提取 warehouse.* 翻译
    'warehouse.module.name': '仓储管理',
    'warehouse.menu.material': '物料管理',
    // ...
  },
  'en-US': {
    // ...
  }
};
```

### 阶段四：简化加载逻辑（1天）

```typescript
// packages/shared-core/src/utils/i18n/simple-loader.ts
export function loadFlatI18nMessages(sources) {
  const messages = { 'zh-CN': {}, 'en-US': {} };
  
  for (const source of sources) {
    Object.assign(messages['zh-CN'], source['zh-CN'] || {});
    Object.assign(messages['en-US'], source['en-US'] || {});
  }
  
  return messages;
}

// 可以删除或简化 registerSubAppI18n.ts 的大部分逻辑
```

### 阶段五：逐步迁移应用（1周）

```typescript
// apps/system-app/src/i18n/index.ts
import { loadFlatI18nMessages } from '@btc/shared-core/utils/i18n/simple-loader';
import { common, crud, theme } from '@workspace/locales/shared';
import { warehouse, inventory } from '@workspace/locales/domains';

const messages = loadFlatI18nMessages([
  common,
  crud,
  theme,
  warehouse,
  inventory
]);

export const i18n = createI18n({
  locale: 'zh-CN',
  messages
});
```

### 阶段六：清理和验证（1-2天）

```bash
# 1. 删除旧的重复文件
# 保留应用特定的翻译，删除共享的重复内容

# 2. 运行检查
pnpm exec node scripts/i18n/find-duplicates.mjs  # 应该没有重复了

# 3. 测试所有应用
pnpm dev:all
```

## 📈 优化效果（修订版）

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 文件数量 | 94+ | ~30 | **-68%** |
| registerSubAppI18n 行数 | 626 | ~50 | **-92%** |
| 重复翻译 | 200+ | 0 | **-100%** |
| 格式 | 混用 | 统一扁平 | **一致** |
| 加载复杂度 | 很高 | 很低 | **大幅简化** |
| 兼容性 | - | 100% | **完全兼容** |

## 🛠️ 迁移辅助脚本（已提供）

所有脚本已创建在 `scripts/i18n/` 目录：

```bash
# 检查完整性
node scripts/i18n/check-completeness.mjs

# 查找重复
node scripts/i18n/find-duplicates.mjs

# 迁移格式（如果需要转换 JSON）
node scripts/i18n/migrate-flat-to-nested.mjs file input.json output.ts
```

## 💡 最佳实践（修订版）

### ✅ 扁平格式的最佳实践

```typescript
// 1. 清晰的命名空间
'domain.category.item'
'warehouse.menu.material'
'common.button.save'

// 2. 一致的层级（2-4层）
'common.button.save'                    // 3层 ✅
'warehouse.material.fields.code'        // 4层 ✅
'warehouse.menu.material.list'          // 4层 ✅

// 3. 避免过深
'warehouse.page.material.form.fields.properties.code'  // 7层 ❌

// 4. 语义化
'warehouse.action.add_material'         // ✅ 清晰
'wh.act.add_mat'                        // ❌ 缩写
```

### 📝 配置 TypeScript 类型提示

虽然是扁平格式，但仍可以有类型提示：

```typescript
// types/i18n.d.ts
export type I18nKeys = 
  | 'common.button.save'
  | 'common.button.cancel'
  | 'warehouse.menu.material'
  | 'warehouse.material.fields.material_code'
  // ... 可由工具自动生成
  ;

// 使用
const key: I18nKeys = 'common.button.save';
$t(key);  // 有类型提示 ✅
```

可以创建脚本自动生成类型：

```typescript
// scripts/generate-i18n-types.mjs
// 从所有翻译文件提取 key，生成类型文件
```

## 🔍 与 v1 版本的主要区别

| 方面 | v1 (嵌套结构) | v2 (扁平结构) |
|------|--------------|--------------|
| **格式** | 嵌套 | 扁平 |
| **菜单处理** | 使用 `_` 键 | 直接的扁平 key |
| **加载逻辑** | 复杂（需转换） | 简单（直接合并） |
| **兼容性** | 需要改造 | 完全兼容 |
| **实施难度** | 中高 | 低 |
| **维护性** | 通过嵌套结构 | 通过组织和规范 |

## ✅ 总结

基于 `_` 键的技术限制，**我们推荐方案 A：改进的扁平结构**

### 为什么选择扁平结构？

1. ✅ **兼容性**：无需改动翻译逻辑
2. ✅ **简单性**：大幅简化加载代码（-92%）
3. ✅ **可靠性**：避免 `_` 键的翻译问题
4. ✅ **渐进式**：可以逐步迁移

### 如何保持可维护性？

1. 📁 **良好的文件组织**：按领域和共享分类
2. 📋 **清晰的命名规范**：统一的层级和命名
3. 🔍 **工具支持**：类型生成、重复检测
4. 📖 **完善的文档**：规范和示例

### 未来演进路径

- **短期**（现在）：使用改进的扁平结构
- **中期**（3-6个月）：引入 `$ts` 函数支持嵌套
- **长期**（6-12个月）：逐步迁移到嵌套结构（如果需要）

---

**相关文档**:
- [扁平结构技术背景](./i18n-flat-structure-rationale.md) - **必读**
- [快速开始指南](./i18n-quick-start.md)
- [脚本集成说明](./i18n-scripts-integration.md)
