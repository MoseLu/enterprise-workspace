<template>
  <div class="plugins-test">
    <el-tabs type="border-card" class="test-tabs">
      <!-- Vite Plugins Tab -->
      <el-tab-pane label="Vite Plugins">
        <!-- Test SVG Plugin -->
        <section class="test-section">
          <h3>SVG Plugin Test</h3>
      <div class="icon-list">
        <div class="icon-item">
          <svg class="icon">
            <use href="#icon-home"></use>
          </svg>
          <span>home</span>
        </div>
        <div class="icon-item">
          <svg class="icon">
            <use href="#icon-user"></use>
          </svg>
          <span>user</span>
        </div>
        <div class="icon-item">
          <svg class="icon">
            <use href="#icon-cart"></use>
          </svg>
          <span>cart</span>
        </div>
      </div>
    </section>

        <!-- Test Ctx Plugin -->
        <section class="test-section">
          <h3>Ctx Plugin Test</h3>
          <pre>{{ ctxInfo }}</pre>
        </section>

        <!-- Test Tag Plugin -->
        <section class="test-section">
          <h3>Tag Plugin Test</h3>
          <p>Check component name in Vue DevTools</p>
          <TestComponent />
        </section>
      </el-tab-pane>

      <!-- EPS System Tab -->
      <el-tab-pane label="EPS System">
        <!-- Test EPS Virtual Module -->
        <section class="test-section">
          <h3>EPS Virtual Module</h3>
          <div v-if="epsInfo">
            <p>Module count: {{ Object.keys(epsInfo).length }}</p>
            <details v-for="(apis, moduleName) in epsInfo" :key="moduleName">
              <summary>
                <strong>{{ moduleName }}</strong> ({{ apis.length }} APIs)
              </summary>
              <ul>
                <li v-for="api in apis" :key="api.name">
                  <code>{{ api.method }}</code> {{ api.path }} - {{ api.name }}
                </li>
              </ul>
            </details>
          </div>
          <p v-else class="loading">Loading...</p>
        </section>

        <!-- Test EPS Service Layer -->
        <section class="test-section">
          <h3>EPS Service Layer</h3>
          <div v-if="serviceInfo">
            <p>Service object built successfully</p>
            <p>Available modules: {{ serviceModules.join(', ') }}</p>
            <div v-if="serviceModules.length > 0" style="margin-top: 1rem;">
              <p><strong>Example:</strong></p>
              <pre>{{ serviceExample }}</pre>
            </div>
          </div>
          <p v-else class="loading">Loading...</p>
        </section>
      </el-tab-pane>

      <!-- Plugin Manager Tab -->
      <el-tab-pane label="Plugin Manager">
        <section class="test-section">
          <h3>Plugin Status</h3>
          <el-table :data="pluginTableData" border stripe>
            <el-table-column prop="name" label="Plugin Name" width="150" />
            <el-table-column prop="version" label="Version" width="100" />
            <el-table-column prop="status" label="Status" width="120">
              <template #default="{ row }">
                <el-tag :type="row.status === 'installed' ? 'success' : 'info'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="Description" />
          </el-table>
        </section>

        <section class="test-section">
          <h3>Plugin Tests</h3>
          <div style="display: flex; gap: 10px; margin-bottom: 1rem;">
            <el-button type="primary" @click="testExcelPlugin">Test Excel Plugin</el-button>
            <el-button type="success" @click="testNotificationPlugin">Test Notification Plugin</el-button>
            <el-button type="info" @click="testLoggerPlugin">Test Logger Plugin</el-button>
          </div>

          <div v-if="pluginTestResult">
            <p><strong>Test Result:</strong></p>
            <pre>{{ pluginTestResult }}</pre>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, onMounted, computed } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import TestComponent from '@components/TestComponent.vue';
import { useCore, initEpsData, usePluginManager } from '@btc/shared-core';
import epsData from 'virtual:eps';

const ctxInfo = ref<any>(null);
const epsInfo = ref<any>(null);
const serviceInfo = ref<any>(null);

// Plugin Manager
const pluginManager = usePluginManager();
const pluginTestResult = ref<string>('');

// Plugin table data
const pluginTableData = computed(() => {
  return pluginManager.list().map(name => {
    const plugin = pluginManager.get(name);
    const status = pluginManager.getStatus(name);
    return {
      name,
      version: plugin?.version || 'N/A',
      status: status || 'unknown',
      description: plugin?.description || '',
    };
  });
});

// 加载 Ctx 插件数据
onMounted(async () => {
  try {
    const ctx = await import('virtual:ctx');
    ctxInfo.value = ctx.default || ctx;
  } catch (_error) {
    ctxInfo.value = { error: 'Failed to load' };
  }

  try {
    epsInfo.value = epsData;

    // 初始化 EPS 数据到全局
    initEpsData(epsInfo.value);

    // 测试服务对象
    const core = useCore();
    serviceInfo.value = core.service;
  } catch (_error) {
    epsInfo.value = { error: 'Failed to load' };
  }
});

const serviceModules = computed(() => {
  if (!serviceInfo.value) return [];
  return Object.keys(serviceInfo.value);
});

const serviceExample = computed(() => {
  if (!serviceInfo.value) return '';
  const modules = Object.keys(serviceInfo.value);
  if (modules.length === 0) return '';

  const moduleName = modules[0];
  const apis = Object.keys(serviceInfo.value[moduleName]);

  return `// Usage example
const { service } = useCore();

// Call ${moduleName} module API
await service.${moduleName}.${apis[0] || 'someApi'}(params);
`;
});

/**
 * Test Excel Plugin
 */
const testExcelPlugin = () => {
  const excelApi = pluginManager.getApi<{ export: (...args: any[]) => void }>('excel');

  if (!excelApi) {
    BtcMessage.error('Excel plugin not installed');
    return;
  }

  pluginTestResult.value = 'Excel plugin API available!\nTrying to export test data...';

  // Export test data
  excelApi.export({
    header: ['Name', 'Age', 'Email'],
    data: [
      ['Alice', 25, 'alice@example.com'],
      ['Bob', 30, 'bob@example.com'],
    ],
    filename: 'plugin_test',
  });

  BtcMessage.success('Excel plugin export triggered');
};

/**
 * Test Notification Plugin
 */
const testNotificationPlugin = () => {
  const notificationApi = pluginManager.getApi<any>('notification');

  if (!notificationApi) {
    BtcMessage.error('Notification plugin not installed');
    return;
  }

  pluginTestResult.value = 'Notification plugin test:\n';

  notificationApi.success('This is a success message');
  notificationApi.error('This is an error message');
  notificationApi.info('This is an info message');

  pluginTestResult.value += 'Check console for notification outputs';
};

/**
 * Test Logger Plugin
 */
const testLoggerPlugin = () => {
  const loggerApi = pluginManager.getApi<any>('logger');

  if (!loggerApi) {
    BtcMessage.error('Logger plugin not installed');
    return;
  }

  pluginTestResult.value = 'Logger plugin test:\n';

  loggerApi.log('info', 'Test info log');
  loggerApi.log('warn', 'Test warning log');
  loggerApi.log('error', 'Test error log');

  pluginTestResult.value += 'Check console for logger outputs\n';
  pluginTestResult.value += 'Logger depends on Notification plugin (dependency test passed)';
};
</script>

<style lang="scss" scoped>
// 页面内容样式（不包含布局相关的 padding、margin、background）
.plugins-test {
  .test-tabs {
    :deep(.el-tabs__content) {
      overflow: auto;
      padding: 0;
    }

    :deep(.el-tab-pane) {
      padding: 20px;
    }
  }

  h3 {
    color: #333;
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.test-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color);

  pre {
    background-color: var(--el-bg-color);
    padding: 1rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    overflow-x: auto;
  }

  .loading {
    color: #999;
    font-style: italic;
  }
}

.icon-list {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  .icon {
    width: 48px;
    height: 48px;
    color: #409eff;
  }

  span {
    font-size: 12px;
    color: #666;
  }
}

details {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 4px;

  summary {
    cursor: pointer;
    padding: 0.5rem;
    user-select: none;

    &:hover {
      background-color: var(--el-fill-color-lighter);
    }
  }

  ul {
    margin-top: 0.5rem;
    padding-left: 2rem;

    li {
      padding: 0.25rem 0;
      font-family: monospace;

      code {
        background-color: var(--el-fill-color);
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
        color: #e83e8c;
      }
    }
  }
}
</style>

