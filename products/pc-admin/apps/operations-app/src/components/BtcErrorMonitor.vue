<template>
  <div ref="monitorRef" class="error-monitor">
    <el-table
      ref="tableRef"
      :data="paginatedErrorList"
      v-loading="false"
      border
      :height="tableHeight"
      :default-sort="{ prop: 'time', order: 'descending' }"
      style="width: 100%"
      class="error-table"
    >
      <el-table-column type="expand" width="80" :label="t('monitor.table.expand')" align="center">
        <template #default="{ row }">
          <div v-if="row.stack" class="error-stack-detail">
            <div class="error-stack-title">错误栈：</div>
            <pre class="error-stack-content">{{ row.stack }}</pre>
          </div>
          <div v-else class="error-stack-empty">无错误栈信息</div>
        </template>
      </el-table-column>

      <el-table-column type="index" :label="t('monitor.table.index')" width="80" align="center">
        <template #default="{ $index }">
          <span>{{ (currentPage - 1) * pageSize + $index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="isWarning" label="类型" width="80" align="center" sortable>
        <template #default="{ row }">
          <el-tag :type="row.isWarning ? 'warning' : 'danger'" size="small" effect="dark">
            {{ row.isWarning ? t('monitor.type.warning') : t('monitor.type.error') }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="source" label="来源" width="120" align="center" sortable>
        <template #default="{ row }">
          <span class="error-source">{{ getAppDisplayName(row.source) }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="type" label="错误类型" width="120" align="center" sortable>
        <template #default="{ row }">
          <el-tag :type="getErrorTypeTagType(row.type)" size="small" effect="dark">
            {{ getErrorTypeDisplayName(row.type) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="message" label="错误信息" min-width="300" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="error-message">{{ row.message }}</div>
        </template>
      </el-table-column>

      <el-table-column prop="url" label="URL" min-width="200" align="center" show-overflow-tooltip>
        <template #default="{ row }">
          <div v-if="row.url" class="error-url">{{ row.url }}</div>
          <span v-else class="error-url-empty">-</span>
        </template>
      </el-table-column>

      <el-table-column prop="time" label="时间" width="180" align="center" sortable>
        <template #default="{ row }">
          <span class="error-time">{{ row.time }}</span>
        </template>
      </el-table-column>

      <template #empty>
        <div class="error-table__empty">
          <BtcEmpty :image-size="100" description="暂无数据" />
        </div>
      </template>
    </el-table>

    <div class="error-pagination">
      <el-config-provider :locale="elLocale">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100, 200]"
          :total="filteredErrorList.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </el-config-provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { ElConfigProvider } from 'element-plus';
import type { TableInstance } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { onErrorListUpdate, getErrorListSync } from '@btc/shared-utils/error-monitor';
import type { FormattedError } from '@btc/shared-utils/error-monitor';
import { useI18n } from '@btc/shared-core';
import { BtcEmpty } from '@btc/shared-components';

const { t } = useI18n();

interface Props {
  filterSource?: string;
  filterType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filterSource: 'all',
  filterType: 'all',
});

// 国际化
const { locale } = useI18n();
const elLocale = computed(() => {
  const currentLocale = locale.value || 'zh-CN';
  return currentLocale === 'zh-CN' ? zhCn : en;
});

// 响应式错误列表（初始化时获取当前错误列表）
const errorList = ref<FormattedError[]>(getErrorListSync());

// 标准化来源值（用于匹配）
const normalizeSource = (source: string): string => {
  // 移除 -app 后缀，统一处理
  return source.replace(/-app$/, '');
};

// 实时过滤列表
const filteredErrorList = computed(() => {
  return errorList.value.filter((error) => {
    // 过滤来源（支持多种格式匹配）
    let sourceMatch = false;
    if (props.filterSource === 'all') {
      sourceMatch = true;
    } else {
      // 标准化后比较，支持 'admin' 和 'admin-app' 都能匹配
      const normalizedFilter = normalizeSource(props.filterSource);
      const normalizedErrorSource = normalizeSource(error.source);
      sourceMatch = normalizedFilter === normalizedErrorSource || error.source === props.filterSource;
    }

    // 过滤类型（错误/警告）
    const typeMatch =
      props.filterType === 'all'
        ? true
        : props.filterType === 'warn'
          ? error.isWarning
          : !error.isWarning;
    return sourceMatch && typeMatch;
  });
});

// 表格引用
const tableRef = ref<TableInstance>();
const monitorRef = ref<HTMLElement>();

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);

// 分页后的列表
const paginatedErrorList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredErrorList.value.slice(start, end);
});

// 计算表格高度
const tableHeight = ref<string | number>('100%');

const calculateTableHeight = () => {
  nextTick(() => {
    if (!monitorRef.value) return;
    const paginationHeight = 60; // 分页组件高度（包含 padding）
    const containerHeight = monitorRef.value.clientHeight;
    tableHeight.value = containerHeight - paginationHeight;
  });
};


// 根据错误类型获取标签类型
const getErrorTypeTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    resource: 'warning', // 资源加载错误 - 橙色
    script: 'danger', // JS运行时错误 - 红色
    promise: 'danger', // Promise拒绝 - 红色
    console: 'info', // console.error - 蓝色
    warn: 'warning', // console.warn - 橙色
    unknown: 'info', // 未知类型 - 灰色
  };
  return typeMap[type] || 'info';
};

// 将错误来源转换为应用显示名称
const getAppDisplayName = (source: string): string => {
  // 标准化source值（移除-app后缀，统一处理）
  const normalizedSource = source.replace(/-app$/, '');

  // 映射source值到国际化键
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
  // 如果映射失败，返回原始值
  return source;
};

// 获取错误类型的显示名称
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
  // 如果映射失败，返回原始值
  if (i18nKey === type) {
    return type;
  }
  return t(i18nKey);
};

// 取消监听的函数
let unsubscribe: (() => void) | null = null;

// 监听错误列表更新
onMounted(() => {
  // 使用 CustomEvent 监听错误列表变化
  unsubscribe = onErrorListUpdate((newErrorList) => {
    errorList.value = newErrorList;
    // 如果当前页没有数据了，回到第一页
    if (paginatedErrorList.value.length === 0 && currentPage.value > 1) {
      currentPage.value = 1;
    }
  });

  // 计算表格高度
  calculateTableHeight();

  // 监听窗口大小变化
  window.addEventListener('resize', calculateTableHeight);
});

// 组件卸载时取消监听
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  window.removeEventListener('resize', calculateTableHeight);
});

// 暴露函数供父组件使用
defineExpose({
  getAppDisplayName,
  getErrorTypeDisplayName,
  filteredErrorList,
});
</script>

<style scoped lang="scss">
.error-monitor {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.error-table {
  flex: 1;
  min-height: 0;
}

:deep(.error-table) {
  .el-table__body-wrapper {
    max-height: 100%;
  }
}

.error-table__empty {
  padding: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-pagination {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  flex-shrink: 0;
}

.error-source {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 13px;
}

.error-message {
  word-break: break-all;
  line-height: 1.6;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.error-url {
  word-break: break-all;
  color: var(--el-color-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.error-url-empty {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.error-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.error-stack-detail {
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  margin: 8px 0;
}

.error-stack-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
  font-size: 13px;
}

.error-stack-content {
  margin: 0;
  padding: 12px;
  background: var(--el-bg-color);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  border: 1px solid var(--el-border-color-lighter);
  max-height: 400px;
  overflow-y: auto;
}

.error-stack-empty {
  padding: 16px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

</style>

