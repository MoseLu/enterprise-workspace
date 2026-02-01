<template>
  <div 
    class="btc-input" 
    :class="[
      `btc-input--${size}`,
      { [`btc-input--${validateStatus}`]: validateStatus }
    ]"
    :style="containerStyle"
  >
    <!-- tiny 模式：图标按钮 -->
    <button
      v-if="size === 'tiny'"
      ref="iconButtonRef"
      class="btc-input__icon-btn"
      type="button"
      :aria-label="($attrs.placeholder as string) || '输入'"
      :title="($attrs.placeholder as string) || '输入'"
      :disabled="($attrs.disabled as boolean) || false"
      @click="handleIconButtonClick"
      @focus="handleIconButtonFocus"
    >
      <slot name="icon">
        <BtcSvg name="search" :size="18" />
      </slot>
    </button>

    <!-- 普通模式：输入框 -->
    <el-input
      v-else
      ref="inputRef"
      v-model="innerValue"
      v-bind="inputAttrs"
      @update:model-value="handleUpdate"
      @input="handleInput"
      @change="handleChange"
      @blur="handleBlur"
      @focus="handleFocus"
      @clear="handleClear"
    >
      <!-- 透传插槽（只在有内容时才定义，避免空插槽导致 el-input-group 渲染） -->
      <template #prefix>
        <slot name="prefix"></slot>
      </template>
      <template #suffix>
        <slot name="suffix"></slot>
      </template>
    </el-input>
    
    <!-- 自定义校验提示 -->
    <div v-if="validateStatus && size !== 'tiny'" class="btc-input__tip">
      <slot :name="`${validateStatus}Tip`">
        <span :class="`btc-input__tip--${validateStatus}`">
          {{ getTipMessage() }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, useAttrs } from 'vue';
import type { InputInstance } from 'element-plus';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import type { BtcInputProps, BtcInputEmits } from './types';
import { useInputDebounce, useInputFormat, useInputRestrict } from './composables/useInputCommon';

const $attrs = useAttrs();

defineOptions({
  name: 'BtcInput',
  inheritAttrs: false
});

const props = withDefaults(defineProps<BtcInputProps>(), {
  modelValue: '',
  size: 'default',
  debounce: 0,
  formatTrigger: 'blur'
});

const emit = defineEmits<BtcInputEmits>();

const inputRef = ref<InputInstance>();
const iconButtonRef = ref<HTMLButtonElement>();
const innerValue = ref(props.modelValue);

// 计算容器样式（auto 尺寸需要 100% 宽度）
const containerStyle = computed(() => {
  if (props.size === 'auto') {
    return { width: '100%' };
  }
  return {};
});

// 计算传递给 el-input 的 size 属性
const inputSize = computed(() => {
  if (props.size === 'tiny' || props.size === 'auto') {
    return undefined; // 使用默认尺寸
  }
  // 将 middle 映射为 default（Element Plus 使用 default 作为中等尺寸）
  if (props.size === 'middle') {
    return 'default';
  }
  return props.size;
});

// 计算传递给 el-input 的 attrs
const inputAttrs = computed(() => {
  const { 
    size, 
    debounce, 
    format, 
    customFormat, 
    formatTrigger, 
    inputType, 
    customInputPattern,
    validateStatus,
    errorMessage,
    successMessage,
    warningMessage,
    ...restProps 
  } = props;
  return {
    ...restProps,
    ...$attrs,
    size: inputSize.value
  };
});

// 使用 composables（tiny 模式不使用）
const { handleDebouncedUpdate } = useInputDebounce(props, emit, innerValue);
const { formatValue, handleFormatted } = useInputFormat(props, emit, innerValue);
const { restrictInput } = useInputRestrict(props);

// 处理输入更新（tiny 模式不处理）
const handleUpdate = (value: string | number) => {
  if (props.size === 'tiny') return;
  
  // 输入限制
  let processedValue = typeof value === 'string' ? restrictInput(value) : value;
  
  // 更新内部值（立即更新，保证UI响应）
  innerValue.value = processedValue;
  
  // 格式化（根据 formatTrigger 决定时机）
  if (props.format && props.formatTrigger === 'input') {
    processedValue = formatValue(processedValue);
    innerValue.value = processedValue;
  }
  
  // 防抖更新
  handleDebouncedUpdate(processedValue);
};

// 处理 input 事件
const handleInput = (value: string | number) => {
  if (props.size === 'tiny') return;
  // input 事件已经在 handleUpdate 中通过 handleDebouncedUpdate 触发
};

// 处理 change 事件
const handleChange = (value: string | number) => {
  if (props.size === 'tiny') return;
  emit('change', value);
};

// 处理失焦（格式化）
const handleBlur = (event: FocusEvent) => {
  if (props.size === 'tiny') {
    emit('blur', event);
    return;
  }
  
  if (props.format && props.formatTrigger === 'blur') {
    const formatted = formatValue(innerValue.value);
    innerValue.value = formatted;
    handleDebouncedUpdate(formatted);
  }
  emit('blur', event);
};

// 处理聚焦
const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

// 处理清空
const handleClear = () => {
  innerValue.value = '';
  handleDebouncedUpdate('');
  emit('clear');
};

// tiny 模式：图标按钮点击处理
const handleIconButtonClick = () => {
  emit('icon-click');
};

const handleIconButtonFocus = (event: FocusEvent) => {
  emit('focus', event);
};

// 获取提示消息
const getTipMessage = () => {
  switch (props.validateStatus) {
    case 'error':
      return props.errorMessage || '';
    case 'success':
      return props.successMessage || '';
    case 'warning':
      return props.warningMessage || '';
    default:
      return '';
  }
};

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  innerValue.value = newVal;
});

// 暴露方法
defineExpose({
  inputRef,
  iconButtonRef,
  focus: () => {
    if (props.size === 'tiny') {
      iconButtonRef.value?.focus();
    } else {
      inputRef.value?.focus();
    }
  },
  blur: () => {
    if (props.size === 'tiny') {
      iconButtonRef.value?.blur();
    } else {
      inputRef.value?.blur();
    }
  },
  select: () => {
    if (props.size !== 'tiny') {
      inputRef.value?.select();
    }
  },
  reset: () => {
    innerValue.value = '';
    emit('update:modelValue', '');
  }
});
</script>

<style lang="scss" scoped>
.btc-input {
  // 确保容器本身不影响布局
  display: inline-block;
  width: 100%;

  // 默认尺寸样式（复用左侧菜单搜索框样式）
  // 使用更高优先级的选择器，确保覆盖 Element Plus 默认样式
  :deep(.el-input) {
    width: 100%;

    .el-input__wrapper {
      background-color: rgba(255, 255, 255, 0.1) !important;
      // 移除 Element Plus 默认的 inset box-shadow，避免视觉上叠加
      box-shadow: none !important;
      height: 27px !important;
      padding: 0 12px !important;
      border-radius: 6px !important;
      // 确保没有额外的边框
      border: none !important;

      .el-input__inner {
        font-size: 13px !important;
      }
    }

    .el-input__prefix {
      display: flex !important;
      align-items: center !important;
    }
  }

  // auto 尺寸：自适应宽度
  &--auto {
    width: 100%;

    :deep(.el-input) {
      width: 100%;
    }
  }

  // tiny 尺寸：图标按钮模式（参考 btc-search-key）
  &--tiny {
    display: inline-flex;
    width: auto;

    .btc-input__icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      padding: 0;
      border: 1px solid var(--el-border-color);
      background-color: transparent;
      color: var(--el-text-color-regular);
      cursor: pointer;
      border-radius: 6px;
      box-sizing: border-box;
      transition: background-color 0.2s ease, color 0.2s ease;
      outline: none;

      &:hover:not(:disabled),
      &:focus-visible:not(:disabled) {
        color: var(--el-color-primary);
        background-color: transparent;
      }

      &:focus-visible:not(:disabled) {
        outline: 2px solid var(--el-color-primary);
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .btc-svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  // 校验提示样式
  &__tip {
    font-size: 12px;
    margin-top: 4px;
    line-height: 1.5;

    &--error {
      color: var(--el-color-error);
    }

    &--success {
      color: var(--el-color-success);
    }

    &--warning {
      color: var(--el-color-warning);
    }
  }
}
</style>
