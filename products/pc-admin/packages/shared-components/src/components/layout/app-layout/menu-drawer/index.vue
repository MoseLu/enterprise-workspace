<template>
  <teleport to="body">
    <transition name="drawer-slide">
      <div v-show="visible" class="menu-drawer">
        <div class="menu-drawer__header">
          <div class="menu-drawer__header-top">
            <h3>{{ t('app_center.title') }}</h3>
            <span class="menu-drawer__subtitle">{{ t('app_center.subtitle') }}</span>
          </div>
          <div class="menu-drawer__search">
            <el-input
              v-model="searchKeyword"
              :placeholder="t('app_center.search_placeholder')"
              clearable
              size="small"
            >
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <div class="menu-drawer__content">
          <div v-if="loading" class="loading-container">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>{{ t('common.loading') }}...</span>
          </div>
          <div v-else-if="filteredApplications.length > 0" class="app-list">
            <!-- 主应用卡片（占据整行，2列宽度，排在最上面） -->
            <template v-for="app in filteredApplications.filter(a => a.isMainApp)" :key="app.name">
              <div class="app-card app-card--main" :class="{ 'is-active': app.name === currentApp }" @click="handleSwitchApp(app)">
                <div class="app-card__icon" :style="{ backgroundColor: app.color }">
                  <btc-svg :name="app.icon" :size="28" />
                </div>
                <div class="app-card__info">
                  <div class="app-card__title">
                    {{ getDomainDisplayName(app) }}
                  </div>
                </div>
                <div class="app-card__action" v-if="app.name === currentApp">
                  <el-icon color="#67c23a">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </template>

            <!-- 子应用列表（2列布局） -->
            <div class="app-list__row">
              <div class="app-list__column">
                <template
                  v-for="app in filteredApplications.filter(a => !a.isMainApp).filter((_, i) => i % 2 === 0)"
                  :key="app.name"
                >
                  <el-tooltip
                    :content="app.description || t(`micro_app.${app.name}.description`)"
                    placement="right"
                    :show-after="300"
                    trigger="hover"
                  >
                    <div
                      class="app-card"
                      :class="{ 'is-active': app.name === currentApp }"
                      @click="handleSwitchApp(app)"
                    >
                      <div class="app-card__icon" :style="{ backgroundColor: app.color }">
                        <btc-svg :name="app.icon" :size="22" />
                      </div>
                      <div class="app-card__info">
                        <div class="app-card__title">
                          {{ getDomainDisplayName(app) }}
                        </div>
                      </div>
                      <div class="app-card__action" v-if="app.name === currentApp">
                        <el-icon color="#67c23a">
                          <Check />
                        </el-icon>
                      </div>
                    </div>
                  </el-tooltip>
                </template>
              </div>
              <div class="app-list__column">
                <template
                  v-for="app in filteredApplications.filter(a => !a.isMainApp).filter((_, i) => i % 2 === 1)"
                  :key="app.name"
                >
                  <el-tooltip
                    :content="app.description || t(`micro_app.${app.name}.description`)"
                    placement="right"
                    :show-after="300"
                    trigger="hover"
                  >
                    <div
                      class="app-card"
                      :class="{ 'is-active': app.name === currentApp }"
                      @click="handleSwitchApp(app)"
                    >
                      <div class="app-card__icon" :style="{ backgroundColor: app.color }">
                        <btc-svg :name="app.icon" :size="22" />
                      </div>
                      <div class="app-card__info">
                        <div class="app-card__title">
                          {{ getDomainDisplayName(app) }}
                        </div>
                      </div>
                      <div class="app-card__action" v-if="app.name === currentApp">
                        <el-icon color="#67c23a">
                          <Check />
                        </el-icon>
                      </div>
                    </div>
                  </el-tooltip>
                </template>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon class="empty-state__icon">
              <Search />
            </el-icon>
            <p class="empty-state__text">{{ t('app_center.no_results') }}</p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutMenuDrawer'
});

import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { Check, Loading, Search } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { sessionStorage } from '@btc/shared-core/utils/storage/session';
import { getEnvironment, getCurrentSubApp, type Environment } from '@btc/shared-core/configs/unified-env-config';

// 通过全局函数获取应用特定的依赖
// 这些函数需要由使用共享布局的应用提供
// Window 接口扩展已在 layout-bridge.ts 中定义，此处不再重复声明以避免类型冲突

// 获取 EPS 服务（从全局或应用提供）
function getEpsService() {
  return (window as any).__APP_EPS_SERVICE__ || (window as any).service || null;
}

// 获取域名列表（从全局或应用提供）
async function getDomainList(service: any) {
  const getDomainListFn = (window as any).__APP_GET_DOMAIN_LIST__;
  if (getDomainListFn) {
    return await getDomainListFn(service);
  }
  // 如果没有提供，返回空数组（静默处理，不输出警告）
  return [];
}


// 完成加载（从全局或应用提供）
function finishLoading() {
  const finishLoadingFn = (window as any).__APP_FINISH_LOADING__;
  if (finishLoadingFn) {
    finishLoadingFn();
  } else {
    // 如果没有全局函数，直接清除 loading 状态
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      viewport.removeAttribute('data-qiankun-loading');
    }
  }
}

// 获取应用配置（从全局或应用提供）
function getAppConfig(appName: string) {
  const getAppConfigFn = (window as any).__APP_GET_APP_CONFIG__;
  if (getAppConfigFn) {
    const config = getAppConfigFn(appName);
    if (!config) {
      // 静默处理，不输出警告
      return null;
    }
    return config;
  }
  // 静默处理，不输出警告
  return null;
}



/**
 * 根据应用短名称（如 'admin'）获取配置中的应用名称（如 'admin-app'）
 * 动态从配置中查找，避免硬编码
 */
function getConfigAppName(appShortName: string): string {
  // 常见的应用名称格式：{name}-app
  const commonFormats = [
    `${appShortName}-app`, // 最常见：admin -> admin-app
    appShortName, // 直接使用：某些特殊应用可能不遵循 -app 格式
  ];

  // 尝试每种格式，找到第一个存在的配置
  for (const format of commonFormats) {
    const config = getAppConfig(format);
    if (config) {
      return format;
    }
  }

  // 如果都找不到，使用默认格式
  return `${appShortName}-app`;
}

/**
 * 动态构建子域名到应用名称的映射（从配置中获取）
 * 例如：'admin.bellis.com.cn' -> 'admin'
 */
function buildSubdomainToAppMap(): Record<string, string> {
  const map: Record<string, string> = {};

  // 子应用名称列表（排除特殊应用：mobile, home, docs）
  const commonAppNames = [
    'admin', 'logistics', 'engineering', 'quality', 'production',
    'finance', 'system', 'dashboard', 'personnel', 'operations'
  ];

  for (const appShortName of commonAppNames) {
    const configAppName = getConfigAppName(appShortName);
    const config = getAppConfig(configAppName);
    if (config && config.prodHost) {
      // 从 prodHost 提取子域名（如 'admin.bellis.com.cn'）
      const hostname = config.prodHost;
      map[hostname] = appShortName;

      // 也支持测试环境的子域名（如 'admin.test.bellis.com.cn'）
      if (config.testHost) {
        map[config.testHost] = appShortName;
      }
    }
  }

  return map;
}

/**
 * 根据应用短名称获取显示名称（用于 loading 提示）
 * 动态从国际化或配置获取，避免硬编码
 */
function getAppDisplayName(appShortName: string): string {
  // 尝试从国际化获取
  try {
    const i18nKey = `micro_app.${appShortName}.title`;
    const i18nValue = t(i18nKey);
    // 如果国际化值存在且不是 key 本身，则使用国际化值
    if (i18nValue && i18nValue !== i18nKey) {
      return i18nValue;
    }
  } catch (e) {
    // 静默失败
  }

  // 回退：使用应用名称本身
  return appShortName || '应用';
}

interface MicroApp {
  name: string;
  icon: string;
  color: string;
  entry: string;
  activeRule: string;
  description?: string;
  isMainApp?: boolean; // 标记是否为主应用
}

interface Props {
  visible: boolean;
  topbarHeight?: number;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  topbarHeight: 46,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const { t } = useI18n();

/**
 * 获取应用入口地址
 */
const getAppEntry = (appName: string): string => {
  const env = getEnvironment();
  const appConfig = getAppConfig(`${appName}-app`);

  if (!appConfig) {
    // 静默处理，使用默认路径
    return `/${appName}/`;
  }

  // 使用 if/else 避免 TypeScript 类型检查问题
  const envStr = env as string;
  if (envStr === 'test') {
    // 测试环境：使用测试环境的子域名
    if (appConfig.testHost) {
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      return `${protocol}//${appConfig.testHost}/`;
    }
    return `/${appName}/`;
  }

  if (envStr === 'production') {
    // 生产环境：根据子域名判断使用子域名还是相对路径
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // 动态构建子域名映射（从配置中获取）
      const subdomainMap = buildSubdomainToAppMap();

      // 检查是否匹配当前 hostname
      if (subdomainMap[hostname] === appName) {
        const protocol = window.location.protocol;
        return `${protocol}//${hostname}/`;
      }
    }
    return `/${appName}/`;
  }

  if (envStr === 'preview') {
    return `http://${appConfig.preHost}:${appConfig.prePort}/index.html`;
  }

  // 开发环境或默认情况
  return `//${appConfig.devHost}:${appConfig.devPort}`;
};

// 根据当前路由判断当前应用
const currentApp = ref<string | null>(null);

// 加载状态
const loading = ref(false);

const detectCurrentApp = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // 使用统一的环境检测函数
  const detectedApp = getCurrentSubApp();
  if (detectedApp) {
    currentApp.value = detectedApp;
  } else {
    // 如果没有检测到子应用，说明是主应用
    currentApp.value = 'main';
  }
};

onMounted(() => {
  detectCurrentApp();
  loadApplications(); // 加载应用列表

  // 监听路由变化
  window.addEventListener('popstate', detectCurrentApp);
});

onUnmounted(() => {
  window.removeEventListener('popstate', detectCurrentApp);
});

/**
 * 从完整的 domainCode 中提取应用短名称
 * 例如：'DOM_BTC_ADMIN' -> 'admin', 'DOM_BTC_FINANCE' -> 'finance'
 */
function extractAppNameFromDomainCode(domainCode: string): string {
  if (!domainCode || typeof domainCode !== 'string') {
    return '';
  }

  // 处理新格式：DOM_BTC_ADMIN, DOM_BTC_FINANCE 等
  if (domainCode.startsWith('DOM_BTC_')) {
    const suffix = domainCode.replace('DOM_BTC_', '').toLowerCase();
    return suffix;
  }

  // 兼容旧格式：直接返回小写
  return domainCode.toLowerCase();
}

// 域到应用的映射配置（支持完整的 domainCode 格式，如 'DOM_BTC_ADMIN'）
const domainAppMapping: Record<string, Omit<MicroApp, 'name' | 'description'>> = {
  // 新格式：完整的 domainCode
  'DOM_BTC_LOGISTICS': {
    icon: 'map',
    color: '#67c23a', // 绿色
    entry: getAppEntry('logistics'),
    activeRule: '/logistics',
  },
  'DOM_BTC_ENGINEERING': {
    icon: 'design',
    color: '#ff7a45', // 橙红色，与主应用橙色区分
    entry: getAppEntry('engineering'),
    activeRule: '/engineering',
  },
  'DOM_BTC_QUALITY': {
    icon: 'approve',
    color: '#f56c6c', // 红色
    entry: getAppEntry('quality'),
    activeRule: '/quality',
  },
  'DOM_BTC_PRODUCTION': {
    icon: 'work',
    color: '#595959', // 深灰色
    entry: getAppEntry('production'),
    activeRule: '/production',
  },
  'DOM_BTC_FINANCE': {
    icon: 'amount-alt',
    color: '#1890ff', // 蓝色
    entry: getAppEntry('finance'),
    activeRule: '/finance',
  },
  'DOM_BTC_SYSTEM': {
    icon: 'user',
    color: '#722ed1', // 紫色
    entry: getAppEntry('system'),
    activeRule: '/system',
  },
  'DOM_BTC_ADMIN': {
    icon: 'settings',
    color: '#13c2c2', // 青色
    entry: getAppEntry('admin'),
    activeRule: '/admin',
  },
  'DOM_BTC_OPERATIONS': {
    icon: 'monitor',
    color: '#2f54eb', // 深蓝色，与财务蓝色区分
    entry: getAppEntry('operations'),
    activeRule: '/operations',
  },
  'DOM_BTC_DASHBOARD': {
    icon: 'trend',
    color: '#ff6b9d', // 粉色
    entry: getAppEntry('dashboard'),
    activeRule: '/dashboard',
  },
  'DOM_BTC_PERSONNEL': {
    icon: 'team',
    color: '#ffc107', // 黄色
    entry: getAppEntry('personnel'),
    activeRule: '/personnel',
  },
  // 兼容旧格式（向后兼容）
  'LOGISTICS': {
    icon: 'map',
    color: '#67c23a',
    entry: getAppEntry('logistics'),
    activeRule: '/logistics',
  },
  'ENGINEERING': {
    icon: 'design',
    color: '#ff7a45',
    entry: getAppEntry('engineering'),
    activeRule: '/engineering',
  },
  'QUALITY': {
    icon: 'approve',
    color: '#f56c6c',
    entry: getAppEntry('quality'),
    activeRule: '/quality',
  },
  'PRODUCTION': {
    icon: 'work',
    color: '#595959',
    entry: getAppEntry('production'),
    activeRule: '/production',
  },
  'FINANCE': {
    icon: 'amount-alt',
    color: '#1890ff',
    entry: getAppEntry('finance'),
    activeRule: '/finance',
  },
  'SYSTEM': {
    icon: 'user',
    color: '#722ed1',
    entry: getAppEntry('system'),
    activeRule: '/system',
  },
  'ADMIN': {
    icon: 'settings',
    color: '#13c2c2',
    entry: getAppEntry('admin'),
    activeRule: '/admin',
  },
  'OPERATIONS': {
    icon: 'monitor',
    color: '#2f54eb',
    entry: getAppEntry('operations'),
    activeRule: '/operations',
  },
  'DASHBOARD': {
    icon: 'trend',
    color: '#ff6b9d',
    entry: getAppEntry('dashboard'),
    activeRule: '/dashboard',
  },
  'PERSONNEL': {
    icon: 'team',
    color: '#ffc107',
    entry: getAppEntry('personnel'),
    activeRule: '/personnel',
  },
};

const applications = ref<MicroApp[]>([]);

// 搜索关键词
const searchKeyword = ref('');

// 存储域数据映射
const domainDataMap = ref<Map<string, any>>(new Map());

// 过滤后的应用列表（主应用排在最前面，然后是系统应用，管理应用，其他应用）
const filteredApplications = computed(() => {
  let apps = applications.value;

  // 如果有搜索关键词，先过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim();
    apps = apps.filter((app) => {
      const displayName = getDomainDisplayName(app).toLowerCase();
      const description = (app.description || '').toLowerCase();
      return displayName.includes(keyword) || description.includes(keyword);
    });
  }

  // 将主应用排在最前面
  const mainApp = apps.find(app => app.isMainApp);
  const otherApps = apps.filter(app => !app.isMainApp);

  // 对子应用进行排序：系统应用第一个，管理应用第二个，其他保持原顺序
  const sortedOtherApps = [...otherApps].sort((a, b) => {
    // 系统应用排第一个
    if (a.name === 'system') return -1;
    if (b.name === 'system') return 1;
    // 管理应用排第二个
    if (a.name === 'admin') return -1;
    if (b.name === 'admin') return 1;
    // 其他保持原顺序
    return 0;
  });

  return mainApp ? [mainApp, ...sortedOtherApps] : sortedOtherApps;
});

// 域代码到国际化键的映射（用于显示名称）
// 支持新格式（DOM_BTC_XXX）和旧格式（XXX）的映射
const domainCodeToI18nKey: Record<string, string> = {
  // 新格式
  'DOM_BTC_SYSTEM': 'domain.type.system',
  'DOM_BTC_ADMIN': 'domain.type.admin',
  'DOM_BTC_QUALITY': 'domain.type.quality',
  'DOM_BTC_ENGINEERING': 'domain.type.engineering',
  'DOM_BTC_PRODUCTION': 'domain.type.production',
  'DOM_BTC_LOGISTICS': 'domain.type.logistics',
  'DOM_BTC_FINANCE': 'domain.type.finance',
  'DOM_BTC_OPERATIONS': 'domain.type.operations',
  'DOM_BTC_DASHBOARD': 'domain.type.dashboard',
  'DOM_BTC_PERSONNEL': 'domain.type.personnel',
  // 兼容旧格式
  'MAIN': 'domain.type.main',
  'SYSTEM': 'domain.type.system',
  'ADMIN': 'domain.type.admin',
  'QUALITY': 'domain.type.quality',
  'ENGINEERING': 'domain.type.engineering',
  'PRODUCTION': 'domain.type.production',
  'LOGISTICS': 'domain.type.logistics',
  'FINANCE': 'domain.type.finance',
  'OPERATIONS': 'domain.type.operations',
  'DASHBOARD': 'domain.type.dashboard',
  'PERSONNEL': 'domain.type.personnel',
};

// 获取域显示名称
const getDomainDisplayName = (app: MicroApp) => {
  // 如果是主应用，直接使用国际化键
  if (app.isMainApp) {
    const i18nKey = 'domain.type.main';
    const i18nValue = t(i18nKey);
    // 如果国际化值存在且不是 key 本身，则使用国际化值
    if (i18nValue && i18nValue !== i18nKey) {
      return i18nValue;
    }
    return '拜里斯控制台';
  }

  // 优先使用后端返回的 domainType
  // 统一处理所有应用，从域数据中查找匹配的域
  let domain: any = undefined;

  // 首先尝试使用 app.name 的大写形式作为 key
  domain = domainDataMap.value.get(app.name.toUpperCase());

  // 如果找不到，尝试从所有域中查找匹配的域
  if (!domain) {
    domain = Array.from(domainDataMap.value.values())
      .find((d: any) => {
        const code = d.domainCode || d.id || d.name;
        return code && typeof code === 'string' && code.toUpperCase() === app.name.toUpperCase();
      });
  }

  // 如果还是找不到，尝试使用域名称匹配（用于处理中文名称）
  if (!domain) {
    // 构建域名称映射表
    const domainNameMap: Record<string, string> = {
      'system': '系统域',
      'admin': '管理域',
      'logistics': '物流域',
      'finance': '财务域',
      'quality': '品质域',
      'production': '生产域',
      'engineering': '工程域',
      'operations': '运维域',
      'dashboard': '看板域',
      'personnel': '人事域',
    };
    const domainName = domainNameMap[app.name];
    if (domainName) {
      domain = Array.from(domainDataMap.value.values())
        .find((d: any) => d.name === domainName);
    }
  }

  // 如果还是找不到，尝试使用 domainCode 匹配（处理新格式）
  if (!domain) {
    domain = Array.from(domainDataMap.value.values())
      .find((d: any) => {
        const code = d.domainCode || d.id || d.name;
        if (!code || typeof code !== 'string') return false;
        const upperCode = code.toUpperCase();
        // 尝试匹配完整格式或简化格式
        const appNameUpper = app.name.toUpperCase();
        return upperCode === `DOM_BTC_${appNameUpper}` || upperCode === appNameUpper;
      });
  }

  // 优先使用后端返回的 domainType
  if (domain && domain.domainType) {
    return domain.domainType;
  }

  // 获取 domainCode，用于国际化映射
  const domainCode = domain?.domainCode || app.name.toUpperCase();

  // 处理新格式的 domainCode（DOM_BTC_XXX）
  const normalizedDomainCode = typeof domainCode === 'string' ? domainCode.toUpperCase() : '';

  // 如果后端没有返回 domainType，使用国际化映射获取显示名称
  // 优先尝试使用完整的 domainCode，如果找不到再尝试提取的简化版本
  let i18nKey = domainCodeToI18nKey[normalizedDomainCode];
  if (!i18nKey && normalizedDomainCode.startsWith('DOM_BTC_')) {
    // 如果找不到，尝试使用简化版本
    const simplifiedCode = normalizedDomainCode.replace('DOM_BTC_', '');
    i18nKey = domainCodeToI18nKey[simplifiedCode];
  }

  if (i18nKey) {
    const i18nValue = t(i18nKey);
    // 如果国际化值存在且不是 key 本身，则使用国际化值
    if (i18nValue && i18nValue !== i18nKey) {
      return i18nValue;
    }
  }

  // 兜底使用国际化配置
  return t(`micro_app.${app.name || 'unknown'}.title`);
};

// 等待 EPS 服务可用（轮询方式，最多等待5秒）
const waitForEpsService = async (maxWaitTime = 5000, interval = 100): Promise<any> => {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitTime) {
    const currentService = getEpsService();
    if (currentService) {
      return currentService;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return null;
};

// 从域列表服务获取域信息，构建应用列表
const loadApplications = async () => {
  loading.value = true;
  try {
    // 获取 EPS 服务，如果不可用则等待
    let service = getEpsService();
    if (!service) {
      service = await waitForEpsService(5000, 100);
      if (!service) {
        loading.value = false;
        finishLoading();
        return;
      }
    }

    // 使用共享缓存获取域列表
    const response = await getDomainList(service);
    const domainList = Array.isArray(response)
      ? response
      : (response?.data || response?.list || []);

    if (Array.isArray(domainList) && domainList.length > 0) {
      // 创建完整的域映射表（包括所有域）
      const domainMap = new Map();
      domainList.forEach((domain: any) => {
        // me 接口返回的域数据可能没有 domainCode，需要根据 name 或 id 推断
        // 统一处理所有域，不特殊处理任何应用
        let domainCode = domain.domainCode;

        // 如果没有 domainCode，尝试从 name 推断（向后兼容）
        if (!domainCode && domain.name) {
          // 构建名称到代码的映射（支持新格式）
          const nameToCodeMap: Record<string, string> = {
            '系统域': 'DOM_BTC_SYSTEM',
            '管理域': 'DOM_BTC_ADMIN',
            '物流域': 'DOM_BTC_LOGISTICS',
            '财务域': 'DOM_BTC_FINANCE',
            '品质域': 'DOM_BTC_QUALITY',
            '生产域': 'DOM_BTC_PRODUCTION',
            '工程域': 'DOM_BTC_ENGINEERING',
            '运维域': 'DOM_BTC_OPERATIONS',
            '看板域': 'DOM_BTC_DASHBOARD',
            '人事域': 'DOM_BTC_PERSONNEL',
          };
          domainCode = nameToCodeMap[domain.name];
        }

        // 如果还是没有，使用 id 或 name
        if (!domainCode) {
          domainCode = domain.id || domain.name;
        }
        if (domainCode) {
          // 使用 domainCode 作为主 key
          domainMap.set(domainCode, domain);
          // 同时使用 domainCode 的大写形式作为 key（用于查找）
          if (typeof domainCode === 'string') {
            domainMap.set(domainCode.toUpperCase(), domain);
          }
          // 使用 domain.name 作为 key（用于中文名称查找）
          if (domain.name) {
            domainMap.set(domain.name, domain);
          }
          // 使用从 domainCode 提取的应用名称作为 key（用于 app.name 查找）
          if (typeof domainCode === 'string') {
            const appName = extractAppNameFromDomainCode(domainCode);
            if (appName) {
              domainMap.set(appName, domain);
              domainMap.set(appName.toUpperCase(), domain);
            }
            // 同时保留小写形式（向后兼容）
            domainMap.set(domainCode.toLowerCase(), domain);
          }
        }
      });

      // 更新域数据映射（用于显示名称）
      domainDataMap.value = domainMap;

      // 构建应用列表 - 统一处理所有子应用，排除特殊应用（docs）
      const appList: MicroApp[] = [];

      // 首先添加主应用（排在最前面）
      const mainAppConfig = getAppConfig('main-app');
      if (mainAppConfig) {
        const mainApp: MicroApp = {
          name: 'main',
          icon: 'home',
          color: '#ff9800', // 橙色，与财务应用的蓝色区分开
          entry: getAppEntry('main'),
          activeRule: '/',
          description: t('domain.type.main') || '拜里斯控制台',
          isMainApp: true,
        };
        appList.push(mainApp);
      }

      // 然后添加子应用（仅从后端返回的域列表中构建，不手动添加）
      domainList
        .filter((domain: any) => {
          // 排除文档域（特殊应用）
          const domainCode = domain.domainCode || domain.id || domain.name;
          const upperDomainCode = typeof domainCode === 'string' ? domainCode.toUpperCase() : '';
          return upperDomainCode !== 'DOCS' &&
                 upperDomainCode !== 'DOM_BTC_DOCS' &&
                 domain.name !== '文档中心';
        })
        .forEach((domain: any) => {
          const domainCode = domain.domainCode || domain.id || domain.name;
          const upperDomainCode = typeof domainCode === 'string' ? domainCode.toUpperCase() : '';

          // 优先尝试使用完整的 domainCode，如果找不到则尝试简化版本
          let appConfig = domainAppMapping[upperDomainCode];

          // 如果是新格式但找不到，尝试简化版本（向后兼容）
          if (!appConfig && upperDomainCode.startsWith('DOM_BTC_')) {
            const simplifiedCode = upperDomainCode.replace('DOM_BTC_', '');
            appConfig = domainAppMapping[simplifiedCode];
          }

          if (appConfig) {
            // 从 domainCode 中提取应用名称（如 'DOM_BTC_ADMIN' -> 'admin'）
            const appName = extractAppNameFromDomainCode(upperDomainCode) || upperDomainCode.toLowerCase();

            const app = {
              name: appName, // 应用名称使用小写，用于路由匹配
              ...appConfig,
              description: domain.description || domain.domainType || `${domain.name} - 业务域应用`,
              isMainApp: false,
            };
            appList.push(app);
          }
        });

      applications.value = appList;
    } else {
      // 如果服务不可用，返回空列表（由应用自行处理）
      applications.value = [];
      domainDataMap.value.clear();
    }
  } catch (error) {
    // 服务不可用时，返回空列表（由应用自行处理）
    applications.value = [];
    domainDataMap.value.clear();
  } finally {
    loading.value = false;
    finishLoading();
  }
};

const handleSwitchApp = async (app: MicroApp) => {
  if (app.name === currentApp.value) {
    // 当前应用，不提示
    return;
  }

  // 使用统一的环境检测函数
  const environment: Environment = getEnvironment();
  const isTest = (environment as string) === 'test';
  const isProduction = environment === 'production';
  const isPreview = environment === 'preview';
  const isDevelopment = environment === 'development';

  // 动态获取应用显示名称（用于占位loading）
  // 使用 getDomainDisplayName 确保正确获取所有应用的显示名称，包括系统应用
  const appDisplayName = getDomainDisplayName(app);

  let targetUrl: string;

  // 测试环境：使用测试环境的子域名（如 admin.test.bellis.com.cn）
  if (isTest) {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    // 动态从配置获取应用配置名称（如 admin -> admin-app）
    const configAppName = getConfigAppName(app.name);
    const appConfig = getAppConfig(configAppName);

    // 优先使用配置文件中的 testHost，如果没有配置则回退到拼接方式
    if (appConfig && appConfig.testHost) {
      targetUrl = `${protocol}//${appConfig.testHost}/`;
    } else {
      // 回退：使用拼接方式构建测试域名
      const testHost = `${app.name}.test.bellis.com.cn`;
      targetUrl = `${protocol}//${testHost}/`;
    }
  }
  // 生产环境：使用生产环境的子域名（如 admin.bellis.com.cn）
  else if (isProduction) {
    // 动态从配置获取应用配置名称（如 admin -> admin-app）
    const configAppName = getConfigAppName(app.name);
    const appConfig = getAppConfig(configAppName);
    if (appConfig && appConfig.prodHost) {
      // 构建完整的 URL，直接跳转到子域名的根路径，不添加任何查询参数
      const protocol = window.location.protocol;
      targetUrl = `${protocol}//${appConfig.prodHost}/`;
    } else {
      const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      targetUrl = `${protocol}//${hostname}${targetPath}`;
    }
  }
  // 预览环境：使用预览环境的端口（如 http://localhost:4181/index.html）
  else if (isPreview) {
    // 动态从配置获取应用配置名称（如 admin -> admin-app）
    const configAppName = getConfigAppName(app.name);
    const appConfig = getAppConfig(configAppName);
    if (appConfig && appConfig.preHost && appConfig.prePort) {
      // 预览环境使用完整的 URL，包含 /index.html
      targetUrl = `http://${appConfig.preHost}:${appConfig.prePort}/index.html`;
    } else {
      // 回退：使用当前路径前缀
      const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      targetUrl = `${protocol}//${hostname}${targetPath}`;
    }
  }
  // 开发环境：使用路径前缀，不带参数
  else {
    const targetPath = app.activeRule.startsWith('/') ? app.activeRule : `/${app.activeRule}`;
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const port = typeof window !== 'undefined' ? window.location.port : '';
    // 开发环境：直接使用路径前缀，不带任何查询参数
    targetUrl = `${protocol}//${hostname}${port ? `:${port}` : ''}${targetPath}`;
  }

  // 关键：无论哪个环境，都要设置 sessionStorage
  try {
    sessionStorage.set('nav_app_name', appDisplayName);
  } catch (e) {
    // 静默失败
  }

  // 跳转方式：所有环境都使用新标签页打开
  window.open(targetUrl, '_blank');
};

// 辅助函数：检查是否应该处理抽屉事件
const shouldHandleDrawerEvent = (): boolean => {
  const isLayoutAppSelf = !!(window as any).__IS_LAYOUT_APP__;
  if (isLayoutAppSelf) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const env = getEnvironment();
    const hostname = window.location.hostname;
    const port = window.location.port || '';

    const isLayoutAppDomain =
      (env === 'production' && hostname === 'layout.bellis.com.cn') ||
      (env === 'test' && hostname === 'layout.test.bellis.com.cn') ||
      (env === 'preview' && port === '4192') ||
      (env === 'development' && port === '4188');

    if (isLayoutAppDomain) {
      return true;
    }
  }
  const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;
  if (isUsingLayoutApp) {
    return false;
  }
  return true;
};

const handleClose = () => {
  // 关键：检查是否应该处理抽屉关闭事件
  if (!shouldHandleDrawerEvent()) {
    return;
  }

  // 使用 nextTick 延迟状态更新，避免在子应用环境中访问已被销毁的组件实例
  nextTick(() => {
    try {
      emit('update:visible', false);
    } catch (error) {
      // 静默处理错误，避免在子应用环境中抛出异常
    }
  });
};

const handleClickOutside = (event: MouseEvent) => {
  // 关键：检查是否应该处理点击外部关闭事件
  if (!shouldHandleDrawerEvent()) {
    return;
  }

  if (!props.visible) return;

  // 检查事件是否可信（避免程序触发的事件）
  if (event.isTrusted === false) {
    return;
  }

  // 检查页面是否可见（避免关闭标签页时触发）
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
    return;
  }

  // 关键：忽略页面刚变为可见后的短时间内的点击事件（避免切换回标签页时误触发）
  const now = Date.now();
  if (lastVisibilityChangeTime > 0 && (now - lastVisibilityChangeTime) < VISIBILITY_CHANGE_IGNORE_DURATION) {
    return;
  }

  // 排除标签页区域的点击（避免关闭标签页时触发抽屉关闭）
  const target = event.target as HTMLElement;
  if (target) {
    // 检查是否点击在标签页区域内（包括关闭按钮）
    const isInProcessArea = target.closest('.app-process') !== null;
    if (isInProcessArea) {
      return;
    }
  }

  const drawer = document.querySelector('.menu-drawer');
  if (drawer && !drawer.contains(event.target as Node)) {
    handleClose();
  }
};

// 监听 iframe 内部点击（由 DocsIframe 转发）
const handleIframeClick = () => {
  // 关键：检查是否应该处理 iframe 点击关闭事件
  if (!shouldHandleDrawerEvent()) {
    return;
  }

  if (props.visible) {
    handleClose();
  }
};

// 监听抽屉打开，重新加载应用列表（从缓存读取，不调用接口）
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      // 关键：不从缓存清除，直接从持久化存储读取
      // 域列表数据在登录时已存储，刷新时应该从缓存读取，不调用接口
      // 重新加载应用列表（会从缓存读取）
      loadApplications();
    }
  }
);

// 记录页面变为可见的时间戳，用于忽略页面刚变为可见时的误触发事件
let lastVisibilityChangeTime = 0;
const VISIBILITY_CHANGE_IGNORE_DURATION = 200; // 页面变为可见后 200ms 内忽略点击事件

// 监听页面可见性变化
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    // 记录页面变为可见的时间
    lastVisibilityChangeTime = Date.now();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('iframe-clicked', handleIframeClick);
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('iframe-clicked', handleIframeClick);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});
</script>

<style lang="scss" scoped>
.menu-drawer {
  position: fixed;
  top: 48px;
  left: 0;
  width: 255px;
  height: calc(100vh - 48px);
  height: calc(100vh - 48px);
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-extra-light);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.08);
  z-index: 999;
  display: flex;
  flex-direction: column;

  // 关键：当通过 v-show 隐藏时，确保元素不可见且不占用空间
  // v-show="false" 会自动设置 display: none，这里只是确保样式正确
  &[style*="display: none"] {
    pointer-events: none;
  }

  &__header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    background-color: var(--el-bg-color);
  }

  &__header-top {
    margin-bottom: 12px;

    h3 {
      margin: 0 0 6px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  &__subtitle {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__search {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
    }

    :deep(.el-input__wrapper:hover) {
      box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
    }

    :deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
    background-color: var(--el-bg-color);
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--el-text-color-secondary);
  gap: 12px;

  .el-icon {
    font-size: 24px;
  }

  span {
    font-size: 14px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--el-text-color-secondary);
  gap: 12px;

  &__icon {
    font-size: 32px;
    color: var(--el-text-color-placeholder);
  }

  &__text {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.app-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 2px 0;
}

.app-list__row {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.app-list__column {
  flex: 1 1 calc(50% - 5px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  box-sizing: border-box;
}

/* 应用卡片 - 设置宽度为100%，由列容器控制布局 */
.app-card {
  width: 100%;
  box-sizing: border-box;
  margin: 0;

  // 主应用卡片：占据2列宽度
  &--main {
    width: 100%;
  }
}

/* 可选：响应式优化 - 小屏幕（如手机）下恢复单列 */
@media (max-width: 768px) {
  .app-list {
    flex-direction: column;
  }

  .app-list__column {
    width: 100%;
  }
}

.app-card {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 8px 6px;
  min-height: 64px;
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  // 主应用卡片：占据整行（2列宽度）
  &--main {
    width: 100%;
    margin-bottom: 0;
    background-color: var(--el-color-primary-light-8);
    justify-content: center;
    gap: 10px;

    .app-card__icon {
      width: 44px;
      height: 44px;

      :deep(svg) {
        width: 28px;
        height: 28px;
      }
    }

    .app-card__info {
      flex: 0 1 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .app-card__title {
      text-align: center;
      font-size: 15px;
      font-weight: 600;
    }

    // 激活态时保持绿色边框和背景
    &.is-active {
      border-color: var(--el-color-success);
      background-color: var(--el-color-success-light-9);
    }
  }

  &:hover {
    border-color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  &.is-active {
    border-color: var(--el-color-success);
    background-color: var(--el-color-success-light-9);

    .app-card__icon {
      box-shadow: 0 4px 12px rgba(103, 194, 58, 0.2);
      transform: scale(1.05);
    }
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden; // 防止文字溢出到勾选标记区域
  }

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    // 不需要 padding-right，勾选标记是绝对定位的，不会影响文字布局
  }

  &__action {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    font-size: 8px;
    color: var(--el-color-success);
    background-color: var(--el-color-success-light-9);
    border: 1px solid var(--el-color-success);
    border-radius: 50%;
    transition: all 0.3s;
    flex-shrink: 0;
    box-shadow: 0 0 0 0.5px rgba(103, 194, 58, 0.06);
  }
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(-100%);
}

.menu-drawer__content {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color);
    border-radius: 3px;

    &:hover {
      background-color: var(--el-border-color-dark);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}
</style>
