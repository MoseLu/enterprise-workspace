<template>
  <div
    class="app-layout"
    :class="{
      'is-collapse': isCollapse && menuType !== 'top' && menuType !== 'dual-menu',
      'is-full': isFullscreen,
      'menu-type-top': menuType === 'top',
      'menu-type-top-left': menuType === 'top-left',
      'menu-type-dual-menu': menuType === 'dual-menu',
    }"
  >
    <!-- 遮罩层（移动端使用） -->
    <div class="app-layout__mask" @click="handleMaskClick"></div>

    <!-- 顶栏（包含汉堡菜单、Logo、折叠按钮、搜索、主题、语言、用户） -->
    <div class="app-layout__topbar">
      <Topbar
        :is-collapse="isCollapse"
        :drawer-visible="drawerVisible"
        :menu-type="menuType"
        @toggle-sidebar="toggleSidebar"
        @toggle-drawer="toggleDrawer"
        @open-drawer="openDrawer"
      />
    </div>



    <!-- 下方：左侧边栏 + 右侧内容 -->
    <div class="app-layout__body">
      <!-- 左侧边栏（左侧菜单、双栏菜单左侧、混合菜单左侧） -->
      <div
        v-if="menuType === 'left' || menuType === 'dual-menu' || menuType === 'top-left'"
        class="app-layout__sidebar"
        :class="{ 'has-dark-menu': isDarkMenuStyle }"
      >
        <Sidebar
          v-if="menuType === 'left'"
          :is-collapse="isCollapse"
          :drawer-visible="drawerVisible"
        />
        <DualMenu v-else-if="menuType === 'dual-menu'" />
        <TopLeftSidebar v-else />
      </div>

      <!-- 右侧内容 -->
      <div class="app-layout__main">
        <!-- 顶部区域容器（顶栏、tabbar、面包屑的统一容器，提供统一的 10px 间距） -->
        <div class="app-layout__header">
          <!-- Tabbar -->
          <Process
            :is-fullscreen="isFullscreen"
            @toggle-fullscreen="toggleFullscreen"
          />

          <!-- 面包屑：使用 v-show 避免刷新时闪烁 -->
          <Breadcrumb
            v-show="showBreadcrumb && showCrumbs"
          />
        </div>

        <div
          class="app-layout__content"
          ref="contentRef"
        >
            <!-- 主应用路由出口 -->
            <div 
              v-if="mountState.showMainApp"
              class="content-mount content-mount--main-app"
            >
              <router-view v-slot="{ Component, route }">
                <transition :name="pageTransitionName" mode="out-in">
                  <component v-if="isOpsLogs" :is="Component" :key="route.fullPath" />
                  <keep-alive v-else>
                    <component :is="Component" :key="route.fullPath" />
                  </keep-alive>
                </transition>
              </router-view>
            </div>

            <!-- 子应用挂载点 -->
            <div
              v-if="mountState.showSubApp"
              id="subapp-viewport"
              :ref="(el) => mountState.subappViewportRef.value = el as HTMLElement | null"
              class="content-mount content-mount--sub-app"
            >
            </div>
          </div>
        </div>
      </div>

    <!-- 菜单抽屉 -->
    <MenuDrawer
      v-model:visible="drawerVisible"
      :topbar-height="47"
    />
  </div>
</template>

<script setup lang="ts">
import mitt from 'mitt';
import { useBrowser } from '@/composables/useBrowser';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import { useContentMount } from '@btc/shared-core';
import Sidebar from './sidebar/index.vue';
import Topbar from './topbar/index.vue';
import Process from './process/index.vue';
import Breadcrumb from './breadcrumb/index.vue';
import MenuDrawer from '@btc/shared-components/src/components/layout/app-layout/menu-drawer/index.vue';
import TopLeftSidebar from './top-left-sidebar/index.vue';
import DualMenu from './dual-menu/index.vue';
import { provideContentHeight } from '@/composables/useContentHeight';

// 创建事件总线
const emitter = mitt();

// 将事件总线挂载到 window，供其他组件使用
(window as any).__APP_EMITTER__ = emitter;

const route = useRoute();
const isCollapse = ref(false);
const drawerVisible = ref(false);
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
const { showCrumbs, pageTransition, menuType, menuThemeType, isDark } = useSettingsState();

// 判断是否为深色菜单风格
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 页面切换动画名称
const pageTransitionName = computed(() => {
  const path = route.path || '';
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

// 监听页面切换动画变化
function handlePageTransitionChange(event: CustomEvent) {
  // 动画名称会自动通过 computed 更新
}

const isFullscreen = ref(false);
const viewKey = ref(1); // 手动刷新时递增
const routeKey = computed(() => route.fullPath); // 常规路由 key
const isOpsLogs = computed(() => route.path.startsWith('/admin/ops/logs'));

// 浏览器信息
const { browser, onScreenChange } = useBrowser();

// 跟踪之前的 isMini 状态，只在真正切换移动端/桌面端时才改变折叠状态
let prevIsMini = browser.isMini;

// 判断是否为主应用（用于其他逻辑，如刷新视图、面包屑等）
const isMainApp = computed(() => {
  return mountState.type.value === 'main-app';
});

// 判断是否是首页
const isHomePage = computed(() => {
  const path = route.path;
  return path === '/' ||
         path === '/admin' ||
         path === '/logistics' ||
         path === '/engineering' ||
         path === '/quality' ||
         path === '/production' ||
         path === '/finance' ||
         path === '/docs';
});

// 判断是否显示面包屑
const showBreadcrumb = computed(() => {
  // 关键：优先使用 window.location.pathname，因为它不受路由初始化时机影响
  // 在页面刷新时，window.location.pathname 已经有正确的值，而 route.path 可能还在初始化
  const locationPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const routePath = route?.path;
  
  // 优先使用 locationPath，如果不存在则使用 routePath
  const path = locationPath || routePath;
  
  if (!path) {
    // 如果 path 还没有初始化，默认显示面包屑（后续会根据实际路径更新）
    return true;
  }

  // 任意应用首页不显示
  if (isHomePage.value) {
    return false;
  }

  // 个人中心页面现在在主应用菜单中，显示面包屑

  // 其他页面显示
  return true;
});

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
  scheduleContentResize();
};

const toggleDrawer = () => {
  // 使用 nextTick 延迟状态更新，避免在子应用环境中访问已被销毁的组件实例
  nextTick(() => {
    try {
      drawerVisible.value = !drawerVisible.value;
      scheduleContentResize();
    } catch (error) {
      // 静默处理错误，避免在子应用环境中抛出异常
    }
  });
};

const openDrawer = () => {
  // 使用 nextTick 延迟状态更新，避免在子应用环境中访问已被销毁的组件实例
  nextTick(() => {
    try {
      if (!drawerVisible.value) {
        drawerVisible.value = true;
      }
      scheduleContentResize();
    } catch (error) {
      // 静默处理错误，避免在子应用环境中抛出异常
    }
  });
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

onMounted(() => {
  emitter.on('view.refresh', refreshView);
  window.addEventListener('page-transition-change', handlePageTransitionChange as (event: Event) => void);

  // 监听屏幕变化，只在移动端/桌面端切换时改变折叠状态
  onScreenChange(() => {
    // 只在 isMini 状态真正改变时才更新折叠状态（从桌面端切换到移动端，或反之）
    if (prevIsMini !== browser.isMini) {
      isCollapse.value = browser.isMini;
      prevIsMini = browser.isMini;
    }
    scheduleContentResize();
  }, true); // immediate = true，立即执行一次，确保初始状态正确

  scheduleContentResize();
});

watch(
  () => route.fullPath,
  () => {
    scheduleContentResize();
  },
);

onUnmounted(() => {
  emitter.off('view.refresh', refreshView);
  window.removeEventListener('page-transition-change', handlePageTransitionChange as (event: Event) => void);

  delete (window as any).__APP_EMITTER__;
});
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  flex-direction: column; // 上下布局
  height: 100vh;
  width: 100%; // 使用 100% 而不是 100vw，避免滚动条导致裁切
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
    overflow: hidden;
  }

  &__sidebar {
    width: 255px;
    height: 100%;
    background-color: transparent; // 背景色由菜单风格控制
    transition: width 0.2s ease-in-out;
    overflow: hidden;
    flex-shrink: 0;
    border-right: 1px solid var(--el-border-color-extra-light);

    // 双栏菜单模式：宽度为 274px（与顶栏搜索框对齐）
    .menu-type-dual-menu & {
      width: 274px;
    }
  }

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    width: calc(100% - 255px);
    transition: width 0.2s ease-in-out;

    // 顶部菜单模式：全宽
    .menu-type-top & {
      width: 100%;
    }

    // 双栏菜单模式：减去左侧菜单宽度（与顶栏搜索框对齐）
    .menu-type-dual-menu & {
      width: calc(100% - 274px);
    }

    // 混合菜单模式：减去左侧菜单宽度
    .menu-type-top-left & {
      width: calc(100% - 255px);
    }
  }

  // 顶部区域容器（顶栏、tabbar、面包屑的统一容器）
  &__header {
    flex-shrink: 0;
    width: 100%;
    box-sizing: border-box;
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
    width: calc(100% - 20px); // 减去左右 margin
    box-sizing: border-box;
    border-radius: 6px;
    position: relative;
    background-color: var(--el-bg-color);
    min-height: 0;


    // 主应用路由视图（占据内容区域完整尺寸）
    :deep(> router-view) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
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
      width: 100%;
      flex: 1;
      min-height: 0;
      padding: 0 !important;
      background-color: var(--el-bg-color) !important;
    }

    :deep(#subapp-viewport > [data-qiankun]) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
    }

    :deep(#subapp-viewport > [data-qiankun] > *) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
    }

    :deep(qiankun-head) {
      display: none !important;
      height: 0 !important;
      width: 0 !important;
      overflow: hidden !important;
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

    // 双栏菜单模式：折叠不影响（双栏菜单有自己的宽度，与顶栏搜索框对齐）
    &.menu-type-dual-menu {
      .app-layout__sidebar {
        width: 274px;
      }
      .app-layout__main {
        width: calc(100% - 274px);
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

