<template>
  <div class="filter-list-test">
    <BtcFilterTableGroup
      ref="filterTableGroupRef"
      :filter-service="filterService"
      :right-service="testService"
      :table-columns="tableColumns"
      :form-items="formItems"
      :category-column-map="categoryColumnMap"
      right-title="数据列表"
      :enable-filter-search="true"
      :default-expanded-count="5"
    />
  </div>
</template>

<script setup lang="ts">
import { BtcFilterTableGroup } from '@btc/shared-components';
import type { FilterCategory, TableColumn, FormItem } from '@btc/shared-components';
import { type CrudService, logger } from '@btc/shared-core';
import { service } from '@services/eps';

defineOptions({
  name: 'FilterListTest',
});

const filterTableGroupRef = ref<InstanceType<typeof BtcFilterTableGroup>>();

// 监控分类面板的尺寸变化
let collapseObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let lastLoggedState: {
  totalWidth: number;
  totalScrollWidth: number;
  filterListWidth: number;
} | null = null;

// 检查所有分类面板的尺寸
const checkCollapseItemsSize = () => {
  if (!filterTableGroupRef.value) return;
  
  const componentEl = (filterTableGroupRef.value as any)?.$el;
  if (!componentEl) return;
  
  // 查找所有 btc-collapse-item 元素
  const collapseItems = componentEl.querySelectorAll?.('.btc-collapse-item') || [];
  
  if (collapseItems.length === 0) return;
  
  const itemsInfo: Array<{
    index: number;
    width: number;
    scrollWidth: number;
    height: number;
    scrollHeight: number;
    headerWidth: number;
    headerScrollWidth: number;
    titleWidth: number;
    titleScrollWidth: number;
  }> = [];
  
  let totalWidth = 0;
  let totalScrollWidth = 0;
  
  collapseItems.forEach((item: HTMLElement, index: number) => {
    const header = item.querySelector('.btc-collapse-item__header') as HTMLElement;
    const title = item.querySelector('.btc-filter-list__category-title') as HTMLElement;
    
    const width = item.offsetWidth;
    const scrollWidth = item.scrollWidth;
    const height = item.offsetHeight;
    const scrollHeight = item.scrollHeight;
    const headerWidth = header?.offsetWidth || 0;
    const headerScrollWidth = header?.scrollWidth || 0;
    const titleWidth = title?.offsetWidth || 0;
    const titleScrollWidth = title?.scrollWidth || 0;
    
    totalWidth += width;
    totalScrollWidth += scrollWidth;
    
    itemsInfo.push({
      index,
      width,
      scrollWidth,
      height,
      scrollHeight,
      headerWidth,
      headerScrollWidth,
      titleWidth,
      titleScrollWidth
    });
  });
  
  // 查找 btc-filter-list 元素
  const filterList = componentEl.querySelector?.('.btc-filter-list') as HTMLElement;
  const filterListWidth = filterList?.offsetWidth || 0;
  const filterListScrollWidth = filterList?.scrollWidth || 0;
  const filterListComputedStyle = filterList ? window.getComputedStyle(filterList) : null;
  const collapsedWidthVar = filterListComputedStyle?.getPropertyValue('--btc-filter-list-collapsed-width')?.trim() || '';
  const filterListWidthStyle = filterListComputedStyle?.width || '';
  
  // 检查是否有显著变化（避免重复日志）
  const hasSignificantChange = !lastLoggedState || 
    Math.abs(totalWidth - lastLoggedState.totalWidth) > 10 ||
    Math.abs(totalScrollWidth - lastLoggedState.totalScrollWidth) > 10 ||
    Math.abs(filterListWidth - lastLoggedState.filterListWidth) > 10 ||
    // 折叠状态：宽度被压缩
    filterListWidth < 100 ||
    // 展开状态：宽度差异过大
    Math.abs(totalWidth - totalScrollWidth) > 50;
  
  if (hasSignificantChange) {
    lastLoggedState = {
      totalWidth,
      totalScrollWidth,
      filterListWidth
    };
    
  }
};

// 开始监控
const startCollapseMonitoring = () => {
  if (!filterTableGroupRef.value) return;
  
  nextTick(() => {
    const componentEl = (filterTableGroupRef.value as any)?.$el;
    if (!componentEl) {
      return;
    }
    
    // 查找所有 btc-collapse-item 元素
    const collapseItems = componentEl.querySelectorAll?.('.btc-collapse-item') || [];
    
    if (collapseItems.length === 0) {
      return;
    }
    
    // 使用 ResizeObserver 监控尺寸变化
    collapseObserver = new ResizeObserver((entries) => {
      // 延迟检查，确保所有变化都完成
      setTimeout(() => {
        checkCollapseItemsSize();
      }, 10);
    });
    
    // 监控所有分类面板
    collapseItems.forEach((el: HTMLElement) => {
      collapseObserver?.observe(el);
    });
    
    // 监控 btc-filter-list 容器，因为它的尺寸变化会影响所有子元素
    const filterList = componentEl.querySelector?.('.btc-filter-list') as HTMLElement;
    if (filterList) {
      collapseObserver?.observe(filterList);
    }
    
    // 使用 MutationObserver 监控 DOM 变化（当折叠/展开时）
    mutationObserver = new MutationObserver(() => {
      // DOM 变化时重新检查
      nextTick(() => {
        setTimeout(() => {
          checkCollapseItemsSize();
        }, 10);
      });
    });
    
    // 监控整个组件的变化
    mutationObserver.observe(componentEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
    
    // 立即检查一次
    setTimeout(() => {
      checkCollapseItemsSize();
    }, 500);
  });
};

// 停止监控
const stopCollapseMonitoring = () => {
  if (collapseObserver) {
    collapseObserver.disconnect();
    collapseObserver = null;
  }
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
};

onMounted(() => {
  // 延迟启动监控，确保 DOM 已渲染
  setTimeout(() => {
    startCollapseMonitoring();
  }, 1000);
});

onUnmounted(() => {
  stopCollapseMonitoring();
});

// 使用真实的 user.options 服务获取筛选分类数据
const filterService = {
  list: async () => {
    try {
      const res = await service.admin?.iam?.user?.options();
      // 确保返回的是 FilterCategory[] 格式
      return Array.isArray(res) ? res : (res?.list || res?.data || []);
    } catch (error) {
      logger.error('[FilterListTest] Failed to load filter categories:', error);
      return [];
    }
  },
};

// 测试数据（作为备用，如果服务失败时使用）
const testCategories: FilterCategory[] = [
  {
    id: 'production',
    name: '产品',
    options: [
      { label: '产品A', value: 'prod_a' },
      { label: '产品B', value: 'prod_b' },
      { label: '产品C', value: 'prod_c' },
      { label: '产品D', value: 'prod_d' },
      { label: '产品E', value: 'prod_e' },
      { label: '产品F', value: 'prod_f' },
      { label: '产品G', value: 'prod_g' },
      { label: '产品H', value: 'prod_h' },
    ],
  },
  {
    id: 'method',
    name: '方法',
    options: [
      { label: '方法1', value: 'method_1' },
      { label: '方法2', value: 'method_2' },
      { label: '方法3', value: 'method_3' },
      { label: '方法4', value: 'method_4' },
      { label: '方法5', value: 'method_5' },
      { label: '方法6', value: 'method_6' },
    ],
  },
  {
    id: 'status',
    name: '状态',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '禁用', value: 'disabled' },
      { label: '待审核', value: 'pending' },
      { label: '已归档', value: 'archived' },
      { label: '草稿', value: 'draft' },
      { label: '已发布', value: 'published' },
    ],
  },
  {
    id: 'type',
    name: '类型',
    options: [
      { label: '类型A', value: 'type_a' },
      { label: '类型B', value: 'type_b' },
      { label: '类型C', value: 'type_c' },
      { label: '类型D', value: 'type_d' },
      { label: '类型E', value: 'type_e' },
      { label: '类型F', value: 'type_f' },
      { label: '类型G', value: 'type_g' },
      { label: '类型H', value: 'type_h' },
    ],
  },
  {
    id: 'priority',
    name: '优先级',
    options: [
      { label: '高', value: 'high' },
      { label: '中', value: 'medium' },
      { label: '低', value: 'low' },
      { label: '紧急', value: 'urgent' },
      { label: '普通', value: 'normal' },
    ],
  },
  {
    id: 'department',
    name: '部门',
    options: [
      { label: '研发部', value: 'rd' },
      { label: '产品部', value: 'product' },
      { label: '设计部', value: 'design' },
      { label: '运营部', value: 'operation' },
      { label: '市场部', value: 'marketing' },
      { label: '销售部', value: 'sales' },
      { label: '客服部', value: 'support' },
    ],
  },
  {
    id: 'region',
    name: '地区',
    options: [
      { label: '北京', value: 'beijing' },
      { label: '上海', value: 'shanghai' },
      { label: '广州', value: 'guangzhou' },
      { label: '深圳', value: 'shenzhen' },
      { label: '杭州', value: 'hangzhou' },
      { label: '成都', value: 'chengdu' },
      { label: '武汉', value: 'wuhan' },
      { label: '西安', value: 'xian' },
    ],
  },
  {
    id: 'tag',
    name: '标签',
    options: [
      { label: '重要', value: 'important' },
      { label: '紧急', value: 'urgent' },
      { label: '待处理', value: 'pending' },
      { label: '已完成', value: 'completed' },
      { label: '进行中', value: 'in_progress' },
      { label: '已取消', value: 'cancelled' },
    ],
  },
  {
    id: 'category',
    name: '分类',
    options: [
      { label: '分类1', value: 'cat_1' },
      { label: '分类2', value: 'cat_2' },
      { label: '分类3', value: 'cat_3' },
      { label: '分类4', value: 'cat_4' },
      { label: '分类5', value: 'cat_5' },
    ],
  },
  {
    id: 'version',
    name: '版本',
    options: [
      { label: 'v1.0', value: 'v1.0' },
      { label: 'v1.1', value: 'v1.1' },
      { label: 'v1.2', value: 'v1.2' },
      { label: 'v2.0', value: 'v2.0' },
      { label: 'v2.1', value: 'v2.1' },
      { label: 'v3.0', value: 'v3.0' },
    ],
  },
];

// 获取选项标签
const getOptionLabel = (categoryId: string, optionValue: any): string => {
  const category = testCategories.find(cat => cat.id === categoryId);
  const option = category?.options.find(opt => opt.value === optionValue);
  return option?.label || String(optionValue);
};

// 分类到列的映射配置（用于列优先级功能）
const categoryColumnMap = {
  production: ['production'], // 选中"产品"分类时，优先显示产品列
  method: ['method'], // 选中"方法"分类时，优先显示方法列
  status: ['status'], // 选中"状态"分类时，优先显示状态列
  type: ['type'], // 选中"类型"分类时，优先显示类型列
  priority: ['priority'], // 选中"优先级"分类时，优先显示优先级列
  department: ['department'], // 选中"部门"分类时，优先显示部门列
  region: ['region'], // 选中"地区"分类时，优先显示地区列
  tag: ['tag'], // 选中"标签"分类时，优先显示标签列
  category: ['category'], // 选中"分类"分类时，优先显示分类列
  version: ['version'], // 选中"版本"分类时，优先显示版本列
};

// 生成测试数据的辅助函数
const generateTestData = (count: number) => {
  const data = [];
  const productions = ['prod_a', 'prod_b', 'prod_c', 'prod_d', 'prod_e', 'prod_f', 'prod_g', 'prod_h'];
  const methods = ['method_1', 'method_2', 'method_3', 'method_4', 'method_5', 'method_6'];
  const statuses = ['enabled', 'disabled', 'pending', 'archived', 'draft', 'published'];
  const types = ['type_a', 'type_b', 'type_c', 'type_d', 'type_e', 'type_f', 'type_g', 'type_h'];
  const priorities = ['high', 'medium', 'low', 'urgent', 'normal'];
  const departments = ['rd', 'product', 'design', 'operation', 'marketing', 'sales', 'support'];
  const regions = ['beijing', 'shanghai', 'guangzhou', 'shenzhen', 'hangzhou', 'chengdu', 'wuhan', 'xian'];
  const tags = ['important', 'urgent', 'pending', 'completed', 'in_progress', 'cancelled'];
  const categories = ['cat_1', 'cat_2', 'cat_3', 'cat_4', 'cat_5'];
  const versions = ['v1.0', 'v1.1', 'v1.2', 'v2.0', 'v2.1', 'v3.0'];

  for (let i = 1; i <= count; i++) {
    const date = new Date(2024, 0, i);
    date.setHours(9 + (i % 12), (i * 5) % 60, 0);
    data.push({
      id: i,
      name: `测试数据${i}`,
      production: productions[i % productions.length],
      method: methods[i % methods.length],
      status: statuses[i % statuses.length],
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      department: departments[i % departments.length],
      region: regions[i % regions.length],
      tag: tags[i % tags.length],
      category: categories[i % categories.length],
      version: versions[i % versions.length],
      createTime: date.toLocaleString('zh-CN'),
    });
  }
  return data;
};

// 测试数据（生成50条）
const testData = ref(generateTestData(50));

// 创建测试服务
const testService: CrudService = {
  page: async (params: Record<string, unknown>) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...testData.value];

    // 处理搜索关键词和筛选条件
    if (params?.keyword) {
      const keywordObj = params.keyword as Record<string, any>;
      const searchKeyword = keywordObj.keyword || keywordObj.search || params.keyword;
      if (searchKeyword && typeof searchKeyword === 'string') {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(keyword)
        );
      }

      // 处理筛选条件（BtcFilterTableGroup 会自动将筛选结果转换为 keyword 对象）
      Object.keys(keywordObj).forEach(key => {
        if (key !== 'keyword' && key !== 'search' && Array.isArray(keywordObj[key])) {
          const filterValues = keywordObj[key];
          if (filterValues.length > 0) {
            filtered = filtered.filter(item => {
              const fieldMap: Record<string, string> = {
                production: 'production',
                method: 'method',
                status: 'status',
                type: 'type',
                priority: 'priority',
                department: 'department',
                region: 'region',
                tag: 'tag',
                category: 'category',
                version: 'version',
              };
              const fieldName = fieldMap[key];
              if (!fieldName) return true;
              return filterValues.includes(item[fieldName]);
            });
          }
        }
      });
    }

    // 处理分页
    const page = Number(params?.page || params?.pageNumber || 1);
    const pageSize = Number(params?.pageSize || params?.size || 10);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const list = filtered.slice(start, end);

    return {
      list,
      total: filtered.length,
    };
  },

  add: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newId = testData.value.length > 0
      ? Math.max(...testData.value.map(d => d.id)) + 1
      : 1;
    const newItem = {
      ...data,
      id: newId,
      createTime: new Date().toLocaleString('zh-CN'),
    };
    testData.value.push(newItem);
  },

  update: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = testData.value.findIndex(item => item.id === data.id);
    if (index !== -1) {
      testData.value[index] = { ...testData.value[index], ...data };
    } else {
      throw new Error('数据不存在');
    }
  },

  delete: async (id: string | number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = testData.value.findIndex(item => item.id === id);
    if (index !== -1) {
      testData.value.splice(index, 1);
    } else {
      throw new Error('数据不存在');
    }
  },

  deleteBatch: async (ids: (string | number)[]) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    testData.value = testData.value.filter(item => !ids.includes(item.id));
  },
};

// 表格列定义
const tableColumns: TableColumn[] = [
  { prop: 'id', label: '序号', width: 80, fixed: 'left' },
  { prop: 'name', label: '名称', minWidth: 150, fixed: 'left' },
  {
    prop: 'production',
    label: '产品',
    width: 120,
    formatter: (row: any) => getOptionLabel('production', row.production),
  },
  {
    prop: 'method',
    label: '方法',
    width: 120,
    formatter: (row: any) => getOptionLabel('method', row.method),
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    formatter: (row: any) => getOptionLabel('status', row.status),
  },
  {
    prop: 'type',
    label: '类型',
    width: 120,
    formatter: (row: any) => getOptionLabel('type', row.type),
  },
  {
    prop: 'priority',
    label: '优先级',
    width: 100,
    formatter: (row: any) => getOptionLabel('priority', row.priority),
  },
  {
    prop: 'department',
    label: '部门',
    width: 120,
    formatter: (row: any) => getOptionLabel('department', row.department),
  },
  {
    prop: 'region',
    label: '地区',
    width: 120,
    formatter: (row: any) => getOptionLabel('region', row.region),
  },
  {
    prop: 'tag',
    label: '标签',
    width: 100,
    formatter: (row: any) => getOptionLabel('tag', row.tag),
  },
  {
    prop: 'category',
    label: '分类',
    width: 100,
    formatter: (row: any) => getOptionLabel('category', row.category),
  },
  {
    prop: 'version',
    label: '版本',
    width: 100,
    formatter: (row: any) => getOptionLabel('version', row.version),
  },
  { prop: 'createTime', label: '创建时间', width: 180, fixed: 'right' },
];

// 表单字段定义
const formItems: FormItem[] = [
  {
    prop: 'name',
    label: '名称',
    component: 'el-input',
    required: true,
  },
  {
    prop: 'production',
    label: '产品',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'production')?.options || [],
    required: true,
  },
  {
    prop: 'method',
    label: '方法',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'method')?.options || [],
    required: true,
  },
  {
    prop: 'status',
    label: '状态',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'status')?.options || [],
    required: true,
  },
  {
    prop: 'type',
    label: '类型',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'type')?.options || [],
    required: true,
  },
  {
    prop: 'priority',
    label: '优先级',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'priority')?.options || [],
    required: true,
  },
  {
    prop: 'department',
    label: '部门',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'department')?.options || [],
    required: true,
  },
  {
    prop: 'region',
    label: '地区',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'region')?.options || [],
    required: true,
  },
  {
    prop: 'tag',
    label: '标签',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'tag')?.options || [],
    required: true,
  },
  {
    prop: 'category',
    label: '分类',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'category')?.options || [],
    required: true,
  },
  {
    prop: 'version',
    label: '版本',
    component: 'el-select',
    options: testCategories.find(c => c.id === 'version')?.options || [],
    required: true,
  },
];
</script>

<style scoped lang="scss">
.filter-list-test {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
