<template>
  <div class="page log-reporter-test">
    <!-- 应用选择 -->
    <div class="app-selector-section">
      <el-card>
        <div class="app-selector">
          <span class="selector-label">选择应用：</span>
          <el-radio-group v-model="selectedAppName" style="display: flex; flex-wrap: wrap; gap: 12px;">
            <el-radio
              v-for="app in appList"
              :key="app.id"
              :value="app.id"
              :label="app.id"
              style="margin-right: 0;"
            >
              {{ getAppDisplayName(app) }}
            </el-radio>
          </el-radio-group>
        </div>
      </el-card>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <div class="action-buttons">
        <el-button type="primary" @click="sendTestLog" :loading="sending" size="default">
          <el-icon><Promotion /></el-icon>
          发送测试日志
        </el-button>
        <el-button @click="sendBatchTestLogs" :loading="sending" size="default">
          <el-icon><DocumentCopy /></el-icon>
          批量发送（5条）
        </el-button>
        <el-button @click="flushQueue" :loading="flushing" size="default">
          <el-icon><Refresh /></el-icon>
          立即刷新队列
        </el-button>
      </div>
      <div class="qps-test-section">
        <div class="qps-test-label">QPS测试：</div>
        <div class="qps-controls">
          <el-button @click="qpsTestCount = Math.max(1, qpsTestCount - 10)" size="small" :disabled="qpsTestCount <= 1">
            -10
          </el-button>
          <el-button @click="qpsTestCount = Math.max(1, qpsTestCount - 5)" size="small" :disabled="qpsTestCount <= 1">
            -5
          </el-button>
          <el-button @click="qpsTestCount = Math.max(1, qpsTestCount - 1)" size="small" :disabled="qpsTestCount <= 1">
            -1
          </el-button>
          <el-input-number
            v-model="qpsTestCount"
            :min="1"
            :max="100"
            size="small"
            style="width: 100px;"
          />
          <el-button @click="qpsTestCount = Math.min(100, qpsTestCount + 1)" size="small" :disabled="qpsTestCount >= 100">
            +1
          </el-button>
          <el-button @click="qpsTestCount = Math.min(100, qpsTestCount + 5)" size="small" :disabled="qpsTestCount >= 100">
            +5
          </el-button>
          <el-button @click="qpsTestCount = Math.min(100, qpsTestCount + 10)" size="small" :disabled="qpsTestCount >= 100">
            +10
          </el-button>
        </div>
        <el-button @click="sendQpsTestLogs" :loading="sending" size="default" type="warning">
          <el-icon><DocumentCopy /></el-icon>
          执行QPS测试
        </el-button>
      </div>
    </div>

    <!-- 完整请求体预览 -->
    <el-card class="request-preview-card">
      <template #header>
        <span>完整请求体（JSON）</span>
      </template>
      <pre class="json-preview">{{ formatRequestData(previewData) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { BtcMessage } from '@btc/shared-components';
import { Promotion, DocumentCopy, Refresh } from '@element-plus/icons-vue';
import { reportLog, getLogReporter, getQueueLength, type LogEntry, type LogLevel } from '@btc/shared-core/utils/log-reporter';
import { getFullAppId, getSimpleAppName, convertToServerLogEntry, toISOString } from '@btc/shared-core/utils/log-reporter';
import { getCurrentAppId } from '@btc/shared-core/utils/env-info';
import { getAllApps, logger } from '@btc/shared-core';
import { isBusinessApp } from '@btc/shared-core/configs/app-env.config';
import { tSync } from '@/i18n/getters';
import type { LogReportRequest, ServerLogEntry } from '@btc/shared-core/utils/log-reporter';

const sending = ref(false);
const flushing = ref(false);
const queueLength = ref(0);
const qpsTestCount = ref(20); // QPS测试次数，默认20次

// 应用列表（只包含业务应用 + 测试用的不存在应用）
const appList = computed(() => {
  const businessApps = getAllApps().filter(app => {
    // 只显示业务应用，过滤掉特殊应用（main-app, layout-app, docs-app, home-app）
    const appName = app.id.endsWith('-app') ? app.id : `${app.id}-app`;
    return isBusinessApp(appName);
  });

  // 添加一个不存在的应用，用于错误测试
  const invalidApp = {
    id: 'invalid-app',
    name: 'invalid-app',
    displayName: '不存在应用（测试用）',
  };

  return [...businessApps, invalidApp];
});

// 选中的应用名称
const selectedAppName = ref<string>('system');

// 监听应用列表变化，如果当前选择的应用不在列表中，自动切换到第一个应用
watch(
  appList,
  (apps) => {
    if (apps.length > 0) {
      const currentApp = apps.find(app => app.id === selectedAppName.value);
      if (!currentApp) {
        selectedAppName.value = apps[0].id;
      }
    }
  },
  { immediate: true }
);

// 获取应用显示名称（使用国际化翻译）
const getAppDisplayName = (app: { id: string; name: string; displayName?: string }): string => {
  // 如果是测试用的不存在应用，直接返回显示名称
  if (app.id === 'invalid-app' && app.displayName) {
    return `${app.displayName} (${app.id})`;
  }

  // 优先使用 domain.type.{appId} 翻译
  const domainTypeKey = `domain.type.${app.id}`;
  let translated = tSync(domainTypeKey);

  // 如果翻译成功（返回值不等于 key），使用翻译结果
  if (translated && translated !== domainTypeKey) {
    return `${translated} (${app.id})`;
  }

  // 如果翻译失败，尝试使用 displayName（如果有）
  if (app.displayName && app.displayName !== app.name) {
    return `${app.displayName} (${app.id})`;
  }

  // 最后使用应用名称，但尝试美化显示
  // 将 "admin-app" 转换为 "Admin App" 格式
  const displayName = app.name
    .replace(/-app$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `${displayName} (${app.id})`;
};

// 更新队列长度
const updateQueueLength = () => {
  try {
    queueLength.value = getQueueLength();
  } catch {
    queueLength.value = 0;
  }
};

// 定期更新队列长度
setInterval(updateQueueLength, 1000);

// 生成测试日志条目
const generateTestLogEntry = (index: number = 0): LogEntry => {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
  const messages = [
    '这是一条测试日志消息',
    '批量测试日志 1',
    '批量测试日志 2',
    '批量测试日志 3',
    '批量测试日志 4',
  ];

  return {
    level: levels[index] || 'info',
    message: messages[index] || `测试日志 ${index + 1}`,
    timestamp: Date.now() + index * 1000, // 每条日志间隔1秒
    appName: selectedAppName.value,
    // 不设置 loggerName，让它自动从路由路径提取模块名称
    context: index === 0 ? { userId: '123', action: 'test' } : undefined,
    error: index === 3 ? {
      name: 'TestError',
      message: '测试错误信息',
      stack: 'Error: 测试错误信息\n    at test (test.js:1:1)',
    } : undefined,
  };
};

// 预览数据（即将提交的内容）
const previewData = computed<LogReportRequest>(() => {
  // 生成一条测试日志
  const testLogEntry = generateTestLogEntry(0);
  const serverLog = convertToServerLogEntry(testLogEntry);
  const fullAppId = getFullAppId(selectedAppName.value);
  const simpleAppName = getSimpleAppName(fullAppId);

  return {
    appId: fullAppId,
    appName: simpleAppName,
    timestamp: toISOString(Date.now()),
    logs: [serverLog],
  };
});

// 格式化显示的数据
const formatData = (data: any): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
};

// 格式化请求数据（用于显示完整请求体）
const formatRequestData = (data: LogReportRequest): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return JSON.stringify(data, null, 2);
  }
};

// 获取日志级别的标签类型
const getLogLevelType = (level: string): string => {
  const levelMap: Record<string, string> = {
    'DEBUG': 'info',
    'INFO': 'success',
    'WARN': 'warning',
    'ERROR': 'danger',
    'FATAL': 'danger',
  };
  return levelMap[level] || 'info';
};

// 解析预览数据中的日志（用于显示）
const previewLogs = computed<ServerLogEntry[]>(() => {
  try {
    return previewData.value.logs || [];
  } catch {
    return [];
  }
});

// 发送测试日志
const sendTestLog = async () => {
  try {
    sending.value = true;
    const testLogEntry = generateTestLogEntry(0);
    reportLog(testLogEntry);
    updateQueueLength();

    // 立即刷新队列，静默处理错误（日志库本身会记录请求）
    const reporter = getLogReporter();
    try {
      await reporter.flush(false, true); // throwOnError: false, skipRetry: true
    } catch {
      // 静默处理错误，日志库本身会记录
    }
    updateQueueLength();

    BtcMessage.success('测试日志已发送');
  } catch (error: any) {
    // 静默处理错误，日志库本身会记录
    BtcMessage.success('测试日志已发送');
  } finally {
    sending.value = false;
  }
};

// 批量发送测试日志
const sendBatchTestLogs = async () => {
  try {
    sending.value = true;
    const batchSize = 5;

    for (let i = 0; i < batchSize; i++) {
      const logEntry = generateTestLogEntry(i);
      reportLog(logEntry);
    }

    updateQueueLength();

    // 立即刷新队列，静默处理错误（日志库本身会记录请求）
    const reporter = getLogReporter();
    try {
      await reporter.flush(false, true); // throwOnError: false, skipRetry: true
    } catch {
      // 静默处理错误，日志库本身会记录
    }
    updateQueueLength();

    BtcMessage.success(`已批量发送 ${batchSize} 条测试日志`);
  } catch (error: any) {
    // 静默处理错误，日志库本身会记录
    BtcMessage.success(`已批量发送 ${batchSize} 条测试日志`);
  } finally {
    sending.value = false;
  }
};

// QPS测试：同时发送多条日志，触发多次网络请求
const sendQpsTestLogs = async () => {
  try {
    sending.value = true;
    const qpsTestSize = qpsTestCount.value;

    // 直接使用 fetch 发送多个独立的请求，确保同时发送
    const promises: Promise<{ success: boolean; index: number; error?: string }>[] = [];

    for (let i = 0; i < qpsTestSize; i++) {
      const logEntry = generateTestLogEntry(i);
      logEntry.message = `QPS测试日志 ${i + 1}/${qpsTestSize}`;

      // 转换为服务器格式
      const serverLog = convertToServerLogEntry(logEntry);
      const fullAppId = getFullAppId(selectedAppName.value);
      const simpleAppName = getSimpleAppName(fullAppId);

      // 构建请求体
      const requestBody = {
        appId: fullAppId,
        appName: simpleAppName,
        timestamp: toISOString(Date.now()),
        logs: [serverLog],
      };

      // URL 使用不带 -app 后缀的应用名
      const appNameForUrl = selectedAppName.value.endsWith('-app') 
        ? selectedAppName.value.slice(0, -4) 
        : selectedAppName.value;
      const url = `/api/system/logs/${appNameForUrl}/receive`;

      // 创建独立的 fetch 请求
      const promise = fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
        .then(async (response) => {
          // 解析响应体
          let responseData: any;
          try {
            responseData = await response.json();
          } catch {
            responseData = null;
          }

          // 检查 HTTP 状态码
          if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            if (responseData?.msg) {
              errorMessage = `HTTP ${response.status}: ${responseData.msg}`;
            } else if (responseData?.message) {
              errorMessage = `HTTP ${response.status}: ${responseData.message}`;
            }
            return { success: false, index: i + 1, error: errorMessage };
          }

          // 检查业务状态码
          if (responseData && typeof responseData.code === 'number' && responseData.code !== 200) {
            let errorMessage = `业务错误 ${responseData.code}`;
            if (responseData.msg) {
              errorMessage = `业务错误 ${responseData.code}: ${responseData.msg}`;
            } else if (responseData.message) {
              errorMessage = `业务错误 ${responseData.code}: ${responseData.message}`;
            }
            return { success: false, index: i + 1, error: errorMessage };
          }

          return { success: true, index: i + 1 };
        })
        .catch((error) => {
          return { success: false, index: i + 1, error: error.message || String(error) };
        });

      promises.push(promise);
    }

    // 等待所有请求完成
    const results = await Promise.all(promises);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const failedItems = results.filter(r => !r.success);

    if (failCount === 0) {
      BtcMessage.success(`QPS测试完成：成功发送 ${successCount} 条日志`);
    } else {
      const errorMsg = failedItems.map(r => `第${r.index}条: ${r.error}`).join('; ');
      BtcMessage.warning(`QPS测试完成：成功 ${successCount} 条，失败 ${failCount} 条。失败详情：${errorMsg}`);
    }

    updateQueueLength();
  } catch (error: any) {
    logger.error('QPS测试失败:', error);
    const errorMessage = error?.message || String(error);
    BtcMessage.error('QPS测试失败：' + errorMessage);
  } finally {
    sending.value = false;
  }
};

// 立即刷新队列
const flushQueue = async () => {
  try {
    flushing.value = true;
    const reporter = getLogReporter();
    try {
      await reporter.flush(false, false); // throwOnError: false，静默处理错误
    } catch {
      // 静默处理错误，日志库本身会记录
    }
    updateQueueLength();
    BtcMessage.success('队列已刷新');
  } catch (error: any) {
    // 静默处理错误，日志库本身会记录
    BtcMessage.success('队列已刷新');
  } finally {
    flushing.value = false;
  }
};

</script>

<style scoped lang="scss">
.log-reporter-test {
  padding: 10px;
  gap: 10px;
  flex: 1;
  min-height: 0;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .app-selector-section {
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;

    .app-selector {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;

      .selector-label {
        font-weight: 500;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;

    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
      align-items: center;
    }

    .qps-test-section {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      padding: 16px;
      border-radius: 8px;

      .qps-test-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }

      .qps-controls {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-wrap: wrap;
      }
    }
  }

  .request-preview-card {
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;

    .json-preview {
      margin: 0;
      padding: 12px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 300px;
      overflow-y: auto;
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }
  }
}
</style>
