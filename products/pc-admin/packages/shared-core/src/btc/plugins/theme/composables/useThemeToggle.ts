;
import { useDark } from '@vueuse/core';
import type { Ref } from 'vue';
import type { ThemeConfig } from '../../../composables/useTheme';
import { storage } from '../../../../utils';
import { logger } from '../../../../utils/logger/index';

/**
 * 禁用过渡效果（避免主题切换时的水合问题）
 * 注意：View Transition API 动画不受影响，因为它使用伪元素
 */
const disableTransitions = () => {
  const style = document.createElement('style');
  style.setAttribute('id', 'disable-transitions');
  // 只禁用普通元素的 transition，不影响 view-transition 伪元素
  style.textContent = '* { transition: none !important; }';
  document.head.appendChild(style);
};

/**
 * 启用过渡效果
 */
const enableTransitions = () => {
  const style = document.getElementById('disable-transitions');
  if (style) {
    style.remove();
  }
};

/**
 * 切换暗黑模式（完全按照 cool-admin 的方式实现）
 */
export function createToggleDark(
  isDark: ReturnType<typeof useDark>,
  currentTheme: Ref<ThemeConfig>,
  setTheme: (options: { color?: string; name?: string; dark?: boolean }) => void,
  changeDark?: (el: Element, isDark: boolean, cb: () => void) => void
) {
  return function toggleDark(event?: MouseEvent) {
    const newDarkValue = !isDark.value;

    // 如果有 event 且有 changeDark 方法，使用动画切换（参考 cool-admin-vue-8.x）
    if (event && changeDark) {
      // 获取点击的元素（参考 cool-admin-vue-8.x，使用 currentTarget 获取事件绑定的元素）
      // 如果 currentTarget 不存在，则使用 target 并向上查找最近的元素
      let el: Element | null = (event.currentTarget as Element) || (event.target as Element);

      // 如果获取到的是 SVG 内部元素，向上查找父元素
      if (el && (el.tagName === 'path' || el.tagName === 'svg' || el.tagName === 'use')) {
        el = el.closest('.btc-comm__icon') || el.parentElement || el;
      }

      // 如果仍然没有找到有效的元素，使用 document.body 作为后备
      if (!el || !(el instanceof Element)) {
        el = document.body;
      }

      // 调用 changeDark 方法（完全按照 cool-admin 的方式）
      changeDark(el, newDarkValue, () => {
        // 关键：只更新 isDark.value，让 useDark 自动管理 HTML class
        // 然后调用统一的 setTheme 函数
        isDark.value = newDarkValue;
        setTheme({ color: currentTheme.value.color, dark: isDark.value });

        // 同步更新设置状态（如果存在）
        try {
          const SystemThemeEnum = {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto',
          };
          const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
          const currentSettings = (storage.get('settings') as Record<string, any>) || {};
          const updatedSettings = {
            ...currentSettings,
            systemThemeType: newTheme,
            systemThemeMode: newTheme
          };
          storage.set('settings', updatedSettings);
          storage.remove('systemThemeType');
          storage.remove('systemThemeMode');
        } catch (e) {
          // 忽略错误
        }

        // 触发 theme-toggle 事件
        try {
          const SystemThemeEnum = {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto',
          };
          const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
          window.dispatchEvent(new CustomEvent('theme-toggle', {
            detail: { theme: newTheme, isDark: newDarkValue }
          }));

          // 触发 theme-changed 事件
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('theme-changed', {
              detail: { isDark: newDarkValue, theme: newTheme }
            }));
          }, 0);
        } catch (e) {
          logger.error('[createToggleDark] 触发 theme-toggle 事件失败', e);
        }
      });
    } else {
      // 没有 event 或 changeDark 方法，直接切换（设置面板切换时使用此路径）
      disableTransitions();

      // 关键：只更新 isDark.value，让 useDark 自动管理 HTML class
      // 然后调用统一的 setTheme 函数
      isDark.value = newDarkValue;
      setTheme({ color: currentTheme.value.color, dark: isDark.value });

      try {
        const SystemThemeEnum = {
          LIGHT: 'light',
          DARK: 'dark',
          AUTO: 'auto',
        };
        const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
        const currentSettings = (storage.get('settings') as Record<string, any>) || {};
        storage.set('settings', {
          ...currentSettings,
          systemThemeType: newTheme,
          systemThemeMode: newTheme
        });
        storage.remove('systemThemeType');
        storage.remove('systemThemeMode');
      } catch (e) {
        // 忽略错误
      }

      // 触发 theme-toggle 事件
      try {
        const SystemThemeEnum = {
          LIGHT: 'light',
          DARK: 'dark',
          AUTO: 'auto',
        };
        const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
        window.dispatchEvent(new CustomEvent('theme-toggle', {
          detail: { theme: newTheme, isDark: newDarkValue }
        }));

        // 触发 theme-changed 事件
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('theme-changed', {
            detail: { isDark: newDarkValue, theme: newTheme }
          }));
        }, 0);
      } catch (e) {
        logger.error('[createToggleDark] 触发 theme-toggle 事件失败', e);
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          enableTransitions();
        });
      });
    }
  };
}

