/**
 * Taro 小程序应用配置 - Operations App
 * @description 运维管理小程序入口配置
 */
export default defineAppConfig({
  // 页面路径配置
  pages: [
    'modules/operations/views/Home/pages/index/index',
    'modules/operations/views/DeploymentTest/pages/index/index',
    'modules/operations/views/ErrorMonitor/pages/index/index',
  ],

  // 窗口样式
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#52c41a',
    navigationBarTitleText: '运维管理',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
    enablePullDownRefresh: true,
  },

  // TabBar 配置
  tabBar: {
    color: '#999999',
    selectedColor: '#52c41a',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'modules/operations/views/Home/pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'modules/operations/views/ErrorMonitor/pages/index/index',
        text: '监控',
      },
    ],
  },

  // 网络超时配置
  networkTimeout: {
    request: 15000,
  },

  // Debug 模式
  debug: process.env.NODE_ENV === 'development',
})
