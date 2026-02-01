<template>
  <div class="page" ref="newsPageRef">
    <!-- 主内容区 -->
    <section class="main-content">
      <!-- SVG几何背景（自动提供内容区域） -->
      <GeometricBackground ref="geometricBackgroundRef">
        <div class="content">
          <div class="container">
            <!-- 照片墙标题 -->
            <div class="gallery-header">
              <h2 class="gallery-title">新闻动态</h2>
              <p class="gallery-subtitle">News & Updates</p>
            </div>
            <!-- 瀑布流照片墙 -->
            <div class="gallery-section">
              <BtcMasonryGallery
                :items="galleryItems"
                :columns="'auto'"
                :gap="16"
                @item-click="handleGalleryItemClick"
              />
            </div>
          </div>
        </div>
      </GeometricBackground>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GeometricBackground from '@/components/GeometricBackground.vue';
import BtcMasonryGallery from '@/components/BtcMasonryGallery.vue';
import type { MasonryItem } from '@/components/BtcMasonryGallery.vue';

// 导入 WebP 版本（优先使用，体积更小）
import img1WebP from '@/assets/webp/1.webp';
import img2WebP from '@/assets/webp/2.webp';
import img3WebP from '@/assets/webp/3.webp';
import img5WebP from '@/assets/webp/5.webp';
import img6WebP from '@/assets/webp/6.webp';
import img7WebP from '@/assets/webp/7.webp';
import img8WebP from '@/assets/webp/8.webp';
import img9WebP from '@/assets/webp/9.webp';
import img10WebP from '@/assets/webp/10.webp';
import img11WebP from '@/assets/webp/11.webp';
import img12WebP from '@/assets/webp/12.webp';
import img13WebP from '@/assets/webp/13.webp';
import img14WebP from '@/assets/webp/14.webp';
import img15WebP from '@/assets/webp/15.webp';
import img16WebP from '@/assets/webp/16.webp';
import img17WebP from '@/assets/webp/17.webp';
import img18WebP from '@/assets/webp/18.webp';
import img19WebP from '@/assets/webp/19.webp';
import img20WebP from '@/assets/webp/20.webp';
import img21WebP from '@/assets/webp/21.webp';
import img22WebP from '@/assets/webp/22.webp';
import img23WebP from '@/assets/webp/23.webp';

// 导入 JPG/PNG 版本（作为降级方案）
import img1Jpg from '@/assets/images/1.jpg';
import img2Jpg from '@/assets/images/2.jpg';
import img3Png from '@/assets/images/3.png';
import img5Jpg from '@/assets/images/5.jpg';
import img6Png from '@/assets/images/6.png';
import img7Jpg from '@/assets/images/7.jpg';
import img8Jpg from '@/assets/images/8.jpg';
import img9Jpg from '@/assets/images/9.jpg';
import img10Jpg from '@/assets/images/10.jpg';
import img11Png from '@/assets/images/11.png';
import img12Png from '@/assets/images/12.png';
import img13Jpg from '@/assets/images/13.jpg';
import img14Png from '@/assets/images/14.png';
import img15Png from '@/assets/images/15.png';
import img16Jpg from '@/assets/images/16.jpg';
import img17Jpg from '@/assets/images/17.jpg';
import img18Jpg from '@/assets/images/18.jpg';
import img19Jpg from '@/assets/images/19.jpg';
import img20Jpg from '@/assets/images/20.jpg';
import img21Jpg from '@/assets/images/21.jpg';
import img22Png from '@/assets/images/22.png';
import img23Jpg from '@/assets/images/23.jpg';

// 图片加载策略：
// 开发环境：优先使用本地 WebP，失败后降级到 JPG/PNG
// 生产环境：直接使用 CDN 图片（WebP 格式）

import { getCdnFallbackUrl } from '@/utils/image-optimizer';

defineOptions({
  name: 'NewsPage',
});

// 判断是否是生产环境
const isProduction = import.meta.env.PROD;

// 生成图片数据
// 生产环境：直接使用 CDN URL
// 开发环境：使用本地导入的图片
const generateImageItem = (id: number, webpPath: any, fallbackPath: any, alt: string, isPng: boolean = false): MasonryItem => {
  if (isProduction) {
    // 生产环境：直接使用 CDN
    // 使用 getCdnFallbackUrl 构建 CDN URL，确保路径一致
    // WebP 文件：https://all.bellis.com.cn/images/webp/21.webp
    // JPG/PNG 文件：https://all.bellis.com.cn/images/21.jpg 或 21.png
    const extension = isPng ? 'png' : 'jpg';
    const cdnWebpUrl = getCdnFallbackUrl(`/images/webp/${id}.webp`);
    const cdnFallbackUrl = getCdnFallbackUrl(`/images/${id}.${extension}`);
    
    return {
      id,
      src: cdnWebpUrl,
      alt,
      fallback: cdnFallbackUrl,
    };
  } else {
    // 开发环境：使用本地导入的图片
    return {
      id,
      src: webpPath,
      alt,
      fallback: fallbackPath,
    };
  }
};

// 照片数据
// 关键：使用 Set 去重，确保每个图片只显示一次（根据 id 去重）
const allItems: MasonryItem[] = [
  generateImageItem(1, img1WebP, img1Jpg, '图片1', false),
  generateImageItem(2, img2WebP, img2Jpg, '图片2', false),
  generateImageItem(3, img3WebP, img3Png, '图片3', true),
  generateImageItem(5, img5WebP, img5Jpg, '图片5', false),
  generateImageItem(6, img6WebP, img6Png, '图片6', true),
  generateImageItem(7, img7WebP, img7Jpg, '图片7', false),
  generateImageItem(8, img8WebP, img8Jpg, '图片8', false),
  generateImageItem(9, img9WebP, img9Jpg, '图片9', false),
  generateImageItem(10, img10WebP, img10Jpg, '图片10', false),
  generateImageItem(11, img11WebP, img11Png, '图片11', true),
  generateImageItem(12, img12WebP, img12Png, '图片12', true),
  generateImageItem(13, img13WebP, img13Jpg, '图片13', false),
  generateImageItem(14, img14WebP, img14Png, '图片14', true),
  generateImageItem(15, img15WebP, img15Png, '图片15', true),
  generateImageItem(16, img16WebP, img16Jpg, '图片16', false),
  generateImageItem(17, img17WebP, img17Jpg, '图片17', false),
  generateImageItem(18, img18WebP, img18Jpg, '图片18', false),
  generateImageItem(19, img19WebP, img19Jpg, '图片19', false),
  generateImageItem(20, img20WebP, img20Jpg, '图片20', false),
  generateImageItem(21, img21WebP, img21Jpg, '图片21', false),
  generateImageItem(22, img22WebP, img22Png, '图片22', true),
  generateImageItem(23, img23WebP, img23Jpg, '图片23', false),
];

// 去重：根据图片编号（id）去重，确保webp和jpg/png作为同一张图片的不同格式不会重复显示
// 关键：webp和jpg/png是同一张图片的不同格式，应该根据id去重，而不是根据src路径
const uniqueItems = allItems.filter((item, index, self) => {
  // 根据id去重，如果id相同，只保留第一个出现的项
  return index === self.findIndex((i) => i.id === item.id);
});

const galleryItems = ref<MasonryItem[]>(uniqueItems);

const handleGalleryItemClick = () => {
  // 图片预览功能由组件内部处理
};
</script>

<style scoped lang="scss">
@use '../styles/index.scss' as *;
</style>

