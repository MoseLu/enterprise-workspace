/**
 * 全局 resize 事件管理
 * 对齐 cool-admin 的事件系统
 */
import { globalMitt } from './mitt';

// 初始化全局 resize 监听
if (typeof window !== 'undefined') {
  let resizeTimer: ReturnType<typeof setTimeout> | null = null;

  const handleResize = () => {
    // 防抖处理
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(() => {
      // 触发全局 mitt 事件
      globalMitt.emit('resize');
    }, 100);
  };

  window.addEventListener('resize', handleResize, { passive: true });
}
