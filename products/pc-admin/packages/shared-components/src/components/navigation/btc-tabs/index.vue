<template>
  <div class="btc-tabs" :class="{ 'btc-tabs--vertical': props.type === 'vertical' }" :style="{ width: '100%', height: '100%' }">
    <!-- 标题tab区域 -->
    <div class="btc-tabs__header">
      <div class="btc-tabs__nav" ref="navRef">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.name || index"
          class="btc-tabs__item"
          :class="{ 'is-active': activeTab === (tab.name || index) }"
          @click="setActiveTab(tab.name || index)"
          :ref="(el) => setItemRef(el, index)"
        >
          <span class="btc-tabs__label">{{ tab.label }}</span>
        </div>
        <!-- 下划线指示器 -->
        <div
          class="btc-tabs__ink"
          :class="{ 'btc-tabs__ink--vertical': props.type === 'vertical' }"
          :style="props.type === 'vertical' ? undefined : inkStyle"
          ref="inkRef"
        ></div>
      </div>
      <!-- 左右箭头按钮（仅在溢出时显示） -->
      <div
        v-if="showArrows"
        class="btc-tabs__arrows"
      >
        <button
          class="btc-tabs__arrow btc-tabs__arrow--left"
          :class="{ 'is-disabled': !showLeftArrow }"
          @click="scrollTabs('left')"
        >
          <BtcSvg name="arrow-left" :size="16" />
        </button>
        <button
          class="btc-tabs__arrow btc-tabs__arrow--right"
          :class="{ 'is-disabled': !showRightArrow }"
          @click="scrollTabs('right')"
        >
          <BtcSvg name="arrow-right" :size="16" />
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="btc-tabs__content">
      <slot name="content" :activeTab="activeTab" :tabs="tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="tab.name || index"
          class="btc-tabs__panel"
          :class="{ 'is-active': activeTab === (tab.name || index) }"
        >
          <slot
            :name="tab.name || `tab-${index}`"
            :tab="tab"
            :index="index"
          >
            {{ tab.content }}
          </slot>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, watchEffect, nextTick, type ComponentPublicInstance } from 'vue';
import BtcSvg from '../../basic/btc-svg/index.vue';


export interface BtcTab {
  name?: string | number;
  label: string;
  content?: any;
  disabled?: boolean;
}

const props = withDefaults(defineProps<{
  modelValue?: string | number;
  tabs: BtcTab[];
  defaultTab?: string | number;
  /** 布局类型：horizontal（水平，默认）或 vertical（垂直） */
  type?: 'horizontal' | 'vertical';
}>(), {
  tabs: () => [],
  type: 'horizontal'
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'tab-change': [tab: BtcTab, index: number];
}>();

// 当前激活的tab
const activeTab = ref<string | number>('');

// DOM引用
const navRef = ref<HTMLElement>();
const inkRef = ref<HTMLElement>();
const itemRefs = ref<HTMLElement[]>([]);

// 箭头显示控制
const showArrows = ref(false);
const showLeftArrow = ref(false);
const showRightArrow = ref(false);

// ResizeObserver 用于监听容器尺寸变化
let resizeObserver: ResizeObserver | null = null;
// MutationObserver 用于监听 DOM 变化，确保下划线在元素出现时立即更新
let mutationObserver: MutationObserver | null = null;
// ResizeObserver 用于监听 tab 元素尺寸变化，确保在元素有宽度时更新下划线
let tabResizeObserver: ResizeObserver | null = null;

// 下划线样式（水平布局使用）
const inkStyle = ref({
  left: '0px',
  width: '0px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
});

// 记录上一次的下划线位置和宽度，用于水平布局动画
let previousInkLeft = 0;
let previousInkWidth = 0;
let previousInkCenter = 0;

// 记录上一次的下划线位置和高度，用于垂直布局动画
let previousInkTop = 0;
let previousInkHeight = 0;
let previousInkCenterVertical = 0;

// 标记下划线是否已经初始化
let inkInitialized = false;

// 防抖定时器，避免频繁更新
let updateTimer: number | null = null;

// 设置item引用
const setItemRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (el && 'tagName' in el) {
    itemRefs.value[index] = el as HTMLElement;
  }
};

// 初始化activeTab
const initActiveTab = () => {
  if (props.modelValue !== undefined) {
    activeTab.value = props.modelValue;
  } else   if (props.defaultTab !== undefined) {
    activeTab.value = props.defaultTab;
  } else if (props.tabs.length > 0) {
    const firstTab = props.tabs[0];
    if (firstTab) {
      activeTab.value = firstTab.name || 0;
    }
  }
};

// 设置激活的tab
const setActiveTab = async (tabName: string | number) => {
  if (activeTab.value === tabName) return;

  const tabIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === tabName);
  const tab = props.tabs[tabIndex];

  if (tab?.disabled || !tab) return;

  activeTab.value = tabName;
  emit('update:modelValue', tabName);
  emit('tab-change', tab, tabIndex);

  // 注意：下划线位置更新由 watch(activeTab) 处理，这里不需要重复调用
};

// 防抖更新下划线位置
const debouncedUpdateInkPosition = () => {
  // 清除之前的定时器
  if (updateTimer) {
    clearTimeout(updateTimer);
  }

  // 设置新的定时器，延迟执行更新
  updateTimer = window.setTimeout(() => {
    updateInkPosition();
    updateTimer = null;
  }, 16); // 约一帧的时间
};

// 更新垂直布局的下划线位置（定位在分隔线上）
const updateVerticalInkPosition = (immediate = false) => {
  try {
    if (!navRef.value || !inkRef.value || !props.tabs.length) return;

    // 找到当前激活的tab索引
    const activeIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === activeTab.value);

    if (activeIndex === -1) return;

    // 优先使用 itemRefs，如果不存在则直接从DOM查找
    let activeItem = itemRefs.value[activeIndex];
    if (!activeItem && navRef.value) {
      const tabItems = navRef.value.querySelectorAll('.btc-tabs__item');
      if (tabItems[activeIndex]) {
        activeItem = tabItems[activeIndex] as HTMLElement;
      }
    }
    
    if (!activeItem) return;

    // 计算垂直位置：使用 offsetTop 和 offsetHeight
    const targetTop = activeItem.offsetTop;
    const targetHeight = activeItem.offsetHeight;
    const targetCenter = targetTop + targetHeight / 2;

    // 如果元素高度为0，说明还没有完成布局计算，使用 ResizeObserver 监听
    if (targetHeight === 0) {
      if (typeof ResizeObserver !== 'undefined' && !tabResizeObserver) {
        tabResizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const height = entry.contentRect.height;
            if (height > 0) {
              updateVerticalInkPosition(immediate);
              if (tabResizeObserver) {
                tabResizeObserver.disconnect();
                tabResizeObserver = null;
              }
            }
          }
        });
        tabResizeObserver.observe(activeItem);
      }
      return;
    }

    const inkElement = inkRef.value;

    // 先设置下划线的固定属性（位置和宽度），避免布局抖动
    inkElement.style.left = 'auto';
    inkElement.style.right = '-1px'; // 覆盖分隔线（分隔线宽度为1px）
    inkElement.style.width = '3px'; // 宽度3px，覆盖1px的分隔线
    inkElement.style.bottom = 'auto';

    // 如果需要立即更新（无动画），直接设置
    if (immediate) {
      inkElement.style.transition = 'none';
      inkElement.style.top = `${targetTop}px`;
      inkElement.style.height = `${targetHeight}px`;
      // 更新记录
      previousInkTop = targetTop;
      previousInkHeight = targetHeight;
      previousInkCenterVertical = targetCenter;
      // 标记下划线已初始化
      if (targetHeight > 0) {
        inkInitialized = true;
      }
      return;
    }

    // 如果有上一次的位置记录，执行中心点收缩/扩展动画
    if (previousInkHeight > 0 && Math.abs(previousInkTop - targetTop) > 1) {
      // 先确保下划线在当前实际位置（如果不在的话）
      const currentTop = parseFloat(inkElement.style.top) || previousInkTop;
      const currentHeight = parseFloat(inkElement.style.height) || previousInkHeight;
      
      if (Math.abs(currentTop - previousInkTop) > 1 || Math.abs(currentHeight - previousInkHeight) > 1) {
        // 先同步到当前实际位置（无动画）
        inkElement.style.transition = 'none';
        inkElement.style.top = `${previousInkTop}px`;
        inkElement.style.height = `${previousInkHeight}px`;
        
        // 等待一帧确保位置同步
        requestAnimationFrame(() => {
          // 第一步：当前下划线从上下缩短到中心点
          inkElement.style.transition = 'height 0.15s cubic-bezier(0.4, 0, 0.2, 1), top 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
          inkElement.style.top = `${previousInkCenterVertical}px`;
          inkElement.style.height = '0px';
          
          // 第二步：等待第一步动画完成后，快速移动到新tab的中心点
          setTimeout(() => {
            inkElement.style.transition = 'top 0.08s cubic-bezier(0.4, 0, 0.2, 1)';
            inkElement.style.top = `${targetCenter}px`;
            inkElement.style.height = '0px';
            
            // 第三步：从中心点向上下扩展
            setTimeout(() => {
              inkElement.style.transition = 'height 0.15s cubic-bezier(0.4, 0, 0.2, 1), top 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
              inkElement.style.top = `${targetTop}px`;
              inkElement.style.height = `${targetHeight}px`;
              // 更新记录
              previousInkTop = targetTop;
              previousInkHeight = targetHeight;
              previousInkCenterVertical = targetCenter;
            }, 80); // 等待第二步移动完成
          }, 150); // 等待第一步收缩完成
        });
      } else {
        // 下划线已经在正确位置，直接执行收缩动画
        // 第一步：当前下划线从上下缩短到中心点
        inkElement.style.transition = 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1), top 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
        inkElement.style.top = `${previousInkCenterVertical}px`;
        inkElement.style.height = '0px';
        
        // 第二步：等待第一步动画完成后，快速移动到新tab的中心点
        setTimeout(() => {
          inkElement.style.transition = 'top 0.08s cubic-bezier(0.4, 0, 0.2, 1)';
          inkElement.style.top = `${targetCenter}px`;
          inkElement.style.height = '0px';
          
          // 第三步：从中心点向上下扩展
          setTimeout(() => {
            inkElement.style.transition = 'height 0.15s cubic-bezier(0.4, 0, 0.2, 1), top 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
            inkElement.style.top = `${targetTop}px`;
            inkElement.style.height = `${targetHeight}px`;
            // 更新记录
            previousInkTop = targetTop;
            previousInkHeight = targetHeight;
            previousInkCenterVertical = targetCenter;
          }, 80); // 等待第二步移动完成
        }, 250); // 等待第一步收缩完成
      }
    } else {
      // 第一次设置或位置没有变化，直接显示（无动画或简单动画）
      inkElement.style.transition = previousInkHeight > 0 ? 'top 0.15s cubic-bezier(0.4, 0, 0.2, 1), height 0.15s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
      inkElement.style.top = `${targetTop}px`;
      inkElement.style.height = `${targetHeight}px`;
      // 更新记录
      previousInkTop = targetTop;
      previousInkHeight = targetHeight;
      previousInkCenterVertical = targetCenter;
    }
  } catch (error) {
    console.warn('Failed to update vertical ink position:', error);
  }
};

// 更新水平布局的下划线位置
const updateInkPosition = (immediate = false) => {
  try {
    if (!navRef.value || !props.tabs.length) return;

    // 找到当前激活的tab索引
    const activeIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === activeTab.value);

    if (activeIndex === -1) return;

    // 优先使用 itemRefs，如果不存在则直接从DOM查找
    let activeItem = itemRefs.value[activeIndex];
    if (!activeItem && navRef.value) {
      // 如果 itemRefs 还没有准备好，直接从DOM中查找对应的元素
      const tabItems = navRef.value.querySelectorAll('.btc-tabs__item');
      if (tabItems[activeIndex]) {
        activeItem = tabItems[activeIndex] as HTMLElement;
      }
    }
    
    if (!activeItem) {
      // 如果仍然找不到元素，直接返回（MutationObserver 会监听 DOM 变化并自动更新）
      return;
    }

    // 使用 offsetLeft 和 offsetWidth 获取相对于父容器的位置（更准确，不受滚动影响）
    const targetLeft = activeItem.offsetLeft;
    const targetWidth = activeItem.offsetWidth;
    const targetCenter = targetLeft + targetWidth / 2;

    // 如果元素宽度为0，说明还没有完成布局计算，使用 ResizeObserver 监听
    if (targetWidth === 0) {
      // 如果还没有设置 ResizeObserver，创建一个来监听这个元素
      if (typeof ResizeObserver !== 'undefined' && !tabResizeObserver) {
        tabResizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const width = entry.contentRect.width;
            if (width > 0) {
              // 元素有宽度了，更新下划线
              updateInkPosition(immediate);
              // 更新后断开观察（只需要一次）
              if (tabResizeObserver) {
                tabResizeObserver.disconnect();
                tabResizeObserver = null;
              }
            }
          }
        });
        tabResizeObserver.observe(activeItem);
      }
      return;
    }

    // 如果需要立即更新（无动画），直接设置
    if (immediate) {
      inkStyle.value = {
        left: `${targetLeft}px`,
        width: `${targetWidth}px`,
        transition: 'none'
      };
      // 更新记录
      previousInkLeft = targetLeft;
      previousInkWidth = targetWidth;
      previousInkCenter = targetCenter;
      // 标记下划线已初始化
      if (targetWidth > 0) {
        inkInitialized = true;
      }
      return;
    }

    // 如果有上一次的位置记录，执行中心点收缩/扩展动画
    if (previousInkWidth > 0 && Math.abs(previousInkLeft - targetLeft) > 1) {
      // 先确保下划线在当前实际位置（如果不在的话）
      if (Math.abs(parseFloat(inkStyle.value.left) - previousInkLeft) > 1 || 
          Math.abs(parseFloat(inkStyle.value.width) - previousInkWidth) > 1) {
        // 先同步到当前实际位置（无动画）
        inkStyle.value = {
          left: `${previousInkLeft}px`,
          width: `${previousInkWidth}px`,
          transition: 'none'
        };
        // 等待一帧确保位置同步
        requestAnimationFrame(() => {
          // 第一步：当前下划线从两侧缩短到中心点（慢一点，让收缩过程明显）
          inkStyle.value = {
            left: `${previousInkCenter}px`,
            width: '0px',
            transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1), left 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
          };

          // 第二步：等待第一步动画完成后，快速移动到新tab的中心点
          setTimeout(() => {
            // 快速移动到新tab的中心点（宽度仍为0，移动要快）
            inkStyle.value = {
              left: `${targetCenter}px`,
              width: '0px',
              transition: 'left 0.08s cubic-bezier(0.4, 0, 0.2, 1)'
            };

            // 第三步：从中心点向两侧扩展（慢一点，让扩展过程明显）
            setTimeout(() => {
              inkStyle.value = {
                left: `${targetLeft}px`,
                width: `${targetWidth}px`,
                transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1), left 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
              };
              // 更新记录
              previousInkLeft = targetLeft;
              previousInkWidth = targetWidth;
              previousInkCenter = targetCenter;
            }, 80); // 等待第二步移动完成
          }, 150); // 等待第一步收缩完成
        });
      } else {
        // 下划线已经在正确位置，直接执行收缩动画
        // 第一步：当前下划线从两侧缩短到中心点（慢一点，让收缩过程明显）
        inkStyle.value = {
          left: `${previousInkCenter}px`,
          width: '0px',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        };

        // 第二步：等待第一步动画完成后，快速移动到新tab的中心点
        setTimeout(() => {
          // 快速移动到新tab的中心点（宽度仍为0，移动要快）
          inkStyle.value = {
            left: `${targetCenter}px`,
            width: '0px',
            transition: 'left 0.08s cubic-bezier(0.4, 0, 0.2, 1)'
          };

          // 第三步：从中心点向两侧扩展（慢一点，让扩展过程明显）
          setTimeout(() => {
            inkStyle.value = {
              left: `${targetLeft}px`,
              width: `${targetWidth}px`,
              transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1), left 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            };
            // 更新记录
            previousInkLeft = targetLeft;
            previousInkWidth = targetWidth;
            previousInkCenter = targetCenter;
          }, 150); // 等待第二步移动完成
        }, 250); // 等待第一步收缩完成
      }

      // 第二步：等待第一步动画完成后，快速移动到新tab的中心点
      setTimeout(() => {
        // 快速移动到新tab的中心点（宽度仍为0，移动要快）
        inkStyle.value = {
          left: `${targetCenter}px`,
          width: '0px',
          transition: 'left 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
        };

        // 第三步：从中心点向两侧扩展（慢一点，让扩展过程明显）
        setTimeout(() => {
          inkStyle.value = {
            left: `${targetLeft}px`,
            width: `${targetWidth}px`,
            transition: 'width 0.15s cubic-bezier(0.4, 0, 0.2, 1), left 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
          };
          // 更新记录
          previousInkLeft = targetLeft;
          previousInkWidth = targetWidth;
          previousInkCenter = targetCenter;
        }, 150); // 等待第二步移动完成
      }, 250); // 等待第一步收缩完成
    } else {
      // 第一次设置或位置没有变化，直接显示（无动画）
      inkStyle.value = {
        left: `${targetLeft}px`,
        width: `${targetWidth}px`,
        transition: previousInkWidth > 0 ? 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
      };
      // 更新记录
      previousInkLeft = targetLeft;
      previousInkWidth = targetWidth;
      previousInkCenter = targetCenter;
    }
  } catch (error) {
    console.warn('Failed to update ink position:', error);
  }
};

// 监听tabs变化
watch(() => props.tabs, () => {
  if (props.tabs.length === 0) return;
  
  initActiveTab();
  // 清空itemRefs数组，让Vue重新设置引用
  itemRefs.value = [];
  // 重置初始化标志，因为 tabs 变化了，需要重新初始化下划线
  inkInitialized = false;
  // 更新下划线位置，确保 DOM 更新完成
  requestAnimationFrame(() => {
    nextTick(() => {
      if (props.type === 'vertical') {
        updateVerticalInkPosition(true); // tabs变化时立即更新位置（无动画）
      } else {
        updateInkPosition(true); // tabs变化时立即更新位置（无动画）
      }
    });
  });
}, { immediate: true });

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== activeTab.value) {
    activeTab.value = newValue;
    // 确保下划线位置更新
    requestAnimationFrame(() => {
      nextTick(() => {
        if (props.type === 'vertical') {
          updateVerticalInkPosition(true); // 初始化时无动画
        } else {
          updateInkPosition(true); // 初始化时无动画
        }
      });
    });
  }
}, { immediate: true });

// 监听activeTab变化
watch(activeTab, () => {
  // 立即更新下划线位置（有动画）
  // 使用 requestAnimationFrame 确保 DOM 更新完成
  requestAnimationFrame(() => {
    if (props.type === 'vertical') {
      updateVerticalInkPosition(false); // 切换时有动画
    } else {
      updateInkPosition(false); // 切换时有动画
      // 水平布局需要滚动到选中的tab
      nextTick(() => {
        scrollToActiveTab();
        // 滚动后更新箭头显示状态
        setTimeout(() => {
          updateArrowVisibility();
        }, 350); // 等待滚动动画完成
      });
    }
  });
});

// 使用 watchEffect 确保在初始化时，一旦 DOM 渲染完成就立即更新下划线
watchEffect(() => {
  // 只有当 activeTab 有值、tabs 有内容、navRef 存在时才执行
  if (!activeTab.value || !props.tabs.length || !navRef.value) {
    return;
  }
  
  // 如果下划线已经初始化，不再执行
  if (inkInitialized) {
    return;
  }
  
  // 检查当前下划线宽度是否为0（表示还没有初始化）
  const currentInkWidth = parseFloat(inkStyle.value.width);
  
  if (currentInkWidth === 0) {
    // 检查对应的 tab 元素是否存在
    const activeIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === activeTab.value);
    
    if (activeIndex !== -1) {
      const tabItems = navRef.value.querySelectorAll('.btc-tabs__item');
      
      if (tabItems && tabItems[activeIndex]) {
        const activeItem = tabItems[activeIndex] as HTMLElement;
        const itemWidth = activeItem.offsetWidth;
        
        // 确保元素有宽度（表示已经渲染完成）
        if (itemWidth > 0) {
          // 使用 requestAnimationFrame 确保浏览器完成渲染
          requestAnimationFrame(() => {
            updateInkPosition(true);
          });
        }
      }
    }
  }
});

// 监听tabs变化，更新箭头显示
watch(() => props.tabs, () => {
  nextTick(() => {
    updateArrowVisibility();
  });
}, { deep: true });

// 更新箭头显示状态
const updateArrowVisibility = () => {
  if (!navRef.value) {
    showArrows.value = false;
    showLeftArrow.value = false;
    showRightArrow.value = false;
    return;
  }

  // 如果容器尺寸为0，直接返回，不进行重试
  if (navRef.value.scrollWidth === 0 || navRef.value.clientWidth === 0) {
    return;
  }

  const { scrollLeft, scrollWidth, clientWidth } = navRef.value;
  // 判断是否需要显示箭头（内容是否溢出）
  showArrows.value = scrollWidth > clientWidth;
  
  // 更新左右箭头状态
  showLeftArrow.value = scrollLeft > 0;
  showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 1; // 减1避免浮点数误差
};

// 滚动标签页（确保滚动后显示的都是完整的 tab）
const scrollTabs = (direction: 'left' | 'right') => {
  if (!navRef.value) return;

  // 如果箭头被禁用，不执行滚动
  if (direction === 'left' && !showLeftArrow.value) return;
  if (direction === 'right' && !showRightArrow.value) return;

  const container = navRef.value;
  const containerRect = container.getBoundingClientRect();
  const containerWidth = container.clientWidth;
  // 箭头区域宽度（2个箭头 + 间距 + margin-left）
  const arrowsWidth = 60; // 24px * 2 + 2px + 16px (margin-left)
  // 实际可用宽度（减去箭头区域）
  const availableWidth = containerWidth - arrowsWidth;

  // 找到当前可见区域内的所有 tab（只计算完全可见的 tab）
  const fullyVisibleTabs: { element: HTMLElement; index: number; left: number; right: number }[] = [];
  itemRefs.value.forEach((item, index) => {
    if (item) {
      const itemRect = item.getBoundingClientRect();
      // 判断 tab 是否完全在可见区域内（考虑箭头区域的间距）
      const itemLeft = itemRect.left - containerRect.left;
      const itemRight = itemRect.right - containerRect.left;
      if (itemLeft >= 0 && itemRight <= availableWidth) {
        fullyVisibleTabs.push({
          element: item,
          index,
          left: itemRect.left - containerRect.left + container.scrollLeft,
          right: itemRect.right - containerRect.left + container.scrollLeft
        });
      }
    }
  });

  let targetScroll = container.scrollLeft;

  if (direction === 'left') {
    // 向左滚动：找到当前可见区域最左侧的完整 tab，滚动到它的前一个 tab 的起始位置
    // 但要确保滚动后，从左侧开始显示的都是完整的 tab
    if (fullyVisibleTabs.length > 0) {
      const leftmostTab = fullyVisibleTabs[0];
      
      if (leftmostTab.index > 0) {
        // 从前一个 tab 开始，计算能完整显示多少个 tab（从左侧开始）
        const startIndex = leftmostTab.index - 1;
        
        // 计算从 startIndex 开始的累计宽度，找到最后一个能完整显示的 tab
        let cumulativeWidth = 0;
        let lastFullyVisibleIndex = startIndex;
        
        for (let i = startIndex; i >= 0; i--) {
          const item = itemRefs.value[i];
          if (item) {
            const itemWidth = item.offsetWidth;
            // 如果加上这个 tab 的宽度后，总宽度不超过可用宽度，说明可以完整显示
            if (cumulativeWidth + itemWidth <= availableWidth) {
              cumulativeWidth += itemWidth;
              lastFullyVisibleIndex = i;
            } else {
              // 超出可用宽度，停止
              break;
            }
          }
        }
        
        // 滚动到 startIndex 的 tab 的起始位置（从左侧开始显示）
        const startTab = itemRefs.value[startIndex];
        if (startTab) {
          // 使用 offsetLeft 获取相对于父容器的位置（更准确）
          const startTabLeft = startTab.offsetLeft;
          targetScroll = startTabLeft;
          
          // 验证：确保滚动后，从左侧开始显示的都是完整的 tab
          // 如果累计宽度超过了可用宽度，调整滚动位置
          if (cumulativeWidth > availableWidth && lastFullyVisibleIndex < startIndex) {
            // 如果超出，则滚动到最后一个能完整显示的 tab 的起始位置
            const lastTab = itemRefs.value[lastFullyVisibleIndex];
            if (lastTab) {
              targetScroll = lastTab.offsetLeft;
            }
          }
        }
      } else {
        // 已经是最左侧，滚动到开始位置
        targetScroll = 0;
      }
    } else {
      // 如果没有完全可见的 tab，找到第一个部分可见的 tab，滚动到它的起始位置
      for (let i = 0; i < itemRefs.value.length; i++) {
        const item = itemRefs.value[i];
        if (item) {
          const itemRect = item.getBoundingClientRect();
          if (itemRect.right > containerRect.left) {
            // 使用 offsetLeft 获取相对于父容器的位置
            targetScroll = item.offsetLeft;
            break;
          }
        }
      }
    }
  } else {
    // 向右滚动：找到当前可见区域最右侧的完整 tab，滚动到它的后一个 tab 的起始位置
    // 但要确保滚动后，最后一个可见的 tab 不会超出可用宽度（考虑箭头区域的间距）
    if (fullyVisibleTabs.length > 0) {
      const rightmostTab = fullyVisibleTabs[fullyVisibleTabs.length - 1];
      
      if (rightmostTab.index < itemRefs.value.length - 1) {
        // 从下一个 tab 开始，计算能完整显示多少个 tab
        const startIndex = rightmostTab.index + 1;
        
        // 计算从 startIndex 开始的累计宽度，找到最后一个能完整显示的 tab
        let cumulativeWidth = 0;
        let lastFullyVisibleIndex = startIndex;
        
        for (let i = startIndex; i < itemRefs.value.length; i++) {
          const item = itemRefs.value[i];
          if (item) {
            const itemWidth = item.offsetWidth;
            // 如果加上这个 tab 的宽度后，总宽度不超过可用宽度，说明可以完整显示
            if (cumulativeWidth + itemWidth <= availableWidth) {
              cumulativeWidth += itemWidth;
              lastFullyVisibleIndex = i;
            } else {
              // 超出可用宽度，停止
              break;
            }
          }
        }
        
        // 滚动到 startIndex 的 tab 的起始位置
        const startTab = itemRefs.value[startIndex];
        if (startTab) {
          // 使用 offsetLeft 获取相对于父容器的位置（更准确）
          const startTabLeft = startTab.offsetLeft;
          targetScroll = startTabLeft;
          
          // 验证：确保滚动后，最后一个完整可见的 tab 不会超出可用宽度
          const lastTab = itemRefs.value[lastFullyVisibleIndex];
          if (lastTab) {
            const lastTabRight = lastTab.offsetLeft + lastTab.offsetWidth;
            // 如果最后一个 tab 的右边界超出了可用宽度，调整滚动位置
            if (lastTabRight > availableWidth) {
              // 如果最后一个 tab 超出，则滚动到前一个 tab 的起始位置
              if (lastFullyVisibleIndex > startIndex) {
                const prevTab = itemRefs.value[lastFullyVisibleIndex - 1];
                if (prevTab) {
                  targetScroll = prevTab.offsetLeft;
                }
              }
            }
          }
        }
      } else {
        // 已经是最右侧，滚动到结束位置
        targetScroll = container.scrollWidth - container.clientWidth;
      }
    } else {
      // 如果没有完全可见的 tab，找到最后一个部分可见的 tab，滚动到它的下一个 tab
      for (let i = itemRefs.value.length - 1; i >= 0; i--) {
        const item = itemRefs.value[i];
        if (item) {
          const itemRect = item.getBoundingClientRect();
          if (itemRect.left < containerRect.right) {
            if (i < itemRefs.value.length - 1) {
              const nextTab = itemRefs.value[i + 1];
              if (nextTab) {
                const nextTabRect = nextTab.getBoundingClientRect();
                const nextTabLeft = nextTabRect.left - containerRect.left + container.scrollLeft;
                targetScroll = nextTabLeft;
              }
            }
            break;
          }
        }
      }
    }
  }

  // 限制滚动范围
  targetScroll = Math.max(0, Math.min(container.scrollWidth - container.clientWidth, targetScroll));

  container.scrollTo({
    left: targetScroll,
    behavior: 'smooth'
  });

  // 滚动后更新箭头显示状态
  setTimeout(() => {
    updateArrowVisibility();
  }, 300);
};

// 滚动到选中的tab
const scrollToActiveTab = () => {
  if (!navRef.value) return;

  const activeIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === activeTab.value);
  if (activeIndex === -1) return;

  const activeItem = itemRefs.value[activeIndex];
  if (!activeItem) return;

  // 使用 offsetLeft 获取相对于父容器的位置（更准确）
  const tabLeft = activeItem.offsetLeft;
  const tabWidth = activeItem.offsetWidth;
  const containerWidth = navRef.value.clientWidth;
  const containerScrollLeft = navRef.value.scrollLeft;
  
  // 箭头区域宽度
  const arrowsWidth = 60;
  const availableWidth = containerWidth - arrowsWidth;

  // 计算 tab 的右边界（相对于容器内容）
  const tabRight = tabLeft + tabWidth;

  // 如果选中的tab不在可见区域内，滚动到可见位置
  if (tabLeft < containerScrollLeft) {
    // tab在左侧，滚动到左侧
    navRef.value.scrollTo({
      left: tabLeft,
      behavior: 'smooth'
    });
  } else if (tabRight > containerScrollLeft + availableWidth) {
    // tab在右侧，滚动到右侧（确保 tab 完整显示在可用宽度内）
    navRef.value.scrollTo({
      left: tabRight - availableWidth,
      behavior: 'smooth'
    });
  }
  
  // 注意：下划线位置已经在 watch(activeTab) 中更新，这里不需要再次更新
  // 因为 offsetLeft 不受滚动影响，位置计算始终准确
};

// 初始化下划线的辅助函数
const initInkPosition = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      nextTick(() => {
        if (props.type === 'vertical') {
          // 垂直布局：检查当前下划线高度是否为0（表示还没有初始化）
          if (inkRef.value) {
            const currentInkHeight = parseFloat(inkRef.value.style.height) || 0;
            if (currentInkHeight === 0) {
              updateVerticalInkPosition(true); // 首次加载时无动画
            }
          }
        } else {
          // 水平布局：检查当前下划线宽度是否为0（表示还没有初始化）
          const currentInkWidth = parseFloat(inkStyle.value.width);
          if (currentInkWidth === 0) {
            updateInkPosition(true); // 首次加载时无动画
          }
        }
      });
    });
  });
};

// 组件挂载后初始化
onMounted(() => {
  initActiveTab();
  
  // 初始化下划线位置（无动画）
  // 使用双重 requestAnimationFrame 确保浏览器完成渲染后再更新
  initInkPosition();
  
  // 监听 window.load 事件，确保页面完全加载后也初始化下划线（参考阿里云的做法）
  if (document.readyState === 'complete') {
    // 如果页面已经加载完成，立即初始化
    initInkPosition();
  } else {
    // 否则等待 load 事件
    window.addEventListener('load', initInkPosition, { once: true });
  }
  
  // 初始化箭头显示状态
  nextTick(() => {
    updateArrowVisibility();
    
    // 监听滚动事件
    if (navRef.value) {
      navRef.value.addEventListener('scroll', updateArrowVisibility);
      
      // 监听窗口大小变化
      window.addEventListener('resize', updateArrowVisibility);
      
      // 使用 ResizeObserver 监听容器尺寸变化
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          updateArrowVisibility();
        });
        resizeObserver.observe(navRef.value);
      }
      
      // 使用 MutationObserver 监听 DOM 变化，确保下划线在元素出现时立即更新
      if (typeof MutationObserver !== 'undefined') {
        mutationObserver = new MutationObserver(() => {
          // 检查当前激活的 tab 元素是否存在
          const activeIndex = props.tabs.findIndex(tab => (tab.name || props.tabs.indexOf(tab)) === activeTab.value);
          if (activeIndex !== -1) {
            const tabItems = navRef.value?.querySelectorAll('.btc-tabs__item');
            if (tabItems && tabItems[activeIndex]) {
              // 如果元素出现了，更新下划线位置
              if (props.type === 'vertical') {
                if (inkRef.value) {
                  const currentInkHeight = parseFloat(inkRef.value.style.height) || 0;
                  if (currentInkHeight === 0) {
                    // 只有在当前下划线高度为0时才更新（避免重复更新）
                    updateVerticalInkPosition(true);
                  }
                }
              } else {
                const currentInkWidth = parseFloat(inkStyle.value.width);
                if (currentInkWidth === 0) {
                  // 只有在当前下划线宽度为0时才更新（避免重复更新）
                  updateInkPosition(true);
                }
              }
            }
          }
        });
        mutationObserver.observe(navRef.value, {
          childList: true,
          subtree: true
        });
      }
    }
  });
});

// 组件卸载时清理事件监听
onUnmounted(() => {
  if (navRef.value) {
    navRef.value.removeEventListener('scroll', updateArrowVisibility);
  }
  window.removeEventListener('resize', updateArrowVisibility);
  window.removeEventListener('load', initInkPosition);
  
  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  
  // 清理 MutationObserver
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  
  // 清理 tab ResizeObserver
  if (tabResizeObserver) {
    tabResizeObserver.disconnect();
    tabResizeObserver = null;
  }
});

// 暴露方法
defineExpose({
  setActiveTab,
  updateInkPosition: debouncedUpdateInkPosition
});
</script>

<style lang="scss" scoped>
.btc-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  &__header {
    position: relative;
    flex-shrink: 0;
    background-color: transparent;
    display: flex;
    align-items: center;
    overflow: hidden; // 隐藏溢出内容
    
    // 垂直布局样式
    .btc-tabs--vertical & {
      height: 100%;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      box-sizing: border-box;
    }
  }

  &__nav {
    position: relative;
    flex: 1;
    min-width: 0; // 允许 flex 子元素收缩
    display: flex;
    align-items: center;
    height: 40px;
    padding-left: 0;
    padding-right: 0;
    overflow-x: auto; // 启用横向滚动
    overflow-y: hidden;
    scroll-behavior: smooth; // 平滑滚动
    // 隐藏滚动条
    scrollbar-width: none; // Firefox
    -ms-overflow-style: none; // IE/Edge

    &::-webkit-scrollbar {
      display: none; // Chrome/Safari
    }
    
    // 垂直布局样式
    .btc-tabs--vertical & {
      position: relative;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      align-items: stretch;
      width: 100%;
      box-sizing: border-box;
      contain: layout; // 防止内容溢出导致布局变化
    }
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    padding: 0 16px; // tab 内部间距（左右各16px，形成卡槽效果）
    margin-right: 0;
    cursor: pointer;
    font-size: 14px;
    color: var(--el-text-color-regular);
    transition: color 0.3s ease;
    user-select: none;
    flex-shrink: 0; // 防止tab被压缩
    white-space: nowrap; // 防止文字换行

    &:hover {
      color: var(--el-color-primary);
    }

    &.is-active {
      color: var(--el-color-primary);
      font-weight: 500;
    }
    
    // 垂直布局样式
    .btc-tabs--vertical & {
      width: 100%;
      justify-content: center; // 垂直布局时选项居中
      height: 40px; // 保持和水平布局一致的高度
      position: relative; // 确保定位正确，避免布局抖动
      box-sizing: border-box;
      min-width: 0;
      max-width: 100%;
      flex-shrink: 0;
      flex-grow: 0;
      overflow: hidden; // 防止内容导致宽度变化
      transition: color 0.3s ease, background-color 0.3s ease; // 添加背景色过渡
      
      // 垂直布局的悬浮样式：使用更浅的主题色，区别于选中状态
      &:hover:not(.is-active) {
        color: var(--el-color-primary-dark-3);
      }
      
      // 垂直布局的选中样式：保持主色，并添加背景色
      &.is-active {
        color: var(--el-color-primary);
        font-weight: 500;
        background-color: var(--el-color-primary-light-9);
      }
    }
  }

  // 箭头按钮组（作为独立的卡槽，与 tab 标签保持统一间距）
  &__arrows {
    flex-shrink: 0; // 防止箭头区域被压缩
    display: flex;
    align-items: center;
    gap: 2px;
    height: 40px; // 与 btc-tabs__nav 高度一致
    padding: 0;
    margin-left: 16px; // 与最后一个 tab 保持一个卡槽的间距（16px，与 tab 的 padding 一致）
    
    // 垂直布局时隐藏箭头
    .btc-tabs--vertical & {
      display: none;
    }
  }

  &__arrow {
    pointer-events: auto; // 恢复箭头按钮的点击事件
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    margin: 0;
    border: 1px solid var(--el-border-color);
    border-radius: 2px;
    background: transparent; // 无背景
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--el-text-color-regular);

    &:hover:not(.is-disabled) {
      color: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }

    &:active:not(.is-disabled) {
      opacity: 0.7;
    }

    &.is-disabled {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
      color: var(--el-text-color-placeholder);
      border-color: var(--el-border-color-lighter);
    }
  }

  &__label {
    white-space: nowrap;
  }

  &__ink {
    position: absolute;
    bottom: 0;
    height: 2px;
    background-color: var(--el-color-primary);
    border-radius: 1px;
    z-index: 1;
    
    // 垂直布局样式
    &--vertical {
      position: absolute !important;
      left: auto !important;
      right: -1px !important; // 覆盖分隔线（分隔线宽度为1px）
      top: 0;
      bottom: auto;
      width: 3px !important; // 宽度3px，覆盖1px的分隔线
      height: 40px; // 初始高度，会被 JavaScript 动态更新
      background-color: var(--el-color-primary);
      border-radius: 1px;
      z-index: 2; // 确保在分隔线之上
      // 确保下划线不会影响布局
      pointer-events: none;
      // 确保下划线不会导致布局重新计算
      will-change: top, height;
      // 使用 transform 优化性能，避免触发重排
      transform: translateZ(0);
    }
  }

  &__content {
    flex: 1;
    overflow: hidden;
    position: relative;
  }

  &__panel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;

    &.is-active {
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
