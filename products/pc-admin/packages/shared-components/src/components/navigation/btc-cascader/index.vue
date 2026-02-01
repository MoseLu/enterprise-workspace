<template>
  <div class="btc-cascader">
    <el-cascader
      :model-value="modelValue"
      :options="processedOptions"
      v-bind="{
        ...(placeholder !== undefined ? { placeholder } : {}),
        ...(clearable !== undefined ? { clearable } : {}),
        ...(filterable !== undefined ? { filterable } : {}),
        ...(showAllLevels !== undefined ? { 'show-all-levels': showAllLevels } : {}),
        props: cascaderProps,
        ...(style !== undefined ? { style } : {})
      }"
      @update:model-value="handleChange"
    >
      <template v-if="showCount" #default="{ data }">
        {{ getDisplayText(data) }}
      </template>
    </el-cascader>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElCascader } from 'element-plus';
import 'element-plus/es/components/cascader/style/css';

defineOptions({
  name: 'BtcCascader'
});



interface BtcCascaderProps {
  modelValue?: any;
  options?: any[];
  placeholder?: string;
  clearable?: boolean;
  filterable?: boolean;
  showAllLevels?: boolean;
  checkStrictly?: boolean;
  emitPath?: boolean;
  checkOnClickNode?: boolean;
  multiple?: boolean; // 是否多选
  collapseTags?: boolean; // 多选时是否折叠标签
  collapseTagsTooltip?: boolean; // 折叠标签是否显示提示
  maxCollapseTags?: number; // 最大折叠标签数量
  style?: Record<string, any>;
  showCount?: boolean; // 是否显示子节点数量
}

const props = withDefaults(defineProps<BtcCascaderProps>(), {
  placeholder: '请选择',
  clearable: true,
  filterable: true,
  showAllLevels: false,
  checkStrictly: true,
  emitPath: false,
  checkOnClickNode: true,
  multiple: false,
  collapseTags: true,
  collapseTagsTooltip: true,
  maxCollapseTags: 3,
  style: () => ({ width: '100%', minWidth: '200px' }),
  showCount: true
});

const emit = defineEmits<{
  'update:modelValue': [value: any];
  'change': [value: any];
}>();

// 处理选项数据，确保符合 el-cascader 的格式
const processedOptions = computed(() => {
  if (!props.options) return [];

  // 递归处理选项数据
  const processOption = (option: any): any => {
    const processed: any = {
      value: option.value || option.id,
      label: option.label || option.name || option.roleName || option.deptName
    };

    if (option.children && option.children.length > 0) {
      processed.children = option.children.map(processOption);
    }

    return processed;
  };

  return props.options.map(processOption);
});

// 级联选择器的 props 配置
const cascaderProps = computed(() => ({
  value: 'value',
  label: 'label',
  children: 'children',
  checkStrictly: props.checkStrictly,
  emitPath: props.emitPath
}));

// 获取子节点数量
const getChildrenCount = (data: any) => {
  return data.children ? data.children.length : 0;
};

// 获取显示文本
const getDisplayText = (data: any) => {
  const count = getChildrenCount(data);
  if (props.showCount && count > 0) {
    return `${data.label} (${count})`;
  }
  return data.label;
};

// 处理值变化
const handleChange = (value: any) => {
  emit('update:modelValue', value);
  emit('change', value);
};
</script>

<style scoped>
.btc-cascader {
  width: 100%;
  min-width: 200px;
}

.btc-cascader :deep(.el-cascader) {
  width: 100%;
}
</style>
