<template>
  <template v-for="item in menuItems" :key="item.index">
    <!-- 有子菜单的情况 -->
    <el-sub-menu
      v-if="item.children && item.children.length > 0"
      :index="item.index"
      v-show="isMenuVisible(item)"
    >
      <template #title>
        <el-icon>
          <component
            v-if="!isSvgIcon(item.icon)"
            :is="getIconComponent(item.icon)"
          />
          <BtcSvg v-else :name="getSvgName(item.icon)" :size="18" />
        </el-icon>
        <span>{{ t(item.title) }}</span>
      </template>
      <!-- 递归渲染子菜单 -->
      <MenuRenderer
        :menu-items="item.children"
        :search-keyword="searchKeyword"
        :is-collapse="isCollapse"
      />
    </el-sub-menu>

    <!-- 没有子菜单的情况 -->
    <el-menu-item
      v-else
      :index="item.index"
      v-show="isMenuVisible(item)"
    >
      <el-icon>
        <component
          v-if="!isSvgIcon(item.icon)"
          :is="getIconComponent(item.icon)"
        />
        <BtcSvg v-else :name="getSvgName(item.icon)" :size="18" />
      </el-icon>
      <span>{{ t(item.title) }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import type { MenuItem } from '@/store/menuRegistry';
import { BtcSvg } from '@btc/shared-components';
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
  CollectionTag,
  DeleteFilled,
  Collection,
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
} from '@element-plus/icons-vue';

defineOptions({
  name: 'MenuRenderer',
});

interface Props {
  menuItems: MenuItem[];
  searchKeyword?: string;
  isCollapse?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  searchKeyword: '',
  isCollapse: false,
});

const { t } = useI18n();

// 图标映射表
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
  CollectionTag,
  DeleteFilled,
  Collection,
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
};

// 获取图标组件
const getIconComponent = (iconName?: string) => {
  if (!iconName) return Coin;
  return iconMap[iconName] || Coin; // 默认图标
};

const isSvgIcon = (iconName?: string) => iconName?.startsWith('svg:') ?? false;

const getSvgName = (iconName?: string) => iconName?.replace(/^svg:/, '') || '';

// 判断菜单项是否可见（支持搜索过滤）
const isMenuVisible = (item: MenuItem): boolean => {
  if (!props.searchKeyword) return true;

  const keyword = props.searchKeyword.toLowerCase().trim();
  if (!keyword) return true;

  // 检查当前菜单项是否匹配
  const currentMatch = t(item.title).toLowerCase().includes(keyword);

  // 如果有子菜单，检查子菜单是否有匹配项
  if (item.children && item.children.length > 0) {
    const hasMatchingChildren = item.children.some(child => isMenuVisible(child));
    return currentMatch || hasMatchingChildren;
  }

  return currentMatch;
};
</script>
