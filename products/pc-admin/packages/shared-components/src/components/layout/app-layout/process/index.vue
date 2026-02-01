<template>
  <!-- 关键：使用 v-show 控制显示/隐藏，隐藏时不占空间 -->
  <div v-show="shouldShow" class="app-process" :class="tabStyleClass">
    <!-- 左侧操作按钮 -->
    <ul class="app-process__op">
      <li>
        <BtcIconButton
          :config="{
            icon: 'back',
            tooltip: t('common.tooltip.back'),
            onClick: toBack
          }"
        />
      </li>
      <li>
        <BtcIconButton
          :config="{
            icon: 'refresh',
            tooltip: t('common.tooltip.refresh'),
            onClick: toRefresh
          }"
        />
      </li>
      <li>
        <BtcIconButton
          :config="{
            icon: 'home',
            tooltip: t('common.tooltip.home'),
            onClick: toHome,
            class: isOnHomePage ? 'is-active' : undefined
          }"
        />
      </li>
    </ul>

    <!-- 标签容器 -->
    <div class="app-process__container">
      <el-scrollbar ref="scrollerRef" class="app-process__scroller">
        <div class="app-process__list">
          <div
            v-for="(item, index) in filteredTabs"
            :key="item.fullPath"
            :ref="(el) => setItemRef(el, index)"
            class="app-process__item"
            :class="{ active: item.active }"
            @click="onTap(item, index)"
            @contextmenu.stop.prevent="openContextMenu($event, item, index)"
          >
            <!-- 图标：所有应用的 tabbar 标签都不显示图标（参考 cool-admin-vue-7.x） -->
            <span class="label" :title="getTabLabel(item)">
              {{ getTabLabel(item) }}
            </span>

            <btc-svg
              v-if="isTabClosable(item.fullPath || item.path)"
              class="close"
              name="close"
              @mousedown.stop="onDel(index)"
            />
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 右侧操作按钮 -->
    <ul class="app-process__op">
      <!-- 标签页操作菜单 -->
      <li>
        <BtcIconButton
          :config="{
            icon: 'tabbar-menu',
            tooltip: t('common.tooltip.tab_actions'),
            dropdown: {
              items: dropdownMenuItems,
              onCommand: handleTabCommand
            }
          }"
        />
      </li>

      <!-- 全屏按钮 -->
      <li>
        <BtcIconButton
          :config="{
            icon: () => isFullscreen ? 'screen-normal' : 'screen-full',
            tooltip: () => isFullscreen ? t('common.tooltip.exit_fullscreen') : t('common.tooltip.fullscreen'),
            onClick: () => $emit('toggle-fullscreen')
          }"
        />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutProcess',
});

import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n, setGlobalState } from '@btc/shared-core';
import { BtcConfirm } from '@btc/shared-components';
import { getCurrentEnvironment } from '@btc/shared-core/configs/unified-env-config';
// BtcMessage 未使用
import type { ProcessItem } from '../../../../store/process';
import { useProcessStore, getCurrentAppFromPath } from '../../../../store/process';
import { getManifestRoute } from '@btc/shared-core/manifest';
import { useSettingsState } from '../../../others/btc-user-setting/composables';
import { getAppById } from '@btc/shared-core/configs/app-scanner';
import { initGlobalTabBreadcrumbListener, globalTabbarList, globalActiveTabKey } from '../../../../composables/useGlobalTabBreadcrumbState';

interface Props {
  isFullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  isFullscreen: false,
});

defineEmits<{
  'toggle-fullscreen': [];
}>();

const route = useRoute();
const router = useRouter();
const { t, te } = useI18n();

// 使用静态导入的 store
const processStore = useProcessStore();

// 初始化全局状态监听器（单例模式，只注册一次）
onMounted(() => {
  initGlobalTabBreadcrumbListener();
});

// 获取设置状态
// 关键优化：确保 showWorkTab 有默认值 true，避免等待 useSettingsState() 初始化导致的延迟
// 先创建默认值，确保组件立即显示，然后从 useSettingsState() 获取实际值
const showWorkTab = ref<boolean>(true); // 默认显示，确保组件立即渲染
const tabStyle = ref<string>('tab-default'); // 默认样式

// 获取实际设置值（同步读取，避免闪烁）
try {
  const settingsState = useSettingsState();
  // 关键：立即同步实际值，确保响应式更新
  // 先读取值，再用正确的初始值创建 ref，避免先显示后隐藏的闪烁
  const initialShowWorkTab = settingsState.showWorkTab.value ?? true;
  const initialTabStyle = settingsState.tabStyle.value ?? 'tab-default';

  // 使用正确的初始值更新 ref，避免闪烁
  showWorkTab.value = initialShowWorkTab;
  tabStyle.value = initialTabStyle;

  // 监听设置变化，确保用户切换设置时能响应
  // 注意：不需要 immediate: true，因为我们已经在上面同步设置了初始值
  watch(settingsState.showWorkTab, (val) => {
    showWorkTab.value = val ?? true;
  });

  watch(settingsState.tabStyle, (val) => {
    tabStyle.value = val ?? 'tab-default';
  });
} catch (error) {
  // 如果 useSettingsState() 初始化失败，使用默认值（已经设置）
  console.warn('[Process] useSettingsState 初始化失败，使用默认值', error);
}

// 标签页样式类
const tabStyleClass = computed(() => tabStyle.value || 'tab-default');

// 判断是否应该显示内容（根据 showWorkTab 控制）
// 关键：容器始终渲染，只是根据 showWorkTab 控制内容的可见性
const shouldShow = computed(() => {
  return showWorkTab.value;
});

// 监听标签页样式变化
function handleTabStyleChange(_event: CustomEvent) {
  // 样式类会自动通过 computed 更新
}

onMounted(() => {
  // 监听标签页样式变化
  // eslint-disable-next-line no-undef
  window.addEventListener('tab-style-change', handleTabStyleChange as EventListener);
});

onUnmounted(() => {
  // eslint-disable-next-line no-undef
  window.removeEventListener('tab-style-change', handleTabStyleChange as EventListener);
});

const scrollerRef = ref();
const itemRefs = ref<Record<number, HTMLElement>>({});

// 判断 Tab 是否可关闭
function isTabClosable(path: string): boolean {
  const normalizedPath = path.replace(/\/+$/, '') || '/';
  // 概览页面不可关闭
  return normalizedPath !== '/overview';
}

// 获取应用的首页路径（使用全局配置，移除硬编码）
function getAppHomePath(appId: string): string {
  const app = getAppById(appId);

  if (!app) {
    // 如果找不到应用配置，回退到 /
    return '/';
  }

  // 判断目标路径：
  // - 生产环境子域名：跳转到 /（子域名本身就是应用的根路径）
  // - 开发/预览环境主域名：子应用跳转到 pathPrefix（如 /logistics），主应用跳转到 / 或配置的 homeRoute
  if (app.type === 'main') {
    // 主应用：优先使用配置的 homeRoute，否则使用 /
    return app.routes?.homeRoute || '/';
  }

  if (app.type === 'sub' && typeof window !== 'undefined') {
    const env = getCurrentEnvironment();
    const hostname = window.location.hostname;

    // 生产环境或测试环境子域名：首页是 /
    if ((env === 'production' || env === 'test') && app.subdomain && hostname === app.subdomain) {
      return '/';
    } else if (app.pathPrefix) {
      // 开发/预览环境主域名：子应用首页是 pathPrefix
      return app.pathPrefix;
    }
  }

  // 默认返回 /
  return '/';
}

// 将全局状态的 TabbarItem 转换为 ProcessItem 格式（兼容性）
function convertGlobalTabToProcessItem(tab: any): ProcessItem {
  return {
    path: tab.path,
    fullPath: tab.path,
    name: tab.key,
    meta: {
      label: tab.label,
      labelKey: tab.i18nKey,
      title: tab.label,
      titleKey: tab.i18nKey,
    },
    active: tab.key === globalActiveTabKey.value,
    app: tab.appName,
  };
}

// 根据当前路由过滤标签（优先使用全局状态，兼容 processStore）
const filteredTabs = computed(() => {
  const currentApp = getCurrentAppFromPath(route.path);

  // 优先级 1: 使用全局状态的 tabbarList
  if (globalTabbarList.value.length > 0) {
    // 过滤当前应用的标签，同时兼容 appName 为 'main' 或 'main-app' 的情况
    const filtered = globalTabbarList.value.filter((tab: any) => {
      // 主应用的 appName 可能是 'main' 或 'main-app'，需要兼容处理
      if (currentApp === 'main') {
        return tab.appName === 'main' || tab.appName === 'main-app';
      }
      return tab.appName === currentApp;
    });
    return filtered.map(convertGlobalTabToProcessItem);
  }

  // 优先级 2: 兼容 processStore（过渡期）
  if (!processStore) return [];
  return processStore.list.filter((tab: ProcessItem) => tab.app === currentApp);
});

// 当前激活标签的索引
const currentTabIndex = computed(() => {
  const currentPath = route.path;
  const currentApp = getCurrentAppFromPath(route.path);
  // 关键：在 layout-app 环境下，需要同时匹配 fullPath 和 path
  // 因为 layout-app 的路由路径可能是完整路径（如 /finance/inventory/result）
  // 而标签的 path 可能是子应用内部路径（如 /inventory/result）
  // 标签的 fullPath 可能是完整路径（如 /finance/inventory/result）
  return filteredTabs.value.findIndex((tab) => {
    // 优先匹配 fullPath（完整路径）
    if (tab.fullPath && (tab.fullPath === currentPath || currentPath === tab.fullPath)) {
      return true;
    }
    // 回退到匹配 path（子应用内部路径）
    if (tab.path === currentPath || currentPath === tab.path) {
      return true;
    }
    // 在 layout-app 环境下，如果 currentPath 包含应用前缀，尝试去掉前缀后匹配
    const isLayoutApp = typeof window !== 'undefined' && !!(window as any).__IS_LAYOUT_APP__;
    if (isLayoutApp && currentApp && currentPath.startsWith(`/${currentApp}`)) {
      const subAppPath = currentPath.slice(`/${currentApp}`.length) || '/';
      if (tab.path === subAppPath || tab.fullPath === currentPath) {
        return true;
      }
    }
    return false;
  });
});

// 当前激活标签
const currentTab = computed(() => {
  if (currentTabIndex.value >= 0) {
    return filteredTabs.value[currentTabIndex.value];
  }
  return null;
});

// 检查固定状态
const checkFixedStatus = computed(() => {
  const currentIdx = currentTabIndex.value;
  if (currentIdx < 0) {
    return {
      isCurrentPinned: false,
      areAllLeftPinned: false,
      areAllRightPinned: false,
      areAllOtherPinned: false,
      areAllPinned: false,
    };
  }

  const leftTabs = filteredTabs.value.slice(0, currentIdx);
  const rightTabs = filteredTabs.value.slice(currentIdx + 1);
  const otherTabs = filteredTabs.value.filter((_, idx) => idx !== currentIdx);

  return {
    isCurrentPinned: currentTab.value ? processStore.isPinned(currentTab.value.fullPath) : false,
    areAllLeftPinned: leftTabs.length > 0 && leftTabs.every((tab) => processStore.isPinned(tab.fullPath)),
    areAllRightPinned: rightTabs.length > 0 && rightTabs.every((tab) => processStore.isPinned(tab.fullPath)),
    areAllOtherPinned: otherTabs.length > 0 && otherTabs.every((tab) => processStore.isPinned(tab.fullPath)),
    areAllPinned: filteredTabs.value.length > 0 && filteredTabs.value.every((tab) => processStore.isPinned(tab.fullPath)),
  };
});

// 下拉菜单项
const dropdownMenuItems = computed(() => {
  const fixedStatus = checkFixedStatus.value;
  const isCurrentPinned = fixedStatus.isCurrentPinned;
  const currentIdx = currentTabIndex.value;
  const isFirstTab = currentIdx === 0;
  const isLastTab = currentIdx === filteredTabs.value.length - 1;
  const isOnlyTab = filteredTabs.value.length === 1;

  return [
    {
      command: 'pin',
      label: isCurrentPinned ? t('common.unpin') : t('common.pin'),
      icon: () => (isCurrentPinned ? 'unlock' : 'pin'),
      disabled: false,
    },
    {
      command: 'close-left',
      label: t('common.close_left'),
      icon: 'arrow-left',
      disabled: isFirstTab || fixedStatus.areAllLeftPinned,
    },
    {
      command: 'close-right',
      label: t('common.close_right'),
      icon: 'arrow-right',
      disabled: isLastTab || fixedStatus.areAllRightPinned,
    },
    {
      command: 'close-other',
      label: t('common.close_other'),
      icon: 'close',
      disabled: isOnlyTab || fixedStatus.areAllOtherPinned,
    },
    {
      command: 'close-all',
      label: t('common.close_all'),
      icon: 'close-border',
      disabled: filteredTabs.value.length === 0 || fixedStatus.areAllPinned,
    },
  ];
});

function setItemRef(el: any, index: number) {
  if (el) {
    itemRefs.value[index] = el;
  }
}

// 获取主应用的 i18n 实例（用于确保翻译正确）
function getMainAppI18n() {
  if (typeof window !== 'undefined' && (window as any).__MAIN_APP_I18N__) {
    return (window as any).__MAIN_APP_I18N__;
  }
  return null;
}

// 使用主应用 i18n 实例进行翻译
function translateWithMainI18n(key: string): string | null {
  const mainAppI18n = getMainAppI18n();
  if (mainAppI18n && mainAppI18n.global) {
    const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
    const messages = mainAppI18n.global.getLocaleMessage(currentLocale);

    // 直接访问消息对象，确保能访问到已合并的语言包
    if (key in messages) {
      const value = messages[key];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      } else if (typeof value === 'object' && value !== null && '_' in value && typeof value._ === 'string') {
        // 如果返回的是对象且包含 _ 键，使用 _ 键的值（用于处理父键同时有子键的情况）
        return value._;
      } else if (typeof value === 'function') {
        try {
          const result = value({ normalize: (arr: any[]) => arr[0] });
          if (typeof result === 'string' && result.trim() !== '') {
            return result;
          }
        } catch {
          // 如果函数调用失败，继续使用其他方法
        }
      }
    }

    // 如果直接访问失败，使用 te 和 t
    if (mainAppI18n.global.te(key, currentLocale)) {
      const translated = mainAppI18n.global.t(key, currentLocale);
      // 如果返回的是对象且包含 _ 键，使用 _ 键的值（用于处理父键同时有子键的情况）
      if (translated && typeof translated === 'object' && translated !== null && '_' in translated && typeof translated._ === 'string') {
        return translated._;
      }
      if (translated && typeof translated === 'string' && translated !== key && translated.trim() !== '') {
        return translated;
      }
    }
  }
  return null;
}

// 获取标签的国际化文本
function getTabLabel(item: ProcessItem): string {
  // 优先级 1: 检查 meta.label 是否是 i18n key（包含 '.' 或 'menu.' 前缀）
  // 如果是 i18n key，尝试翻译；否则直接使用
  if (typeof item.meta?.label === 'string' && item.meta.label.length > 0) {
    const label = item.meta.label;
    // 检查是否是 i18n key（包含 '.' 或 'menu.' 前缀）
    const isI18nKey = label.includes('.') || label.startsWith('menu.');
    if (isI18nKey) {
      // 优先使用主应用的 i18n 实例进行翻译
      const mainTranslated = translateWithMainI18n(label);
      if (mainTranslated) {
        return mainTranslated;
      }
      // 如果主应用翻译失败，尝试使用子应用的 t() 函数
      if (te(label)) {
        const translated = t(label);
        if (translated && translated !== label) {
          return translated;
        }
      }
      // 如果翻译失败，继续使用其他优先级
    } else {
      // 不是 i18n key，直接使用
      return label;
    }
  }

  // 优先级 2: 如果没有 label，尝试从 manifest 获取并翻译
  const app = getCurrentAppFromPath(item.path);
  const manifestRoute = getManifestRoute(app, item.path);

  if (manifestRoute?.tab?.labelKey) {
    const key = manifestRoute.tab.labelKey;
    // 优先使用主应用的 i18n 实例进行翻译
    const mainTranslated = translateWithMainI18n(key);
    if (mainTranslated) {
      return mainTranslated;
    }
    // 如果主应用翻译失败，尝试使用子应用的 t() 函数
    if (te(key)) {
      return t(key);
    }
  }

  if (manifestRoute?.labelKey) {
    const key = manifestRoute.labelKey;
    // 优先使用主应用的 i18n 实例进行翻译
    const mainTranslated = translateWithMainI18n(key);
    if (mainTranslated) {
      return mainTranslated;
    }
    // 如果主应用翻译失败，尝试使用子应用的 t() 函数
    if (te(key)) {
      return t(key);
    }
  }

  // 优先级 3: 尝试从 meta.labelKey 或 meta.hostLabelKey 翻译
  const metaLabelKey =
    typeof item.meta?.labelKey === 'string' && item.meta.labelKey.length > 0
      ? item.meta.labelKey
      : typeof item.meta?.hostLabelKey === 'string'
      ? item.meta.hostLabelKey
      : undefined;

  if (metaLabelKey) {
    // 优先使用主应用的 i18n 实例进行翻译
    const mainTranslated = translateWithMainI18n(metaLabelKey);
    if (mainTranslated) {
      return mainTranslated;
    }
    // 如果主应用翻译失败，尝试使用子应用的 t() 函数
    if (te(metaLabelKey)) {
      return t(metaLabelKey);
    }
  }

  // 优先级 4: 回退到其他字段
  return item.meta?.title || item.name || item.path;
}

// 返回上一页（在当前应用内）
function toBack() {
  // 参考 cool-admin-vue-7.x 的实现：直接返回上一页
  // 如果有历史记录，则返回；否则会自然回到首页
  if (window.history.length > 1) {
    router.back();
  } else {
    // 如果没有历史记录，回到当前应用首页
    const currentApp = getCurrentAppFromPath(route.path);
    const homePath = getAppHomePath(currentApp);
    router.push(homePath);
  }
}

// 刷新当前路由（通过事件总线）
function toRefresh() {
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.emit('view.refresh');
  }
}

// 判断当前是否在首页
const isOnHomePage = computed(() => {
  // 检查路由 matched 中是否有 isHome 标记（因为 isHome 可能在子路由的 meta 中）
  const hasIsHome = route.matched.some(record => record.meta?.isHome === true);
  if (hasIsHome) {
    return true;
  }

  // 检查当前路径是否是应用的首页路径
  const currentApp = getCurrentAppFromPath(route.path);
  const homePath = getAppHomePath(currentApp);
  const normalizedCurrentPath = route.path.replace(/\/+$/, '') || '/';
  const normalizedHomePath = homePath.replace(/\/+$/, '') || '/';

  // 对于主应用，还需要检查 /overview 路径（兼容旧路径）
  if (currentApp === 'main') {
    const isMainHome = normalizedCurrentPath === '/workbench/overview' ||
                       normalizedCurrentPath === '/overview' ||
                       normalizedCurrentPath === normalizedHomePath;
    if (isMainHome) {
      return true;
    }
  }

  return normalizedCurrentPath === normalizedHomePath;
});

// 回到当前应用首页（使用全局配置，包含所有子应用）
function toHome() {
  const currentApp = getCurrentAppFromPath(route.path);
  const homePath = getAppHomePath(currentApp);

  // 仅当不在首页时执行跳转，避免无效操作
  if (route.path !== homePath) {
    router.push(homePath);
  }
}

// 调整滚动位置
function scrollTo(left: number) {
  scrollerRef.value?.wrapRef?.scrollTo({
    left,
    behavior: 'smooth',
  });
}

function adjustScroll(index: number) {
  const el = itemRefs.value[index];

  if (el && scrollerRef.value?.wrapRef) {
    const container = scrollerRef.value.wrapRef;
    scrollTo(el.offsetLeft - (container.clientWidth + el.clientWidth) / 2);
  }
}

// 点击标签
function onTap(item: any, index: number) {
  adjustScroll(index);

  // 优先使用全局状态更新（通过统一中间层）
  const tabKey = item.fullPath || item.path;
  const currentTabbarList = globalTabbarList.value || [];
  const tab = currentTabbarList.find((tab: any) => tab.key === tabKey);

  if (tab) {
    setGlobalState({
      activeTabKey: tabKey,
      currentApp: tab.appName,
    }, false).catch(() => {
      // 忽略错误
    });
  } else {
    setGlobalState({ activeTabKey: tabKey }, false).catch(() => {
      // 忽略错误
    });
  }

  router.push(item.fullPath);
}

// 删除标签
function onDel(index: number) {
  const item = filteredTabs.value[index];
  if (!item) return;

  const tabPath = item.fullPath || item.path;
  const tabKey = tabPath;

  // 优先使用全局状态关闭 Tab（通过统一中间层）
  // 使用组件中的状态（从监听器获取）
  const currentTabbarList = globalTabbarList.value || [];
  const currentActiveTabKey = globalActiveTabKey.value || '';

  const tabToClose = currentTabbarList.find((tab: any) => tab.key === tabKey);

  // 如果是概览 Tab，关闭后重定向到 /overview
  if (tabToClose && tabToClose.path === '/overview') {
    const newTabList = currentTabbarList.filter((tab: any) => tab.key !== tabKey);
    setGlobalState({
      tabbarList: newTabList,
      activeTabKey: '/overview',
      currentApp: 'main-app',
    }, false).then(() => {
      router.push('/overview').catch(() => {});
    }).catch(() => {
      // 忽略错误
    });
    return;
  }

  // 其他 Tab 正常关闭
  const newTabList = currentTabbarList.filter((tab: any) => tab.key !== tabKey);
  const newActiveKey = currentActiveTabKey === tabKey
    ? (newTabList[newTabList.length - 1]?.key || '')
    : currentActiveTabKey;

  setGlobalState({
    tabbarList: newTabList,
    activeTabKey: newActiveKey,
  }, false).then(() => {
    // 如果删除的是当前激活标签，跳转到最后一个标签或当前应用的首页
    if (currentActiveTabKey === tabKey) {
      const lastTab = newTabList[newTabList.length - 1];
      if (lastTab) {
        router.push(lastTab.path).catch(() => {});
      } else {
        // 没有剩余标签时，跳转到当前应用的首页
        const currentApp = getCurrentAppFromPath(route.path);
        const homePath = getAppHomePath(currentApp);
        router.push(homePath).catch(() => {});
      }
    }
  }).catch(() => {
    // 忽略错误，继续使用 processStore
  });

  // 兼容性：使用 processStore（过渡期）
  const globalIndex = processStore.list.findIndex((t) => t.fullPath === item.fullPath);
  if (globalIndex > -1) {
    processStore.remove(globalIndex);
  }

  // 如果删除的是当前激活标签，跳转到最后一个标签或当前应用的首页
  if (item.active) {
    const last = filteredTabs.value[filteredTabs.value.length - 1];
    if (last) {
      router.push(last.fullPath);
    } else {
      // 没有剩余标签时，跳转到当前应用的首页
      const currentApp = getCurrentAppFromPath(route.path);
      const homePath = getAppHomePath(currentApp);
      router.push(homePath);
    }
  }
}

// 标签页操作菜单命令
function handleTabCommand(command: string) {
  const currentApp = getCurrentAppFromPath(route.path);
  const currentPath = route.path;

  switch (command) {
    case 'pin':
      // 固定/取消固定当前标签
      if (currentTab.value) {
        processStore.togglePin(currentTab.value.fullPath);
      }
      break;

    case 'close-left':
      // 关闭左侧标签（只在当前应用内）
      if (currentTab.value) {
        const closed = processStore.closeLeft(currentTab.value.fullPath, currentApp);
        if (closed && currentTabIndex.value > 0) {
          // 如果关闭了左侧标签，确保当前标签可见
          const newIndex = filteredTabs.value.findIndex((tab) => tab.path === currentPath);
          if (newIndex >= 0) {
            adjustScroll(newIndex);
          }
        }
      }
      break;

    case 'close-right':
      // 关闭右侧标签（只在当前应用内）
      if (currentTab.value) {
        processStore.closeRight(currentTab.value.fullPath, currentApp);
      }
      break;

    case 'close-other':
      // 关闭其他标签（只在当前应用内）
      if (currentTab.value) {
        processStore.closeOthers(currentTab.value.fullPath, currentApp);
      }
      break;

    case 'close-all': {
      // 关闭所有标签（只在当前应用内）
      // 优先使用全局状态更新（通过统一中间层）
      const currentTabbarList = globalTabbarList.value || [];
      const newTabList = currentTabbarList.filter((tab: any) => tab.appName !== currentApp);
      const homePath = getAppHomePath(currentApp);

      // 同时更新 processStore（兼容性处理）
      processStore.closeAll(currentApp);

      // 立即更新本地响应式变量（确保组件立即看到更新，不等待全局状态监听器）
      globalTabbarList.value = newTabList;
      globalActiveTabKey.value = homePath;

      // 更新全局状态（同步到其他应用）
      setGlobalState({
        tabbarList: newTabList,
        activeTabKey: homePath,
        currentApp: currentApp,
      }, false).then(() => {
        // 等待响应式更新完成后再跳转
        nextTick(() => {
          router.push(homePath).catch(() => {});
        });
      }).catch(() => {
        // 如果全局状态更新失败，仍然跳转（本地状态已经更新）
        nextTick(() => {
          router.push(homePath).catch(() => {});
        });
      });
      break;
    }
  }
}

// 右键菜单
function openContextMenu(_e: MouseEvent, item: ProcessItem, _index: number) {
  const isCurrentTab = item.path === route.path;

  BtcConfirm(t('common.tip'), {
    type: 'warning'
  }).catch(() => {
    if (isCurrentTab) {
      processStore.close();
      const last = filteredTabs.value[filteredTabs.value.length - 1];
      router.push(last ? last.fullPath : '/');
    } else {
      const currentApp = getCurrentAppFromPath(route.path);
      processStore.set(
        processStore.list.filter(
          (e) => e.fullPath === item.fullPath || e.app !== currentApp
        )
      );
    }
  });
}

// 监听路由变化，调整滚动位置
watch(
  () => route.path,
  (val) => {
    const index = filteredTabs.value.findIndex((e) => e.fullPath === val);
    if (index >= 0) {
      adjustScroll(index);
    }
  }
);
</script>

<style lang="scss" scoped>
.app-process {
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 10px; // 统一左右 padding，确保最右侧按钮有间距
  user-select: none;
  background-color: var(--btc-surface-panel);
  backdrop-filter: blur(var(--btc-effect-blur));
  overflow: hidden;
  height: 39px; // 与面包屑保持一致的高度
  width: 100% !important; // 使用 !important 防止被覆盖，确保宽度稳定
  box-sizing: border-box !important; // 使用 !important 防止被覆盖，确保边框包含在宽度内
  border-bottom: 1px solid var(--btc-border-muted);

  &__op {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    padding: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    gap: 5px !important; // 使用 gap 统一间距，使用 !important 确保优先级

    li {
      display: flex;
      flex-wrap: wrap;
    }
  }

  &__container {
    height: 100%;
    flex: 1;
    position: relative;
    margin: 0 5px;
  }

  &__scroller {
    height: 40px;
    width: 100%;
    white-space: nowrap;
    position: absolute;
    left: 0;
    top: 0;
  }

  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    height: 26px;
    padding: 0 8px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    border-radius: var(--el-border-radius-base);
    margin-right: 5px;
    border: 1px solid var(--el-fill-color-dark);
    background-color: var(--el-bg-color);

    .close {
      width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition:
        width 0.2s ease-in-out,
        background-color 0.2s ease-in-out;
      font-size: 14px;
      border-radius: 4px;
      opacity: 0;
      cursor: pointer;
      color: var(--el-text-color-secondary);

      // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
      @media (hover: hover) {
        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }

      // 触摸设备使用 :active 样式（点击时显示反馈）
      @media (hover: none) {
        &:active {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
    }

    .tab-icon {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-right: 6px;
      color: inherit;
    }

    .label {
      font-size: 12px;
      line-height: 1;
    }

    &:last-child {
      margin-right: 0;
    }

    // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
    @media (hover: hover) {
      &:hover:not(.active) {
        background-color: var(--el-fill-color-light);
      }
    }

    // 触摸设备使用 :active 样式（点击时显示反馈）
    @media (hover: none) {
      &:active:not(.active) {
        background-color: var(--el-fill-color-light);
      }
    }

    &.active {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: #fff;

      .close {
        color: #fff;
        // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
        @media (hover: hover) {
          &:hover {
            background-color: rgba(255, 255, 255, 0.3) !important;
          }
        }
        // 触摸设备使用 :active 样式（点击时显示反馈）
        @media (hover: none) {
          &:active {
            background-color: rgba(255, 255, 255, 0.3) !important;
          }
        }
      }
    }

    // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
    @media (hover: hover) {
      &:hover,
      &.active {
        .close {
          margin-left: 10px;
          margin-right: -2px;
          width: 14px;
          opacity: 1;
        }
      }
    }

    // 触摸设备：active 状态也显示关闭按钮
    @media (hover: none) {
      &:active,
      &.active {
        .close {
          margin-left: 10px;
          margin-right: -2px;
          width: 14px;
          opacity: 1;
        }
      }
    }
  }

  // 标签页风格：tab-default
  &.tab-default {
    display: flex;
    align-items: center;
  }

  // 标签页风格：tab-card
  &.tab-card {
    border-bottom: 1px solid var(--el-border-color);

    .app-process__item {
      border-radius: calc(var(--custom-radius) / 2.5 + 2px);
    }
  }

  // 标签页风格：tab-google
  &.tab-google {
    padding: 5px 20px 0;
    border-bottom: 1px solid var(--el-border-color);

    // 确保右侧操作按钮组有右边距
    .app-process__op:last-of-type {
      margin-right: 0; // 父容器已有 padding-right: 20px
    }

    .app-process__list {
      padding-left: 5px;
    }

    .app-process__item {
      position: relative;
      height: 37px !important;
      line-height: 37px !important;
      border: none !important;
      border-radius: calc(var(--custom-radius) / 2.5 + 4px) !important;
      margin-right: 0;

      &::before,
      &::after {
        position: absolute;
        bottom: 0;
        width: 20px;
        height: 20px;
        content: '';
        border-radius: 50%;
        box-shadow: 0 0 0 30px transparent;
      }

      &::before {
        left: -20px;
        clip-path: inset(50% -10px 0 50%);
      }

      &::after {
        right: -20px;
        clip-path: inset(50% 50% 0 -10px);
      }

      // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
      @media (hover: hover) {
        &:hover:not(.active) {
          color: var(--el-text-color-regular) !important;
          background-color: var(--el-fill-color-light) !important;
          border-bottom: 1px solid var(--el-bg-color) !important;
          border-radius: calc(var(--custom-radius) / 2.5 + 4px) !important;
        }
      }

      // 触摸设备使用 :active 样式（点击时显示反馈）
      @media (hover: none) {
        &:active:not(.active) {
          color: var(--el-text-color-regular) !important;
          background-color: var(--el-fill-color-light) !important;
          border-bottom: 1px solid var(--el-bg-color) !important;
          border-radius: calc(var(--custom-radius) / 2.5 + 4px) !important;
        }
      }

      &.active {
        color: var(--el-color-primary) !important;
        background-color: var(--el-color-primary-light-9) !important;
        border-bottom: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-bottom-left-radius: 0 !important;

        &::before,
        &::after {
          box-shadow: 0 0 0 30px var(--el-color-primary-light-9);
        }
      }
    }
  }
}
</style>

// 深色主题样式（全局样式，不使用 scoped）
<style lang="scss">
html.dark .app-process {
  .app-process__item {
    border-color: var(--btc-border-muted) !important;
    background-color: var(--btc-surface-card) !important;

    // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
    @media (hover: hover) {
      &:hover:not(.active) {
        background-color: var(--el-fill-color-light) !important;
      }
    }

    // 触摸设备使用 :active 样式（点击时显示反馈）
    @media (hover: none) {
      &:active:not(.active) {
        background-color: var(--el-fill-color-light) !important;
      }
    }

    &.active {
      background-color: var(--el-color-primary) !important;
      border-color: var(--el-color-primary) !important;
      color: #fff !important;

      .close {
        // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
        @media (hover: hover) {
          &:hover {
            background-color: rgba(255, 255, 255, 0.3) !important;
          }
        }
        // 触摸设备使用 :active 样式（点击时显示反馈）
        @media (hover: none) {
          &:active {
            background-color: rgba(255, 255, 255, 0.3) !important;
          }
        }
      }
    }

    .close {
      // 关键：只在支持 hover 的设备上应用 hover 样式（触摸设备不会触发）
      @media (hover: hover) {
        &:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      }
      // 触摸设备使用 :active 样式（点击时显示反馈）
      @media (hover: none) {
        &:active {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      }
    }
  }
}
</style>
