<template>
  <el-table-column
    v-if="!column.hidden"
    v-bind="column"
    :resizable="getColumnResizable(column)"
  >
    <!-- 多级表头：递归渲染子列 -->
    <template v-if="column.children && column.children.length > 0">
      <table-column
        v-for="(child, childIndex) in column.children"
        :key="child.prop || childIndex"
        :column="child"
      />
    </template>

    <!-- 普通列内容 -->
    <template v-if="!column.children && column.type !== 'selection' && column.type !== 'index' && column.type !== 'expand' && column.type !== 'op'" #default="scope">
      <component :is="() => renderContent(column, scope)" />
    </template>

    <!-- 操作列-->
    <template v-if="!column.children && column.type === 'op'" #default="scope">
      <slot name="op-slot" :scope="scope" :column="column" />
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { h, getCurrentInstance, toRaw, resolveComponent, inject, computed, unref, type ComputedRef } from 'vue';
import type { TableColumn } from '../types';
import { BtcCodeJson } from '@btc/shared-components/plugins/code';
import BtcTag from '../../../components/basic/btc-tag/index.vue';
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'TableColumn',
});

defineProps<{
  column: TableColumn;
}>();

const instance = getCurrentInstance();

// Inject tagRound from table component
const tableTagRoundKey = Symbol.for('btc-table-tag-round');
const tagRoundRef = inject<{ value: boolean } | ComputedRef<boolean> | undefined>(tableTagRoundKey);
const tagRound = computed(() => {
  if (!tagRoundRef) return false;
  // 如果是 computed ref，直接访问 .value；如果是普通对象，也访问 .value
  return unref(tagRoundRef as any) ?? false;
});

/**
 * 判断字符串是否是国际化 key（而不是翻译后的值）
 * 国际化 key 的格式：以字母开头，包含至少一个点，且点前后都有非空字符
 */
function isI18nKey(str: string): boolean {
  if (!str.includes('.')) {
    return false;
  }
  const parts = str.split('.');
  if (parts.length < 2) {
    return false;
  }
  const firstPart = parts[0]?.trim();
  if (!firstPart || !/^[a-zA-Z]/.test(firstPart)) {
    return false;
  }
  return parts.every(part => part.trim().length > 0);
}

/**
 * 安全的翻译函数，确保返回字符串
 */
function safeTranslate(key: string): string {
  try {
    const { t } = useI18n();
    const result = t(key);
    // 确保返回字符串类型
    if (typeof result === 'string') {
      return result;
    }
    // 如果不是字符串，转换为字符串
    return String(result || key);
  } catch (error) {
    // 翻译失败，返回原 key
    console.warn('[table-column] Translation failed:', error);
    return key;
  }
}

// 组件名称到组件实例的映射
const componentMap: Record<string, any> = {
  'BtcCodeJson': BtcCodeJson,
  'btc-code-json': BtcCodeJson,
};

// 渲染列内容
const renderContent = (column: TableColumn, scope: any) => {
  if (column.component?.name === 'cl-dict' && column.prop) {
    const rawValue = scope.row[column.prop!];
    const props = getComponentProps(column.component.props, scope);
    const dictSource =
      column.dict ||
      props?.dict ||
      props?.options ||
      [];
    const dictArray = Array.isArray(dictSource) ? dictSource : [];
    const values = Array.isArray(rawValue)
      ? rawValue
      : rawValue == null || rawValue === ''
        ? []
        : (typeof rawValue === 'string' && rawValue.includes(','))
          ? rawValue.split(',').map((item: string) => item.trim()).filter(Boolean)
          : [rawValue];
    const labels = values.map((val: any) => {
      const match = dictArray.find((item: any) => item?.value === val || item?.value === Number(val) || String(item?.value) === String(val));
      if (match && match.label != null) {
        const label = match.label;
        // 如果 label 是国际化 key，进行翻译
        return typeof label === 'string' && isI18nKey(label) ? safeTranslate(label) : label;
      }
      return val ?? '';
    });
    const display = labels.length > 0 ? labels.join('、') : '';
    return h('span', { class: 'btc-table-dict-cell' }, display);
  }

  // 字典颜色标签
  if (column._dictFormatter && column.prop) {
    const dict = column._dictFormatter(scope.row);
    // 使用 _tagEffect，如果没有设置则使用默认值 'plain'
    const tagEffect = (column as any)._tagEffect || 'plain';
    // plain 效果使用 hit 描边，light 效果不使用描边
    const hit = tagEffect === 'plain';
    return h(BtcTag, {
      type: dict.type as any,
      size: 'small',
      effect: tagEffect,
      hit: hit,
      round: tagRound.value,
      disableTransitions: true,
    }, { default: () => dict.label });
  }

  // 自动 code/status/type 字段标签渲染
  if (column._codeTagFormatter && column.prop) {
    const tagInfo = column._codeTagFormatter(scope.row);
    if (tagInfo.label) {
      // 使用 _tagEffect，如果没有设置则使用默认值 'plain'
      const tagEffect = (column as any)._tagEffect || 'plain';
      // plain 效果使用 hit 描边，light 效果不使用描边
      const hit = tagEffect === 'plain';
      return h(BtcTag, {
        type: tagInfo.type as any,
        size: 'small',
        effect: tagEffect,
        hit: hit,
        round: tagRound.value,
        disableTransitions: true,
      }, { default: () => tagInfo.label });
    }
  }

  // 自定义渲染组件
  if (column.component && column.prop) {
    // 获取原始值，如果为 null 或 undefined 则使用空字符串
    const rawValue = scope.row[column.prop!];
    const modelValue = rawValue == null ? '' : rawValue;

    const props = {
      modelValue,
      ...getComponentProps(column.component.props, scope)
    };

    const componentName = column.component.name;
    if (typeof componentName === 'string') {
      // 从预定义的映射中获取组件
      const component =
        componentMap[componentName] ||
        instance?.appContext.app.component?.(componentName);
      if (component) {
        return h(toRaw(component), props);
      }
      const resolved = resolveComponent(componentName);
      if (resolved && typeof resolved !== 'string') {
        return h(resolved, props);
      }
      // 如果找不到，回退到显示原始值
      return h('span', {}, { default: () => rawValue || '' });
    }
    // 如果是组件对象，直接使用
    return h(column.component.name, props);
  }

  // 格式化器
  if (column.formatter && column.prop) {
    return h('span', {}, {
      default: () => column.formatter!(
        scope.row,
        scope.column,
        scope.row[column.prop!],
        scope.$index
      )
    });
  }

  // 默认显示
  if (column.prop) {
    return h('span', {}, { default: () => scope.row[column.prop!] || '' });
  }

  return null;
};

// 获取组件属性
const getComponentProps = (props: any, scope: any) => {
  if (!props) return {};

  // 如果是函数，先执行获取属性
  if (typeof props === 'function') {
    return props(scope);
  }

  // 如果是对象，规范化布尔值属性
  if (typeof props === 'object' && props !== null) {
    const normalized = { ...props };
    // 将字符串 'true' 和 'false' 转换为布尔值
    for (const key in normalized) {
      if (normalized[key] === 'true') {
        normalized[key] = true;
      } else if (normalized[key] === 'false') {
        normalized[key] = false;
      }
    }
    return normalized;
  }

  return props;
};

// 智能判断列是否可调整宽度
const getColumnResizable = (column: TableColumn): boolean => {
  // 如果明确设置了 resizable 属性，使用该值
  if (column.resizable !== undefined) {
    return column.resizable;
  }

  // 默认规则：所有列都支持调整（除了明确禁用的类型）
  const nonResizableTypes = ['selection', 'index'];
  const result = !nonResizableTypes.includes(column.type || '');

  return result;
};
</script>


