/**
 * 应用配置
 */
export default {
  // 应用名称
  name: 'engineering-app',

  // 应用标题
  title: '工程应用',

  // API 配置
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
  },

  // 路由配置
  router: {
    basePath: '/engineering',
    routes: [],
  },

  // 主题配置
  theme: {
    primaryColor: '#409eff',
    darkMode: true,
  },
};
