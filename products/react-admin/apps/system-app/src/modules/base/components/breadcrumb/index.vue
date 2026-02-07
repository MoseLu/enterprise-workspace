<template>
  <div class="app-breadcrumb">
    <el-breadcrumb separator="|">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">
        <span class="breadcrumb-item">
          <el-icon
            v-if="item.icon && ElementPlusIconsVue[item.icon as keyof typeof ElementPlusIconsVue]"
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
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { useProcessStore, getCurrentAppFromPath } from '@/store/process';
import { getManifestRoute } from '@btc/shared-core/manifest';

const route = useRoute();
const { t } = useI18n();
const processStore = useProcessStore();

interface BreadcrumbItem {
  label: string;
  icon?: string;
  path?: string;
}

// 内部使用的面包屑配置类型
interface BreadcrumbConfig {
  i18nKey: string;
  icon?: string;
}

// 根据路由生成面包屑（应用隔离）
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
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

        const translated = key ? t(key) : t(rawLabel);
        const label =
          translated && translated !== (key ?? rawLabel) ? translated : rawLabel;

        return {
          label,
          icon: item.icon,
        };
      })
      .filter(Boolean) as BreadcrumbItem[];
  };

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

  // 管理域的路径映射（完整层级结构）
  const adminAppBreadcrumbs: Record<string, BreadcrumbConfig[]> = {
    // 平台治理
    '/admin/platform/domains': [
      { i18nKey: 'menu.platform', icon: 'Coin' },
      { i18nKey: 'menu.platform.domains', icon: 'Location' },
    ],
    '/admin/platform/modules': [
      { i18nKey: 'menu.platform', icon: 'Coin' },
      { i18nKey: 'menu.platform.modules', icon: 'Files' },
    ],
    '/admin/platform/plugins': [
      { i18nKey: 'menu.platform', icon: 'Coin' },
      { i18nKey: 'menu.platform.plugins', icon: 'Connection' },
    ],

    // 组织与账号
    '/admin/org/tenants': [
      { i18nKey: 'menu.org', icon: 'OfficeBuilding' },
      { i18nKey: 'menu.org.tenants', icon: 'School' },
    ],
    '/admin/org/departments': [
      { i18nKey: 'menu.org', icon: 'OfficeBuilding' },
      { i18nKey: 'menu.org.departments', icon: 'Postcard' },
    ],
    '/admin/org/users': [
      { i18nKey: 'menu.org', icon: 'OfficeBuilding' },
      { i18nKey: 'menu.org.users', icon: 'User' },
    ],

    // 访问控制
    '/admin/access/resources': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.config', icon: 'Setting' },
      { i18nKey: 'menu.access.resources', icon: 'FolderOpened' },
    ],
    '/admin/access/actions': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.config', icon: 'Setting' },
      { i18nKey: 'menu.access.actions', icon: 'TrendCharts' },
    ],
    '/admin/access/permissions': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.config', icon: 'Setting' },
      { i18nKey: 'menu.access.permissions', icon: 'Key' },
    ],
    '/admin/access/roles': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.config', icon: 'Setting' },
      { i18nKey: 'menu.access.roles', icon: 'UserFilled' },
    ],
    '/admin/access/perm-compose': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.relations', icon: 'Link' },
      { i18nKey: 'menu.access.perm_compose', icon: 'Grid' },
    ],
    '/admin/org/users/:id/roles': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.relations', icon: 'Link' },
      { i18nKey: 'menu.access.user_assign', icon: 'User' },
      { i18nKey: 'menu.access.user_role_bind', icon: 'UserFilled' },
    ],
    '/admin/org/users/users-roles': [
      { i18nKey: 'menu.access', icon: 'Lock' },
      { i18nKey: 'menu.access.relations', icon: 'Link' },
      { i18nKey: 'menu.access.user_assign', icon: 'User' },
      { i18nKey: 'menu.access.user_role_bind', icon: 'UserFilled' },
    ],

    // 导航与可见性
    '/admin/navigation/menus': [
      { i18nKey: 'menu.navigation', icon: 'Menu' },
      { i18nKey: 'menu.navigation.menus', icon: 'List' },
    ],
    '/admin/navigation/menus/preview': [
      { i18nKey: 'menu.navigation', icon: 'Menu' },
      { i18nKey: 'menu.navigation.menu_preview', icon: 'View' },
    ],

    // 运维与审计
    '/admin/ops/logs/operation': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.logs', icon: 'Document' },
      { i18nKey: 'menu.ops.operation_log', icon: 'Operation' },
    ],
    '/admin/ops/logs/request': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.logs', icon: 'Document' },
      { i18nKey: 'menu.ops.request_log', icon: 'Connection' },
    ],
    '/admin/ops/baseline': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.baseline', icon: 'Histogram' },
    ],
    '/admin/ops/api-list': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.api_list', icon: 'List' },
    ],
    '/admin/ops/simulator': [
      { i18nKey: 'menu.ops', icon: 'Monitor' },
      { i18nKey: 'menu.ops.simulator', icon: 'Opportunity' },
    ],
    // 策略相关
    '/admin/strategy/management': [
      { i18nKey: 'menu.strategy', icon: 'Document' },
      { i18nKey: 'menu.strategy.management', icon: 'FolderOpened' },
    ],
    '/admin/strategy/designer': [
      { i18nKey: 'menu.strategy', icon: 'Document' },
      { i18nKey: 'menu.strategy.designer', icon: 'EditPen' },
    ],
    '/admin/strategy/monitor': [
      { i18nKey: 'menu.strategy', icon: 'Document' },
      { i18nKey: 'menu.strategy.monitor', icon: 'Monitor' },
    ],
    // 数据治理
    '/admin/governance/files/templates': [
      { i18nKey: 'menu.governance', icon: 'DataAnalysis' },
      { i18nKey: 'menu.data.files', icon: 'Document' },
      { i18nKey: 'menu.data.files.templates', icon: 'Files' },
    ],
    '/admin/governance/dictionary/fields': [
      { i18nKey: 'menu.governance', icon: 'Setting' },
      { i18nKey: 'menu.data.dictionary', icon: 'Collection' },
      { i18nKey: 'menu.data.dictionary.fields', icon: 'Document' },
    ],
    '/governance/dictionary/fields': [
      { i18nKey: 'menu.governance', icon: 'Setting' },
      { i18nKey: 'menu.data.dictionary', icon: 'Collection' },
      { i18nKey: 'menu.data.dictionary.fields', icon: 'Document' },
    ],
    '/admin/governance/dictionary/values': [
      { i18nKey: 'menu.governance', icon: 'Setting' },
      { i18nKey: 'menu.data.dictionary', icon: 'Collection' },
      { i18nKey: 'menu.data.dictionary.values', icon: 'List' },
    ],
    '/governance/dictionary/values': [
      { i18nKey: 'menu.governance', icon: 'Setting' },
      { i18nKey: 'menu.data.dictionary', icon: 'Collection' },
      { i18nKey: 'menu.data.dictionary.values', icon: 'List' },
    ],
    // 测试功能
    '/admin/test/components': [
      { i18nKey: 'menu.test_features', icon: 'Coin' },
      { i18nKey: 'menu.test_features.components', icon: 'Tickets' },
    ],
    '/admin/test/api-test-center': [
      { i18nKey: 'menu.test_features', icon: 'Coin' },
      { i18nKey: 'menu.test_features.api_test_center', icon: 'Connection' },
    ],
  };

  // 子应用的面包屑映射（暂时为空，待实现具体页面）
  const subAppBreadcrumbs: Record<string, Record<string, BreadcrumbConfig[]>> = {
    system: {},
    logistics: {},
    engineering: {},
    quality: {},
    production: {},
    finance: {},
  };

  const homePaths = new Set([
    '/',
    '/admin',
    '/logistics',
    '/engineering',
    '/quality',
    '/production',
    '/finance',
  ]);

  if (homePaths.has(normalizedPath)) {
    return [];
  }

  // 获取面包屑数据
  const breadcrumbData =
    currentApp === 'admin'
      ? adminAppBreadcrumbs[normalizedPath]
      : subAppBreadcrumbs[currentApp]?.[normalizedPath];

  if (!breadcrumbData) {
    return [];
  }

  // 转换为带翻译的面包屑
  return breadcrumbData.map((item) => ({
    label: t(item.i18nKey),
    icon: item.icon,
  }));
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
