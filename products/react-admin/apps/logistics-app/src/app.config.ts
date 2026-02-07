/**
 * Taro 小程序配置 - Logistics App
 * @description 物流管理小程序入口配置
 */
export default defineAppConfig({
  pages: [
    'modules/logistics/views/Home/pages/index/index',
    'modules/delivery/pages/index/index',
    'modules/warehouse/pages/index/index',
  ],
  window: {
    navigationBarBackgroundColor: '#722ed1',
    navigationBarTitleText: '物流管理',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#722ed1',
    backgroundColor: '#ffffff',
    list: [
      { pagePath: 'modules/logistics/views/Home/pages/index/index', text: '首页' },
      { pagePath: 'modules/delivery/pages/index/index', text: '配送' },
      { pagePath: 'modules/warehouse/pages/index/index', text: '仓储' },
    ],
  },
  debug: process.env.NODE_ENV === 'development',
})
