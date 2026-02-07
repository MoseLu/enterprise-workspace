<template>
  <div class="test-page">
    <BtcImageContainer
      :items="imageItems"
      :columns="3"
      :gap="16"
      :filter-categories="filterCategories"
      @card-click="handleCardClick"
      @filter-change="handleFilterChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BtcImageContainer } from '@btc/shared-components';
import type { ImageItem } from '@btc/shared-components';
import type { FilterCategory, FilterResult } from '@btc/shared-components';

// 动态加载 test 文件夹中的所有图片
const imageModules = import.meta.glob('@/assets/test/*.{jpg,jpeg,png,webp}', { eager: true });

// 测试图片数据
const imageItems = ref<ImageItem[]>([]);

// 筛选分类配置
const filterCategories = ref<FilterCategory[]>([
  {
    id: 'category',
    name: '种类',
    options: [
      { label: '测试', value: '测试' },
      { label: '风景', value: '风景' },
      { label: '人物', value: '人物' },
    ],
  },
  {
    id: 'resolution',
    name: '分辨率',
    options: [
      { label: '1920x1080', value: '1920x1080' },
      { label: '3840x2160', value: '3840x2160' },
      { label: '2560x1440', value: '2560x1440' },
    ],
  },
  {
    id: 'colorScheme',
    name: '色系',
    options: [
      { label: '多彩', value: '多彩' },
      { label: '单色', value: '单色' },
      { label: '偏蓝', value: '偏蓝' },
      { label: '偏绿', value: '偏绿' },
    ],
  },
]);

// 初始化图片数据
onMounted(() => {
  const items: ImageItem[] = [];
  let id = 1;
  
  // 遍历所有导入的图片模块
  Object.entries(imageModules).forEach(([path, module], index) => {
    const imageSrc = (module as { default: string }).default;
    const fileName = path.split('/').pop() || '';
    
    // 预定义选项值，用于循环分配以测试筛选功能
    const categories = ['测试', '风景', '人物'];
    const resolutions = ['1920x1080', '3840x2160', '2560x1440'];
    const colorSchemes = ['多彩', '单色', '偏蓝', '偏绿'];
    
    items.push({
      id: id++,
      src: imageSrc,
      title: `测试图片 ${id - 1}`,
      alt: fileName,
      tags: ['测试'],
      downloads: Math.floor(Math.random() * 3000) + 100,
      favorites: Math.floor(Math.random() * 200) + 10,
      resolution: resolutions[index % resolutions.length],
      fileSize: '1.5 MB',
      category: categories[index % categories.length],
      colorScheme: colorSchemes[index % colorSchemes.length],
    });
  });
  
  // 按文件名排序，确保顺序一致
  items.sort((a, b) => {
    const aName = a.alt || '';
    const bName = b.alt || '';
    return aName.localeCompare(bName);
  });
  
  imageItems.value = items;
});

const router = useRouter();

const handleCardClick = (item: ImageItem) => {
  // 使用 sessionStorage 存储图片数据，确保数据能正确传递
  const storageKey = `image_detail_${item.id}`;
  sessionStorage.setItem(storageKey, JSON.stringify(item));
  
  // 跳转到详情页
  router.push({
    name: 'TestImageDetail',
    params: { id: item.id },
  });
};

const handleFilterChange = (result: FilterResult[]) => {
  console.log('筛选结果:', result);
};
</script>

<style scoped lang="scss">
.test-page {
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}
</style>
