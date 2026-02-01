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
            @click="handleFirstLevelClick(item)"
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
              >
                <el-icon :style="{ fontSize: showText ? '18px' : '22px' }">
                  <component :is="getIconComponent(item.icon)" />
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

import { useI18n } from '@btc/shared-core';
import { useSettingsState } from '@/plugins/user-setting/composables';
import { useCurrentApp } from '@/composables/useCurrentApp';
import { getMenusForApp } from '@/store/menuRegistry';
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

const activeMenu = ref(route.path);
const searchKeyword = ref('');
const menuRef = ref();
const menuKey = ref(0);
const showText = ref(false);
const selectedFirstLevel = ref<string>('');

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
  if (selectedFirstLevel.value) {
    const item = firstLevelMenuItems.value.find(item => item.index === selectedFirstLevel.value);
    return item?.children || [];
  }
  
  // 默认显示第一个有子菜单的项的子菜单
  const first = firstLevelMenuItems.value[0];
  return first?.children || [];
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

const handleFirstLevelClick = (item: any) => {
  selectedFirstLevel.value = item.index || '';
  menuKey.value++;
  
  // 如果点击的是当前激活的一级菜单，且其子菜单中有当前路由，则导航到第一个子菜单
  if (item.children && item.children.length > 0) {
    const firstChild = item.children[0];
    if (firstChild.index) {
      const absolutePath = firstChild.index.startsWith('/') ? firstChild.index : `/${firstChild.index}`;
      router.push(absolutePath);
    }
  }
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
    activeMenu.value = newPath;
    
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
  if (import.meta.env.DEV) {
    console.info('[main-app] dual-menu select', { index, currentApp: currentApp.value });
  }
  const absolutePath = index.startsWith('/') ? index : `/${index}`;
  router.push(absolutePath);
};
</script>

<style lang="scss" scoped>
.dual-menu {
  display: flex;
  height: 100%;
  // 宽度计算：64px（左侧栏）+ 210px（右侧栏，与顶栏搜索框最右侧对齐）
  // 顶栏：64px（品牌区域）+ 10px（padding-left）+ 200px（搜索框宽度）= 274px
  // 双栏菜单总宽度 = 64px（左侧栏）+ 210px（右侧栏）= 274px，与顶栏对齐
  width: 274px;
  min-width: 274px;
  max-width: 274px;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-extra-light);
  flex-shrink: 0;

  &__left {
    width: 64px; // 与折叠菜单和顶栏品牌区域宽度一致
    display: flex;
    flex-direction: column;
    background-color: var(--el-bg-color); // 与右侧栏保持一致
    border-right: 1px solid var(--el-border-color-extra-light);
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
    // 固定宽度：274px（总宽度）- 64px（左侧栏）= 210px，与顶栏搜索框对齐
    width: 210px;
    flex-shrink: 0;
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

    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      box-shadow: none;
      height: 27px;
      padding: 0 12px;
      border-radius: 6px;

      .el-input__inner {
        font-size: 13px;
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
      }
    }

    :deep(.el-icon) {
      margin-right: 16px;
    }
  }
}
</style>

