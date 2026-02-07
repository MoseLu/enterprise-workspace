/**
 * Taro 小程序应用配置 - Admin App
 * @description 管理后台小程序入口配置
 */
export default defineAppConfig({
  // 页面路径配置
  pages: [
    'modules/home/pages/index/index',
    'modules/ops/pages/index/index',
    'modules/org/pages/index/index',
    'modules/access/pages/index/index',
    'modules/strategy/pages/index/index',
    'modules/governance/pages/index/index',
    'modules/navigation/pages/index/index',
  ],

  // 窗口样式
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1890ff',
    navigationBarTitleText: '管理后台',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
    enablePullDownRefresh: true,
  },

  // TabBar 配置
  tabBar: {
    color: '#999999',
    selectedColor: '#1890ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'modules/home/pages/index/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png',
      },
      {
        pagePath: 'modules/ops/pages/index/index',
        text: '运维',
        iconPath: 'assets/tabbar/ops.png',
        selectedIconPath: 'assets/tabbar/ops-active.png',
      },
      {
        pagePath: 'modules/org/pages/index/index',
        text: '组织',
        iconPath: 'assets/tabbar/org.png',
        selectedIconPath: 'assets/tabbar/org-active.png',
      },
    ],
  },

  // 网络超时配置
  networkTimeout: {
    request: 15000,
    connectSocket: 15000,
    uploadFile: 15000,
    downloadFile: 15000,
  },

  // Debug 模式
  debug: process.env.NODE_ENV === 'development',
})
