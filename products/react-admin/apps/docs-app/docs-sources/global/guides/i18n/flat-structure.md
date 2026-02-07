# 扁平结构国际化的技术背景

## 🔍 问题背景

在项目的国际化实现中，我们选择了**扁平结构**而非嵌套结构，主要原因是：

### 核心问题：父子键冲突

当一个菜单项**既是父节点又有子节点**时，嵌套结构会遇到翻译失败的问题。

#### 问题示例

```typescript
// ❌ 嵌套结构 - 有问题
{
  menu: {
    procurement: {
      _: '采购',           // 父菜单的标题
      module: '采购模块',   // 子菜单
      order: '采购订单'
    }
  }
}

// 问题：$t('menu.procurement') 无法正确返回 "采购"
// Vue I18n 不能很好地处理 _ 键
```

#### 当前解决方案

```typescript
// ✅ 扁平结构 - 正常工作
{
  'menu.procurement': '采购',           // 父菜单
  'menu.procurement.module': '采购模块', // 子菜单
  'menu.procurement.order': '采购订单'
}

// $t('menu.procurement') ✅ 正确返回 "采购"
// $t('menu.procurement.module') ✅ 正确返回 "采购模块"
```

## 🎯 技术分析

### 为什么 `_` 键不工作？

Vue I18n 在处理嵌套对象时的行为：

```typescript
// Vue I18n 内部逻辑 (简化)
function getTranslation(path) {
  const obj = messages;
  const keys = path.split('.');
  
  let current = obj;
  for (const key of keys) {
    current = current[key];
    
    // 问题：当 current 是对象时，Vue I18n 期望继续向下遍历
    // 不会检查 current._ 键
    if (typeof current === 'object') {
      continue;  // 期望还有更多的键
    }
  }
  
  return current;
}

// 调用 $t('menu.procurement')
// current = { _: '采购', module: '采购模块' }
// 返回的是对象，不是字符串 ❌
```

### `registerSubAppI18n.ts` 中的尝试

我们的代码中有大量处理 `_` 键的逻辑：

```typescript
// registerSubAppI18n.ts 第 128-134 行
if ('_' in value && typeof value._ === 'string' && value._.trim() !== '') {
  result[newKey] = value._;
  // 不 continue，继续处理其他子键
}
```

这个逻辑试图将嵌套结构转换为扁平结构，但这增加了系统的复杂度（626 行代码）。

## 📊 问题影响范围

### 受影响的场景

1. **多级菜单**
   ```typescript
   'menu.procurement': '采购'
   'menu.procurement.order': '采购订单'
   'menu.procurement.order.list': '订单列表'
   ```

2. **面包屑导航**
   ```typescript
   'page.warehouse': '仓储'
   'page.warehouse.material': '物料管理'
   ```

3. **模块标题**
   ```typescript
   'module.warehouse': '仓储模块'
   'module.warehouse.title': '仓储管理系统'
   ```

### 不受影响的场景

纯叶子节点可以使用嵌套结构：

```typescript
// ✅ 这些没问题，因为没有父子冲突
{
  common: {
    button: {
      save: '保存',    // 叶子节点
      cancel: '取消'   // 叶子节点
    }
  }
}
```

## 💡 优化方案（修订版）

考虑到 `_` 键的技术限制，我们有以下几种方案：

### 方案 1：改进的扁平结构（推荐）

**保持扁平结构，但优化组织方式**

#### 1.1 按领域分组

```typescript
// locales/domains/warehouse-flat.ts
export const warehouse = {
  'zh-CN': {
    // 模块信息
    'warehouse.module.name': '仓储管理',
    'warehouse.module.description': '仓库物料管理',
    
    // 菜单
    'warehouse.menu.material': '物料管理',
    'warehouse.menu.material.list': '物料列表',
    'warehouse.menu.material.import': '导入物料',
    
    'warehouse.menu.inventory': '库存管理',
    'warehouse.menu.inventory.check': '库存盘点',
    
    // 页面
    'warehouse.page.material.title': '物料管理',
    'warehouse.page.material.fields.material_code': '物料编码',
    'warehouse.page.material.fields.material_name': '物料名称',
    
    // 操作
    'warehouse.action.add_material': '新增物料',
    'warehouse.action.edit_material': '编辑物料',
    
    // 消息
    'warehouse.message.save_success': '保存成功',
    'warehouse.message.delete_confirm': '确定删除?'
  },
  'en-US': {
    'warehouse.module.name': 'Warehouse Management',
    // ...
  }
};
```

#### 1.2 使用命名空间

```typescript
// locales/shared/common-flat.ts
export const common = {
  'zh-CN': {
    // 按钮命名空间
    'common.button.save': '保存',
    'common.button.cancel': '取消',
    'common.button.confirm': '确认',
    
    // 表单命名空间
    'common.form.please_enter': '请输入',
    'common.form.please_select': '请选择',
    
    // 表格命名空间
    'common.table.index': '序号',
    'common.table.operation': '操作',
    
    // 消息命名空间
    'common.message.success': '操作成功',
    'common.message.error': '操作失败'
  }
};
```

#### 优点
- ✅ 不需要改动现有的翻译逻辑
- ✅ 保持与现有系统的兼容性
- ✅ 减少文件数量和重复
- ✅ 更好的组织和查找

#### 缺点
- ⚠️ 无法利用 TypeScript 的嵌套类型提示
- ⚠️ key 较长

### 方案 2：修复 `_` 键支持

**创建自定义的翻译函数**

```typescript
// packages/shared-core/src/utils/i18n/custom-translator.ts

/**
 * 支持 _ 键的翻译函数
 */
export function createSmartTranslator(i18n: any) {
  return function $ts(key: string, ...args: any[]) {
    // 先尝试直接翻译
    let result = i18n.t(key, ...args);
    
    // 如果返回的是对象，尝试获取 _ 键
    if (typeof result === 'object' && result !== null && '_' in result) {
      return result._;
    }
    
    return result;
  };
}

// 使用
const $ts = createSmartTranslator(i18n);
$ts('menu.procurement'); // ✅ 能正确返回 "采购"
```

#### 在组件中使用

```typescript
// packages/shared-core/src/composables/use-smart-i18n.ts
import { inject } from 'vue';
import { createSmartTranslator } from '../utils/i18n/custom-translator';

export function useSmartI18n() {
  const i18n = inject('i18n');
  const $ts = createSmartTranslator(i18n);
  
  return {
    t: i18n.t,      // 原始翻译函数
    ts: $ts,        // 支持 _ 键的翻译函数
    locale: i18n.locale
  };
}
```

```vue
<template>
  <div>
    <!-- 使用新的翻译函数 -->
    <h1>{{ ts('menu.procurement') }}</h1>
    <menu-item v-for="item in items" :key="item.key">
      {{ ts(item.i18nKey) }}
    </menu-item>
  </div>
</template>

<script setup lang="ts">
import { useSmartI18n } from '@btc/shared-core/composables/use-smart-i18n';

const { ts } = useSmartI18n();
</script>
```

#### 优点
- ✅ 可以使用嵌套结构
- ✅ 更好的类型提示
- ✅ 符合直觉的数据组织

#### 缺点
- ⚠️ 需要改造现有代码（从 `$t` 改为 `$ts`）
- ⚠️ 需要团队学习新的 API

### 方案 3：混合方案

**菜单使用扁平，其他使用嵌套**

```typescript
// locales/mixed/warehouse.ts
export const warehouse = {
  'zh-CN': {
    // 菜单部分 - 扁平
    menu: {
      'warehouse': '仓储',
      'warehouse.material': '物料管理',
      'warehouse.material.list': '物料列表',
      'warehouse.inventory': '库存管理',
      'warehouse.inventory.check': '库存盘点'
    },
    
    // 其他部分 - 嵌套
    page: {
      material: {
        title: '物料管理',
        fields: {
          material_code: '物料编码',
          material_name: '物料名称'
        }
      }
    },
    
    action: {
      add_material: '新增物料',
      edit_material: '编辑物料'
    }
  }
};

// 使用
$t('warehouse.menu.warehouse.material')  // 扁平访问
$t('warehouse.page.material.title')      // 嵌套访问
```

#### 优点
- ✅ 在可能的地方利用嵌套结构
- ✅ 在有冲突的地方使用扁平
- ✅ 折中方案

#### 缺点
- ⚠️ 两种风格混用，可能造成混淆
- ⚠️ 需要明确的规范说明

## 📋 推荐的实施方案

### 短期方案（1-2周）

**方案 1：改进的扁平结构**

1. **保持扁平结构不变**
2. **优化组织方式**：
   - 提取共享翻译到 `locales/shared/`
   - 按领域分组到 `locales/domains/`
   - 统一命名规范

3. **简化处理逻辑**：
   - 保持扁平格式，无需复杂的 flatten/unflatten 转换
   - 简化 `registerSubAppI18n.ts` (从 626 行减少到 ~200 行)

### 中长期方案（1-2个月）

**方案 2：引入自定义翻译函数**

1. **创建 `$ts` 函数**支持 `_` 键
2. **逐步迁移**：
   - 新代码使用嵌套结构 + `$ts`
   - 旧代码继续使用扁平结构 + `$t`
3. **最终统一**到嵌套结构

## 🛠️ 简化的目录结构

```
btc-shopflow-monorepo/
├── locales/
│   ├── shared/                    # 共享翻译（扁平格式）
│   │   ├── common-flat.ts         # { 'common.button.save': '保存' }
│   │   ├── crud-flat.ts
│   │   ├── theme-flat.ts
│   │   └── auth-flat.ts
│   │
│   ├── domains/                   # 领域翻译（扁平格式）
│   │   ├── warehouse-flat.ts      # { 'warehouse.menu.material': '物料' }
│   │   ├── procurement-flat.ts
│   │   └── inventory-flat.ts
│   │
│   └── apps/                      # 应用特定翻译
│       ├── system-flat.ts
│       └── admin-flat.ts
│
└── packages/shared-core/src/utils/i18n/
    ├── simple-flat-loader.ts      # 🆕 简化的扁平格式加载器
    └── custom-translator.ts       # 🆕 可选：支持 _ 键的翻译函数
```

## 💻 简化的加载逻辑

```typescript
// packages/shared-core/src/utils/i18n/simple-flat-loader.ts

/**
 * 简单的扁平格式加载器
 * 因为已经是扁平格式，不需要复杂的转换
 */
export function loadFlatMessages(
  sources: Array<{ 'zh-CN': Record<string, string>, 'en-US': Record<string, string> }>
) {
  const messages = {
    'zh-CN': {},
    'en-US': {}
  };
  
  // 简单合并，不需要 flatten/unflatten
  for (const source of sources) {
    Object.assign(messages['zh-CN'], source['zh-CN']);
    Object.assign(messages['en-US'], source['en-US']);
  }
  
  return messages;
}

// 使用
import { loadFlatMessages } from '@btc/shared-core/utils/i18n/simple-flat-loader';
import { common } from '@workspace/locales/shared/common-flat';
import { warehouse } from '@workspace/locales/domains/warehouse-flat';

const messages = loadFlatMessages([common, warehouse]);
// 完成！无需复杂转换
```

## 📈 优化效果（修订版）

| 指标 | 当前 | 优化后 | 说明 |
|------|------|--------|------|
| 文件数量 | 94+ | ~30 | ✅ 减少 68% |
| registerSubAppI18n 行数 | 626 | ~200 | ✅ 减少 68% (无需复杂转换) |
| 重复翻译 | 200+ | 0 | ✅ 消除重复 |
| 格式 | 混用 | 统一扁平 | ✅ 保持兼容 |
| 加载逻辑复杂度 | 高 | 低 | ✅ 简单合并 |

## ✅ 行动计划

### Phase 1：评估和准备（1天）

```bash
# 运行分析工具（已提供）
pnpm exec node scripts/i18n/find-duplicates.mjs
```

### Phase 2：提取共享翻译（2-3天）

```typescript
// 创建 locales/shared/common-flat.ts
export const common = {
  'zh-CN': {
    'common.button.save': '保存',
    'common.button.cancel': '取消',
    // ... 提取所有重复的 common.* 翻译
  },
  'en-US': {
    'common.button.save': 'Save',
    'common.button.cancel': 'Cancel',
    // ...
  }
};
```

### Phase 3：简化加载逻辑（2天）

删除复杂的 flatten/unflatten 转换：

```typescript
// 旧代码（复杂）
const flat = flattenObject(nested);
const nested2 = unflattenObject(flat);
const merged = deepMerge(nested2, other);

// 新代码（简单）
const merged = { ...source1, ...source2 };
```

### Phase 4：逐步迁移应用（1周）

每个应用只需要导入共享翻译：

```typescript
// apps/system-app/src/i18n/index.ts
import { common } from '@workspace/locales/shared/common-flat';
import { warehouse } from '@workspace/locales/domains/warehouse-flat';

const messages = {
  'zh-CN': {
    ...common['zh-CN'],
    ...warehouse['zh-CN'],
    // 应用特定翻译
  }
};
```

## 📝 更新的最佳实践

### ✅ 推荐的扁平格式

```typescript
// 清晰的命名空间
'domain.category.subcategory.item'

// 示例
'warehouse.menu.material': '物料管理',
'warehouse.page.material.title': '物料管理',
'warehouse.page.material.fields.code': '物料编码',
'common.button.save': '保存',
'common.message.success': '操作成功'
```

### 命名规范

```
<domain>.<category>.<subcategory>.<item>

domain:       warehouse, procurement, common, crud, theme, auth
category:     menu, page, action, message, field
subcategory:  material, inventory, button, form
item:         具体的翻译项
```

## 🔍 总结

虽然扁平结构在代码组织上不如嵌套结构直观，但考虑到：

1. ✅ **技术限制**：`_` 键在 Vue I18n 中无法正常工作
2. ✅ **兼容性**：保持与现有系统的兼容
3. ✅ **可维护性**：通过良好的组织仍然可以保持可维护性
4. ✅ **性能**：简化的加载逻辑提升性能

**我们推荐在短期内继续使用改进的扁平结构**，同时可以考虑在中长期引入自定义翻译函数来逐步迁移到嵌套结构。

---

**相关文档**:
- [国际化优化分析](./i18n-optimization-analysis.md)
- [快速开始指南](./i18n-quick-start.md)
- [脚本使用说明](../scripts/i18n/README.md)
