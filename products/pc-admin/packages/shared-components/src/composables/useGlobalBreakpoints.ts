import { useBreakpoints, useWindowSize } from '@vueuse/core';
import { computed, watch, onMounted, getCurrentInstance } from 'vue';

/**
 * 全局响应式布局断点定义
 * - mobile: < 768px (手机端)
 * - tablet: 768px - 1024px (平板端)
 * - desktop: > 1024px (桌面端)
 */
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

/**
 * 全局响应式布局 Composables
 * 使用 VueUse 的 useBreakpoints 监听窗口尺寸变化，动态设置布局类到 document.documentElement
 * 
 * 布局类：
 * - .col-mobile: 手机端 (< 768px)
 * - .col-tablet: 平板端 (768px - 1024px)
 * - .col-desktop: 桌面端 (> 1024px)
 */
export function useGlobalBreakpoints() {
  // 获取窗口尺寸
  const { width } = useWindowSize();
  
  // 使用自定义断点定义
  const bps = useBreakpoints({
    mobile: breakpoints.mobile,
    tablet: breakpoints.tablet,
    desktop: breakpoints.desktop,
  });
  
  // 响应式的断点状态
  const isMobile = bps.smaller('tablet');
  const isTablet = bps.between('tablet', 'desktop');
  const isDesktop = bps.greaterOrEqual('desktop');

  // 当前布局类名称
  const layoutClass = computed(() => {
    if (isMobile.value) return 'col-mobile';
    if (isTablet.value) return 'col-tablet';
    return 'col-desktop';
  });

  // 设置布局类到 document.documentElement
  const setLayoutClass = () => {
    if (typeof document === 'undefined') return;
    
    const html = document.documentElement;
    const currentClass = layoutClass.value;
    
    // 移除所有布局类
    html.classList.remove('col-mobile', 'col-tablet', 'col-desktop');
    
    // 添加当前布局类
    html.classList.add(currentClass);
  };

  // 监听布局类变化
  watch(
    layoutClass,
    () => {
      setLayoutClass();
    },
    { immediate: true }
  );

  // 如果是在组件中使用，组件挂载时立即设置布局类
  // 注意：initGlobalBreakpoints 中也会立即设置，这里作为组件使用的补充
  // 检查是否在组件上下文中（通过检查 getCurrentInstance）
  const instance = getCurrentInstance();
  if (instance) {
    // 在组件上下文中，可以使用 onMounted
    onMounted(() => {
      setLayoutClass();
    });
  }
  // 如果不在组件上下文中（如 initGlobalBreakpoints），watch 的 immediate: true 已经会立即执行

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    layoutClass,
  };
}

// 全局断点实例（用于 initGlobalBreakpoints）
let globalBreakpointsInstance: ReturnType<typeof useGlobalBreakpoints> | null = null;

/**
 * 初始化全局断点监听（用于主应用）
 * 在主应用入口调用此函数，确保布局类在整个应用生命周期中正确设置
 * 
 * 注意：这个函数会创建一个全局的断点监听实例，并自动设置布局类到 document.documentElement
 * 由于使用了 VueUse 的响应式系统，布局类会在窗口尺寸变化时自动更新
 */
export function initGlobalBreakpoints() {
  // 确保在浏览器环境中执行
  if (typeof window === 'undefined') return;

  // 如果已经初始化过，直接返回
  if (globalBreakpointsInstance) return;

  // 创建响应式断点监听并自动设置布局类
  globalBreakpointsInstance = useGlobalBreakpoints();
  
  // 立即设置一次布局类（不依赖 onMounted，因为这不是在组件中调用）
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    const currentClass = globalBreakpointsInstance.layoutClass.value;
    html.classList.remove('col-mobile', 'col-tablet', 'col-desktop');
    html.classList.add(currentClass);
  }
}

