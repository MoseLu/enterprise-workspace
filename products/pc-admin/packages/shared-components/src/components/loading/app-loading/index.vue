<template>
  <teleport to="body">
    <div
      v-show="shouldShow"
      class="btc-app-loading-mask"
      :class="{
        'btc-app-loading-mask--show': shouldShow,
        'btc-app-loading-mask--fail': isFail
      }"
    >
      <div class="btc-app-loading-container">
        <!-- 加载中状态 -->
        <div v-if="!isFail" class="btc-app-loading-content">
          <!-- 应用名称（对应根级别的 preload__name） -->
          <div class="btc-app-loading-name">{{ localTitle }}</div>
          <!-- Loading 动画 -->
          <component :is="animationComponent" />
          <!-- 标题（对应根级别的 preload__title） -->
          <div class="btc-app-loading-title">{{ localTip || '正在加载资源' }}</div>
          <!-- 副标题（对应根级别的 preload__sub-title） -->
          <div class="btc-app-loading-sub-title">部分资源可能加载时间较长，请耐心等待</div>
        </div>

        <!-- 加载失败状态 -->
        <div v-else class="btc-app-loading-fail-content">
          <svg class="btc-app-loading-fail-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
          <div class="btc-app-loading-fail-title">加载失败</div>
          <div class="btc-app-loading-fail-desc">{{ localFailDesc || `【${localTitle}】加载超时，请重试` }}</div>
          <button class="btc-app-loading-retry-btn" @click="handleRetry">重新加载</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcAppLoading',
});

import { ref, computed, watch, onUnmounted, onMounted, nextTick } from 'vue';
// 使用和根级别相同的动画组件
import CircleSpinner from '../root-loading/animations/CircleSpinner.vue';
import DotsSpinner from '../root-loading/animations/DotsSpinner.vue';
import GradientSpinner from '../root-loading/animations/GradientSpinner.vue';
import ProgressSpinner from '../root-loading/animations/ProgressSpinner.vue';
import FlowerSpinner from '../root-loading/animations/FlowerSpinner.vue';

interface Props {
  visible: boolean; // 是否显示Loading
  title: string; // 应用标题
  tip?: string; // 加载提示
  isFail: boolean; // 是否加载失败
  failDesc?: string; // 失败描述
  timeout?: number; // 加载超时时间（毫秒）
  minShowTime?: number; // 最小显示时长（毫秒）
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '加载中...',
  tip: '',
  isFail: false,
  failDesc: '',
  timeout: 10000,
  minShowTime: 500,
});

const emit = defineEmits<{
  retry: [];
  timeout: [];
}>();

// Loading 样式类型
type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';

/**
 * 动画组件映射表
 * 支持扩展：添加新的动画类型只需在此处注册即可
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
            // 验证样式是否存在组件，如果存在则返回
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
              // 验证样式是否存在组件，如果存在则返回
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
  // 默认返回 'circle'
  return 'circle';
}

// Loading 样式状态（支持偏好设置变化）
const loadingStyle = ref<LoadingStyle>(getLoadingStyle());

// 计算属性：根据当前样式获取对应的动画组件
const animationComponent = computed(() => {
  return animationComponents[loadingStyle.value] || CircleSpinner;
});

// 本地缓存 props，确保同步渲染
const localTitle = ref<string>(props.title);
const localTip = ref<string | undefined>(props.tip);
const localFailDesc = ref<string | undefined>(props.failDesc);

// 监听 props 变化，通过 nextTick 同步更新本地变量
watch(
  () => [props.title, props.tip, props.failDesc],
  async ([newTitle, newTip, newFailDesc]) => {
    await nextTick(); // 等待 DOM 异步更新完成
    localTitle.value = newTitle || props.title;
    localTip.value = newTip ?? props.tip;
    localFailDesc.value = newFailDesc ?? props.failDesc;
  },
  { immediate: true, deep: true }
);

// 控制实际显示的标志（考虑最小显示时长）
const actualVisible = ref(false);
const canHide = ref(false);
const showStartTime = ref<number | null>(null); // 记录显示开始时间
let minShowTimer: ReturnType<typeof setTimeout> | null = null;
let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

// 计算是否应该显示
const shouldShow = computed(() => {
  return actualVisible.value || props.isFail;
});

// 监听 visible 变化，实现最小显示时长（仅控制隐藏时机，不阻塞显示）
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      // 显示时：记录开始时间，立即显示内容
      showStartTime.value = Date.now();
      actualVisible.value = true;
      canHide.value = false;

      // 清除之前的定时器
      if (minShowTimer) {
        clearTimeout(minShowTimer);
        minShowTimer = null;
      }

      // 启动最小显示时长定时器（仅用于标记可以隐藏）
      minShowTimer = setTimeout(() => {
        canHide.value = true;
        // 如果已经不需要显示，则隐藏
        if (!props.visible && !props.isFail) {
          actualVisible.value = false;
        }
      }, props.minShowTime);

      // 启动超时定时器
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      if (!props.isFail) {
        timeoutTimer = setTimeout(() => {
          emit('timeout');
        }, props.timeout);
      }
    } else {
      // 隐藏时：检查是否满足最小显示时长，不满足则延迟隐藏
      const elapsedTime = showStartTime.value ? Date.now() - showStartTime.value : 0;
      if (canHide.value || elapsedTime >= props.minShowTime) {
        // 已经满足最小显示时长，立即隐藏
        actualVisible.value = false;
        if (timeoutTimer) {
          clearTimeout(timeoutTimer);
          timeoutTimer = null;
        }
      } else {
        // 不满足最小显示时长，延迟隐藏
        if (minShowTimer) {
          clearTimeout(minShowTimer);
        }
        const remainingTime = props.minShowTime - elapsedTime;
        minShowTimer = setTimeout(() => {
          canHide.value = true;
          actualVisible.value = false;
          if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
          }
        }, remainingTime);
      }
    }
  },
  { immediate: true }
);

// 监听失败状态，失败时清除超时定时器
watch(
  () => props.isFail,
  (newVal) => {
    if (newVal && timeoutTimer) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
  }
);

// 重试处理
function handleRetry() {
  emit('retry');
}

// 监听偏好设置的 loading 样式变化
const handleLoadingStyleChange = (event: Event) => {
  const customEvent = event as CustomEvent<{ style?: LoadingStyle }>;
  const newStyle = customEvent.detail?.style;
  // 验证样式是否存在组件，如果存在则更新，否则忽略
  if (newStyle && typeof newStyle === 'string' && animationComponents[newStyle]) {
    loadingStyle.value = newStyle;
  }
};

// 组件挂载时监听样式变化事件
onMounted(() => {
  // 初始化样式
  loadingStyle.value = getLoadingStyle();
  // 监听偏好设置变化事件
  window.addEventListener('loading-style-change', handleLoadingStyleChange as EventListener);

  // 关键：添加 ready 类，使容器显示（和根级别一致）
  nextTick(() => {
    const container = document.querySelector('.btc-app-loading-container');
    if (container instanceof HTMLElement) {
      container.classList.add('btc-app-loading-container--ready');
    }
  });
});

// 组件卸载时清理定时器和事件监听器
onUnmounted(() => {
  if (minShowTimer) {
    clearTimeout(minShowTimer);
  }
  if (timeoutTimer) {
    clearTimeout(timeoutTimer);
  }
  // 移除事件监听器
  window.removeEventListener('loading-style-change', handleLoadingStyleChange as EventListener);
});
</script>

<style lang="scss">
// 组件样式已移至全局样式文件 @btc/shared-components/styles/index.scss
// 此处为空，避免样式冲突
</style>

