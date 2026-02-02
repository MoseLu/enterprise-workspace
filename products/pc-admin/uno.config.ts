import { defineConfig, presetUno, presetAttributify, presetIcons, presetWebFonts } from 'unocss';
import { join } from 'path';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: false,
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains+Mono:400,500',
      },
    }),
  ],

  // 导入 Design System 设计令牌
  cssFile: join(__dirname, 'common/design-system/tokens/css/index.css'),

  shortcuts: {
    // 覆盖快捷变量，使用 design-system 的语义化变量
    'btn': 'px-4 py-2 rounded inline-block cursor-pointer transition-colors',
    'btn-primary': 'bg-[var(--color-primary-main)] text-white hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-primary-disabled)]',
    'btn-success': 'bg-[var(--color-success-main)] text-white hover:bg-[var(--color-success-hover)]',
    'btn-warning': 'bg-[var(--color-warning-main)] text-white hover:bg-[var(--color-warning-hover)]',
    'btn-danger': 'bg-[var(--color-danger-main)] text-white hover:bg-[var(--color-danger-hover)]',
    'btn-outline': 'border border-[var(--color-border-main)] bg-transparent hover:bg-[var(--theme-bg-hover)]',
    'btn-ghost': 'bg-transparent hover:bg-[var(--theme-bg-hover)]',
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'card': 'bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-lg shadow-[var(--theme-shadow-md)] p-6',
  },

  theme: {
    colors: {
      // 使用 design-system 的颜色变量
      primary: 'rgb(var(--color-primary-500) / <alpha-value>)',
      success: 'rgb(var(--color-success-500) / <alpha-value>)',
      warning: 'rgb(var(--color-warning-500) / <alpha-value>)',
      danger: 'rgb(var(--color-danger-500) / <alpha-value>)',
      info: 'rgb(var(--color-info-500) / <alpha-value>)',
    },
    fontFamily: {
      sans: 'var(--font-family-sans)',
      mono: 'var(--font-family-mono)',
    },
  },
});
