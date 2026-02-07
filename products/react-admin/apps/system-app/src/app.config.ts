/**
 * Taro 小程序配置 - System App
 * @description 系统管理小程序入口配置
 */
export default defineAppConfig({
  pages: [
    'modules/system/views/Home/pages/index/index',
    'modules/settings/pages/index/index',
    'modules/users/pages/index/index',
  ],
  window: {
    navigationBarBackgroundColor: '#13c2c2',
    navigationBarTitleText: '系统管理',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#13c2c2',
    backgroundColor: '#ffffff',
    list: [
      { pagePath: 'modules/system/views/Home/pages/index/index', text: '首页' },
      { pagePath: 'modules/settings/pages/index/index', text: '设置' },
      { pagePath: 'modules/users/pages/index/index', text: '用户' },
    ],
  },
  debug: process.env.NODE_ENV === 'development',
})
