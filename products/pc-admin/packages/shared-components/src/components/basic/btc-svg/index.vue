<template>
  <svg :class="svgClass" :style="mergedStyle" :aria-hidden="props.ariaHidden ? 'true' : undefined">
    <!-- 同时支持 href 和 xlink:href，确保兼容性 -->
    <use :href="iconName" :xlink:href="iconName" />
  </svg>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'btc-svg'
});

import { computed } from 'vue';
import type { PropType } from 'vue';
import type { BtcSvgAnimation, BtcSvgAnimationTrigger } from './types';

// 解析像素值
function parsePx(val: string | number | undefined): string | undefined {
  if (val === undefined) return undefined;
  return typeof val === 'number' ? `${val}px` : val;
}

const props = defineProps({
  // 图标名称（不需要 icon- 前缀）
  name: String,
  // 自定义类名
  className: String,
  // 图标颜色
  color: String,
  // 图标大小
  size: [String, Number],
  // 动画类型
  animation: {
    type: [String, Boolean] as PropType<BtcSvgAnimation>,
    default: false,
    validator: (value: any) => {
      if (value === false || value === undefined) return true;
      return ['rotate', 'spin', 'pulse', 'grow', 'bounce', 'shake', 'fade', 'flip'].includes(value);
    }
  },
  // 动画持续时间（秒），默认根据动画类型自动设置
  animationDuration: [String, Number],
  // 动画延迟（秒）
  animationDelay: [String, Number],
  // 动画触发方式：'always'（始终）、'hover'（悬浮时）
  animationTrigger: {
    type: String as PropType<BtcSvgAnimationTrigger>,
    default: 'hover'
  },
  // 是否隐藏于无障碍技术（当图标作为可交互元素的一部分时，应设置为 false）
  ariaHidden: {
    type: Boolean,
    default: true
  }
});

const style = computed(() => ({
  fontSize: parsePx(props.size),
  fill: props.color
}));

// 自动添加 icon- 前缀
const iconName = computed(() => `#icon-${props.name}`);

const svgClass = computed(() => {
  const classes = ['btc-svg', `btc-svg__${props.name}`];
  
  // 添加自定义类名
  if (props.className) {
    classes.push(String(props.className));
  }
  
  // 添加动画类
  if (props.animation && typeof props.animation === 'string') {
    classes.push(`btc-svg--animation-${props.animation}`);
    if (props.animationTrigger === 'hover') {
      classes.push('btc-svg--animation-hover');
    }
  }
  
  return classes;
});

// 计算动画样式
const animationStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (props.animation && typeof props.animation === 'string') {
    if (props.animationDuration) {
      const duration = typeof props.animationDuration === 'number' 
        ? `${props.animationDuration}s` 
        : props.animationDuration;
      style['--btc-svg-animation-duration'] = duration;
    }
    
    if (props.animationDelay) {
      const delay = typeof props.animationDelay === 'number' 
        ? `${props.animationDelay}s` 
        : props.animationDelay;
      style['--btc-svg-animation-delay'] = delay;
    }
  }
  
  return style;
});

// 合并样式
const mergedStyle = computed(() => {
  return {
    ...style.value,
    ...animationStyle.value
  };
});
</script>

<style lang="scss" scoped>
.btc-svg {
  display: inline-block;
  width: 1em;
  height: 1em;
  fill: currentColor;
  overflow: hidden;
  transform-origin: center center;
}

// ==================== 动画样式 ====================

// 旋转动画（悬浮时旋转180度）
.btc-svg--animation-rotate {
  transition: transform 0.3s ease-in-out;
  
  &.btc-svg--animation-hover {
    &:hover {
      transform: rotate(180deg);
    }
  }
  
  &:not(.btc-svg--animation-hover) {
    animation: btc-svg-rotate var(--btc-svg-animation-duration, 0.3s) ease-in-out infinite;
    animation-delay: var(--btc-svg-animation-delay, 0s);
  }
}

// 持续旋转动画（360度循环）
.btc-svg--animation-spin {
  animation: btc-svg-spin var(--btc-svg-animation-duration, 1s) linear infinite;
  animation-delay: var(--btc-svg-animation-delay, 0s);
  
  &.btc-svg--animation-hover {
    animation: none;
    
    &:hover {
      animation: btc-svg-spin var(--btc-svg-animation-duration, 1s) linear infinite;
      animation-delay: var(--btc-svg-animation-delay, 0s);
    }
  }
}

// 脉冲动画（缩放）
.btc-svg--animation-pulse {
  animation: btc-svg-pulse var(--btc-svg-animation-duration, 2s) ease-in-out infinite;
  animation-delay: var(--btc-svg-animation-delay, 0s);
  
  &.btc-svg--animation-hover {
    animation: none;
    
    &:hover {
      animation: btc-svg-pulse var(--btc-svg-animation-duration, 2s) ease-in-out infinite;
      animation-delay: var(--btc-svg-animation-delay, 0s);
    }
  }
}

// 略微变大动画（悬浮时放大）
.btc-svg--animation-grow {
  transition: transform var(--btc-svg-animation-duration, 0.3s) ease-in-out;
  
  &.btc-svg--animation-hover {
    &:hover {
      transform: scale(1.15);
    }
  }
  
  &:not(.btc-svg--animation-hover) {
    animation: btc-svg-grow var(--btc-svg-animation-duration, 0.3s) ease-in-out infinite;
    animation-delay: var(--btc-svg-animation-delay, 0s);
  }
}

// 弹跳动画
.btc-svg--animation-bounce {
  animation: btc-svg-bounce var(--btc-svg-animation-duration, 1s) ease-in-out infinite;
  animation-delay: var(--btc-svg-animation-delay, 0s);
  
  &.btc-svg--animation-hover {
    animation: none;
    
    &:hover {
      animation: btc-svg-bounce var(--btc-svg-animation-duration, 1s) ease-in-out infinite;
      animation-delay: var(--btc-svg-animation-delay, 0s);
    }
  }
}

// 摇晃动画
.btc-svg--animation-shake {
  animation: btc-svg-shake var(--btc-svg-animation-duration, 0.5s) ease-in-out infinite;
  animation-delay: var(--btc-svg-animation-delay, 0s);
  
  &.btc-svg--animation-hover {
    animation: none;
    
    &:hover {
      animation: btc-svg-shake var(--btc-svg-animation-duration, 0.5s) ease-in-out infinite;
      animation-delay: var(--btc-svg-animation-delay, 0s);
    }
  }
}

// 淡入淡出动画
.btc-svg--animation-fade {
  animation: btc-svg-fade var(--btc-svg-animation-duration, 2s) ease-in-out infinite;
  animation-delay: var(--btc-svg-animation-delay, 0s);
  
  &.btc-svg--animation-hover {
    animation: none;
    
    &:hover {
      animation: btc-svg-fade var(--btc-svg-animation-duration, 2s) ease-in-out infinite;
      animation-delay: var(--btc-svg-animation-delay, 0s);
    }
  }
}

// 翻转动画
.btc-svg--animation-flip {
  animation: btc-svg-flip var(--btc-svg-animation-duration, 0.6s) ease-in-out infinite;
  animation-delay: var(--btc-svg-animation-delay, 0s);
  
  &.btc-svg--animation-hover {
    animation: none;
    
    &:hover {
      animation: btc-svg-flip var(--btc-svg-animation-duration, 0.6s) ease-in-out infinite;
      animation-delay: var(--btc-svg-animation-delay, 0s);
    }
  }
}

// ==================== 关键帧动画 ====================

@keyframes btc-svg-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
}

@keyframes btc-svg-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes btc-svg-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes btc-svg-grow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

@keyframes btc-svg-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20%);
  }
}

@keyframes btc-svg-shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10%);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10%);
  }
}

@keyframes btc-svg-fade {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes btc-svg-flip {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
</style>

