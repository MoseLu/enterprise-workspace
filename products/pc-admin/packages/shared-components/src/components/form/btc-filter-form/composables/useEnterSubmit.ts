/**
 * Enter 提交防抖处理 Composable
 */

import { ref, type Ref } from 'vue';
import type { FormInstance } from 'element-plus';

export interface UseEnterSubmitOptions {
  /**
   * 表单实例引用
   */
  formRef: Ref<FormInstance | undefined>;

  /**
   * 提交回调函数
   */
  onSubmit: () => void | Promise<void>;

  /**
   * 是否启用 Enter 提交
   */
  enabled?: boolean;

  /**
   * 防抖延迟（毫秒）
   */
  debounce?: number;

  /**
   * 输入元素选择器
   */
  inputSelector?: string;
}

/**
 * Enter 提交防抖处理
 */
export function useEnterSubmit(options: UseEnterSubmitOptions) {
  const {
    formRef,
    onSubmit,
    enabled = true,
    debounce = 300,
    inputSelector = 'input:not([type="hidden"]), textarea, select, .el-input__inner, .el-select__wrapper, .el-date-editor',
  } = options;

  // 防抖定时器
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const isSubmitting = ref(false);

  /**
   * 处理 Enter 键事件（带防抖）
   */
  const handleEnterKey = async (event: KeyboardEvent) => {
    if (!enabled) return;

    // 只在按下 Enter 键时处理（排除 Shift+Enter 等组合键）
    if (event.key !== 'Enter' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    // 如果正在提交中，忽略
    if (isSubmitting.value) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // 阻止默认行为和事件冒泡
    event.preventDefault();
    event.stopPropagation();

    // 清除之前的定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    // 设置防抖定时器
    debounceTimer = setTimeout(async () => {
      try {
        isSubmitting.value = true;
        await onSubmit();
      } finally {
        // 延迟重置标记，避免快速连续提交
        setTimeout(() => {
          isSubmitting.value = false;
          debounceTimer = null;
        }, debounce);
      }
    }, debounce);
  };

  /**
   * 清理防抖定时器
   */
  const clearDebounce = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  };

  return {
    handleEnterKey,
    clearDebounce,
    isSubmitting,
  };
}
