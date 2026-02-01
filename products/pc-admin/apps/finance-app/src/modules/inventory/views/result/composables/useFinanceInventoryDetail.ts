import { ref } from 'vue';

/**
 * 详情弹窗管理
 */
export function useFinanceInventoryDetail() {
  const detailVisible = ref(false);
  const detailRow = ref<any>(null);

  const handleDetail = (row: any) => {
    detailRow.value = row;
    detailVisible.value = true;
  };

  return {
    detailVisible,
    detailRow,
    handleDetail,
  };
}

