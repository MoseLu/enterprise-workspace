import type { Plugin } from 'vue';
import { ref, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { THEME_PRESETS, type ThemeConfig } from '../../composables/useTheme';
/**
 * 主题插件实例
 */
export type ButtonStyle = 'default' | 'minimal';
export interface ThemePlugin {
    currentTheme: ReturnType<typeof ref<ThemeConfig>>;
    isDark: ReturnType<typeof useDark>;
    color: ReturnType<typeof computed<string>>;
    THEME_PRESETS: typeof THEME_PRESETS;
    switchTheme: (theme: ThemeConfig) => void;
    setTheme: (options: {
        color?: string;
        name?: string;
        dark?: boolean;
    }) => void;
    toggleDark: (event?: MouseEvent) => void;
    changeDark: (el: Element, isDark: boolean, cb: () => void) => void;
    setThemeColor: (color: string, dark: boolean) => void;
    updateThemeColor: (color: string) => void;
    buttonStyle: ReturnType<typeof ref<ButtonStyle>>;
    setButtonStyle: (style: ButtonStyle) => void;
}
/**
 * 创建主题插件
 */
export declare function createThemePlugin(): Plugin & {
    theme: ThemePlugin;
};
/**
 * 组合式 API：使用主题插件
 */
export declare function useThemePlugin(): ThemePlugin;
/**
 * 导出主题配置类型
 */
export type { ThemeConfig } from '../../composables/useTheme';
export { THEME_PRESETS };
//# sourceMappingURL=index.d.ts.map