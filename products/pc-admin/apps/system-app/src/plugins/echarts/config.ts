import { type App } from 'vue';
import VueECharts from 'vue-echarts';
import { use } from 'echarts/core';
import { registerEChartsThemes } from '@btc/shared-components';

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
 * 背景：layout-app、system-app、子应用可能共享同一份 echarts 依赖，
 * 重复调用 use([...]) 会触发 ECharts 内部断言（registerInternalOptionCreator）。
 */
const GLOBAL_ECHARTS_USE_FLAG = '__BTC_ECHARTS_USE_REGISTERED__';
let localEchartsUseRegistered = false;

function registerEChartsOnce() {
  // 关键：在 qiankun 沙箱里 window 可能是 proxy（各子应用各一份），
  // 但如果 echarts/core 是共享单例，那么把 flag 挂到 use 函数上才能真正“全局只执行一次”。
  const useFnAny = use as any;
  if (useFnAny && useFnAny[GLOBAL_ECHARTS_USE_FLAG]) {
    return;
  }

  const canUseWindow = typeof window !== 'undefined';
  const w = canUseWindow ? (window as any) : null;

  if (w && w[GLOBAL_ECHARTS_USE_FLAG]) {
    return;
  }
  if (!w && localEchartsUseRegistered) {
    return;
  }

  try {
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
    if (import.meta.env.DEV) {
      // ECharts use() register failed (ignored)
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
      // 全局注册 v-chart 组件
      app.component('v-chart', VueECharts);
      app.config.globalProperties.$_vueEchartsInstalled = true;

      // 在应用启动后注册自定义主题，确保 CSS 变量已经正确设置
      if (typeof window !== 'undefined') {
        // 使用多种方式确保 DOM 和 CSS 变量已经准备好
        const registerThemes = () => {
          registerEChartsThemes();
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

