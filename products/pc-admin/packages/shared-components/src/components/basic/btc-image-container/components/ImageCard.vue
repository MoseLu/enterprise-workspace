<template>
  <!-- 外层容器：设置 perspective，用于3D效果 -->
  <div
    class="card-container"
    @click="handleClick"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 内层卡片：应用3D变换 -->
    <div class="card" :style="cardStyle">
      <!-- 悬浮透明卡片 - 玻璃拟态效果（hover时显示） -->
      <div class="card-overlay" :class="{ 'is-visible': isHovered }">
        <!-- 前往按钮：居中 -->
        <button class="go-btn">前往 →</button>

        <!-- 底部信息栏：收藏、下载、分辨率、文件大小（水平均分） -->
        <div class="info-bar">
          <div v-if="item.favorites !== undefined" class="info-item">
            <span class="info-icon">☆</span>
            <span>{{ item.favorites }}</span>
          </div>
          <div v-if="item.downloads !== undefined" class="info-item">
            <span class="info-icon">↓</span>
            <span>{{ item.downloads }}</span>
          </div>
          <div v-if="item.resolution" class="info-item">
            <span>{{ item.resolution }}</span>
          </div>
          <div v-if="item.fileSize" class="info-item">
            <span>{{ item.fileSize }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ImageItem } from '../types';

defineOptions({
  name: 'ImageCard',
});

interface Props {
  item: ImageItem;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [item: ImageItem];
}>();

// 鼠标跟随倾斜效果的状态
const rotateX = ref(0);
const rotateY = ref(0);
const isHovered = ref(false);

// 防抖优化：使用 requestAnimationFrame 避免倾斜抖动
let rafId: number | null = null;
let pendingX = 0;
let pendingY = 0;

// 计算样式对象 - 内层卡片倾斜（包括背景图和悬浮卡片一起倾斜）
// 返回简单的样式对象，避免循环引用
// 注意：transition 在 CSS 中设置，这里只设置 transform 值
const cardStyle = computed(() => {
  // 始终返回 transform，让 transition 能够平滑过渡
  // 确保 URL 正确引用
  const imageUrl = props.item.src ? `url("${props.item.src}")` : 'none';
  return {
    transform: `rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
    backgroundImage: imageUrl,
  };
});

const handleClick = () => {
  emit('click', props.item);
};

// 鼠标移动处理函数 - 使用 requestAnimationFrame 优化，避免倾斜抖动
const handleMouseMove = (e: MouseEvent) => {
  const container = e.currentTarget as HTMLElement;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const xOffset = (mouseX / width) - 0.5;
  const yOffset = (mouseY / height) - 0.5;

  // 增强倾斜效果：增加乘数使倾斜更明显（参考样式优化）
  // 方向保持不变（和示例网站的倾斜方向匹配）
  const rotateXValue = yOffset * 18; // 从12增加到18，使倾斜更明显
  const rotateYValue = -xOffset * 18; // 从12增加到18，使倾斜更明显

  // 缓存待更新的值
  pendingX = rotateXValue;
  pendingY = rotateYValue;

  // 使用 requestAnimationFrame 节流，避免抖动
  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      rotateX.value = pendingX;
      rotateY.value = pendingY;
      rafId = null;
    });
  }
};

// 鼠标进入时显示悬浮卡片
const handleMouseEnter = () => {
  isHovered.value = true;
};

// 鼠标离开时重置
const handleMouseLeave = () => {
  // 取消待执行的动画帧
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  rotateX.value = 0;
  rotateY.value = 0;
  isHovered.value = false;
  pendingX = 0;
  pendingY = 0;
};
</script>

<style lang="scss" scoped>
// 外层容器：设置 perspective，用于3D效果
.card-container {
  width: 100%;
  aspect-ratio: 518.391 / 362.859; // 保持宽高比
  perspective: 600px; // 减小透视值使3D效果更明显（参考样式优化）
  cursor: pointer;
}

// 移动端禁用3D效果（参考样式优化）
@media screen and (max-width: 800px) {
  .card-container {
    .card {
      transform: translateZ(0) !important; // 移动端禁用3D
    }
  }
}

  // 内层卡片：应用3D变换
  .card {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.2s ease;
    border-radius: var(--btc-spacing-5);
    // 关键修改：阴影从浓改淡，匹配示例的"轻量阴影"，避免遮挡背景
    box-shadow: var(--btc-shadow-card);
    position: relative;
    background-color: var(--btc-surface-card);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;

  // 悬浮透明卡片 - 玻璃拟态效果（hover时显示，跟随卡片一起倾斜）
  // 核心：半透明实体悬浮层，跟随整体3D倾斜（既有实体感，又能透出背景）
  .card-overlay {
    // 悬浮定位：居中+尺寸略小于底层（88%）
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateZ(10px); // translateZ增强3D悬浮感
    width: 88%; // 微调为88%，更贴近示例的尺寸比例
    height: 88%; // 微调为88%，更贴近示例的尺寸比例

    // 使用更深的背景色，增强实体感（不再是浅色调）
    background-color: rgba(78, 71, 71, 0.6); // 参考 haowallpaper 样式
    // 完全移除模糊，让背景清晰可见（参考样式没有backdrop-filter）
    backdrop-filter: none; // 无模糊，背景清晰通透
    -webkit-backdrop-filter: none; // 兼容Safari浏览器
    // 移除混合模式，使用纯通透效果（参考样式没有混合模式）
    // 边框：参考样式无边框
    border: none;
    border-radius: 40px; // 参考样式：40px圆角
    overflow: hidden; // 参考样式：溢出隐藏

    // 关键：继承3D空间，跟随父级倾斜（必须开启 preserve-3d）
    transform-style: preserve-3d;

    // 内部内容布局：标签 → 按钮 → 底部信息栏（垂直居中排布）
    display: flex;
    flex-direction: column;
    align-items: center; // 所有内容水平居中
    justify-content: center; // 参考样式：垂直居中
    gap: 20px; // 元素间距，匹配示例图的疏密
    padding: 24px; // 内边距匹配示例图
    box-sizing: border-box; // 确保 padding 不会导致超出

    z-index: 999; // 参考样式：z-index 999
    // 默认隐藏（只控制可见性，不控制背景色透明度）
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.5s ease, transform 0.5s ease;

    // 参考样式：阴影 rgb(255, 241, 241) 0px 0px 15px 0px
    box-shadow: 0px 0px 15px 0px rgb(255, 241, 241); // 参考样式阴影

    // hover时显示
    &.is-visible {
      opacity: 1;
      pointer-events: auto;
    }

    // 标签区域：示例图的两行横向排布
    .tag-group {
      width: 100%; // 标签占满卡片宽度
      display: flex;
      flex-wrap: wrap; // 自动换行，形成两行
      gap: 8px;
      row-gap: 12px;
      justify-content: flex-start; // 左对齐，匹配示例图
    }

    // 单个标签：示例图的椭圆半透样式（浅灰调，匹配目标网站）
    .tag {
      padding: 6px 14px;
      // 标签背景色匹配悬浮卡片的浅灰调
      background-color: rgba(0, 0, 0, 0.05); // 浅灰色背景
      color: #333333; // 深色文字
      font-size: 14px;
      border-radius: 16px;
      white-space: nowrap; // 标签文字不换行
      box-shadow: none; // 标签无阴影
    }

    // 前往按钮：示例图的大圆角纯白样式（纯白实底，突出实体感）
    .go-btn {
      padding: 10px 32px;
      background-color: #000000; // 纯黑背景
      border: none; // 移除边框
      border-radius: 50px; // 参考样式：50px圆角
      font-size: 16px;
      color: #ffffff; // 白色文字
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      // 关键修改：阴影微调，更贴近示例的"轻量阴影"
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
      transition: background-color 0.2s ease, transform 0.2s ease;

      &:hover {
        background-color: #333333;
        transform: translateY(-1px); // 轻微上浮，增强交互感
      }
    }

    // 底部信息栏：示例图的水平均分样式（实体感+通透边界，匹配示例）
    .info-bar {
      // 占据完整悬浮卡片宽度，完全等于悬浮卡片宽度
      position: absolute; // 使用绝对定位，确保完全占据宽度
      left: 0; // 贴左边
      right: 0; // 贴右边
      bottom: 0; // 贴底部
      width: 100%; // 完全等于悬浮卡片宽度
      margin-top: auto; // 自动顶到卡片底部，匹配示例图
      display: flex;
      justify-content: space-between; // 水平均分，匹配示例图
      align-items: center;
      padding-top: 4px;
      border-top: 1px solid rgba(0, 0, 0, 0.06); // 浅色分割线
      font-size: 12px;
      color: rgba(0, 0, 0, 0.7); // 深色文字
      background: transparent; // 背景透明
      // 底部圆角和悬浮卡片一样（40px）
      border-radius: 0 0 40px 40px;
      padding: 4px 20px 8px;
      box-sizing: border-box; // 确保padding不会导致超出
    }

    // 单个信息项（图标+文字）
    .info-item {
      // 图标和文字垂直居中
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap; // 防止换行
    }

    // 信息项图标样式（参考图的星星/下载箭头）
    .info-icon {
      // 图标字号略大于文字，视觉更协调
      font-size: 14px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}
</style>
