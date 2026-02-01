<template>
  <div
    class="app-layout"
    :class="{
      'is-collapse': isCollapse && menuType?.value !== 'top' && menuType?.value !== 'dual-menu',
      'is-full': isFullscreen,
      'menu-type-top': menuType?.value === 'top',
      'menu-type-top-left': menuType?.value === 'top-left',
      'menu-type-dual-menu': menuType?.value === 'dual-menu',
      'is-using-layout-app': isUsingLayoutApp,
    }"
  >
    <!-- 遮罩层（移动端使用） -->
    <div class="app-layout__mask" @click="handleMaskClick"></div>

    <!-- 关键：在 layout-app 环境下，隐藏子应用自己的布局（顶栏、侧边栏等） -->
    <!-- layout-app 会提供共享的布局，子应用只需要渲染内容区域 -->
    <template v-if="!isUsingLayoutApp">
    <!-- 顶栏（包含汉堡菜单、Logo、折叠按钮、搜索、主题、语言、用户） -->
    <div class="app-layout__topbar">
      <Topbar
        v-if="menuType"
        :is-collapse="isCollapse"
        :drawer-visible="drawerVisible"
        :menu-type="menuType?.value || 'left'"
        @toggle-sidebar="toggleSidebar"
        @toggle-drawer="toggleDrawer"
        @open-drawer="openDrawer"
      />
    </div>
    </template>


    <!-- 下方：左侧边栏 + 右侧内容 -->
    <div class="app-layout__body">
      <!-- 关键：在 layout-app 环境下，隐藏子应用自己的侧边栏 -->
      <!-- 左侧边栏（左侧菜单、双栏菜单左侧、混合菜单左侧） -->
      <!-- 关键：使用 keep-alive 缓存菜单组件，避免切换时重新创建 DOM -->
      <div
        v-if="!isUsingLayoutApp && shouldShowSidebar"
        class="app-layout__sidebar"
        :class="{ 'has-dark-menu': isDarkMenuStyle }"
      >
        <keep-alive>
          <Sidebar
            v-if="currentMenuType === 'left'"
            :key="`sidebar-${currentMenuType}`"
            :is-collapse="isCollapse"
            :drawer-visible="drawerVisible"
          />
          <DualMenu
            v-else-if="currentMenuType === 'dual-menu'"
            :key="`dual-menu-${currentMenuType}`"
          />
          <TopLeftSidebar
            v-else-if="currentMenuType === 'top-left'"
            :key="`top-left-${currentMenuType}`"
          />
        </keep-alive>
      </div>

      <!-- 右侧内容 -->
      <div class="app-layout__main">
        <!-- 顶部区域容器（顶栏、tabbar、面包屑的统一容器，提供统一的 10px 间距） -->
        <div class="app-layout__header">
          <!-- Tabbar：始终渲染，内部控制显示/隐藏 -->
          <Process
            :is-fullscreen="isFullscreen"
            @toggle-fullscreen="toggleFullscreen"
          />

          <!-- 面包屑：使用 v-show 控制显示/隐藏，隐藏时不占空间，内容栏自动上移 -->
          <!-- 关键：showCrumbs 使用 ?? 操作符，确保在 undefined 时默认显示（避免初始化时的闪烁） -->
          <div
            v-show="showBreadcrumb && (showCrumbs?.value ?? true)"
            class="app-layout__breadcrumb-wrapper"
          >
            <Breadcrumb />
          </div>
        </div>

        <div
          class="app-layout__content"
          ref="contentRef"
        >
            <!-- 主应用路由视图 -->
            <!-- 关键：直接使用 type 作为判断依据，确保互斥 -->
            <div
              v-if="mountType === 'main-app'"
              class="content-mount content-mount--main-app"
              data-router-view
            >
              <router-view v-slot="{ Component, route }">
                <transition :name="pageTransitionName" mode="out-in">
                  <component v-if="Component && isOpsLogs" :is="Component" :key="route.fullPath" />
                  <keep-alive v-else-if="Component">
                    <component :is="Component" :key="route.fullPath" />
                  </keep-alive>
                </transition>
              </router-view>
            </div>

            <!-- 子应用挂载点 -->
            <!-- 关键：使用 v-show 而不是 v-if，确保容器始终存在于 DOM 中，避免 qiankun 加载时找不到容器 -->
            <!-- 容器始终存在，通过 v-show 控制显示/隐藏，这样 qiankun 在 beforeLoad 时就能找到容器 -->
            <div
              v-show="mountType === 'sub-app'"
              id="subapp-viewport"
              :ref="(el) => { if (el) mountState.subappViewportRef.value = el as HTMLElement | null; }"
              class="content-mount content-mount--sub-app"
              style="display: none;"
            >
            </div>
          </div>
        </div>
      </div>

    <!-- 关键：在 layout-app 环境下，隐藏子应用自己的菜单抽屉 -->
    <!-- layout-app 会提供共享的菜单抽屉 -->
    <MenuDrawer
      v-if="!isUsingLayoutApp"
      v-model:visible="drawerVisible"
      :topbar-height="47"
    />

    <!-- 偏好设置抽屉（用于 layout-app 环境） -->
    <BtcUserSettingDrawer v-model="preferencesDrawerVisible" />

    <!-- 全局 Loading 组件（仅主应用显示） -->
    <!-- 注意：不能使用 v-show，因为 AppLoading 的根节点是 teleport（不是 DOM 元素） -->
    <!-- 使用 v-if 控制组件是否创建，组件内部通过 visible prop 控制显示/隐藏 -->
    <BtcAppLoading
      v-if="shouldShowAppLoading"
      :visible="appLoadingVisible"
      :title="appLoadingTitle"
      :tip="appLoadingTip"
      :is-fail="appLoadingFail"
      :fail-desc="appLoadingFailDesc"
      :timeout="appLoadingTimeout"
      @retry="handleRetryLoading"
      @timeout="handleLoadingTimeout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { mitt } from '@btc/shared-components';
import { useBrowser } from '../../../composables/useBrowser';
import { useSettingsState } from '../../others/btc-user-setting/composables';
import { MenuThemeEnum, MenuTypeEnum } from '../../others/btc-user-setting/config/enums';
import { useContentMount, logger } from '@btc/shared-core';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import MenuDrawer from './menu-drawer/index.vue';
import TopLeftSidebar from './top-left-sidebar/index.vue';
import DualMenu from './dual-menu/index.vue';
import BtcUserSettingDrawer from '../../others/btc-user-setting/components/preferences-drawer.vue';
import { provideContentHeight } from '../../../composables/content-height';
import { getSubApps, getAppBySubdomain } from '@btc/shared-core/configs/app-scanner';
import { getEnvironment } from '@btc/shared-core/configs/unified-env-config';
import BtcAppLoading from '../../loading/app-loading/index.vue';

// 创建事件总线
// 关键：如果全局事件总线已存在（由 layout-app 初始化时创建），则使用它；否则创建新的
let emitter = (window as any).__APP_EMITTER__;
if (!emitter) {
  emitter = mitt();
  // 将事件总线挂载到 window，供其他组件使用
  (window as any).__APP_EMITTER__ = emitter;
}

const route = useRoute();
const isCollapse = ref(false);
const drawerVisible = ref(false);
const preferencesDrawerVisible = ref(false);
const contentRef = ref<HTMLElement | null>(null);
const { register: registerContentHeight, emit: emitContentResize } = provideContentHeight();

// 使用统一的内容挂载状态管理
const mountState = useContentMount();

watch(
  () => contentRef.value,
  (el) => {
    registerContentHeight(el ?? null);
  },
  { immediate: true },
);

const scheduleContentResize = () => {
  nextTick(() => {
    emitContentResize();
  });
};

// 获取设置状态
let showCrumbs: any;
let pageTransition: any;
let menuType: any;
let menuThemeType: any;
let isDark: any;

// 关键：先初始化 menuType 为默认值，确保始终有值
menuType = ref<MenuTypeEnum>(MenuTypeEnum.LEFT);

// 关键：先初始化 showCrumbs 为默认值 true，避免刷新时闪烁
// 这样即使 useSettingsState() 初始化需要时间，面包屑也会先显示，然后根据实际设置值更新
const defaultShowCrumbs = ref(true);
showCrumbs = defaultShowCrumbs;

try {
  const settingsState = useSettingsState();
  // 关键：确保 settingsState.showCrumbs 存在且有效，否则使用默认值
  if (settingsState.showCrumbs && typeof settingsState.showCrumbs.value !== 'undefined') {
    showCrumbs = settingsState.showCrumbs;
  } else {
    // 如果 settingsState.showCrumbs 无效，保持使用默认值
    showCrumbs = defaultShowCrumbs;
  }
  pageTransition = settingsState.pageTransition;
  // 关键：如果 settingsState.menuType 存在且有效，使用它；否则保持默认值
  if (settingsState.menuType) {
    const validMenuTypes = [MenuTypeEnum.LEFT, MenuTypeEnum.TOP, MenuTypeEnum.TOP_LEFT, MenuTypeEnum.DUAL_MENU];
    const menuTypeValue = settingsState.menuType?.value;
    if (menuTypeValue && validMenuTypes.includes(menuTypeValue)) {
  menuType = settingsState.menuType;
    } else {
      // 如果值无效，更新为 MenuTypeEnum.LEFT
      if (typeof settingsState.menuType.value !== 'undefined') {
        settingsState.menuType.value = MenuTypeEnum.LEFT;
        menuType = settingsState.menuType;
    }
      // 否则保持使用默认的 ref(MenuTypeEnum.LEFT)
  }
  }
  menuThemeType = settingsState.menuThemeType;
  isDark = settingsState.isDark;
} catch (error) {
  // 使用默认值
  console.warn('[AppLayout] useSettingsState 初始化失败，使用默认值', error);
  showCrumbs = ref(true);
  pageTransition = ref('fade');
  // menuType 已经在上面初始化为 ref('left')，不需要重新赋值
  menuThemeType = ref(null);
  isDark = ref(false);
}

// 防御性检查：确保 menuType 始终有有效值
if (!menuType) {
  menuType = ref<MenuTypeEnum>(MenuTypeEnum.LEFT);
} else {
  const menuTypeValue = menuType.value;
  const validMenuTypes = [MenuTypeEnum.LEFT, MenuTypeEnum.TOP, MenuTypeEnum.TOP_LEFT, MenuTypeEnum.DUAL_MENU];
  // 如果值不在有效值列表中，设置为 MenuTypeEnum.LEFT
  if (!menuTypeValue || !validMenuTypes.includes(menuTypeValue)) {
    menuType.value = MenuTypeEnum.LEFT;
  }
}

// 最终验证：确保 menuType 是一个有效的 ref
if (typeof menuType.value === 'undefined') {
  logger.error('[AppLayout] menuType 最终验证失败，强制设置为 ref(MenuTypeEnum.LEFT)');
  menuType = ref<MenuTypeEnum>(MenuTypeEnum.LEFT);
}

// 计算属性：获取当前菜单类型（简化模板访问）
const currentMenuType = computed(() => {
  const mt = menuType?.value;
  return mt || 'left';
});

const VALID_MENU_TYPES = [
  MenuTypeEnum.LEFT,
  MenuTypeEnum.TOP,
  MenuTypeEnum.TOP_LEFT,
  MenuTypeEnum.DUAL_MENU,
] as const;

// 关键：menuType 的值校验/兜底放到 watch 中，避免 computed 中“写状态”导致抖动与不可预期联动
watch(
  () => menuType?.value,
  (val) => {
    if (!menuType) return;
    if (!val || !VALID_MENU_TYPES.includes(val as any)) {
      menuType.value = MenuTypeEnum.LEFT;
    }
  },
  { immediate: true },
);

// 计算属性：判断是否应该显示侧边栏（纯函数，无副作用）
// - left / dual-menu / top-left：有侧边栏
// - top：无侧边栏（顶部菜单在 Topbar 内渲染）
const shouldShowSidebar = computed(() => {
  const mt = currentMenuType.value;
  const result = mt === 'left' || mt === 'dual-menu' || mt === 'top-left';
  return result;
});

// 判断是否为深色菜单风格
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 监听页面切换动画变化
function handlePageTransitionChange(_event: CustomEvent) {
  // 动画名称会自动通过 computed 更新
}

const isFullscreen = ref(false);
const viewKey = ref(1); // 手动刷新时递增
const isOpsLogs = computed(() => route.path.startsWith('/admin/ops/logs'));

// 浏览器信息
const { browser, onScreenChange } = useBrowser();

// 跟踪之前的 isMini 状态，只在真正切换移动端/桌面端时才改变折叠状态
let prevIsMini = browser.isMini;

// 关键：判断是否是 layout-app 自己运行
const isLayoutAppSelf = computed(() => {
  if (typeof window === 'undefined') return false;
  // 检查 __IS_LAYOUT_APP__ 标志
  if ((window as any).__IS_LAYOUT_APP__) {
    return true;
  }
  // 检查 hostname 是否是 layout-app 的域名
  const env = getEnvironment();
  const hostname = window.location.hostname;
  const port = window.location.port || '';
  
  // 使用统一的环境检测
  if (env === 'production' && hostname === 'layout.bellis.com.cn') {
    return true;
  }
  if (env === 'test' && hostname === 'layout.test.bellis.com.cn') {
    return true;
  }
  if (env === 'preview' && port === '4192') {
    return true;
  }
  if (env === 'development' && port === '4188') {
    return true;
  }
  return false;
});

// 关键：判断是否正在使用 layout-app（通过 __USE_LAYOUT_APP__ 标志）
// 但是，如果当前是 layout-app 自己运行，应该返回 false（因为 layout-app 需要渲染自己的 Topbar/MenuDrawer）
const isUsingLayoutApp = computed(() => {
  // 如果当前是 layout-app 自己，返回 false
  if (isLayoutAppSelf.value) {
    return false;
  }
  const useLayoutApp = typeof window !== 'undefined' ? !!(window as any).__USE_LAYOUT_APP__ : false;
  return useLayoutApp;
});

// 判断是否为主应用（用于其他逻辑，如刷新视图、面包屑等）
const isMainApp = computed(() => {
  return mountState.type.value === 'main-app';
});

// Loading 相关状态（仅主应用使用，通过全局 window 对象访问）
const appLoadingState = ref<{
  loadingApp: any;
  loadingVisible: any;
  loadingFail: any;
  loadingFailDesc: any;
  showLoading: any;
  hideLoading: any;
  markLoadingFail: any;
  retryLoadingApp: any;
} | null>(null);

// 从全局 window 对象获取 Loading 状态（主应用会暴露）
// 关键：使用 onMounted 和 watch 确保状态能正确获取，因为 __BTC_APP_LOADING__ 可能在组件初始化后才暴露
const initAppLoadingState = () => {
  if (typeof window !== 'undefined') {
    const globalLoading = (window as any).__BTC_APP_LOADING__;
    if (globalLoading && !appLoadingState.value) {
      appLoadingState.value = globalLoading;
    }
  }
};

// 组件挂载时初始化
onMounted(() => {
  initAppLoadingState();
  // 延迟再次检查，确保主应用的 Loading 状态已初始化
  setTimeout(() => {
    initAppLoadingState();
  }, 0);
});

// 监听全局对象的变化（主应用可能在组件初始化后才暴露状态）
watch(
  () => (window as any).__BTC_APP_LOADING__,
  (newVal) => {
    if (newVal && !appLoadingState.value) {
      appLoadingState.value = newVal;
    }
  },
  { immediate: true }
);

// 计算属性：Loading 相关状态
const appLoadingVisible = computed(() => {
  return appLoadingState.value?.loadingVisible?.value ?? false;
});

const appLoadingTitle = computed(() => {
  const app = appLoadingState.value?.loadingApp?.value;
  return app?.title || app?.name || '加载中...';
});

const appLoadingTip = computed(() => {
  const app = appLoadingState.value?.loadingApp?.value;
  return app?.loadingTip || '';
});

const appLoadingFail = computed(() => {
  return appLoadingState.value?.loadingFail?.value ?? false;
});

const appLoadingFailDesc = computed(() => {
  return appLoadingState.value?.loadingFailDesc?.value || '';
});

const appLoadingTimeout = computed(() => {
  const app = appLoadingState.value?.loadingApp?.value;
  return app?.timeout || 10000;
});

// 判断是否应该显示 Loading（仅主应用）
// 关键：只要主应用且 Loading 状态对象已初始化，就允许组件渲染（使用 v-show 控制显示）
const shouldShowAppLoading = computed(() => {
  return isMainApp.value && appLoadingState.value !== null;
});

// Loading 相关事件处理
function handleRetryLoading() {
  if (appLoadingState.value?.retryLoadingApp) {
    appLoadingState.value.retryLoadingApp();
  }
}

function handleLoadingTimeout() {
  if (appLoadingState.value?.markLoadingFail) {
    const title = appLoadingTitle.value || '应用';
    appLoadingState.value.markLoadingFail(`【${title}】加载超时`);
  }
}

// 解包 mountState.type 以便在模板中使用（解决 TypeScript 类型检查问题）
const mountType = computed(() => mountState.type.value);

// 跟踪之前的 isMainApp 状态，用于检测跨应用切换
const prevIsMainApp = ref(false);

// 页面切换动画名称（需要在 isMainApp 定义后）
const pageTransitionName = computed(() => {
  const path = route.path || '';

  // 检测跨应用切换（从主应用切换到子应用，或反之）
  const isCrossAppSwitch = prevIsMainApp.value !== isMainApp.value;
  if (isCrossAppSwitch) {
    // 跨应用切换时禁用动画，避免与 v-if 冲突
    prevIsMainApp.value = isMainApp.value;
    return '';
  }

  // 更新状态
  prevIsMainApp.value = isMainApp.value;

  // 日志中心关闭过渡，避免尺寸变化引发观察链
  // 禁用以下页面的动画：
  // - /admin/ops/logs (日志中心主页)
  // - /admin/ops/logs/operation (操作日志页面)
  // - /admin/ops/logs/request (请求日志页面)
  if (path.startsWith('/admin/ops/logs')) {
    return '';
  }
  const transition = pageTransition.value || 'slide-left';
  return transition || '';
});

// 监听 #subapp-viewport 内容变化（用于触发重新计算）
let subappContentObserver: MutationObserver | null = null;

// 判断是否显示面包屑区域
// 简化逻辑：默认显示面包屑，只有特殊页面（各应用首页、个人信息页面、404等孤立页面）才隐藏
// 关键：采用"白名单"方式，默认返回 true，只有明确判断为特殊页面时才返回 false
// 优化：使用稳定的判断方式，避免因状态初始化时机导致的闪烁
// 使用稳定的判断顺序：先判断稳定的条件（路径、子域名、pathPrefix），最后判断依赖状态的条件
const showBreadcrumb = computed(() => {
  // 关键：优先使用 window.location.pathname，因为它不受路由初始化时机影响
  // 在页面刷新时，window.location.pathname 已经有正确的值，而 route.path 可能还在初始化
  const locationPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const routePath = route?.path || '';

  // 优先使用 locationPath，如果不存在则使用 routePath
  const path = locationPath || routePath;

  // 如果 path 还没有初始化，默认显示面包屑（避免初始化时的闪烁）
  if (!path) {
    return true;
  }

  // 规范化路径（移除尾部斜杠，但保留根路径）
  const normalizedPath = path.replace(/\/+$/, '') || '/';

  // 1. 如果路由 meta 中明确标记为首页或404，不显示面包屑
  // 关键：只有当 route 对象存在且 meta 明确存在时才判断，避免初始化时的不稳定
  // 使用路由路径优先判断，因为路径判断更稳定，不受路由对象初始化时机影响
  // 只有在路径判断无法确定时，才依赖 route.meta（因为它可能在初始化时不稳定）
  if (route?.meta && (route.meta.isHome === true || route.meta.is404 === true)) {
    return false;
  }

  // 2. 404 页面（孤立页面）- 通过路径判断
  if (normalizedPath === '/404') {
    return false;
  }

  // 3. 判断是否为各应用首页
  // 关键优化：优先使用稳定的判断方式（路径匹配、子域名判断），这些在页面加载时就已经确定
  // 最后才判断依赖 mountState.type.value 的条件，避免因状态初始化时机导致的闪烁

  // 4.1 开发/预览环境：子应用首页（通过 pathPrefix 精确匹配）
  // 关键：这个判断不依赖 mountState，只依赖路径，所以很稳定，应该优先判断
  try {
    const subApps = getSubApps();
    if (subApps.length > 0) {
      for (const app of subApps) {
        const normalizedPathPrefix = app.pathPrefix.replace(/\/+$/, '') || app.pathPrefix;
        // 精确匹配 pathPrefix（如 /admin 匹配 /admin，但 /admin/xxx 不匹配）
        if (normalizedPath === normalizedPathPrefix) {
          return false;
        }
      }
    }
  } catch (error) {
    // 出错时继续执行，默认显示面包屑
  }

  // 4.2 生产环境：子应用首页（通过子域名识别）- 最稳定的判断方式
  if (normalizedPath === '/' && typeof window !== 'undefined') {
    try {
      const hostname = window.location.hostname;
      const appBySubdomain = getAppBySubdomain(hostname);
      if (appBySubdomain && appBySubdomain.type === 'sub') {
        return false;
      }
    } catch (error) {
      // 出错时继续执行，默认显示面包屑
    }
  }

  // 4.3 主应用首页（系统应用）：路径为 / 且是主应用
  // 关键：这个判断依赖 mountState.type.value，可能初始化有延迟
  // 优化策略：只有在 mountState.type.value 有明确值且为 'main-app' 时才判断为首页
  // 如果 mountState.type.value 还没有初始化，默认显示面包屑（避免初始化时闪烁）
  // 注意：这个判断放在最后，因为它是唯一可能不稳定的判断
  if (normalizedPath === '/') {
    // 只有在 mountState.type.value 有明确值且是主应用时，才判断为首页
    const mountType = mountState.type.value;
    if (mountType === 'main-app') {
      return false;
    }
    // 如果 mountState.type.value 还没有值或不是 'main-app'，继续执行，最终返回 true
    // 这样可以避免在 mountState.type.value 初始化过程中出现闪烁
  }

  // 默认显示面包屑（所有其他页面）
  return true;
});

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
  scheduleContentResize();
};

const toggleDrawer = () => {
  // 关键：如果正在使用 layout-app，不要处理抽屉事件（layout-app 会处理）
  // 这可以避免在 qiankun 模式下卸载时触发已卸载组件的更新
  if (isUsingLayoutApp.value) {
    return;
  }

  drawerVisible.value = !drawerVisible.value;
  scheduleContentResize();
};

const openDrawer = () => {
  // 关键：如果正在使用 layout-app，不要处理抽屉事件（layout-app 会处理）
  // 这可以避免在 qiankun 模式下卸载时触发已卸载组件的更新
  if (isUsingLayoutApp.value) {
    return;
  }

  if (!drawerVisible.value) {
    drawerVisible.value = true;
  }
  scheduleContentResize();
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  scheduleContentResize();
};

// 遮罩层点击事件（移动端关闭侧边栏）
const handleMaskClick = () => {
  isCollapse.value = true;
  scheduleContentResize();
};

// 刷新视图
function refreshView() {
  if (isMainApp.value) {
    viewKey.value += 1; // 主应用视图刷新
  } else {
    // 子应用视图刷新（通过事件通知子应用）
    emitter.emit('subapp.refresh');
  }
  scheduleContentResize();
}

// 设置 MutationObserver（监听子应用挂载点内容变化，触发重新计算）
const setupMutationObserver = () => {
  // 先断开旧的观察器（如果存在）
  if (subappContentObserver) {
    subappContentObserver.disconnect();
    subappContentObserver = null;
  }

  nextTick(() => {
    const container = mountState.subappViewportRef.value;
    if (container && (container as HTMLElement).isConnected) {
      // 使用 MutationObserver 监听子应用挂载点内容变化
      subappContentObserver = new MutationObserver(() => {
        // 内容变化时，触发重新计算（通过访问 computed 属性）
        // 这会让 useContentMount 中的 type 重新计算
        void mountState.type.value;
      });

      subappContentObserver.observe(container, {
        childList: true,
        subtree: true,
      });
    }
  });
};

onMounted(() => {
  // 关键：再次确认事件总线已正确设置（防止在组件挂载时事件总线被覆盖）
  if (!(window as any).__APP_EMITTER__) {
    (window as any).__APP_EMITTER__ = emitter;
    if (import.meta.env.DEV) {
      console.info('[AppLayout] onMounted: 重新设置事件总线到 window.__APP_EMITTER__');
    }
  }

  emitter.on('view.refresh', refreshView);
  // 关键：监听偏好设置抽屉打开事件（用于 layout-app 环境）
  emitter.on('open-preferences-drawer', () => {
    preferencesDrawerVisible.value = true;
    if (import.meta.env.DEV) {
      console.info('[AppLayout] 收到 open-preferences-drawer 事件，打开偏好设置抽屉');
    }
  });
  // eslint-disable-next-line no-undef
  window.addEventListener('page-transition-change', handlePageTransitionChange as EventListener);
  // 关键：偏好设置（子应用环境）切换菜单布局/菜单风格时，需要让 layout-app 立即响应
  // useSettingsHandlers 会派发 window 事件，这里作为兜底消费，避免“写入了 settings，但左侧菜单不切换”
  const handleMenuLayoutChange = ((event: Event) => {
    try {
      const custom = event as CustomEvent<{ layout?: MenuTypeEnum }>;
      const nextLayout = custom.detail?.layout;
      if (!nextLayout) return;
      const validMenuTypes = [MenuTypeEnum.LEFT, MenuTypeEnum.TOP, MenuTypeEnum.TOP_LEFT, MenuTypeEnum.DUAL_MENU];
      if (!validMenuTypes.includes(nextLayout)) return;
      if (menuType?.value !== nextLayout) {
        menuType.value = nextLayout;
        scheduleContentResize();
      }
    } catch {
      // 静默失败
    }
  // eslint-disable-next-line no-undef
  }) as EventListener;

  const handleMenuStyleChange = ((event: Event) => {
    try {
      const custom = event as CustomEvent<{ style?: MenuThemeEnum }>;
      const nextStyle = custom.detail?.style;
      if (!nextStyle) return;
      if (menuThemeType?.value !== nextStyle) {
        menuThemeType.value = nextStyle;
      }
    } catch {
      // 静默失败
    }
  // eslint-disable-next-line no-undef
  }) as EventListener;

  window.addEventListener('menu-layout-change', handleMenuLayoutChange);
  window.addEventListener('menu-style-change', handleMenuStyleChange);

  // 保存引用，卸载时移除
  (window as any).__BTC_APP_LAYOUT_MENU_LAYOUT_CHANGE__ = handleMenuLayoutChange;
  (window as any).__BTC_APP_LAYOUT_MENU_STYLE_CHANGE__ = handleMenuStyleChange;
  // 关键：监听全局偏好设置抽屉打开事件（用于跨应用通信）
  window.addEventListener('open-preferences-drawer', () => {
    preferencesDrawerVisible.value = true;
    if (import.meta.env.DEV) {
      console.info('[AppLayout] 收到 window open-preferences-drawer 事件，打开偏好设置抽屉');
    }
  });

  // 监听屏幕变化，只在移动端/桌面端切换时改变折叠状态
  onScreenChange(() => {
    // 只在 isMini 状态真正改变时才更新折叠状态（从桌面端切换到移动端，或反之）
    if (prevIsMini !== browser.isMini) {
      isCollapse.value = browser.isMini;
      prevIsMini = browser.isMini;
    }
    scheduleContentResize();
  }, true); // immediate = true，立即执行一次，确保初始状态正确

  // 设置 MutationObserver 监听子应用挂载点内容变化
  setupMutationObserver();

  // 监听 sidebar 渲染状态，输出调试信息（构建产物中也输出）
  stopSidebarWatch = watch(
    [() => isUsingLayoutApp.value, () => shouldShowSidebar.value, () => menuType?.value],
    ([isUsing, shouldShow, menuTypeValue]) => {
      const shouldRender = !isUsing && shouldShow;
      if (!shouldRender && typeof window !== 'undefined' && !(window as any).__SIDEBAR_NOT_RENDERED_LOGGED__) {
        console.warn('[AppLayout] Sidebar 未渲染', {
          isUsingLayoutApp: isUsing,
          shouldShowSidebar: shouldShow,
          menuType: menuTypeValue,
          __USE_LAYOUT_APP__: typeof window !== 'undefined' ? (window as any).__USE_LAYOUT_APP__ : undefined,
          __IS_LAYOUT_APP__: typeof window !== 'undefined' ? (window as any).__IS_LAYOUT_APP__ : undefined,
          hostname: typeof window !== 'undefined' ? window.location.hostname : '',
          port: typeof window !== 'undefined' ? window.location.port : ''
        });
        if (typeof window !== 'undefined') {
          (window as any).__SIDEBAR_NOT_RENDERED_LOGGED__ = true;
        }
      }
    },
    { immediate: true }
  );

  // 初始化 prevIsMainApp
  prevIsMainApp.value = isMainApp.value;

  scheduleContentResize();
});

// 保存 watch 停止函数，用于清理
let stopRouteWatch: (() => void) | null = null;
let stopSidebarWatch: (() => void) | null = null;

stopRouteWatch = watch(
  () => route.fullPath,
  async () => {
    // 关键：移除路由变化时的 scheduleContentResize() 调用
    // 路由切换时不应该触发内容区域尺寸重新计算，避免整个布局重新渲染
    // 只有在真正需要时才调用 scheduleContentResize()（如侧边栏折叠、全屏切换等）

    // 路由切换时重新设置 MutationObserver（因为容器可能被 v-show 隐藏和显示）
    // 使用 nextTick 确保 DOM 更新完成后再设置观察器
    await nextTick();
    setupMutationObserver();
  },
);

onUnmounted(() => {
  // 停止所有 watch 监听器
  if (stopRouteWatch) {
    stopRouteWatch();
    stopRouteWatch = null;
  }
  if (stopSidebarWatch) {
    stopSidebarWatch();
    stopSidebarWatch = null;
  }

  emitter.off('view.refresh', refreshView);
  emitter.off('open-preferences-drawer');
  // eslint-disable-next-line no-undef
  window.removeEventListener('page-transition-change', handlePageTransitionChange as EventListener);
  window.removeEventListener('open-preferences-drawer', () => {});
  // 清理偏好设置事件监听
  const menuLayoutListener = (window as any).__BTC_APP_LAYOUT_MENU_LAYOUT_CHANGE__;
  const menuStyleListener = (window as any).__BTC_APP_LAYOUT_MENU_STYLE_CHANGE__;
  if (menuLayoutListener) {
    window.removeEventListener('menu-layout-change', menuLayoutListener);
    delete (window as any).__BTC_APP_LAYOUT_MENU_LAYOUT_CHANGE__;
  }
  if (menuStyleListener) {
    window.removeEventListener('menu-style-change', menuStyleListener);
    delete (window as any).__BTC_APP_LAYOUT_MENU_STYLE_CHANGE__;
  }

  // 清理 subapp-viewport 内容观察器
  if (subappContentObserver) {
    subappContentObserver.disconnect();
    subappContentObserver = null;
  }

  // 关键：在卸载时重置 drawerVisible，避免响应式更新触发已卸载组件的更新
  // 使用 nextTick 确保在卸载完成前不会触发更新
  nextTick(() => {
    try {
      drawerVisible.value = false;
    } catch (error) {
      // 静默处理，卸载时可能已经无法访问响应式对象
    }
  });

  delete (window as any).__APP_EMITTER__;
});
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column; // 上下布局
  height: 100vh;
  width: 100%; // 使用 100% 而不是 100vw，避免滚动条导致裁切（与系统域一致）
  overflow: hidden;
  background-color: var(--bg-color);

  // 顶栏区域
  &__topbar {
    width: 100%;
    flex-shrink: 0;
    z-index: 1000; // 确保顶栏在最上层
    overflow: visible; // 确保内容不被裁切
    position: relative; // 为 z-index 提供定位上下文
  }

  // 下方主体区域（左右布局）
  &__body {
    display: flex;
    flex: 1;
    height: calc(100vh - 47px); // 减去顶栏高度
    width: 100%;
    overflow: hidden;
  }

  &__sidebar {
    width: 255px;
    height: 100%;
    background-color: transparent; // 背景色由菜单风格控制
    transition: width 0.2s ease-in-out;
    overflow: hidden;
    flex-shrink: 0; // 关键：防止侧边栏被压缩，与系统应用保持一致
    border-right: 1px solid var(--el-border-color-extra-light);
    box-sizing: border-box; // 关键：确保 border 包含在宽度内，避免双栏菜单超出

    // 双栏菜单模式：宽度为 255px（与单列菜单宽度一致，保持设计统一）
    // 搜索框宽度会相应调整以匹配双栏菜单宽度
    .menu-type-dual-menu & {
      width: 255px;
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    min-width: 0; // 确保 flex 子元素可以收缩
  }

  // 顶部区域容器（顶栏、tabbar、面包屑的统一容器）
  &__header {
    flex-shrink: 0;
    width: 100%; // 与系统域一致，移除 !important
  }

  // 面包屑包装容器：使用 v-show 控制显示/隐藏
  // 关键：v-show="false" 时元素设置为 display:none，不占空间，内容栏自动上移
  // 显示时正常高度，隐藏时完全不占空间，避免布局闪烁
  &__breadcrumb-wrapper {
    // 显示时的高度由内部 Breadcrumb 组件控制（39px）
    // v-show 隐藏时元素不占空间，无需固定高度
    overflow: hidden;
  }

  &__mask {
    position: fixed;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.5);
    height: 100%;
    width: 100%;
    z-index: 999;
    display: none;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 10px; // 统一四周间距（包含与 header 之间的间距）
    width: calc(100% - 20px); // 减去左右 margin（与系统域一致，移除 !important）
    box-sizing: border-box;
    border-radius: 6px;
    position: relative;
    background-color: var(--el-bg-color);
    min-height: 0;

    // 当不显示面包屑时，内容区域会自动占据 app-layout__main 的剩余高度
    // 由于 app-layout__main 使用 flex 布局，app-layout__content 使用 flex: 1
    // 当 app-layout__header 高度减少时（面包屑不显示），app-layout__content 会自动占据更多空间
    // 不需要额外的样式调整，flex 布局会自动处理

    // 主应用路由视图容器（占据内容区域完整尺寸）
    // 关键：content-mount--main-app 需要是 flex 容器，才能正确占据 app-layout__content 的空间
    .content-mount--main-app {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
      position: relative;
    }

    // 主应用路由视图（占据内容区域完整尺寸）
    // 关键：router-view 在 content-mount--main-app 内部，需要使用正确的选择器
    :deep(.content-mount--main-app > router-view) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;

      // 确保 router-view 内部渲染的页面组件根元素占据完整高度
      // 只对页面组件根元素设置 flex: 1，不会影响内部组件（如 btc-crud-row）
      > * {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
        flex: 1; // 页面组件根元素需要占据完整高度
      }
    }
    
    // 错误页面（404、403等）特殊处理：直接渲染，不经过 container
    // 错误页面应该占据完整高度并垂直居中
    :deep(.content-mount--main-app > router-view > .page-error),
    :deep(.content-mount--main-app > router-view > .page-404),
    :deep(.content-mount--main-app > router-view > [class*="page-error"]),
    :deep(.content-mount--main-app > router-view > [class*="page-404"]) {
      height: 100% !important;
      min-height: 100% !important;
      flex: 1 !important;
      justify-content: center !important;
      align-items: center !important;
    }

    // 文档应用 iframe（占据内容区域完整尺寸）
    :deep(.docs-iframe-wrapper) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    // 子应用挂载点（占据内容区域完整尺寸）
    #subapp-viewport {
      position: static !important;
      display: flex;
      flex-direction: column;
      width: 100% !important; // 使用 !important 防止被覆盖，确保宽度稳定
      height: 100% !important; // 关键：确保高度为 100%
      flex: 1;
      min-height: 0;
      min-width: 0 !important; // 使用 !important 防止被覆盖，确保 flex 子元素可以收缩
      padding: 0 !important;
      box-sizing: border-box !important; // 使用 !important 防止被覆盖，确保宽度计算一致
      background-color: var(--el-bg-color) !important;
      font-size: 0 !important; // 关键：隐藏可能被错误渲染的文本内容
      line-height: 0 !important; // 关键：隐藏可能被错误渲染的文本内容
    }

    :deep(#subapp-viewport > [data-qiankun]) {
      flex: 1 !important; // 使用 !important 确保占据完整高度
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
      min-width: 0 !important;
      height: 100% !important; // 关键：确保高度为 100%
      width: 100% !important;
      font-size: var(--el-font-size-base) !important; // 恢复字体大小
      line-height: calc(var(--el-font-size-base) * 1.5) !important; // 恢复行高
      // 确保 position 不会影响高度计算
      position: relative !important;
      // 确保 box-sizing 正确
      box-sizing: border-box !important;
    }

    // qiankun 包装器容器（确保高度正确）
    :deep(#subapp-viewport [id^="__qiankun_microapp_wrapper"]) {
      flex: 1 !important;
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
      min-width: 0 !important;
      height: 100% !important;
      width: 100% !important;
    }

    // 当 layout-app 在 qiankun 包装容器内部时，确保 #subapp-viewport 正确显示
    :deep([id^="__qiankun_microapp_wrapper"] #subapp-viewport) {
      position: static !important;
      display: flex !important;
      flex-direction: column !important;
      width: 100% !important;
      height: 100% !important; // 关键：确保高度为 100%
      flex: 1 !important;
      min-height: 0 !important;
      min-width: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      background-color: var(--el-bg-color) !important;
    }

    // 关键：处理直接挂载到 #subapp-viewport 的子应用根元素（layout-app 模式下）
    // 当子应用直接挂载时，根元素（如 .quality-home）直接作为 #subapp-viewport 的子元素
    // 需要确保这些直接子元素有正确的高度
    // 注意：排除 qiankun 包装器，因为它们有自己的样式规则
    :deep(#subapp-viewport > *:not([data-qiankun]):not([id^="__qiankun_microapp_wrapper"])) {
      flex: 1;
      display: flex !important; // 使用 !important 确保样式优先级高于子应用的 scoped 样式
      flex-direction: column;
      min-height: 0;
      min-width: 0;
      height: 100%;
      width: 100%;
    }

    // 关键：确保子应用根元素的直接子元素（如 .strategy-charts）也能正确填充高度
    // 当父元素是 flex column 时，子元素需要设置 min-height: 0 才能正确收缩
    // 使用更具体的选择器，确保样式优先级高于子应用的 scoped 样式
    :deep(#subapp-viewport > *:not([data-qiankun]):not([id^="__qiankun_microapp_wrapper"]) > *) {
      // 关键：确保 flex 子元素能够正确填充高度
      // 如果子元素在子应用的 scoped 样式中设置了 flex: 1，这里确保它有正确的 min-height
      // 这样可以避免 flex 子元素高度为 0 的问题
      min-height: 0;
      // 如果子元素没有设置 flex 属性，默认让它能够填充可用空间
      // 但如果子应用已经设置了 flex: 1，这个不会覆盖它，只是确保 flex-basis 正确
      flex-basis: auto;
    }

    // 子应用的 #app 元素（确保高度正确）
    // 关键：使用更具体的选择器，确保样式优先级高于子应用的 scoped 样式
    // 添加多个层级的选择器，确保覆盖所有可能的 DOM 结构
    :deep(#subapp-viewport #app),
    :deep(#subapp-viewport [data-qiankun] #app),
    :deep(#subapp-viewport [id^="__qiankun_microapp_wrapper"] #app),
    :deep(#subapp-viewport > [data-qiankun] > #app),
    :deep(#subapp-viewport > [id^="__qiankun_microapp_wrapper"] > #app),
    :deep(#subapp-viewport [data-qiankun] > #app),
    :deep(#subapp-viewport [id^="__qiankun_microapp_wrapper"] > #app) {
      flex: 1 !important; // 使用 !important 确保占据完整高度
      display: flex !important;
      flex-direction: column !important;
      min-height: 0 !important;
      min-width: 0 !important;
      height: 100% !important; // 关键：确保高度为 100%
      width: 100% !important;
      box-sizing: border-box !important;
      // 确保 position 不会影响高度计算
      position: relative !important;
      // 确保 overflow 不会影响高度
      overflow: hidden !important;
    }

    // 关键：隐藏 qiankun 注入的 qiankun-head 元素及其所有内容
    // qiankun-head 包含子应用的 script 和 style 标签，不应该作为可见文本显示
    // 使用全局选择器，确保无论 qiankun-head 在哪里都能被隐藏
    :deep(qiankun-head),
    qiankun-head {
      display: none !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
      visibility: hidden !important;
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      opacity: 0 !important;
      pointer-events: none !important;
      font-size: 0 !important;
      line-height: 0 !important;
      // 确保所有子元素也被隐藏
      * {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        font-size: 0 !important;
        line-height: 0 !important;
      }
    }

    // 关键：隐藏可能被错误渲染为文本的脚本和样式内容
    // qiankun 注入的脚本和样式不应该作为文本显示在页面上
    // 如果这些内容被错误地作为文本节点插入到 DOM 中，使用 CSS 隐藏它们
    :deep(#subapp-viewport) {
      // 隐藏所有可能的文本内容（脚本/样式代码）
      // 使用 font-size: 0 和 line-height: 0 确保文本不会显示
      font-size: 0 !important; // 关键：隐藏可能被错误渲染的文本内容
      line-height: 0 !important; // 关键：隐藏可能被错误渲染的文本内容
      // 确保文本节点不显示
      white-space: nowrap !important;
      text-indent: -9999px !important;
      
      // 恢复子元素的字体设置（只针对实际的 DOM 元素）
      > * {
        font-size: var(--el-font-size-base) !important; // 恢复字体大小
        line-height: calc(var(--el-font-size-base) * 1.5) !important; // 恢复行高
        white-space: normal !important;
        text-indent: 0 !important;
      }
    }
    
    // 特别处理 data-qiankun 容器中的文本内容
    :deep(#subapp-viewport > [data-qiankun]) {
      // 确保容器本身不显示文本
      font-size: 0 !important;
      line-height: 0 !important;
      white-space: nowrap !important;
      text-indent: -9999px !important;
      
      // 恢复子元素的字体设置（只针对实际的 DOM 元素）
      > * {
        font-size: var(--el-font-size-base) !important;
        line-height: calc(var(--el-font-size-base) * 1.5) !important;
        white-space: normal !important;
        text-indent: 0 !important;
      }
    }

    // 关键：隐藏 qiankun 注入的 script 和 style 标签（如果它们被错误地渲染为文本）
    // 这些标签应该被 qiankun 正确处理，但如果它们被错误地插入到 DOM 中，需要隐藏它们
    // 使用更广泛的选择器，确保所有可能的 script 和 style 标签都被隐藏
    :deep([data-qiankun] > script),
    :deep([data-qiankun] > style),
    :deep([data-qiankun] script),
    :deep([data-qiankun] style),
    :deep(#subapp-viewport > script),
    :deep(#subapp-viewport > style),
    :deep(#subapp-viewport script),
    :deep(#subapp-viewport style),
    :deep([id^="__qiankun_microapp_wrapper"] > script),
    :deep([id^="__qiankun_microapp_wrapper"] > style),
    :deep([id^="__qiankun_microapp_wrapper"] script),
    :deep([id^="__qiankun_microapp_wrapper"] style) {
      display: none !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
      visibility: hidden !important;
      position: absolute !important;
      left: -9999px !important;
      top: -9999px !important;
      opacity: 0 !important;
      pointer-events: none !important;
      font-size: 0 !important;
      line-height: 0 !important;
    }

    // 关键：隐藏所有可能包含脚本/样式文本的文本节点
    // 如果 qiankun 将脚本/样式内容作为文本节点插入，这些规则会隐藏它们
    :deep(#subapp-viewport),
    :deep([data-qiankun]),
    :deep([id^="__qiankun_microapp_wrapper"]) {
      // 确保文本节点不显示（通过设置容器属性）
      // 注意：CSS 无法直接选择文本节点，但可以通过设置容器的属性来影响文本显示
      // 使用 text-indent 和 white-space 来隐藏可能的文本内容
      text-indent: -9999px !important;
      white-space: nowrap !important;
      
      // 恢复实际内容元素的文本显示
      > *:not(script):not(style):not(qiankun-head) {
        text-indent: 0 !important;
        white-space: normal !important;
      }
    }

    // 文档 iframe 容器（覆盖默认样式，不需要 padding）
    .docs-iframe-wrapper {
      padding: 0 !important; // iframe内部的VitePress有自己的布局
      overflow: hidden !important; // 容器不滚动，滚动由 iframe 内部处理
    }

    // slide-bottom 动画
    .slide-bottom-enter-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out 0.1s;
    }

    .slide-bottom-leave-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out;
    }

    .slide-bottom-enter-to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .slide-bottom-enter-from {
      transform: translate3d(0, 5%, 0);
      opacity: 0;
    }

    .slide-bottom-leave-to {
      transform: translate3d(0, -5%, 0);
      opacity: 0;
    }

    .slide-bottom-leave-from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    // slide-top 动画
    .slide-top-enter-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out 0.1s;
    }

    .slide-top-leave-active {
      position: absolute;
      top: 0;
      width: 100%;
      transition: all 0.25s ease-in-out;
    }

    .slide-top-enter-to {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    .slide-top-enter-from {
      transform: translate3d(0, -5%, 0);
      opacity: 0;
    }

    .slide-top-leave-to {
      transform: translate3d(0, 5%, 0);
      opacity: 0;
    }

    .slide-top-leave-from {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    // 已移除 fade 动画样式
  }

  &.is-collapse {
    .app-layout__sidebar {
      width: 64px;
    }

    .app-layout__main {
      width: calc(100% - 64px);
    }

    // 顶部菜单模式：折叠不影响
    &.menu-type-top {
      .app-layout__main {
        width: 100%;
      }
    }

    // 双栏菜单模式：宽度与单列菜单一致（255px）
    &.menu-type-dual-menu {
      .app-layout__sidebar {
        width: 255px;
      }
      .app-layout__main {
        width: calc(100% - 255px);
      }
    }
  }

  // 移动端响应式样式（<= 768px）
  @media only screen and (max-width: 768px) {
    &__sidebar {
      position: absolute;
      left: 0;
      z-index: 9999;
      transition:
        transform 0.3s cubic-bezier(0.7, 0.3, 0.1, 1),
        box-shadow 0.3s cubic-bezier(0.7, 0.3, 0.1, 1);
    }

    &__main {
      width: 100%;
    }

    &__mask {
      display: block;
    }

    &.is-collapse {
      .app-layout__sidebar {
        transform: translateX(-100%);
      }

      .app-layout__mask {
        display: none;
      }
    }
  }

  // 桌面端响应式样式（> 768px）
  @media only screen and (min-width: 768px) {
    &__sidebar,
    &__main {
      transition: width 0.2s ease-in-out;
    }

    &__mask {
      display: none;
    }

    &.is-collapse {
      .app-layout__sidebar {
        width: 64px;
        transform: none;
      }

      .app-layout__main {
        width: calc(100% - 64px);
      }
    }
  }

  // 全屏模式（隐藏顶栏和侧边栏，保留标签页进程栏和面包屑）
  &.is-full {
    // 隐藏顶栏
    .app-layout__topbar {
      height: 0;
      overflow: hidden;
    }

    // 调整主体区域高度为全屏
    .app-layout__body {
      height: 100vh;
    }

    // 隐藏侧边栏
    .app-layout__sidebar {
      width: 0;
    }

    .app-layout__main {
      width: 100%;
    }

    // 保留标签页进程栏和面包屑，确保用户可以退出全屏
    .app-layout__content {
      margin: 10px; // 统一四周间距（与正常模式一致）
      width: calc(100% - 20px);
      border-radius: 6px;
    }
  }
}
</style>

<style lang="scss">
/**
 * 全局样式：隐藏 qiankun 注入的 qiankun-head 元素
 * 这个元素包含子应用的 script 和 style 标签，不应该作为可见文本显示
 * 使用全局样式确保无论 qiankun-head 在哪里都能被隐藏
 */
qiankun-head {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
  overflow: hidden !important;
  visibility: hidden !important;
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  font-size: 0 !important;
  line-height: 0 !important;
  
  // 确保所有子元素也被隐藏
  * {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    font-size: 0 !important;
    line-height: 0 !important;
  }
}

/**
 * 布局容器核心样式（非 scoped）
 * 当 layout-app 作为 qiankun 子应用被加载到子应用的 #app 容器时，
 * 需要非 scoped 样式确保布局样式能够正确应用，不受 qiankun 样式隔离影响
 * 这些样式必须与系统域的布局样式完全一致
 */
.app-layout__body {
  display: flex !important;
  flex-direction: row !important; // 明确指定左右布局
  flex: 1 !important;
  height: calc(100vh - 47px) !important;
  width: 100% !important;
  overflow: hidden !important;
}

.app-layout__sidebar {
  height: 100% !important;
  flex-shrink: 0 !important; // 防止侧边栏被压缩
  overflow: hidden !important;
}

.app-layout__main {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important; // 关键：必须设置高度为 100%，与系统域一致
  width: 100% !important; // 关键：确保占据剩余宽度
  overflow: hidden !important;
  min-width: 0 !important; // 确保 flex 子元素可以收缩
}

.app-layout__content {
  flex: 1 !important; // 关键：占据 app-layout__main 的剩余高度
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important; // 关键：允许 flex 子元素收缩
  overflow: hidden !important;
  height: 100% !important; // 关键：确保有明确的高度
}

// 折叠状态样式（桌面端，> 768px）
// 关键：使用 !important 确保在生产环境下优先级高于默认样式
@media only screen and (min-width: 768px) {
  .app-layout.is-collapse {
    .app-layout__sidebar {
      width: 64px !important;
    }

    .app-layout__main {
      width: calc(100% - 64px) !important;
    }

    // 顶部菜单模式：折叠不影响
    &.menu-type-top {
      .app-layout__main {
        width: 100% !important;
      }
    }

    // 双栏菜单模式：宽度与单列菜单一致（255px）
    &.menu-type-dual-menu {
      .app-layout__main {
        width: calc(100% - 255px) !important;
      }
    }
  }
}
</style>


