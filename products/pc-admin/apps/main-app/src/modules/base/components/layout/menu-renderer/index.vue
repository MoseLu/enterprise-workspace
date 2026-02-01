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
        <span>{{ getMenuTitle(item) }}</span>
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
      <span>{{ getMenuTitle(item) }}</span>
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

const { t, te } = useI18n();

// 获取主应用的 i18n 实例（用于确保翻译正确）
const getMainAppI18n = () => {
  if (typeof window !== 'undefined' && (window as any).__MAIN_APP_I18N__) {
    return (window as any).__MAIN_APP_I18N__;
  }
  return null;
};

// 获取菜单标题（优先使用已翻译的 title，否则使用 labelKey 翻译）
const getMenuTitle = (item: MenuItem): string => {
  // 优先级 1: 如果 title 存在且不是 i18n key（不包含点号），直接使用（可能是已翻译的文本）
  if (item.title && typeof item.title === 'string' && !item.title.includes('.')) {
    return item.title;
  }

  // 优先级 2: 使用 labelKey 进行翻译（这是原始的 i18n key）
  if (item.labelKey && typeof item.labelKey === 'string') {
    // 优先使用主应用的全局 i18n 实例（确保能访问到已合并的语言包）
    const mainAppI18n = getMainAppI18n();
    if (mainAppI18n && mainAppI18n.global) {
      const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
      const messages = mainAppI18n.global.getLocaleMessage(currentLocale);

      // 调试：检查 key 是否存在
      if (import.meta.env.DEV && !(item.labelKey in messages)) {
        console.warn(`[MenuRenderer] ⚠️ Key "${item.labelKey}" not found in main app i18n messages:`, {
          labelKey: item.labelKey,
          totalKeys: Object.keys(messages).length,
          hasMenuPlatform: 'menu.platform' in messages,
          hasMenuOrg: 'menu.org' in messages,
          hasMenuAccess: 'menu.access' in messages,
          sampleKeys: Object.keys(messages).filter(k => k.startsWith('menu.')).slice(0, 10),
        });
      }

      // 直接访问消息对象，确保能访问到已合并的语言包
      if (item.labelKey in messages) {
        const value = messages[item.labelKey];
        if (typeof value === 'string' && value.trim() !== '') {
          return value;
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
      if (mainAppI18n.global.te(item.labelKey, currentLocale)) {
        const translated = mainAppI18n.global.t(item.labelKey, currentLocale);
        if (translated && typeof translated === 'string' && translated !== item.labelKey && translated.trim() !== '') {
          return translated;
        }
      }
    }

    // 如果主应用 i18n 实例不可用，尝试使用组件内的 t() 函数（响应式）
    let translated = t(item.labelKey);
    if (translated && translated !== item.labelKey) {
      return translated;
    }

    // 调试：如果翻译失败，打印信息
    if (import.meta.env.DEV && translated === item.labelKey) {
      const mainAppI18n = getMainAppI18n();
      const keyExistsInComponent = te(item.labelKey);
      const keyExistsInMainI18n = mainAppI18n && mainAppI18n.global
        ? mainAppI18n.global.te(item.labelKey, mainAppI18n.global.locale.value || 'zh-CN')
        : false;

      console.warn(`[MenuRenderer] ⚠️ Translation failed for labelKey "${item.labelKey}":`, {
        labelKey: item.labelKey,
        translated,
        keyExistsInComponent,
        keyExistsInMainI18n,
        mainAppI18nExists: !!mainAppI18n,
        currentLocale: mainAppI18n?.global?.locale?.value,
        title: item.title,
      });
    }
  }

  // 优先级 3: 如果 title 是 i18n key（包含点号），尝试翻译
  if (item.title && typeof item.title === 'string' && item.title.includes('.')) {
    // 优先使用主应用的 i18n 实例
    const mainAppI18n = getMainAppI18n();
    if (mainAppI18n && mainAppI18n.global) {
      const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
      const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
      if (item.title in messages) {
        const value = messages[item.title];
        if (typeof value === 'string') {
          return value;
        }
      }
      if (mainAppI18n.global.te(item.title, currentLocale)) {
        const translated = mainAppI18n.global.t(item.title, currentLocale);
        if (translated && typeof translated === 'string' && translated !== item.title) {
          return translated;
        }
      }
    }

    // 如果主应用 i18n 实例不可用，使用组件内的 t() 函数
    let translated = t(item.title);
    if (translated && translated !== item.title) {
      return translated;
    }
  }

  // 优先级 4: 回退到 title（如果存在）
  if (item.title && typeof item.title === 'string') {
    return item.title;
  }

  // 优先级 5: 回退到 labelKey（如果存在）
  if (item.labelKey && typeof item.labelKey === 'string') {
    return item.labelKey;
  }

  // 优先级 6: 回退到 index
  return item.index;
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
  const currentMatch = t(item.title).toLowerCase().includes(keyword);

  // 如果有子菜单，检查子菜单是否有匹配项
  if (item.children && item.children.length > 0) {
    const hasMatchingChildren = item.children.some(child => isMenuVisible(child));
    return currentMatch || hasMatchingChildren;
  }

  return currentMatch;
};
</script>
