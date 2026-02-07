/**
 * Taro 小程序配置 - Dashboard App
 * @description 仪表盘小程序入口配置
 */
export default defineAppConfig({
  pages: [
    'modules/dashboard/views/Home/pages/index/index',
    'modules/analytics/pages/index/index',
    'modules/reports/pages/index/index',
  ],
  window: {
    navigationBarBackgroundColor: '#1890ff',
    navigationBarTitleText: '数据仪表盘',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f0f2f5',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    list: [
      { pagePath: 'modules/dashboard/views/Home/pages/index/index', text: '仪表盘' },
      { pagePath: 'modules/analytics/pages/index/index', text: '分析' },
      { pagePath: 'modules/reports/pages/index/index', text: '报表' },
    ],
  },
  debug: process.env.NODE_ENV === 'development',
})
