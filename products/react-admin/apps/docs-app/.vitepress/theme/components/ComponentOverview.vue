<template>
  <div class="component-overview">
    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchQuery"
        placeholder="搜索组件..."
        size="large"
        clearable
      >
        <template #prefix>
          <span style="font-size: 18px;">🔍</span>
        </template>
      </el-input>
    </div>

    <!-- 组件分类 -->
    <div v-for="category in filteredCategories" :key="category.name" class="category-section">
      <h2 class="category-title">{{ category.name }}</h2>
      <div class="component-grid">
        <el-card
          v-for="component in category.components"
          :key="component.name"
          class="component-card"
          shadow="hover"
          @click="navigateToDoc(component.link)"
        >
          <template #header>
            <div class="card-header">
              <span class="card-icon">{{ component.icon }}</span>
              <span class="card-title">{{ component.name }}</span>
            </div>
          </template>

          <div class="card-body">
            <p class="card-description">{{ component.description }}</p>

            <!-- 静态预览（使用简单的 HTML 渲染效果） -->
            <div class="component-demo" v-html="component.preview"></div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 无结果提示 -->
    <div v-if="filteredCategories.length === 0" class="no-results">
      <el-empty description="未找到匹配的组件" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue';
import { useRouter } from 'vitepress';

const router = useRouter();
const searchQuery = ref('');

interface ComponentItem {
  name: string;
  description: string;
  link: string;
  icon: string;
  keywords?: string[];
  preview: string;
}

interface Category {
  name: string;
  components: ComponentItem[];
}

// 简单的 HTML 预览
const tablePreview = `
  <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
    <thead>
      <tr style="background: var(--vp-c-bg-mute);">
        <th style="padding: 8px; border: 1px solid var(--vp-c-divider); text-align: left;">名称</th>
        <th style="padding: 8px; border: 1px solid var(--vp-c-divider); text-align: left;">状态</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 8px; border: 1px solid var(--vp-c-divider);">示例数据</td>
        <td style="padding: 8px; border: 1px solid var(--vp-c-divider);"><span style="color: #67C23A;">✓</span> 启用</td>
      </tr>
    </tbody>
  </table>
`;

const formPreview = `
  <div style="padding: 4px;">
    <div style="margin-bottom: 12px;">
      <label style="display: block; font-size: 13px; margin-bottom: 4px; color: var(--vp-c-text-2);">名称</label>
      <input type="text" placeholder="请输入名称" style="width: 100%; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 13px;" />
    </div>
    <div>
      <label style="display: block; font-size: 13px; margin-bottom: 4px; color: var(--vp-c-text-2);">描述</label>
      <textarea placeholder="请输入描述" style="width: 100%; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 13px; resize: none;" rows="2"></textarea>
    </div>
  </div>
`;

const dialogPreview = `
  <div style="text-align: center; padding: 24px; background: var(--vp-c-bg-mute); border-radius: 6px;">
    <div style="font-size: 32px; margin-bottom: 8px;">🗨️</div>
    <div style="font-size: 14px; font-weight: 600; color: var(--vp-c-text-1);">增强弹窗</div>
    <div style="font-size: 12px; color: var(--vp-c-text-2); margin-top: 4px;">支持全屏、拖拽、自定义控制</div>
  </div>
`;

const buttonPreview = `
  <div style="display: flex; gap: 8px; justify-content: center;">
    <button style="padding: 8px 16px; background: #409EFF; color: white; border: none; border-radius: 4px; font-size: 13px; cursor: pointer;">主要按钮</button>
    <button style="padding: 8px 16px; background: white; color: #606266; border: 1px solid #DCDFE6; border-radius: 4px; font-size: 13px; cursor: pointer;">默认按钮</button>
  </div>
`;

const searchPreview = `
  <div style="padding: 4px;">
    <input type="text" placeholder="🔍 搜索..." style="width: 100%; padding: 8px 12px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 13px;" />
  </div>
`;

const menuPreview = `
  <div style="font-size: 13px;">
    <div style="padding: 8px 12px; background: var(--vp-c-bg-mute); border-radius: 4px; margin-bottom: 4px; cursor: pointer;">
      <span style="margin-right: 8px;">📊</span>首页
    </div>
    <div style="padding: 8px 12px; border-radius: 4px;">
      <span style="margin-right: 8px;">⚙️</span>系统设置
    </div>
  </div>
`;

const viewGroupPreview = `
  <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; font-size: 12px;">
    <div style="padding: 12px; background: var(--vp-c-bg-mute); border-radius: 4px;">
      <div style="font-weight: 600; margin-bottom: 8px;">📁 组织架构</div>
      <div style="padding-left: 12px; color: var(--vp-c-text-2);">• 研发部</div>
      <div style="padding-left: 12px; color: var(--vp-c-text-2);">• 市场部</div>
    </div>
    <div style="padding: 12px; background: var(--vp-c-bg-mute); border-radius: 4px;">
      <div style="font-weight: 600; margin-bottom: 8px;">📊 数据列表</div>
      <div style="color: var(--vp-c-text-2);">[ 表格内容区域 ]</div>
    </div>
  </div>
`;

const defaultPreview = `
  <div style="text-align: center; padding: 32px; color: var(--vp-c-text-3); font-size: 13px;">
    点击查看详细文档 →
  </div>
`;

// 组件数据 - 使用 shallowRef 避免深层响应式
const categories = shallowRef<Category[]>([
  {
    name: 'Layout 组件',
    components: [
      { name: 'Topbar 顶栏', description: '应用顶栏，包含折叠、搜索、主题切换', link: './layout/topbar', icon: '📊', keywords: ['顶栏', 'topbar', '导航'], preview: defaultPreview },
      { name: 'Sidebar 侧边栏', description: '侧边栏菜单组件', link: './layout/sidebar', icon: '📑', keywords: ['侧边栏', 'sidebar', '菜单'], preview: menuPreview },
      { name: 'Process 标签页', description: '标签页进程栏', link: './layout/process', icon: '📑', keywords: ['标签', 'process', 'tab'], preview: defaultPreview },
      { name: 'Breadcrumb 面包屑', description: '面包屑导航', link: './layout/breadcrumb', icon: '🧭', keywords: ['面包屑', 'breadcrumb'], preview: defaultPreview },
      { name: 'MenuDrawer 应用抽屉', description: '应用切换抽屉', link: './layout/menu-drawer', icon: '📱', keywords: ['抽屉', 'drawer'], preview: defaultPreview },
      { name: 'DynamicMenu 动态菜单', description: '动态菜单组件', link: './layout/dynamic-menu', icon: '🔀', keywords: ['菜单', 'menu'], preview: menuPreview },
      { name: 'GlobalSearch 全局搜索', description: '全局搜索功能', link: './layout/global-search', icon: '🔍', keywords: ['搜索', 'search'], preview: searchPreview },
      { name: 'ThemeSwitcher 主题', description: '主题切换器', link: './layout/theme-switcher', icon: '🎨', keywords: ['主题', 'theme'], preview: buttonPreview },
      { name: 'LocaleSwitcher 语言', description: '语言切换器', link: './layout/locale-switcher', icon: '🌐', keywords: ['语言', 'locale', 'i18n'], preview: buttonPreview },
    ]
  },
  {
    name: 'CRUD 组件',
    components: [
      { name: 'BtcCrud 容器', description: 'CRUD 上下文容器', link: './crud', icon: '📦', keywords: ['crud', '增删改查'], preview: defaultPreview },
      { name: 'BtcTable 表格', description: '数据表格组件', link: './table', icon: '📊', keywords: ['table', '表格'], preview: tablePreview },
      { name: 'BtcUpsert 编辑', description: '新增/编辑弹窗', link: './upsert', icon: '✏️', keywords: ['upsert', '编辑'], preview: dialogPreview },
    ]
  },
  {
    name: '表单组件',
    components: [
      { name: 'BtcForm 表单', description: '通用表单组件', link: './form', icon: '📝', keywords: ['form', '表单'], preview: formPreview },
      { name: 'BtcDialog 弹窗', description: '增强弹窗组件', link: './dialog', icon: '🗨️', keywords: ['dialog', '弹窗'], preview: dialogPreview },
    ]
  },
  {
    name: '布局辅助',
    components: [
      { name: 'BtcViewGroup', description: '左树右表布局', link: './view-group', icon: '🔲', keywords: ['view-group', '树', '布局'], preview: viewGroupPreview },
    ]
  }
]);

// 过滤组件
const filteredCategories = computed(() => {
  if (!searchQuery.value.trim()) {
    return categories.value;
  }

  const query = searchQuery.value.toLowerCase();

  return categories.value
    .map(category => ({
      ...category,
      components: category.components.filter(component => {
        const searchText = [
          component.name,
          component.description,
          ...(component.keywords || [])
        ].join(' ').toLowerCase();

        return searchText.includes(query);
      })
    }))
    .filter(category => category.components.length > 0);
});

// 导航到文档
function navigateToDoc(link: string) {
  router.go(link);
}
</script>

<style scoped>
.component-overview {
  padding: 24px 0;
}

.search-container {
  margin-bottom: 32px;
  max-width: 600px;
}

.search-container :deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 4px 16px;
}

.category-section {
  margin-bottom: 48px;
}

.category-section:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 12px;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.component-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.component-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}

.component-card :deep(.el-card__header) {
  padding: 16px 20px;
  background: var(--vp-c-bg-soft);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  font-size: 24px;
  line-height: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  transition: color 0.2s ease;
}

.component-card:hover .card-title {
  color: var(--vp-c-brand-1);
}

.card-body {
  padding: 0;
}

.card-description {
  font-size: 14px;
  margin: 0 0 16px 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.component-demo {
  margin-top: 16px;
  padding: 20px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  min-height: 100px;
}

.no-results {
  padding: 80px 20px;
  text-align: center;
}
</style>
