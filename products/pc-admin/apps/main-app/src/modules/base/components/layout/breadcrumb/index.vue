<template>
  <div class="app-breadcrumb">
    <el-breadcrumb separator="|">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        <span class="breadcrumb-item">
          <!-- SVG 图标 -->
          <btc-svg
            v-if="item.icon && isSvgIcon(item.icon)"
            :name="getSvgName(item.icon)"
            :size="14"
            class="breadcrumb-icon"
          />
          <!-- Element Plus 图标 -->
          <el-icon
            v-else-if="item.icon && ElementPlusIconsVue[item.icon as keyof typeof ElementPlusIconsVue]"
            :size="14"
            class="breadcrumb-icon"
          >
            <component :is="ElementPlusIconsVue[item.icon as keyof typeof ElementPlusIconsVue]" />
          </el-icon>
          <span>{{ item.label }}</span>
        </span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutBreadcrumb',
});

import { useI18n } from '@btc/shared-core';
import { tSync } from '@/i18n/getters';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { useProcessStore, getCurrentAppFromPath } from '@/store/process';
import { getManifestRoute } from '@btc/shared-core/manifest';
import { getMenusForApp } from '@/store/menuRegistry';
import { initGlobalTabBreadcrumbListener, globalBreadcrumbList } from '@btc/shared-components/composables/useGlobalTabBreadcrumbState';

const route = useRoute();
const { t, te } = useI18n();
const processStore = useProcessStore();

// 初始化全局状态监听器
onMounted(() => {
  initGlobalTabBreadcrumbListener();
});

interface BreadcrumbItem {
  label: string;
  icon?: string;
  path?: string;
}


// 判断是否为SVG图标
function isSvgIcon(iconName?: string): boolean {
  return iconName?.startsWith('svg:') ?? false;
}

// 获取SVG图标名称（移除 svg: 前缀）
function getSvgName(iconName?: string): string {
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

// 根据路由生成面包屑（应用隔离）
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  // 优先级 1: 从全局状态获取面包屑（由 updateMainAppTabBreadcrumb 或子应用更新）
  if (globalBreadcrumbList.value && globalBreadcrumbList.value.length > 0) {
    return globalBreadcrumbList.value.map((item: any) => {
      // 确保图标格式正确
      let icon = item.icon;
      if (icon && !icon.startsWith('svg:') && !ElementPlusIconsVue[icon as keyof typeof ElementPlusIconsVue]) {
        // 如果图标不是 Element Plus 图标，假设是 SVG 图标，添加 svg: 前缀
        icon = `svg:${icon}`;
      }
      
      // 优先使用 i18nKey 进行实时翻译（确保使用最新的国际化数据）
      let label = item.label || '';
      if (item.i18nKey) {
        // 优先使用主应用的 i18n 实例（确保能访问到已合并的语言包）
        const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
        if (mainAppI18n && mainAppI18n.global) {
          const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
          const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
          
          // 直接访问消息对象，确保能访问到已合并的语言包
          if (item.i18nKey in messages) {
            const value = messages[item.i18nKey];
            if (typeof value === 'string' && value.trim() !== '') {
              label = value;
            } else if (typeof value === 'function') {
              try {
                const result = value({ normalize: (arr: any[]) => arr[0] });
                if (typeof result === 'string' && result.trim() !== '') {
                  label = result;
                }
              } catch {
                // 如果函数调用失败，继续使用其他方法
              }
            }
          }
          
          // 如果直接访问失败，使用 te 和 t
          if (!label && mainAppI18n.global.te(item.i18nKey, currentLocale)) {
            const translated = mainAppI18n.global.t(item.i18nKey, currentLocale);
            if (translated && typeof translated === 'string' && translated !== item.i18nKey && translated.trim() !== '') {
              label = translated;
            }
          }
        }
        
        // 如果主应用 i18n 实例不可用或翻译失败，使用组件内的 t() 函数（响应式）
        if (!label) {
          // 即使 te() 返回 false，也尝试翻译（因为子应用的国际化数据可能已加载但 te() 未检测到）
          const translated = t(item.i18nKey);
          if (translated && translated !== item.i18nKey) {
            label = translated;
          } else if (!item.label) {
            // 如果翻译失败且没有 label，使用 i18nKey 作为后备
            label = item.i18nKey;
          }
        }
      }
      
      return {
        label,
        icon,
        path: item.path,
      };
    });
  }

  const normalizedPath = route.path.replace(/\/+$/, '') || '/';
  const currentApp = getCurrentAppFromPath(normalizedPath);

  const currentTab =
    processStore.list.find(
      (tab) =>
        (tab.fullPath && tab.fullPath.replace(/\/+$/, '') === normalizedPath) ||
        (tab.path && tab.path.replace(/\/+$/, '') === normalizedPath),
    ) ?? null;

  const normalizeBreadcrumbEntries = (entries: any[] | undefined) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    // 使用外部已经计算好的 normalizedPath 和 currentApp，确保路径一致性
    const currentAppForNormalize = getCurrentAppFromPath(normalizedPath);

    return entries
      .map((item) => {
        const key =
          (typeof item.labelKey === 'string' && item.labelKey) ||
          (typeof item.i18nKey === 'string' && item.i18nKey);
        const rawLabel =
          (typeof item.label === 'string' && item.label) ||
          (typeof key === 'string' ? key : '');

        if (!rawLabel) {
          return null;
        }

        // 优先使用 key 进行翻译，如果 key 不存在则使用 rawLabel
        let translated: string;
        if (key) {
          // 优先使用主应用的 i18n 实例进行翻译
          const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
          if (mainAppI18n && mainAppI18n.global) {
            const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
            const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
            
            // 直接访问消息对象，确保能访问到已合并的语言包
            if (key in messages) {
              const value = messages[key];
              if (typeof value === 'string' && value.trim() !== '') {
                translated = value;
              } else if (typeof value === 'function') {
                try {
                  const result = value({ normalize: (arr: any[]) => arr[0] });
                  if (typeof result === 'string' && result.trim() !== '') {
                    translated = result;
                  }
                } catch {
                  // 如果函数调用失败，继续使用其他方法
                }
              }
            }
            
            // 如果直接访问失败，使用 t() 函数
            if (!translated && mainAppI18n.global.te(key, currentLocale)) {
              const mainTranslated = mainAppI18n.global.t(key, currentLocale);
              if (mainTranslated && typeof mainTranslated === 'string' && mainTranslated !== key && mainTranslated.trim() !== '') {
                translated = mainTranslated;
              }
            }
          }
          
          // 如果主应用翻译失败，尝试使用组件级别的 t() 函数（响应式）
          if (!translated) {
            translated = t(key);
            // 如果翻译失败（返回值等于 key），尝试使用 tSync
            if (translated === key) {
              const syncTranslated = tSync(key);
              if (syncTranslated && syncTranslated !== key) {
                translated = syncTranslated;
              }
            }
          }
        } else {
          // 优先使用主应用的 i18n 实例进行翻译
          const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
          if (mainAppI18n && mainAppI18n.global && rawLabel.includes('.')) {
            const currentLocale = mainAppI18n.global.locale.value || 'zh-CN';
            const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
            
            // 直接访问消息对象，确保能访问到已合并的语言包
            if (rawLabel in messages) {
              const value = messages[rawLabel];
              if (typeof value === 'string' && value.trim() !== '') {
                translated = value;
              } else if (typeof value === 'function') {
                try {
                  const result = value({ normalize: (arr: any[]) => arr[0] });
                  if (typeof result === 'string' && result.trim() !== '') {
                    translated = result;
                  }
                } catch {
                  // 如果函数调用失败，继续使用其他方法
                }
              }
            }
            
            // 如果直接访问失败，使用 t() 函数
            if (!translated && mainAppI18n.global.te(rawLabel, currentLocale)) {
              const mainTranslated = mainAppI18n.global.t(rawLabel, currentLocale);
              if (mainTranslated && typeof mainTranslated === 'string' && mainTranslated !== rawLabel && mainTranslated.trim() !== '') {
                translated = mainTranslated;
              }
            }
          }
          
          // 如果主应用翻译失败，尝试使用组件级别的 t() 函数（响应式）
          if (!translated) {
            translated = t(rawLabel);
            // 如果翻译失败（返回值等于 rawLabel），尝试使用 tSync
            if (translated === rawLabel && rawLabel.includes('.')) {
              const syncTranslated = tSync(rawLabel);
              if (syncTranslated && syncTranslated !== rawLabel) {
                translated = syncTranslated;
              }
            }
          }
        }
        
        const label =
          translated && translated !== (key ?? rawLabel) ? translated : rawLabel;

        // 处理图标：优先从菜单注册表中查找图标（确保与左侧菜单图标一致）
        let icon: string | undefined;
        if (key) {
          const menuIcon = findMenuIconByI18nKey(key, currentAppForNormalize);
          if (menuIcon) {
            // 确保图标格式正确：如果是 SVG 图标但没有 svg: 前缀，添加前缀
            icon = menuIcon.startsWith('svg:') ? menuIcon : `svg:${menuIcon}`;
          }
        }
        // 如果菜单注册表中没有找到图标，使用 manifest/路由 meta 中指定的图标（兜底）
        if (!icon && item.icon) {
          icon = item.icon;
          // 确保图标格式正确
          if (!icon.startsWith('svg:') && !ElementPlusIconsVue[icon as keyof typeof ElementPlusIconsVue]) {
            // 如果图标不是 Element Plus 图标，假设是 SVG 图标，添加 svg: 前缀
            icon = `svg:${icon}`;
          }
        }

        return {
          label,
          icon,
        };
      })
      .filter(Boolean) as BreadcrumbItem[];
  };

  const metaBreadcrumbs = normalizeBreadcrumbEntries(
    (currentTab?.meta as any)?.breadcrumbs,
  );
  if (metaBreadcrumbs.length > 0) {
    return metaBreadcrumbs;
  }

  // 尝试从 manifest 获取面包屑
  // 注意：getManifestRoute 需要完整路径（包含应用前缀），它会自动去掉前缀后匹配 manifest
  const manifestRoute = getManifestRoute(currentApp, normalizedPath);
  const manifestBreadcrumbs = normalizeBreadcrumbEntries(manifestRoute?.breadcrumbs);
  if (manifestBreadcrumbs.length > 0) {
    return manifestBreadcrumbs;
  }

  // 如果 manifest 中没有面包屑信息，返回空数组
  // 所有应用的面包屑信息都应该在 manifest 的 routes 中定义
  return [];
});
</script>

<style lang="scss" scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 10px; // 统一左右 padding
  user-select: none;
  background-color: var(--el-bg-color);
  overflow: hidden;
  height: 39px; // 总高度 39px（包含 padding）
  box-sizing: border-box;

  :deep(.el-breadcrumb) {
    font-size: 14px;
    display: flex;
    align-items: center;
    height: 100%;
  }

  :deep(.el-breadcrumb__item) {
    display: flex;
    align-items: center;

    .el-breadcrumb__inner {
      color: var(--el-text-color-regular);
      font-weight: normal;
      cursor: default;
      pointer-events: none;
      padding: 0; // 移除默认 padding
    }

    &:last-child .el-breadcrumb__inner {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  :deep(.el-breadcrumb__separator) {
    color: var(--el-text-color-placeholder);
    margin: 0 8px;
    font-weight: normal;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-fill-color-blank);
    height: 26px;
  }

  .breadcrumb-icon {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  // 最后一级样式（当前页面）
  :deep(.el-breadcrumb__item:last-child) {
    .breadcrumb-item {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-5);
      color: var(--el-text-color-primary);

      .breadcrumb-icon {
        color: var(--el-color-primary);
      }
    }
  }
}

// 深色主题样式（全局样式，不使用 scoped）
html.dark .app-breadcrumb {
  .breadcrumb-item {
    border-color: var(--el-border-color) !important;
    background-color: var(--el-bg-color) !important;
  }

  :deep(.el-breadcrumb__item:last-child) {
    .breadcrumb-item {
      background-color: var(--el-color-primary-light-9) !important;
      border-color: var(--el-color-primary-light-5) !important;
    }
  }
}
</style>
