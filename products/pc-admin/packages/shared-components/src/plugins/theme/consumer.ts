/**
 * 主题插件 - 子应用消费（Consumer）
 */
;
import { useDark } from '@vueuse/core';
import type { QiankunActions } from '../types';
import { setThemeColor } from './utils';
import { onGlobalStateChange } from '@btc/shared-core';

export interface ThemePluginConsumerOptions {
  globalState?: QiankunActions;
}

/**
 * 消费主题插件（子应用）
 */
export function consumeThemePluginHost(options: ThemePluginConsumerOptions = {}) {
  const { globalState } = options;

  if (!globalState) {
    console.warn('[theme-consumer] globalState is not provided');
    return null;
  }

  // 子应用使用 useDark 监听全局状态
  const isDark = useDark({
    storageKey: 'btc_color_scheme',
    storage: {
      getItem: () => null, // 不从本地读取，仅从全局状态读取
      setItem: () => {}, // 不写入本地，由主应用控制
      removeItem: () => {},
    },
  });

  // 监听全局状态变化（通过统一中间层）
  onGlobalStateChange(
    (state) => {
      if (state.theme && typeof state.theme === 'object') {
        const theme = state.theme as { isDark?: boolean; color?: string };
        // 同步暗黑模式
        if (theme.isDark !== undefined) {
          isDark.value = theme.isDark;
        }
        
        // 同步主题色
        if (theme.color) {
          setThemeColor(theme.color, isDark.value);
        }
      }
    },
    true, // 立即执行一次
    'theme-consumer-listener' // 固定监听器 key
  );

  return {
    isDark,
  };
}

