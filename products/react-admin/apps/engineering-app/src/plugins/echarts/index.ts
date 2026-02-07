import { use } from 'echarts/core';
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart, GaugeChart, MapChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  TransformComponent,
  GraphicComponent,
  ToolboxComponent,
  VisualMapComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { provide, ref, computed } from 'vue';

export function setupECharts(app: any) {
  // 注册 ECharts 组件
  use([
    CanvasRenderer,
    SVGRenderer,
    BarChart,
    LineChart,
    PieChart,
    GaugeChart,
    MapChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    DataZoomComponent,
    TransformComponent,
    GraphicComponent,
    ToolboxComponent,
    VisualMapComponent,
  ]);

  // 注册全局组件
  app.component('v-chart', VChart);

  // 提供全局主题配置
  app.provide(THEME_KEY, ref('light'));
}
