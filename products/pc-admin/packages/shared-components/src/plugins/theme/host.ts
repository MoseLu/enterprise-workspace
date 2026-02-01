/**
 * 主题插件 - 主应用初始化（Host）
 */
import { watch } from 'vue';
import { useDark } from '@vueuse/core';
import { storage } from '@btc/shared-core/utils';
import type { QiankunActions } from '../types';
import type { ThemeConfig } from '@btc/shared-core';
import { setThemeColor } from './utils';
import { setGlobalState } from '@btc/shared-core';

export interface ThemePluginHostOptions {
  globalState?: QiankunActions;
  app?: any;
}

let themeInstance: any = null;

/**
 * 初始化主题插件（主应用）
 */
export function initThemePluginHost(options: ThemePluginHostOptions = {}) {
  if (themeInstance) {
    return themeInstance;
  }

  const { globalState } = options;
  const settings = (storage.get('settings') as Record<string, any>) || {};
  const savedTheme = settings?.theme as ThemeConfig | null | undefined;

  // 使用 VueUse 的 useDark 管理暗黑模式
  const isDark = useDark({
    storageKey: 'btc_color_scheme',
    storage: {
      getItem: () => {
        const s = (storage.get('settings') as Record<string, any>) || {};
        return s?.colorScheme || null;
      },
      setItem: (_key: string, value: string) => {
        const currentSettings = (storage.get('settings') as Record<string, any>) || {};
        const updatedSettings = { ...currentSettings, colorScheme: value };
        storage.set('settings', updatedSettings);
        
        // 同步到全局状态（通过统一中间层）
        setGlobalState({ theme: { colorScheme: value, isDark: value === 'dark' } }, false).catch(() => {
          // 忽略错误（可能在初始化中）
        });
      },
      removeItem: (_key: string) => {
        const currentSettings = (storage.get('settings') as Record<string, any>) || {};
        if (currentSettings.colorScheme) {
          delete currentSettings.colorScheme;
          storage.set('settings', currentSettings);
        }
      },
    },
  });

  // 监听暗黑模式变化，同步到全局状态（通过统一中间层）
  watch(
    () => isDark.value,
    (dark) => {
      setGlobalState({ theme: { isDark: dark } }, false).catch(() => {
        // 忽略错误（可能在初始化中）
      });
      if (savedTheme?.color) {
        setThemeColor(savedTheme.color, dark);
      }
    },
    { immediate: false }
  );

  const changeTheme = (theme: string | ThemeConfig) => {
    // 如果是字符串，切换暗黑模式
    if (typeof theme === 'string') {
      if (theme === 'dark' || theme === 'light') {
        isDark.value = theme === 'dark';
      }
    } else {
      // 如果是 ThemeConfig，设置主题
      const currentSettings = (storage.get('settings') as Record<string, any>) || {};
      const updatedSettings = { ...currentSettings, theme };
      storage.set('settings', updatedSettings);
      
      if (theme.color) {
        setThemeColor(theme.color, isDark.value);
      }
      
      // 同步到全局状态（通过统一中间层）
      setGlobalState({ theme }, false).catch(() => {
        // 忽略错误（可能在初始化中）
      });
    }
  };

  themeInstance = {
    isDark,
    changeTheme,
    getCurrentTheme: () => {
      const s = (storage.get('settings') as Record<string, any>) || {};
      return s?.theme || null;
    },
  };

  // 初始化时同步到全局状态（通过统一中间层）
  const theme = settings?.theme || null;
  setGlobalState({ theme: { isDark: isDark.value, ...theme } }, false).catch(() => {
    // 忽略错误（可能在初始化中）
  });

  return themeInstance;
}

