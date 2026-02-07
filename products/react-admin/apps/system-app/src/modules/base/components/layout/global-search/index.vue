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
          <!-- 遮罩层 -->
          <div class="search-modal__backdrop"></div>

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
                <!-- 结果分组 -->
                <section
                  v-for="(group, groupIndex) in groupedResults"
                  :key="groupIndex"
                  class="result-section"
                >
                  <div class="result-section__source">
                    {{ group.title }}
                  </div>
                  <ul role="listbox" class="result-section__list">

                    <li
                      v-for="(item, itemIndex) in group.items"
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

import { storage } from '@btc/shared-utils';
import { useI18n, logger } from '@btc/shared-core';
import { Star, Search, Clock } from '@element-plus/icons-vue';
import { searchDocs, type DocSearchResult } from '@services/docsSearch';

const router = useRouter();
const { t } = useI18n();

const inputRef = ref();
const searchKeyword = ref('');
const isModalOpen = ref(false);
const selectedIndex = ref(0);

// 搜索数据源
const searchData = ref([
  // 平台治理
  { id: 'm1', type: 'menu', title: '域列表', path: '/platform/domains', breadcrumb: '平台治理' },
  { id: 'm2', type: 'menu', title: '模块列表', path: '/platform/modules', breadcrumb: '平台治理' },
  { id: 'm3', type: 'menu', title: '插件列表', path: '/platform/plugins', breadcrumb: '平台治理' },

  // 组织与账号
  { id: 'm4', type: 'menu', title: '租户列表', path: '/org/tenants', breadcrumb: '组织与账号' },
  { id: 'm5', type: 'menu', title: '部门列表', path: '/org/departments', breadcrumb: '组织与账号' },
  { id: 'm6', type: 'menu', title: '用户列表', path: '/org/users', breadcrumb: '组织与账号' },
  { id: 'm7', type: 'menu', title: '部门列表', path: '/org/departments', breadcrumb: '组织与账号' },
  { id: 'm8', type: 'menu', title: '租户列表', path: '/org/tenants', breadcrumb: '组织与账号' },
  { id: 'm9', type: 'menu', title: '部门角色分配', path: '/org/departments/:id/roles', breadcrumb: '组织与账号' },
  { id: 'm12', type: 'menu', title: '角色绑定', path: '/org/users/users-roles', breadcrumb: '访问控制 · 用户分配' },

  // 导航与可见性
  { id: 'm13', type: 'menu', title: '菜单列表', path: '/navigation/menus', breadcrumb: '导航与可见性' },
  { id: 'm14', type: 'menu', title: '菜单预览', path: '/navigation/menus/preview', breadcrumb: '导航与可见性' },


  // 策略中心
  { id: 'm19', type: 'menu', title: '策略管理', path: '/strategy/management', breadcrumb: '策略中心' },
  { id: 'm20', type: 'menu', title: '策略编排', path: '/strategy/designer', breadcrumb: '策略中心' },
  { id: 'm21', type: 'menu', title: '策略监控', path: '/strategy/monitor', breadcrumb: '策略中心' },

  // 运维与审计
  { id: 'm22', type: 'menu', title: '操作日志', path: '/ops/logs/operation', breadcrumb: '运维与审计' },
  { id: 'm23', type: 'menu', title: '请求日志', path: '/ops/logs/request', breadcrumb: '运维与审计' },
  { id: 'm24', type: 'menu', title: '接口列表', path: '/ops/api-list', breadcrumb: '运维与审计' },
  { id: 'm25', type: 'menu', title: '权限基线', path: '/ops/baseline', breadcrumb: '运维与审计' },
  { id: 'm26', type: 'menu', title: '策略模拟器', path: '/ops/simulator', breadcrumb: '运维与审计' },

  // 测试功能
  { id: 'm27', type: 'menu', title: 'CRUD测试', path: '/test/crud', breadcrumb: '测试功能' },
  { id: 'm28', type: 'menu', title: 'SVG插件测试', path: '/test/svg-plugin', breadcrumb: '测试功能' },
  { id: 'm29', type: 'menu', title: '国际化测试', path: '/test/i18n', breadcrumb: '测试功能' },
  { id: 'm30', type: 'menu', title: '状态切换按钮', path: '/test/select-button', breadcrumb: '测试功能' },

  // 页面
  { id: 'p1', type: 'page', title: '首页', path: '/', breadcrumb: '主应用' },
  { id: 'p2', type: 'page', title: 'menu.logistics.procurementModule', path: '/logistics/procurement', breadcrumb: '物流应用' },
  { id: 'p3', type: 'page', title: 'menu.logistics.warehouse', path: '/logistics/warehouse', breadcrumb: '物流应用' },
  { id: 'p4', type: 'page', title: 'menu.logistics.customs', path: '/logistics/customs', breadcrumb: '物流应用' },
  { id: 'p3', type: 'page', title: '工程概览', path: '/engineering', breadcrumb: '工程应用' },
  { id: 'p4', type: 'page', title: '品质概览', path: '/quality', breadcrumb: '品质应用' },
  { id: 'p5', type: 'page', title: '生产概览', path: '/production', breadcrumb: '生产应用' },
]);

// 最近搜索（从 localStorage 读取）
const recentSearches = ref<string[]>([]);

// 快捷访问（包含文档）
const quickAccess = computed(() => [
  { id: 'q1', type: 'page', title: '首页', path: '/' },
  { id: 'q2', type: 'menu', title: 'CRUD测试', path: '/test/crud' },
  { id: 'q3', type: 'menu', title: '用户列表', path: '/org/users' },
  { id: 'q4', type: 'doc', title: '组件文档', path: '/components/', breadcrumb: '文档中心' },
]);

// 推荐搜索词（空状态时显示）
const suggestedKeywords = ref([
  '用户',
  '权限',
  'CRUD',
  '组件',
  '文档',
]);

// 搜索结果状态
const searchResults = ref<any[]>([]);
const isSearching = ref(false);

// 监听搜索关键词变化，异步搜索
watch(searchKeyword, async (keyword) => {
  if (!keyword.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  const lowerKeyword = keyword.toLowerCase().trim();

  try {
    // 搜索菜单（同步）
    const menuResults = searchData.value
      .filter(item =>
        item.title.toLowerCase().includes(lowerKeyword) ||
        (item.breadcrumb && item.breadcrumb.toLowerCase().includes(lowerKeyword))
      );

    // 搜索文档（异步）
    const docResults = await searchDocs(lowerKeyword);

    // 合并结果并添加全局索引
    const allResults = [...menuResults, ...docResults];
    searchResults.value = allResults.map((item, index) => ({ ...item, globalIndex: index }));
  } catch (_error) {
    logger.error('[GlobalSearch] Search failed:', _error);
    // 搜索失败时仍然显示菜单结果
    const menuResults = searchData.value
      .filter(item =>
        item.title.toLowerCase().includes(lowerKeyword) ||
        (item.breadcrumb && item.breadcrumb.toLowerCase().includes(lowerKeyword))
      );
    searchResults.value = menuResults.map((item, index) => ({ ...item, globalIndex: index }));
  } finally {
    isSearching.value = false;
  }
}, { immediate: false });

// 分组结果（菜单 + 页面 + 文档）
const groupedResults = computed(() => {
  const groups: any[] = [];
  const menuItems = searchResults.value.filter(r => r.type === 'menu');
  const pageItems = searchResults.value.filter(r => r.type === 'page');
  const docItems = searchResults.value.filter(r => r.type === 'doc');

  if (menuItems.length > 0) {
    groups.push({
      title: t('common.menu_items'),
      items: menuItems
    });
  }

  if (pageItems.length > 0) {
    groups.push({
      title: t('common.pages'),
      items: pageItems
    });
  }

  if (docItems.length > 0) {
    groups.push({
      title: t('common.documents'),
      items: docItems
    });
  }

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

// 高亮关键词
const highlightKeyword = (text: string) => {
  if (!searchKeyword.value.trim()) return text;
  const keyword = searchKeyword.value.trim();
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
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
  &__backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  &__container {
    position: relative;
    width: 640px;
    max-width: 90vw;
    max-height: 70vh;
    background-color: var(--el-bg-color);
    border-radius: 12px;
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
      box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
    }

    .result-hit__icon {
      color: var(--el-color-primary);
    }

    // 不改变整个标题的颜色，让 mark 保持原样
    // .result-hit__title {
    //   color: var(--el-color-primary);
    // }

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
    color: var(--el-text-color-placeholder);
    transition: all 0.15s ease;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__select-icon {
    // 进入箭头图标
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

  .search-modal__backdrop {
    transition: opacity 0.25s ease;
  }

  .search-modal__container {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.search-modal-leave-active {
  transition: all 0.2s ease;

  .search-modal__backdrop {
    transition: opacity 0.2s ease;
  }

  .search-modal__container {
    transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
  }
}

.search-modal-enter-from,
.search-modal-leave-to {
  .search-modal__backdrop {
    opacity: 0;
  }

  .search-modal__container {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
  }
}
</style>


