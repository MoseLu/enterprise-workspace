# i18n 最佳实践

## 概述

本文档总结了 BTC Shopflow 项目中国际化（i18n）的最佳实践，基于实际优化经验。

## 核心原则

### 1. 使用扁平结构

**为什么使用扁平结构？**

- ✅ 更易于维护和查找
- ✅ 避免深层嵌套导致的路径过长
- ✅ 支持动态 key 查找
- ✅ 与后端 API 响应格式一致

**示例**:
```typescript
// ✅ 推荐：扁平结构
'common.button.submit'
'common.button.cancel'
'menu.navigation.menus'

// ❌ 不推荐：深层嵌套
'common.button.actions.submit'
```

详细说明请参考：[扁平结构说明](./flat-structure.md)

### 2. 命名规范

**命名规则**:
- 使用点号（`.`）分隔层级
- 使用小写字母和连字符（`-`）
- 保持语义清晰
- 避免过长的 key

**示例**:
```typescript
// ✅ 好的命名
'menu.navigation.menus'
'form.validation.required'
'common.button.submit'

// ❌ 不好的命名
'menuNavigationMenus'  // 缺少层级
'form_validation_required'  // 使用下划线
'BTN_SUBMIT'  // 全大写
```

详细规范请参考：[命名规范](./naming-convention.md)

### 3. 加载顺序

**消息加载顺序**:
1. 共享包消息（shared-components、shared-core）
2. 应用级消息（apps/*/i18n/）
3. 模块级消息（modules/*/config.ts 中的 locale）

**关键点**:
- 后加载的消息会覆盖先加载的消息
- 模块消息优先级最高
- 共享消息作为基础

详细说明请参考：[加载顺序](./loading-order.md)

## 开发规范

### 1. ESLint 规则

使用 ESLint 规则确保 i18n key 的正确使用：

- 禁止硬编码中文
- 强制使用 i18n key
- 检查 key 是否存在

详细规则请参考：[ESLint 规则](./eslint-rules.md)

### 2. 代码示例

```vue
<template>
  <div>
    <!-- ✅ 正确：使用 i18n key -->
    <el-button>{{ t('common.button.submit') }}</el-button>
    
    <!-- ❌ 错误：硬编码中文 -->
    <el-button>提交</el-button>
  </div>
</template>

<script setup>
import { useI18n } from '@btc/shared-core';

const { t } = useI18n();
</script>
```

### 3. 动态 key

支持动态 key 构建：

```typescript
// ✅ 支持动态 key
const key = `menu.${moduleName}.${actionName}`;
t(key);

// ✅ 使用参数
t('message.welcome', { name: userName });
```

## 性能优化

### 1. 按需加载

- 只加载当前语言的消息
- 使用动态导入减少初始包大小
- 模块消息延迟加载

### 2. 消息缓存

- 已加载的消息会被缓存
- 避免重复加载相同消息
- 支持热更新

## 常见问题

### Q: 如何添加新的 i18n key？

A: 在对应模块的 `config.ts` 中的 `locale` 字段添加：

```typescript
export default {
  locale: {
    'zh-CN': {
      'menu.new.feature': '新功能',
    },
    'en-US': {
      'menu.new.feature': 'New Feature',
    },
  },
} satisfies ModuleConfig;
```

### Q: 如何查找 i18n key？

A: 使用搜索功能：
- 在代码中搜索 key 的使用位置
- 在 locale 配置中搜索 key 的定义
- 使用 ESLint 规则检查未使用的 key

### Q: 如何处理动态内容？

A: 使用参数插值：

```typescript
t('message.item.count', { count: itemCount })
// 消息定义: 'message.item.count': '共有 {count} 项'
```

## 迁移建议

如果从旧的结构迁移：

1. **逐步迁移**: 不要一次性迁移所有 key
2. **保持兼容**: 保留旧 key 一段时间
3. **更新文档**: 同步更新相关文档
4. **团队培训**: 确保团队了解新规范

## 相关文档

- [快速开始](./quick-start.md) - 5 分钟上手
- [扁平结构说明](./flat-structure.md) - 架构决策
- [命名规范](./naming-convention.md) - 命名规则
- [ESLint 规则](./eslint-rules.md) - 代码检查
- [加载顺序](./loading-order.md) - 加载机制

## 参考资源

- [优化分析 v1](../../archive/i18n/optimization-analysis-v1.md) - 第一次优化分析
- [优化分析 v2](../../archive/i18n/optimization-analysis-v2.md) - 第二次优化分析
