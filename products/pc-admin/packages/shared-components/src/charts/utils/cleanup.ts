/**
 * ECharts 统一清理工具
 * 用于自动清理所有 ECharts 实例和相关的 DOM 元素
 */
import { getInstanceByDom } from 'echarts/core';

/**
 * 清理所有 ECharts 实例和相关的 DOM 元素
 * 包括 tooltip、toolbox、数据视图弹窗等
 *
 * 注意：此函数会清理所有 ECharts 实例，包括当前页面正在使用的图表
 * 通常应该在路由切换时调用，而不是在组件卸载时调用
 */
export function cleanupAllECharts() {
  // 1. 清理 body 中残留的 tooltip DOM（这些是 appendToBody 的元素）
  // 使用更全面的选择器，包括所有可能的 tooltip 类名
  const tooltipSelectors = [
    '.echarts-tooltip',
    '[class*="echarts-tooltip"]',
    '[id*="echarts-tooltip"]'
  ];

  tooltipSelectors.forEach((selector) => {
    try {
      const tooltipElements = document.querySelectorAll(selector);
      tooltipElements.forEach((el) => {
        if (el.parentNode === document.body) {
          el.remove();
        }
      });
    } catch (error) {
      // 忽略选择器错误
    }
  });

  // 额外清理：遍历 body 的所有子元素，查找可能的 tooltip 元素
  // 通过检查元素特征（position: absolute/fixed, 高 z-index, 包含 tooltip 相关类名）来判断
  try {
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach((el) => {
      if (el instanceof HTMLElement) {
        const style = window.getComputedStyle(el);
        // 安全地获取 className，处理 string 和 DOMTokenList 两种情况
        const className = String(el.className || '');
        const id = el.id || '';
        const dataset = el.dataset || {};

        // 关键修复：排除 DevTools 相关元素，避免误删
        // 检查 class 名称、id 和 data 属性
        const isDevToolsElement =
          (className && (className.includes('dev-tools') || className.includes('dev_tools'))) ||
          (id && id.includes('dev-tools')) ||
          dataset.devToolsInstance !== undefined ||
          el.hasAttribute('data-dev-tools-instance');

        // 关键修复：排除 Element Plus 的弹窗 overlay，避免误删
        // el-overlay 是 Element Plus 弹窗的遮罩层，不应该被清理
        const isElementPlusOverlay =
          className.includes('el-overlay') ||
          className.includes('el-modal-dialog') ||
          id.includes('el-overlay') ||
          id.includes('el-modal-dialog');

        // 如果是指定的 DevTools 或 Element Plus 弹窗元素，跳过清理
        if (isDevToolsElement || isElementPlusOverlay) {
          return;
        }

        // 关键修复：只清理明确包含 echarts 或 tooltip 相关类名的元素
        // 不能仅凭 position 和 z-index 就删除，避免误删其他组件（如弹窗）
        const isTooltipLike =
          (style.position === 'absolute' || style.position === 'fixed') &&
          (className.includes('tooltip') ||
           id.includes('tooltip') ||
           className.includes('echarts') ||
           id.includes('echarts'));

        if (isTooltipLike && el.parentNode === document.body) {
          el.remove();
        }
      }
    });
  } catch (error) {
    // 忽略错误
  }

  // 2. 清理 body 中残留的 toolbox 相关 DOM（数据视图弹窗等）
  // 这些元素通常是通过 appendToBody 添加到 body 的
  const toolboxElements = document.querySelectorAll(
    '.echarts-toolbox, .echarts-data-view, [class*="echarts-toolbox"], [class*="echarts-data-view"]'
  );
  toolboxElements.forEach((el) => {
    // 只清理 body 中的残留元素（appendToBody 的元素）
    if (el.parentNode === document.body) {
      el.parentNode.removeChild(el);
    }
  });

  // 3. 清理可能存在的遮罩层
  const overlayElements = document.querySelectorAll('[class*="echarts-overlay"]');
  overlayElements.forEach((el) => {
    if (el.parentNode === document.body) {
      el.parentNode.removeChild(el);
    }
  });

  // 注意：不主动销毁所有 ECharts 实例，因为：
  // 1. 组件卸载时会自动调用 dispose（通过 useChart composable）
  // 2. 主动销毁可能会影响当前页面正在使用的图表
  // 3. 我们只需要清理 appendToBody 的残留 DOM 元素即可
}

/**
 * 清理指定容器内的所有 ECharts 实例
 * @param container 容器元素
 */
export function cleanupEChartsInContainer(container: HTMLElement | Document) {
  const chartContainers = container.querySelectorAll('[data-echarts], .echarts-container, [class*="echarts"]');

  chartContainers.forEach((chartContainer) => {
    if (chartContainer instanceof HTMLElement) {
      try {
        const chartInstance = getInstanceByDom(chartContainer);
        if (chartInstance) {
          try {
            chartInstance.dispatchAction({
              type: 'hideTip'
            });
          } catch (error) {
            // 忽略错误
          }
          chartInstance.dispose();
        }
      } catch (error) {
        // 忽略错误
      }
    }
  });
}

