<template>
  <div class="strategy-execution-history">
    <div class="history-header">
      <div class="header-info">
        <h3>执行历史记录</h3>
        <p>查看策略的详细执行历史和结果分析</p>
      </div>

      <div class="header-controls">
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 120px;">
          <el-option label="全部" value="" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="failed" />
        </el-select>

        <el-button @click="refreshHistory" :loading="loading">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-table :data="executionHistory" stripe v-loading="loading">
      <el-table-column prop="executionId" label="执行ID" width="180">
        <template #default="{ row }">
          <el-link type="primary" @click="viewExecutionDetail(row)">
            {{ row.executionId }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column prop="effect" label="策略效果" width="100">
        <template #default="{ row }">
          <el-tag :type="getEffectTagType(row.effect)" size="small">
            {{ row.effect }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="success" label="执行状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.success ? 'success' : 'danger'" size="small">
            {{ row.success ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="executionTime" label="执行时间" width="100">
        <template #default="{ row }">
          {{ row.executionTime }}ms
        </template>
      </el-table-column>

      <el-table-column prop="steps" label="执行步骤" width="100">
        <template #default="{ row }">
          {{ row.steps.length }} 步
        </template>
      </el-table-column>

      <el-table-column prop="metadata.startTime" label="开始时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.metadata.startTime) }}
        </template>
      </el-table-column>

      <el-table-column label="输入数据" min-width="200">
        <template #default="{ row }">
          <el-popover placement="top" trigger="hover" width="400">
            <template #reference>
              <el-button size="small" text>查看输入</el-button>
            </template>
            <pre class="json-preview">{{ JSON.stringify(getInputData(row), null, 2) }}</pre>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="输出结果" min-width="200">
        <template #default="{ row }">
          <el-popover placement="top" trigger="hover" width="400">
            <template #reference>
              <el-button size="small" text>查看输出</el-button>
            </template>
            <pre class="json-preview">{{ JSON.stringify(row.output, null, 2) }}</pre>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" @click="viewExecutionDetail(row)">
            详情
          </el-button>
          <el-button size="small" type="primary" @click="replayExecution(row)">
            重放
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalRecords"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 执行详情对话框 -->
    <el-dialog v-model="showExecutionDetail" title="执行详情" width="80%">
      <ExecutionDetailPanel
        v-if="selectedExecution"
        :execution="selectedExecution"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { Refresh } from '@element-plus/icons-vue';
import type { StrategyExecutionResult } from '@/types/strategy';
import { strategyService } from '@/services/strategy';
import ExecutionDetailPanel from './ExecutionDetailPanel.vue';

// Props
interface Props {
  strategyId: string;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const executionHistory = ref<StrategyExecutionResult[]>([]);
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(20);
const totalRecords = ref(0);

// 对话框状态
const showExecutionDetail = ref(false);
const selectedExecution = ref<StrategyExecutionResult | null>(null);

// 计算属性
const filteredHistory = computed(() => {
  if (!statusFilter.value) return executionHistory.value;

  return executionHistory.value.filter(execution => {
    if (statusFilter.value === 'success') return execution.success;
    if (statusFilter.value === 'failed') return !execution.success;
    return true;
  });
});

// 工具函数
const getEffectTagType = (effect: string) => {
  const effectMap = {
    'ALLOW': 'success',
    'DENY': 'danger',
    'CONDITIONAL': 'warning'
  };
  return effectMap[effect] || 'default';
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const getInputData = (execution: StrategyExecutionResult) => {
  // 从执行上下文中提取输入数据
  return execution.output || {};
};

// 事件处理
const refreshHistory = async () => {
  loading.value = true;
  try {
    const result = await strategyService.getExecutionHistory(props.strategyId, {
      page: currentPage.value,
      size: pageSize.value
    });

    executionHistory.value = result.list;
    totalRecords.value = result.total;
  } catch (error) {
    BtcMessage.error(t('common.strategy.monitor.load_execution_history_failed'));
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  refreshHistory();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  refreshHistory();
};

const viewExecutionDetail = (execution: StrategyExecutionResult) => {
  selectedExecution.value = execution;
  showExecutionDetail.value = true;
};

const replayExecution = async (execution: StrategyExecutionResult) => {
  try {
    // 模拟重放执行
    BtcMessage.success(t('common.strategy.monitor.execution_replay_started'));
  } catch (error) {
    BtcMessage.error(t('common.strategy.monitor.execution_replay_failed'));
  }
};

// 生命周期
onMounted(() => {
  refreshHistory();
});
</script>

<style lang="scss" scoped>
.strategy-execution-history {
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .header-info {
      h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
      }

      p {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }

    .header-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .table-pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .json-preview {
    max-height: 300px;
    overflow-y: auto;
    font-size: 12px;
    background: var(--el-bg-color-page);
    padding: 8px;
    border-radius: 4px;
    margin: 0;
  }
}
</style>
