<template>
  <div class="strategy-management">
    <!-- 策略列表 -->
    <BtcCrud ref="crudRef" :service="wrappedService" :on-before-refresh="onBeforeRefresh" class="strategy-crud">
      <BtcCrudRow>
        <div class="btc-crud-primary-actions">
          <BtcRefreshBtn />
          <BtcAddBtn />
          <BtcMultiDeleteBtn />
        </div>

        <!-- 状态筛选 -->
        <el-select
          v-model="statusFilter"
          :placeholder="t('common.strategy.management.status_filter')"
          clearable
          style="width: 120px; margin-left: 8px;"
          @change="handleStatusFilter"
        >
          <el-option
            v-for="status in strategyStatuses"
            :key="status.value"
            :label="status.label"
            :value="status.value"
          />
        </el-select>

        <BtcCrudFlex1 />
        <BtcCrudSearchKey />
        <BtcCrudActions />
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcTable
          ref="tableRef"
          :columns="columns"
          :op="{ buttons: ['edit', 'delete', 'test', 'clone', 'export'] }"
          border
        >
          <!-- 版本 -->
          <template #column-version="{ row }">
            <el-link type="primary" @click="showVersionHistory(row)">
              {{ row.version }}
            </el-link>
          </template>

          <!-- 标签 -->
          <template #column-tags="{ row }">
            <div class="strategy-tags">
              <el-tag
                v-for="tag in row.tags?.slice(0, 2)"
                :key="tag"
                size="small"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
              <el-popover
                v-if="row.tags && row.tags.length > 2"
                placement="top"
                trigger="hover"
                :content="row.tags.slice(2).join(', ')"
              >
                <template #reference>
                  <el-tag size="small" type="info">+{{ row.tags.length - 2 }}</el-tag>
                </template>
              </el-popover>
            </div>
          </template>

          <!-- 自定义操作按钮 -->
          <template #op-test="{ row }">
            <el-button
              type="warning"
              size="small"
              @click="testStrategy(row)"
              :loading="testingStrategies.has(row.id)"
            >
              测试
            </el-button>
          </template>

          <template #op-clone="{ row }">
            <el-button type="info" size="small" @click="cloneStrategy(row)">
              克隆
            </el-button>
          </template>

          <template #op-export="{ row }">
            <el-button type="success" size="small" @click="exportStrategy(row)">
              导出
            </el-button>
          </template>
        </BtcTable>
      </BtcCrudRow>

      <BtcCrudRow>
        <BtcCrudFlex1 />
        <BtcPagination />
      </BtcCrudRow>

      <!-- 策略编辑表单 -->
      <BtcUpsert ref="upsertRef" :items="formItems" width="1200px" />
    </BtcCrud>

    <!-- 版本历史对话框 -->
    <el-dialog v-model="showVersionDialog" :title="t('common.strategy.management.version_history')" width="800px">
      <el-table :data="versionHistory" stripe>
        <el-table-column prop="version" :label="t('common.strategy.management.version')" width="100" />
        <el-table-column prop="status" :label="t('common.strategy.management.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" :label="t('common.strategy.management.updated_at')" width="180" />
        <el-table-column prop="updatedBy" :label="t('common.strategy.management.updated_by')" width="120" />
        <el-table-column :label="t('crud.table.operation')" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="activateVersion(row)">{{ t('common.strategy.management.activate') }}</el-button>
            <el-button size="small" type="info" @click="compareVersion(row)">{{ t('common.strategy.management.compare') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 策略测试对话框 -->
    <el-dialog v-model="showTestDialog" :title="t('common.strategy.management.test')" width="800px">
      <div class="test-form">
        <el-form :model="testForm" label-width="120px">
          <el-form-item :label="t('common.strategy.management.test_context')">
            <el-input
              v-model="testForm.context"
              type="textarea"
              :rows="8"
              :placeholder="t('common.strategy.management.test_context_placeholder')"
            />
          </el-form-item>
        </el-form>
      </div>

      <div v-if="testResult" class="test-result">
        <el-divider>{{ t('common.strategy.management.test_result') }}</el-divider>
        <el-descriptions border :column="2">
          <el-descriptions-item :label="t('common.strategy.management.execution_result')">
            <el-tag :type="testResult.success ? 'success' : 'danger'">
              {{ testResult.success ? t('common.strategy.management.success') : t('common.strategy.management.failed') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('common.strategy.management.strategy_effect')">
            <el-tag :type="testResult.effect === 'ALLOW' ? 'success' : 'danger'">
              {{ testResult.effect }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('common.strategy.management.execution_time')">
            {{ testResult.executionTime }}ms
          </el-descriptions-item>
          <el-descriptions-item :label="t('common.strategy.management.execution_steps')">
            {{ testResult.steps?.length || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <el-collapse v-if="testResult.steps && testResult.steps.length > 0" style="margin-top: 16px;">
          <el-collapse-item :title="t('common.strategy.management.execution_steps_detail')" name="steps">
            <el-timeline>
              <el-timeline-item
                v-for="step in testResult.steps"
                :key="step.nodeId"
                :type="step.executed ? 'success' : 'info'"
              >
                <div class="step-info">
                  <div class="step-name">{{ step.nodeName }}</div>
                  <div class="step-duration">{{ step.duration }}ms</div>
                  <div v-if="step.result" class="step-result">
                    {{ t('common.strategy.management.result') }}: {{ JSON.stringify(step.result) }}
                  </div>
                  <div v-if="step.error" class="step-error">
                    {{ t('common.strategy.management.error') }}: {{ step.error }}
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <el-button @click="showTestDialog = false">{{ t('common.button.close') }}</el-button>
        <el-button type="primary" @click="runTest" :loading="testing">
          {{ t('common.strategy.management.execute_test') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { BtcConfirm, BtcMessage, BtcCrud, BtcCrudRow, BtcRefreshBtn, BtcAddBtn, BtcMultiDeleteBtn, BtcCrudFlex1, BtcCrudSearchKey, BtcCrudActions, BtcTable, BtcPagination, BtcUpsert } from '@btc/shared-components';
import { useI18n, usePageColumns, usePageForms, usePageService } from '@btc/shared-core';
import { useMessage } from '@/utils/use-message';
import type {
  Strategy,
  StrategyTemplate,
  StrategyExecutionResult,
  StrategyExecutionContext
} from '@/types/strategy';
import {
  StrategyType,
  StrategyStatus
} from '@/types/strategy';
import { strategyService } from '@/services/strategy';

const { t } = useI18n();
const message = useMessage();
const crudRef = ref();

// 响应式数据
const statusFilter = ref<StrategyStatus | ''>('');
const showVersionDialog = ref(false);
const showTestDialog = ref(false);
const testing = ref(false);
const testingStrategies = ref(new Set<string>());
const versionHistory = ref<Strategy[]>([]);
const testForm = ref({
  context: '{\n  "user": {\n    "id": "123",\n    "roles": ["user"],\n    "permissions": ["read"]\n  },\n  "resource": {\n    "type": "document",\n    "id": "doc-001"\n  }\n}'
});
const testResult = ref<StrategyExecutionResult | null>(null);
const currentTestStrategy = ref<Strategy | null>(null);

// 策略状态选项
const strategyStatuses = computed(() => [
  { value: 'DRAFT', label: t('common.strategy.management.status.draft') },
  { value: 'TESTING', label: t('common.strategy.management.status.testing') },
  { value: 'ACTIVE', label: t('common.strategy.management.status.active') },
  { value: 'INACTIVE', label: t('common.strategy.management.status.inactive') },
  { value: 'ARCHIVED', label: t('common.strategy.management.status.archived') }
]);

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('strategy.management');
const { formItems: baseFormItems } = usePageForms('strategy.management');

// 策略服务 - 使用 usePageService 但需要特殊处理（strategyService 有自定义方法）
const pageStrategyService = usePageService('strategy.management', 'strategy', {
  showSuccessMessage: true,
});

// 策略服务适配器 - 需要包装自定义的 deleteStrategy 和 deleteStrategies 方法
const wrappedService = {
  ...strategyService,
  ...(pageStrategyService || {}),
  delete: async (id: string) => {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 单个删除：直接传递 ID
    await strategyService.deleteStrategy(id);

    message.success(t('crud.message.delete_success'));
  },
  deleteBatch: async (ids: string[]) => {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 批量删除：调用 deleteStrategies 方法
    await strategyService.deleteStrategies(ids);

    message.success(t('crud.message.delete_success'));
  }
};

// 表格列配置 - 从 config.ts 读取
const columns = baseColumns;

// 表单配置 - 从 config.ts 读取
const formItems = computed(() => [
  ...(baseFormItems.value || []),
  {
    prop: 'description',
    label: 'common.description',
    span: 24,
    component: {
      name: 'el-input',
      props: { type: 'textarea', rows: 3 }
    }
  }
]);

// 工具函数
const getStatusTagType = (status: StrategyStatus) => {
  const statusMap = {
    'DRAFT': 'info',
    'TESTING': 'warning',
    'ACTIVE': 'success',
    'INACTIVE': 'danger',
    'ARCHIVED': 'default'
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: StrategyStatus) => {
  const labelMap = {
    'DRAFT': t('common.strategy.management.status.draft'),
    'TESTING': t('common.strategy.management.status.testing'),
    'ACTIVE': t('common.strategy.management.status.active'),
    'INACTIVE': t('common.strategy.management.status.inactive'),
    'ARCHIVED': t('common.strategy.management.status.archived')
  };
  return labelMap[status] || status;
};

// 事件处理函数
const handleStatusFilter = () => {
  // 状态变化时重新加载数据
  setTimeout(() => crudRef.value?.crud.loadData(), 50);
};

function onBeforeRefresh(params: Record<string, unknown>) {
  // 仅注入状态筛选；关键字由 BtcCrudSearchKey 注入 params.keyword（对象或空对象）
  const next = { ...params };
  if (statusFilter.value) {
    (next as any).status = statusFilter.value;
  }
  return next;
}
const showVersionHistory = async (strategy: Strategy) => {
  try {
    versionHistory.value = await strategyService.getStrategyVersions(strategy.id);
    showVersionDialog.value = true;
  } catch (error) {
    BtcMessage.error(t('common.strategy.management.get_version_history_failed'));
  }
};

const activateVersion = async (version: Strategy) => {
  try {
    await strategyService.activateStrategyVersion(version.id, version.version);
    BtcMessage.success(t('common.strategy.management.version_activate_success'));
    showVersionDialog.value = false;
    crudRef.value?.crud.loadData();
  } catch (error) {
    BtcMessage.error(t('common.strategy.management.version_activate_failed'));
  }
};

const compareVersion = (version: Strategy) => {
  BtcMessage.info(t('common.strategy.management.version_compare_coming_soon'));
};

const testStrategy = (strategy: Strategy) => {
  currentTestStrategy.value = strategy;
  testResult.value = null;
  showTestDialog.value = true;
};

const runTest = async () => {
  if (!currentTestStrategy.value) return;

  testing.value = true;
  testingStrategies.value.add(currentTestStrategy.value.id);

  try {
    const context: StrategyExecutionContext = {
      strategyId: currentTestStrategy.value.id,
      executionId: Date.now().toString(),
      input: JSON.parse(testForm.value.context),
      variables: {},
      environment: {
        timestamp: Date.now(),
        source: 'test'
      }
    };

    testResult.value = await strategyService.testStrategy(currentTestStrategy.value.id, context);
    BtcMessage.success(t('common.strategy.management.test_complete'));
  } catch (error) {
    BtcMessage.error(t('common.strategy.management.test_failed'));
  } finally {
    testing.value = false;
    testingStrategies.value.delete(currentTestStrategy.value.id);
  }
};

const cloneStrategy = async (strategy: Strategy) => {
  try {
    const cloned = await strategyService.createStrategy({
      ...strategy,
      name: `${strategy.name} ${t('common.strategy.management.copy_suffix')}`,
      status: 'DRAFT' as StrategyStatus,
      version: '1.0.0'
    });
    BtcMessage.success(t('common.strategy.management.clone_success'));
    crudRef.value?.crud.loadData();
  } catch (error) {
    BtcMessage.error(t('common.strategy.management.clone_failed'));
  }
};

const exportStrategy = async (strategy: Strategy) => {
  try {
    const blob = await strategyService.exportStrategy(strategy.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategy-${strategy.name}-${strategy.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
    BtcMessage.success(t('common.strategy.management.export_success'));
  } catch (error) {
    BtcMessage.error(t('common.strategy.management.export_failed'));
  }
};

// 初始化
onMounted(() => {
  // 延迟加载数据
  setTimeout(() => crudRef.value?.crud.loadData(), 100);
});
</script>

<style lang="scss" scoped>
.strategy-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 0;

  .strategy-crud {
    flex: 1 1 auto;
    min-height: 0;

    .strategy-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
  }

  .test-form {
    margin-bottom: 16px;
  }

  .test-result {
    .step-info {
      .step-name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .step-duration {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-bottom: 4px;
      }

      .step-result {
        font-size: 12px;
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
        padding: 4px 8px;
        border-radius: 4px;
        margin-bottom: 4px;
      }

      .step-error {
        font-size: 12px;
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
        padding: 4px 8px;
        border-radius: 4px;
      }
    }
  }
}
</style>
