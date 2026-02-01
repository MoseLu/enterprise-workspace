<template>
  <div class="page">
    <!-- 首屏视频/轮播图 -->
    <section class="hero-section">
      <!-- 视频播放器 -->
      <div class="hero-video">
        <VideoPlayer
          :src="videoSrcRef"
          :poster="videoPoster"
          :autoplay="false"
          :loop="true"
          :muted="true"
        />
      </div>
      <!-- 轮播图（可选，如果需要可以切换显示） -->
      <!-- <Carousel :slides="carouselSlides" :autoplay="true" :interval="3000" /> -->
    </section>

    <!-- 品牌理念标语区 -->
    <section class="brand-slogan">
      <div class="container">
        <div class="slogan-content">
          <span class="slogan-chinese">拜里斯</span>
          <span class="slogan-red">因为有你 所以精彩</span>
        </div>
        <p class="slogan-english">Because you are so wonderful</p>
      </div>
    </section>

    <!-- 核心理念网格区 -->
    <section class="core-values">
      <div class="container">
        <div class="values-grid">
          <!-- 左列：质量管理板块 -->
          <div class="values-column quality-management">
            <div class="section-block">
              <div class="red-title-bar">质量方针 / Quality Policy</div>
              <div class="red-outline-text policy-chinese">
                以最高性价比生产满足顾客期望的可靠产品。
              </div>
              <div class="red-outline-text policy-english">
                Assembly functional and reliable products that satisfy and anticipate the customer request with the best ratio quality/price.
        </div>
        </div>
            <div class="section-block">
              <div class="red-title-bar">质量目标 / Quality Objective</div>
              <ul class="quality-goals">
                <li>
                  <span class="goal-text">成品合格率≥98%</span>
                  <span class="goal-english">Finish goods pass yield≥98%</span>
                </li>
                <li>
                  <span class="goal-text">交货准时率≥98%</span>
                  <span class="goal-english">Delivery on time rate≥98%</span>
                </li>
                <li>
                  <span class="goal-text">顾客满意度≥118分</span>
                  <span class="goal-english">Customer satisfaction≥118 points</span>
                </li>
              </ul>
        </div>
      </div>

          <!-- 右列：团队文化板块 -->
          <div class="values-column team-culture">
            <div class="section-block culture-section">
              <div class="red-title-bar">团队理念</div>
              <div class="culture-cards-grid">
                <div class="culture-card">
                  <h3 class="card-title">团结</h3>
                  <p class="card-english">Teamwork</p>
                </div>
                <div class="culture-card">
                  <h3 class="card-title">成长</h3>
                  <p class="card-english">Grow Up</p>
          </div>
                <div class="culture-card">
                  <h3 class="card-title">创新</h3>
                  <p class="card-english">Innovative</p>
          </div>
                <div class="culture-card">
                  <h3 class="card-title">We're Established</h3>
                  <p class="card-english"></p>
          </div>
                <div class="culture-card">
                  <h3 class="card-title">We're Trusted</h3>
                  <p class="card-english"></p>
          </div>
                <div class="culture-card">
                  <h3 class="card-title">We're Innovative</h3>
                  <p class="card-english"></p>
          </div>
          </div>
          </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 产品展示区（滚动层叠样式） -->
    <section id="products-showcase" class="products-showcase" ref="productsSectionRef">
      <div class="container">
        <h2 class="products-title">产品中心</h2>
        <p class="products-subtitle">Product Center</p>
        <div class="products-scene" ref="productsSceneRef">
          <div
            class="sub-scene"
            v-for="(product, index) in products"
            :key="index"
            :data-index="index"
            :style="{ animationDelay: `${-Math.random() * 1}s` }"
          >
            <div class="product-card">
              <div class="product-image">
                <picture>
                  <!-- WebP 格式（优先使用） -->
                  <source
                    v-if="product.image.endsWith('.webp')"
                    :srcset="product.image"
                    type="image/webp"
                  />
                  <!-- PNG 降级方案 -->
                  <img
                    :src="product.fallback || product.image"
                    :alt="product.name"
                    loading="lazy"
                    decoding="async"
                    @error="(e) => handleProductImageError(e, product.fallback || product.image)"
                  />
                </picture>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-desc">{{ product.desc }}</p>
          </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import VideoPlayer from '@/components/VideoPlayer.vue';
import { checkWebPSupport, getCdnFallbackUrl, getCdnVideoUrl } from '@/utils/image-optimizer';

defineOptions({
  name: 'HomePage',
});

// 导入封面图（开发环境使用，生产环境使用 CDN）
import videoPosterWebP from '@/assets/webp/22.webp';
import videoPosterPng from '@/assets/images/22.png';

// 判断是否是生产环境
const isProduction = import.meta.env.PROD;

// 视频始终使用 CDN 版本（不参与构建）
const videoSrc = getCdnVideoUrl('automation_area_web.mp4');

// WebP 支持检测（缓存结果）
const supportsWebP = ref(false);

// 封面图 CDN URL（生产环境使用）
const CDN_BASE_URL = 'https://all.bellis.com.cn';
const cdnPosterWebP = `${CDN_BASE_URL}/images/webp/22.webp`;
const cdnPosterPng = `${CDN_BASE_URL}/images/22.png`;


// 封面图（使用 ref，支持动态切换）
const videoPoster = ref(isProduction ? cdnPosterPng : videoPosterPng); // 默认值根据环境设置

// 产品图片加载错误处理（多级降级：WebP -> PNG -> CDN）
const handleProductImageError = (event: Event, currentSrc: string) => {
  const img = event.target as HTMLImageElement;
  if (!img) return;

  // 获取当前产品
  const product = products.value.find(p => p.fallback === currentSrc || p.image === currentSrc);

  // 第一级降级：如果 WebP 失败，尝试 PNG
  if (product?.fallback && img.src === product.image) {
    img.src = product.fallback;
    return;
  }

  // 第二级降级：如果本地图片都失败，尝试 CDN
  const cdnUrl = getCdnFallbackUrl(currentSrc);
  if (img.src !== cdnUrl) {
    img.src = cdnUrl;
    // 清除错误处理，避免无限循环
    img.onerror = null;
  }
};

// 视频源（使用 ref，支持动态切换）
const videoSrcRef = ref(videoSrc);

// 预加载首屏封面图（关键资源，优先加载）
const preloadHeroPoster = () => {
  if (typeof window === 'undefined') return;

  // 根据环境选择图片 URL
  const posterUrl = isProduction
    ? (supportsWebP.value ? cdnPosterWebP : cdnPosterPng)
    : (supportsWebP.value ? videoPosterWebP : videoPosterPng);

  // 使用 link preload（最高优先级，浏览器会优先下载）
  // 注意：video 标签的 poster 属性会自动使用预加载的资源，无需重复请求
  const existingLink = document.querySelector(`link[href="${posterUrl}"]`);
  if (!existingLink) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = posterUrl;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
  }

  // 如果支持 WebP 且当前使用 WebP，预加载 PNG 作为后备
  // 注意：这里只预加载，不设置错误处理，因为 video 标签会自动降级
  if (supportsWebP.value) {
    const webpUrl = isProduction ? cdnPosterWebP : videoPosterWebP;
    const pngUrl = isProduction ? cdnPosterPng : videoPosterPng;

    if (posterUrl === webpUrl) {
      // 预加载 PNG 后备图片（使用较低的优先级，避免干扰 WebP 加载）
      const existingPngLink = document.querySelector(`link[href="${pngUrl}"]`);
      if (!existingPngLink) {
        const pngLink = document.createElement('link');
        pngLink.rel = 'preload';
        pngLink.as = 'image';
        pngLink.href = pngUrl;
        pngLink.setAttribute('fetchpriority', 'low');
        document.head.appendChild(pngLink);
      }
    }
  }
};

// 导入产品图片 WebP 版本（优先使用，体积更小）
import BNF_WebP from '@/assets/bellis_model/BNF.webp';
import NV11_SPECTRAL_WebP from '@/assets/bellis_model/NV11_SPECTRAL.webp';
import NV200_SPECTRAL_WebP from '@/assets/bellis_model/NV200_SPECTRAL.webp';
import NV22_SPECTRAL_WebP from '@/assets/bellis_model/NV22_SPECTRAL.webp';
import NV4000_WebP from '@/assets/bellis_model/NV4000.webp';
import NV9_SPECTRAL_WebP from '@/assets/bellis_model/NV9_SPECTRAL.webp';
import SAFE_INTERFACE_WebP from '@/assets/bellis_model/SAFE_INTERFACE.webp';
import SMART_COIN_SYSTEM_WebP from '@/assets/bellis_model/SMART_COIN_SYSTEM.webp';
import SMART_HOPPER_WebP from '@/assets/bellis_model/SMART_HOPPER.webp';
import SPECTRAL_PAYOUT_WebP from '@/assets/bellis_model/SPECTRAL_PAYOUT.webp';
import TWIN_SMART_COIN_SYSTEM_WebP from '@/assets/bellis_model/TWIN_SMART_COIN_SYSTEM.webp';

// 导入产品图片 PNG 版本（作为降级方案）
import BNF_Png from '@/assets/bellis_model/BNF.png';
import NV11_SPECTRAL_Png from '@/assets/bellis_model/NV11_SPECTRAL.png';
import NV200_SPECTRAL_Png from '@/assets/bellis_model/NV200_SPECTRAL.png';
import NV22_SPECTRAL_Png from '@/assets/bellis_model/NV22_SPECTRAL.png';
import NV4000_Png from '@/assets/bellis_model/NV4000.png';
import NV9_SPECTRAL_Png from '@/assets/bellis_model/NV9_SPECTRAL.png';
import SAFE_INTERFACE_Png from '@/assets/bellis_model/SAFE_INTERFACE.png';
import SMART_COIN_SYSTEM_Png from '@/assets/bellis_model/SMART_COIN_SYSTEM.png';
import SMART_HOPPER_Png from '@/assets/bellis_model/SMART_HOPPER.png';
import SPECTRAL_PAYOUT_Png from '@/assets/bellis_model/SPECTRAL_PAYOUT.png';
import TWIN_SMART_COIN_SYSTEM_Png from '@/assets/bellis_model/TWIN_SMART_COIN_SYSTEM.png';
;


// 产品数据（优先使用 WebP，降级到 PNG，最后降级到 CDN）
const products = ref([
  {
    name: 'BNF',
    desc: 'BNF 产品系列',
    image: BNF_WebP,
    fallback: BNF_Png,
  },
  {
    name: 'NV11 SPECTRAL',
    desc: 'NV11 光谱系列',
    image: NV11_SPECTRAL_WebP,
    fallback: NV11_SPECTRAL_Png,
  },
  {
    name: 'NV200 SPECTRAL',
    desc: 'NV200 光谱系列',
    image: NV200_SPECTRAL_WebP,
    fallback: NV200_SPECTRAL_Png,
  },
  {
    name: 'NV22 SPECTRAL',
    desc: 'NV22 光谱系列',
    image: NV22_SPECTRAL_WebP,
    fallback: NV22_SPECTRAL_Png,
  },
  {
    name: 'NV4000',
    desc: 'NV4000 产品系列',
    image: NV4000_WebP,
    fallback: NV4000_Png,
  },
  {
    name: 'NV9 SPECTRAL',
    desc: 'NV9 光谱系列',
    image: NV9_SPECTRAL_WebP,
    fallback: NV9_SPECTRAL_Png,
  },
  {
    name: 'SAFE INTERFACE',
    desc: '安全接口系统',
    image: SAFE_INTERFACE_WebP,
    fallback: SAFE_INTERFACE_Png,
  },
  {
    name: 'SMART COIN SYSTEM',
    desc: '智能硬币系统',
    image: SMART_COIN_SYSTEM_WebP,
    fallback: SMART_COIN_SYSTEM_Png,
  },
  {
    name: 'SMART HOPPER',
    desc: '智能储币器',
    image: SMART_HOPPER_WebP,
    fallback: SMART_HOPPER_Png,
  },
  {
    name: 'SPECTRAL PAYOUT',
    desc: '光谱支付系统',
    image: SPECTRAL_PAYOUT_WebP,
    fallback: SPECTRAL_PAYOUT_Png,
  },
  {
    name: 'TWIN SMART COIN SYSTEM',
    desc: '双智能硬币系统',
    image: TWIN_SMART_COIN_SYSTEM_WebP,
    fallback: TWIN_SMART_COIN_SYSTEM_Png,
  },
]);

// 滚动聚拢/发散效果（参考QQ首页实现）
const productsSectionRef = ref<HTMLElement | null>(null);
const productsSceneRef = ref<HTMLElement | null>(null);

// 存储每个卡片的初始位置（用于位置计算）
const cardInitialPositions = ref<Array<{ top: number; left: number }>>([]);

const handleScroll = () => {
  // 调试：输出滚动位置（仅在需要时启用）
  // const mainContainerEl = document.querySelector('.main') as HTMLElement;
  // const scrollTopValue = mainContainerEl ? mainContainerEl.scrollTop : (window.scrollY || document.documentElement.scrollTop);
  // console.info('🔵 handleScroll 被调用 - scrollTop:', scrollTopValue);

  // 优先使用ref，如果不存在则使用ID选择器作为后备
  const sectionElement = productsSectionRef.value || document.getElementById('products-showcase');
  const sceneElement = productsSceneRef.value || document.querySelector('#products-showcase .products-scene') as HTMLElement;

  if (!sectionElement || !sceneElement) {
    // 如果ref未初始化，静默返回，避免控制台警告
    return;
  }

  // 1. 获取 products-section 相对于视口的位置
  const sectionRect = sectionElement.getBoundingClientRect();

  // 2. 计算滚动比例：基于视口底部与section的位置关系
  // 当滚动条向下滚动，视口底部进入section时，ratio从0增加到1（离散到聚拢）
  // 当滚动条向上滚动，视口底部离开section时，ratio从1回到0（聚拢到离散）
  const windowHeight = window.innerHeight;
  const viewportBottom = windowHeight; // 视口底部位置（相对于视口顶部）

  // section的顶部和底部位置（相对于视口）
  const sectionTop = sectionRect.top;
  const sectionBottom = sectionRect.top + sectionRect.height;

  // 计算ratio：
  // - 当视口底部 < section顶部时，ratio = 0（完全离散）
  // - 当视口底部在section内部时，ratio = (视口底部 - section顶部) / section高度（0到1）
  // - 当视口底部 > section底部时，ratio = 1（完全聚拢）
  let ratio = 0;

  if (viewportBottom < sectionTop) {
    // 视口底部还未进入section，完全离散
    ratio = 0;
  } else if (viewportBottom >= sectionTop && viewportBottom <= sectionBottom) {
    // 视口底部在section内部，根据进度计算ratio
    ratio = (viewportBottom - sectionTop) / sectionRect.height;
  } else {
    // 视口底部已完全离开section，完全聚拢
    ratio = 1;
  }

  // 确保ratio在0-1范围内
  ratio = Math.max(0, Math.min(1, ratio));

  // 调试：输出 ratio 值（仅在需要时启用）
  // console.info('滚动比例 ratio:', ratio.toFixed(3), 'viewportBottom:', viewportBottom.toFixed(0), 'sectionTop:', sectionTop.toFixed(0), 'sectionBottom:', sectionBottom.toFixed(0));

  // 3. 获取所有卡片
  const cards = sceneElement.querySelectorAll('.sub-scene');

  if (cards.length === 0 || cardInitialPositions.value.length === 0) {
    return;
  }

  // 4. 遍历每个卡片，根据 ratio 调整样式
  cards.forEach((card, index) => {
    const cardElement = card as HTMLElement;

    // 获取卡片的初始位置
    const initialPos = cardInitialPositions.value[index];
    if (!initialPos) return;

    // 获取 animation-delay，转成数字（用于错落效果）
    const delayStr = cardElement.style.animationDelay || getComputedStyle(cardElement).animationDelay;
    const delay = parseFloat(delayStr) || 0;

    // 延迟系数：让不同卡片的聚拢速度略有差异
    const delayFactor = 1 + delay * 0.1;

    // 5. 根据 ratio 计算效果参数（反转逻辑：初始紧密，滚动后分散）
    // 缩放：从 1.0（初始紧密）到 1.2（滚动后放大）
    const scale = 1.0 + ratio * 0.2 * delayFactor;

    // 透明度：从 1.0（初始清晰）到 1.0（保持清晰）
    const opacity = 1.0; // 保持完全不透明

    // 位置扩展：从初始紧密位置向四周扩展（ratio越大，扩展越多）
    // 但需要确保不超出容器边界
    if (!sceneElement) return;

    const sceneWidth = sceneElement.offsetWidth;
    const sceneHeight = sceneElement.offsetHeight;

    // 根据屏幕宽度动态调整卡片大小和列数
    const isMobile = window.innerWidth <= 480;
    const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;
    const cardWidth = isMobile ? 140 : isTablet ? 160 : 200; // 卡片宽度
    const cardHeight = isMobile ? 200 : isTablet ? 240 : 280; // 卡片高度
    const totalCols = isMobile ? 2 : isTablet ? 3 : 5;

    // 最终间距：30px（分散状态）
    const finalGap = 30;

    // 计算最终状态下的总宽度（间距10px）
    const finalTotalWidth = totalCols * cardWidth + (totalCols - 1) * finalGap;

    // 计算最终状态下的起始位置（居中显示）
    const finalStartLeft = (sceneWidth - finalTotalWidth) / 2;

    // 获取当前卡片的列号
    const cardCol = index % totalCols;

    // 计算初始和最终位置
    const initialLeft = initialPos.left; // 初始位置（占据完整宽度）
    const finalLeft = (finalStartLeft + cardCol * (cardWidth + finalGap) + cardWidth / 2) / sceneWidth * 100;

    // 根据ratio插值计算当前位置
    let newLeft = initialLeft + ratio * (finalLeft - initialLeft);

    // 垂直方向保持初始位置（不扩展）
    let newTop = initialPos.top;

    // 边界检查：确保卡片不超出容器（考虑卡片宽度）
    const cardWidthPercent = (cardWidth / sceneWidth) * 100;
    const cardHeightPercent = (cardHeight / sceneHeight) * 100;
    const halfCardWidthPercent = cardWidthPercent / 2;
    const halfCardHeightPercent = cardHeightPercent / 2;

    // 最小边距（确保卡片不完全贴边）
    const minMargin = 10;

    // 限制在容器内（留出边距，确保卡片不完全贴边）
    newLeft = Math.max(minMargin / sceneWidth * 100 + halfCardWidthPercent,
                      Math.min(100 - minMargin / sceneWidth * 100 - halfCardWidthPercent, newLeft));
    newTop = Math.max(minMargin / sceneHeight * 100 + halfCardHeightPercent,
                     Math.min(100 - minMargin / sceneHeight * 100 - halfCardHeightPercent, newTop));

    // 6. 应用样式（使用 transform 和 opacity，触发硬件加速）
    // 使用 setProperty 确保样式被正确应用
    // 注意：initialPos 存储的是卡片中心点的百分比位置
    cardElement.style.setProperty('top', `${initialPos.top}%`);
    cardElement.style.setProperty('left', `${initialPos.left}%`);
    // 使用 translate 来调整位置，确保卡片中心点对齐，避免重叠
    const translateX = (newLeft - initialPos.left) * sceneWidth / 100;
    const translateY = (newTop - initialPos.top) * sceneHeight / 100;
    cardElement.style.setProperty('transform', `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale})`);
    cardElement.style.setProperty('opacity', opacity.toString());

    // 调试：输出第一个卡片的变化（仅在需要时启用）
    // if (index === 0) {
    //   console.info(`卡片0: ratio=${ratio.toFixed(3)}, scale=${scale.toFixed(2)}, opacity=${opacity.toFixed(2)}, top=${newTop.toFixed(1)}%, left=${newLeft.toFixed(1)}%`);
    // }
  });
};

// 节流函数：限制执行频率
function throttle(fn: () => void, delay: number = 16) {
  let lastTime = 0;
  return function () {
    const currentTime = Date.now();
    if (currentTime - lastTime >= delay) {
      fn();
      lastTime = currentTime;
    }
  };
}

let scrollHandlerRef: (() => void) | null = null;
let resizeHandlerRef: (() => void) | null = null;

onMounted(async () => {
  // 检测 WebP 支持并设置封面图
  supportsWebP.value = checkWebPSupport();
  // 根据环境和支持情况设置封面图
  if (isProduction) {
    // 生产环境：使用 CDN
    videoPoster.value = supportsWebP.value ? cdnPosterWebP : cdnPosterPng;
  } else {
    // 开发环境：使用本地导入的图片
    videoPoster.value = supportsWebP.value ? videoPosterWebP : videoPosterPng;
  }

  // 预加载首屏封面图（关键资源，优先加载）
  preloadHeroPoster();

  // 等待 DOM 渲染完成
  await nextTick();

  // 使用后备选择器，确保即使ref未初始化也能找到元素
  const sectionEl = productsSectionRef.value || document.getElementById('products-showcase');
  const sceneEl = productsSceneRef.value || document.querySelector('#products-showcase .products-scene') as HTMLElement;

  if (!sectionEl || !sceneEl) {
    // 如果元素未找到，静默返回
    return;
  }

  // 初始化：存储每个卡片的初始位置（从 DOM 中读取实际渲染的位置）
  const cards = sceneEl.querySelectorAll('.sub-scene');
  if (cards.length === 0) {
    // 如果卡片未找到，静默返回
    return;
  }

  const sceneWidth = sceneEl.offsetWidth || 1200; // 容器宽度
  const sceneHeight = sceneEl.offsetHeight || 800; // 容器高度

  // 根据屏幕宽度动态调整列数和卡片大小
  const isMobile = window.innerWidth <= 480;
  const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;
  const totalCols = isMobile ? 2 : isTablet ? 3 : 5;
  const cardWidth = isMobile ? 140 : isTablet ? 160 : 200; // 卡片宽度
  const cardHeight = isMobile ? 200 : isTablet ? 240 : 280; // 卡片高度

  // 初始状态：卡片占据完整宽度，计算最小间距
  const initialGap = Math.max(0, (sceneWidth - totalCols * cardWidth) / (totalCols - 1));

  // 计算起始位置：从左边开始，占据完整宽度
  const startLeft = 0;

  // 计算垂直起始位置（考虑标题和副标题的高度，避免遮挡）
  // 标题高度约60px，副标题高度约40px，加上间距约100px
  const titleHeight = 100; // 标题和副标题的总高度（包括间距）

  // 使用固定的垂直间距（因为滚动只涉及水平动效，垂直位置不变）
  const fixedVerticalGap = 30; // 固定垂直间距（像素）

  // 计算第一行的起始位置（从标题下方开始）
  // 注意：由于卡片使用中心点定位（translate(-50%, -50%)），startTop 应该是第一张卡片顶部的位置
  // 第一张卡片的中心点 = startTop + cardHeight / 2
  const startTop = titleHeight + cardHeight / 2; // 第一行卡片的顶部位置

  cardInitialPositions.value = Array.from(cards).map((_, index) => {
    // 计算初始位置：多排紧密排列（根据屏幕宽度动态调整列数），占据完整宽度
    const row = Math.floor(index / totalCols); // 行号
    const col = index % totalCols; // 列号

    // 计算每个卡片的位置（相对于容器，初始状态占据完整宽度）
    // 使用卡片中心点作为定位基准
    const left = startLeft + col * (cardWidth + initialGap) + cardWidth / 2;
    const leftPercent = (left / sceneWidth) * 100;

    // 计算垂直位置：第一排从 startTop 开始，每排之间使用固定间距
    // 注意：由于使用中心点定位，每排的顶部位置 = startTop + row * (cardHeight + fixedVerticalGap)
    // 中心点位置 = 顶部位置 + cardHeight / 2
    const top = startTop + row * (cardHeight + fixedVerticalGap) + cardHeight / 2;
    const topPercent = (top / sceneHeight) * 100;

    return { top: topPercent, left: leftPercent };
  });

  // 检查并调整左右间距，确保平衡
  if (cardInitialPositions.value.length > 0) {
    const firstCardLeft = cardInitialPositions.value[0]?.left || 0;
    // 找到第一行最后一列卡片（第5个，索引4）
    const firstRowLastIndex = Math.min(totalCols - 1, cardInitialPositions.value.length - 1);
    const lastCardLeft = cardInitialPositions.value[firstRowLastIndex]?.left || 0;

    if (firstCardLeft && lastCardLeft) {
      const leftMargin = firstCardLeft - (cardWidth / 2 / sceneWidth * 100);
      const rightMargin = 100 - (lastCardLeft + (cardWidth / 2 / sceneWidth * 100));

      // 如果右侧边距明显大于左侧边距，向右调整位置，让卡片更紧凑
      if (rightMargin > leftMargin + 2) {
        // 计算需要向右移动的距离，使左右间距更平衡
        const adjustPercent = (rightMargin - leftMargin) / 2;
        if (adjustPercent > 0) {
          cardInitialPositions.value = cardInitialPositions.value.map(pos => ({
            ...pos,
            left: pos.left + adjustPercent
          }));
        }
      }
    }
  }

  // 立即应用初始位置，确保卡片居中显示
  cards.forEach((card, index) => {
    const cardElement = card as HTMLElement;
    const initialPos = cardInitialPositions.value[index];
    if (initialPos) {
      cardElement.style.setProperty('top', `${initialPos.top}%`);
      cardElement.style.setProperty('left', `${initialPos.left}%`);
    }
  });

  // 调试：输出初始位置（仅在需要时启用）
  // console.info('卡片数量:', cards.length, '初始位置（百分比）:', cardInitialPositions.value);
  // console.info('容器宽度:', sceneWidth, '起始位置:', startLeft);

  // 创建滚动处理函数（使用节流优化性能）
  const scrollHandler = throttle(() => {
    requestAnimationFrame(() => {
      handleScroll();
    });
  }, 16); // 约60fps

  // 绑定滚动事件（关键：滚动发生在.main容器内，不是window）
  const mainContainer = document.querySelector('.main') as HTMLElement;
  if (mainContainer) {
    // 绑定到.main容器（实际滚动的容器）
    mainContainer.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandlerRef = scrollHandler;
  } else {
    // 如果找不到.main，回退到window
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandlerRef = scrollHandler;
  }

  // 初始计算（延迟执行，确保 DOM 完全渲染和初始位置已存储）
  setTimeout(() => {
    handleScroll();
  }, 100);

  // 监听resize事件，确保窗口大小变化时重新计算
  const handleResize = () => {
    // 窗口大小变化时，重新初始化位置
    setTimeout(() => {
      const sectionEl = productsSectionRef.value || document.getElementById('products-showcase');
      const sceneEl = productsSectionRef.value || document.querySelector('#products-showcase .products-scene') as HTMLElement;

      if (sectionEl && sceneEl) {
        const cards = sceneEl.querySelectorAll('.sub-scene');
        if (cards.length > 0) {
          const sceneWidth = sceneEl.offsetWidth || 1200;
          const sceneHeight = sceneEl.offsetHeight || 800;

          const isMobile = window.innerWidth <= 480;
          const isTablet = window.innerWidth > 480 && window.innerWidth <= 768;
          const totalCols = isMobile ? 2 : isTablet ? 3 : 5;
          const cardWidth = isMobile ? 140 : isTablet ? 160 : 200;
          const cardHeight = isMobile ? 200 : isTablet ? 240 : 280;

          const initialGap = Math.max(0, (sceneWidth - totalCols * cardWidth) / (totalCols - 1));
          const startLeft = 0;
          const titleHeight = 100;
          const fixedVerticalGap = 30;
          const startTop = titleHeight + cardHeight / 2;

          cardInitialPositions.value = Array.from(cards).map((_, index) => {
            const row = Math.floor(index / totalCols);
            const col = index % totalCols;
            const left = startLeft + col * (cardWidth + initialGap) + cardWidth / 2;
            const leftPercent = (left / sceneWidth) * 100;
            const top = startTop + row * (cardHeight + fixedVerticalGap) + cardHeight / 2;
            const topPercent = (top / sceneHeight) * 100;
            return { top: topPercent, left: leftPercent };
          });

          // 重新应用位置
          cards.forEach((card, index) => {
            const cardElement = card as HTMLElement;
            const initialPos = cardInitialPositions.value[index];
            if (initialPos) {
              cardElement.style.setProperty('top', `${initialPos.top}%`);
              cardElement.style.setProperty('left', `${initialPos.left}%`);
            }
          });
        }
      }
      handleScroll();
    }, 100);
  };

  resizeHandlerRef = handleResize;
  window.addEventListener('resize', handleResize, { passive: true });
});

onUnmounted(() => {
  // 清理事件监听器
  if (scrollHandlerRef) {
    const mainContainer = document.querySelector('.main') as HTMLElement;
    if (mainContainer) {
      mainContainer.removeEventListener('scroll', scrollHandlerRef);
    }
    window.removeEventListener('scroll', scrollHandlerRef);
  }
  if (resizeHandlerRef) {
    window.removeEventListener('resize', resizeHandlerRef);
  }
});
</script>

<style scoped lang="scss">
@use '../styles/index.scss' as *;
</style>

