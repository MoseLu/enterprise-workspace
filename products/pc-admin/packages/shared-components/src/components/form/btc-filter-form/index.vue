<template>
  <div class="btc-filter-form">
    <!-- 表单头部：标题和展开/收起按钮 -->
    <div class="btc-filter-form__header">
      <span class="btc-filter-form__title">{{ title }}</span>
      <el-button
        v-if="hasExpandableItems"
        link
        type="primary"
        size="small"
        @click="toggleExpand"
        class="btc-filter-form__expand-toggle"
      >
        {{ isExpanded ? '收起' : '展开' }}
        <el-icon style="margin-left: 4px">
          <ArrowUp v-if="isExpanded" />
          <ArrowDown v-else />
        </el-icon>
      </el-button>
    </div>
    <!-- 表单内容 -->
    <div class="btc-filter-form__content">
      <BtcForm
        ref="formRef"
        :inner="true"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { BtcForm } from '@btc/shared-components';
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import type { BtcFilterFormProps, BtcFilterFormEmits } from './types';
import { useEnterSubmit } from './composables/useEnterSubmit';
import type { FormInstance } from 'element-plus';

defineOptions({
  name: 'BtcFilterForm',
});

const props = withDefaults(defineProps<BtcFilterFormProps>(), {
  modelValue: () => ({}),
  items: () => [],
  title: '筛选条件',
  defaultExpand: false,
  enableEnterSubmit: true,
  enterDebounce: 300,
  labelWidth: '100px',
  labelPosition: 'right',
  gutter: 12,
});

const emit = defineEmits<BtcFilterFormEmits>();

// 表单引用
// 使用 any 类型避免类型检查错误（BtcForm 的方法通过 defineExpose 暴露，但类型定义不完整）
const formRef = ref<any>(null);

// 展开/收起状态
const isExpanded = ref(props.defaultExpand);

// 检查是否有可展开的表单项（有 hidden 属性的表单项）
const hasExpandableItems = computed(() => {
  return props.items.some(item => item.hidden !== undefined);
});

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit('expand-change', isExpanded.value);
  
  // 更新表单项配置：重新设置 items，更新 hidden 属性
  if (formRef.value && isInitialized.value) {
    const processedItems = props.items.map(item => {
      if (item.hidden !== undefined) {
        // 如果 hidden 是函数，根据展开状态计算
        if (typeof item.hidden === 'function') {
          return { ...item, hidden: !item.hidden({ scope: isExpanded.value }) };
        }
        // 如果 hidden 是布尔值，根据展开状态取反
        // 注意：BtcForm 中 hidden: true 表示隐藏，所以如果原始 hidden 表示"收起时隐藏"，则展开时应该是 hidden: false
        return { ...item, hidden: !isExpanded.value };
      }
      return item;
    });
    
    // 更新表单项配置
    formRef.value.setConfig('items', processedItems);
  }
};

// 是否已初始化标记
const isInitialized = ref(false);

// 初始化表单的函数
const initForm = () => {
  console.log('[BtcFilterForm] initForm called', {
    hasFormRef: !!formRef.value,
    itemsLength: props.items.length,
    items: props.items,
    modelValue: props.modelValue,
  });
  
  if (!formRef.value) {
    console.warn('[BtcFilterForm] formRef.value is null, cannot initialize');
    return;
  }
  
  // 如果 items 为空，不初始化
  if (props.items.length === 0) {
    console.warn('[BtcFilterForm] items is empty, cannot initialize');
    return;
  }
  
  console.log('[BtcFilterForm] Opening form with items:', props.items);
  
  // 处理表单项的 hidden 属性：根据展开状态动态设置
  const processedItems = props.items.map(item => {
    if (item.hidden !== undefined) {
      // 如果 hidden 是函数，根据展开状态计算
      if (typeof item.hidden === 'function') {
        return { ...item, hidden: !item.hidden({ scope: isExpanded.value }) };
      }
      // 如果 hidden 是布尔值，根据展开状态取反
      return { ...item, hidden: !isExpanded.value };
    }
    return item;
  });
  
  // 初始化表单配置
  formRef.value.open({
    items: processedItems,
    props: {
      labelWidth: props.labelWidth,
      labelPosition: props.labelPosition,
      gutter: props.gutter,
    },
    op: { hidden: true }, // 隐藏底部按钮
    form: props.modelValue || {},
    on: {
      submit: handleSubmit,
    },
  });

  console.log('[BtcFilterForm] Form opened, config:', formRef.value.config);

  // 绑定表单数据
  if (props.modelValue) {
    console.log('[BtcFilterForm] Binding form data:', props.modelValue);
    formRef.value.bindForm(props.modelValue);
  }

  // 标记为已初始化
  isInitialized.value = true;
  console.log('[BtcFilterForm] Form initialized successfully');

  // 如果启用 Enter 提交，为表单添加 Enter 键事件监听
  if (props.enableEnterSubmit) {
    nextTick(() => {
      setupEnterKeyListener();
    });
  }
};

// 初始化表单
onMounted(() => {
  console.log('[BtcFilterForm] onMounted', {
    itemsLength: props.items.length,
    items: props.items,
    modelValue: props.modelValue,
    hasFormRef: !!formRef.value,
  });
  
  // 监听表单数据变化，同步到外部（使用浅比较，避免循环引用）
  watch(
    () => formRef.value?.form,
    (formData) => {
      if (formData) {
        // 创建新对象，避免循环引用
        emit('update:modelValue', { ...formData });
      }
    },
    { deep: false } // 改为浅比较，避免循环引用导致的栈溢出
  );
  
  // 延迟初始化，确保 DOM 已渲染
  nextTick(() => {
    nextTick(() => {
      console.log('[BtcFilterForm] nextTick after onMounted', {
        itemsLength: props.items.length,
        items: props.items,
        hasFormRef: !!formRef.value,
      });
      
      // 如果 formRef 和 items 都准备好了，立即初始化
      if (formRef.value && props.items.length > 0 && !isInitialized.value) {
        initForm();
      } else {
        if (!formRef.value) {
          console.warn('[BtcFilterForm] formRef.value is still null in nextTick, will retry');
          // 再等一个 nextTick
          nextTick(() => {
            if (formRef.value && props.items.length > 0 && !isInitialized.value) {
              console.log('[BtcFilterForm] Retry initialization in second nextTick');
              initForm();
            }
          });
        }
        if (props.items.length === 0) {
          console.warn('[BtcFilterForm] items is empty in onMounted nextTick');
        }
      }
    });
  });
});

// 提交表单
const handleSubmit = () => {
  if (formRef.value) {
    const formData = formRef.value.getForm() || {};
    emit('submit', formData);
  }
};

// Enter 提交处理（带防抖）
const { handleEnterKey, clearDebounce } = useEnterSubmit({
  formRef: computed(() => formRef.value?.Form as FormInstance | undefined),
  onSubmit: handleSubmit,
  enabled: props.enableEnterSubmit,
  debounce: props.enterDebounce,
});

// 设置 Enter 键事件监听
const setupEnterKeyListener = () => {
  const formElement = formRef.value?.Form?.value?.$el as HTMLElement;
  if (formElement) {
    // 使用事件委托，在表单容器上监听所有子元素的 keyup 事件
    formElement.addEventListener('keyup', handleEnterKey as any, true);
  }
};

// 监听表单项配置变化（使用浅比较，只比较数组长度和引用）
watch(
  () => props.items,
  (items, oldItems) => {
    // 避免重复处理：如果 items 引用没变，且已初始化，不处理
    if (items === oldItems && isInitialized.value) {
      return;
    }
    
    console.log('[BtcFilterForm] items watch triggered', {
      itemsLength: items.length,
      oldItemsLength: oldItems?.length || 0,
      isInitialized: isInitialized.value,
      hasFormRef: !!formRef.value,
    });
    
    // 如果 items 为空，不处理
    if (items.length === 0) {
      console.warn('[BtcFilterForm] items is empty in watch');
      return;
    }
    
    // 如果 formRef 还没准备好，等待它准备好
    if (!formRef.value) {
      console.warn('[BtcFilterForm] formRef.value is null in items watch, will retry');
      // 等待 formRef 准备好
      nextTick(() => {
        if (formRef.value && !isInitialized.value) {
          initForm();
        }
      });
      return;
    }
    
    // 如果表单已初始化，更新配置；否则初始化表单
    if (isInitialized.value && formRef.value.config?.items) {
      console.log('[BtcFilterForm] Updating items config');
      // 处理表单项的 hidden 属性：根据展开状态动态设置
      const processedItems = items.map(item => {
        if (item.hidden !== undefined) {
          // 如果 hidden 是函数，根据展开状态计算
          if (typeof item.hidden === 'function') {
            return { ...item, hidden: !item.hidden({ scope: isExpanded.value }) };
          }
          // 如果 hidden 是布尔值，根据展开状态取反
          // 注意：原始 hidden 表示"收起时隐藏"，所以展开时应该是 hidden: false
          return { ...item, hidden: !isExpanded.value };
        }
        return item;
      });
      // 更新表单项配置
      formRef.value.setConfig('items', processedItems);
    } else if (!isInitialized.value) {
      console.log('[BtcFilterForm] Initializing form from watch');
      // 延迟初始化，确保 DOM 已渲染
      nextTick(() => {
        if (formRef.value && !isInitialized.value) {
          initForm();
        }
      });
    }
  },
  { deep: false, immediate: false } // 改为浅比较，避免循环引用；移除 immediate，由 onMounted 处理初始初始化
);

// 监听外部 modelValue 变化，同步到表单（使用浅比较，避免循环引用）
watch(
  () => props.modelValue,
  (newValue) => {
    if (formRef.value && newValue && isInitialized.value) {
      // 同步数据到表单（只在已初始化时同步，避免初始化时的循环）
      Object.keys(newValue).forEach((key) => {
        formRef.value?.setForm(key, newValue[key]);
      });
    }
  },
  { deep: false } // 改为浅比较，避免循环引用
);

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.clear();
    emit('reset');
  }
};

// 监听展开状态变化，同步到外部
watch(
  () => isExpanded.value,
  (expanded) => {
    emit('expand-change', expanded);
  }
);

// 清理防抖定时器和事件监听器
onBeforeUnmount(() => {
  clearDebounce();
  
  // 移除 Enter 键事件监听
  if (props.enableEnterSubmit && formRef.value?.Form?.value?.$el) {
    const formElement = formRef.value.Form.value.$el as HTMLElement;
    if (formElement) {
      formElement.removeEventListener('keyup', handleEnterKey as any, true);
    }
  }
});

// 暴露方法供外部调用
defineExpose({
  submit: handleSubmit,
  reset: handleReset,
  getForm: () => formRef.value?.getForm() || {},
  clear: () => formRef.value?.clear(),
});
</script>

<style lang="scss" scoped>
.btc-filter-form {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
  margin-bottom: 10px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 10px;
    border-bottom: 1px solid var(--el-border-color);
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__expand-toggle {
    font-size: 13px;
  }

  &__content {
    padding: 10px; // 四周边距 10px，确保水平间距固定为 10px，不受 label 宽度影响
    box-sizing: border-box;
  }

  // BtcForm 容器样式
  :deep(.btc-form__container) {
    padding: 0; // 由 content 的 padding 控制
    margin: 0; // 确保没有额外的 margin
  }

  :deep(.btc-form__items) {
    padding: 0;
    margin: 0; // 确保没有额外的 margin
  }

  // el-form 样式：确保没有额外的 padding 和 margin
  :deep(.el-form) {
    padding: 0;
    margin: 0;
  }

  // 表单项间距
  :deep(.el-form-item) {
    margin-bottom: 10px; // 表单项之间间距 10px
    margin-left: 0;
    margin-right: 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
    color: var(--el-text-color-regular);
    padding-right: 12px;
  }
}
</style>
