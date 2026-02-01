<template>
  <div class="preload__container" :class="{ 'preload__container--ready': isReady }">
    <div class="preload__name">{{ appName }}</div>
    <component :is="animationComponent" />
    <div class="preload__title">{{ localTitle }}</div>
    <div class="preload__sub-title">{{ localSubTitle }}</div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcRootLoading',
});

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import CircleSpinner from './animations/CircleSpinner.vue';
import DotsSpinner from './animations/DotsSpinner.vue';
import GradientSpinner from './animations/GradientSpinner.vue';
import ProgressSpinner from './animations/ProgressSpinner.vue';
import FlowerSpinner from './animations/FlowerSpinner.vue';

interface Props {
  appName?: string;
  title?: string;
  subTitle?: string;
  initialLoadingStyle?: 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';
}

const props = withDefaults(defineProps<Props>(), {
  appName: '拜里斯科技',
  title: '正在加载资源',
  subTitle: '部分资源可能加载时间较长，请耐心等待',
  initialLoadingStyle: undefined,
});

// Loading 样式类型
type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';

/**
 * 动画组件映射表
 */
const animationComponents: Record<LoadingStyle, any> = {
  circle: CircleSpinner,
  dots: DotsSpinner,
  gradient: GradientSpinner,
  progress: ProgressSpinner,
  flower: FlowerSpinner,
};

/**
 * 获取当前的 Loading 样式（从偏好设置读取）
 */
function getLoadingStyle(): LoadingStyle {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'circle';
    }

    // 尝试读取 storage 中的 settings
    // 使用条件检查避免 require 在构建时出错
    try {
      // 在浏览器环境中，尝试从 localStorage 读取
      if (typeof localStorage !== 'undefined') {
        const storedSettings = localStorage.getItem('btc_settings');
        if (storedSettings) {
          try {
            const settings = JSON.parse(storedSettings);
            const style = settings?.loadingStyle;
            if (style && typeof style === 'string' && animationComponents[style as LoadingStyle]) {
              return style as LoadingStyle;
            }
          } catch (e) {
            // 解析失败，继续
          }
        }
      }
      
      // 尝试使用动态导入（仅在运行时）
      try {
        // @ts-ignore - 避免构建时类型检查
        const storageModule = typeof require !== 'undefined' ? require('@btc/shared-core/utils/storage') : null;
        if (storageModule?.storage) {
          const settings: Record<string, any> | null = storageModule.storage.get('settings');
          if (settings) {
            const style = settings.loadingStyle;
            if (style && typeof style === 'string' && animationComponents[style as LoadingStyle]) {
              return style as LoadingStyle;
            }
          }
        }
      } catch (e) {
        // 如果无法加载 storage，跳过
      }

      // 如果 storage 中没有，尝试从 Cookie 读取
      try {
        const cookieSettings = document.cookie
          .split('; ')
          .find(row => row.startsWith('btc_settings='));
        if (cookieSettings) {
          const cookieParts = cookieSettings.split('=');
          if (cookieParts.length >= 2) {
            const cookieValue = decodeURIComponent(cookieParts[1] || '');
            if (cookieValue) {
              const settings = JSON.parse(cookieValue);
              const style = settings.loadingStyle;
              if (style && typeof style === 'string' && animationComponents[style as LoadingStyle]) {
                return style as LoadingStyle;
              }
            }
          }
        }
      } catch (cookieError) {
        // 忽略 Cookie 读取错误
      }
    } catch (e) {
      // 忽略解析错误
    }
  } catch (e) {
    // 忽略异常
  }
  return 'circle';
}

// 核心：使用内部 ref 管理状态（替代只读 props）
const localTitle = ref(props.title);
const localSubTitle = ref(props.subTitle);
const loadingStyle = ref<LoadingStyle>(props.initialLoadingStyle || getLoadingStyle());

// 监听 props 变化，同步到内部状态（初始化时）
watch(
  () => props.title,
  (newTitle) => {
    if (newTitle !== undefined) {
      localTitle.value = newTitle;
    }
  },
  { immediate: true }
);

watch(
  () => props.subTitle,
  (newSubTitle) => {
    if (newSubTitle !== undefined) {
      localSubTitle.value = newSubTitle;
    }
  },
  { immediate: true }
);

watch(
  () => props.initialLoadingStyle,
  (newStyle) => {
    if (newStyle && animationComponents[newStyle]) {
      loadingStyle.value = newStyle;
    }
  },
  { immediate: true }
);

// 计算属性：根据当前样式获取对应的动画组件
const animationComponent = computed(() => {
  return animationComponents[loadingStyle.value] || CircleSpinner;
});

// 控制容器显示状态，确保文本和动画同步出现
const isReady = ref(false);

// 监听偏好设置的 loading 样式变化
const handleLoadingStyleChange = (event: Event) => {
  const customEvent = event as CustomEvent<{ style?: LoadingStyle }>;
  const newStyle = customEvent.detail?.style;
  if (newStyle && typeof newStyle === 'string' && animationComponents[newStyle]) {
    loadingStyle.value = newStyle;
  }
};

// 核心：暴露更新方法给父实例调用
const updateTitle = (newTitle: string) => {
  localTitle.value = newTitle;
};

const updateSubTitle = (newSubTitle: string) => {
  localSubTitle.value = newSubTitle;
};

const updateLoadingStyle = (newStyle: LoadingStyle) => {
  if (animationComponents[newStyle]) {
    loadingStyle.value = newStyle;
  }
};

// 暴露方法到组件实例
defineExpose({
  updateTitle,
  updateSubTitle,
  updateLoadingStyle,
});

onMounted(() => {
  // 初始化样式（如果 props 中没有传入）
  if (!props.initialLoadingStyle) {
    loadingStyle.value = getLoadingStyle();
  }
  // 监听偏好设置变化事件
  window.addEventListener('loading-style-change', handleLoadingStyleChange as EventListener);
  
  // 关键修复：立即显示，而不是延迟
  // 使用 nextTick 确保 DOM 已更新，然后立即显示，避免从 fallback DOM 切换时的闪烁
  nextTick(() => {
    isReady.value = true;
  });
});

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('loading-style-change', handleLoadingStyleChange as EventListener);
});
</script>

<style lang="scss">
// 样式已移至全局样式文件 @btc/shared-components/public/assets/layout/loading.css
// 此处为空，避免样式冲突
</style>

