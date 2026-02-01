<template>
  <div class="page">
    <BtcDoubleLayout
      ref="viewGroupRef"
      left-title="title.inventory.dataSource.domains"
      :left-size="'small'"
    >
      <template #left>
        <BtcMasterList
          :service="domainService"
          :enable-key-search="false"
          @select="onDomainSelect"
        />
      </template>
      <template #right>
        <div class="ticket-print-wrapper">
          <BtcInventoryTicketPrintToolbar
            v-model:position-filter="positionFilter"
            :position-placeholder="positionPlaceholder"
            v-model:material-code-filter="materialCodeFilter"
            :material-code-placeholder="materialCodePlaceholder"
            :on-refresh="handleRefresh"
            :on-print="handlePrint"
            :on-position-search="handlePositionSearch"
            :on-position-clear="handlePositionClear"
            :on-material-code-search="handleMaterialCodeSearch"
            :on-material-code-clear="handleMaterialCodeClear"
          />

          <BtcCrud ref="crudRef" :service="ticketService" :auto-load="false">
            <BtcCrudRow>
              <div ref="printContentRef" style="width: 100%">
                <BtcTable
                  :columns="tableColumns"
                  border
                  auto-height
                  :disable-auto-created-at="true"
                />
              </div>
            </BtcCrudRow>

            <BtcCrudRow>
              <BtcCrudFlex1 />
              <el-config-provider :locale="elLocale">
                <BtcPagination />
              </el-config-provider>
            </BtcCrudRow>
          </BtcCrud>
        </div>
      </template>
    </BtcDoubleLayout>

    <!-- 打印范围选择对话框 -->
    <PrintRangeDialog
      v-model="showPrintRangeDialog"
      :total-count="totalTicketCount"
      :default-range="defaultPrintRange"
      @confirm="handlePrintRangeConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcDoubleLayout, BtcMasterList, BtcCrudFlex1, BtcCrudRow, BtcTable, BtcCrud, BtcPagination } from '@btc/shared-components';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { useTicketService } from './composables/useTicketService';
import { useProductionInventoryTicketPrint } from './composables/useProductionInventoryTicketPrint';
import { useNonProductionInventoryTicketPrint } from './composables/useNonProductionInventoryTicketPrint';
import BtcInventoryTicketPrintToolbar from './components/BtcInventoryTicketPrintToolbar.vue';
import PrintRangeDialog from './components/PrintRangeDialog.vue';
import { BtcMessage } from '@btc/shared-components';
import './styles/index.scss';

defineOptions({
  name: 'BtcInventoryTicketPrint',
});

const { t, locale } = useI18n();
const viewGroupRef = ref();
const crudRef = ref();
const printContentRef = ref<HTMLElement>();
const showPrintRangeDialog = ref(false);
const printRange = ref<{ start: number; end: number } | null>(null);
// 记录上次打印的结束位置，用于下次自动递增
const lastPrintEndIndex = ref(0);
// 默认范围大小
const DEFAULT_RANGE_SIZE = 50;

// 从分页组件获取总数（使用computed监听变化）
const totalTicketCount = computed(() => {
  return crudRef.value?.crud?.pagination?.total || 0;
});

// 计算默认打印范围
const defaultPrintRange = computed(() => {
  const total = totalTicketCount.value;
  if (total === 0) {
    return { start: 1, end: 1 };
  }

  // 如果上次打印的结束位置为0（首次打印），从1开始
  if (lastPrintEndIndex.value === 0) {
    return {
      start: 1,
      end: Math.min(DEFAULT_RANGE_SIZE, total)
    };
  }

  // 下次打印从上次结束+1开始
  const nextStart = lastPrintEndIndex.value + 1;

  // 如果已经超过总数，重置为1-50
  if (nextStart > total) {
    return {
      start: 1,
      end: Math.min(DEFAULT_RANGE_SIZE, total)
    };
  }

  // 计算结束位置（自动+50）
  const nextEnd = Math.min(nextStart + DEFAULT_RANGE_SIZE - 1, total);

  return {
    start: nextStart,
    end: nextEnd
  };
});

// 使用 ticket service composable
const {
  ticketList,
  selectedDomain,
  positionFilter,
  materialCodeFilter,
  pagination,
  positionPlaceholder,
  materialCodePlaceholder,
  tableColumns,
  ticketService,
  domainService,
} = useTicketService();

// 判断是否为生产域
const isProductionDomain = computed(() => {
  if (!selectedDomain.value) return false;
  const name = selectedDomain.value.name || '';
  return name === '生产域';
});

// 根据域类型使用不同的打印 composable
const productionPrint = useProductionInventoryTicketPrint(
  selectedDomain,
  positionFilter,
  materialCodeFilter,
  ticketList,
  crudRef,
  printContentRef
);

const nonProductionPrint = useNonProductionInventoryTicketPrint(
  selectedDomain,
  positionFilter,
  materialCodeFilter,
  ticketList,
  crudRef,
  printContentRef
);

// 根据域类型选择对应的打印方法
const loadTicketData = () => {
  if (isProductionDomain.value) {
    return productionPrint.loadTicketData();
  } else {
    return nonProductionPrint.loadTicketData();
  }
};

// 处理打印按钮点击 - 先显示范围选择对话框
const handlePrint = async () => {
  try {
    if (!selectedDomain.value) {
      BtcMessage.warning(t('title.inventory.dataSource.domains.select_required'));
      return;
    }

    // 先确保数据已加载，这样分页信息才会更新
    await loadTicketData();

    // 等待分页信息更新（使用nextTick确保crud已更新）
    await nextTick();

    // 从分页组件获取总数（分页组件有汇总逻辑）
    const total = crudRef.value?.crud?.pagination?.total || 0;

    if (total > 0) {
      // 显示对话框，总数会通过computed自动获取
      showPrintRangeDialog.value = true;
    } else {
      BtcMessage.warning('没有可打印的数据');
    }
  } catch (error) {
    // 响应拦截器已显示错误消息，不需要在控制台打印
    BtcMessage.error(t('inventory.ticket.print.load_failed'));
  }
};

// 处理打印范围确认
const handlePrintRangeConfirm = (range: { start: number; end: number }) => {
  printRange.value = range;
  // 记录本次打印的结束位置，用于下次自动递增
  lastPrintEndIndex.value = range.end;
  // 调用实际的打印函数
  if (isProductionDomain.value) {
    productionPrint.handlePrint(range);
  } else {
    nonProductionPrint.handlePrint(range);
  }
};

// Element Plus 国际化
const elLocale = computed(() => {
  const currentLocale = locale.value || 'zh-CN';
  return currentLocale === 'zh-CN' ? zhCn : en;
});

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
  pagination.value.page = 1;
  // 切换域时，重置打印范围
  lastPrintEndIndex.value = 0;
  // 使用 nextTick 确保 selectedDomain 已更新且 crudRef 已初始化
  nextTick(() => {
    loadTicketData();
  });
};

// 仓位搜索处理
const handlePositionSearch = () => {
  pagination.value.page = 1;
  // 搜索时，重置打印范围
  lastPrintEndIndex.value = 0;
  loadTicketData();
};

// 仓位清空处理
const handlePositionClear = () => {
  pagination.value.page = 1;
  // 清空时，重置打印范围
  lastPrintEndIndex.value = 0;
  loadTicketData();
};

// 物料编码搜索处理
const handleMaterialCodeSearch = () => {
  pagination.value.page = 1;
  // 搜索时，重置打印范围
  lastPrintEndIndex.value = 0;
  loadTicketData();
};

// 物料编码清空处理
const handleMaterialCodeClear = () => {
  pagination.value.page = 1;
  // 清空时，重置打印范围
  lastPrintEndIndex.value = 0;
  loadTicketData();
};

// 刷新数据
const handleRefresh = () => {
  loadTicketData();
  // 同时刷新左侧域列表
  viewGroupRef.value?.refresh?.();
};

// 组件挂载时初始化打印时间
onMounted(() => {
  // BtcDoubleLayout 配合 BtcMasterList 会在加载完左侧列表后自动选中第一项，触发 @select 事件
  // 不需要在这里手动加载数据，因为 @select 事件会自动触发数据加载
});
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
