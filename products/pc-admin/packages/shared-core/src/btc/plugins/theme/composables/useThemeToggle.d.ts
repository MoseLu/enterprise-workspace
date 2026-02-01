import { useDark } from '@vueuse/core';
import type { Ref } from 'vue';
import type { ThemeConfig } from '../../../composables/useTheme';
/**
 * 切换暗黑模式（完全按照 cool-admin 的方式实现）
 */
export declare function createToggleDark(isDark: ReturnType<typeof useDark>, currentTheme: Ref<ThemeConfig>, setTheme: (options: {
    color?: string;
    name?: string;
    dark?: boolean;
}) => void, changeDark?: (el: Element, isDark: boolean, cb: () => void) => void): (event?: MouseEvent) => void;
//# sourceMappingURL=useThemeToggle.d.ts.map