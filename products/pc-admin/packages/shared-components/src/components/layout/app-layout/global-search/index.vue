<template>
  <div class="global-search">
    <!-- 搜索触发器 -->
    <div
      class="global-search__trigger"
      @click="openModal"
    >
      <el-input
        :model-value="''"
        placeholder=""
        readonly
      >
        <template #prefix>
          <btc-svg name="search" :size="16" />
        </template>
        <template #suffix>
          <el-tag size="small" type="info">
            Ctrl+K
          </el-tag>
        </template>
      </el-input>
    </div>

    <!-- 搜索弹窗 -->
    <Teleport to="body">
      <Transition name="search-modal">
        <div
          v-if="isModalOpen"
          class="global-search-modal"
          @click.self="closeModal"
        >
          <!-- 弹窗内容 -->
          <div class="search-modal__container">
            <!-- 搜索输入区 -->
            <div class="search-modal__header">
              <form class="search-modal__form" @submit.prevent="handleEnter">
                <label class="search-modal__icon" for="global-search-input">
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.4"></circle>
                    <path d="m21 21-4.3-4.3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </label>
                <input
                  id="global-search-input"
                  name="global-search"
                  ref="inputRef"
                  v-model="searchKeyword"
                  type="search"
                  :placeholder="t('common.global_search_placeholder')"
                  class="search-modal__input"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  maxlength="512"
                  @keydown.up.prevent="handleArrowUp"
                  @keydown.down.prevent="handleArrowDown"
                  @keydown.enter.prevent="handleEnter"
                  @keydown.esc="closeModal"
                />
                <div class="search-modal__actions">
                  <button
                    v-if="searchKeyword"
                    type="reset"
                    class="search-modal__clear"
                    :aria-label="t('common.clear_search')"
                    @click="searchKeyword = ''"
                  >
                    {{ t('common.clear_search') }}
                  </button>
                  <div v-if="searchKeyword" class="search-modal__divider"></div>
                  <button
                    type="button"
                    class="search-modal__close"
                    :aria-label="t('common.close')"
                    :title="t('common.close')"
                    @click="closeModal"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20">
                      <path d="M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            <!-- 搜索结果区域 -->
            <div class="search-modal__body">
              <div v-if="searchResults.length > 0" class="search-results">
                <!-- 双重分组：先按应用分组，再按类型分组 -->
                <div
                  v-for="(appGroup, appIndex) in groupedResults"
                  :key="appIndex"
                  class="result-app-group"
                >
                  <!-- 应用标题 -->
                  <div class="result-app-group__header">
                    {{ appGroup.appName }}
                  </div>

                  <!-- 类型分组 -->
                  <section
                    v-for="(typeGroup, typeIndex) in appGroup.groups"
                    :key="typeIndex"
                    class="result-section"
                  >
                    <div class="result-section__source">
                      {{ typeGroup.title }}
                    </div>
                    <ul role="listbox" class="result-section__list">
                      <li
                        v-for="item in typeGroup.items"
                        :key="item.id"
                        role="option"
                        :aria-selected="selectedIndex === item.globalIndex"
                        class="result-hit"
                        :class="{ 'is-active': selectedIndex === item.globalIndex }"
                      >
                        <a
                          href="javascript:void(0)"
                          @click.prevent="handleSelectResult(item)"
                          @mouseenter="selectedIndex = item.globalIndex"
                        >
                          <div class="result-hit__container">
                            <div class="result-hit__icon">
                              <svg width="20" height="20" viewBox="0 0 20 20">
                                <path v-if="item.type === 'menu'" d="M17 5H3h14zm0 5H3h14zm0 5H3h14z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path>
                                <path v-else d="M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path>
                              </svg>
                            </div>
                            <div class="result-hit__content">
                              <span class="result-hit__title" v-html="highlightKeyword(item.title)"></span>
                              <span v-if="item.breadcrumb" class="result-hit__path">{{ item.breadcrumb }}</span>
                            </div>
                            <div class="result-hit__action">
                              <span v-if="item.type === 'menu' || item.type === 'page'" class="result-hit__tag result-hit__tag--page">
                                {{ t('common.page') }}
                              </span>
                              <span v-else-if="item.type === 'doc'" class="result-hit__tag result-hit__tag--doc">
                                {{ t('common.document') }}
                              </span>
                              <svg width="20" height="20" viewBox="0 0 20 20" class="result-hit__select-icon">
                                <g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M18 3v4c0 2-2 4-4 4H2"></path>
                                  <path d="M8 17l-6-6 6-6"></path>
                                </g>
                              </svg>
                            </div>
                          </div>
                        </a>
                      </li>
                    </ul>
                  </section>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-else-if="searchKeyword && searchResults.length === 0" class="search-empty">
                <el-icon :size="64" class="search-empty__icon">
                  <Search />
                </el-icon>
                <div class="search-empty__message">
                  {{ t('common.no_results_for') }} "{{ searchKeyword }}"
                </div>
                <div class="search-empty__suggestions">
                  <div class="search-empty__suggestions-title">
                    {{ t('common.try_searching_for') }}
                  </div>
                  <div class="search-empty__suggestions-list">
                    <button
                      v-for="suggestion in suggestedKeywords"
                      :key="suggestion"
                      class="search-empty__suggestion-item"
                      @click="searchKeyword = suggestion"
                    >
                      {{ suggestion }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- 初始状态（历史/热门） -->
              <div v-else class="search-hints">
                <div v-if="recentSearches.length > 0" class="hint-group">
                  <div class="hint-group__title">{{ t('common.recent_searches') }}</div>
                  <div
                    v-for="(recent, index) in recentSearches"
                    :key="index"
                    class="hint-item"
                    @click="searchKeyword = recent"
                  >
                    <el-icon><Clock /></el-icon>
                    <span>{{ recent }}</span>
                  </div>
                </div>

                <div class="hint-group">
                  <div class="hint-group__title">{{ t('common.quick_access') }}</div>
                  <div
                    v-for="(quick, index) in quickAccess"
                    :key="index"
                    class="hint-item"
                    @click="handleSelectResult(quick)"
                  >
                    <el-icon><Star /></el-icon>
                    <span>{{ quick.title }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 底部提示 -->
            <div class="search-modal__footer">
              <ul class="search-commands">
                <li>
                  <kbd class="search-commands__key">
                    <svg width="15" height="15" aria-label="向下箭头" viewBox="0 0 24 24" role="img">
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4">
                        <path d="M12 5v14"></path>
                        <path d="m19 12-7 7-7-7"></path>
                      </g>
                    </svg>
                  </kbd>
                  <kbd class="search-commands__key">
                    <svg width="15" height="15" aria-label="向上箭头" viewBox="0 0 24 24" role="img">
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4">
                        <path d="m5 12 7-7 7 7"></path>
                        <path d="M12 19V5"></path>
                      </g>
                    </svg>
                  </kbd>
                  <span class="search-commands__label">{{ t('common.navigate') }}</span>
                </li>
                <li>
                  <kbd class="search-commands__key">
                    <svg width="15" height="15" aria-label="Enter 键" viewBox="0 0 24 24" role="img">
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.4">
                        <polyline points="9 10 4 15 9 20"></polyline>
                        <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                      </g>
                    </svg>
                  </kbd>
                  <span class="search-commands__label">{{ t('common.select') }}</span>
                </li>
                <li>
                  <kbd class="search-commands__key">
                    <span class="search-commands__escape">ESC</span>
                  </kbd>
                  <span class="search-commands__label">{{ t('common.close') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'GlobalSearch'
});

import { storage } from '@btc/shared-core/utils/storage';
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { Star, Search, Clock } from '@element-plus/icons-vue';
import { type MenuItem } from '../../../../store/menuRegistry';
// useCurrentApp 未使用，已移除导入
import { useSearchIndex, type SearchDataItem as SearchDataItemType } from './useSearchIndex';
import { getManifestMenus } from '@btc/shared-core/manifest';

// DocSearchResult 类型定义
interface DocSearchResult {
  title: string;
  content: string;
  url: string;
  [key: string]: any;
}

// 使用 useSearchIndex 中定义的 SearchDataItem 类型
type SearchDataItem = SearchDataItemType;

const router = useRouter();
const { t } = useI18n();
// const { currentApp } = useCurrentApp(); // 未使用

// 应用显示顺序（优先级）
const appOrder = ['system', 'admin', 'logistics', 'engineering', 'quality', 'production', 'finance', 'operations', 'docs'];

// 应用名称映射（响应式，直接使用国际化文件中的值）
const appNameMap = computed<Record<string, string>>(() => ({
  system: t('micro_app.system.title'),
  admin: t('micro_app.admin.title'),
  logistics: t('micro_app.logistics.title'),
  engineering: t('micro_app.engineering.title'),
  quality: t('micro_app.quality.title'),
  production: t('micro_app.production.title'),
  finance: t('micro_app.finance.title'),
  operations: t('micro_app.operations.title'),
  docs: t('micro_app.docs.title'),
}));

const inputRef = ref();
const searchKeyword = ref('');
const isModalOpen = ref(false);
const selectedIndex = ref(0);

// 扁平化菜单树，提取所有可搜索的菜单项
function flattenMenuItems(
  items: MenuItem[],
  parentBreadcrumb: string[] = [],
  app: string = '',
  _basePath: string = '',
  translateFn?: (key: string) => string
): SearchDataItem[] {
  const result: SearchDataItem[] = [];
  let itemIndex = 0;

  for (const item of items) {
    // 处理标题：菜单项中的 title 都是国际化key，需要翻译
    // 参考 menu-renderer 的实现：直接使用 t(item.title) 翻译
    let displayTitle = item.title;

    if (translateFn && item.title) {
      try {
        // 直接翻译，就像 menu-renderer 中那样
        const translated = translateFn(item.title);

        // 检查翻译结果：如果翻译成功，结果应该与key不同
        if (translated && translated !== item.title) {
          displayTitle = translated;
        } else {
          // 如果翻译返回的还是key，可能的原因：
          // 1. 翻译文件中没有这个key
          // 2. 翻译函数还没有完全初始化
          // 3. key格式不正确

          // 尝试去掉 menu. 前缀后再翻译（某些key可能没有 menu. 前缀）
          if (item.title.startsWith('menu.')) {
            const keyWithoutPrefix = item.title.replace(/^menu\./, '');
            try {
              const retryTranslated = translateFn(keyWithoutPrefix);
              if (retryTranslated && retryTranslated !== keyWithoutPrefix) {
                displayTitle = retryTranslated;
              } else {
                // 如果还是失败，使用原始key作为兜底（虽然不理想，但至少不会崩溃）
                displayTitle = item.title;
              }
            } catch {
              // 忽略错误，使用原始key作为兜底
              displayTitle = item.title;
            }
          } else {
            // 如果key不是以 menu. 开头，但翻译失败，使用原始key
            displayTitle = item.title;
          }
        }
      } catch (error) {
        // 如果翻译抛出异常，使用原始key作为兜底
        displayTitle = item.title;
      }
    }

    // 构建面包屑
    const breadcrumbParts = parentBreadcrumb.length > 0
      ? [...parentBreadcrumb, displayTitle]
      : [displayTitle];
    const breadcrumb = breadcrumbParts.length > 1
      ? breadcrumbParts.slice(0, -1).join(' · ')
      : undefined;

    // 构建完整路径
    let fullPath = item.index;
    if (!fullPath.startsWith('/')) {
      // 如果路径不是以 / 开头，需要根据应用添加前缀
      if (app === 'admin' && !fullPath.startsWith('/admin')) {
        fullPath = `/admin${fullPath.startsWith('/') ? '' : '/'}${fullPath}`;
      } else if (app !== 'system' && app !== 'admin' && !fullPath.startsWith(`/${app}`)) {
        fullPath = `/${app}${fullPath.startsWith('/') ? '' : '/'}${fullPath}`;
      } else if (!fullPath.startsWith('/')) {
        fullPath = `/${fullPath}`;
      }
    }

    // 检查是否有子菜单
    const hasChildren = item.children && item.children.length > 0;

    // 递归处理子菜单（先处理子菜单，以便获取完整的面包屑）
    if (hasChildren) {
      const childBreadcrumb = displayTitle
        ? [...parentBreadcrumb, displayTitle]
        : parentBreadcrumb;
      const childResults = flattenMenuItems(
        item.children ?? [],
        childBreadcrumb,
        app,
        fullPath,
        translateFn
      );
      result.push(...childResults);
    } else {
      // 只添加叶子节点（没有子菜单的菜单项）到搜索结果
      // 这样可以避免选择父级菜单导致404的问题
      if (displayTitle && fullPath && fullPath !== '/') {
        result.push({
          id: `menu-${app}-${item.index}-${itemIndex++}`,
          type: 'menu',
          title: displayTitle,
          originalTitle: item.title, // 保存原始标题（国际化key），用于搜索匹配
          path: fullPath,
          ...(breadcrumb !== undefined && { breadcrumb }),
          app,
          hasChildren: false, // 叶子节点没有子菜单
        });
      }
    }
  }

  return result;
}

// 从路由获取页面数据
function getRoutesData(): SearchDataItem[] {
  const routes = router.getRoutes();
  const result: SearchDataItem[] = [];
  let routeIndex = 0;

  for (const route of routes) {
    // 跳过隐藏的路由、公开路由和没有 meta 的路由
    if (
      route.meta?.isHide ||
      route.meta?.public ||
      !route.meta?.title &&
      !route.meta?.titleKey
    ) {
      continue;
    }

    // 获取标题
    const title = route.meta?.title
      ? String(route.meta.title)
      : route.meta?.titleKey
      ? t(route.meta.titleKey as string)
      : route.name
      ? String(route.name)
      : route.path;

    // 获取面包屑（从 meta.breadcrumbs 或 meta.label）
    const breadcrumb = route.meta?.breadcrumbs
      ? Array.isArray(route.meta.breadcrumbs)
        ? route.meta.breadcrumbs.map((b: any) =>
            b.labelKey ? t(b.labelKey) : b.label || ''
          ).filter(Boolean).join(' · ')
        : undefined
      : route.meta?.label
      ? String(route.meta.label)
      : undefined;

    // 确定应用
    let app = 'system';
    if (route.path.startsWith('/admin')) app = 'admin';
    else if (route.path.startsWith('/logistics')) app = 'logistics';
    else if (route.path.startsWith('/engineering')) app = 'engineering';
    else if (route.path.startsWith('/quality')) app = 'quality';
    else if (route.path.startsWith('/production')) app = 'production';
    else if (route.path.startsWith('/finance')) app = 'finance';
    else if (route.path.startsWith('/operations')) app = 'operations';
    else if (route.path.startsWith('/docs')) app = 'docs';

    result.push({
      id: `route-${app}-${routeIndex++}`,
      type: 'page',
      title,
      path: route.path,
      breadcrumb,
      app,
    });
  }

  return result;
}

// 构建搜索数据的函数
function buildSearchData(): SearchDataItem[] {
  const result: SearchDataItem[] = [];

  try {
    // 1. 直接从 manifest 获取所有应用的菜单
    const allApps = ['admin', 'system', 'logistics', 'engineering', 'quality', 'production', 'finance', 'operations', 'docs'];

    for (const app of allApps) {
      try {
        const manifestMenus = getManifestMenus(app);
        if (manifestMenus && manifestMenus.length > 0) {
          // 将 manifest 菜单格式转换为 MenuItem 格式
          const menuItems: MenuItem[] = manifestMenus.map((item: any) => {
            const convertItem = (menuItem: any): MenuItem => {
              // 规范化路径：添加应用前缀
              let normalizedIndex = menuItem.index;
              if (!normalizedIndex.startsWith('/')) {
                normalizedIndex = `/${normalizedIndex}`;
              }
              if (app !== 'system' && !normalizedIndex.startsWith(`/${app}`)) {
                normalizedIndex = `/${app}${normalizedIndex === '/' ? '' : normalizedIndex}`;
              }

              return {
                index: normalizedIndex,
                title: menuItem.labelKey || menuItem.label || menuItem.title || normalizedIndex,
                icon: menuItem.icon,
                children: menuItem.children && menuItem.children.length > 0
                  ? menuItem.children.map(convertItem)
                  : undefined,
              };
            };
            return convertItem(item);
          });

          // 使用 flattenMenuItems 处理菜单树
          const flattenedMenus = flattenMenuItems(menuItems, [], app, '', t);
          result.push(...flattenedMenus);
        }
      } catch (error) {
        // 静默失败，继续处理其他应用
      }
    }

    // 2. 从路由获取页面数据（补充菜单中没有的路由）
    const routesData = getRoutesData();

    // 去重：如果路由路径已在菜单数据中，则跳过
    const menuPaths = new Set(result.map(item => item.path));
    for (const routeItem of routesData) {
      if (!menuPaths.has(routeItem.path)) {
        result.push(routeItem);
      }
    }
  } catch (error) {
    // 静默失败
  }

  return result;
}

// 动态构建搜索数据源（响应式）
const searchData = computed<SearchDataItem[]>(() => {
  const data = buildSearchData();
  return data;
});

// 构建搜索索引（使用 lunr.js）
const { searchIndex, search: searchWithLunr, mapResultsToItems, createDataMap } = useSearchIndex(searchData);

// 监听索引构建
watch(searchIndex, () => {
  // 索引变化时自动更新
}, { immediate: true });

// 创建数据映射表（用于快速查找）
const dataMap = computed(() => {
  const map = createDataMap(searchData.value);
  return map;
});

// 简单搜索函数（兜底方案，当索引构建失败时使用）
function simpleSearch(items: SearchDataItem[], keyword: string): SearchDataItem[] {
  const trimmedKeyword = keyword.trim();
  // 对于中文搜索，不需要 toLowerCase，因为中文没有大小写
  const isChinese = /[\u4e00-\u9fff]/.test(trimmedKeyword);
  const searchKeyword = isChinese ? trimmedKeyword : trimmedKeyword.toLowerCase();

  const results: SearchDataItem[] = [];

  items.forEach(item => {
    let score = 0;
    let matched = false;

    // 1. 匹配翻译后的标题（最高优先级，score = 10）
    const titleToMatch = isChinese ? item.title : item.title.toLowerCase();
    if (titleToMatch.includes(searchKeyword)) {
      score = 10;
      matched = true;
    }

    // 2. 如果原始标题存在，尝试重新翻译并匹配（score = 8）
    if (!matched && item.originalTitle) {
      // 尝试翻译原始标题（国际化key）
      try {
        const retranslated = t(item.originalTitle);
        if (retranslated && retranslated !== item.originalTitle) {
          const retranslatedToMatch = isChinese ? retranslated : retranslated.toLowerCase();
          if (retranslatedToMatch.includes(searchKeyword)) {
            score = 8;
            matched = true;
          }
        }
      } catch {
        // 忽略翻译错误
      }

      // 如果原始标题与当前标题不同，也尝试匹配原始标题
      if (!matched && item.originalTitle !== item.title) {
        const originalToMatch = isChinese ? item.originalTitle : item.originalTitle.toLowerCase();
        if (originalToMatch.includes(searchKeyword)) {
          score = 8;
          matched = true;
        }
      }
    }

    // 3. 匹配面包屑（score = 5）
    if (!matched && item.breadcrumb) {
      const breadcrumbToMatch = isChinese ? item.breadcrumb : item.breadcrumb.toLowerCase();
      if (breadcrumbToMatch.includes(searchKeyword)) {
        score = 5;
        matched = true;
      }
    }

    // 4. 匹配路径（score = 1）
    if (!matched && item.path) {
      const pathWithoutParams = item.path.split('?')[0]?.split(':')[0];
      if (!pathWithoutParams) return 0;
      const pathSegments = pathWithoutParams.split('/').filter(Boolean);
      for (const segment of pathSegments) {
        const segmentToMatch = isChinese ? segment : segment.toLowerCase();
        if (segmentToMatch.includes(searchKeyword)) {
          score = 1;
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      results.push({
        ...item,
        score
      });
    }
  });

  // 按 score 降序排序
  return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// 最近搜索（从 localStorage 读取）
const recentSearches = ref<string[]>([]);

// 快捷访问（包含文档）
const quickAccess = computed<SearchDataItem[]>(() => [] as SearchDataItem[]);

// 推荐搜索词（空状态时显示）
const suggestedKeywords = ref([]);

// 搜索结果状态
const searchResults = ref<any[]>([]);
const isSearching = ref(false);

// 监听搜索关键词变化，异步搜索
watch(searchKeyword, async (keyword) => {
  if (!keyword || !keyword.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  const lowerKeyword = keyword.toLowerCase().trim();

  try {
    let menuResults: SearchDataItem[] = [];

    // 检查是否为中文搜索（未使用，但保留用于未来扩展）
    // const isChineseSearch = /[\u4e00-\u9fff]/.test(keyword);

    // 混合搜索策略：
    // - 优先使用 lunr 索引（支持中文和英文，性能更好）
    // - 如果 lunr 没有结果，降级到简单搜索（兜底）
    if (searchIndex.value) {
      try {
        // 使用 lunr 进行搜索（支持中文和英文）
        const lunrResults = searchWithLunr(keyword);

        // 将 lunr 搜索结果映射回原始的 SearchDataItem
        menuResults = mapResultsToItems(lunrResults, dataMap.value);

        // 如果 lunr 没有结果，降级到简单搜索（兜底）
        if (menuResults.length === 0) {
          menuResults = simpleSearch(searchData.value, keyword);
        }
      } catch (error) {
        // lunr 搜索失败时，降级到简单搜索
        menuResults = simpleSearch(searchData.value, keyword);
      }
    } else {
      // 索引不可用时使用简单搜索
      menuResults = simpleSearch(searchData.value, keyword);
    }

    // 搜索文档（异步）
    // 通过全局函数获取文档搜索服务
    const getDocsSearchService = (window as any).__APP_GET_DOCS_SEARCH_SERVICE__;
    const docResults = getDocsSearchService
      ? await getDocsSearchService(lowerKeyword)
      : [];

    // 合并结果并添加全局索引
    // 注意：lunr 搜索结果已经按相关性排序，不需要再次排序
    const allResults = [...menuResults, ...docResults];
    searchResults.value = allResults.map((item, index) => ({ ...item, globalIndex: index }));
  } catch (_error) {
    // 搜索失败时仍然显示菜单结果（使用简单搜索）
    const menuResults = simpleSearch(searchData.value, keyword);
    searchResults.value = menuResults.map((item, index) => ({ ...item, globalIndex: index }));
  } finally {
    isSearching.value = false;
  }
}, { immediate: false });

// 双重分组结果（先按应用分组，再按类型分组）
const groupedResults = computed(() => {
  const groups: any[] = [];

  // 按应用分组
  const resultsByApp: Record<string, { menu: any[], page: any[], doc: any[] }> = {};

  searchResults.value.forEach(item => {
    const app = item.app || 'system';
    if (!resultsByApp[app]) {
      resultsByApp[app] = { menu: [], page: [], doc: [] };
    }

    if (item.type === 'menu') {
      resultsByApp[app].menu.push(item);
    } else if (item.type === 'page') {
      resultsByApp[app].page.push(item);
    } else if (item.type === 'doc') {
      resultsByApp[app].doc.push(item);
    }
  });

  // 按应用顺序遍历，为每个应用创建分组
  appOrder.forEach(app => {
    const appResults = resultsByApp[app];
    if (!appResults) return;

    const appName = appNameMap.value[app] || app;
    const appGroups: any[] = [];

    // 在每个应用内，按类型分组（菜单 → 页面 → 文档）
    // 同时按相关性分数排序（分数越高越靠前）
    if (appResults.menu.length > 0) {
      appGroups.push({
        title: t('common.menu_items'),
        items: appResults.menu.sort((a, b) => {
          // 按相关性分数降序排序（分数越高越靠前）
          const scoreA = a.score ?? 0;
          const scoreB = b.score ?? 0;
          return scoreB - scoreA;
        })
      });
    }

    if (appResults.page.length > 0) {
      appGroups.push({
        title: t('common.pages'),
        items: appResults.page.sort((a, b) => {
          // 按相关性分数降序排序
          const scoreA = a.score ?? 0;
          const scoreB = b.score ?? 0;
          return scoreB - scoreA;
        })
      });
    }

    if (appResults.doc.length > 0) {
      appGroups.push({
        title: t('common.documents'),
        items: appResults.doc.sort((a, b) => {
          // 按相关性分数降序排序
          const scoreA = a.score ?? 0;
          const scoreB = b.score ?? 0;
          return scoreB - scoreA;
        })
      });
    }

    // 如果该应用有结果，添加到分组中
    if (appGroups.length > 0) {
      groups.push({
        app: app,
        appName: appName,
        groups: appGroups
      });
    }
  });

  return groups;
});

// 打开弹窗
const openModal = () => {
  isModalOpen.value = true;
  selectedIndex.value = 0;
  searchKeyword.value = '';

  nextTick(() => {
    inputRef.value?.focus();
  });
};

// 关闭弹窗
const closeModal = () => {
  isModalOpen.value = false;
  searchKeyword.value = '';
};

// 键盘导航
const handleArrowUp = () => {
  if (searchResults.value.length === 0) return;
  selectedIndex.value = selectedIndex.value > 0
    ? selectedIndex.value - 1
    : searchResults.value.length - 1;
};

const handleArrowDown = () => {
  if (searchResults.value.length === 0) return;
  selectedIndex.value = selectedIndex.value < searchResults.value.length - 1
    ? selectedIndex.value + 1
    : 0;
};

const handleEnter = () => {
  if (searchResults.value.length === 0) return;
  const selected = searchResults.value[selectedIndex.value];
  if (selected) {
    handleSelectResult(selected);
  }
};


// 选择结果
const handleSelectResult = (item: any) => {
  // 保存到最近搜索
  if (searchKeyword.value.trim()) {
    addRecentSearch(searchKeyword.value.trim());
  }

  // 根据类型处理跳转
  if (item.type === 'doc') {
    // 文档结果：先跳转到文档应用，然后导航到具体页面
    handleDocNavigation(item);
  } else {
    // 菜单/页面结果：直接跳转
    router.push(item.path);
  }

  // 关闭弹窗
  closeModal();
};

// 处理文档导航（跨 iframe，使用 VitePress 内部路由）
const handleDocNavigation = (doc: DocSearchResult) => {
  const currentPath = router.currentRoute.value.path;

  // 如果已经在文档页面，直接通知 iframe 进行内部导航
  if (currentPath === '/docs') {
    // 触发文档导航事件（由 DocsIframe 组件监听）
    window.dispatchEvent(new CustomEvent('docs-navigate', {
      detail: { path: doc.path }
    }));
  } else {
    // 如果不在文档页面，先导航过去（路由守卫会显示 Loading）
    router.push('/docs').then(() => {
      // 等待 iframe 加载完成后，再导航到具体页面
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('docs-navigate', {
          detail: { path: doc.path }
        }));
      }, 500); // 等待文档应用 iframe 渲染完成
    });
  }
};

// 高亮关键词（同时处理国际化key的翻译）
const highlightKeyword = (text: string) => {
  // 如果文本看起来像国际化key，尝试翻译
  let displayText = text;
  if (text && (text.includes('.') || text.startsWith('menu.'))) {
    try {
      const translated = t(text);
      if (translated && translated !== text) {
        displayText = translated;
      } else if (text.startsWith('menu.')) {
        // 尝试去掉 menu. 前缀
        const keyWithoutPrefix = text.replace(/^menu\./, '');
        try {
          const retryTranslated = t(keyWithoutPrefix);
          if (retryTranslated && retryTranslated !== keyWithoutPrefix) {
            displayText = retryTranslated;
          }
        } catch {
          // 忽略错误
        }
      }
    } catch {
      // 忽略错误，使用原始文本
    }
  }

  // 高亮关键词
  if (!searchKeyword.value.trim()) return displayText;
  const keyword = searchKeyword.value.trim();
  const regex = new RegExp(`(${keyword})`, 'gi');
  return displayText.replace(regex, '<mark>$1</mark>');
};

// 添加到最近搜索
const addRecentSearch = (keyword: string) => {
  const searches = recentSearches.value.filter(s => s !== keyword);
  searches.unshift(keyword);
  recentSearches.value = searches.slice(0, 5); // 最多保存5条
  storage.set('recent-searches', recentSearches.value);
};

// 加载最近搜索
const loadRecentSearches = () => {
  const saved = storage.get<string[]>('recent-searches');
  if (saved) {
    recentSearches.value = saved;
  }
};

// 全局快捷键 Ctrl+K
const handleGlobalShortcut = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (isModalOpen.value) {
      closeModal();
    } else {
      openModal();
    }
  }
};

onMounted(() => {
  loadRecentSearches();
  document.addEventListener('keydown', handleGlobalShortcut);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalShortcut);
});
</script>

<style lang="scss" scoped>
.global-search {
  width: 200px;

  &__trigger {
    cursor: pointer;

    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      box-shadow: none;
      border-radius: 6px;
      border: 1px solid var(--el-fill-color-dark); // 添加默认边框
      transition: all 0.2s ease;
      cursor: pointer;
      height: 26px; // 与折叠按钮高度一致
      padding: 0 8px;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      cursor: pointer;
      line-height: 24px;
      height: 24px;
    }

    :deep(.el-input__prefix) {
      display: flex;
      align-items: center;
      margin-right: 4px;
    }

    :deep(.el-input__suffix) {
      margin-left: 4px;
      display: flex;
      align-items: center;

      .el-tag {
        border: none;
        background-color: var(--el-fill-color);
        color: var(--el-text-color-secondary);
        font-size: 11px;
        padding: 0 5px;
        height: 18px;
        line-height: 18px;
      }
    }

    &:hover {
      :deep(.el-input__wrapper) {
        background-color: var(--el-fill-color);
        border-color: var(--el-color-primary); // 悬浮时主题色边框
      }
    }
  }
}

/* 全屏搜索弹窗 */
.global-search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.search-modal {
  &__container {
    position: relative;
    width: 640px;
    max-width: 90vw;
    max-height: 70vh;
    background-color: var(--el-bg-color);
    border-radius: 12px;
    border: 1px solid var(--el-color-primary-light-5);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__header {
    flex-shrink: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &__form {
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--el-color-primary);

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    color: var(--el-text-color-primary);
    font-family: inherit;
    padding: 16px 0;
    min-width: 0;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }

    // 移除 search input 的默认样式
    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__clear {
    padding: 6px 12px;
    border: none;
    background: transparent;
    color: var(--el-color-primary);
    font-size: 13px;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;

    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__divider {
    width: 1px;
    height: 20px;
    background-color: var(--el-border-color);
  }

  &__close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 4px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background-color: var(--el-fill-color);
      color: var(--el-text-color-primary);
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;

    /* 自定义滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--el-fill-color-darker);
      border-radius: 3px;
    }
  }

  &__footer {
    flex-shrink: 0;
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }
}

/* 搜索结果 */
.search-results {
  padding: 8px 12px;
}

/* 应用分组 */
.result-app-group {
  & + & {
    margin-top: 24px;
  }

  &__header {
    padding: 12px 8px 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--el-color-primary);
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 8px;
  }
}

.result-section {
  & + & {
    margin-top: 16px;
  }

  &__source {
    padding: 8px 8px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    letter-spacing: 0.3px;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

.result-hit {
  & + & {
    margin-top: 4px;
  }

  a {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  &:hover:not(.is-active) {
    .result-hit__container {
      background-color: var(--el-fill-color);
    }
  }

  &.is-active {
    .result-hit__container {
      background-color: var(--el-color-primary-light-9);
      border: 1px solid var(--el-color-primary-light-5);
      box-shadow: none;
    }

    .result-hit__icon {
      color: var(--el-color-primary);
    }

    .result-hit__action {
      color: var(--el-color-primary);
    }
  }

  &__container {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 4px;
    background-color: var(--el-fill-color-light);
    border: 1px solid transparent;
    transition: all 0.15s ease;
    cursor: pointer;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--el-text-color-secondary);
    transition: color 0.15s ease;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__title {
    font-size: 14px;
    font-weight: 400;
    color: var(--el-text-color-primary);
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    :deep(mark) {
      background-color: transparent;
      color: var(--el-color-primary);
      font-weight: 600;
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
    }
  }

  &__path {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__action {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--el-text-color-placeholder);
    transition: all 0.15s ease;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
    border-radius: 4px;
    white-space: nowrap;
    transition: all 0.15s ease;
    min-height: 20px;
    box-sizing: border-box;

    &--page {
      background-color: rgba(64, 158, 255, 0.1);
      color: #409eff;
      border: 1px solid rgba(64, 158, 255, 0.2);
    }

    &--doc {
      background-color: rgba(230, 162, 60, 0.1);
      color: #e6a23c;
      border: 1px solid rgba(230, 162, 60, 0.2);
    }
  }

}

/* 空状态 */
.search-empty {
  padding: 48px 20px;
  text-align: center;

  &__icon {
    color: var(--el-text-color-placeholder);
    margin-bottom: 16px;
  }

  &__message {
    font-size: 16px;
    color: var(--el-text-color-primary);
    margin-bottom: 24px;
    font-weight: 500;
  }

  &__suggestions {
    &-title {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      margin-bottom: 12px;
    }

    &-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
  }

  &__suggestion-item {
    padding: 8px 16px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 16px;
    font-size: 14px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover {
      background-color: var(--el-fill-color);
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}

/* 提示区域 */
.search-hints {
  padding: 8px 12px;
}

.hint-group {
  & + & {
    margin-top: 16px;
  }

  &__title {
    padding: 8px 8px 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    letter-spacing: 0.3px;
  }
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-top: 4px;
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: var(--el-text-color-regular);

  &:hover {
    background-color: var(--el-fill-color);
  }

  &:active {
    background-color: var(--el-color-primary-light-9);
    box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);

    .el-icon {
      color: var(--el-color-primary);
    }
  }

  .el-icon {
    color: var(--el-text-color-secondary);
    transition: color 0.15s ease;
  }
}

.search-commands {
  display: flex;
  align-items: center;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__key {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 28px;
    padding: 0 6px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-color-primary-light-5);
    border-bottom-width: 2px;
    border-bottom-color: var(--el-color-primary-light-3);
    border-radius: 4px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    color: var(--el-color-primary);
    box-shadow: inset 0 -1px 0 0 var(--el-color-primary-light-7);
    transition: all 0.15s ease;
    cursor: pointer;

    svg {
      width: 15px;
      height: 15px;
      stroke-width: 1.4;
      color: var(--el-color-primary);
    }

    &:hover {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-3);
      border-bottom-color: var(--el-color-primary);
      box-shadow: inset 0 -1px 0 0 var(--el-color-primary-light-5);
      transform: translateY(-1px);
    }
  }

  &__escape {
    font-size: 11px;
    font-weight: 600;
    font-family: inherit;
    color: inherit;
  }

  &__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

/* 弹窗动画 */
.search-modal-enter-active {
  transition: all 0.25s ease;

  .search-modal__container {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.search-modal-leave-active {
  transition: all 0.2s ease;

  .search-modal__container {
    transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
  }
}

.search-modal-enter-from,
.search-modal-leave-to {
  .search-modal__container {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
}
</style>


