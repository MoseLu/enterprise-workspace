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

import { computed, onMounted, type ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { useProcessStore, getCurrentAppFromPath } from '../../../../store/process';
import { getManifestRoute } from '@btc/shared-core/manifest';
import { getMenusForApp } from '../../../../store/menuRegistry';
import { getSubApps, getAppBySubdomain } from '@btc/shared-core/configs/app-scanner';
import { initGlobalTabBreadcrumbListener, globalBreadcrumbList } from '../../../../composables/useGlobalTabBreadcrumbState';

// 判断是否为SVG图标
function isSvgIcon(iconName?: string): boolean {
  return iconName?.startsWith('svg:') ?? false;
}

// 获取SVG图标名称（移除 svg: 前缀）
function getSvgName(iconName?: string): string {
  return iconName?.replace(/^svg:/, '') || '';
}

const route = useRoute();
const { t } = useI18n();
const processStore = useProcessStore();

// 初始化全局状态监听器（单例模式，只注册一次）
onMounted(() => {
  initGlobalTabBreadcrumbListener();
});

interface BreadcrumbItem {
  label: string;
  icon?: string;
  path?: string;
}

// 内部使用的面包屑配置类型
interface BreadcrumbConfig {
  i18nKey?: string;
  labelKey?: string;
  label?: string;
  icon?: string;
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
const breadcrumbList: ComputedRef<BreadcrumbItem[]> = computed(() => {
  // 如果路由 meta 中标记为首页，不显示面包屑
  if (route.meta?.isHome === true) {
    return [];
  }

  // 关键：优先使用 window.location.pathname，因为它不受路由初始化时机影响
  // 在页面刷新时，window.location.pathname 已经有正确的值，而 route.path 可能还在初始化
  const locationPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const routePath = route?.path || '';
  const pathToUse = locationPath || routePath;
  const normalizedPath = pathToUse.replace(/\/+$/, '') || '/';

  // 生产环境子域名判断：路径为 / 且当前应用是子应用（双重保险，即使 showBreadcrumb 判断失败也能保证不显示内容）
  if (normalizedPath === '/' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const appBySubdomain = getAppBySubdomain(hostname);
    // 如果通过子域名识别到子应用，则不显示面包屑
    if (appBySubdomain && appBySubdomain.type === 'sub') {
      return [];
    }
  }

  // 开发/预览环境：检查路径是否匹配任何子应用的 pathPrefix
  const subApps = getSubApps();
  for (const app of subApps) {
    const normalizedPathPrefix = app.pathPrefix.endsWith('/')
      ? app.pathPrefix.slice(0, -1)
      : app.pathPrefix;
    const normalizedPathForCheck = normalizedPath.endsWith('/') && normalizedPath !== '/'
      ? normalizedPath.slice(0, -1)
      : normalizedPath;

    // 精确匹配 pathPrefix 不显示面包屑
    if (normalizedPathForCheck === normalizedPathPrefix) {
      return [];
    }
  }

  const currentApp = getCurrentAppFromPath(normalizedPath);

  const currentTab =
    processStore.list.find(
      (tab) =>
        (tab.fullPath && tab.fullPath.replace(/\/+$/, '') === normalizedPath) ||
        (tab.path && tab.path.replace(/\/+$/, '') === normalizedPath),
    ) ?? null;

  // 辅助函数：处理翻译结果（与菜单组件保持一致）
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

  const normalizeBreadcrumbEntries = (entries: any[] | undefined) => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    // 使用外部已经计算好的 normalizedPath，确保路径一致性
    const currentApp = getCurrentAppFromPath(normalizedPath);

    return entries
      .map((item) => {
        // 优先使用传入的 label，如果没有则翻译 i18nKey
        let label: string = item.label || '';
        const i18nKey = (typeof item.labelKey === 'string' && item.labelKey) ||
          (typeof item.i18nKey === 'string' && item.i18nKey);

        if (!label && i18nKey) {
          // 优先使用主应用的 i18n 实例（确保能访问到已合并的语言包）
          // 注意：与菜单组件使用相同的翻译逻辑
          const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
          if (mainAppI18n && mainAppI18n.global) {
            // 关键：访问响应式的 locale，确保当 i18n 更新时 computed 会重新计算
            const localeValue = mainAppI18n.global.locale;
            const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) || 'zh-CN';
            const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
            // 为了确保响应式，我们访问 locale（响应式的），这样当 i18n 更新时会重新计算
            void localeValue; // 触发响应式追踪

            // 优先级1：直接访问扁平化的 key（支持扁平化消息结构）
            if (i18nKey in messages) {
              const value = messages[i18nKey];
              const processed = processTranslation(value, i18nKey);
              if (processed) {
                label = processed;
              }
            }

            // 优先级2：如果直接访问失败，尝试按路径访问嵌套结构（处理嵌套消息结构）
            if (!label) {
              const keys = i18nKey.split('.');
              let value = messages;
              let pathSoFar = '';
              for (const k of keys) {
                pathSoFar += (pathSoFar ? '.' : '') + k;
                if (value && typeof value === 'object' && k in value) {
                  value = value[k];
                  // 如果 value 是字符串，但还有更多层级要访问，说明结构有问题
                  // 这可能是因为 value 是父键的值（如 menu.access = "权限管理"），而不是对象
                  // 在这种情况下，应该停止路径访问，尝试使用 t() 函数
                  if (typeof value === 'string' && keys.indexOf(k) < keys.length - 1) {
                    value = undefined;
                    break;
                  }
                } else {
                  // 如果 value 是字符串，说明已经到达了叶子节点，但当前 i18nKey 还有更多层级
                  // 这可能是因为 value 是父键的值（如 menu.access = "权限管理"），而不是对象
                  // 在这种情况下，应该尝试使用组件内的 t() 函数
                  value = undefined;
                  break;
                }
              }
              if (value !== undefined) {
                // 如果值是对象且包含 _ 键，需要判断：
                // - 如果当前 i18nKey 是父键（如 menu.access），且有子键（如 relations），使用 _ 键的值
                // - 如果当前 i18nKey 是子键（如 menu.access.relations），直接使用 value 本身（字符串）
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  if ('_' in value) {
                    // 检查当前 i18nKey 是否还有更深层的子键
                    // 如果有子键，说明当前 i18nKey 是父键，应该使用 _ 键的值
                    // 如果没有子键，说明当前 i18nKey 是叶子节点，但 value 是对象，说明可能是父键的值，使用 _ 键
                    const childKeys = Object.keys(value).filter(k => k !== '_');
                    if (childKeys.length > 0) {
                      // 有子键，说明当前 i18nKey 是父键，使用 _ 键的值
                      value = value._;
                    } else {
                      // 没有子键，但 value 是对象且只有 _ 键，说明这是父键的值，使用 _ 键
                      value = value._;
                    }
                  }
                }
                const processed = processTranslation(value, i18nKey);
                if (processed) {
                  label = processed;
                }
              }
            }

            // 优先级3：如果路径访问失败，尝试使用 Vue I18n 的 t() 函数（作为后备）
            if (!label) {
              const keyExists = mainAppI18n.global.te(i18nKey, currentLocale);
              if (keyExists) {
                const translated = mainAppI18n.global.t(i18nKey, currentLocale);
                const processed = processTranslation(translated, i18nKey);
                if (processed) {
                  label = processed;
                }
              }
            }
          }

          // 如果主应用 i18n 实例不可用或翻译失败，使用组件内的 t() 函数（响应式）
          // 注意：组件内的 t() 函数会自动访问主应用的 i18n（如果已合并），并且是响应式的
          if (!label) {
            const translated = t(i18nKey);
            const processed = processTranslation(translated, i18nKey);
            if (processed) {
              label = processed;
            } else {
              label = i18nKey;
            }
          }
        }

        if (!label) {
          label = i18nKey || '';
        }

        if (!label) {
          return null;
        }

        // 优先从菜单注册表中查找图标（确保与左侧菜单图标一致）
        let icon: string | undefined;
        // i18nKey 已经在上面声明过了，这里直接使用
        if (i18nKey) {
          const menuIcon = findMenuIconByI18nKey(i18nKey, currentApp);
          if (menuIcon) {
            icon = menuIcon;
          }
        }
        // 如果菜单注册表中没有找到图标，使用 manifest/路由 meta 中指定的图标（兜底）
        if (!icon && item.icon) {
          icon = item.icon;
        }

        const result: BreadcrumbItem = {
          label,
        };
        if (icon) {
          result.icon = icon;
        }
        if (item.path) {
          result.path = item.path;
        }
        return result;
      })
      .filter(Boolean) as BreadcrumbItem[];
  };

  // 优先级 1: 全局状态的 breadcrumbList（微应用推送或主应用更新）
  if (globalBreadcrumbList.value.length > 0) {
    return normalizeBreadcrumbEntries(globalBreadcrumbList.value);
  }

  const metaBreadcrumbs = normalizeBreadcrumbEntries(
    currentTab?.meta?.breadcrumbs,
  );
  if (metaBreadcrumbs.length > 0) {
    return metaBreadcrumbs;
  }

  const manifestBreadcrumbs = normalizeBreadcrumbEntries(
    getManifestRoute(currentApp, normalizedPath)?.breadcrumbs,
  );
  if (manifestBreadcrumbs.length > 0) {
    return manifestBreadcrumbs;
  }

  // 如果路由 meta 中标记为首页，不显示面包屑（已在开头检查，这里保留兼容逻辑）
  // 系统应用和管理应用的首页不显示面包屑
  const homePaths = new Set(['/', '/admin']);
  if (homePaths.has(normalizedPath)) {
    if ((normalizedPath === '/' && currentApp === 'system') ||
        (normalizedPath === '/admin' && currentApp === 'admin')) {
      return [];
    }
  }

  // 统一的面包屑生成逻辑：优先从菜单注册表中根据路径查找，然后从路由 meta.titleKey 生成
  let breadcrumbData: BreadcrumbConfig[] | undefined;

  // 方法1：从菜单注册表中根据路径反向查找菜单项，生成面包屑路径
  if (currentApp) {
    const menus = getMenusForApp(currentApp);

    // 递归查找匹配路径的菜单项
    function findMenuItemByPath(items: any[], targetPath: string, pathStack: any[] = []): any[] | null {
      for (const item of items) {
        const currentStack = [...pathStack, item];

        // 检查当前菜单项的路径是否匹配（支持精确匹配和前缀匹配）
        if (item.index) {
          const itemPath = item.index.replace(/\/+$/, '') || '/';
          const normalizedItemPath = itemPath;
          const normalizedTargetPath = targetPath.replace(/\/+$/, '') || '/';

          // 精确匹配
          if (normalizedItemPath === normalizedTargetPath) {
            return currentStack;
          }

          // 处理动态路由（如 /org/users/:id/roles）
          // 使用正则表达式匹配动态路由参数
          const dynamicPattern = normalizedItemPath.replace(/:[^/]+/g, '[^/]+');
          const regex = new RegExp(`^${dynamicPattern}$`);
          if (regex.test(normalizedTargetPath)) {
            return currentStack;
          }
        }

        // 递归查找子菜单
        if (item.children && item.children.length > 0) {
          const found = findMenuItemByPath(item.children, targetPath, currentStack);
          if (found) {
            return found;
          }
        }
      }
      return null;
    }

    const menuPath = findMenuItemByPath(menus, normalizedPath);
    if (menuPath && menuPath.length > 0) {
      // 从菜单路径生成面包屑配置
      breadcrumbData = menuPath.map((item: any) => ({
        i18nKey: item.labelKey || item.title,
      }));
    }
  }

  // 方法2：如果菜单注册表中找不到，从路由 meta.titleKey 自动生成
  if (!breadcrumbData) {
    const titleKey = (route.meta?.titleKey || route.meta?.labelKey) as string | undefined;
    if (titleKey && titleKey.startsWith('menu.')) {
      // 从 titleKey 生成面包屑路径（如 menu.procurement.auxiliary -> [menu.procurement, menu.procurement.auxiliary]）
      const parts = titleKey.split('.');
      breadcrumbData = [];

      // 生成层级路径（menu.procurement, menu.procurement.auxiliary）
      for (let i = 1; i < parts.length; i++) {
        const key = `menu.${parts.slice(1, i + 1).join('.')}`;
        breadcrumbData.push({ i18nKey: key });
      }
    }
  }

  if (!breadcrumbData) {
    return [];
  }

  // 转换为面包屑，并从菜单注册表中获取图标
  return breadcrumbData.map((item): BreadcrumbItem => {
    // 优先使用配置中的图标，如果没有则从菜单注册表中查找
    const menuIcon = item.i18nKey ? findMenuIconByI18nKey(item.i18nKey, currentApp) : undefined;
    // 优先使用传入的 label，如果没有则翻译 i18nKey
    let label: string = item.label || '';

    if (!label && item.i18nKey) {
      // 优先使用主应用的 i18n 实例（确保能访问到已合并的语言包）
      // 注意：与菜单组件使用相同的翻译逻辑
      const mainAppI18n = typeof window !== 'undefined' ? (window as any).__MAIN_APP_I18N__ : null;
      if (mainAppI18n && mainAppI18n.global) {
        // 关键：访问响应式的 locale，确保当 i18n 更新时 computed 会重新计算
        const localeValue = mainAppI18n.global.locale;
        const currentLocale = (typeof localeValue === 'string' ? localeValue : localeValue.value) || 'zh-CN';
        const messages = mainAppI18n.global.getLocaleMessage(currentLocale);
        // 为了确保响应式，我们访问 locale（响应式的），这样当 i18n 更新时会重新计算
        void localeValue; // 触发响应式追踪

        // 优先级1：直接访问扁平化的 key（支持扁平化消息结构）
        if (item.i18nKey in messages) {
          const value = messages[item.i18nKey];
          const processed = processTranslation(value, item.i18nKey);
          if (processed) {
            label = processed;
          }
        }

        // 优先级2：如果直接访问失败，尝试按路径访问嵌套结构（处理嵌套消息结构）
        if (!label) {
          const keys = item.i18nKey.split('.');
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
            const processed = processTranslation(value, item.i18nKey);
            if (processed) {
              label = processed;
            }
          }
        }

        // 优先级3：如果路径访问失败，尝试使用 Vue I18n 的 t() 函数（作为后备）
        if (!label) {
          const keyExists = mainAppI18n.global.te(item.i18nKey, currentLocale);
          if (keyExists) {
            const translated = mainAppI18n.global.t(item.i18nKey, currentLocale);
            const processed = processTranslation(translated, item.i18nKey);
            if (processed) {
              label = processed;
            }
          }
        }
      }

      // 如果主应用 i18n 实例不可用或翻译失败，使用组件内的 t() 函数（响应式）
      // 注意：组件内的 t() 函数会自动访问主应用的 i18n（如果已合并），并且是响应式的
      // 关键：即使主应用 i18n 可用，如果路径访问和 t() 都失败，也要尝试组件内的 t()
      // 因为组件内的 t() 可能能访问到已合并的消息
      if (!label) {
        const translated = t(item.i18nKey);
        // 如果组件内的 t() 返回的是键本身，尝试从主应用 i18n 直接访问
        if (translated === item.i18nKey && mainAppI18n && mainAppI18n.global) {
          // 重新获取 currentLocale（因为可能不在上面的作用域内）
          const localeValueForFallback = mainAppI18n.global.locale;
          const currentLocaleForFallback = (typeof localeValueForFallback === 'string' ? localeValueForFallback : localeValueForFallback.value) || 'zh-CN';
          const messagesForFallback = mainAppI18n.global.getLocaleMessage(currentLocaleForFallback);
          
          // 优先级1：直接访问扁平化的 key
          if (item.i18nKey in messagesForFallback) {
            const value = messagesForFallback[item.i18nKey];
            const processed = processTranslation(value, item.i18nKey);
            if (processed) {
              label = processed;
            }
          }
          
          // 优先级2：如果直接访问失败，尝试路径访问
          if (!label) {
            const keys = item.i18nKey.split('.');
            let value = messagesForFallback;
            for (const k of keys) {
              if (value && typeof value === 'object' && k in value) {
                value = value[k];
              } else {
                value = undefined;
                break;
              }
            }
            if (value !== undefined) {
              if (typeof value === 'object' && value !== null && !Array.isArray(value) && '_' in value) {
                value = value._;
              }
              const processed = processTranslation(value, item.i18nKey);
              if (processed) {
                label = processed;
              }
            }
          }
        } else {
          const processed = processTranslation(translated, item.i18nKey);
          if (processed) {
            label = processed;
          } else {
            label = item.i18nKey;
          }
        }
      }
    }

    if (!label) {
      label = item.i18nKey || '';
    }
    const result: BreadcrumbItem = {
      label,
    };
    const icon = item.icon || menuIcon;
    if (icon) {
      result.icon = icon;
    }
    return result;
  });
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
  width: 100% !important; // 使用 !important 防止被覆盖，确保宽度稳定
  box-sizing: border-box !important; // 使用 !important 防止被覆盖，确保边框包含在宽度内

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
