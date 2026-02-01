<template>
  <el-tabs v-model="active" v-bind="$attrs">
    <el-tab-pane
      v-for="tab in labels"
      :key="tab.value"
      :label="tab.label"
      :name="tab.value"
      :lazy="tab.lazy"
    >
      <slot :name="`tab-${tab.value}`" :tab="tab" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcFormTabs'
});

import { ref, watch } from 'vue';

interface TabLabel {
  label: string;
  value: string;
  lazy?: boolean;
}

interface Props {
  modelValue?: string;
  labels?: TabLabel[];
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
}>();

const active = ref(props.modelValue || props.labels[0]?.value);

watch(() => props.modelValue, (val) => {
  if (val !== undefined) {
    active.value = val;
  }
});

watch(active, (val) => {
  if (val !== undefined) {
    emit('update:modelValue', val);
    emit('change', val);
  }
});
</script>


