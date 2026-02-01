;
import { defineStore } from 'pinia';
import { ref, computed, nextTick } from 'vue';
import { useDark } from '@vueuse/core';
import { storage } from '../../utils';
import { logger } from '../../utils/logger';
import { THEME_PRESETS, type ThemeConfig, mixColor } from '../composables/useTheme';
import { setBodyClassName } from '../utils/body-class';
import { generateContrastVariants } from '../utils/color-contrast';

/**
 * 主题 Store
 */
export const useThemeStore = defineStore('theme', () => {
  // 从 localStorage 读取保存的主题配置
  const savedTheme = storage.get('theme') as ThemeConfig | null;

  // 数据迁移：将旧的硬编码标签转换为国际化键值
  let migratedTheme = THEME_PRESETS[0]; // 默认主题

  if (savedTheme) {
    // 检查是否是旧格式（硬编码英文标签）
    const oldLabels = ['Default', 'Green', 'Purple', 'Orange', 'Pink', 'Mint', 'Custom'];
    if (oldLabels.includes(savedTheme.label)) {
      // 根据颜色匹配对应的新主题配置
      // 如果匹配到已删除的主题（如 pink），则回退到默认主题
      const matchedPreset = THEME_PRESETS.find(preset => preset.color === savedTheme.color);
      if (matchedPreset) {
        migratedTheme = matchedPreset;
      } else if (savedTheme.name === 'pink' || savedTheme.color === '#FF69B4') {
        // 粉色主题已删除，回退到默认主题
        migratedTheme = THEME_PRESETS[0];
      } else if (savedTheme.name === 'custom') {
        // 自定义主题
        migratedTheme = {
          name: 'custom',
          label: 'theme.custom',
          color: savedTheme.color
        };
      }
      // 保存迁移后的配置
      storage.set('theme', migratedTheme);
    } else {
      // 已经是新格式，直接使用
      migratedTheme = savedTheme;
    }
  }

  const currentTheme = ref<ThemeConfig>(migratedTheme ?? THEME_PRESETS[0]!);

  // 使用 VueUse 的 useDark，自动管理暗黑模式并持久化到 localStorage
  const isDark = useDark();

  // 主题颜色
  const color = computed(() => currentTheme.value.color);

  /**
   * 设置主题颜色
   */
  function setThemeColor(color: string, dark: boolean) {
    const el = document.documentElement;
    const pre = '--el-color-primary';
    const mixWhite = '#ffffff';
    const mixBlack = '#131313';

    el.style.setProperty(pre, color);

    for (let i = 1; i < 10; i += 1) {
      if (dark) {
        el.style.setProperty(`${pre}-light-${i}`, mixColor(color, mixBlack, i * 0.1));
        el.style.setProperty(`${pre}-dark-${i}`, mixColor(color, mixWhite, i * 0.1));
      } else {
        el.style.setProperty(`${pre}-light-${i}`, mixColor(color, mixWhite, i * 0.1));
        el.style.setProperty(`${pre}-dark-${i}`, mixColor(color, mixBlack, i * 0.1));
      }
    }

    // 生成高对比度变体
    try {
      const hexColor = color.startsWith('#') && color.length === 7 ? color : `#${color.replace('#', '')}`;
      if (hexColor.length === 7) {
        const contrastVariants = generateContrastVariants(hexColor, dark);
        el.style.setProperty(`${pre}-contrast-light`, contrastVariants.contrastLight);
        el.style.setProperty(`${pre}-contrast-dark`, contrastVariants.contrastDark);
        el.style.setProperty(`${pre}-contrast-aa`, contrastVariants.contrastAA);
        el.style.setProperty(`${pre}-contrast-aaa`, contrastVariants.contrastAAA);
      }
    } catch (error) {
      // 如果生成失败，设置默认值
      el.style.setProperty(`${pre}-contrast-light`, dark ? '#ffffff' : '#000000');
      el.style.setProperty(`${pre}-contrast-dark`, dark ? '#ffffff' : '#000000');
      el.style.setProperty(`${pre}-contrast-aa`, dark ? '#ffffff' : '#000000');
      el.style.setProperty(`${pre}-contrast-aaa`, dark ? '#ffffff' : '#000000');
    }
  }

  /**
   * 切换主题
   */
  function switchTheme(theme: ThemeConfig) {
    currentTheme.value = { ...theme };
    setThemeColor(theme.color, isDark.value);
    setBodyClassName(`theme-${theme.name}`);

    // 持久化到 localStorage
    storage.set('theme', currentTheme.value);
  }

  /**
   * 更新主题颜色
   */
  function updateThemeColor(color: string) {
    currentTheme.value = {
      ...currentTheme.value,
      name: 'custom',
      label: 'theme.custom',
      color: color,
    };
    setThemeColor(color, isDark.value);

    // 持久化到 localStorage
    storage.set('theme', currentTheme.value);
  }

  /**
   * 切换暗黑模式（带动画）
   * 参考 art-design-pro：使用 setAttribute 直接设置 html class，确保样式立即生效
   */
  function toggleDark(event?: MouseEvent) {
    console.info('[ThemeStore] toggleDark 被调用', {
      currentIsDark: isDark.value,
      hasEvent: !!event,
      timestamp: new Date().toISOString()
    });
    const newDarkValue = !isDark.value;
    console.info('[ThemeStore] 计算新值', {
      newDarkValue,
      currentTheme: currentTheme.value
    });

    // 如果浏览器支持 View Transition API，使用动画
    if (event && (document as any).startViewTransition) {
      const transition = (document as any).startViewTransition(() => {
        console.info('[ThemeStore] ViewTransition 动画开始', { newDarkValue });
        isDark.value = newDarkValue;  // useDark() 会自动保存到 localStorage

        // 参考 art-design-pro：直接设置 html 元素的 class 属性
        // 使用 setAttribute 完全替换 class，确保所有 CSS 选择器立即生效
        const htmlEl = document.getElementsByTagName('html')[0];
        if (!htmlEl) return;
        const className = newDarkValue ? 'dark' : '';
        console.info('[ThemeStore] 设置 html class (动画模式)', {
          className,
          beforeClass: htmlEl.className
        });
        htmlEl.setAttribute('class', className);
        console.info('[ThemeStore] html class 设置后 (动画模式)', {
          afterClass: htmlEl.className,
          hasDark: htmlEl.classList.contains('dark')
        });

        // 先更新主题颜色 CSS 变量
        console.info('[ThemeStore] 更新主题颜色 (动画模式)', {
          color: currentTheme.value.color,
          isDark: isDark.value
        });
        setThemeColor(currentTheme.value.color, isDark.value);

        // 强制浏览器立即重新计算样式
        void htmlEl.offsetHeight;

        // 使用 nextTick 确保 Vue 响应式更新完成
        import('vue').then(({ nextTick }) => {
          nextTick(() => {
            // 再次强制样式重新计算，确保所有 CSS 变量和选择器都已更新
            void htmlEl.offsetHeight;

            // 获取菜单文本颜色信息
            const getMenuTextColor = () => {
              try {
                const menuEl = document.querySelector('.sidebar__menu, .el-menu') as HTMLElement;
                if (menuEl) {
                  const cssVarColor = getComputedStyle(menuEl).getPropertyValue('--el-menu-text-color').trim();
                  const menuItem = menuEl.querySelector('.el-menu-item:not(.is-active)') as HTMLElement;
                  const computedColor = menuItem ? getComputedStyle(menuItem).color : null;
                  return {
                    cssVar: cssVarColor || '未设置',
                    computed: computedColor || '未找到菜单项',
                    menuElement: !!menuEl
                  };
                }
                return { cssVar: '未找到菜单元素', computed: null, menuElement: false };
              } catch (e) {
                return { error: String(e) };
              }
            };

            const menuColorInfo = getMenuTextColor();

            console.info('[ThemeStore] nextTick 回调 (动画模式)', {
              isDark: isDark.value,
              htmlHasDark: htmlEl.classList.contains('dark'),
              menuTextColor: menuColorInfo
            });

            // 触发自定义事件，通知组件强制更新
            window.dispatchEvent(new CustomEvent('theme-changed', {
              detail: { isDark: newDarkValue }
            }));
          });
        });
      });

      transition.ready.then(() => {
        const x = event.clientX;
        const y = event.clientY;
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );

        const clipPath = [
          `circle(0 at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];

        document.documentElement.animate(
          {
            clipPath: newDarkValue ? clipPath.reverse() : clipPath
          },
          {
            duration: 400,
            easing: 'ease-in-out',
            pseudoElement: newDarkValue
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)'
          }
        );
      });
    } else {
      // 不支持动画，直接切换
      console.info('[ThemeStore] 无动画模式，直接切换');
      isDark.value = newDarkValue;  // useDark() 会自动保存到 localStorage

      // 参考 art-design-pro：直接设置 html 元素的 class 属性
      // 使用 setAttribute 完全替换 class，确保所有 CSS 选择器立即生效
      const htmlEl = document.getElementsByTagName('html')[0];
      if (!htmlEl) return;
      const className = newDarkValue ? 'dark' : '';
      console.info('[ThemeStore] 设置 html class (无动画模式)', {
        className,
        beforeClass: htmlEl.className
      });
      htmlEl.setAttribute('class', className);
      console.info('[ThemeStore] html class 设置后 (无动画模式)', {
        afterClass: htmlEl.className,
        hasDark: htmlEl.classList.contains('dark')
      });

      // 先更新主题颜色 CSS 变量
      console.info('[ThemeStore] 更新主题颜色 (无动画模式)', {
        color: currentTheme.value.color,
        isDark: isDark.value
      });
      setThemeColor(currentTheme.value.color, isDark.value);

      // 强制浏览器立即重新计算样式
      void htmlEl.offsetHeight;

      // 使用 nextTick 确保 Vue 响应式更新完成
      nextTick(() => {
        // 再次强制样式重新计算，确保所有 CSS 变量和选择器都已更新
        void htmlEl.offsetHeight;

        // 获取菜单文本颜色信息
        const getMenuTextColor = () => {
          try {
            const menuEl = document.querySelector('.sidebar__menu, .el-menu') as HTMLElement;
            if (menuEl) {
              const cssVarColor = getComputedStyle(menuEl).getPropertyValue('--el-menu-text-color').trim();
              const menuItem = menuEl.querySelector('.el-menu-item:not(.is-active)') as HTMLElement;
              const computedColor = menuItem ? getComputedStyle(menuItem).color : null;
              return {
                cssVar: cssVarColor || '未设置',
                computed: computedColor || '未找到菜单项',
                menuElement: !!menuEl
              };
            }
            return { cssVar: '未找到菜单元素', computed: null, menuElement: false };
          } catch (e) {
            return { error: String(e) };
          }
        };

        const menuColorInfo = getMenuTextColor();

        console.info('[ThemeStore] nextTick 回调 (无动画模式)', {
          isDark: isDark.value,
          htmlHasDark: htmlEl.classList.contains('dark'),
          menuTextColor: menuColorInfo
        });

        // 触发自定义事件，通知组件强制更新
        window.dispatchEvent(new CustomEvent('theme-changed', {
          detail: { isDark: newDarkValue }
        }));
      });
    }

    // 触发主题切换事件，让 useSettingsState 同步更新 systemThemeType
    // 使用 CustomEvent 避免直接依赖应用层代码
    try {
      const SystemThemeEnum = {
        LIGHT: 'light',
        DARK: 'dark',
        AUTO: 'auto',
      };
      const newTheme = newDarkValue ? SystemThemeEnum.DARK : SystemThemeEnum.LIGHT;
      console.info('[ThemeStore] 触发 theme-toggle 事件', {
        newTheme,
        isDark: newDarkValue
      });
      window.dispatchEvent(new CustomEvent('theme-toggle', {
        detail: { theme: newTheme, isDark: newDarkValue }
      }));
    } catch (e) {
      logger.error('[ThemeStore] 触发 theme-toggle 事件失败', e);
    }

    // 获取菜单文本颜色信息
    const getMenuTextColor = () => {
      try {
        const menuEl = document.querySelector('.sidebar__menu, .el-menu') as HTMLElement;
        if (menuEl) {
          const cssVarColor = getComputedStyle(menuEl).getPropertyValue('--el-menu-text-color').trim();
          const menuItem = menuEl.querySelector('.el-menu-item:not(.is-active)') as HTMLElement;
          const computedColor = menuItem ? getComputedStyle(menuItem).color : null;
          return {
            cssVar: cssVarColor || '未设置',
            computed: computedColor || '未找到菜单项',
            menuElement: !!menuEl
          };
        }
        return { cssVar: '未找到菜单元素', computed: null, menuElement: false };
      } catch (e) {
        return { error: String(e) };
      }
    };

    const finalMenuColorInfo = getMenuTextColor();

    console.info('[ThemeStore] toggleDark 完成', {
      finalIsDark: isDark.value,
      htmlHasDark: document.documentElement.classList.contains('dark'),
      finalMenuTextColor: finalMenuColorInfo,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 初始化主题
   */
  function initTheme() {

    // useDark() 会自动处理 dark class，但我们需要应用主题色
    setThemeColor(currentTheme.value.color, isDark.value);
    setBodyClassName(`theme-${currentTheme.value.name}`);
  }

  // 初始化主题
  initTheme();

  return {
    currentTheme,
    isDark,
    color,
    THEME_PRESETS,
    switchTheme,
    toggleDark,
    setThemeColor,
    updateThemeColor,
  };
});

