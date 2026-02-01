;
import { type App, h } from 'vue';
import VueECharts from 'vue-echarts';
import { use } from 'echarts/core';

// 导入 ECharts 核心模块
import {
  CanvasRenderer
} from 'echarts/renderers';

import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  CandlestickChart
} from 'echarts/charts';

import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  ToolboxComponent
} from 'echarts/components';

/**
 * 注册 ECharts 必要的组件（全局只注册一次）
 *
 * 背景：在 layout-app + 子应用同时加载（共享 echarts 依赖）时，重复调用 use([...])
 * 会触发 ECharts 内部断言（registerInternalOptionCreator），导致路由动态导入直接报错。
 */
const GLOBAL_ECHARTS_USE_FLAG = '__BTC_ECHARTS_USE_REGISTERED__';
let localEchartsUseRegistered = false;

/**
 * 在微前端场景下，可能出现"上层应用设置过标记但没有正确注册 renderer"。
 * 因此即使看到 flag，也要再尝试一次 use([...])，并用 try/catch 兜底。
 */
function registerEChartsOnce() {
  const useFnAny = use as any;
  const canUseWindow = typeof window !== 'undefined';
  const w = canUseWindow ? (window as any) : null;

  const alreadyMarked =
    localEchartsUseRegistered ||
    (useFnAny && useFnAny[GLOBAL_ECHARTS_USE_FLAG]) ||
    (w && w[GLOBAL_ECHARTS_USE_FLAG]);

  try {
    // 即使已标记也再尝试注册一次，防止 renderer 未被真正注册导致 "Renderer 'undefined'"。
    use([
      CanvasRenderer,
      BarChart,
      LineChart,
      PieChart,
      RadarChart,
      ScatterChart,
      CandlestickChart,
      GridComponent,
      TooltipComponent,
      TitleComponent,
      LegendComponent,
      DataZoomComponent,
      MarkLineComponent,
      MarkPointComponent,
      ToolboxComponent,
    ]);
  } catch (error) {
    // 重复注册在微前端场景下是可预期的，兜底不让应用崩溃
    if (import.meta.env.DEV && !alreadyMarked) {
      console.warn('[operations-app][echarts] ECharts use() register failed (ignored):', error);
    }
  } finally {
    if (w) w[GLOBAL_ECHARTS_USE_FLAG] = true;
    localEchartsUseRegistered = true;
    if (useFnAny) useFnAny[GLOBAL_ECHARTS_USE_FLAG] = true;
  }
}

export default {
  install(app: App) {
    // 先确保 ECharts 组件已注册（且全局只注册一次）
    registerEChartsOnce();

    // 检查是否已经注册，避免重复注册
    if (!app.config.globalProperties.$_vueEchartsInstalled) {
      // 创建一个包装组件，自动添加 renderer="canvas" 属性
      // 这样可以确保在使用按需导入的 ECharts 时，始终有正确的 renderer
      const VChartWrapper = {
        name: 'VChartWrapper',
        setup(props: any, { attrs, slots }: any) {
          return () => h(VueECharts, {
            ...attrs,
            ...props,
            renderer: attrs.renderer || props.renderer || 'canvas'
          }, slots);
        }
      };

      // 全局注册 v-chart 组件
      app.component('v-chart', VChartWrapper);
      app.config.globalProperties.$_vueEchartsInstalled = true;

          // 在应用启动后注册自定义主题，确保 CSS 变量已经正确设置
          if (typeof window !== 'undefined') {
            // 使用多种方式确保 DOM 和 CSS 变量已经准备好
            const registerThemes = async () => {
              try {
                const sharedComponents = await import('@btc/shared-components');
                if ('registerEChartsThemes' in sharedComponents && typeof sharedComponents.registerEChartsThemes === 'function') {
                  sharedComponents.registerEChartsThemes();
                }
              } catch (error) {
                // 静默失败
                if (import.meta.env.DEV) {
                  console.warn('[echarts] Failed to register themes:', error);
                }
              }
            };

          // 立即尝试注册
          registerThemes();

          // DOMContentLoaded 时再次注册，确保 CSS 变量已应用
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', registerThemes);
          }

          // 延迟注册，确保所有样式都已加载
          setTimeout(registerThemes, 100);
        }
    }
  }
};
