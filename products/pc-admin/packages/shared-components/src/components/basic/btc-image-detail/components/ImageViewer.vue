<template>
  <div class="btc-image-viewer">
    <div class="macbook">
      <div class="screen">
        <div class="resource-container img-or-video">
          <img
            :src="image.src"
            :alt="image.alt || image.title || '图片'"
            :title="image.title || '图片'"
          />
        </div>
      </div>
      <div class="base"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from '../../btc-image-container/types';

defineOptions({
  name: 'ImageViewer',
});

interface Props {
  image: ImageItem;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.btc-image-viewer {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center; // 垂直居中
  padding: 0;
  margin: 0;

  .macbook {
    position: relative;
    z-index: 1; // 确保MacBook在右侧卡片下方（卡片z-index是10）
    // 响应式宽度：使用 clamp 实现自适应，最小宽度约300px，最大宽度650px，默认使用容器宽度
    width: 100%;
    max-width: min(650px, 100%);
    margin: 0 auto;
    // 响应式 padding：使用 clamp 实现自适应
    padding: 0 clamp(20px, 7.7vw, 40px); // 为底部base预留空间
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; // 垂直居中
    overflow: hidden; // 防止base超出容器

    .screen {
      position: relative;
      width: calc(100% - clamp(4px, 1.5vw, 8px));
      // 响应式 padding
      padding: clamp(2px, 0.6vw, 3px);
      margin-top: 0;
      background: linear-gradient(180deg, 
        #e8e8e8 0%, 
        #e0e0e0 20%, 
        #d5d5d5 50%, 
        #c8c8c8 80%, 
        #bdbdbd 100%);
      // 只有顶部两个角是圆角，底部是方角，符合笔记本形状
      // 响应式圆角
      border-radius: clamp(12px, 3.1vw, 16px) clamp(12px, 3.1vw, 16px) 0 0;
      overflow: hidden;
      // 响应式阴影
      $screen-shadow-sm: clamp(1px, 0.3vw, 2px);
      $screen-shadow-md: clamp(2px, 0.5vw, 3px);
      box-shadow: 
        0 $screen-shadow-sm clamp(6px, 1.5vw, 8px) rgba(0, 0, 0, 0.15),
        0 $screen-shadow-md clamp(10px, 2.3vw, 12px) rgba(0, 0, 0, 0.1),
        inset 0 $screen-shadow-sm calc($screen-shadow-sm * 2) rgba(255, 255, 255, 0.8),
        inset 0 calc(-1 * $screen-shadow-sm) calc($screen-shadow-sm * 2) rgba(0, 0, 0, 0.1);

      // 外层银白色边框（只在左上右三边，底部没有，带圆角）
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        // 圆角必须与 .screen 完全一致，只有顶部圆角（响应式）
        border-radius: clamp(12px, 3.1vw, 16px) clamp(12px, 3.1vw, 16px) 0 0;
        pointer-events: none;
        z-index: 1;
        // 响应式边框宽度
        $border-width: clamp(2px, 0.6vw, 3px);
        // 使用多层背景绘制三边边框（顶部、左边、右边），底部不绘制
        // 通过调整背景位置，确保圆角处正确显示
        background: 
          // 顶部边框（完整宽度，带圆角）
          linear-gradient(to right, 
            rgba(255, 255, 255, 0.95) 0px,
            rgba(240, 240, 240, 0.9) 20%,
            rgba(220, 220, 220, 0.85) 50%,
            rgba(240, 240, 240, 0.9) 80%,
            rgba(255, 255, 255, 0.95) 100%) 
            top left / 100% $border-width no-repeat,
          // 左边边框（从顶部到距离底部处，考虑圆角）
          linear-gradient(to bottom,
            rgba(255, 255, 255, 0.95) 0px,
            rgba(240, 240, 240, 0.9) 20%,
            rgba(220, 220, 220, 0.85) 50%,
            rgba(200, 200, 200, 0.8) 80%,
            transparent calc(100% - #{$border-width})) 
            top left / #{$border-width} calc(100% - #{$border-width}) no-repeat,
          // 右边边框（从顶部到距离底部处，考虑圆角）
          linear-gradient(to bottom,
            rgba(255, 255, 255, 0.95) 0px,
            rgba(240, 240, 240, 0.9) 20%,
            rgba(220, 220, 220, 0.85) 50%,
            rgba(200, 200, 200, 0.8) 80%,
            transparent calc(100% - #{$border-width})) 
            top right / #{$border-width} calc(100% - #{$border-width}) no-repeat;
        // 使用 clip-path 确保圆角正确显示，不被切掉，只有顶部圆角（响应式）
        clip-path: inset(0 0 $border-width 0 round clamp(12px, 3.1vw, 16px) clamp(12px, 3.1vw, 16px) 0 0);
      }

      // 屏幕顶部高光
      &::after {
        content: '';
        position: absolute;
        top: clamp(2px, 0.6vw, 3px);
        left: clamp(2px, 0.6vw, 3px);
        right: clamp(2px, 0.6vw, 3px);
        height: clamp(1.5px, 0.4vw, 2px);
        background: linear-gradient(to right, 
          transparent 0%, 
          rgba(255, 255, 255, 0.6) 20%, 
          rgba(255, 255, 255, 0.8) 50%, 
          rgba(255, 255, 255, 0.6) 80%, 
          transparent 100%);
        z-index: 2;
        pointer-events: none;
        border-radius: clamp(11px, 2.9vw, 15px) clamp(11px, 2.9vw, 15px) 0 0;
      }

      .resource-container {
        width: 100%;
        aspect-ratio: 518.391 / 362.859;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #000;
        // 内层黑色边框（四边都有，只有顶部圆角）
        // 响应式圆角：与 .screen 的圆角协调
        $screen-padding: clamp(2px, 0.6vw, 3px);
        $screen-radius: clamp(12px, 3.1vw, 16px);
        $inner-radius: calc(#{$screen-radius} - #{$screen-padding});
        border-radius: $inner-radius $inner-radius 0 0;
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
        // 响应式边框宽度
        border: $screen-padding solid rgba(0, 0, 0, 0.95);
        box-shadow: 
          inset 0 0 40px rgba(0, 0, 0, 0.9),
          inset 0 2px 4px rgba(0, 0, 0, 0.8);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          position: relative;
          z-index: 1;
          // 图片圆角需要减去边框宽度，只有顶部圆角（响应式）
          $img-radius: calc(#{$inner-radius} - #{$screen-padding});
          border-radius: $img-radius $img-radius 0 0;
        }
      }
    }

    .base {
      width: 130%; // 左右各超出屏幕15%，总宽度为130%
      height: clamp(0.9vh, 1.2vw, 1.3vh);
      min-height: clamp(10px, 1.5vw, 12px);
      max-height: clamp(14px, 2vw, 16px);
      background: linear-gradient(to bottom,
        #c6c2c2 0%,
        #b8b4b4 10%,
        #a09c9c 25%,
        #767676 55%,
        #999999 60%,
        #666666 75%,
        #222222 90%,
        rgba(0, 0, 0, 0.1) 100%);
      // 四个角都是圆角（响应式）
      $base-radius: clamp(10px, 2.3vw, 12px);
      border-radius: $base-radius; // 四个角都是圆角
      margin: calc(-1 * clamp(2px, 0.6vw, 3px)) calc(-15%) 0; // 左右各超出15%
      position: relative;
      // 响应式阴影
      $base-shadow-sm: clamp(1px, 0.3vw, 2px);
      $base-shadow-md: clamp(2px, 0.5vw, 3px);
      $base-shadow-lg: clamp(3px, 0.8vw, 4px);
      box-shadow: 
        0 $base-shadow-sm clamp(8px, 2.3vw, 12px) rgba(0, 0, 0, 0.25),
        0 clamp(3px, 0.8vw, 4px) clamp(12px, 3.1vw, 16px) rgba(0, 0, 0, 0.15),
        inset 0 $base-shadow-sm calc($base-shadow-sm * 2) rgba(255, 255, 255, 0.4),
        inset 0 calc(-1 * $base-shadow-md) calc($base-shadow-md * 2) rgba(0, 0, 0, 0.3),
        inset 0 calc(-1 * $base-shadow-sm) calc($base-shadow-sm * 2) rgba(0, 0, 0, 0.5);

      // 两侧超出部分（完全按照示例样式）
      &::before {
        content: "";
        height: 55%;
        position: absolute;
        top: 0;
        width: inherit;
      }

      // MacBook 刘海（notch）：完全按照示例样式实现
      &::after {
        content: "";
        background-color: #2d2d2d;
        // 椭圆圆角：底部有椭圆弧度（与示例完全一致）
        border-radius: 0 0 7% 7% / 0 0 95% 95%;
        // 内阴影（与示例完全一致：使用固定的 -.5em 和 .5em）
        box-shadow: 
          inset -0.5em -0.1em 0.3em rgba(0, 0, 0, 0.2),
          inset 0.5em 0.1em 0.3em rgba(0, 0, 0, 0.2);
        // 高度50%（与示例一致）
        height: 50%;
        left: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        // 响应式宽度：参考示例的 2rem，但改为响应式以适配不同屏幕
        width: clamp(1.5rem, 4vw, 2rem);
        z-index: 2; // 保持相对base的层级，但整体MacBook的z-index是1，所以会被右侧卡片（z-index: 10）遮挡
        pointer-events: none;
      }
    }
  }

  // 响应式调整
  @media (max-width: 1150px) {
    .macbook {
      width: 100%;
      max-width: min(90vw, 518px);
      // 响应式 padding
      padding: 0 clamp(18px, 6.8vw, 35px);
    }

      .base {
        width: 130%; // 左右各超出屏幕15%，总宽度为130%
        // 响应式 margin
        $base-margin-md: clamp(2px, 0.6vw, 3px);
        margin: calc(-1 * $base-margin-md) calc(-15%) 0; // 左右各超出15%
        // 四个角都是圆角（响应式）
        $base-radius-md: clamp(8px, 1.9vw, 10px);
        border-radius: $base-radius-md; // 四个角都是圆角

        &::before {
          // 两侧超出部分，高度55%
          height: 55%;
        }

        &::after {
          // 响应式宽度：参考示例样式
          width: clamp(1.5rem, 4vw, 2rem);
          // 高度50%
          height: 50%;
        }
      }
  }

  @media (max-width: 768px) {
    .macbook {
      width: 100%;
      // 响应式 padding
      padding: 0 clamp(15px, 5.8vw, 30px);

      .screen {
        // 响应式 padding
        $screen-padding-sm: clamp(2px, 0.65vw, 2.5px);
        padding: $screen-padding-sm;
        // 只有顶部两个角是圆角，底部是方角（响应式）
        $screen-radius-sm: clamp(10px, 2.7vw, 14px);
        border-radius: $screen-radius-sm $screen-radius-sm 0 0;
        // 响应式 margin-top
        margin-top: clamp(4px, 1.3vw, 6px);
        // 响应式 width
        $screen-width-offset: clamp(4px, 1.3vw, 6px);
        width: calc(100% - #{$screen-width-offset});

        &::before {
          // 只有顶部两个角是圆角（响应式）
          border-radius: $screen-radius-sm $screen-radius-sm 0 0;
          // 响应式边框宽度
          $border-width-sm: $screen-padding-sm;
          background:
            linear-gradient(to right, 
              rgba(255, 255, 255, 0.95) 0px,
              rgba(240, 240, 240, 0.9) 50%,
              rgba(255, 255, 255, 0.95) 100%) 
              top left / 100% $border-width-sm no-repeat,
            linear-gradient(to bottom,
              rgba(255, 255, 255, 0.95) 0px,
              rgba(220, 220, 220, 0.85) 50%,
              transparent calc(100% - #{$border-width-sm})) 
              top left / #{$border-width-sm} calc(100% - #{$border-width-sm}) no-repeat,
            linear-gradient(to bottom,
              rgba(255, 255, 255, 0.95) 0px,
              rgba(220, 220, 220, 0.85) 50%,
              transparent calc(100% - #{$border-width-sm})) 
              top right / #{$border-width-sm} calc(100% - #{$border-width-sm}) no-repeat;
          // 使用 clip-path 确保圆角正确显示，不被切掉，只有顶部圆角（响应式）
          clip-path: inset(0 0 $border-width-sm 0 round $screen-radius-sm $screen-radius-sm 0 0);
        }

        &::after {
          top: $screen-padding-sm;
          left: $screen-padding-sm;
          right: $screen-padding-sm;
        }

        .resource-container {
          // 响应式圆角：与 .screen 的圆角协调
          $inner-radius-sm: calc(#{$screen-radius-sm} - #{$screen-padding-sm});
          border-radius: $inner-radius-sm $inner-radius-sm 0 0;
          border-width: $screen-padding-sm;

          img {
            // 图片圆角需要减去边框宽度，只有顶部圆角（响应式）
            $img-radius-sm: calc(#{$inner-radius-sm} - #{$screen-padding-sm});
            border-radius: $img-radius-sm $img-radius-sm 0 0;
          }
        }
      }

      .base {
        // 响应式高度
        height: clamp(0.8vh, 1vw, 0.9vh);
        min-height: clamp(8px, 1.3vw, 10px);
        max-height: clamp(10px, 1.6vw, 12px);
        // 四个角都是圆角（响应式）
        $base-radius-sm: clamp(5px, 1.3vw, 6px);
        border-radius: $base-radius-sm; // 四个角都是圆角
        width: 130%; // 左右各超出屏幕15%，总宽度为130%
        // 响应式 margin
        $base-margin-sm: clamp(2px, 0.65vw, 3px);
        margin: calc(-1 * $base-margin-sm) calc(-15%) 0; // 左右各超出15%

        &::before {
          // 两侧超出部分，高度55%
          height: 55%;
        }

        &::after {
          // 响应式宽度：参考示例样式
          width: clamp(1.2rem, 3.5vw, 1.8rem);
          // 高度50%
          height: 50%;
        }
      }
    }
  }
}
</style>
