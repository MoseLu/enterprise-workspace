/**
 * Taro 小程序应用配置
 * @description 定义小程序页面路由、窗口样式、TabBar 等
 */
export default defineAppConfig({
  // 页面路径配置
  pages: [
    'modules/home/pages/index/index',
    'modules/about/pages/index/index',
    'modules/help/pages/index/index',
    'modules/terms/pages/index/index',
  ],

  // 窗口样式
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '企业工作空间',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f5f5',
    // 启用下拉刷新
    enablePullDownRefresh: true,
    // 下拉背景色
    backgroundTextStyle: 'dark',
  },

  // TabBar 配置（如需要）
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
        pagePath: 'modules/help/pages/index/index',
        text: '帮助',
        iconPath: 'assets/tabbar/help.png',
        selectedIconPath: 'assets/tabbar/help-active.png',
      },
    ],
  },

  // 网络超时配置
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
    uploadFile: 10000,
    downloadFile: 10000,
  },

  // 是否开启 Debug 模式
  debug: process.env.NODE_ENV === 'development',

  //  разрешенные домены
  // permission: {
  //   'scope.userLocation': {
  //     desc: '位置信息用于附近功能',
  //   },
  // },

  // 分包配置（如需要）
  // subpackages: [
  //   {
  //     root: 'modules/about/',
  //     pages: [
  //       'pages/detail/detail',
  //     ],
  //   },
  // ],
})
