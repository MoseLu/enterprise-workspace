<template>
  <div class="btc-filter-list__container" ref="containerRef" v-loading="loading">
    <el-scrollbar>
      <BtcCollapse v-model="internalActiveCategories" @change="handleCollapseChange">
      <BtcCollapseItem
        v-for="category in filteredCategories"
        :key="category.id"
        :name="category.id"
        class="btc-filter-list__collapse-item"
      >
        <template #checkbox>
          <el-checkbox
            :model-value="isCategoryAllSelected(category.id)"
            :indeterminate="isCategoryIndeterminate(category.id)"
            @change="handleCategorySelectAll(category.id, $event)"
            @click.stop
            class="btc-filter-list__category-checkbox"
          />
        </template>
        <template #title>
          <div class="btc-filter-list__category-title" @click.stop>
            <span class="btc-filter-list__category-name">{{ category.name }}</span>
            <span class="btc-filter-list__category-count">
              ({{ getSelectedCount(category.id) }}/{{ category.options.length }})
            </span>
          </div>
        </template>

        <div class="btc-filter-list__options">
          <el-checkbox-group
            v-model="selectedValues[category.id]"
            @change="handleSelectionChange(category.id)"
            :name="`btc-filter-list-${props.instanceId || 'default'}-${category.id}`"
          >
            <el-checkbox
              v-for="option in category.options"
              :key="option.value"
              :value="option.value"
              :id="`btc-filter-list-${props.instanceId || 'default'}-${category.id}-${option.value}`"
              :name="`btc-filter-list-${props.instanceId || 'default'}-${category.id}`"
              class="btc-filter-list__option"
            >
              {{ option.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </BtcCollapseItem>
    </BtcCollapse>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElScrollbar } from 'element-plus';
import { BtcCollapse, BtcCollapseItem } from '@btc/shared-components';
import type { FilterCategory } from '../types';

interface Props {
  loading: boolean;
  filteredCategories: FilterCategory[];
  activeCategories: string[];
  selectedValues: Record<string, any[]>;
  isCategoryAllSelected: (categoryId: string) => boolean;
  isCategoryIndeterminate: (categoryId: string) => boolean;
  getSelectedCount: (categoryId: string) => number;
  optionWrap?: boolean; // 是否允许选项换行
  instanceId?: string; // 实例 ID，用于生成唯一的表单字段 ID
}

interface Emits {
  (e: 'update:activeCategories', value: string[]): void;
  (e: 'category-select-all', categoryId: string, checked: boolean): void;
  (e: 'selection-change', categoryId: string): void;
  (e: 'collapse-change', activeNames: string | string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const containerRef = ref<HTMLElement | null>(null);

// 内部 activeCategories 状态（支持 v-model）
const internalActiveCategories = ref<string[]>(props.activeCategories);

// 同步外部 props 变化
watch(() => props.activeCategories, (newVal) => {
  internalActiveCategories.value = newVal;
}, { deep: true });

// 处理分类全选/取消全选
const handleCategorySelectAll = (categoryId: string, checked: boolean) => {
  emit('category-select-all', categoryId, checked);
};

// 处理选择变化
const handleSelectionChange = (categoryId: string) => {
  emit('selection-change', categoryId);
};

// 处理 el-collapse 的 change 事件
const handleCollapseChange = (activeNames: string | string[]) => {
  const names = Array.isArray(activeNames) ? activeNames : [activeNames];
  internalActiveCategories.value = names;
  emit('update:activeCategories', names);
  emit('collapse-change', activeNames);
};

// 暴露 refs 给父组件
defineExpose({
  containerRef,
});
</script>
