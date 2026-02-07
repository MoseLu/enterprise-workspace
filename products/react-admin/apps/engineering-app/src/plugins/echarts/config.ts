/**
 * ECharts 配置
 */
export const ECHARTS_CONFIG = {
  // 默认配置
  default: {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    textStyle: {
      fontFamily: 'Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Arial, sans-serif',
    },
  },

  // 主题配置
  theme: {
    light: {
      color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'],
    },
    dark: {
      color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'],
    },
  },
};
