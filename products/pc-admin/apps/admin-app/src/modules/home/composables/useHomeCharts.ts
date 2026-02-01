import { ref } from 'vue';
import type {
  LineChartData,
  BarChartData,
  PieChartDataItem
} from '@btc/shared-components';

/**
 * 首页图表数据管理 composable
 */
export function useHomeCharts() {
  const { t } = useI18n();
  // 折线图数据
  const executionTrendData = ref<LineChartData[]>([
    {
      name: t('common.home.execution_count'),
      data: [120, 132, 101, 134, 90, 230, 210],
      color: '#409eff',
      smooth: true,
      areaStyle: true
    }
  ]);
  const executionTrendXAxis = ref<string[]>([
    t('common.home.monday'),
    t('common.home.tuesday'),
    t('common.home.wednesday'),
    t('common.home.thursday'),
    t('common.home.friday'),
    t('common.home.saturday'),
    t('common.home.sunday')
  ]);

  // 柱状图数据
  const responseTimeData = ref<BarChartData[]>([
    {
      name: t('common.home.response_time_distribution'),
      data: [320, 280, 150, 80, 20],
      color: '#67c23a'
    }
  ]);
  const responseTimeXAxis = ref<string[]>(['0-50ms', '50-100ms', '100-200ms', '200-500ms', '500ms+']);

  // 饼图数据
  const typeDistributionData = ref<PieChartDataItem[]>([
    { name: t('common.home.permission_strategy'), value: 35, color: '#f56c6c' },
    { name: t('common.home.business_strategy'), value: 25, color: '#67c23a' },
    { name: t('common.home.data_strategy'), value: 20, color: '#e6a23c' },
    { name: t('common.home.workflow_strategy'), value: 20, color: '#409eff' }
  ]);

  // 横向柱状图数据
  const hBarChartData = ref<BarChartData[]>([
    {
      name: t('common.home.data_volume'),
      data: [120, 200, 150, 80, 70, 110, 130],
      color: '#409eff'
    }
  ]);
  const hBarChartYAxis = ref<string[]>([
    t('common.home.category_a'),
    t('common.home.category_b'),
    t('common.home.category_c'),
    t('common.home.category_d'),
    t('common.home.category_e'),
    t('common.home.category_f'),
    t('common.home.category_g')
  ]);

  // 双柱对比图数据
  const dualBarData1 = ref<BarChartData[]>([
    {
      name: t('common.home.this_month'),
      data: [120, 200, 150, 80, 70],
      color: '#409eff'
    }
  ]);
  const dualBarData2 = ref<BarChartData[]>([
    {
      name: t('common.home.last_month'),
      data: [100, 180, 130, 90, 60],
      color: '#67c23a'
    }
  ]);
  const dualBarXAxis = ref<string[]>([
    t('common.home.project_1'),
    t('common.home.project_2'),
    t('common.home.project_3'),
    t('common.home.project_4'),
    t('common.home.project_5')
  ]);

  // 环形图数据
  const ringChartData = ref<PieChartDataItem[]>([
    { name: t('common.home.type_a'), value: 35, color: '#409eff' },
    { name: t('common.home.type_b'), value: 25, color: '#67c23a' },
    { name: t('common.home.type_c'), value: 20, color: '#e6a23c' },
    { name: t('common.home.type_d'), value: 20, color: '#f56c6c' }
  ]);

  // 雷达图数据
  const radarIndicators = ref([
    { name: t('common.home.indicator_a'), max: 100 },
    { name: t('common.home.indicator_b'), max: 100 },
    { name: t('common.home.indicator_c'), max: 100 },
    { name: t('common.home.indicator_d'), max: 100 },
    { name: t('common.home.indicator_e'), max: 100 }
  ]);
  const radarChartData = ref([
    {
      name: t('common.home.data_series_1'),
      data: [80, 90, 70, 85, 75],
      color: '#409eff',
      areaStyle: true
    }
  ]);

  // 散点图数据
  const scatterChartData = ref([
    {
      name: t('common.home.data_point'),
      data: [
        { value: [10, 20], name: t('common.home.point_1') },
        { value: [15, 30], name: t('common.home.point_2') },
        { value: [20, 25], name: t('common.home.point_3') },
        { value: [25, 40], name: t('common.home.point_4') },
        { value: [30, 35], name: t('common.home.point_5') },
        { value: [35, 50], name: t('common.home.point_6') },
        { value: [40, 45], name: t('common.home.point_7') },
        { value: [45, 60], name: t('common.home.point_8') }
      ],
      color: '#409eff'
    }
  ]);

  // K线图数据
  const klineChartData = ref([
    { date: '2024-01-01', value: [100, 120, 90, 110], volume: 1000 },
    { date: '2024-01-02', value: [110, 130, 100, 120], volume: 1200 },
    { date: '2024-01-03', value: [120, 140, 110, 130], volume: 1500 },
    { date: '2024-01-04', value: [130, 150, 120, 140], volume: 1800 },
    { date: '2024-01-05', value: [140, 160, 130, 150], volume: 2000 }
  ]);

  return {
    executionTrendData,
    executionTrendXAxis,
    responseTimeData,
    responseTimeXAxis,
    typeDistributionData,
    hBarChartData,
    hBarChartYAxis,
    dualBarData1,
    dualBarData2,
    dualBarXAxis,
    ringChartData,
    radarIndicators,
    radarChartData,
    scatterChartData,
    klineChartData
  };
}

