/**
 * 清理 Element Plus 相关样式资源和引擎实例
 */

/**
 * 清理 Element Plus 相关样式资源和引擎实例
 * @param appId 应用 ID（可选，用于清理特定应用的样式）
 */
export const cleanupElementPlus = (appId?: string): void => {
  if (typeof document === 'undefined') {
    return;
  }

  try {
    // 1. 清理 Element Plus 全局样式标签（通过自定义标识精准匹配，避免误删其他样式）
    const elementPlusStyleSelectors = [
      'link[href*="element-plus/dist/index.css"]',
      'link[href*="element-plus/theme-chalk"]',
      'style[data-vue-component-id*="element-plus"]',
    ];

    // 如果指定了 appId，只清理该应用的样式
    if (appId) {
      elementPlusStyleSelectors.push(`style[data-app="${appId}"]`);
      elementPlusStyleSelectors.push(`link[data-app="${appId}"]`);
    }

    elementPlusStyleSelectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          try {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          } catch (error) {
            // 忽略清理错误
          }
        });
      } catch (error) {
        // 忽略选择器错误
      }
    });

    // 2. 清理 document.styleSheets 中的 Element Plus 样式表
    try {
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((styleSheet) => {
        try {
          const href = styleSheet.href || '';
          if (href.includes('element-plus')) {
            // 移除样式表关联的节点
            const ownerNode = (styleSheet as any).ownerNode;
            if (ownerNode && ownerNode.parentNode) {
              ownerNode.parentNode.removeChild(ownerNode);
            }
          }
        } catch (e) {
          // 跨域样式表无法访问，忽略
        }
      });
    } catch (error) {
      // 忽略样式表访问错误
    }

    // 3. 清理 Element Plus 全局实例和样式引擎（仅在完全卸载时调用）
    if (!appId) {
      const globalConfig = (window as any).ELEMENT;
      if (globalConfig) {
        // 销毁样式引擎实例（Element Plus 内部关联 StylePropertyMap/StyleSheetCollection）
        if (globalConfig.styleEngine && typeof globalConfig.styleEngine.destroy === 'function') {
          try {
            globalConfig.styleEngine.destroy();
          } catch (error) {
            // 忽略销毁错误
          }
        }
        // 清空全局配置
        delete (window as any).ELEMENT;
      }
    }

    // 4. 清理残留 DOMTimer（避免定时器内存泄漏）
    const timers = (window as any)._elementPlusTimers || [];
    timers.forEach((timer: number) => {
      try {
        clearTimeout(timer);
        clearInterval(timer);
      } catch (error) {
        // 忽略清理错误
      }
    });
    (window as any)._elementPlusTimers = [];
  } catch (error) {
    // 静默失败，避免影响应用卸载流程
    if (import.meta.env.DEV) {
      console.warn('[cleanupElementPlus] 清理 Element Plus 资源时出错:', error);
    }
  }
};
