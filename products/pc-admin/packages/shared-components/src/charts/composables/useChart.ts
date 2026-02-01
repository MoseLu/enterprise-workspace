;
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { useResizeObserver } from '@vueuse/core';
import { getInstanceByDom } from 'echarts/core';
import type { EChartsOption } from 'echarts';
import type { BaseChartProps } from '../types/base';

/**
 * 核心图表 composable
 * 提供生命周期管理、resize处理、主题支持、空状态管理等
 */
// 样式辅助函数类型
type ChartStyleHelpers = {
  getAxisLabelStyle: (show?: boolean, fontSize?: number) => any;
  getAxisLineStyle: (show?: boolean) => any;
  getSplitLineStyle: (show?: boolean) => any;
  getTooltipStyle: (trigger?: 'item' | 'axis', customOptions?: any) => any;
  getLegendStyle: (position?: 'bottom' | 'top' | 'left' | 'right', customOptions?: any) => any;
  getTitleStyle: (customOptions?: any) => any;
};

// 创建一个响应式的 isDark，直接检测 DOM 中的 dark 类，确保与项目主题系统同步
function createReactiveIsDark() {
  const isDark = ref(typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false);

  // 监听 DOM 变化，确保主题切换时同步更新
  if (typeof document !== 'undefined') {
    const observer = new MutationObserver(() => {
      const hasDark = document.documentElement.classList.contains('dark');
      if (isDark.value !== hasDark) {
        isDark.value = hasDark;
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 也监听主题切换事件
    const handleThemeChange = () => {
      const hasDark = document.documentElement.classList.contains('dark');
      if (isDark.value !== hasDark) {
        isDark.value = hasDark;
      }
    };
    window.addEventListener('theme-toggle', handleThemeChange);
    window.addEventListener('theme-changed', handleThemeChange);
  }

  return isDark;
}

export function useChart(
  containerRef: Ref<HTMLElement | null>,
  props: BaseChartProps,
  buildOption: (
    isDark: Ref<boolean>,
    styleHelpers?: ChartStyleHelpers
  ) => EChartsOption | Ref<EChartsOption> | (() => EChartsOption)
) {
  // 使用自定义的响应式 isDark，直接检测 DOM 中的 dark 类，确保与项目主题系统同步
  const isDark = createReactiveIsDark();
  const isEmpty = ref(false);
  const isLoading = ref(false);
  const chartInstance = ref<any>(null);
  let isDestroyed = false;

  // 样式生成器 - 统一的样式配置（参考 art-design-pro 的实现方式）
  // 坐标轴标签样式
  const getAxisLabelStyle = (show: boolean = true, fontSize: number = 13) => {
    // 使用固定的灰色值，在浅色和深色主题下都能看到（参考 art-design-pro 的 #999）
    const textColor = '#999';
    return {
      show,
      color: textColor,
      fontSize
    };
  };

  // 坐标轴线样式
  const getAxisLineStyle = (show: boolean = true) => {
    return {
      show,
      lineStyle: {
        color: isDark.value ? '#444' : '#EDEDED',
        width: 1
      }
    };
  };

  // 分割线样式
  const getSplitLineStyle = (show: boolean = true) => {
    return {
      show,
      lineStyle: {
        color: isDark.value ? '#444' : '#EDEDED',
        width: 1,
        type: 'dashed' as const
      }
    };
  };

  // 获取 tooltip 样式配置
  const getTooltipStyle = (trigger: 'item' | 'axis' = 'axis', customOptions: any = {}) => {
    // 参考 art-design-pro：深色文字在浅色背景，浅色文字在深色背景
    const textColor = isDark.value ? '#fff' : '#333';
    return {
      trigger,
      backgroundColor: isDark.value ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark.value ? '#333' : '#ddd',
      borderWidth: 1,
      textStyle: {
        color: textColor
      },
      ...customOptions
    };
  };

  // 获取图例样式配置（参考 art-design-pro 的实现）
  const getLegendStyle = (
    position: 'bottom' | 'top' | 'left' | 'right' = 'bottom',
    customOptions: any = {}
  ) => {
    // 参考 art-design-pro：深色文字在浅色背景，浅色文字在深色背景
    // 每次调用时重新获取 isDark.value，确保响应式更新
    // 深色模式（isDark=true）：白色文字 #fff；浅色模式（isDark=false）：深色文字 #333
    const textColor = isDark.value ? '#fff' : '#333';
    const textStyleConfig = {
      color: textColor
    };

    const baseConfig = {
      textStyle: textStyleConfig,
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      ...customOptions
    };

    // 根据位置设置不同的配置
    switch (position) {
      case 'bottom':
        return {
          ...baseConfig,
          bottom: 0,
          left: 'center',
          orient: 'horizontal',
          icon: 'roundRect',
          // 确保 textStyle 不被覆盖
          textStyle: textStyleConfig
        };
      case 'top':
        return {
          ...baseConfig,
          top: 0,
          left: 'center',
          orient: 'horizontal',
          icon: 'roundRect',
          // 确保 textStyle 不被覆盖
          textStyle: textStyleConfig
        };
      case 'left':
        return {
          ...baseConfig,
          left: 0,
          top: 'center',
          orient: 'vertical',
          icon: 'roundRect',
          // 确保 textStyle 不被覆盖
          textStyle: textStyleConfig
        };
      case 'right':
        return {
          ...baseConfig,
          right: 0,
          top: 'center',
          orient: 'vertical',
          icon: 'roundRect',
          // 确保 textStyle 不被覆盖
          textStyle: textStyleConfig
        };
      default:
        return {
          ...baseConfig,
          // 确保 textStyle 不被覆盖
          textStyle: textStyleConfig
        };
    }
  };

  // 获取标题样式配置
  const getTitleStyle = (customOptions: any = {}) => {
    // 标题使用深色文字在浅色背景，浅色文字在深色背景
    const textColor = isDark.value ? '#e5eaf3' : '#303133';
    return {
      textStyle: {
        color: textColor
      },
      ...customOptions
    };
  };

  // 创建样式辅助函数对象
  const styleHelpers: ChartStyleHelpers = {
    getAxisLabelStyle,
    getAxisLineStyle,
    getSplitLineStyle,
    getTooltipStyle,
    getLegendStyle,
    getTitleStyle
  };

  // 构建图表配置
  const chartOption = computed(() => {
    const option = buildOption(isDark, styleHelpers);
    if (typeof option === 'function') {
      return option();
    }
    if (option && typeof option === 'object' && 'value' in option) {
      return option.value;
    }
    return option as EChartsOption;
  });

  // 检查数据是否为空
  const checkEmpty = (data: any[] | null | undefined): boolean => {
    if (!data || data.length === 0) return true;
    // 检查数据项是否有效
    return data.every(item => {
      if (Array.isArray(item)) {
        return item.length === 0;
      }
      if (typeof item === 'object' && item !== null) {
        return Object.keys(item).length === 0;
      }
      return false;
    });
  };

  // 监听数据变化，更新空状态
  watch(() => props.data, (newData) => {
    isEmpty.value = checkEmpty(newData);
  }, { immediate: true });

  // Resize 处理
  let resizeTimer: number | null = null;
  const handleResize = () => {
    if (resizeTimer) {
      cancelAnimationFrame(resizeTimer);
    }
    resizeTimer = requestAnimationFrame(() => {
      if (chartInstance.value) {
        try {
          chartInstance.value.resize();
        } catch (error) {
          // 忽略错误
        }
      }
    });
  };

  // 使用 ResizeObserver 监听容器大小变化
  // 使用 requestAnimationFrame 避免 ResizeObserver 循环警告
  let resizeObserverFrameId: number | null = null;
  useResizeObserver(containerRef as any, () => {
    // 使用 requestAnimationFrame 延迟处理，避免 ResizeObserver 循环警告
    if (resizeObserverFrameId) {
      cancelAnimationFrame(resizeObserverFrameId);
    }
    resizeObserverFrameId = requestAnimationFrame(() => {
      resizeObserverFrameId = null;

    // 当容器尺寸变化时，检查是否可以允许渲染
    const hadSize = isContainerReady.value;
    markContainerMounted();

    // 如果容器刚获得尺寸（从无尺寸变为有尺寸），需要初始化图表实例
    if (!hadSize && isContainerReady.value && !chartInstance.value) {
      // 延迟一下，确保DOM已更新
      nextTick(() => {
        setTimeout(() => {
          updateChartInstance();
        }, 50);
      });
    }

    // 如果图表实例已存在，调用resize
    if (chartInstance.value) {
      handleResize();
    }
    });
  });

  // 监听窗口大小变化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
  }

  // 获取图表实例
  const getChartInstance = () => {
    if (containerRef.value && !chartInstance.value) {
      try {
        chartInstance.value = getInstanceByDom(containerRef.value);
      } catch (error) {
        // 忽略错误
      }
    }
    return chartInstance.value;
  };

  // 检查容器是否准备好（有尺寸）
  const isContainerReady = ref(false);

  // 检查是否在qiankun子应用环境中
  const isInQiankunSubApp = (): boolean => {
    return typeof window !== 'undefined' && !!(window as any).__POWERED_BY_QIANKUN__;
  };

  // 检查容器尺寸（使用clientWidth/clientHeight，在滚动容器内更准确）
  const checkContainerSize = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    // 使用 clientWidth 和 clientHeight，这些值在滚动容器内更可靠
    // 即使元素不在视口内，只要它有布局尺寸，clientWidth/clientHeight 就是正确的
    const width = el.clientWidth;
    const height = el.clientHeight;
    // 需要确保容器有合理的尺寸（至少10px，避免误判）
    const hasSize = width > 10 && height > 10;
    // 仅作为"是否可安全初始化/resize"的判断，不再用尺寸来决定是否渲染 v-chart
    return hasSize;
  };

  // 检查容器是否在可滚动的父元素内
  const isInScrollableContainer = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    let parent = el.parentElement;
    const maxDepth = 30; // 增加深度，确保能找到滚动容器
    let depth = 0;

    while (parent && depth < maxDepth) {
      // 检查是否是 Element Plus 的滚动条容器（btc-container 使用 el-scrollbar）
      if (parent.classList.contains('el-scrollbar') ||
          parent.classList.contains('el-scrollbar__wrap') ||
          parent.classList.contains('btc-container')) {
        // 检查滚动容器本身是否有尺寸
        const rect = parent.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return true;
        }
      }

      // 检查是否有 overflow、overflow-y、overflow-x 属性设置为 auto 或 scroll
      try {
        const style = window.getComputedStyle(parent);
        const overflow = style.overflow || style.overflowY || style.overflowX;
        if (overflow === 'auto' || overflow === 'scroll') {
          // 检查滚动容器本身是否有尺寸
          const rect = parent.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            return true;
          }
        }
      } catch (e) {
        // 忽略样式计算错误
      }

      // 检查是否到达根元素
      if (parent === document.body || parent === document.documentElement) {
        break;
      }

      parent = parent.parentElement;
      depth++;
    }
    return false;
  };

  // 检查容器是否可见（参考 art-design-pro 的实现）
  // 使用 getBoundingClientRect 和 clientWidth/clientHeight 检查容器的实际尺寸
  const isContainerVisible = (element?: HTMLElement): boolean => {
    const el = element || containerRef.value;
    if (!el) {
      return false;
    }

    // 首先检查 props 中是否有高度/宽度设置（最可靠）
    // 如果 props 中设置了尺寸，即使容器暂时没有实际尺寸，也允许渲染
    // ECharts 会在容器获得实际尺寸后自动调整
    if (props.height && props.height !== 'auto' && props.height !== '0' && props.height !== '0px') {
      const heightValue = String(props.height).trim();
      if (heightValue && (parseFloat(heightValue) > 0 || heightValue.includes('%') || heightValue.includes('rem') || heightValue.includes('em') || heightValue.includes('vh'))) {
        return true;
      }
    }
    if (props.width && props.width !== 'auto' && props.width !== '0' && props.width !== '0px') {
      const widthValue = String(props.width).trim();
      if (widthValue && (parseFloat(widthValue) > 0 || widthValue.includes('%') || widthValue.includes('rem') || widthValue.includes('em') || widthValue.includes('vw'))) {
        return true;
      }
    }

    // 其次检查容器的内联样式（优先级最高）
    const inlineHeight = el.style.height;
    const inlineWidth = el.style.width;

    // 如果内联样式中有高度或宽度设置（不是 auto 或 0），也允许渲染
    if (inlineHeight && inlineHeight !== 'auto' && inlineHeight !== '0' && inlineHeight !== '0px' && parseFloat(inlineHeight) > 0) {
      return true;
    }
    if (inlineWidth && inlineWidth !== 'auto' && inlineWidth !== '0' && inlineWidth !== '0px' && parseFloat(inlineWidth) > 0) {
      return true;
    }

    // 再次检查容器的计算样式
    const style = window.getComputedStyle(el);
    const computedHeight = style.height;
    const computedWidth = style.width;

    // 如果计算样式中有高度或宽度设置（不是 auto 或 0），也允许渲染
    if (computedHeight && computedHeight !== 'auto' && computedHeight !== '0px' && parseFloat(computedHeight) > 0) {
      return true;
    }
    if (computedWidth && computedWidth !== 'auto' && computedWidth !== '0px' && parseFloat(computedWidth) > 0) {
      return true;
    }

    // 最后检查容器的实际尺寸（clientWidth/clientHeight）
    // 使用 clientWidth 和 clientHeight，这些值在滚动容器内更可靠
    // 即使元素不在视口内，只要它有布局尺寸，clientWidth/clientHeight 就是正确的
    const width = el.clientWidth;
    const height = el.clientHeight;

    // 检查容器是否有尺寸（width > 10 && height > 10）
    // 如果容器有尺寸，即使不在视口内也允许渲染（可能在滚动容器内）
    // ECharts 可以在容器有尺寸时正常初始化，即使容器不在视口内
    const hasSize = width > 10 && height > 10;

    if (hasSize) {
      return true;
    }

    // 容器没有尺寸，返回 false
    // updateChartInstance 会使用重试或 IntersectionObserver 处理
    return false;
  };

  // 标记容器已挂载并且有尺寸（参考 art-design-pro 的实现）
  // 关键：只有在容器真正可见且有**实际尺寸**时才允许渲染，避免ECharts以0尺寸初始化
  const markContainerMounted = (): boolean => {
    if (!containerRef.value) {
      return false;
    }
    const el = containerRef.value;
    // isConnected 在现代浏览器可用；fallback 到 document.contains
    const mounted = (el as any).isConnected === true || document.body.contains(el);

    if (!mounted) {
      return false;
    }

    // 首先检查容器的实际尺寸（clientWidth/clientHeight）
    // 这是 ECharts 初始化时真正需要的，必须大于 0
    const actualWidth = el.clientWidth;
    const actualHeight = el.clientHeight;
    const hasActualSize = actualWidth > 10 && actualHeight > 10;

    // 如果容器有实际尺寸，允许渲染
    if (hasActualSize) {
      if (!isContainerReady.value) {
        isContainerReady.value = true;
      }
      return true;
    }

    // 容器没有实际尺寸，检查是否有 props/样式设置（可能稍后会有尺寸）
    // 使用 isContainerVisible 检查容器是否有样式设置
    const hasStyleSize = isContainerVisible(el);

    if (hasStyleSize) {
      // 容器有样式设置但还没有实际尺寸，暂时不设置 isContainerReady
      // 等待 ResizeObserver 或重试机制来设置
      return false;
    }

    // 容器不可见且无尺寸，不设置isContainerReady
    // updateChartInstance会处理这种情况，使用重试或IntersectionObserver
    return false;
  };

  // 更新图表实例引用（在 v-chart 渲染后调用）
  let retryCount = 0;
  let checkIntervalId: number | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  // 在qiankun子应用环境中，需要更长的等待时间（容器挂载和渲染需要更多时间）
  const MAX_RETRY_COUNT = isInQiankunSubApp() ? 100 : 50; // 子应用：10秒，主应用：5秒

  const updateChartInstance = () => {
    if (!containerRef.value) {
      return;
    }

    // 使用 isContainerVisible 检查容器是否真正可见（参考 art-design-pro）
    // 这比只检查 clientWidth/clientHeight 更可靠
    if (!isContainerVisible(containerRef.value)) {
      retryCount++;
      if (retryCount < MAX_RETRY_COUNT) {
        // DOM 还没有尺寸，延迟重试
        // 在子应用环境中，使用稍长的延迟，给容器更多时间渲染
        const retryDelay = isInQiankunSubApp() ? 150 : 100;
        setTimeout(() => {
          updateChartInstance();
        }, retryDelay);
      } else {
        // 超过最大重试次数，如果容器在滚动容器内，使用IntersectionObserver等待进入视口
        if (isInScrollableContainer() && !intersectionObserver) {
          try {
            intersectionObserver = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting && entry.target === containerRef.value) {
                    // 容器进入视口，再次尝试更新实例
                    retryCount = 0; // 重置重试计数
                    updateChartInstance();
                    // 如果成功，取消观察
                    if (intersectionObserver && containerRef.value) {
                      intersectionObserver.unobserve(containerRef.value);
                      intersectionObserver.disconnect();
                      intersectionObserver = null;
                    }
                  }
                });
              },
              {
                root: null, // 使用视口作为根
                threshold: 0.01, // 只要1%可见就触发
              }
            );
            if (containerRef.value) {
              intersectionObserver.observe(containerRef.value);
            }
          } catch (e) {
            // IntersectionObserver不支持时忽略
          }
        } else {
          // 不在滚动容器内或已使用过IntersectionObserver，记录警告
          if (import.meta.env.DEV) {
            // 再次检查容器可见性，只有在确实可见且应该显示时才警告
            const shouldWarn = isContainerVisible();
            if (shouldWarn) {
              console.warn('[useChart] 容器尺寸检查超时，图表可能无法正常显示', {
                container: containerRef.value,
                isQiankun: isInQiankunSubApp(),
                clientWidth: containerRef.value.clientWidth,
                clientHeight: containerRef.value.clientHeight,
                rect: containerRef.value.getBoundingClientRect(),
              });
            }
          }
        }
      }
      return;
    }

    // 容器已有尺寸，重置重试计数并清理IntersectionObserver
    retryCount = 0;
    if (intersectionObserver) {
      if (containerRef.value) {
        intersectionObserver.unobserve(containerRef.value);
      }
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }

    // 在获取图表实例之前，必须检查容器的**实际尺寸**（clientWidth/clientHeight）
    // 这是 ECharts 初始化时真正需要的，不能仅依赖 props/样式
    const actualWidth = containerRef.value.clientWidth;
    const actualHeight = containerRef.value.clientHeight;
    const hasActualSize = actualWidth > 10 && actualHeight > 10;

    if (!hasActualSize) {
      // 容器没有实际尺寸，延迟重试
      retryCount++;
      if (retryCount < MAX_RETRY_COUNT) {
        const retryDelay = isInQiankunSubApp() ? 150 : 100;
        setTimeout(() => {
          updateChartInstance();
        }, retryDelay);
      } else {
        // 超过最大重试次数，等待IntersectionObserver或ResizeObserver触发
        if (import.meta.env.DEV) {
          const rect = containerRef.value.getBoundingClientRect();
          console.warn('[useChart] 容器尺寸不足，等待ResizeObserver触发', {
            width: rect.width,
            height: rect.height,
            clientWidth: actualWidth,
            clientHeight: actualHeight,
            container: containerRef.value,
          });
        }
      }
      return;
    }

    // 容器有尺寸，可以安全地获取或初始化图表实例
    try {
      chartInstance.value = getInstanceByDom(containerRef.value);
      if (chartInstance.value && containerRef.value) {
          // 容器有尺寸，可以安全地调用resize
          if (props.autoresize) {
            // 使用requestAnimationFrame确保浏览器已完成布局
            requestAnimationFrame(() => {
              if (chartInstance.value && containerRef.value) {
                // 再次检查尺寸，确保仍然有效
                const currentWidth = containerRef.value.clientWidth;
                const currentHeight = containerRef.value.clientHeight;
                if (currentWidth > 10 && currentHeight > 10) {
                  try {
                    chartInstance.value.resize();
                  } catch (error) {
                    if (import.meta.env.DEV) {
                      console.warn('[useChart] resize失败:', error);
                    }
                  }
                }
              }
            });
        }
      }
    } catch (error) {
      // 忽略错误，可能图表还未初始化
      if (import.meta.env.DEV) {
        console.warn('[useChart] 获取图表实例失败:', error);
      }
    }
  };

  // 清理 tooltip、toolbox 和 ECharts 实例
  const cleanupTooltip = () => {
    if (chartInstance.value) {
      try {
        chartInstance.value.dispatchAction({
          type: 'hideTip'
        });
      } catch (error) {
        // 忽略错误
      }
    }

    // 清理 body 中残留的 tooltip DOM
    const tooltipElements = document.querySelectorAll('.echarts-tooltip');
    tooltipElements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };

  // 清理 toolbox 相关 DOM
  const cleanupToolbox = () => {
    // 清理 body 中残留的 toolbox 相关 DOM（数据视图弹窗等）
    const toolboxElements = document.querySelectorAll('.echarts-toolbox, .echarts-data-view');
    toolboxElements.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  };

  // 销毁 ECharts 实例
  const disposeChart = () => {
    if (chartInstance.value) {
      try {
        // 销毁 ECharts 实例，这会自动清理所有相关的 DOM 元素（包括 toolbox）
        chartInstance.value.dispose();
        chartInstance.value = null;
      } catch (error) {
        // 忽略错误，可能图表已经销毁
      }
    }
  };

  // 组件卸载时清理
  onBeforeUnmount(() => {
    isDestroyed = true;
    cleanupTooltip();
    cleanupToolbox();
    disposeChart();
    if (resizeTimer) {
      cancelAnimationFrame(resizeTimer);
    }
    if (resizeObserverFrameId) {
      cancelAnimationFrame(resizeObserverFrameId);
      resizeObserverFrameId = null;
    }
    if (checkIntervalId !== null) {
      clearInterval(checkIntervalId);
      checkIntervalId = null;
    }
    if (intersectionObserver) {
      if (containerRef.value) {
        intersectionObserver.unobserve(containerRef.value);
      }
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
  });

  // 组件挂载后检查容器尺寸
  onMounted(() => {
    // 在子应用环境中，需要更长的初始延迟，等待子应用完全挂载
    const initialDelay = isInQiankunSubApp() ? 300 : 100;

    setTimeout(() => {
      // 使用多个 nextTick 确保 DOM 完全渲染
      nextTick(() => {
        nextTick(() => {
          // 先确保 v-chart 可渲染
        markContainerMounted();

        // 如果容器还没准备好，启动检查循环
        if (!isContainerReady.value) {
          const checkInterval = isInQiankunSubApp() ? 100 : 50; // 子应用环境使用更长的检查间隔
          let checkCount = 0;
          const maxCheckCount = isInQiankunSubApp() ? 100 : 50; // 最多检查次数

          checkIntervalId = window.setInterval(() => {
            checkCount++;
            // 尝试标记容器为已挂载（在子应用环境中，这会使用更宽松的条件）
            markContainerMounted();

            // 如果容器已准备好，或者达到最大检查次数
            if (isContainerReady.value || checkCount >= maxCheckCount) {
              if (checkIntervalId !== null) {
                clearInterval(checkIntervalId);
                checkIntervalId = null;
              }

              // 只有在容器真正准备好时才获取实例
              if (isContainerReady.value) {
                // 容器已准备好，延迟获取实例，确保 v-chart 已渲染
                // 在子应用环境中，使用更长的延迟
                const instanceDelay = isInQiankunSubApp() ? 300 : 100;
                setTimeout(() => {
                  updateChartInstance();
                }, instanceDelay);
              }
            }
          }, checkInterval);
        } else {
          // 容器已准备好，延迟获取实例，确保 v-chart 已渲染
          // 在子应用环境中，使用更长的延迟
          const instanceDelay = isInQiankunSubApp() ? 300 : 100;
          setTimeout(() => {
            updateChartInstance();
          }, instanceDelay);
        }
        });
      });
    }, initialDelay);
  });

  // 计算图表主题 - 使用自定义主题
  // 添加 key 确保主题变化时强制重新渲染 v-chart 组件
  const chartThemeKey = ref(0);
  const chartTheme = computed(() => {
    return isDark.value ? 'btc-dark' : 'btc-light';
  });

  // 监听主题变化，更新图表选项（参考 art-design-pro 的实现）
  watch(
    () => isDark.value,
    () => {
      // 使用 requestAnimationFrame 优化主题更新（参考 art-design-pro）
      requestAnimationFrame(() => {
        if (chartInstance.value && !isDestroyed) {
          try {
            // 获取最新的图表选项（chartOption 会自动根据 isDark.value 重新计算）
            const newOption = chartOption.value;
            // 直接更新图表选项，因为选项中已经根据 isDark.value 动态设置了颜色
            chartInstance.value.setOption(newOption, { notMerge: false });
          } catch (error) {
            if (import.meta.env.DEV) {
              console.warn('[useChart] 主题更新失败:', error);
            }
          }
        }
      });
    },
    { flush: 'post' } // 在 DOM 更新后执行
  );

  // 监听 chartOption 变化，自动更新图表（当数据变化时）
  watch(
    () => chartOption.value,
    (newOption) => {
      // 如果图表实例已存在且容器已准备好，直接更新选项
      if (chartInstance.value && isContainerReady.value && newOption) {
        try {
          chartInstance.value.setOption(newOption, { notMerge: false });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('[useChart] 更新图表选项失败:', error);
          }
        }
      }
    },
    { deep: true } // 深度监听，确保所有选项变化都能被捕获
  );

  // 安全的updateChartInstance包装，供外部调用（如handleChartReady）
  // 确保在调用时容器有尺寸，避免ECharts以0尺寸初始化
  const safeUpdateChartInstance = () => {
    if (!containerRef.value) {
      return;
    }

    // 检查容器尺寸，如果没有尺寸，延迟调用
    if (!checkContainerSize()) {
      // 延迟重试，给容器更多时间获取尺寸
      // 最多重试10次（500ms）
      let retryCount = 0;
      const maxSafeRetries = 10;
      const retrySafeUpdate = () => {
        retryCount++;
        if (retryCount < maxSafeRetries && containerRef.value && !checkContainerSize()) {
          setTimeout(retrySafeUpdate, 50);
        } else if (containerRef.value && checkContainerSize()) {
          // 容器有尺寸了，调用updateChartInstance
          updateChartInstance();
        } else {
          // 超过最大重试次数，仍然没有尺寸
          // 依赖ResizeObserver或IntersectionObserver来处理
          if (import.meta.env.DEV) {
            console.warn('[useChart] safeUpdateChartInstance: 容器尺寸不足，等待ResizeObserver');
          }
        }
      };
      setTimeout(retrySafeUpdate, 50);
      return;
    }

    // 容器有尺寸，直接调用updateChartInstance
    updateChartInstance();
  };

  return {
    isDark,
    isEmpty,
    isLoading,
    isContainerReady,
    chartOption,
    chartTheme,
    chartThemeKey,
    chartInstance,
    getChartInstance,
    updateChartInstance: safeUpdateChartInstance, // 返回安全的包装版本
    cleanupTooltip,
    setLoading: (loading: boolean) => {
      isLoading.value = loading;
    },
    // 样式函数
    getAxisLabelStyle,
    getAxisLineStyle,
    getSplitLineStyle,
    getTooltipStyle,
    getLegendStyle,
    getTitleStyle
  };
}

