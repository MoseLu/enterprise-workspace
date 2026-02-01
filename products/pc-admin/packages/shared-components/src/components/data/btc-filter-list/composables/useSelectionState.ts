import { ref, computed } from 'vue';
import type { FilterCategory, FilterResult, BtcFilterListEmits } from '../types';

/**
 * 选择状态管理 composable
 */
export function useSelectionState(
  categories: { value: FilterCategory[] },
  emit: {
    (event: 'change', result: FilterResult[]): void;
    (event: 'update:modelValue', result: FilterResult[]): void;
    [key: string]: (...args: any[]) => void;
  }
) {
  // 选择状态：{ categoryId: [optionValue1, optionValue2, ...] }
  const selectedValues = ref<Record<string, any[]>>({});

  // 获取分类的已选数量
  const getSelectedCount = (categoryId: string) => {
    return (selectedValues.value[categoryId] || []).length;
  };

  // 判断分类是否全选
  const isCategoryAllSelected = (categoryId: string): boolean => {
    const category = categories.value.find(c => c.id === categoryId);
    if (!category || category.options.length === 0) {
      return false;
    }
    const selected = selectedValues.value[categoryId] || [];
    return selected.length === category.options.length && selected.length > 0;
  };

  // 判断分类是否部分选中（indeterminate状态）
  const isCategoryIndeterminate = (categoryId: string): boolean => {
    const category = categories.value.find(c => c.id === categoryId);
    if (!category || category.options.length === 0) {
      return false;
    }
    const selected = selectedValues.value[categoryId] || [];
    return selected.length > 0 && selected.length < category.options.length;
  };

  // 处理分类全选/取消全选
  const handleCategorySelectAll = (categoryId: string, checked: boolean, onAfterChange?: () => void) => {
    const category = categories.value.find(c => c.id === categoryId);
    if (!category) {
      return;
    }

    if (checked) {
      // 全选：选中该分类下的所有选项
      // 重要：只提取原始值，避免循环引用
      selectedValues.value[categoryId] = category.options.map(opt => {
        const value = opt.value;
        // 如果是对象，尝试提取可序列化的值；否则直接使用原始值
        if (value && typeof value === 'object') {
          // 如果是对象，尝试提取 id 或其他标识符
          if ('id' in value) {
            return value.id;
          }
          // 否则尝试 JSON 序列化（如果可能）
          try {
            return JSON.parse(JSON.stringify(value));
          } catch {
            // 如果序列化失败，使用 String 转换
            return String(value);
          }
        }
        return value;
      });
    } else {
      // 取消全选：清空该分类下的所有选项
      selectedValues.value[categoryId] = [];
    }

    // 输出结果
    emitChange();
    // 触发回调
    if (onAfterChange) {
      onAfterChange();
    }
  };

  // 处理选择变化
  const handleSelectionChange = (categoryId: string, onAfterChange?: () => void) => {
    // 输出结果
    emitChange();
    // 触发回调
    if (onAfterChange) {
      onAfterChange();
    }
  };

  // 处理标签关闭
  const handleTagClose = (categoryId: string, optionValue: any, onAfterChange?: () => void) => {
    const values = selectedValues.value[categoryId] || [];
    const index = values.indexOf(optionValue);
    if (index > -1) {
      values.splice(index, 1);
      selectedValues.value[categoryId] = values;
      emitChange();
      // 触发回调
      if (onAfterChange) {
        onAfterChange();
      }
    }
  };

  // 输出结果
  const emitChange = () => {
    const result: FilterResult[] = [];
    Object.keys(selectedValues.value).forEach(categoryId => {
      const values = selectedValues.value[categoryId];
      if (values && values.length > 0) {
        // 重要：创建全新的数组，避免循环引用
        // 确保 value 数组中的元素都是可序列化的原始值
        const cleanValues = values.map(v => {
          // 如果是对象，尝试提取可序列化的值
          if (v && typeof v === 'object') {
            try {
              // 尝试 JSON 序列化/反序列化，去除循环引用
              return JSON.parse(JSON.stringify(v));
            } catch {
              // 如果序列化失败，尝试提取 id
              if ('id' in v) {
                return v.id;
              }
              // 最后尝试 String 转换
              return String(v);
            }
          }
          return v;
        });
        result.push({
          name: categoryId,
          value: cleanValues,
        });
      }
    });
    emit('change', result);
    emit('update:modelValue', result);
  };

  // 清除所有已选中的选项
  const clearAll = (onAfterChange?: () => void) => {
    // 清空所有分类的选中值
    Object.keys(selectedValues.value).forEach(categoryId => {
      selectedValues.value[categoryId] = [];
    });
    // 输出结果（空结果）
    emitChange();
    // 触发回调
    if (onAfterChange) {
      onAfterChange();
    }
  };

  return {
    selectedValues,
    getSelectedCount,
    isCategoryAllSelected,
    isCategoryIndeterminate,
    handleCategorySelectAll,
    handleSelectionChange,
    handleTagClose,
    clearAll,
  };
}