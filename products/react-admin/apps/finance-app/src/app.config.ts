/**
 * Taro 小程序配置 - Finance App
 * @description 财务管理小程序入口配置
 */
export default defineAppConfig({
  pages: [
    'modules/finance/views/Home/pages/index/index',
    'modules/invoice/pages/index/index',
    'modules/reports/pages/index/index',
  ],
  window: {
    navigationBarBackgroundColor: '#fa8c16',
    navigationBarTitleText: '财务管理',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#fa8c16',
    backgroundColor: '#ffffff',
    list: [
      { pagePath: 'modules/finance/views/Home/pages/index/index', text: '首页' },
      { pagePath: 'modules/invoice/pages/index/index', text: '发票' },
      { pagePath: 'modules/reports/pages/index/index', text: '报表' },
    ],
  },
  debug: process.env.NODE_ENV === 'development',
})
