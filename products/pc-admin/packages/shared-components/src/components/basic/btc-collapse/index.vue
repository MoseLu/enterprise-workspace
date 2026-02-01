<template>
  <div class="btc-collapse">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watch, type Ref } from 'vue';
;


defineOptions({
  name: 'BtcCollapse',
});

interface Props {
  modelValue?: string | string[];
  accordion?: boolean; // 是否手风琴模式（同时只能展开一个）
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  accordion: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  'change': [value: string | string[]];
}>();

// 内部状态
const activeNames = ref<string[]>([]);

// 初始化 activeNames
const initActiveNames = () => {
  const modelValue = props.modelValue;
  if (Array.isArray(modelValue)) {
    activeNames.value = modelValue.map(String);
  } else if (modelValue !== undefined && modelValue !== null && modelValue !== '') {
    activeNames.value = [String(modelValue)];
  } else {
    activeNames.value = [];
  }
  
  // 确保 activeNames.value 始终是数组
  if (!Array.isArray(activeNames.value)) {
    console.warn('[BtcCollapse] activeNames.value is not an array after init, resetting to []');
    activeNames.value = [];
  }
};

// 初始化
initActiveNames();

// 同步外部 v-model 变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (Array.isArray(newVal)) {
      activeNames.value = newVal.map(String);
    } else if (newVal !== undefined && newVal !== null && newVal !== '') {
      activeNames.value = [String(newVal)];
    } else {
      activeNames.value = [];
    }
    
    // 确保 activeNames.value 始终是数组
    if (!Array.isArray(activeNames.value)) {
      console.warn('[BtcCollapse] activeNames.value is not an array after watch, resetting to []');
      activeNames.value = [];
    }
  },
  { deep: true, immediate: false }
);

// 处理展开/折叠
const handleItemClick = (name: string) => {
  const index = activeNames.value.indexOf(name);
  
  if (props.accordion) {
    // 手风琴模式：如果点击的是已展开的项，则折叠；否则展开该项并折叠其他项
    if (index > -1) {
      activeNames.value = [];
    } else {
      activeNames.value = [name];
    }
  } else {
    // 非手风琴模式：切换当前项的展开状态
    if (index > -1) {
      activeNames.value.splice(index, 1);
    } else {
      activeNames.value.push(name);
    }
  }
  
  // 触发更新
  const value = props.accordion 
    ? (activeNames.value.length > 0 ? activeNames.value[0] : '')
    : activeNames.value;
  
  emit('update:modelValue', value);
  emit('change', value);
};

// 提供给子组件使用（确保 activeNames 是 ref）
provide('collapse', {
  activeNames: activeNames as Ref<string[]>,
  accordion: props.accordion,
  handleItemClick,
});
</script>

<style lang="scss" scoped>
.btc-collapse {
  border: none;
  background-color: transparent;
}
</style>
