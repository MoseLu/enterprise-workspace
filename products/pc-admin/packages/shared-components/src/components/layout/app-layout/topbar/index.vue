<template>
  <div class="topbar" :class="{ 'is-dark-menu': isDarkMenuStyle }">
    <!-- 左侧：汉堡菜单 + Logo 区域（与侧边栏宽度一致） -->
      <div
        class="topbar__brand"
        :class="{
          'is-collapse': isCollapse && props.menuType !== 'top' && props.menuType !== 'dual-menu',
          'menu-type-top': props.menuType === 'top',
          'menu-type-dual-menu': props.menuType === 'dual-menu',
        }"
      >
      <!-- 汉堡菜单 -->
      <div
        class="topbar__hamburger"
        :class="{ 'is-active': drawerVisible }"
        @click.stop="safeEmit('toggle-drawer')"
        @mouseenter="safeEmit('open-drawer')"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </div>

      <!-- Logo + 标题（顶部菜单和双栏菜单模式下隐藏） -->
      <div
        v-if="props.menuType !== 'top' && props.menuType !== 'dual-menu'"
        :key="logoKey"
        class="topbar__logo-content"
        :class="{
          'is-dark-menu': isDarkMenuStyle,
          'is-dark-theme': isDark,
        }"
      >
        <img :src="logoUrl" alt="BTC Logo" class="topbar__logo-img" @error="handleLogoError" />
        <h2
          class="topbar__logo-text"
          :style="{ color: menuThemeConfig?.systemNameColor || 'var(--el-text-color-primary)' }"
        >{{ logoTitle }}</h2>
      </div>
    </div>

    <!-- 中间：工具区域（折叠按钮 + 搜索框 + 顶部菜单） -->
    <div class="topbar__left">
      <!-- 折叠按钮（仅左侧菜单和混合菜单显示） -->
      <BtcIconButton
        v-if="props.menuType === 'left' || props.menuType === 'top-left'"
        :config="{
          icon: () => isCollapse ? 'expand' : 'fold',
          tooltip: () => isCollapse ? t('common.tooltip.expand_sidebar') : t('common.tooltip.collapse_sidebar'),
          onClick: handleToggleSidebar
        }"
      />

      <!-- 全局搜索（移动端隐藏，且设置中启用，顶部菜单模式下也显示） -->
      <BtcGlobalSearch v-if="!browser.isMini && showGlobalSearch" />

      <!-- 顶部菜单（仅顶部菜单模式显示，在搜索框右侧） -->
      <TopMenu v-if="props.menuType === 'top'" />

      <!-- 混合菜单顶部（仅混合菜单模式显示，在搜索框右侧） -->
      <TopLeftMenu v-if="props.menuType === 'top-left'" />
    </div>

    <div class="topbar__right">
      <!-- 工具栏 -->
      <ul class="topbar__tools">
        <!-- 动态插件工具栏组件（按order排序，根据移动端/桌面端过滤） -->
        <li v-for="toolbarConfig in filteredToolbarComponents" :key="toolbarConfig.order">
          <component :is="toolbarConfig.component" />
        </li>
      </ul>

      <!-- 用户信息 -->
      <UserInfo />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopbar'
});

import { ref, onMounted, onUnmounted, markRaw, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { usePluginManager, logger } from '@btc/shared-core';
import { BtcIconButton } from '@btc/shared-components';
import { useSettingsState, useSettingsConfig } from '../../../others/btc-user-setting/composables';
import { MenuThemeEnum } from '../../../others/btc-user-setting/config/enums';
import { useBrowser } from '../../../../composables/useBrowser';
import { getEnvironment, getCurrentSubApp } from '@btc/shared-core/configs/unified-env-config';
import { getAppById } from '@btc/shared-core/configs/app-scanner';
import { getIsMainAppFn } from '../utils';
import BtcGlobalSearch from '../global-search/index.vue';
import TopMenu from '../top-menu/index.vue';
import TopLeftMenu from '../top-left-menu/index.vue';
import UserInfo from '../user-info/index.vue';

interface Props {
  isCollapse?: boolean;
  drawerVisible?: boolean;
  menuType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  drawerVisible: false,
  menuType: 'left',
});

// 获取 emit 函数
const emit = defineEmits<{
  'toggle-sidebar': [];
  'toggle-drawer': [];
  'open-drawer': [];
}>();

const { t } = useI18n();
const route = useRoute();

// 组件挂载状态标志
let isMounted = true;

// 辅助函数：检查是否应该处理抽屉事件
// 返回 true 表示应该处理，false 表示不应该处理（由 layout-app 处理）
const shouldHandleDrawerEvent = (): boolean => {
  // 如果当前是 layout-app 自己，应该处理（因为 layout-app 需要自己的抽屉功能）
  const isLayoutAppSelf = !!(window as any).__IS_LAYOUT_APP__;
  if (isLayoutAppSelf) {
    return true;
  }
  // 检查 hostname 是否是 layout-app 的域名
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
      return true; // layout-app 自己的域名，应该处理
    }
  }
  // 如果是子应用在使用 layout-app（通过 __USE_LAYOUT_APP__ 标志），不应该处理
  const isUsingLayoutApp = !!(window as any).__USE_LAYOUT_APP__;
  if (isUsingLayoutApp) {
    return false; // 子应用在使用 layout-app，不处理抽屉事件
  }
  return true; // 其他情况（独立运行），应该处理
};

// 处理折叠按钮点击事件
const handleToggleSidebar = () => {
  emit('toggle-sidebar');
};

// 安全的 emit 函数，用于在可能卸载的情况下安全地触发事件
// 在生产环境中，当组件正在卸载时，mouseenter 事件可能仍然触发，导致 emit 失败
const safeEmit = (eventName: 'toggle-drawer' | 'open-drawer') => {
  // 关键：检查是否应该处理抽屉事件
  if (!shouldHandleDrawerEvent()) {
    return; // 不应该处理，直接返回
  }

  // 关键：对于 open-drawer 事件，检查页面是否可见
  // 当标签页从隐藏变为可见时，如果鼠标正好在汉堡菜单位置，浏览器可能会触发 mouseenter 事件
  // 这会导致抽屉在不应该打开的时候被打开，所以需要检查页面可见性
  if (eventName === 'open-drawer' && typeof document !== 'undefined' && document.visibilityState !== 'visible') {
    return;
  }

  // 检查组件是否仍然挂载
  if (!isMounted) {
    return;
  }

  // 关键：检查 DOM 容器是否存在，避免在容器被销毁后操作 DOM
  // 在微前端环境中，子应用卸载时容器可能已被移除
  try {
    const appContainer = document.querySelector('#app');
    if (!appContainer || !appContainer.isConnected) {
      // 容器不存在或已从 DOM 中移除，不触发事件
      return;
    }
  } catch (error) {
    // 检查容器时出错，不触发事件
    return;
  }

  // 使用 nextTick 确保在 Vue 更新周期中安全地 emit
  nextTick(() => {
    // 再次检查组件是否仍然挂载（可能在 nextTick 期间卸载）
    if (!isMounted) {
      return;
    }

    // 再次检查页面可见性（对于 open-drawer 事件）
    if (eventName === 'open-drawer' && typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      return;
    }

    // 再次检查容器是否存在
    try {
      const appContainer = document.querySelector('#app');
      if (!appContainer || !appContainer.isConnected) {
        return;
      }
    } catch (error) {
      return;
    }

    try {
      // 使用类型断言来帮助 TypeScript 正确推断类型
      if (eventName === 'toggle-drawer') {
        emit('toggle-drawer');
      } else if (eventName === 'open-drawer') {
        emit('open-drawer');
      }
    } catch (error) {
      // 静默处理错误，避免在生产环境中报错
      // 这通常发生在组件正在卸载时 emit 事件
      if (import.meta.env.DEV) {
        console.warn(`[Topbar] emit ${eventName} 失败:`, error);
      }
    }
  });
};


// 处理 Logo 加载错误
const handleLogoError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // 如果加载失败，隐藏图片或使用占位符
  img.style.display = 'none';
};

// Logo URL - 使用 ref 而不是 computed，避免响应式依赖导致频繁重新计算
// 只在组件挂载时或应用切换时更新一次
const logoUrl = ref<string>('/logo.png');

// 更新 Logo URL 的函数（只在必要时调用）
const updateLogoUrl = () => {
  const getLogoUrl = (window as any).__APP_GET_LOGO_URL__;
  if (getLogoUrl) {
    try {
      const url = getLogoUrl();
      if (url && url !== logoUrl.value) {
        logoUrl.value = url;
      }
    } catch (error) {
      // 如果获取失败，使用默认值
      if (logoUrl.value !== '/logo.png') {
        logoUrl.value = '/logo.png';
      }
    }
  } else {
    // 如果没有提供函数，使用默认值
    if (logoUrl.value !== '/logo.png') {
      logoUrl.value = '/logo.png';
    }
  }
};

// 浏览器信息
const { browser } = useBrowser();

// 获取设置状态
let showGlobalSearch: any;
let menuThemeType: any;
let isDark: any;
let menuStyleList: any;

try {
  const settingsState = useSettingsState();
  showGlobalSearch = settingsState.showGlobalSearch;
  menuThemeType = settingsState.menuThemeType;
  isDark = settingsState.isDark;
} catch (error) {
  // 静默失败，使用默认值
  if (import.meta.env.DEV) {
    logger.error('[Topbar] useSettingsState 失败:', error);
  }
  showGlobalSearch = ref(false);
  menuThemeType = ref(null);
  isDark = ref(false);
}

try {
  const settingsConfig = useSettingsConfig();
  menuStyleList = settingsConfig.menuStyleList;
} catch (error) {
  logger.error('[Topbar] useSettingsConfig 失败:', error);
  menuStyleList = ref([]);
}

// 确保所有变量都有值
if (!showGlobalSearch) {
  showGlobalSearch = ref(false);
}
if (!menuThemeType) {
  menuThemeType = ref(null);
}
if (!isDark) {
  isDark = ref(false);
}
if (!menuStyleList) {
  menuStyleList = ref([]);
}

// Logo 区域的 key，用于强制重新渲染
const logoKey = ref(0);

// 响应式的路径和主机名，用于触发 computed 重新计算
const currentPath = ref(typeof window !== 'undefined' ? window.location.pathname : '');
const currentHostname = ref(typeof window !== 'undefined' ? window.location.hostname : '');

// Logo 标题：主应用显示"拜里斯科技"，子应用显示应用名称（如"物流模块"）
const logoTitle = computed(() => {
  try {
    // 使用响应式的路径和主机名，确保在应用切换时重新计算
    // 这里仍然调用函数，但依赖响应式变量来触发重新计算
    void currentPath.value;
    void currentHostname.value;
    void route.path; // 也依赖路由路径

    // 判断是否是主应用（使用注入的函数，确保在 layout-app 环境下正确判断）
    const isMainAppFn = getIsMainAppFn();
    const isMain = isMainAppFn
      ? isMainAppFn(route.path, window.location.pathname, !(window as any).__POWERED_BY_QIANKUN__)
      : false; // 如果没有注入函数，默认返回 false（子应用）

    if (isMain) {
      // 主应用：显示"拜里斯科技"
      return t('app.title');
    }

    // 子应用：获取当前应用信息
    const currentSubAppId = getCurrentSubApp();
    if (currentSubAppId) {
      // 优先使用主应用的 i18n 实例进行翻译（包含已合并的子应用国际化消息）
      const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
      if (mainAppI18n && mainAppI18n.global) {
        const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
        const messages = mainAppI18n.global.getLocaleMessage(currentLocale);

        // 优先尝试 subapp.name（子应用名称）
        // 注意：messages 中的 subapp 是嵌套对象，需要访问 messages.subapp.name
        if (messages?.subapp?.name) {
          const value = messages.subapp.name;
          if (typeof value === 'string' && value.trim() !== '') {
            return value;
          } else if (typeof value === 'function') {
            try {
              const result = value({ normalize: (arr: any[]) => arr[0] });
              if (typeof result === 'string' && result.trim() !== '') {
                return result;
              }
            } catch (error) {
              // 函数调用失败，继续尝试其他方法
            }
          }
        }

        // 如果直接访问失败，使用 t() 函数
        try {
          // 优先尝试 subapp.name
          const subappNameKey = 'subapp.name';
          const subappTranslated = mainAppI18n.global.t(subappNameKey);
          if (subappTranslated && typeof subappTranslated === 'string' && subappTranslated !== subappNameKey && subappTranslated.trim() !== '') {
            return subappTranslated;
          }
        } catch (error) {
          // 如果翻译失败，继续尝试其他方法
        }
      }

      // 如果主应用翻译失败，尝试使用共享组件的 t() 函数
      try {
        // 优先尝试 subapp.name
        const subappTranslated = t('subapp.name');
        if (subappTranslated && subappTranslated !== 'subapp.name') {
          return subappTranslated;
        }
      } catch (error) {
        // 如果翻译失败，继续使用其他方法
      }

      // 如果 subapp.name 不存在，尝试使用 domain.type.{appId} 作为后备
      const domainTypeKey = `domain.type.${currentSubAppId}`;
      // 优先使用主应用的 i18n 实例（复用上面已声明的 mainAppI18n）
      let domainTypeName: string | undefined;
      if (mainAppI18n && mainAppI18n.global) {
        const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
        if (mainAppI18n.global.te(domainTypeKey, currentLocale)) {
          const translated = mainAppI18n.global.t(domainTypeKey, currentLocale);
          if (translated && typeof translated === 'string' && translated !== domainTypeKey) {
            domainTypeName = translated;
          }
        }
      }

      // 如果主应用翻译失败，使用共享组件的 t() 函数
      if (!domainTypeName) {
        domainTypeName = t(domainTypeKey);
      }

      // 如果国际化值存在且不是 key 本身，则使用国际化值
      if (domainTypeName && domainTypeName !== domainTypeKey) {
        return domainTypeName;
      }

      // 最后兜底：获取应用配置
      const appConfig = getAppById(currentSubAppId);
      if (appConfig && appConfig.name) {
        // 如果 name 是国际化键，尝试翻译
        if (appConfig.name.includes('.')) {
          try {
            const translated = t(appConfig.name);
            if (translated && translated !== appConfig.name) {
              return translated;
            }
          } catch {
            // 忽略错误
          }
        }
        // 否则直接返回 name（可能是已翻译的值）
        return appConfig.name;
      }
    }

    // 默认使用 app.title
    return t('app.title');
  } catch (error) {
    // 如果出现任何错误（如 getCurrentSubApp 或 getAppById 抛出错误），使用默认标题
    logger.error('[Topbar] 计算 logoTitle 时出错:', error);
    try {
      return t('app.title');
    } catch {
      return '拜里斯科技';
    }
  }
});

// 判断是否为深色菜单风格（展示层逻辑）
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 更新路径和主机名的函数
const updateLocation = () => {
  if (typeof window !== 'undefined') {
    currentPath.value = window.location.pathname;
    currentHostname.value = window.location.hostname;
    // 注意：不再更新 logoKey，避免 Logo 图片不断重新加载
    // Logo URL 只在应用切换时更新（通过 updateLogoUrl）
  }
};

// 保存 watch 停止函数，用于清理
let stopRouteWatch: (() => void) | null = null;
let stopThemeWatch: (() => void) | null = null;
let stopMenuThemeConfigWatch: (() => void) | null = null;

// 监听路由变化
stopRouteWatch = watch(
  () => route.path,
  () => {
    updateLocation();
  },
  { immediate: true }
);

// 监听主题变化，强制更新 Logo 区域（但不更新 Logo URL，避免频繁请求）
stopThemeWatch = watch(
  () => [isDark?.value, menuThemeType?.value],
  () => {
    // 使用 nextTick 确保在 DOM 更新后强制重新渲染
    // 注意：只更新 logoKey 以触发重新渲染，不更新 logoUrl，避免频繁请求
    nextTick(() => {
      logoKey.value++;
    });
  },
  { immediate: false }
);

// 获取当前菜单主题配置（类似 art-design-pro 的 getMenuTheme）
// 关键：必须在 watch 之前定义，避免"在初始化之前访问"的错误
const menuThemeConfig = computed(() => {
  try {
    // 优先判断菜单风格类型（不受系统主题影响）
    const theme = menuThemeType?.value || MenuThemeEnum.DESIGN;

    // 如果是深色菜单风格，无论系统主题如何，都使用深色菜单配置
    if (theme === MenuThemeEnum.DARK) {
      // 深色系统主题下，使用 #0a0a0a 与内容区域一致
      if (isDark?.value === true) {
        return {
          background: 'var(--btc-surface-panel)',
          systemNameColor: '#FFFFFF',
          rightLineColor: 'var(--btc-border-muted)',
        };
      }
      // 浅色系统主题下，使用深色菜单背景色
      return {
        background: 'rgba(30, 30, 30, 0.6)', // 深色玻璃态
        systemNameColor: '#BABBBD',
        rightLineColor: 'rgba(255, 255, 255, 0.1)',
      };
    }

    // 深色系统主题下强制使用深色菜单配置（展示层逻辑）
    if (isDark?.value === true) {
      return {
        background: 'var(--btc-surface-panel)',
        systemNameColor: '#FFFFFF',
        rightLineColor: 'var(--btc-border-muted)',
      };
    }

    // 浅色主题下，根据用户选择的菜单风格类型返回对应的配置
    // 安全访问 menuStyleList，避免在初始化之前访问
    if (menuStyleList && menuStyleList.value && Array.isArray(menuStyleList.value)) {
      const themeConfig = menuStyleList.value.find((item: any) => item.theme === theme);

      if (themeConfig) {
        return {
          background: themeConfig.background,
          systemNameColor: themeConfig.systemNameColor,
          rightLineColor: themeConfig.rightLineColor,
        };
      }
    }

    // 默认配置
    return {
      background: 'var(--btc-surface-panel)',
      systemNameColor: 'var(--el-text-color-primary)',
      rightLineColor: 'var(--btc-border-muted)',
    };
  } catch (error) {
    // 如果出现任何错误，返回默认配置
    console.warn('[Topbar] menuThemeConfig 计算错误:', error);
    return {
      background: 'var(--btc-surface-panel)',
      systemNameColor: 'var(--el-text-color-primary)',
      rightLineColor: 'var(--btc-border-muted)',
    };
  }
});

// 监听 menuThemeConfig 变化，确保样式立即更新
// 关键：必须在 menuThemeConfig 定义之后才能使用
stopMenuThemeConfigWatch = watch(
  () => menuThemeConfig.value,
  (newConfig) => {
    // 确保 newConfig 存在且有效
    if (!newConfig || !newConfig.background) {
      return;
    }
    // 使用 nextTick 确保 DOM 更新完成后再强制更新样式
    nextTick(() => {
      // 强制更新所有使用 menuThemeConfig 的元素的样式
      const logoContentEls = document.querySelectorAll('.topbar__logo-content');
      logoContentEls.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl && newConfig.background) {
          htmlEl.style.setProperty('background-color', newConfig.background);
        }
      });
    });
  },
  { immediate: false, deep: true }
);

// 插件管理器
const pluginManager = usePluginManager();


// 动态工具栏组件
const toolbarComponents = ref<any[]>([]);

// 过滤后的工具栏组件（根据移动端/桌面端显示）
const filteredToolbarComponents = computed(() => {
  const filtered = toolbarComponents.value.filter(config => {
    // 与 cool-admin 完全一致的过滤逻辑
    if (browser.isMini) {
      // 移动端：使用 h5 属性，如果未定义则默认为 true
      // 注意：如果 h5 为 false，则隐藏；如果 h5 为 true 或 undefined，则显示
      const shouldShow = config.h5 ?? true;
      return shouldShow;
    } else {
      // 桌面端：使用 pc 属性，如果未定义则默认为 true
      // 注意：如果 pc 为 false，则隐藏；如果 pc 为 true 或 undefined，则显示
      const shouldShow = config.pc ?? true;
      return shouldShow;
    }
  });
  return filtered;
});


// 加载工具栏组件的函数
const loadToolbarComponents = async () => {
  try {
    const toolbarConfigs = pluginManager.getToolbarComponents();

    if (toolbarConfigs.length === 0) {
      return;
    }

    for (const config of toolbarConfigs) {
      try {
        // 关键：验证 toolbar 配置的 component 是否是一个函数（动态导入）
        // 如果 component 不是函数，说明配置错误，不应该作为工具栏组件
        if (typeof config.component !== 'function') {
          if (import.meta.env.DEV) {
            console.warn('[Topbar] 跳过无效的工具栏配置（component 不是函数）:', config);
          }
          continue;
        }

        const component = await config.component();
        const componentInstance = component.default || component;

        toolbarComponents.value.push({
          ...config,
          component: markRaw(componentInstance)
        });
      } catch (error) {
        // 静默失败
        if (import.meta.env.DEV) {
          console.warn('[Topbar] 加载工具栏组件失败:', error);
        }
      }
    }
  } catch (error) {
    // 静默失败
    if (import.meta.env.DEV) {
      console.warn('[Topbar] 获取工具栏组件配置失败:', error);
    }
  }
};

// 保存事件监听器和定时器的引用，用于清理
let appSwitchHandler: (() => void) | null = null;
let pluginsInstalledHandler: (() => void) | null = null;
let pluginsTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pushStateTimeoutIds: Set<ReturnType<typeof setTimeout>> = new Set();
let replaceStateTimeoutIds: Set<ReturnType<typeof setTimeout>> = new Set();

// 初始化工具栏组件和用户信息
onMounted(async () => {
  // 初始化 Logo URL（只调用一次）
  updateLogoUrl();

  // 立即尝试加载工具栏组件
  await loadToolbarComponents();

  // 如果工具栏组件为空，监听插件安装事件
  if (toolbarComponents.value.length === 0) {
    const emitter = (window as any).__APP_EMITTER__;
    if (emitter) {
      pluginsInstalledHandler = async () => {
        await loadToolbarComponents();
        // 清理事件监听器
        if (pluginsInstalledHandler && emitter) {
          emitter.off('plugins-installed', pluginsInstalledHandler);
          pluginsInstalledHandler = null;
        }
      };
      emitter.on('plugins-installed', pluginsInstalledHandler);

      // 设置超时，避免无限等待（保存 ID 以便清理）
      pluginsTimeoutId = setTimeout(() => {
        if (toolbarComponents.value.length === 0) {
          loadToolbarComponents();
        }
        pluginsTimeoutId = null;
      }, 2000);
    }
  }

  // 监听应用切换事件，更新 Logo 标题和 URL
  // 关键：保存 handler 引用，确保能正确清理
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    appSwitchHandler = () => {
      updateLocation();
      updateLogoUrl(); // 应用切换时更新 Logo URL
    };
    emitter.on('app.switch', appSwitchHandler);
  }

  // 监听浏览器历史记录变化（popstate 事件）
  window.addEventListener('popstate', updateLocation);

  // 监听 pushState 和 replaceState（通过重写 history API）
  // 关键：检查是否已经被其他组件重写，避免覆盖
  const existingPushState = (window as any).__TOPBAR_ORIGINAL_PUSH_STATE__;
  const existingReplaceState = (window as any).__TOPBAR_ORIGINAL_REPLACE_STATE__;

  const originalPushState = existingPushState || history.pushState;
  const originalReplaceState = existingReplaceState || history.replaceState;

  // 保存原始方法以便清理（如果还没有保存）
  if (!existingPushState) {
    (window as any).__TOPBAR_ORIGINAL_PUSH_STATE__ = originalPushState;
  }
  if (!existingReplaceState) {
    (window as any).__TOPBAR_ORIGINAL_REPLACE_STATE__ = originalReplaceState;
  }

  // 创建包装函数，保存定时器 ID 以便清理
  const wrappedPushState = function(...args: any[]) {
    originalPushState.apply(history, args);
    // 延迟更新，确保路径已变化（保存 ID 以便清理）
    const timeoutId = setTimeout(() => {
      updateLocation();
      pushStateTimeoutIds.delete(timeoutId);
    }, 0);
    pushStateTimeoutIds.add(timeoutId);
  };

  const wrappedReplaceState = function(...args: any[]) {
    originalReplaceState.apply(history, args);
    // 延迟更新，确保路径已变化（保存 ID 以便清理）
    const timeoutId = setTimeout(() => {
      updateLocation();
      replaceStateTimeoutIds.delete(timeoutId);
    }, 0);
    replaceStateTimeoutIds.add(timeoutId);
  };

  // 只有在还没有被重写时才重写（避免覆盖其他组件的重写）
  if (!existingPushState) {
    history.pushState = wrappedPushState;
  }
  if (!existingReplaceState) {
    history.replaceState = wrappedReplaceState;
  }
});

// 清理事件监听
onUnmounted(() => {
  // 标记组件已卸载
  isMounted = false;

  // 停止所有 watch 监听器
  if (stopRouteWatch) {
    stopRouteWatch();
    stopRouteWatch = null;
  }
  if (stopThemeWatch) {
    stopThemeWatch();
    stopThemeWatch = null;
  }
  if (stopMenuThemeConfigWatch) {
    stopMenuThemeConfigWatch();
    stopMenuThemeConfigWatch = null;
  }

  // 清理应用切换事件监听（使用保存的 handler 引用）
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter && appSwitchHandler) {
    emitter.off('app.switch', appSwitchHandler);
    appSwitchHandler = null;
  }

  // 清理插件安装事件监听
  if (emitter && pluginsInstalledHandler) {
    emitter.off('plugins-installed', pluginsInstalledHandler);
    pluginsInstalledHandler = null;
  }

  // 清理定时器
  if (pluginsTimeoutId) {
    clearTimeout(pluginsTimeoutId);
    pluginsTimeoutId = null;
  }

  // 清理所有 pushState 和 replaceState 的定时器
  pushStateTimeoutIds.forEach(id => clearTimeout(id));
  pushStateTimeoutIds.clear();
  replaceStateTimeoutIds.forEach(id => clearTimeout(id));
  replaceStateTimeoutIds.clear();

  // 清理浏览器历史记录监听
  window.removeEventListener('popstate', updateLocation);

  // 恢复原始的 history API（只有在当前组件重写的情况下才恢复）
  const originalPushState = (window as any).__TOPBAR_ORIGINAL_PUSH_STATE__;
  const originalReplaceState = (window as any).__TOPBAR_ORIGINAL_REPLACE_STATE__;

  // 检查当前 history API 是否还是我们重写的版本
  // 如果是，则恢复；如果不是，说明其他组件已经重写了，不要覆盖
  if (originalPushState && history.pushState !== originalPushState) {
    // 当前不是原始版本，说明被其他组件重写了，不恢复
    // 但清除保存的引用，避免内存泄漏
    delete (window as any).__TOPBAR_ORIGINAL_PUSH_STATE__;
  } else if (originalPushState) {
    // 当前还是我们重写的版本，恢复原始版本
    history.pushState = originalPushState;
    delete (window as any).__TOPBAR_ORIGINAL_PUSH_STATE__;
  }

  if (originalReplaceState && history.replaceState !== originalReplaceState) {
    // 当前不是原始版本，说明被其他组件重写了，不恢复
    delete (window as any).__TOPBAR_ORIGINAL_REPLACE_STATE__;
  } else if (originalReplaceState) {
    // 当前还是我们重写的版本，恢复原始版本
    history.replaceState = originalReplaceState;
    delete (window as any).__TOPBAR_ORIGINAL_REPLACE_STATE__;
  }
});

</script>

<style lang="scss" scoped>
.topbar {
  height: 47px;
  min-height: 47px;
  width: 100%; // 明确设置宽度为 100%，确保延伸到最右侧
  background-color: var(--btc-surface-panel); // 使用玻璃态面板背景
  backdrop-filter: blur(var(--btc-effect-blur)); // 添加毛玻璃效果
  border-bottom: 1px solid var(--btc-border-muted); // 使用柔和边框
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: visible; // 确保内容不被裁切

  // 品牌区域（汉堡菜单 + Logo，与侧边栏宽度一致）
  // 无论屏幕大小，都与侧边栏同步折叠和展开
  &__brand {
    display: flex;
    align-items: stretch;
    width: 255px; // 与侧边栏宽度一致
    height: 47px;
    border-right: 1px solid var(--btc-border-muted); // 右侧分隔线
    border-bottom: 1px solid var(--btc-border-muted); // 底部分隔线（logo区域和搜索区域之间），与顶栏底部分隔线保持一致
    position: relative;
    transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;

    // 与侧边栏同步折叠
    &.is-collapse {
      width: 64px; // 折叠时只显示汉堡菜单

      .topbar__logo-content {
        opacity: 0;
        visibility: hidden;
      }
    }

    // 顶部菜单模式：只显示汉堡菜单，隐藏logo和标题
    &.menu-type-top {
      width: 64px; // 只显示汉堡菜单

      .topbar__logo-content {
        display: none;
      }
    }

    // 双栏菜单模式：品牌区域宽度固定，隐藏 logo 和标题
    &.menu-type-dual-menu {
      width: 64px; // 与折叠菜单和双栏菜单左侧栏宽度一致

      .topbar__logo-content {
        display: none !important; // 完全隐藏 logo 和标题
      }
    }
  }

  // 汉堡菜单样式（主题色背景）
  &__hamburger {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 47px;
    cursor: pointer;
    flex-shrink: 0;
    gap: 5px;
    background-color: var(--el-color-primary); // 主题色背景
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
    @media (hover: hover) {
      &:hover {
        background-color: var(--el-color-primary-light-3); // 悬停时浅色主题色

        .hamburger-line {
          background-color: #fff;
        }
      }
    }

    // 触摸设备使用 :active 样式（点击时显示反馈）
    @media (hover: none) {
      &:active {
        background-color: var(--el-color-primary-light-3);

        .hamburger-line {
          background-color: #fff;
        }
      }
    }

    &:active {
      background-color: var(--el-color-primary-dark-2); // 按下时深色主题色
    }

    .hamburger-line {
      width: 20px;
      height: 2px;
      background-color: #fff; // 白色线条
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }

    // 交叉状态（抽屉打开时）
    &.is-active {
      .hamburger-line {
        &:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }

        &:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }

        &:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      }
    }
  }

  // Logo 内容区域（填充剩余空间）
  &__logo-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    overflow: hidden;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                visibility 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    // 默认浅色背景（根据菜单风格配置）
    background-color: transparent; // 移除硬编码，使用透明或由 JS 控制

    // 暗色系统主题下强制使用深色背景
    html.dark & {
      background-color: transparent !important; // 移除硬编码，让 JS 控制的变量生效
    }

    // 深色菜单风格下（浅色系统主题）使用深色背景
    &.is-dark-menu:not(.is-dark-theme) {
      // background-color: #0a0a0a !important; // 移除硬编码
    }
  }

  &__logo-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  &__logo-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
  }

  // 左侧工具区（折叠按钮 + 搜索 + 顶部菜单）
  &__left {
    display: flex;
    align-items: center;
    gap: 5px !important; // 与 tabbar 的按钮间距保持一致，使用 !important 确保优先级
    padding-left: 10px; // 与品牌区域的间距（对应 tabbar 内容区的 padding-left）
    flex: 1; // 占据剩余空间，让顶部菜单可以展开
    overflow: hidden; // 防止溢出
  }

  &__title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    user-select: none;
  }

  &__right {
    display: flex;
    align-items: center;
    margin-left: auto; // 自动靠右
  }

  &__tools {
    display: flex;
    margin: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    padding: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    margin-right: 0; // 移除右边距，让背景延伸到最右侧
    column-gap: 10px !important; // 使用 !important 确保优先级，防止浏览器默认样式影响

    & > li {
      display: flex;
      justify-content: center;
      align-items: center;
      list-style: none;
      margin: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
      padding: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
      height: 45px;
      cursor: pointer;
    }
  }

  &__user {
    display: flex;
    align-items: center;
    outline: none;
    cursor: pointer;
    white-space: nowrap;
    padding: 5px 5px 5px 10px;
    border-radius: 6px;

    // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
    @media (hover: hover) {
      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    // 触摸设备使用 :active 样式（点击时显示反馈）
    @media (hover: none) {
      &:active {
        background-color: var(--el-fill-color-light);
      }
    }

    &-name {
      position: relative;
      display: inline-block;
      margin-right: 10px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;

      // 使用伪元素预留完整宽度（不可见，用于保持布局）
      &::before {
        content: attr(data-full-name);
        visibility: hidden;
        display: inline-block;
        height: 0;
        font-weight: bold;
      }

      &-text {
        position: absolute;
        left: 0;
        top: 0;
        white-space: nowrap;
        // 从左到右炫彩渐变（静态，不动画）- 亮色模式
        background: linear-gradient(to right, #4F46E5, #EC4899, #06B6D4);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;

        // 暗色模式适配
        &.is-dark {
          background: linear-gradient(to right, #818cf8, #f472b6, #22d3ee);
          -webkit-background-clip: text;
          background-clip: text;
        }
      }

      &-cursor {
        position: absolute;
        left: 0;
        top: 0;
        display: inline-block;
        color: #4F46E5;
        animation: cursorBlink 1.2s infinite;
        white-space: nowrap;
        // 光标位置跟随文字，通过 JavaScript 动态设置

        // 暗色模式适配
        .topbar.is-dark-menu & {
          color: #818cf8;
        }
      }
    }

    @keyframes cursorBlink {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0;
      }
    }
  }
}
</style>

<style lang="scss">
/**
 * 全局样式（非 scoped）
 * 用于覆盖深色菜单风格下的 Logo 文字颜色
 */

// 深色菜单风格下的顶栏 logo 文字颜色
.topbar.is-dark-menu {
  .topbar__logo-content {
    .topbar__logo-text {
      // 浅色系统主题下的深色菜单风格使用灰色
      color: #BABBBD !important;

      // 暗色系统主题下使用白色以提高对比度
      html.dark & {
        color: #FFFFFF !important;
      }
    }
  }

  // 品牌区域底部分隔线（logo 区域和搜索区域之间）与顶栏底部分隔线保持一致
  .topbar__brand {
    border-bottom-color: var(--el-border-color) !important;
  }

  // Logo 内容区域背景色（深色菜单风格，与菜单背景一致）
  .topbar__brand .topbar__logo-content {
    // 深色系统主题下，使用 #0a0a0a 与内容区域一致
    html.dark & {
      background-color: #0a0a0a !important;
    }

    // 浅色系统主题下，使用深色菜单背景色
    html:not(.dark) & {
      background-color: #0a0a0a !important;
    }
  }
}
</style>
