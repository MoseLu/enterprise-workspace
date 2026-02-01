<template>
  <div class="page">
    <div class="error-monitor-container">
      <BtcCrud :service="emptyService" :auto-load="false" padding="0">
        <!-- Toolbar -->
        <BtcCrudRow class="error-monitor-toolbar">
          <BtcCrudFlex1 />
          <el-button @click="clearError" type="danger">{{ t('monitor.clear') }}</el-button>
          <el-select v-model="cleanupPeriod" style="width: 130px;" @change="handleCleanupPeriodChange">
            <el-option :label="t('monitor.cleanup.today')" value="today" />
            <el-option :label="t('monitor.cleanup.3days')" value="3days" />
            <el-option :label="t('monitor.cleanup.7days')" value="7days" />
            <el-option :label="t('monitor.cleanup.30days')" value="30days" />
            <el-option :label="t('monitor.cleanup.never')" value="never" />
          </el-select>
          <el-select v-model="filterSource" style="width: 150px;">
            <el-option :label="t('monitor.filter.allSources')" value="all" />
            <el-option :label="t('micro_app.main.title')" value="main-app" />
            <el-option :label="t('micro_app.admin.title')" value="admin" />
            <el-option :label="t('micro_app.logistics.title')" value="logistics" />
            <el-option :label="t('micro_app.quality.title')" value="quality" />
            <el-option :label="t('micro_app.production.title')" value="production" />
            <el-option :label="t('micro_app.engineering.title')" value="engineering" />
            <el-option :label="t('micro_app.finance.title')" value="finance" />
          </el-select>
          <el-select v-model="filterType" style="width: 120px;">
            <el-option :label="t('monitor.filter.allTypes')" value="all" />
            <el-option :label="t('monitor.filter.onlyError')" value="error" />
            <el-option :label="t('monitor.filter.onlyWarn')" value="warn" />
          </el-select>
          <BtcErrorMonitorExport
            :filter-source="filterSource"
            :filter-type="filterType"
            :get-app-display-name="getAppDisplayName"
            :get-error-type-display-name="getErrorTypeDisplayName"
          />
        </BtcCrudRow>

        <!-- Table -->
        <BtcCrudRow>
          <div class="error-monitor-table">
            <BtcErrorMonitor
              ref="errorMonitorRef"
              :filter-source="filterSource"
              :filter-type="filterType"
              @clear="clearError"
            />
          </div>
        </BtcCrudRow>
      </BtcCrud>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storage } from '@btc/shared-utils';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { clearErrorList, getErrorListSync, onErrorListUpdate, setCleanupPeriod, type CleanupPeriod } from '@btc/shared-utils/error-monitor';
import { BtcCrud, BtcCrudRow, BtcCrudFlex1 } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import BtcErrorMonitor from '../../../components/BtcErrorMonitor.vue';
import BtcErrorMonitorExport from '../../../components/BtcErrorMonitorExport.vue';

const { t } = useI18n();

// 创建一个空的服务用于 BtcCrud（不需要实际功能，只是为了获得正确的间距）
const emptyService = {
  page: async () => ({ list: [], total: 0 }),
  add: async () => ({}),
  update: async () => ({}),
  delete: async () => ({}),
};

// 表格引用
const errorMonitorRef = ref<InstanceType<typeof BtcErrorMonitor>>();

// 过滤条件
const filterSource = ref('all');
const filterType = ref('all');

// 获取应用显示名称（与 BtcErrorMonitor 中的逻辑一致）
const getAppDisplayName = (source: string): string => {
  const normalizedSource = source.replace(/-app$/, '');
  const sourceMap: Record<string, string> = {
    'main': 'micro_app.main.title',
    'system': 'micro_app.system.title',
    'admin': 'micro_app.admin.title',
    'logistics': 'micro_app.logistics.title',
    'quality': 'micro_app.quality.title',
    'production': 'micro_app.production.title',
    'engineering': 'micro_app.engineering.title',
    'finance': 'micro_app.finance.title',
    'monitor': 'menu.operations.name',
  };
  const i18nKey = sourceMap[normalizedSource];
  if (i18nKey) {
    return t(i18nKey);
  }
  return source;
};

// 获取错误类型显示名称（与 BtcErrorMonitor 中的逻辑一致）
const getErrorTypeDisplayName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'resource': 'monitor.errorType.resource',
    'script': 'monitor.errorType.script',
    'promise': 'monitor.errorType.promise',
    'console-warn': 'monitor.errorType.consoleWarn',
    'console-error': 'monitor.errorType.consoleError',
    'unknown': 'monitor.errorType.unknown',
  };
  const i18nKey = typeMap[type] || type;
  if (i18nKey === type) {
    return type;
  }
  return t(i18nKey);
};

// 清理周期（从 storage 读取，默认保留当天）
const getStoredCleanupPeriod = (): CleanupPeriod => {
  try {
    const data = storage.get<{ cleanupPeriod?: CleanupPeriod }>('btc_error');
    if (data) {
      if (data.cleanupPeriod &&
          (data.cleanupPeriod === 'today' ||
           data.cleanupPeriod === '3days' ||
           data.cleanupPeriod === '7days' ||
           data.cleanupPeriod === '30days' ||
           data.cleanupPeriod === 'never')) {
        return data.cleanupPeriod;
      }
    }
  } catch (error) {
    console.warn('[ErrorMonitor] 读取清理周期失败:', error);
  }
  return 'today'; // 默认保留当天
};

const cleanupPeriod = ref<CleanupPeriod>(getStoredCleanupPeriod());

// 获取错误列表用于计数
const errorList = ref(getErrorListSync());
const filteredErrorList = computed(() => {
  return errorList.value.filter((error) => {
    const sourceMatch = filterSource.value === 'all' || error.source === filterSource.value;
    const typeMatch =
      filterType.value === 'all'
        ? true
        : filterType.value === 'warn'
          ? error.isWarning
          : !error.isWarning;
    return sourceMatch && typeMatch;
  });
});

// 清空错误列表
const clearError = () => {
  clearErrorList();
  errorList.value = [];
};

// 处理清理周期变化
const handleCleanupPeriodChange = (period: CleanupPeriod) => {
  setCleanupPeriod(period);
};

// 监听错误列表更新
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = onErrorListUpdate((newErrorList) => {
    errorList.value = newErrorList;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
});
</script>

<style scoped lang="scss">


.error-monitor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  min-height: 0;
  background-color: var(--el-bg-color);
}

.error-monitor-toolbar {
  flex-shrink: 0;
}

.error-monitor-table {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>

