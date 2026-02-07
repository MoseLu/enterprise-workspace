/**
 * Taro 小程序应用配置 - Main App
 * @description 认证相关页面配置
 */
export default defineAppConfig({
  // 页面路径配置
  pages: [
    'pages/login/pages/index/index',
    'pages/register/pages/index/index',
    'pages/forget-password/pages/index/index',
    'pages/profile/pages/index/index',
  ],

  // 窗口样式
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1890ff',
    navigationBarTitleText: '企业工作空间',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
  },

  // 网络超时配置
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
  },

  // Debug 模式
  debug: process.env.NODE_ENV === 'development',
})
