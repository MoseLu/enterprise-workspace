<template>
  <div class="page">
    <div class="deployment-test-container">
      <!-- 测试配置工具栏 -->
      <BtcCrudRow class="config-toolbar">
        <BtcCrudFlex1 />
        <BtcTableButton :config="startTestButtonConfig" />
        <BtcTableButton v-if="testing" :config="stopTestButtonConfig" />
      </BtcCrudRow>

      <!-- 应用选择 -->
      <el-table
        ref="appTableRef"
        :data="availableApps"
        @selection-change="handleSelectionChange"
        :row-key="(row) => row.name"
        border
      >
        <el-table-column type="selection" width="55" :selectable="() => !testing" align="center" />
        <el-table-column
          prop="label"
          :label="t('monitor.deploymentTest.config.appName')"
          min-width="150"
          align="center"
        />
        <el-table-column
          prop="name"
          :label="t('monitor.deploymentTest.config.appId')"
          min-width="200"
          align="center"
        />
      </el-table>

      <!-- 测试进度 -->
      <div v-if="testing || testResults.length > 0">
        <div v-if="testing" class="progress-info">
          <el-progress
            :percentage="progressPercentage"
            :status="progressStatus"
            :stroke-width="20"
            :show-text="true"
          />
          <BtcCrudRow class="progress-details-row">
            <el-icon class="progress-icon" :size="16">
              <Loading />
            </el-icon>
            <span class="progress-text">
              {{ currentTestApp ? t('monitor.deploymentTest.progress.testing', { app: getAppLabel(currentTestApp) }) : t('monitor.deploymentTest.progress.preparing') }}
            </span>
            <BtcCrudFlex1 />
            <span class="progress-stats">
              {{ testResults.length }} / {{ selectedApps.length }} {{ t('monitor.deploymentTest.results.app') }}
            </span>
          </BtcCrudRow>
        </div>

        <!-- 测试结果表格 -->
        <div v-if="testResults.length > 0" class="test-results">
          <el-table :data="testResults" stripe border>
            <el-table-column
              prop="appName"
              :label="t('monitor.deploymentTest.results.app')"
              width="180"
            >
              <template #default="{ row }">
                <div class="app-cell">
                  <el-icon
                    :class="row.status === 'success' ? 'icon-success' : 'icon-error'"
                    :size="20"
                  >
                    <Check v-if="row.status === 'success'" />
                    <Close v-else />
                  </el-icon>
                  <span>{{ getAppLabel(row.appName) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="domain"
              :label="t('monitor.deploymentTest.results.domain')"
              min-width="220"
            >
              <template #default="{ row }">
                <el-link :href="`https://${row.domain}`" target="_blank" type="primary">
                  {{ row.domain }}
                </el-link>
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              :label="t('monitor.deploymentTest.results.status')"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'success' ? 'success' : 'danger'"
                  effect="dark"
                  size="large"
                >
                  {{ row.status === 'success' ? t('monitor.deploymentTest.results.passed') : t('monitor.deploymentTest.results.failed') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="duration"
              :label="t('monitor.deploymentTest.results.duration')"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                <span class="duration-text">{{ formatDuration(row.duration) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="errors"
              :label="t('monitor.deploymentTest.results.errors')"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-badge
                  :value="row.errorCount"
                  :type="row.errorCount > 0 ? 'danger' : 'success'"
                  :hidden="row.errorCount === 0"
                >
                  <span :class="{ 'error-count': row.errorCount > 0 }">
                    {{ row.errorCount }}
                  </span>
                </el-badge>
              </template>
            </el-table-column>
            <el-table-column
              :label="t('monitor.deploymentTest.results.actions')"
              width="200"
              align="center"
              fixed="right"
            >
              <template #default="{ row }">
                <el-button-group>
                  <el-button
                    size="small"
                    @click="viewDetails(row)"
                    :icon="View"
                  >
                    {{ t('monitor.deploymentTest.results.viewDetails') }}
                  </el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="downloadReport(row)"
                    :icon="Download"
                  >
                    {{ t('monitor.deploymentTest.results.download') }}
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 测试摘要 -->
      <div v-if="testSummary.total > 0">
        <BtcCrudRow class="summary-stats-row">
          <div class="stat-item">
            <div class="stat-label">{{ t('monitor.deploymentTest.summary.total') }}</div>
            <div class="stat-value">{{ testSummary.total }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">{{ t('monitor.deploymentTest.summary.passed') }}</div>
            <div class="stat-value success">{{ testSummary.passed }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">{{ t('monitor.deploymentTest.summary.failed') }}</div>
            <div class="stat-value failed">{{ testSummary.failed }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">{{ t('monitor.deploymentTest.summary.passRate') }}</div>
            <div class="stat-value" :class="{ 'high-rate': passRate >= 80, 'low-rate': passRate < 80 }">
              {{ passRate }}%
            </div>
          </div>
        </BtcCrudRow>
      </div>

      <!-- 详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="t('monitor.deploymentTest.details.title')"
        width="80%"
        class="details-dialog"
      >
        <div v-if="selectedResult" class="test-details">
          <div class="detail-header">
            <h3>{{ getAppLabel(selectedResult.appName) }}</h3>
            <el-tag
              :type="selectedResult.success ? 'success' : 'danger'"
              size="large"
            >
              {{ selectedResult.success ? t('monitor.deploymentTest.results.passed') : t('monitor.deploymentTest.results.failed') }}
            </el-tag>
          </div>

          <el-descriptions :column="2" border class="detail-descriptions">
            <el-descriptions-item :label="t('monitor.deploymentTest.details.domain')">
              <el-link :href="`https://${selectedResult.config.domain}`" target="_blank" type="primary">
                {{ selectedResult.config.domain }}
              </el-link>
            </el-descriptions-item>
            <el-descriptions-item :label="t('monitor.deploymentTest.details.duration')">
              {{ formatDuration(selectedResult.duration) }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="selectedResult.errors && selectedResult.errors.length > 0" class="errors-section">
            <h4>
              <el-icon :size="20" color="var(--el-color-danger)" class="error-icon">
                <Warning />
              </el-icon>
              {{ t('monitor.deploymentTest.details.errors') }} ({{ selectedResult.errors.length }})
            </h4>
            <el-table :data="selectedResult.errors" stripe class="errors-table">
              <el-table-column
                prop="type"
                :label="t('monitor.deploymentTest.details.errorType')"
                width="200"
              />
              <el-table-column
                prop="message"
                :label="t('monitor.deploymentTest.details.errorMessage')"
                show-overflow-tooltip
              />
            </el-table>
          </div>
          <div v-else class="no-errors">
            <BtcEmpty description="无错误" :image-size="100" />
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n, logger } from '@btc/shared-core';
import { BtcCrudRow, BtcCrudFlex1, BtcTableButton, BtcEmpty } from '@btc/shared-components';
import type { BtcTableButtonConfig } from '@btc/shared-components';
import { ElTable } from 'element-plus';
import { BtcMessage, BtcConfirm } from '@btc/shared-components';
import { Check, Close, View, Download, Loading, Warning } from '@element-plus/icons-vue';
import { startTest as startDeploymentTestAPI, getTestStatus as getDeploymentTestStatus, getTestReport as getDeploymentTestReport } from '../../../api/deployment-test';

defineOptions({
  name: 'DeploymentTest',
});

const { t } = useI18n();

// 可用应用列表
const availableApps = ref([
  { name: 'system-app', label: '系统应用' },
  { name: 'admin-app', label: '管理应用' },
  { name: 'logistics-app', label: '物流应用' },
  { name: 'quality-app', label: '质量应用' },
  { name: 'production-app', label: '生产应用' },
  { name: 'engineering-app', label: '工程应用' },
  { name: 'finance-app', label: '财务应用' },
]);

// 选中的应用
const selectedApps = ref<string[]>([]);
// 表格引用
const appTableRef = ref<InstanceType<typeof ElTable>>();

// 测试配置（使用默认值，不需要用户配置）
const testConfig = ref({
  timeout: 30000, // 默认超时时间
  baseUrl: undefined, // 从nginx配置中获取
});

// 测试状态
const testing = ref(false);
const currentTestApp = ref<string | null>(null);
const progressPercentage = ref(0);
const progressStatus = ref<'success' | 'exception' | 'warning' | ''>('');

// 测试结果
interface TestError {
  type: string;
  message: string;
}

interface TestResult {
  appName: string;
  config: {
    domain: string;
    description: string;
  };
  startTime: string;
  success: boolean;
  errors?: TestError[];
  duration: number;
}

interface TestResultRow {
  appName: string;
  domain: string;
  status: 'success' | 'failed';
  duration: number;
  errorCount: number;
  errors?: TestError[];
}

const testResults = ref<TestResultRow[]>([]);

// 详情对话框
const detailDialogVisible = ref(false);
const selectedResult = ref<TestResult | null>(null);

// 测试摘要
const testSummary = computed(() => {
  const total = testResults.value.length;
  const passed = testResults.value.filter(r => r.status === 'success').length;
  const failed = total - passed;
  return { total, passed, failed };
});

const passRate = computed(() => {
  if (testSummary.value.total === 0) return 0;
  return Math.round((testSummary.value.passed / testSummary.value.total) * 100);
});

// 获取应用标签
const getAppLabel = (appName: string) => {
  const app = availableApps.value.find(a => a.name === appName);
  return app?.label || appName;
};

// 格式化时长
const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

// 处理表格选择变化
const handleSelectionChange = (selection: typeof availableApps.value) => {
  if (testing.value) return;
  selectedApps.value = selection.map(app => app.name);
};

// 开始测试按钮配置
const startTestButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: () => '', // 不显示图标，只显示文字
  label: testing.value ? t('monitor.deploymentTest.testing') : t('monitor.deploymentTest.startTest'),
  type: 'primary',
  onClick: () => {
    if (selectedApps.value.length === 0) {
      BtcMessage.warning(t('monitor.deploymentTest.errors.noAppSelected'));
      return;
    }
    if (testing.value) {
      BtcMessage.info(t('monitor.deploymentTest.testing'));
      return;
    }
    startTest();
  },
  showLabel: true,
  tooltip: () => {
    if (selectedApps.value.length === 0) {
      return t('monitor.deploymentTest.errors.noAppSelected');
    }
    if (testing.value) {
      return t('monitor.deploymentTest.testing');
    }
    return t('monitor.deploymentTest.startTest');
  },
  ariaLabel: () => testing.value ? t('monitor.deploymentTest.testing') : t('monitor.deploymentTest.startTest'),
}));

// 停止测试按钮配置
const stopTestButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'pause',
  label: t('monitor.deploymentTest.stopTest'),
  type: 'danger',
  onClick: stopTest,
  showLabel: true,
  tooltip: () => t('monitor.deploymentTest.stopTest'),
  ariaLabel: () => t('monitor.deploymentTest.stopTest'),
}));


// 开始测试
const startTest = async () => {
  if (selectedApps.value.length === 0) {
    ElMessage.warning(t('monitor.deploymentTest.errors.noAppSelected'));
    return;
  }

  try {
    console.info('[DeploymentTest] 开始测试，选中的应用:', selectedApps.value);
    testing.value = true;
    testResults.value = [];
    progressPercentage.value = 0;
    progressStatus.value = '';

    // 调用测试API
    console.info('[DeploymentTest] 调用 startDeploymentTestAPI...');
    const testId = await startDeploymentTestAPI({
      apps: selectedApps.value,
      timeout: testConfig.value.timeout,
      baseUrl: testConfig.value.baseUrl || undefined,
    });
    console.info('[DeploymentTest] 测试ID:', testId);

    // 轮询测试状态
    console.info('[DeploymentTest] 开始轮询测试状态...');
    await pollTestStatus(testId);
  } catch (error: unknown) {
    logger.error('[DeploymentTest] 启动测试失败:', error);
    ElMessage.error(error instanceof Error ? error.message : t('monitor.deploymentTest.errors.startFailed'));
    testing.value = false;
  }
};

// 轮询测试状态
const pollTestStatus = async (testId: string) => {
  // 如果testId无效，直接返回错误
  if (!testId) {
    logger.error('[DeploymentTest] testId无效，无法轮询状态');
    ElMessage.error(t('monitor.deploymentTest.errors.startFailed') + ': 测试ID无效');
    testing.value = false;
    return;
  }

  const maxAttempts = 120; // 最多轮询2分钟（每1秒一次）
  let attempts = 0;
  let statusInterval: ReturnType<typeof setInterval> | null = null;
  let isCleanedUp = false;

  const cleanup = () => {
    if (statusInterval) {
      clearInterval(statusInterval);
      statusInterval = null;
    }
    isCleanedUp = true;
  };

  const checkStatus = async () => {
    if (isCleanedUp) {
      console.info('[DeploymentTest] 已清理，跳过状态检查');
      return;
    }

    try {
      console.info('[DeploymentTest] 检查测试状态，testId:', testId, 'attempts:', attempts);
      const status = await getDeploymentTestStatus(testId);
      console.info('[DeploymentTest] 测试状态:', status);

      // 检查状态对象是否有效
      if (!status || typeof status !== 'object' || !status.status) {
        logger.error('[DeploymentTest] 无效的状态对象:', status);
        cleanup();
        testing.value = false;
        BtcMessage.error(t('monitor.deploymentTest.errors.statusCheckFailed') + ': 状态格式错误');
        return;
      }

      if (status.status === 'completed') {
        cleanup();

        // 获取测试结果
        const results = await getDeploymentTestReport(testId);
        testResults.value = results.apps ? Object.entries(results.apps).map(([appName, result]: [string, TestResult]) => ({
          appName,
          domain: result.config?.domain || '',
          status: result.success ? 'success' : 'failed',
          duration: result.duration || 0,
          errorCount: result.errors?.length || 0,
          errors: result.errors,
        })) : [];

        progressPercentage.value = 100;
        progressStatus.value = testSummary.value.failed === 0 ? 'success' : 'exception';
        testing.value = false;
        currentTestApp.value = null;

        BtcMessage.success(t('monitor.deploymentTest.testCompleted'));
      } else if (status.status === 'running') {
        progressPercentage.value = Math.min(status.progress || 0, 99);
        currentTestApp.value = status.currentApp || null;
        attempts++;

        if (attempts >= maxAttempts) {
          cleanup();
          testing.value = false;
          BtcMessage.error(t('monitor.deploymentTest.errors.timeout'));
        }
      } else if (status.status === 'pending') {
        // 处理 pending 状态：显示准备中
        progressPercentage.value = 0;
        currentTestApp.value = null;
        attempts++;

        // 如果 pending 状态持续太久，可能是测试没有启动
        if (attempts > 10) {
          cleanup();
          testing.value = false;
          BtcMessage.error(t('monitor.deploymentTest.errors.startFailed') + ': 测试未能启动');
        }
      } else if (status.status === 'failed') {
        cleanup();
        testing.value = false;
        BtcMessage.error(status.error || t('monitor.deploymentTest.errors.testFailed'));
      }
    } catch (error: unknown) {
      logger.error('检查测试状态失败:', error);
      cleanup();
      testing.value = false;
      BtcMessage.error(error instanceof Error ? error.message : t('monitor.deploymentTest.errors.statusCheckFailed'));
    }
  };

  // 立即检查一次
  await checkStatus();

  // 如果还没有清理，则每1秒检查一次
  if (!isCleanedUp) {
    statusInterval = setInterval(checkStatus, 1000);
  }
};

// 停止测试
const stopTest = async () => {
  try {
    await BtcConfirm(
      t('monitor.deploymentTest.confirmStop'),
      t('monitor.deploymentTest.confirm'),
      {
        type: 'warning',
      }
    );
    testing.value = false;
    ElMessage.info(t('monitor.deploymentTest.testStopped'));
  } catch {
    // 用户取消
  }
};

// 查看详情
const viewDetails = (row: TestResultRow) => {
  // 将TestResultRow转换为TestResult格式
  const testResult: TestResult = {
    appName: row.appName,
    config: {
      domain: row.domain,
      description: '',
    },
    startTime: new Date().toISOString(),
    success: row.status === 'success',
    errors: row.errors || [],
    duration: row.duration,
  };
  selectedResult.value = testResult;
  detailDialogVisible.value = true;
};

// 下载报告
const downloadReport = async (_row: TestResultRow) => {
  try {
    // 这里应该调用API获取报告并下载
    ElMessage.info(t('monitor.deploymentTest.downloadStarted'));
  } catch (error: unknown) {
    ElMessage.error(error instanceof Error ? error.message : t('monitor.deploymentTest.errors.downloadFailed'));
  }
};

onUnmounted(() => {
  // 清理定时器等资源
});
</script>

<style scoped lang="scss">


.deployment-test-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  min-height: 0;
  gap: 10px;
  background-color: var(--el-bg-color);
}

.config-toolbar {
  align-items: center;
}

.test-actions-row {
  margin-top: 20px;
}

.progress-info {
  margin-bottom: 20px;

  .progress-details-row {
    margin-top: 12px;
    align-items: center;
    gap: 8px;

    .progress-icon {
      animation: rotate 1s linear infinite;
      color: var(--el-color-primary);
    }

    .progress-text {
      color: var(--el-text-color-regular);
      font-size: 14px;
    }

    .progress-stats {
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.test-results {
  margin-top: 0;

  .app-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .icon-success {
      color: var(--el-color-success);
    }

    .icon-error {
      color: var(--el-color-danger);
    }
  }

  .duration-text {
    font-family: 'Courier New', monospace;
    color: var(--el-text-color-regular);
  }

  .error-count {
    color: var(--el-color-danger);
    font-weight: 600;
  }
}

.summary-stats-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;

  .stat-item {
    flex: 1;
    min-width: 150px;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
    text-align: center;

    .stat-label {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      line-height: 1.2;

      &.success {
        color: var(--el-color-success);
      }

      &.failed {
        color: var(--el-color-danger);
      }

      &.high-rate {
        color: var(--el-color-success);
      }

      &.low-rate {
        color: var(--el-color-danger);
      }
    }
  }
}

.test-details {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--el-border-color-light);

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--btc-color-text-primary);
    }
  }

  .detail-descriptions {
    margin-bottom: 24px;
  }

  .errors-section {
    margin-top: 24px;

    h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-color-danger);

      .error-icon {
        color: var(--el-color-danger);
      }
    }
  }

  .no-errors {
    margin-top: 24px;
    text-align: center;
  }
}

.details-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}
</style>
