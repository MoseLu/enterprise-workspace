<template>
  <div class="dual-menu">
    <!-- 左侧一级菜单 -->
    <div class="dual-menu__left">
      <el-scrollbar class="dual-menu__scrollbar">
        <ul class="dual-menu__list">
          <li
            v-for="item in firstLevelMenuItems"
            :key="item.index"
            :class="{ 'is-active': isActiveFirstLevel(item) }"
            @click.stop="handleFirstLevelClick(item, $event)"
          >
            <el-tooltip
              :content="t(item.title)"
              placement="right"
              :offset="25"
              :disabled="showText"
            >
              <div
                class="dual-menu__item"
                :style="{
                  margin: showText ? '5px' : '15px',
                  height: showText ? '60px' : '34px',
                  width: showText ? 'auto' : '34px'
                }"
                @click.stop
              >
                <el-icon :style="{ fontSize: showText ? '18px' : '22px' }">
                  <component :is="getIconComponent(item.icon || '')" />
                </el-icon>
                <span v-if="showText">{{ t(item.title) }}</span>
              </div>
            </el-tooltip>
          </li>
        </ul>
      </el-scrollbar>

      <div class="dual-menu__toggle" @click="toggleText">
        <el-icon><Expand v-if="!showText" /><Fold v-else /></el-icon>
      </div>
    </div>

    <!-- 右侧二级菜单 -->
    <div class="dual-menu__right">
      <div class="dual-menu__right-search">
        <el-input
          v-model="searchKeyword"
          :placeholder="t('common.search_menu')"
          clearable
        >
          <template #prefix>
            <btc-svg name="search" :size="16" />
          </template>
        </el-input>
      </div>

      <el-menu
        :key="menuKey"
        ref="menuRef"
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        :unique-opened="uniqueOpened"
        class="dual-menu__right-menu"
        @select="handleMenuSelect"
        :router="false"
      >
        <MenuRenderer
          :menu-items="currentSubMenuItems"
          :search-keyword="searchKeyword"
          :is-collapse="false"
        />
      </el-menu>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutDualMenu',
});

import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { useSettingsState } from '../../../others/btc-user-setting/composables';
import { useCurrentApp } from '../../../../composables/useCurrentApp';
import { getMenusForApp } from '../../../../store/menuRegistry';
import { Expand, Fold } from '@element-plus/icons-vue';
import MenuRenderer from '../menu-renderer/index.vue';
import {
  Lock,
  Location,
  Connection,
  Files,
  User,
  OfficeBuilding,
  Menu,
  TrendCharts,
  UserFilled,
  FolderOpened,
  Postcard,
  Coin,
  School,
  Key,
  List,
  Monitor,
  DocumentCopy,
  Histogram,
  Odometer,
  Document,
  Tickets,
  House,
  Grid,
  View,
  Operation,
  Opportunity,
  Setting,
  Edit,
  DataAnalysis,
  ShoppingCart,
  Box,
  MapLocation,
  Folder,
  Delete,
  Check,
  Warning,
  Money,
  CreditCard,
  Clock,
  ShoppingBag,
  Goods,
  Van,
  Ship,
  Tools,
  Cpu,
  Printer,
  Camera,
  Picture,
  VideoCamera,
  Microphone,
  Headset,
  Phone,
  Message,
  ChatDotRound,
  ChatLineRound,
  Bell,
  Notification,
  Promotion,
  Discount,
  Star,
  StarFilled,
  Share,
  Download,
  Upload,
  Link,
  Search,
  Filter,
  Sort,
  Refresh,
  Loading,
  Plus,
  Minus,
  Close,
  CircleCheck,
  CircleClose,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CirclePlus,
  Remove,
  CircleCheckFilled,
  CircleCloseFilled,
  CollectionTag,
  DeleteFilled,
  Collection,
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();
const { uniqueOpened } = useSettingsState();

// 获取原始 console 方法，避免被日志过滤拦截
const originalConsoleLog = (console as any).__originalLog || console.log;
const originalConsoleWarn = (console as any).__originalWarn || console.warn;

// 关键：activeMenu 不能是一级菜单的 index，只能是有实际路由的子菜单路径
const getInitialActiveMenu = () => {
  const path = route.path;
  // 检查是否是一级菜单的路径
  const allMenuItems = getMenusForApp(currentApp.value);
  const firstLevelItems = allMenuItems.filter(item => item.children && item.children.length > 0);
  const isFirstLevelPath = firstLevelItems.some(item => {
    const itemPath = item.index?.startsWith('/') ? item.index : `/${item.index}`;
    return path === itemPath;
  });
  // 如果是一级菜单的路径，返回空字符串，避免触发 @select 事件
  return isFirstLevelPath ? '' : path;
};

const activeMenu = ref(getInitialActiveMenu());
const searchKeyword = ref('');
const menuRef = ref();
const menuKey = ref(0);
const showText = ref(false);
const selectedFirstLevel = ref<string>('');
// 标志：是否正在切换一级菜单，用于阻止 @select 事件
const isSwitchingFirstLevel = ref(false);

// 获取当前应用的菜单项（从 menuRegistry 获取）
const allMenuItems = computed(() => {
  return getMenusForApp(currentApp.value);
});

// 一级菜单项（只显示有子菜单的项）
const firstLevelMenuItems = computed(() => {
  return allMenuItems.value.filter(item => item.children && item.children.length > 0);
});

// 当前显示的子菜单项
const currentSubMenuItems = computed(() => {
  let children: any[] = [];

  if (selectedFirstLevel.value) {
    const item = firstLevelMenuItems.value.find(item => item.index === selectedFirstLevel.value);
    children = item?.children || [];
  } else {
  // 默认显示第一个有子菜单的项的子菜单
  const first = firstLevelMenuItems.value[0];
    children = first?.children || [];
  }

  // 关键：确保子菜单中不包含一级菜单的 index
  // 过滤掉任何可能是一级菜单 index 的项，避免 el-menu 自动触发路由跳转
  return children.filter(child => {
    if (!child.index) return true;
    const childPath = child.index.startsWith('/') ? child.index : `/${child.index}`;
    const isFirstLevel = firstLevelMenuItems.value.some(firstItem => {
      if (!firstItem.index) return false;
      const firstPath = firstItem.index.startsWith('/') ? firstItem.index : `/${firstItem.index}`;
      return firstPath === childPath;
    });
    if (isFirstLevel && import.meta.env.DEV) {
      console.warn('[dual-menu] 过滤掉一级菜单 index 从子菜单中:', child.index, childPath);
    }
    return !isFirstLevel;
  });
});

const defaultOpeneds = computed(() => {
  return currentSubMenuItems.value
    .filter(item => item.children && item.children.length > 0)
    .map(item => item.index)
    .filter(Boolean) as string[];
});

// 图标映射
const iconMap: Record<string, any> = {
  Lock,
  Location,
  Connection,
  Files,
  User,
  OfficeBuilding,
  Menu,
  TrendCharts,
  UserFilled,
  FolderOpened,
  Postcard,
  Coin,
  School,
  Key,
  List,
  Monitor,
  DocumentCopy,
  Histogram,
  Odometer,
  Document,
  Tickets,
  House,
  Grid,
  View,
  Operation,
  Opportunity,
  Setting,
  Edit,
  DataAnalysis,
  ShoppingCart,
  Box,
  MapLocation,
  Folder,
  Delete,
  Check,
  Warning,
  Money,
  CreditCard,
  Clock,
  ShoppingBag,
  Goods,
  Van,
  Ship,
  Tools,
  Cpu,
  Printer,
  Camera,
  Picture,
  VideoCamera,
  Microphone,
  Headset,
  Phone,
  Message,
  ChatDotRound,
  ChatLineRound,
  Bell,
  Notification,
  Promotion,
  Discount,
  Star,
  StarFilled,
  Share,
  Download,
  Upload,
  Link,
  Search,
  Filter,
  Sort,
  Refresh,
  Loading,
  Plus,
  Minus,
  Close,
  CircleCheck,
  CircleClose,
  InfoFilled,
  SuccessFilled,
  WarningFilled,
  CirclePlus,
  Remove,
  CircleCheckFilled,
  CircleCloseFilled,
  CollectionTag,
  DeleteFilled,
  Collection,
};

const getIconComponent = (iconName: string) => {
  return iconMap[iconName] || Coin;
};

const isActiveFirstLevel = (item: any) => {
  if (selectedFirstLevel.value) {
    return item.index === selectedFirstLevel.value;
  }
  // 默认第一个激活
  return firstLevelMenuItems.value[0]?.index === item.index;
};

/**
 * 递归查找第一个可见的叶子节点菜单
 * 参考 art-design-pro 的实现，确保只跳转到有实际路由的菜单项
 * 叶子节点是指没有子菜单或子菜单都被隐藏的菜单项
 * @param items 菜单项数组
 * @returns 第一个可见的叶子节点菜单项，如果没有找到则返回第一个菜单项作为回退
 */
const findFirstLeafMenu = (items: any[]): any => {
  for (const child of items) {
    // 跳过隐藏的菜单项
    if (child.meta?.isHide) {
      continue;
    }
    // 如果有子菜单，递归查找
    if (child.children && child.children.length > 0) {
      const found = findFirstLeafMenu(child.children);
      if (found) {
        return found;
      }
    } else {
      // 没有子菜单，说明是叶子节点，返回它
      return child;
    }
  }
  // 如果所有菜单项都被隐藏，返回第一个菜单项作为回退
  return items.length > 0 ? items[0] : null;
};

/**
 * 处理一级菜单点击事件
 * 参考 art-design-pro 的实现，当点击一级菜单时：
 * 1. 如果一级菜单有子菜单，自动跳转到第一个可见的叶子节点菜单
 * 2. 如果一级菜单没有子菜单，只更新菜单状态，不跳转
 * 这样可以避免点击分组节点时出现 404 错误
 * @param item 一级菜单项
 * @param event 点击事件对象（可选）
 */
const handleFirstLevelClick = (item: any, event?: Event) => {
  const itemPath = item.index?.startsWith('/') ? item.index : `/${item.index}`;

  // 使用原始 console 方法，避免被日志过滤拦截
  originalConsoleLog('[dual-menu] ===== handleFirstLevelClick 被调用 =====', {
    itemIndex: item.index,
    itemPath,
    currentRoute: route.path,
    currentActiveMenu: activeMenu.value,
    firstLevelMenuItemsCount: firstLevelMenuItems.value.length,
    hasChildren: !!(item.children && item.children.length > 0),
    isFirstLevelPath: firstLevelMenuItems.value.some(firstItem => {
      if (!firstItem.index) return false;
      const firstPath = firstItem.index.startsWith('/') ? firstItem.index : `/${firstItem.index}`;
      return firstPath === itemPath;
    })
  });

  // 关键：检查是否是一级菜单路径
  // 如果是一级菜单路径，需要特殊处理：有子菜单时跳转到第一个子菜单，没有子菜单时只更新菜单状态
  const isFirstLevelPath = firstLevelMenuItems.value.some(firstItem => {
    if (!firstItem.index) return false;
    const firstPath = firstItem.index.startsWith('/') ? firstItem.index : `/${firstItem.index}`;
    return firstPath === itemPath;
  });

  if (isFirstLevelPath) {
    originalConsoleWarn('[dual-menu] ===== 检测到一级菜单路径，处理子菜单跳转 =====', itemPath);

    // 阻止事件冒泡，避免触发其他事件处理器
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // 设置标志，阻止 @select 事件
    isSwitchingFirstLevel.value = true;

    // 更新 selectedFirstLevel，切换右侧菜单显示
    selectedFirstLevel.value = item.index || '';
    menuKey.value++;

    // 关键：确保 activeMenu 不是一级菜单的 index
    if (activeMenu.value === itemPath) {
      activeMenu.value = '';
    }

    // 关键：参考 art-design-pro 的实现，如果一级菜单有子菜单，自动跳转到第一个可见的叶子节点菜单
    // 这样可以避免点击分组节点时出现 404 错误
    if (item.children && item.children.length > 0) {
      const firstChild = findFirstLeafMenu(item.children);
      if (firstChild && firstChild.index) {
        const firstChildPath = firstChild.index.startsWith('/')
          ? firstChild.index
          : `/${firstChild.index}`;

        originalConsoleLog('[dual-menu] 找到第一个子菜单，准备跳转:', {
          firstChildIndex: firstChild.index,
          firstChildPath,
          itemPath
        });

        // 延迟重置标志，确保 el-menu 重新渲染完成后再允许 @select 事件
        setTimeout(() => {
          isSwitchingFirstLevel.value = false;
        }, 100);

        // 跳转到第一个子菜单
        router.push(firstChildPath).catch((err: unknown) => {
          // 路由跳转失败，静默处理（可能是路由不存在，但不应该影响菜单切换）
          if (import.meta.env.DEV) {
            console.warn('[dual-menu] 跳转到第一个子菜单失败:', firstChildPath, err);
          }
        });
        return;
      }
    }

    // 延迟重置标志，确保 el-menu 重新渲染完成后再允许 @select 事件
    setTimeout(() => {
      isSwitchingFirstLevel.value = false;
    }, 100);

    // 如果没有子菜单或找不到第一个子菜单，只更新菜单状态，不跳转
    originalConsoleLog('[dual-menu] 一级菜单没有子菜单或找不到第一个子菜单，只更新菜单状态');
    return;
  }

  // 阻止事件冒泡，避免触发其他事件处理器
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // 设置标志，阻止 @select 事件
  isSwitchingFirstLevel.value = true;

  selectedFirstLevel.value = item.index || '';
  menuKey.value++;

  // 关键：确保 activeMenu 不是一级菜单的 index
  // 如果当前 activeMenu 是一级菜单的 index，清空它，避免 el-menu 自动触发 @select 事件
  if (activeMenu.value === itemPath) {
    activeMenu.value = '';
  }

  // 延迟重置标志，确保 el-menu 重新渲染完成后再允许 @select 事件
  setTimeout(() => {
    isSwitchingFirstLevel.value = false;
  }, 100);

  // 点击一级菜单时，只切换选中的一级菜单，不自动跳转
  // 用户需要点击右侧的子菜单项才能跳转，避免分组节点导致的路由警告
  // 这样设计更符合双列菜单的交互逻辑：左侧选择分类，右侧选择具体页面
};

const toggleText = () => {
  showText.value = !showText.value;
};

watch(
  () => searchKeyword.value,
  () => {
    menuKey.value++;
  }
);

watch(
  () => route.path,
  (newPath) => {
    // 关键：确保 activeMenu 不是一级菜单的 index
    // 如果当前路由是一级菜单的 index，不设置 activeMenu，避免触发 @select 事件
    const isFirstLevelPath = firstLevelMenuItems.value.some(item => {
      if (!item.index) return false;
      const itemPath = item.index.startsWith('/') ? item.index : `/${item.index}`;
      return newPath === itemPath;
    });

    if (!isFirstLevelPath) {
    activeMenu.value = newPath;
    } else {
      // 如果是一级菜单的路径，清空 activeMenu，避免 el-menu 自动触发 @select 事件
      activeMenu.value = '';
    }

    // 根据当前路由更新选中的一级菜单
    for (const item of firstLevelMenuItems.value) {
      if (item.index && newPath.startsWith(item.index)) {
        selectedFirstLevel.value = item.index;
        break;
      }
    }
  },
  { immediate: true }
);

const handleMenuSelect = (index: string) => {
  // 关键：如果正在切换一级菜单，直接返回，不处理 @select 事件
  if (isSwitchingFirstLevel.value) {
    if (import.meta.env.DEV) {
      console.info('[dual-menu] 正在切换一级菜单，忽略 @select 事件:', index);
    }
    return;
  }

  if (!index) {
  if (import.meta.env.DEV) {
      console.info('[dual-menu] handleMenuSelect: index is empty');
    }
    return;
  }

  const absolutePath = index.startsWith('/') ? index : `/${index}`;

  if (import.meta.env.DEV) {
    console.info('[dual-menu] handleMenuSelect called', {
      index,
      absolutePath,
      currentApp: currentApp.value,
      firstLevelMenuItems: firstLevelMenuItems.value.map(item => ({
        index: item.index,
        path: item.index?.startsWith('/') ? item.index : `/${item.index}`
      })),
      selectedFirstLevel: selectedFirstLevel.value
    });
  }

  // 关键：先检查是否是一级菜单的 index（一级菜单不应该导航，只用于切换显示的子菜单）
  // 一级菜单的 index 不应该触发路由跳转，因为它们是分组节点
  const isFirstLevelIndex = firstLevelMenuItems.value.some(item => {
    if (!item.index) return false;
    const itemPath = item.index.startsWith('/') ? item.index : `/${item.index}`;
    const match = itemPath === absolutePath;
    if (import.meta.env.DEV && match) {
      console.warn('[dual-menu] 匹配到一级菜单，阻止导航:', {
        itemIndex: item.index,
        itemPath,
        absolutePath,
        match
      });
    }
    return match;
  });

  if (isFirstLevelIndex) {
    if (import.meta.env.DEV) {
      console.warn('[dual-menu] 阻止一级菜单导航，直接返回:', index, absolutePath);
    }
    // 关键：直接返回，不执行任何路由跳转
    return;
  }

  // 检查是否为分组节点（有 children 的节点不应该导航）
  const findMenuItem = (items: typeof currentSubMenuItems.value, targetIndex: string): typeof items[0] | null => {
    for (const item of items) {
      if (item.index === targetIndex || item.index === absolutePath) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findMenuItem(item.children, targetIndex);
        if (found) return found;
      }
    }
    return null;
  };

  const matchedItem = findMenuItem(currentSubMenuItems.value, index);

  // 如果找到的菜单项有 children，说明是分组节点，不应该导航
  if (matchedItem && matchedItem.children && matchedItem.children.length > 0) {
    if (import.meta.env.DEV) {
      console.info('[dual-menu] 跳过分组节点导航:', index, matchedItem);
    }
    return;
  }

  // 使用 catch 捕获路由跳转错误，避免未匹配路由时导致的问题
  router.push(absolutePath).catch((err: unknown) => {
    // 路由跳转失败（通常是路由未匹配），记录错误但不抛出
    if (import.meta.env.DEV) {
      console.warn('[dual-menu] 路由跳转失败:', absolutePath, err);
    }
  });
};

// 路由拦截器：阻止一级菜单的路由跳转
// 关键：Element Plus 的 el-menu 可能会通过内部机制触发路由跳转，即使设置了 :router="false"
// 使用路由拦截器作为最后一道防线，确保一级菜单的路由跳转被阻止
let routeGuardUnregister: (() => void) | null = null;
let isRouteGuardRegistered = false;

// 关键：使用 watch 监听 firstLevelMenuItems，一旦有值就注册路由拦截器
// 这样可以确保拦截器在路由跳转之前就已经注册，避免在 qiankun 环境下注册时机太晚的问题
// 注意：路由拦截器是栈结构，后注册的先执行，所以我们需要尽早注册
watch(
  () => firstLevelMenuItems.value,
  (newItems) => {
    // 只有当菜单项有值且拦截器还未注册时才注册
    if (newItems.length > 0 && !isRouteGuardRegistered) {
      originalConsoleLog('[dual-menu] ===== 注册路由拦截器 =====', {
        firstLevelMenuItemsCount: newItems.length,
        firstLevelMenuItems: newItems.map(item => item.index),
        allMenuItems: allMenuItems.value.map(item => ({ index: item.index, hasChildren: !!item.children }))
      });

      // 注册路由拦截器，阻止一级菜单的路由跳转
      // 关键：使用 router.beforeEach 注册，这会返回一个取消函数
      // 路由拦截器是栈结构，后注册的先执行，所以我们的拦截器会在其他拦截器之前执行
      routeGuardUnregister = router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        originalConsoleLog('[dual-menu] ===== 路由拦截器被调用 =====', {
          to: to.path,
          from: from.path,
          firstLevelMenuItems: firstLevelMenuItems.value.map(item => item.index),
          allMenuItems: allMenuItems.value.map(item => ({ index: item.index, hasChildren: !!item.children }))
        });

        // 检查目标路径是否是一级菜单的路径（包括所有有子菜单的菜单项）
        // 不仅检查 firstLevelMenuItems，还要检查所有菜单项中是否有匹配的
        const isFirstLevelPath = allMenuItems.value.some(item => {
          // 只检查有子菜单的项（分组节点）
          if (!item.children || item.children.length === 0) return false;
          if (!item.index) return false;
          const itemPath = item.index.startsWith('/') ? item.index : `/${item.index}`;
          const match = to.path === itemPath;
          if (match) {
            originalConsoleWarn('[dual-menu] 匹配到分组节点:', {
              itemIndex: item.index,
              itemPath,
              toPath: to.path,
              hasChildren: item.children.length
            });
          }
          return match;
        });

        if (isFirstLevelPath) {
          originalConsoleWarn('[dual-menu] ===== 路由拦截器：阻止分组节点路由跳转 =====', {
            to: to.path,
            from: from.path,
            firstLevelMenuItems: firstLevelMenuItems.value.map(item => item.index)
          });
          // 阻止路由跳转，保持当前路由
          next(false);
          return;
        }

        // 其他路由正常放行
        next();
      });

      isRouteGuardRegistered = true;
    }
  },
  { immediate: true }
);

onMounted(() => {
  originalConsoleLog('[dual-menu] ===== 组件已挂载 =====', {
    currentApp: currentApp.value,
    firstLevelMenuItemsCount: firstLevelMenuItems.value.length,
    currentRoute: route.path
  });
});

onUnmounted(() => {
  // 卸载时移除路由拦截器
  if (routeGuardUnregister) {
    originalConsoleLog('[dual-menu] ===== 移除路由拦截器 =====');
    routeGuardUnregister();
    routeGuardUnregister = null;
    isRouteGuardRegistered = false;
  }
});
</script>

<style lang="scss">
.dual-menu {
  display: flex;
  height: 100%;
  // 宽度计算说明：
  // 1. 侧边栏容器宽度：255px（双栏菜单模式下，与单列菜单宽度一致，保持设计统一）
  // 2. 侧边栏容器使用 box-sizing: border-box，所以 255px 已包含 1px border-right
  // 3. 双栏菜单使用 width: 100%，占据侧边栏容器的全部可用宽度（255px，包含 border）
  // 4. 左侧栏固定宽度：64px（包含 1px border-right，因为 box-sizing: border-box）
  // 5. 右侧栏使用 flex: 1，动态计算宽度 = 255px - 64px = 191px
  width: 100%; // 关键：使用 100% 占据侧边栏容器的全部宽度
  max-width: 100%; // 防止超出
  box-sizing: border-box; // 关键：确保 border 包含在宽度内
  background-color: var(--el-bg-color);
  border-right: none; // 关键：移除双栏菜单的 border，避免占用额外空间
  flex-shrink: 0;

  &__left {
    width: 64px; // 与折叠菜单和顶栏品牌区域宽度一致
    box-sizing: border-box; // 关键：确保 border 包含在宽度内
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color); // 与右侧栏保持一致
    border-right: 1px solid var(--el-border-color-extra-light);
    flex-shrink: 0; // 防止被压缩
  }

  &__scrollbar {
    flex: 1;
    overflow: hidden;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 6px;
    color: var(--el-text-color-primary);
    transition: all 0.2s;
    // 确保图标在正方形中居中
    position: relative;

    .el-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 !important; // 移除所有 margin，确保居中
    }

    &:hover {
      background-color: var(--el-fill-color);
    }

    span {
      font-size: 12px;
      margin-top: 4px;
    }
  }

  &__list > li {
    &.is-active {
      .dual-menu__item {
        background-color: var(--el-color-primary);
        color: #fff;
      }
    }
  }

  &__toggle {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-top: 1px solid var(--el-border-color-extra-light);
    color: var(--el-text-color-secondary);

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-fill-color);
    }
  }

  &__right {
    // 右侧栏宽度 = 侧边栏容器宽度（255px）- 左侧栏宽度（64px）= 191px
    // 使用 flex: 1 自动占据剩余空间，确保总宽度与单列菜单一致（255px）
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__right-search {
    padding: 6px 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    height: 39px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    :deep(.el-input) {
      width: 100%;
    }

    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      box-shadow: none;
      height: 27px;
      padding: 0 12px;
      border-radius: 6px;
      width: 100%;
      box-sizing: border-box;

      .el-input__inner {
        font-size: 13px;
        width: 100%;
      }
    }
  }

  &__right-menu {
    flex: 1;
    border: none;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: var(--el-bg-color) !important;

    :deep(.el-sub-menu__title) {
      height: 50px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    :deep(.el-menu-item) {
      height: 50px;
      font-size: 14px;
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-active {
        background-color: var(--el-color-primary) !important;
        color: #fff !important;

        // 关键：覆盖全局样式，确保激活状态下图标颜色是白色，而不是主题色
        // 防止 .app-layout__sidebar .el-menu-item.is-active .el-icon 的全局样式影响双栏菜单
        .el-icon {
          color: #fff !important;
        }

        .el-icon svg {
          fill: #fff !important;
          color: #fff !important;
        }
      }
    }

    // 参考第一列的图标颜色设置：图标颜色自然继承父元素的文字颜色
    // 第一列：.dual-menu__item 设置了 color，.el-icon 没有单独设置颜色，所以自然继承
    // 第二列：.el-menu-item 设置了 color，.el-icon 也应该自然继承，不需要强制设置
    :deep(.el-icon) {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 24px !important;
      min-width: 24px !important;
      flex: 0 0 24px !important;
      margin-right: 16px !important;
      font-size: 20px !important;
      visibility: visible !important;
      opacity: 1 !important;
      // 不设置 color，让它自然继承父元素的文字颜色（参考第一列的做法）
    }

    // 确保 SVG 图标也显示，并且颜色继承（使用 currentColor）
    :deep(.el-icon svg) {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      visibility: visible !important;
      opacity: 1 !important;
      fill: currentColor !important;
      color: currentColor !important;
    }
  }
}
</style>

