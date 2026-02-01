<template>
  <el-config-provider :locale="elLocale as any">
    <el-pagination
      v-model:current-page="crud.pagination.page"
      v-model:page-size="crud.pagination.size"
      :total="crud.pagination.total"
      :page-sizes="props.pageSizes"
      :layout="props.layout"
      v-bind="$attrs"
      @current-change="handleCurrentChange"
      @size-change="crud.handleSizeChange"
    />
  </el-config-provider>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, computed } from 'vue';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { useI18n } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';

export interface Props {
  pageSizes?: number[];
  layout?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
});

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcPagination] Must be used inside <BtcCrud>');
}

// 获取当前语言并设置 Element Plus 的 locale
const { locale } = useI18n();
const elLocale = computed(() => {
  const currentLocale = locale.value || 'zh-CN';
  return currentLocale === 'zh-CN' ? zhCn : en;
});

// 初始化标记，避免在组件初始化时触发页码变化事件
const isInitialized = ref(false);
// 记录初始页码，避免在初始化时触发事件
const initialPage = ref(crud.pagination.page);
// 标记是否已经处理过初始页码设置
const hasHandledInitialPage = ref(false);

onMounted(() => {
  // 记录初始页码
  initialPage.value = crud.pagination.page;
  hasHandledInitialPage.value = true;
  // 延迟标记为已初始化，确保不会在初始化时触发事件
  setTimeout(() => {
    isInitialized.value = true;
  }, 200);
});

// 处理页码变化事件
const handleCurrentChange = (page: number) => {
  // 如果还在初始化阶段，只更新初始页码，不触发数据加载
  if (!isInitialized.value) {
    if (!hasHandledInitialPage.value) {
      initialPage.value = page;
      hasHandledInitialPage.value = true;
    }
    return;
  }
  
  // 只有在初始化完成后，并且页码确实发生了变化，才触发数据加载
  if (page !== initialPage.value) {
    initialPage.value = page; // 更新初始页码
    crud.handlePageChange(page);
  }
};
</script>

