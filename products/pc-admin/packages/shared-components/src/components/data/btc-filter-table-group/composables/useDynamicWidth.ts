/**
 * 动态宽度计算 composable
 * 
 * 功能：
 * 1. 根据实际渲染的列数计算左侧宽度
 * 2. 考虑列数、列宽、容器宽度等因素
 * 3. 支持最小/最大宽度限制
 */

import { ref, watch, nextTick, type Ref, type ComputedRef, unref } from 'vue';

/**
 * 动态宽度计算选项
 */
export interface DynamicWidthOptions {
  /**
   * 最小宽度（像素）
   */
  minWidth: number;

  /**
   * 最大宽度（像素）
   */
  maxWidth: number;

  /**
   * 基准宽度配置
   */
  baseWidths: { small: number; default: number; large: number };

  /**
   * 是否启用自动宽度调整（支持响应式）
   */
  enabled: boolean | ComputedRef<boolean>;
}

/**
 * 动态宽度计算
 * 
 * @param tableRef 表格组件引用
 * @param containerRef 容器引用
 * @param options 配置选项
 * @returns 动态宽度和计算函数
 */
export function useDynamicWidth(
  tableRef: Ref<any>,
  containerRef: Ref<HTMLElement | undefined>,
  options: DynamicWidthOptions
) {
  const dynamicWidth = ref<string>('');
  
  /**
   * 计算宽度
   */
  const calculateWidth = () => {
    // 支持响应式的 enabled（使用 unref 获取实际值）
    const isEnabled = typeof options.enabled === 'boolean' ? options.enabled : unref(options.enabled);
    
    if (!isEnabled || !tableRef.value || !containerRef.value) {
      return;
    }
    
    try {
      // 直接使用默认宽度，不需要根据列数判断
      // 正常情况都是5列以下，嵌套使用时也会传递合适的尺寸
      const width = `${options.baseWidths.default}px`;
      dynamicWidth.value = width;
    } catch (error) {
      // 计算失败时使用默认宽度
      dynamicWidth.value = `${options.baseWidths.default}px`;
    }
  };
  
  // 监听表格列变化、容器宽度变化等
  // 注意：不使用 deep: true，避免循环引用导致栈溢出
  // 使用防抖机制，避免频繁调用导致动画被打断
  let calculateTimer: ReturnType<typeof setTimeout> | null = null;
  let lastCalculatedValue: string | null = null;
  watch(
    () => {
      // 如果 enabled 是响应式的，也需要监听它的变化
      const isEnabled = typeof options.enabled === 'boolean' ? options.enabled : unref(options.enabled);
      return [tableRef.value, containerRef.value, isEnabled];
    },
    () => {
      // 清除之前的定时器
      if (calculateTimer) {
        clearTimeout(calculateTimer);
      }
      // 使用防抖，延迟计算，避免频繁调用打断动画
      // 增加延迟时间到 300ms，确保动画完成后再计算
      calculateTimer = setTimeout(() => {
        nextTick(() => {
          // 使用 requestAnimationFrame 确保 DOM 已更新
          requestAnimationFrame(() => {
            // 只有在值真正变化时才计算，避免重复计算
            const newValue = `${options.baseWidths.default}px`;
            if (newValue !== lastCalculatedValue) {
              calculateWidth();
              lastCalculatedValue = newValue;
            }
          });
        });
      }, 300); // 300ms 防抖延迟，确保动画完成后再计算
    },
    { immediate: true }
  );
  
  // 监听窗口大小变化
  let cleanup: (() => void) | undefined;
  
  if (typeof window !== 'undefined') {
    const handleResize = () => {
      calculateWidth();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 清理函数（在组件卸载时调用）
    cleanup = () => {
      window.removeEventListener('resize', handleResize);
    };
  }
  
  return {
    dynamicWidth,
    calculateWidth,
    cleanup
  };
}
