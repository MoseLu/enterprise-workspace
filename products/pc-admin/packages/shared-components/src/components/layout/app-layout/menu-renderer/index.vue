<template>
  <template v-for="item in menuItems" :key="item.index">
    <!-- 有子菜单的情况 -->
    <!-- 关键：Element Plus 的 el-sub-menu 要求必须有 index 属性 -->
    <!-- 虽然分组节点在 manifest 中没有实际路由路径，但我们需要提供 index 用于菜单状态管理 -->
    <!-- 在 handleMenuSelect 中会过滤掉分组节点的导航 -->
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
        <span>{{ getMenuTitle(item) }}</span>
      </template>
      <!-- 递归渲染子菜单 -->
      <MenuRenderer
        :menu-items="item.children"
        v-bind="{
          ...(searchKeyword !== undefined ? { 'search-keyword': searchKeyword } : {}),
          ...(isCollapse !== undefined ? { 'is-collapse': isCollapse } : {})
        }"
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
      <span>{{ getMenuTitle(item) }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
// defineComponent 未使用，已移除导入
import type { MenuItem } from '../../../../store/menuRegistry';
import { BtcSvg } from '@btc/shared-components';
import { useI18n } from '@btc/shared-core';
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

// 获取菜单标题
// 优先使用 labelKey 进行翻译，如果没有 labelKey 则使用 title（title 可能是已翻译的文本或 i18n key）
const getMenuTitle = (item: MenuItem): string => {
  // 辅助函数：处理翻译结果（可能是字符串、对象或函数）
  const processTranslation = (translated: any, key: string): string | null => {
    if (!translated || translated === key) {
      return null;
    }
    
    // 如果是字符串，直接返回
    if (typeof translated === 'string') {
      return translated;
    }
    
    // 如果是对象且包含 _ 键，使用 _ 键的值（用于处理父键同时有子键的情况）
    if (typeof translated === 'object' && translated !== null && !Array.isArray(translated)) {
      if ('_' in translated && typeof translated._ === 'string') {
        return translated._;
      }
    }
    
    // 如果是函数，尝试调用
    if (typeof translated === 'function') {
      try {
        const result = translated({ normalize: (arr: any[]) => arr[0] });
        if (typeof result === 'string' && result.trim() !== '') {
          return result;
        }
      } catch {
        // 函数调用失败，返回 null
      }
    }
    
    return null;
  };
  
  // 获取要翻译的键
  const i18nKey = item.labelKey || (item.title?.startsWith('menu.') ? item.title : null);
  
  let finalTranslatedValue = '';
  
  if (i18nKey) {
    // 优先使用主应用的 i18n 实例（确保能访问到已合并的语言包）
    const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
    if (mainAppI18n && mainAppI18n.global) {
      const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
      const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
      
      // 优先级1：直接访问扁平化的 key（支持扁平化消息结构）
      if (i18nKey in messages) {
        const value = messages[i18nKey];
        const processed = processTranslation(value, i18nKey);
        if (processed) {
          finalTranslatedValue = processed;
          return finalTranslatedValue;
        }
      }
      
      // 优先级2：按路径访问嵌套结构（处理嵌套消息结构和 _ 键）
      const keys = i18nKey.split('.');
      let value = messages;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined) {
        // 如果值是对象且包含 _ 键，使用 _ 键的值（Vue I18n 的约定，用于处理父键同时有子键的情况）
        if (typeof value === 'object' && value !== null && !Array.isArray(value) && '_' in value) {
          value = value._;
        }
        const processed = processTranslation(value, i18nKey);
        if (processed) {
          finalTranslatedValue = processed;
          return finalTranslatedValue;
        }
      }
      
      // 优先级3：使用 Vue I18n 的 t() 函数（作为后备）
      const keyExists = mainAppI18n.global.te(i18nKey, currentLocale);
      if (keyExists) {
        const translated = mainAppI18n.global.t(i18nKey, currentLocale);
        const processed = processTranslation(translated, i18nKey);
        if (processed) {
          finalTranslatedValue = processed;
          return finalTranslatedValue;
        }
      }
    }
    
    // 如果主应用 i18n 实例不可用或翻译失败，使用组件内的 t() 函数（响应式）
    const translated = t(i18nKey);
    const processed = processTranslation(translated, i18nKey);
    if (processed) {
      finalTranslatedValue = processed;
      return finalTranslatedValue;
    }
  }
  
  // 如果没有 labelKey 或翻译失败，直接返回 title（可能是已翻译的文本）
  if (item.title) {
    finalTranslatedValue = item.title;
    return finalTranslatedValue;
  }
  
  return '';
};

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
  const currentMatch = getMenuTitle(item).toLowerCase().includes(keyword);

  // 如果有子菜单，检查子菜单是否有匹配项
  if (item.children && item.children.length > 0) {
    const hasMatchingChildren = item.children.some(child => isMenuVisible(child));
    return currentMatch || hasMatchingChildren;
  }

  return currentMatch;
};
</script>
