<template>
  <div class="api-switch">
    <div class="api-switch__header">
      <h3>环境切换</h3>
      <el-tag :type="currentApiType === 'dev' ? 'success' : 'warning'" size="small">
        {{ currentApiType === 'dev' ? '开发环境' : '生产环境' }}
      </el-tag>
    </div>
    
    <div class="api-switch__content">
      <div 
        v-for="(item, index) in apiList" 
        :key="index"
        class="api-item"
        :class="{ 'is-active': item.value === currentApi }"
      >
        <div class="api-item__info">
          <div class="api-item__name">
            <el-tag 
              :type="item.type === 'dev' ? 'success' : 'warning'" 
              size="small"
              disable-transitions
            >
              {{ item.label }}
            </el-tag>
          </div>
          <div class="api-item__url">
            <el-link 
              :href="item.url" 
              target="_blank"
              type="primary"
              :underline="false"
              class="api-item__url-link"
            >
              {{ item.url }}
            </el-link>
          </div>
        </div>
        
        <el-switch
          v-model="item.enabled"
          :disabled="item.value === currentApi"
          @change="handleSwitch(item)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storage } from '@btc/shared-core/utils/storage';
;
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

interface ApiItem {
  label: string;
  value: string;
  url: string;
  type: 'dev' | 'prod';
  enabled: boolean;
}

// 获取 http 实例（从全局对象或应用特定的位置）
function getHttpInstance(): any {
  // 尝试从全局对象获取
  const globalHttp = (window as any).__APP_HTTP__ || (window as any).http;
  if (globalHttp && typeof globalHttp.setBaseURL === 'function') {
    return globalHttp;
  }
  
  // 如果全局对象不存在，返回一个空对象（功能会受限）
  return {
    setBaseURL: () => {
      console.warn('[ApiSwitch] http 实例不可用，无法切换 API baseURL');
    }
  };
}

const reloading = ref(false);
const http = getHttpInstance();

// 统一使用 /api 代理，不再支持直接使用 HTTP/HTTPS URL
const apiList = ref<ApiItem[]>([
  {
    label: '统一代理',
    value: '/api',
    url: '/api（通过代理转发）',
    type: 'dev',
    enabled: true,
  },
]);

const currentApi = ref<string>('');

const currentApiType = computed(() => {
  const item = apiList.value.find(item => item.value === currentApi.value);
  return item?.type || 'dev';
});

// 从 storage 或 http 实例获取当前 API
function loadCurrentApi() {
  // 统一使用 /api，清理所有非 /api 的值
  const stored = storage.get<string>('dev_api_base_url');
  if (stored && stored !== '/api') {
    // 清理所有非 /api 的值（包括 HTTP URL、/api-prod 等）
    console.warn('[HTTP] 清理 storage 中的非 /api baseURL:', stored);
    storage.remove('dev_api_base_url');
  }
  
  // 统一使用 /api
  currentApi.value = '/api';
  
  // 更新开关状态
  apiList.value.forEach(item => {
    item.enabled = item.value === currentApi.value;
  });
}

function handleSwitch(item: ApiItem) {
  // 统一使用 /api，不允许切换到其他值
  if (item.value !== '/api') {
    ElMessage.warning({ message: '统一使用 /api 代理，不允许切换' } as any);
    return;
  }
  
  // 只有当前项可以启用
  apiList.value.forEach(api => {
    api.enabled = api.value === item.value;
  });
  
  // 更新当前 API
  currentApi.value = item.value;
  
  // 保存到 storage（统一使用 /api）
  storage.set('dev_api_base_url', item.value);
  
  // 更新 http 实例
  http.setBaseURL(item.value);
  
  ElMessage.success({ message: `已切换到 ${item.label}，正在刷新页面...` } as any);
  
  // 自动刷新页面
  reloading.value = true;
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

// 清理旧的 storage 数据（统一使用 /api）
function cleanupOldStorage() {
  const stored = storage.get<string>('dev_api_base_url');
  if (stored && stored !== '/api') {
    // 清理所有非 /api 的值
    console.warn('[HTTP] 清理 storage 中的非 /api baseURL:', stored);
    storage.remove('dev_api_base_url');
  }
}

onMounted(() => {
  // 先清理旧的 localStorage 数据
  cleanupOldStorage();
  // 然后加载当前 API
  loadCurrentApi();
});
</script>

<style lang="scss" scoped>
.api-switch {
  padding: 20px;
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--el-border-color-lighter);
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      letter-spacing: 0.5px;
    }
  }
  
  &__content {
    margin-bottom: 0;
  }
}

.api-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  margin-bottom: 12px;
  border: 1.5px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    background-color: var(--el-fill-color-light);
    border-color: var(--el-border-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  &.is-active {
    border-color: var(--el-color-primary);
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
    box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.2);
    transform: translateY(-2px);
  }
  
  &__info {
    flex: 1;
    margin-right: 16px;
  }
  
  &__name {
    margin-bottom: 4px;
  }
  
  &__url {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    word-break: break-all;
  }

  &__url-link {
    word-break: break-all;
  }
}
</style>

