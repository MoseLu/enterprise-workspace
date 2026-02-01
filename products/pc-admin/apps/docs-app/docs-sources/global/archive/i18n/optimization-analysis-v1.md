# BTC-Shopflow 国际化配置分析与优化方案

## 📊 当前架构分析

### 1. 文件组织结构

当前项目的国际化配置分散在以下位置:

#### 1.1 应用级配置
```
apps/*/src/
├── locales/
│   ├── config.ts          # 应用级国际化配置 (嵌套格式)
│   ├── zh-CN.json         # 应用级中文翻译 (扁平格式)
│   └── en-US.json         # 应用级英文翻译 (扁平格式)
└── i18n/
    ├── getters.ts         # 国际化获取器
    ├── locales/
    │   ├── zh-CN.ts       # TypeScript 格式的翻译 (扁平格式)
    │   └── en-US.ts       # TypeScript 格式的翻译 (扁平格式)
    └── index.ts
```

#### 1.2 模块级配置
```
apps/*/src/modules/**/
└── config.ts              # 包含 locale 字段 (扁平或嵌套格式)
    └── locale: {
        'zh-CN': { ... },
        'en-US': { ... }
    }
```

#### 1.3 插件级配置
```
apps/*/src/plugins/**/
└── locales/
    ├── zh-CN.json
    └── en-US.json
```

#### 1.4 共享包配置
```
packages/shared-core/
├── src/btc/plugins/i18n/locales/
│   ├── zh-CN.ts           # 核心业务词条 (扁平格式)
│   └── en-US.ts
└── src/utils/i18n/        # 国际化工具函数

packages/shared-components/
├── src/locales/
│   ├── zh-CN.json         # UI 组件翻译 (扁平格式)
│   └── en-US.json
└── src/i18n/locales/
    ├── zh-CN.ts           # TypeScript 格式 (嵌套格式)
    └── en-US.ts
```

### 2. 格式问题

#### 2.1 多种格式混用

**JSON 格式 (扁平化)**
```json
{
  "common.button.save": "保存",
  "common.button.cancel": "取消",
  "warehouse.material.fields.material_code": "物料编码"
}
```

**TypeScript 格式 (扁平化)**
```typescript
export default {
  'app.title': '拜里斯科技',
  'common.button.confirm': '确认',
  'menu.home': '首页'
}
```

**TypeScript 格式 (嵌套)**
```typescript
export const zhCN: GlobalLocaleMessages = {
  common: {
    button: {
      confirm: '确认',
      cancel: '取消'
    }
  }
}
```

**config.ts 中的 locale (扁平化)**
```typescript
export default {
  locale: {
    'zh-CN': {
      'warehouse.material.fields.material_code': '物料编码',
      'warehouse.material.fields.material_name': '物料名称'
    },
    'en-US': {
      'warehouse.material.fields.material_code': 'Material Code'
    }
  }
}
```

#### 2.2 命名规范不统一

存在多种命名风格:
- `common.button.save` (点分隔)
- `warehouse.material.fields.material_code` (4层嵌套)
- `menu.data.files.templates` (3层嵌套)
- `system.material.fields.bar_code` (下划线 + 点分隔混用)

### 3. 核心处理逻辑

#### 3.1 合并流程

当前系统通过 `registerSubAppI18n.ts` 处理国际化:

```typescript
// 1. 从 config.ts 提取 → 扁平化
extractI18nFromConfigFiles(configFiles) 
  → { 'zh-CN': {...}, 'en-US': {...} } // 扁平格式

// 2. 扁平化 → 嵌套化
unflattenObject(flatMessages) 
  → { common: { button: { save: '保存' } } }

// 3. 深度合并所有源
sharedCore + sharedComponents + config.ts + JSON files

// 4. 注册到全局
window.__SUBAPP_I18N_GETTERS__
```

#### 3.2 关键文件

| 文件 | 作用 | 复杂度 |
|------|------|--------|
| `registerSubAppI18n.ts` (626行) | 子应用国际化注册 | 🔴 非常高 |
| `setup-app-i18n.ts` | 应用级国际化设置 | 🟡 中等 |
| `create-locale-getters.ts` (216行) | 创建国际化获取器 | 🟡 中等 |
| `locale-utils.ts` | 扁平化/嵌套化工具 | 🟠 高 |

### 4. 存在的问题

#### 🔴 严重问题

1. **格式混乱**
   - JSON、TS 扁平格式、TS 嵌套格式混用
   - 无统一规范,开发者不知道该用哪种

2. **重复内容**
   - `common.button.*` 在多个应用重复定义
   - `crud.*` 相关翻译重复出现
   - `theme.*` 配置重复

3. **复杂的转换逻辑**
   - 626 行的 `registerSubAppI18n.ts`
   - 多次扁平化/嵌套化转换
   - 性能开销大

4. **维护困难**
   - 修改一个翻译需要改多个文件
   - 难以追踪翻译的来源
   - 容易产生冲突

#### 🟡 中等问题

5. **命名不规范**
   - `warehouse.material.fields.material_code` (4层)
   - `common.button.save` (3层)
   - `menu.home` (2层)
   - 深度不一致

6. **编码问题**
   - 用户规则要求 UTF-8 without BOM
   - 需要手动检查每个文件

7. **类型支持不足**
   - JSON 文件无类型提示
   - 扁平格式难以利用 TypeScript

#### 🟢 轻微问题

8. **文件过多**
   - 94+ locale JSON 文件
   - 管理复杂

9. **查找困难**
   - 不知道某个翻译在哪个文件
   - 全局搜索效率低

---

## 🎯 优化方案

### 方案一:统一格式 + 集中管理 (推荐)

#### 目标
- 统一使用 TypeScript 嵌套格式
- 集中管理通用翻译
- 保留模块级自定义

#### 新的目录结构

```
btc-shopflow-monorepo/
├── locales/                          # 🆕 顶级国际化目录
│   ├── shared/                       # 共享翻译
│   │   ├── common.ts                 # 通用词条 (按钮、表单等)
│   │   ├── crud.ts                   # CRUD 通用翻译
│   │   ├── theme.ts                  # 主题相关
│   │   ├── auth.ts                   # 认证相关
│   │   └── index.ts                  # 导出合并
│   ├── domains/                      # 领域翻译
│   │   ├── warehouse.ts              # 仓储领域
│   │   ├── procurement.ts            # 采购领域
│   │   ├── inventory.ts              # 盘点领域
│   │   └── index.ts
│   └── apps/                         # 应用特定翻译
│       ├── system.ts
│       ├── admin.ts
│       ├── logistics.ts
│       └── index.ts
│
├── apps/*/src/
│   └── i18n/
│       ├── index.ts                  # 仅导入和组合
│       └── custom.ts                 # 应用特定的自定义翻译 (可选)
│
└── packages/
    ├── shared-core/
    │   └── src/i18n/
    │       └── loader.ts             # 🆕 简化的加载器
    └── shared-components/
        └── src/i18n/
            └── components.ts         # UI 组件翻译
```

#### 统一的翻译格式

```typescript
// locales/shared/common.ts
import type { LocaleMessages } from '@btc/shared-core/i18n';

export const common: LocaleMessages = {
  'zh-CN': {
    button: {
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      search: '搜索',
      reset: '重置',
      add: '新增',
      edit: '编辑',
      refresh: '刷新',
      submit: '提交',
      back: '返回',
      close: '关闭',
      export: '导出',
      import: '导入'
    },
    form: {
      please_enter: '请输入',
      please_select: '请选择',
      required: '此项为必填项'
    },
    table: {
      index: '序号',
      operation: '操作',
      empty: '暂无数据',
      loading: '加载中...'
    },
    message: {
      success: '操作成功',
      error: '操作失败',
      warning: '警告',
      info: '提示',
      save_success: '保存成功',
      save_failed: '保存失败',
      delete_success: '删除成功',
      delete_confirm: '确定要删除吗?'
    }
  },
  'en-US': {
    button: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      search: 'Search',
      reset: 'Reset',
      add: 'Add',
      edit: 'Edit',
      refresh: 'Refresh',
      submit: 'Submit',
      back: 'Back',
      close: 'Close',
      export: 'Export',
      import: 'Import'
    },
    form: {
      please_enter: 'Please enter',
      please_select: 'Please select',
      required: 'This field is required'
    },
    table: {
      index: 'Index',
      operation: 'Operation',
      empty: 'No data',
      loading: 'Loading...'
    },
    message: {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      save_success: 'Saved successfully',
      save_failed: 'Save failed',
      delete_success: 'Deleted successfully',
      delete_confirm: 'Are you sure to delete?'
    }
  }
};
```

```typescript
// locales/domains/warehouse.ts
import type { LocaleMessages } from '@btc/shared-core/i18n';

export const warehouse: LocaleMessages = {
  'zh-CN': {
    module: {
      name: '仓储管理',
      description: '仓库、物料、库存管理'
    },
    material: {
      title: '物料管理',
      fields: {
        material_code: '物料编码',
        material_name: '物料名称',
        material_type: '物料类型',
        specification: '规格型号',
        unit: '单位',
        supplier_name: '供应商名称',
        unit_price: '单价',
        safety_stock: '安全库存'
      },
      actions: {
        add: '新增物料',
        edit: '编辑物料',
        delete: '删除物料',
        import: '导入物料'
      }
    },
    inventory: {
      title: '盘点管理',
      fields: {
        check_no: '盘点单号',
        check_type: '盘点类型',
        check_status: '盘点状态',
        checker_id: '盘点人',
        start_time: '开始时间',
        end_time: '结束时间'
      }
    }
  },
  'en-US': {
    module: {
      name: 'Warehouse Management',
      description: 'Warehouse, material and inventory management'
    },
    material: {
      title: 'Material Management',
      fields: {
        material_code: 'Material Code',
        material_name: 'Material Name',
        material_type: 'Material Type',
        specification: 'Specification',
        unit: 'Unit',
        supplier_name: 'Supplier Name',
        unit_price: 'Unit Price',
        safety_stock: 'Safety Stock'
      },
      actions: {
        add: 'Add Material',
        edit: 'Edit Material',
        delete: 'Delete Material',
        import: 'Import Materials'
      }
    },
    inventory: {
      title: 'Inventory Check',
      fields: {
        check_no: 'Check No.',
        check_type: 'Check Type',
        check_status: 'Check Status',
        checker_id: 'Checker',
        start_time: 'Start Time',
        end_time: 'End Time'
      }
    }
  }
};
```

```typescript
// locales/shared/index.ts
import { common } from './common';
import { crud } from './crud';
import { theme } from './theme';
import { auth } from './auth';
import type { LocaleMessages } from '@btc/shared-core/i18n';

export const sharedLocales: LocaleMessages = {
  'zh-CN': {
    ...common['zh-CN'],
    ...crud['zh-CN'],
    ...theme['zh-CN'],
    ...auth['zh-CN']
  },
  'en-US': {
    ...common['en-US'],
    ...crud['en-US'],
    ...theme['en-US'],
    ...auth['en-US']
  }
};
```

#### 应用级使用

```typescript
// apps/system-app/src/i18n/index.ts
import { createI18n } from 'vue-i18n';
import { sharedLocales } from '@workspace/locales/shared';
import { warehouse } from '@workspace/locales/domains/warehouse';
import { inventory } from '@workspace/locales/domains/inventory';
import { systemApp } from '@workspace/locales/apps/system';
import { sharedComponents } from '@btc/shared-components/i18n';

// 简单的深度合并
function deepMerge(target: any, source: any) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object') {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const messages = {
  'zh-CN': deepMerge(
    deepMerge(
      deepMerge(sharedLocales['zh-CN'], sharedComponents['zh-CN']),
      warehouse['zh-CN']
    ),
    inventory['zh-CN']
  ),
  'en-US': deepMerge(
    deepMerge(
      deepMerge(sharedLocales['en-US'], sharedComponents['en-US']),
      warehouse['en-US']
    ),
    inventory['en-US']
  )
};

export const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
});
```

#### 命名规范

```
层级规范:
- 2层: 通用功能 (common.button, crud.dialog)
- 3层: 领域实体 (warehouse.material.title, inventory.result.fields)
- 4层: 具体字段 (warehouse.material.fields.material_code)

命名规则:
✅ 使用小写 + 下划线
✅ 语义化命名
✅ 避免过深嵌套 (最多4层)
❌ 不使用驼峰命名
❌ 不使用中划线

示例:
✅ common.button.save
✅ warehouse.material.fields.material_code
✅ crud.message.delete_confirm
❌ common.button.saveBtn
❌ warehouseMaterialFieldsMaterialCode
❌ warehouse-material-fields-material-code
```

### 方案二:保留 config.ts + 优化格式

如果不想大规模重构,可以:

#### 1. 统一 config.ts 格式

```typescript
// apps/system-app/src/modules/warehouse/config.ts
import type { ModuleConfig } from '@btc/shared-core/types/module';

export default {
  name: 'warehouse',
  label: 'warehouse.module.name', // 引用翻译 key
  
  // 🆕 统一使用嵌套格式
  i18n: {
    'zh-CN': {
      module: {
        name: '仓储管理',
        description: '仓库物料管理'
      },
      material: {
        fields: {
          material_code: '物料编码',
          material_name: '物料名称'
        }
      }
    },
    'en-US': {
      module: {
        name: 'Warehouse',
        description: 'Warehouse material management'
      },
      material: {
        fields: {
          material_code: 'Material Code',
          material_name: 'Material Name'
        }
      }
    }
  },
  
  // 列配置使用 i18n key
  columns: [
    { 
      prop: 'materialCode', 
      label: 'warehouse.material.fields.material_code' 
    }
  ]
} satisfies ModuleConfig;
```

#### 2. 删除冗余的 JSON 文件

```bash
# 将 JSON 内容合并到 config.ts 后删除
apps/*/src/locales/zh-CN.json  # 删除
apps/*/src/locales/en-US.json  # 删除
```

#### 3. 简化加载逻辑

```typescript
// packages/shared-core/src/utils/i18n/simple-loader.ts
export function loadI18nFromConfigs(
  configFiles: Record<string, { default: any }>
) {
  const messages = { 'zh-CN': {}, 'en-US': {} };
  
  for (const path in configFiles) {
    const config = configFiles[path]?.default;
    if (!config?.i18n) continue;
    
    // 直接合并嵌套结构,无需转换
    Object.assign(messages['zh-CN'], config.i18n['zh-CN']);
    Object.assign(messages['en-US'], config.i18n['en-US']);
  }
  
  return messages;
}
```

---

## 📋 实施步骤

### 阶段一:准备工作 (1-2天)

1. **备份当前配置**
   ```bash
   # 创建备份分支
   git checkout -b backup/i18n-config-$(date +%Y%m%d)
   git push origin backup/i18n-config-$(date +%Y%m%d)
   ```

2. **分析重复内容**
   ```bash
   # 统计各应用的 common.* 翻译
   rg "\"common\." apps/*/src/locales/*.json
   
   # 提取到共享文件
   ```

3. **创建新的目录结构**
   ```bash
   mkdir -p locales/{shared,domains,apps}
   ```

### 阶段二:迁移共享翻译 (2-3天)

4. **提取通用词条**
   - `common.*` → `locales/shared/common.ts`
   - `crud.*` → `locales/shared/crud.ts`
   - `theme.*` → `locales/shared/theme.ts`
   - `auth.*` → `locales/shared/auth.ts`

5. **提取领域词条**
   - 仓储相关 → `locales/domains/warehouse.ts`
   - 采购相关 → `locales/domains/procurement.ts`
   - 盘点相关 → `locales/domains/inventory.ts`

6. **验证翻译完整性**
   ```typescript
   // scripts/validate-i18n.ts
   // 检查是否所有 zh-CN key 都有对应的 en-US
   ```

### 阶段三:迁移应用配置 (3-5天)

7. **逐个迁移应用**
   - 从 system-app 开始 (最复杂)
   - 然后 admin-app, logistics-app
   - 最后其他应用

8. **更新 config.ts**
   - 将 `locale` 改为 `i18n`
   - 扁平格式改为嵌套格式
   - 删除重复的通用翻译

9. **更新引用**
   ```typescript
   // 旧: label: 'warehouse.material.fields.material_code'
   // 新: label: 'warehouse.material.fields.material_code' (保持不变)
   ```

### 阶段四:清理和优化 (1-2天)

10. **删除冗余文件**
    ```bash
    # 删除旧的 JSON 文件
    find apps/*/src/locales -name "*.json" -delete
    
    # 删除旧的 TS 扁平文件
    find apps/*/src/i18n/locales -name "*.ts" -delete
    ```

11. **简化加载逻辑**
    - 删除复杂的 flatten/unflatten 转换
    - 使用简单的深度合并

12. **更新文档**
    - 编写新的国际化使用指南
    - 更新 README

### 阶段五:测试和验证 (2-3天)

13. **自动化测试**
    ```typescript
    // tests/i18n/completeness.test.ts
    describe('I18n Completeness', () => {
      it('所有 zh-CN key 都有 en-US 翻译', () => {
        // ...
      });
      
      it('所有应用都能正确加载翻译', () => {
        // ...
      });
    });
    ```

14. **手动测试**
    - 切换语言
    - 检查各个页面
    - 验证 CRUD 操作

15. **性能测试**
    - 对比优化前后的加载时间
    - 检查内存占用

---

## 🎯 优化效果预期

### 代码简化

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 国际化文件数量 | 94+ | ~30 | -68% |
| registerSubAppI18n.ts 行数 | 626 | 150 | -76% |
| 重复翻译 | ~200+ | 0 | -100% |
| 配置格式 | 3种混用 | 1种统一 | - |

### 开发体验

- ✅ 统一的格式,开发者易于理解
- ✅ TypeScript 类型支持,IDE 智能提示
- ✅ 集中管理,查找和修改方便
- ✅ 减少重复,降低维护成本
- ✅ 清晰的命名规范

### 性能提升

- ✅ 减少文件 I/O
- ✅ 简化合并逻辑
- ✅ 减少运行时转换
- ✅ 提升加载速度 (预计 20-30%)

---

## 🔧 工具和脚本

### 1. 迁移辅助脚本

```typescript
// scripts/migrate-i18n.ts
import fs from 'fs';
import path from 'path';

/**
 * 将扁平格式转换为嵌套格式
 */
function flatToNested(flat: Record<string, string>): any {
  const nested: any = {};
  
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = nested;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return nested;
}

/**
 * 从 JSON 文件提取并转换为 TS
 */
function migrateJsonToTs(jsonPath: string, outputPath: string) {
  const content = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const nested = flatToNested(content);
  
  const tsContent = `export default ${JSON.stringify(nested, null, 2)};`;
  fs.writeFileSync(outputPath, tsContent);
  
  console.log(`✅ Migrated: ${jsonPath} → ${outputPath}`);
}

// 使用示例
migrateJsonToTs(
  'apps/system-app/src/locales/zh-CN.json',
  'locales/apps/system-zh-CN.ts'
);
```

### 2. 完整性检查脚本

```typescript
// scripts/check-i18n-completeness.ts
import { glob } from 'glob';
import fs from 'fs';

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

async function checkCompleteness() {
  const files = await glob('locales/**/*.ts');
  const issues: string[] = [];
  
  for (const file of files) {
    const module = await import(path.resolve(file));
    const messages = module.default;
    
    if (!messages['zh-CN'] || !messages['en-US']) {
      issues.push(`❌ ${file}: 缺少语言版本`);
      continue;
    }
    
    const zhKeys = new Set(getAllKeys(messages['zh-CN']));
    const enKeys = new Set(getAllKeys(messages['en-US']));
    
    // 检查缺失的英文翻译
    for (const key of zhKeys) {
      if (!enKeys.has(key)) {
        issues.push(`❌ ${file}: 缺少英文翻译 "${key}"`);
      }
    }
    
    // 检查多余的英文翻译
    for (const key of enKeys) {
      if (!zhKeys.has(key)) {
        issues.push(`⚠️  ${file}: 多余的英文翻译 "${key}"`);
      }
    }
  }
  
  if (issues.length > 0) {
    console.error('\n🔴 发现问题:\n');
    issues.forEach(issue => console.error(issue));
    process.exit(1);
  } else {
    console.log('\n✅ 所有翻译完整!');
  }
}

checkCompleteness();
```

### 3. 重复检测脚本

```typescript
// scripts/find-duplicate-i18n.ts
import { glob } from 'glob';

async function findDuplicates() {
  const files = await glob('apps/*/src/locales/*.json');
  const allTranslations = new Map<string, string[]>();
  
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
    
    for (const [key, value] of Object.entries(content)) {
      if (!allTranslations.has(key)) {
        allTranslations.set(key, []);
      }
      allTranslations.get(key)!.push(file);
    }
  }
  
  console.log('\n🔍 重复的翻译 key:\n');
  
  for (const [key, files] of allTranslations) {
    if (files.length > 1) {
      console.log(`📝 ${key}`);
      files.forEach(file => console.log(`   - ${file}`));
      console.log('');
    }
  }
}

findDuplicates();
```

---

## 📚 最佳实践

### 1. 添加新翻译

```typescript
// ✅ 好的做法
// 1. 判断是否应该放在共享翻译中
// 2. 使用嵌套格式
// 3. 同时添加中英文

// locales/shared/common.ts
export const common = {
  'zh-CN': {
    button: {
      upload: '上传',  // 新增
    }
  },
  'en-US': {
    button: {
      upload: 'Upload',  // 新增
    }
  }
};

// ❌ 不好的做法
// 1. 在应用级重复定义通用翻译
// 2. 只添加中文,忘记英文
// 3. 使用扁平格式
```

### 2. 组织翻译结构

```typescript
// ✅ 好的结构
{
  warehouse: {
    module: { name, description },
    material: {
      title,
      fields: { ... },
      actions: { ... },
      messages: { ... }
    }
  }
}

// ❌ 不好的结构
{
  warehouse_module_name: '',
  warehouse_material_title: '',
  warehouse_material_field_code: '',  // 太扁平
}
```

### 3. 命名约定

```typescript
// ✅ 语义化命名
'warehouse.material.fields.material_code'
'crud.message.delete_confirm'
'common.button.save'

// ❌ 缩写或不清晰的命名
'wh.mat.f.mc'
'crud.msg.del_cfm'
'comm.btn.sv'
```

### 4. 使用翻译

```vue
<!-- ✅ 组件中使用 -->
<template>
  <el-button>{{ $t('common.button.save') }}</el-button>
  <el-table-column 
    :label="$t('warehouse.material.fields.material_code')" 
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const message = t('crud.message.save_success');
</script>
```

---

## 🚀 迁移检查清单

### 开始前
- [ ] 创建备份分支
- [ ] 通知团队成员
- [ ] 准备迁移脚本

### 迁移过程
- [ ] 创建新的目录结构
- [ ] 提取共享翻译
- [ ] 提取领域翻译
- [ ] 迁移应用配置
- [ ] 更新 config.ts 格式
- [ ] 删除冗余文件

### 完成后
- [ ] 运行完整性检查
- [ ] 运行重复检测
- [ ] 执行自动化测试
- [ ] 手动测试各应用
- [ ] 性能测试
- [ ] 更新文档
- [ ] 代码审查
- [ ] 合并到主分支

---

## 📞 支持和反馈

如有问题或建议,请联系:
- 技术负责人: [姓名]
- 邮箱: [email]
- 文档问题: 在项目仓库提 Issue

---

**文档版本**: v1.0  
**创建日期**: 2026-01-14  
**最后更新**: 2026-01-14
