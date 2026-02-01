<template>
  <div class="btc-chart-demo" :style="containerStyle">
    <div class="btc-chart-gallery__container">
      <ElRow :gutter="typeof gap === 'number' ? gap : Number(gap) || 10">
      <!-- 1. 柱状图（单数据） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>柱状图（单数据）</span>
          </div>
          <BtcBarChart
            :data="singleBarData"
            :x-axis-data="xAxisData"
            :show-legend="true"
            :show-tooltip="false"
            legend-position="right"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 2. 柱状图（多组数据） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>柱状图（多组数据）</span>
          </div>
          <BtcBarChart
            :data="multiBarData"
            :x-axis-data="xAxisData"
            :show-legend="true"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 3. 柱状图（堆叠） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>柱状图（堆叠）</span>
          </div>
          <BtcBarChart
            :data="stackBarData"
            :x-axis-data="stackXAxisData"
            :show-legend="true"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 4. 折线图 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>折线图</span>
          </div>
          <BtcLineChart
            :data="lineChartData1"
            :x-axis-data="lineChartXAxis1"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 5. 折线图（渐变背景） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>折线图（渐变背景）</span>
          </div>
          <BtcLineChart
            :data="lineChartData2"
            :x-axis-data="lineChartXAxis2"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 6. 折线图（多组数据） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>折线图（多组数据）</span>
          </div>
          <BtcLineChart
            :data="multiLineData"
            :x-axis-data="multiLineXAxis"
            :show-legend="true"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 7. 柱状图（水平） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>柱状图（水平）</span>
          </div>
          <BtcHBarChart
            :data="hBarChartData1"
            :y-axis-data="hBarChartYAxis1"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 8. 柱状图（水平）- 多组数据 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>柱状图（水平）</span>
          </div>
          <BtcHBarChart
            :data="hBarChartData2"
            :y-axis-data="hBarChartYAxis2"
            :show-legend="true"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 9. 柱状图（水平堆叠） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>柱状图（水平堆叠）</span>
          </div>
          <BtcHBarChart
            :data="hBarChartStackData"
            :y-axis-data="hBarChartStackYAxis"
            :show-legend="true"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 10. 环形图 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>环形图</span>
          </div>
          <BtcRingChart
            :data="ringChartData1"
            :radius="['54%', '70%']"
            :show-tooltip="false"
            legend-position="bottom"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 11. 环形图（带中心文本） -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>环形图</span>
          </div>
          <BtcRingChart
            :data="ringChartData2"
            :radius="['54%', '70%']"
            :show-legend="true"
            :show-tooltip="false"
            legend-position="bottom"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 12. 饼图 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>饼图</span>
          </div>
          <BtcPieChart
            :data="pieChartData"
            :radius="['0%', '70%']"
            :show-legend="true"
            :show-tooltip="false"
            legend-position="right"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 13. 散点图 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>散点图</span>
          </div>
          <BtcScatterChart
            :data="scatterChartData"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 14. 雷达图 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>雷达图</span>
          </div>
          <BtcRadarChart
            :indicators="radarIndicators"
            :data="radarChartData"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 15. k线图 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>k线图</span>
          </div>
          <BtcKLineChart
            :data="klineChartData"
            :show-volume="false"
            :show-data-zoom="false"
            :show-tooltip="false"
            height="16rem"
          />
        </div>
      </ElCol>

      <!-- 16. 双向堆叠柱状图 -->
      <ElCol :xs="24" :md="12" :lg="8">
        <div class="card">
          <div class="card-header">
            <span>双向堆叠柱状图</span>
          </div>
          <BtcDualBarCompareChart
            :data1="dualBarData1"
            :data2="dualBarData2"
            :x-axis-data="dualBarXAxis"
            :show-tooltip="false"
            label1="男性年龄分布"
            label2="女性年龄分布"
            height="16rem"
        />
      </div>
      </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElRow, ElCol } from 'element-plus';
import {
  BtcLineChart,
  BtcBarChart,
  BtcPieChart,
  BtcHBarChart,
  BtcDualBarCompareChart,
  BtcRingChart,
  BtcRadarChart,
  BtcScatterChart,
  BtcKLineChart
} from '../../../charts';
import type {
  LineChartData,
  BarChartData,
  PieChartDataItem,
  KLineChartDataItem,
  ScatterChartDataItem
} from '../../../charts';

defineOptions({
  name: 'BtcChartGallery'
});

// Props
interface Props {
  /** 子组件之间的间距（同时包括水平和垂直间距），默认 10px */
  gap?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  gap: 10
});

// 计算间距值（用于 CSS 变量）
const gapValue = computed(() => {
  return typeof props.gap === 'number' ? `${props.gap}px` : props.gap;
});

// 容器样式（用于设置 CSS 变量）
const containerStyle = computed(() => {
  return {
    '--btc-chart-gallery-gap': gapValue.value
  };
});

// 1. 柱状图（单数据）- 需要转换为对象数组格式
const singleBarDataRaw = [120, 200, 150, 80, 70, 110, 130];
const singleBarData = ref<BarChartData[]>([
  {
    name: '数据',
    data: singleBarDataRaw
  }
]);
const xAxisData = ref<string[]>(['周一', '周二', '周三', '周四', '周五', '周六', '周日']);

// 2. 柱状图（多组数据）
const multiBarData = ref<BarChartData[]>([
  {
    name: '销售额',
    data: [120, 200, 150, 80, 70, 110, 130],
    barWidth: '26%'
  },
  {
    name: '利润',
    data: [20, 50, 30, 15, 10, 25, 35],
    barWidth: '26%'
  }
]);

// 3. 柱状图（堆叠）
const stackBarData = ref<BarChartData[]>([
  {
    name: 'Q1',
    data: [20, 25, 30, 35, 40],
    stack: 'total',
    barWidth: '26%'
  },
  {
    name: 'Q2',
    data: [30, 35, 40, 45, 50],
    stack: 'total',
    barWidth: '26%'
  }
]);
const stackXAxisData = ref<string[]>(['产品A', '产品B', '产品C', '产品D', '产品E']);

// 4. 折线图
const lineChartData1 = ref<LineChartData[]>([
  {
    name: '数据',
    data: [58, 15, 82, 35, 120, 62, 45]
  }
]);
const lineChartXAxis1 = ref<string[]>(['一月', '二月', '三月', '四月', '五月', '六月', '七月']);

// 5. 折线图（渐变背景）
const lineChartData2 = ref<LineChartData[]>([
  {
    name: '数据',
    data: [28, 45, 82, 35, 100, 32, 55],
    areaStyle: true
  }
]);
const lineChartXAxis2 = ref<string[]>(['一月', '二月', '三月', '四月', '五月', '六月', '七月']);

// 6. 折线图（多组数据）
const multiLineData = ref<LineChartData[]>([
  {
    name: '销售额',
    data: [120, 132, 101, 134, 90, 130],
    areaStyle: true
  },
  {
    name: '利润',
    data: [80, 92, 71, 94, 60, 80],
    areaStyle: true
  }
]);
const multiLineXAxis = ref<string[]>(['1月', '2月', '3月', '4月', '5月', '6月']);

// 7. 柱状图（水平）- 单数据
const hBarChartData1Raw = [50, 80, 120, 90, 60];
const hBarChartData1 = ref<BarChartData[]>([
  {
    name: '数据',
    data: hBarChartData1Raw
  }
]);
const hBarChartYAxis1 = ref<string[]>(['产品A', '产品B', '产品C', '产品D', '产品E']);

// 8. 柱状图（水平）- 多组数据
const hBarChartData2 = ref<BarChartData[]>([
  {
    name: '系列1',
    data: [10, 20, 30],
    barWidth: '30%'
  },
  {
    name: '系列2',
    data: [15, 25, 35],
    barWidth: '30%'
  }
]);
const hBarChartYAxis2 = ref<string[]>(['类目1', '类目2', '类目3']);

// 9. 柱状图（水平堆叠）
const hBarChartStackData = ref<BarChartData[]>([
  {
    name: '系列1',
    data: [10, 20, 30],
    stack: 'total',
    barWidth: '30%'
  },
  {
    name: '系列2',
    data: [15, 25, 35],
    stack: 'total',
    barWidth: '30%'
  }
]);
const hBarChartStackYAxis = ref<string[]>(['类目1', '类目2', '类目3']);

// 10. 环形图
const ringChartData1 = ref<PieChartDataItem[]>([
  { name: '分类A', value: 35 },
  { name: '分类B', value: 28 },
  { name: '分类C', value: 42 }
]);

// 11. 环形图（带中心文本）
const ringChartData2 = ref<PieChartDataItem[]>([
  { name: '分类A', value: 35 },
  { name: '分类B', value: 28 },
  { name: '分类C', value: 42 },
  { name: '分类D', value: 32 },
  { name: '分类E', value: 26 },
  { name: '分类F', value: 37 }
]);

// 12. 饼图
const pieChartData = ref<PieChartDataItem[]>([
  { name: '分类A', value: 30 },
  { name: '分类B', value: 25 },
  { name: '分类C', value: 45 }
]);

// 13. 散点图
const scatterChartData = ref<ScatterChartDataItem[]>([
  {
    name: '数据点',
    data: [
      { value: [1, 3] as [number, number] },
      { value: [2, 4] as [number, number] },
      { value: [3, 5] as [number, number] },
      { value: [4, 6] as [number, number] },
      { value: [5, 7] as [number, number] },
      { value: [6, 8] as [number, number] },
      { value: [7, 7] as [number, number] },
      { value: [8, 9] as [number, number] },
      { value: [9, 8] as [number, number] },
      { value: [10, 6] as [number, number] },
      { value: [11, 7] as [number, number] },
      { value: [12, 8] as [number, number] }
    ],
    color: '#409eff'
  }
]);

// 14. 雷达图
const radarIndicators = ref([
  { name: '销售', max: 100 },
  { name: '管理', max: 100 },
  { name: '技术', max: 100 },
  { name: '客服', max: 100 },
  { name: '开发', max: 100 }
]);
const radarChartData = ref([
  {
    name: '预算分配',
    data: [80, 70, 90, 85, 75],
    color: '#409eff',
    areaStyle: true
  },
  {
    name: '实际开销',
    data: [70, 75, 85, 80, 70],
    color: '#67c23a',
    areaStyle: true
  }
]);

// 15. k线图
const klineChartData = ref<KLineChartDataItem[]>([
  { date: '2024-01-01', value: [20, 23, 18, 25] },
  { date: '2024-01-02', value: [23, 21, 20, 24] },
  { date: '2024-01-03', value: [21, 25, 21, 26] }
]);

// 16. 双向堆叠柱状图
const dualBarData1 = ref<BarChartData[]>([
  {
    name: '男性年龄分布',
    data: [50, 28, 80, 65, 68, 70, 60, 55]
  }
]);
const dualBarData2 = ref<BarChartData[]>([
  {
    name: '女性年龄分布',
    data: [50, 28, 40, 45, 38, 50, 42, 48]
  }
]);
const dualBarXAxis = ref<string[]>([
  '0-4岁',
  '5-14岁',
  '15-24岁',
  '25-34岁',
  '35-44岁',
  '45-54岁',
  '55-64岁',
  '65岁以上'
]);
</script>

<style lang="scss" scoped>
.btc-chart-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;

  .btc-chart-gallery__container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
  }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;

      &:hover {
        background: var(--el-border-color-darker);
      }
    }
  }

  .card {
    background-color: var(--el-bg-color);
    border-radius: var(--custom-radius, var(--el-border-radius-base, 0.25rem));
    border: 1px solid var(--el-border-color-light);
    box-sizing: border-box;
    padding: 20px;

    .card-header {
      padding-bottom: 15px;
      margin-bottom: 0;

      span {
        font-size: 16px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }

  // 设置图表卡片之间的垂直间距
  // ElRow 的 gutter 属性只设置水平间距，需要手动设置垂直间距
  :deep(.el-col) {
    margin-bottom: var(--btc-chart-gallery-gap, 10px);
  }
}
</style>
