import { type Ref, onBeforeUnmount } from 'vue';
import type { BtcInputProps } from '../types';

/**
 * Emit 函数类型（用于 composable）
 * 使用通用的函数类型，匹配 Vue 3 emit 函数的使用方式
 */
type BtcInputEmit = (event: string, ...args: any[]) => void;

/**
 * 防抖功能
 */
export function useInputDebounce(
  props: BtcInputProps,
  emit: BtcInputEmit,
  innerValue: Ref<string | number>
) {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const handleDebouncedUpdate = (value: string | number) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (props.debounce && props.debounce > 0) {
      debounceTimer = setTimeout(() => {
        emit('update:modelValue', value);
        emit('input', value);
        debounceTimer = null;
      }, props.debounce);
    } else {
      // 不防抖，直接触发
      emit('update:modelValue', value);
      emit('input', value);
    }
  };

  onBeforeUnmount(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  });

  return {
    handleDebouncedUpdate
  };
}

/**
 * 格式化函数映射
 */
const formatFunctions: Record<string, (value: string) => string> = {
  // 手机号格式化：138****1234
  phone: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`;
    }
    return `${cleaned.slice(0, 3)}****${cleaned.slice(7, 11)}`;
  },

  // 身份证号格式化
  idCard: (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 6) return cleaned;
    if (cleaned.length <= 14) {
      return `${cleaned.slice(0, 6)}********${cleaned.slice(14)}`;
    }
    return `${cleaned.slice(0, 6)}********${cleaned.slice(14, 18)}`;
  },

  // 金额千分位格式化
  amount: (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }
};

/**
 * 输入格式化功能
 */
export function useInputFormat(
  props: BtcInputProps,
  emit: BtcInputEmit,
  innerValue: Ref<string | number>
) {
  const formatValue = (value: string | number): string => {
    if (typeof value !== 'string') return String(value);
    if (!props.format) return value;

    if (props.format === 'custom' && props.customFormat) {
      return props.customFormat(value);
    }

    const formatter = formatFunctions[props.format];
    return formatter ? formatter(value) : value;
  };

  const handleFormatted = (value: string | number) => {
    if (props.format) {
      const formatted = formatValue(value);
      emit('formatted', formatted);
      return formatted;
    }
    return value;
  };

  return {
    formatValue,
    handleFormatted
  };
}

/**
 * 输入类型正则映射
 */
const inputTypePatterns: Record<string, RegExp> = {
  number: /^\d*$/,
  letter: /^[a-zA-Z]*$/,
  alphanumeric: /^[a-zA-Z0-9]*$/,
  noEmoji: /^[^\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]*$/u
};

/**
 * 输入限制功能
 */
export function useInputRestrict(props: BtcInputProps) {
  const isInputAllowed = (value: string): boolean => {
    if (!props.inputType) return true;

    if (props.inputType === 'custom' && props.customInputPattern) {
      return props.customInputPattern.test(value);
    }

    const pattern = inputTypePatterns[props.inputType];
    return pattern ? pattern.test(value) : true;
  };

  const restrictInput = (value: string): string => {
    if (!props.inputType) return value;

    if (props.inputType === 'custom' && props.customInputPattern) {
      return value.split('').filter(char => props.customInputPattern!.test(char)).join('');
    }

    const pattern = inputTypePatterns[props.inputType];
    if (pattern) {
      return value.split('').filter(char => pattern.test(char)).join('');
    }

    return value;
  };

  return {
    isInputAllowed,
    restrictInput
  };
}
