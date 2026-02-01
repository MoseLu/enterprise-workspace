import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: false, // 关闭警告，避免无效图标名称（如 "-"）导致的警告
    }),
  ],

  shortcuts: {
    btn: 'px-4 py-2 rounded inline-block bg-blue-500 text-white cursor-pointer hover:bg-blue-600 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50',
    'btn-primary': 'bg-blue-500 hover:bg-blue-600',
    'btn-success': 'bg-green-500 hover:bg-green-600',
    'btn-warning': 'bg-orange-500 hover:bg-orange-600',
    'btn-danger': 'bg-red-500 hover:bg-red-600',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    card: 'bg-white rounded-lg shadow p-4',
  },

  theme: {
    colors: {
      primary: '#409EFF',
      success: '#67C23A',
      warning: '#E6A23C',
      danger: '#F56C6C',
      info: '#909399',
    },
  },
});
