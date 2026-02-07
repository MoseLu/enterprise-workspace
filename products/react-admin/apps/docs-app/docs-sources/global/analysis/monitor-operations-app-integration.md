# 监控功能集成到 operations-app 方案

## 🎯 设计目标

### 需求
1. **复用现有的 operations-app**：避免创建新应用
2. **开发环境**：监控开发服务器状态（monitor-service.mjs）
3. **生产环境**：监控所有应用运行时状态
4. **统一界面**：在operations-app中统一展示

### 核心原则
- **监控服务独立性**：monitor-service.mjs 完全独立，通过API提供服务
- **前端界面复用**：operations-app 作为前端界面，连接监控服务
- **环境适配**：根据环境（开发/生产）显示不同的监控内容

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                   监控系统架构                             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  监控后端服务 (monitor-service.mjs)                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  端口: 3001                                        │  │
│  │  运行位置: scripts/commands/skills/               │  │
│  │  独立性: ✓ 完全独立，不依赖任何应用                │  │
│  │                                                    │  │
│  │  功能:                                             │  │
│  │  ✓ 监控所有应用的开发服务器（开发环境）            │  │
│  │  ✓ 收集错误和日志                                  │  │
│  │  ✓ 提供API接口 (/api/*)                           │  │
│  │  ✓ 提供SSE实时推送 (/events, /sse/dev-status)    │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP/SSE/API (仅在开发环境连接)
                  │
┌─────────────────▼───────────────────────────────────────┐
│  operations-app (前端界面)                                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │  环境: 开发/生产                                    │  │
│  │  功能:                                             │  │
│  │  ✓ 开发服务器监控（开发环境）                      │  │
│  │  ✓ 应用运行时监控（生产环境）                      │  │
│  │  ✓ 错误监控（所有环境）                            │  │
│  │                                                    │  │
│  │  视图:                                             │  │
│  │  ✓ DevServiceMonitor.vue （开发环境）             │  │
│  │  ✓ ProductionServiceMonitor.vue （生产环境）      │  │
│  │  ✓ ErrorMonitor.vue （所有环境）                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  被监控的应用（所有monorepo中的应用）                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ main-app │  │admin-app │  │ops-app   │  ...        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘            │
│       │             │             │                    │
│       │ 上报错误/日志（所有环境）                       │
│       └─────────────┴─────────────┘                    │
│              │                                           │
│              ▼                                           │
│    ┌─────────────────────┐                              │
│    │ @btc/shared-core    │                              │
│    │ error-reporter.ts   │                              │
│    └─────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

### 环境区分

```typescript
// 开发环境（DEV）
- monitor-service.mjs 运行在 3001 端口
- operations-app 连接 monitor-service.mjs
- 监控内容：开发服务器状态、错误监控

// 生产环境（PROD）
- 无需 monitor-service.mjs（或作为独立服务运行）
- operations-app 直接监控应用运行时
- 监控内容：应用运行状态、错误监控、性能指标
```

## 📦 目录结构

### operations-app 新增文件

```
apps/operations-app/src/
├── modules/
│   └── operations/
│       ├── views/
│       │   ├── DevServiceMonitor.vue        # 开发服务器监控（新建）
│       │   ├── ProductionServiceMonitor.vue # 生产环境服务监控（新建）
│       │   └── ErrorMonitor.vue             # 错误监控（已有，增强）
│       ├── components/
│       │   ├── DevServerList.vue            # 开发服务器列表（新建）
│       │   ├── ProductionServiceList.vue    # 生产服务列表（新建）
│       │   └── ServiceStatusBadge.vue       # 服务状态徽章（新建）
│       ├── composables/
│       │   ├── useDevMonitor.ts             # 开发监控Hook（新建）
│       │   ├── useProductionMonitor.ts      # 生产监控Hook（新建）
│       │   └── useMonitorSSE.ts             # SSE连接Hook（新建）
│       ├── api/
│       │   └── monitor.ts                   # 监控API封装（新建）
│       └── config.ts                        # 路由配置（更新）
```

## 🔌 API接口设计

### 监控服务API (monitor-service.mjs)

```
# 开发环境专用
GET  /api/commands              # 获取所有运行中的命令
POST /api/commands              # 启动新命令
DELETE /api/commands/:id        # 停止命令
GET  /api/dev/status            # 获取所有应用的dev服务器状态
POST /api/dev/start-all         # 启动所有应用的dev服务器
POST /api/dev/stop-all          # 停止所有应用的dev服务器
POST /api/dev/start/:appId      # 启动单个应用的dev服务器
POST /api/dev/stop/:appId       # 停止单个应用的dev服务器
GET  /sse/dev-status            # Dev服务器状态SSE端点

# 通用接口
GET  /api/stats                 # 获取统计信息
POST /api/errors/report         # 接收错误上报
POST /api/startup/event         # 接收启动事件上报
GET  /events                    # 错误实时推送SSE端点
```

### 前端API封装 (operations-app)

```typescript
// src/modules/operations/api/monitor.ts
import { isDev } from '@btc/shared-core';

const MONITOR_SERVICE_URL = isDev ? 'http://localhost:3001' : '';

export const monitorApi = {
  // 开发环境：开发服务器管理
  getDevCommands: () => fetch(`${MONITOR_SERVICE_URL}/api/commands`),
  startDevCommand: (command: string, args: string[]) => 
    fetch(`${MONITOR_SERVICE_URL}/api/commands`, {
      method: 'POST',
      body: JSON.stringify({ command, args })
    }),
  stopDevCommand: (id: string) => 
    fetch(`${MONITOR_SERVICE_URL}/api/commands/${id}`, { method: 'DELETE' }),
  
  getDevStatus: () => fetch(`${MONITOR_SERVICE_URL}/api/dev/status`),
  startAllDevServers: (exclude?: string[]) => 
    fetch(`${MONITOR_SERVICE_URL}/api/dev/start-all`, {
      method: 'POST',
      body: JSON.stringify({ exclude })
    }),
  stopAllDevServers: () => 
    fetch(`${MONITOR_SERVICE_URL}/api/dev/stop-all`, { method: 'POST' }),
  startDevServer: (appId: string) => 
    fetch(`${MONITOR_SERVICE_URL}/api/dev/start/${appId}`, { method: 'POST' }),
  stopDevServer: (appId: string) => 
    fetch(`${MONITOR_SERVICE_URL}/api/dev/stop/${appId}`, { method: 'POST' }),
  
  // 通用：统计和错误
  getStats: () => fetch(`${MONITOR_SERVICE_URL}/api/stats`),
  
  // 生产环境：应用运行时监控（通过业务API）
  getProductionServices: async () => {
    // 调用业务API获取应用运行状态
    // 这里需要根据实际业务API设计
    return fetch('/api/services/status');
  },
};

// SSE连接
export const createMonitorSSE = (type: 'errors' | 'dev-status') => {
  const endpoint = type === 'errors' ? '/events' : '/sse/dev-status';
  return new EventSource(`${MONITOR_SERVICE_URL}${endpoint}`);
};
```

## 📋 路由配置

### 更新 config.ts

```typescript
// apps/operations-app/src/modules/operations/config.ts
import { isDev } from '@btc/shared-core';

export default {
  name: 'operations',
  label: 'common.module.operations.label',
  order: 100,

  views: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
      meta: {
        isHome: true,
        titleKey: 'menu.operations.overview',
        tabLabelKey: 'menu.operations.overview',
        isPage: true,
      },
    },
    // 开发服务器监控（仅开发环境）
    ...(isDev ? [{
      path: '/ops/dev-services',
      name: 'DevServiceMonitor',
      component: () => import('./views/DevServiceMonitor.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.devServices',
        tabLabelKey: 'menu.operations.devServices',
        isPage: true,
      },
    }] : []),
    // 生产服务监控（仅生产环境）
    ...(!isDev ? [{
      path: '/ops/production-services',
      name: 'ProductionServiceMonitor',
      component: () => import('./views/ProductionServiceMonitor.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.productionServices',
        tabLabelKey: 'menu.operations.productionServices',
        isPage: true,
      },
    }] : []),
    // 错误监控（所有环境）
    {
      path: '/ops/error',
      name: 'ErrorMonitor',
      component: () => import('./views/ErrorMonitor.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.error',
        tabLabelKey: 'menu.operations.error',
        isPage: true,
      },
    },
    {
      path: '/ops/deployment-test',
      name: 'DeploymentTest',
      component: () => import('./views/DeploymentTest.vue'),
      meta: {
        isHome: false,
        titleKey: 'menu.operations.deploymentTest',
        tabLabelKey: 'menu.operations.deploymentTest',
        isPage: true,
      },
    },
  ],

  locale: {
    'zh-CN': {
      'menu.operations.name': '运维应用',
      'menu.operations.overview': '运维概览',
      'menu.operations.devServices': '开发服务器监控',
      'menu.operations.productionServices': '生产服务监控',
      'menu.operations.error': '错误监控',
      'menu.operations.deploymentTest': '部署测试',
    },
    'en-US': {
      'menu.operations.name': 'Operations App',
      'menu.operations.overview': 'Operations Overview',
      'menu.operations.devServices': 'Dev Services Monitor',
      'menu.operations.productionServices': 'Production Services Monitor',
      'menu.operations.error': 'Error Monitoring',
      'menu.operations.deploymentTest': 'Deployment Test',
    },
  },
} satisfies ModuleConfig;
```

## 🎨 组件设计

### DevServiceMonitor.vue（开发环境）

```vue
<template>
  <div class="page">
    <div class="dev-service-monitor">
      <BtcCrud :service="emptyService" :auto-load="false" padding="0">
        <!-- Toolbar -->
        <BtcCrudRow>
          <BtcCrudFlex1 />
          <el-button @click="refreshCommands" type="primary">
            {{ t('monitor.refresh') }}
          </el-button>
          <el-button @click="startAllDevServers" type="success">
            {{ t('monitor.startAll') }}
          </el-button>
          <el-button @click="stopAllDevServers" type="danger">
            {{ t('monitor.stopAll') }}
          </el-button>
        </BtcCrudRow>

        <!-- Dev Server List -->
        <BtcCrudRow>
          <DevServerList
            :servers="devServers"
            @start="handleStartServer"
            @stop="handleStopServer"
          />
        </BtcCrudRow>
      </BtcCrud>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { BtcCrud, BtcCrudRow, BtcCrudFlex1 } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import { useDevMonitor } from '../composables/useDevMonitor';
import DevServerList from '../components/DevServerList.vue';

const { t } = useI18n();
const {
  devServers,
  loading,
  refreshCommands,
  startAllDevServers,
  stopAllDevServers,
  startDevServer,
  stopDevServer,
} = useDevMonitor();

const handleStartServer = (appId: string) => {
  startDevServer(appId);
};

const handleStopServer = (appId: string) => {
  stopDevServer(appId);
};

const emptyService = {
  page: async () => ({ list: [], total: 0 }),
};
</script>
```

### ProductionServiceMonitor.vue（生产环境）

```vue
<template>
  <div class="page">
    <div class="production-service-monitor">
      <BtcCrud :service="emptyService" :auto-load="false" padding="0">
        <!-- Toolbar -->
        <BtcCrudRow>
          <BtcCrudFlex1 />
          <el-button @click="refreshServices" type="primary">
            {{ t('monitor.refresh') }}
          </el-button>
        </BtcCrudRow>

        <!-- Production Service List -->
        <BtcCrudRow>
          <ProductionServiceList
            :services="productionServices"
            @view-details="handleViewDetails"
          />
        </BtcCrudRow>
      </BtcCrud>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BtcCrud, BtcCrudRow, BtcCrudFlex1 } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
import { useProductionMonitor } from '../composables/useProductionMonitor';
import ProductionServiceList from '../components/ProductionServiceList.vue';

const { t } = useI18n();
const {
  productionServices,
  loading,
  refreshServices,
} = useProductionMonitor();

const handleViewDetails = (serviceId: string) => {
  // 查看服务详情
};

const emptyService = {
  page: async () => ({ list: [], total: 0 }),
};
</script>
```

## 🔄 Composables设计

### useDevMonitor.ts

```typescript
// src/modules/operations/composables/useDevMonitor.ts
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { monitorApi, createMonitorSSE } from '../api/monitor';
import { ElMessage } from 'element-plus';

export function useDevMonitor() {
  const devServers = ref<any[]>([]);
  const runningCommands = ref<any[]>([]);
  const loading = ref(false);
  let sseConnection: EventSource | null = null;

  // 刷新命令列表
  const refreshCommands = async () => {
    try {
      loading.value = true;
      const response = await monitorApi.getDevCommands();
      const result = await response.json();
      runningCommands.value = result.commands || [];
      updateDevServers();
    } catch (error) {
      console.error('刷新命令列表失败:', error);
      ElMessage.error('刷新失败');
    } finally {
      loading.value = false;
    }
  };

  // 刷新dev服务器状态
  const refreshDevStatus = async () => {
    try {
      const response = await monitorApi.getDevStatus();
      const result = await response.json();
      devServers.value = result.servers || [];
    } catch (error) {
      console.error('刷新dev服务器状态失败:', error);
    }
  };

  // 更新开发服务器列表
  const updateDevServers = () => {
    // 从runningCommands中提取开发服务器
    devServers.value = runningCommands.value.filter(cmd => 
      (cmd.command === 'dev:all' || cmd.command === 'dev') && 
      cmd.status === 'running'
    );
  };

  // 启动所有dev服务器
  const startAllDevServers = async () => {
    try {
      loading.value = true;
      const response = await monitorApi.startAllDevServers();
      const result = await response.json();
      if (response.ok) {
        ElMessage.success(result.message || '启动成功');
        await refreshDevStatus();
      } else {
        ElMessage.error(result.error || '启动失败');
      }
    } catch (error) {
      console.error('启动所有dev服务器失败:', error);
      ElMessage.error('启动失败');
    } finally {
      loading.value = false;
    }
  };

  // 停止所有dev服务器
  const stopAllDevServers = async () => {
    try {
      loading.value = true;
      const response = await monitorApi.stopAllDevServers();
      const result = await response.json();
      if (response.ok) {
        ElMessage.success(result.message || '停止成功');
        await refreshDevStatus();
      } else {
        ElMessage.error(result.error || '停止失败');
      }
    } catch (error) {
      console.error('停止所有dev服务器失败:', error);
      ElMessage.error('停止失败');
    } finally {
      loading.value = false;
    }
  };

  // 启动单个dev服务器
  const startDevServer = async (appId: string) => {
    try {
      loading.value = true;
      const response = await monitorApi.startDevServer(appId);
      const result = await response.json();
      if (response.ok) {
        ElMessage.success(result.message || '启动成功');
        await refreshDevStatus();
      } else {
        ElMessage.error(result.error || '启动失败');
      }
    } catch (error) {
      console.error('启动dev服务器失败:', error);
      ElMessage.error('启动失败');
    } finally {
      loading.value = false;
    }
  };

  // 停止单个dev服务器
  const stopDevServer = async (appId: string) => {
    try {
      loading.value = true;
      const response = await monitorApi.stopDevServer(appId);
      const result = await response.json();
      if (response.ok) {
        ElMessage.success(result.message || '停止成功');
        await refreshDevStatus();
      } else {
        ElMessage.error(result.error || '停止失败');
      }
    } catch (error) {
      console.error('停止dev服务器失败:', error);
      ElMessage.error('停止失败');
    } finally {
      loading.value = false;
    }
  };

  // 连接SSE
  const connectSSE = () => {
    try {
      sseConnection = createMonitorSSE('dev-status');
      sseConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init') {
            devServers.value = data.data || [];
          } else if (data.type === 'started' || data.type === 'stopped') {
            refreshDevStatus();
          }
        } catch (error) {
          console.error('解析SSE消息失败:', error);
        }
      };
      sseConnection.onerror = (error) => {
        console.error('SSE连接错误:', error);
        // 重连逻辑
        setTimeout(() => {
          if (sseConnection?.readyState === EventSource.CLOSED) {
            connectSSE();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('创建SSE连接失败:', error);
    }
  };

  // 断开SSE
  const disconnectSSE = () => {
    if (sseConnection) {
      sseConnection.close();
      sseConnection = null;
    }
  };

  onMounted(() => {
    refreshCommands();
    refreshDevStatus();
    connectSSE();
  });

  onUnmounted(() => {
    disconnectSSE();
  });

  return {
    devServers,
    runningCommands,
    loading,
    refreshCommands,
    refreshDevStatus,
    startAllDevServers,
    stopAllDevServers,
    startDevServer,
    stopDevServer,
  };
}
```

### useProductionMonitor.ts

```typescript
// src/modules/operations/composables/useProductionMonitor.ts
import { ref, onMounted } from 'vue';
import { monitorApi } from '../api/monitor';
import { ElMessage } from 'element-plus';

export function useProductionMonitor() {
  const productionServices = ref<any[]>([]);
  const loading = ref(false);

  // 刷新生产服务状态
  const refreshServices = async () => {
    try {
      loading.value = true;
      const response = await monitorApi.getProductionServices();
      const result = await response.json();
      productionServices.value = result.services || [];
    } catch (error) {
      console.error('刷新生产服务状态失败:', error);
      ElMessage.error('刷新失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    refreshServices();
    // 定期刷新
    const interval = setInterval(refreshServices, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  });

  return {
    productionServices,
    loading,
    refreshServices,
  };
}
```

## ✅ 优势总结

1. **复用现有应用**：
   - ✅ 无需创建新应用
   - ✅ 复用operations-app的基础设施
   - ✅ 统一的用户体验

2. **保持独立性**：
   - ✅ 监控服务（monitor-service.mjs）完全独立
   - ✅ 仅通过API连接，无循环依赖
   - ✅ 可以监控所有应用（包括主应用）

3. **环境适配**：
   - ✅ 开发环境：显示开发服务器监控
   - ✅ 生产环境：显示生产服务监控
   - ✅ 所有环境：统一显示错误监控

4. **开发体验**：
   - ✅ 完整的Vue + TypeScript支持
   - ✅ 复用项目共享包
   - ✅ 代码组织和可维护性

## 🚀 实施步骤

1. **创建API封装**（0.5天）
   - 创建 `src/modules/operations/api/monitor.ts`
   - 封装监控服务API调用

2. **创建Composables**（1天）
   - 创建 `useDevMonitor.ts`
   - 创建 `useProductionMonitor.ts`
   - 创建 `useMonitorSSE.ts`

3. **创建组件**（1-2天）
   - 创建 `DevServiceMonitor.vue`
   - 创建 `ProductionServiceMonitor.vue`
   - 创建子组件（DevServerList、ProductionServiceList等）

4. **更新路由配置**（0.5天）
   - 更新 `config.ts`，根据环境添加路由

5. **增强ErrorMonitor**（可选，0.5天）
   - 增强错误监控功能
   - 集成SSE实时推送

6. **测试和优化**（0.5-1天）
   - 功能测试
   - 环境适配测试
   - 性能优化

**总计**：4-6天
