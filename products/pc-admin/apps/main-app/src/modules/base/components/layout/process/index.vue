<template>
  <div v-if="showWorkTab" class="app-process" :class="tabStyleClass">
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
            onClick: toHome
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
            <!-- 图标：所有应用的 tabbar 标签都不显示图标 -->
            <span class="label" :title="getTabLabel(item)">
              {{ getTabLabel(item) }}
            </span>

            <btc-svg class="close" name="close" @mousedown.stop="onDel(index)" />
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

import { useI18n, getMainAppId, setGlobalState } from '@btc/shared-core';
import { tSync } from '@/i18n/getters';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import type { ProcessItem } from '@/store/process';
import { useProcessStore, getCurrentAppFromPath } from '@/store/process';
import { getManifestRoute } from '@btc/shared-core/manifest';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { getMenusForApp } from '@/store/menuRegistry';
import { initGlobalTabBreadcrumbListener, globalTabbarList, globalActiveTabKey } from '@btc/shared-components/composables/useGlobalTabBreadcrumbState';

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

// 获取设置状态
const { showWorkTab, tabStyle } = useSettingsState();

// 标签页样式类
const tabStyleClass = computed(() => tabStyle.value || 'tab-default');

// 监听标签页样式变化
function handleTabStyleChange(event: CustomEvent) {
  // 样式类会自动通过 computed 更新
}

onMounted(() => {
  // 监听标签页样式变化
  window.addEventListener('tab-style-change', handleTabStyleChange as (event: Event) => void);
  // 初始化全局状态监听器
  initGlobalTabBreadcrumbListener();
});

onUnmounted(() => {
  window.removeEventListener('tab-style-change', handleTabStyleChange as (event: Event) => void);
});

const scrollerRef = ref();
const itemRefs = ref<Record<number, HTMLElement>>({});

// 将全局状态的 TabbarItem 转换为 ProcessItem 格式（兼容性）
function convertGlobalTabToProcessItem(tab: any): ProcessItem {
  return {
    path: tab.path,
    fullPath: tab.key || tab.path,
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
    return globalTabbarList.value
      .filter((tab: any) => tab.appName === currentApp)
      .map(convertGlobalTabToProcessItem);
  }
  
  // 优先级 2: 兼容 processStore（过渡期）
  if (!processStore) return [];
  return processStore.list.filter((tab: ProcessItem) => tab.app === currentApp);
});

// 当前激活标签的索引
const currentTabIndex = computed(() => {
  const currentPath = route.path;
  return filteredTabs.value.findIndex((tab) => tab.path === currentPath);
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

// 获取标签的国际化文本（使用 te() 检查翻译键，避免警告）
function getTabLabel(item: ProcessItem) {
  const app = getCurrentAppFromPath(item.path);
  const manifestRoute = getManifestRoute(app, item.path);

  // 优先级 1: 如果 meta.labelKey 存在，优先使用（这是最可靠的 i18n key）
  if (typeof item.meta?.labelKey === 'string' && item.meta.labelKey.length > 0) {
    // 先尝试使用 t()（响应式，支持语言切换）
    // 即使 te() 返回 false，也尝试翻译（因为子应用的国际化数据可能已加载但 te() 未检测到）
    const translated = t(item.meta.labelKey);
    if (translated && translated !== item.meta.labelKey) {
      return translated;
    }
    // 如果 t() 失败，尝试使用 tSync（更可靠，不依赖响应式）
    const syncTranslated = tSync(item.meta.labelKey);
    if (syncTranslated && syncTranslated !== item.meta.labelKey) {
      return syncTranslated;
    }
  }

  // 优先级 2: 如果 meta.label 存在，优先使用（可能是已翻译的文本或 i18n key）
  if (typeof item.meta?.label === 'string' && item.meta.label.length > 0) {
    // 如果 label 不包含点，说明是已翻译的文本，直接返回
    if (!item.meta.label.includes('.')) {
      return item.meta.label;
    }
    // 如果 label 包含点，可能是 i18n key，尝试翻译
    // 即使 te() 返回 false，也尝试翻译（因为子应用的国际化数据可能已加载但 te() 未检测到）
    const translated = t(item.meta.label);
    if (translated && translated !== item.meta.label) {
      return translated;
    }
    // 如果 t() 失败，尝试使用 tSync（更可靠，不依赖响应式）
    const syncTranslated = tSync(item.meta.label);
    if (syncTranslated && syncTranslated !== item.meta.label) {
      return syncTranslated;
    }
    // 如果都失败，但 label 看起来像 i18n key，继续尝试其他优先级
  }

  // 优先级 3: manifestRoute.tab.labelKey
  if (manifestRoute?.tab?.labelKey) {
    const key = manifestRoute.tab.labelKey;
    // 即使 te() 返回 false，也尝试翻译
    const translated = t(key);
    if (translated && translated !== key) {
      return translated;
    }
    const syncTranslated = tSync(key);
    if (syncTranslated && syncTranslated !== key) {
      return syncTranslated;
    }
  }

  // 优先级 4: manifestRoute.labelKey
  if (manifestRoute?.labelKey) {
    const key = manifestRoute.labelKey;
    // 即使 te() 返回 false，也尝试翻译
    const translated = t(key);
    if (translated && translated !== key) {
      return translated;
    }
    const syncTranslated = tSync(key);
    if (syncTranslated && syncTranslated !== key) {
      return syncTranslated;
    }
  }

  // 优先级 5: meta.hostLabelKey（子应用可能使用）
  if (typeof item.meta?.hostLabelKey === 'string' && item.meta.hostLabelKey.length > 0) {
    if (te(item.meta.hostLabelKey)) {
      const translated = t(item.meta.hostLabelKey);
      if (translated && translated !== item.meta.hostLabelKey) {
        return translated;
      }
    }
    const syncTranslated = tSync(item.meta.hostLabelKey);
    if (syncTranslated && syncTranslated !== item.meta.hostLabelKey) {
      return syncTranslated;
    }
  }

  // 优先级 5: meta.title
  if (typeof item.meta?.title === 'string' && item.meta.title.length > 0) {
    if (te(item.meta.title)) {
      return t(item.meta.title);
    }
    return item.meta.title;
  }

  // 路径到 i18n key 的映射
  const pathToI18nKey: Record<string, string> = {
    // 主应用路由
    '/workbench/overview': 'menu.overview',
    '/workbench/todo': 'menu.todo',
    // 个人中心
    '/workbench/profile': 'common.profile',
    // 错误页面
    '/404': 'common.page_not_found',

    // 测试功能
    '/test/components': 'menu.test_features.components',
    '/test/inventory-ticket-print': 'menu.test_features.inventory_ticket_print',
    '/admin/test/inventory-ticket-print': 'menu.test_features.inventory_ticket_print',

    // 文档中心
    '/docs': 'menu.docs_center',

    // 平台治理
    '/platform/domains': 'menu.platform.domains',
    '/platform/modules': 'menu.platform.modules',
    '/platform/plugins': 'menu.platform.plugins',

    // 组织与账号
    '/org/tenants': 'menu.org.tenants',
    '/org/departments': 'menu.org.departments',
    '/org/users': 'menu.org.users',

    // 访问控制
    '/access/resources': 'menu.access.resources',
    '/access/actions': 'menu.access.actions',
    '/access/permissions': 'menu.access.permissions',
    '/access/roles': 'menu.access.roles',
    '/access/perm-compose': 'menu.access.perm_compose',
    '/org/users/users-roles': 'menu.access.user_role_bind',

    // 导航与可见性
    '/navigation/menus': 'menu.navigation.menus',
    '/navigation/menus/preview': 'menu.navigation.menu_preview',

    // 数据管理
    '/data/files/list': 'menu.data.files.list',
    '/data/files/templates': 'menu.data.files.templates',
    '/data/files/preview': 'menu.data.files.preview',
    '/inventory/check': 'menu.inventory.result',
    '/data/dictionary/file-categories': 'menu.data.dictionary.file_categories',
    '/data/recycle': 'menu.data.recycle',

    // 运维与审计
    '/ops/logs/operation': 'menu.ops.operation_log',
    '/ops/logs/request': 'menu.ops.request_log',
    '/ops/api-list': 'menu.ops.api_list',
    '/ops/baseline': 'menu.ops.baseline',
    '/ops/simulator': 'menu.ops.simulator',

    // 策略相关
    '/strategy/management': 'menu.strategy.management',
    '/strategy/designer': 'menu.strategy.designer',
    '/strategy/monitor': 'menu.strategy.monitor',

    // 子应用路由（只保留首页）
    '/logistics': 'menu.logistics.overview',
    '/engineering': 'menu.engineering.overview',
    '/quality': 'menu.quality.overview',
    '/production': 'menu.production.overview',
  };

  const i18nKey = pathToI18nKey[item.path];

  if (i18nKey) {
    // 先尝试使用 t() 进行翻译（响应式，支持语言切换）
    if (te(i18nKey)) {
      const translated = t(i18nKey);
      if (translated && translated !== i18nKey) {
        return translated;
      }
    }
    // 如果 t() 失败，尝试使用 tSync 进行同步翻译（更可靠）
    const syncTranslated = tSync(i18nKey);
    if (syncTranslated && syncTranslated !== i18nKey) {
      return syncTranslated;
    }
    // 如果都失败，返回 key（不应该发生，但作为兜底）
    return i18nKey;
  }

  // 回退到原始标签
  return item.meta?.label || item.name || item.path;
}

// 判断是否为SVG图标
function isSvgIcon(iconName?: string): boolean {
  return iconName?.startsWith('svg:') ?? false;
}

// 获取SVG图标名称（移除 svg: 前缀）
function getSvgIconName(iconName?: string): string {
  return iconName?.replace(/^svg:/, '') || '';
}

// 从菜单注册表中查找菜单项的图标
function findMenuIconByI18nKey(i18nKey: string, app: string): string | undefined {
  const menus = getMenusForApp(app);

  // 递归查找菜单项
  function findInMenuItems(items: any[]): string | undefined {
    for (const item of items) {
      // 优先通过 labelKey 匹配（菜单注册时保存的原始 i18n key）
      // 如果 labelKey 不存在，则通过 title 匹配（兼容旧数据）
      const matches = (item.labelKey === i18nKey) || (item.title === i18nKey);
      if (matches && item.icon) {
        return item.icon;
      }
      // 递归查找子菜单
      if (item.children && item.children.length > 0) {
        const found = findInMenuItems(item.children);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  return findInMenuItems(menus);
}

// 获取标签图标
// 注意：所有应用的 tabbar 标签都不显示图标（参考 cool-admin-vue-7.x）
function getTabIcon(item: ProcessItem): string | undefined {
  // 所有应用的 tabbar 标签都不显示图标
  return undefined;
}

// 返回上一页（在当前应用内）
function toBack() {
  const currentApp = getCurrentAppFromPath(route.path);
  const appHomes: Record<string, string> = {
    main: '/crud',
    logistics: '/logistics',
    engineering: '/engineering',
    quality: '/quality',
    production: '/production',
    operations: '/operations',
  };

  // 如果有历史记录且在当前应用内，则返回
  if (window.history.length > 1) {
    router.back();
  } else {
    // 否则回到当前应用首页
    router.push(appHomes[currentApp] || '/');
  }
}

// 刷新当前路由（通过事件总线）
function toRefresh() {
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter) {
    emitter.emit('view.refresh');
  }
}

// 回到当前应用首页
function toHome() {
  const currentApp = getCurrentAppFromPath(route.path);
  const appHomes: Record<string, string> = {
    system: '/', // 系统域首页
    admin: '/admin', // 管理域首页
    logistics: '/logistics',
    engineering: '/engineering',
    quality: '/quality',
    production: '/production',
    finance: '/finance',
    operations: '/operations', // 运维应用首页
  };

  router.push(appHomes[currentApp] || '/');
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
  router.push(item.fullPath);
}

// 删除标签
function onDel(index: number) {
  const item = filteredTabs.value[index];

  // 在原始列表中找到并删除
  const globalIndex = processStore.list.findIndex((t) => t.fullPath === item.fullPath);
  if (globalIndex > -1) {
    processStore.remove(globalIndex);
  }

  // 如果删除的是当前激活标签，跳转到最后一个标签或首页
  if (item.active) {
    const last = filteredTabs.value[filteredTabs.value.length - 1];
    router.push(last ? last.fullPath : '/');
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
      
      // 跳转到当前应用首页
      const appHomes: Record<string, string> = {
        main: '/',
        logistics: '/logistics',
        engineering: '/engineering',
        quality: '/quality',
        production: '/production',
        operations: '/operations',
      };
      const homePath = appHomes[currentApp] || '/';

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
function openContextMenu(e: MouseEvent, item: ProcessItem, _index: number) {
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
  background-color: var(--el-bg-color);
  overflow: hidden;
  height: 39px; // 与面包屑保持一致的高度
  box-sizing: border-box;
  border-bottom: 1px solid var(--el-border-color-extra-light);

  &__op {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    padding: 0 !important; // 使用 !important 确保优先级，防止浏览器默认样式影响
    gap: 5px !important; // 使用 gap 统一间距，使用 !important 确保优先级
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

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }

    .tab-icon {
      flex-shrink: 0;
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

    &:hover:not(.active) {
      background-color: var(--el-fill-color-light);
    }

    &.active {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: #fff;

      .close {
        color: #fff;
        &:hover {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }
      }
    }

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

      &:hover:not(.active) {
        color: var(--el-text-color-regular) !important;
        background-color: var(--el-fill-color-light) !important;
        border-bottom: 1px solid var(--el-bg-color) !important;
        border-radius: calc(var(--custom-radius) / 2.5 + 4px) !important;
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
    border-color: var(--el-border-color) !important;
    background-color: var(--el-bg-color) !important;

    &:hover:not(.active) {
      background-color: var(--el-fill-color-light) !important;
    }

    &.active {
      background-color: var(--el-color-primary) !important;
      border-color: var(--el-color-primary) !important;
      color: #fff !important;

      .close {
        &:hover {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }
      }
    }

    .close {
      &:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
      }
    }
  }
}
</style>
