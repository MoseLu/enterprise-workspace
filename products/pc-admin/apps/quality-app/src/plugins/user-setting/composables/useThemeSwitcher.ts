/**
 * 用户设置 Composables
 * 封装用户设置相关的逻辑
 */

import { ref, computed, watch } from 'vue';
import { useI18n, useThemePlugin, type ThemeConfig } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';

/**
 * 用户设置组合式函数
 */
export function useUserSetting() {
  const { t } = useI18n();
  const theme = useThemePlugin();

  const drawerVisible = ref(false);

  // 初始化自定义颜色：如果是自定义主题则使用自定义颜色，否则为空字符串
  const savedCustomColor = theme.currentTheme.value?.name === 'custom'
    ? theme.currentTheme.value.color
    : '';
  const customColor = ref(savedCustomColor);

  // 保存打开弹窗时的原始颜色值和主题状态，用于关闭时恢复
  const originalColor = ref<string | null>(null);
  const originalTheme = ref<ThemeConfig | null>(null);

  // 标记是否已确认（确认后关闭弹窗时不再恢复）
  const isConfirmed = ref(false);

  // 自定义主题配置
  const customTheme = computed<ThemeConfig>(() => ({
    name: 'custom',
    label: 'theme.presets.custom',
    color: customColor.value || '#409eff', // 仅用于显示，实际使用时不依赖此值
  }));

  // 合并所有主题，自定义主题放在最后
  const allThemes = computed(() => {
    const currentCustomColor = theme.currentTheme.value?.name === 'custom'
      ? theme.currentTheme.value.color
      : customColor.value || '#409eff'; // 仅用于显示

    return [
      ...theme.THEME_PRESETS,
      {
        ...customTheme.value,
        color: currentCustomColor,
      },
    ];
  });

  // 监听主题变化，同步自定义颜色（仅当是自定义主题时才更新）
  watch(() => theme.currentTheme.value, (newTheme) => {
    if (newTheme && newTheme.name === 'custom') {
      customColor.value = newTheme.color;
    }
  });

  /**
   * 打开抽屉
   */
  function openDrawer() {
    drawerVisible.value = true;
    // 如果当前是自定义主题，同步自定义颜色
    if (theme.currentTheme.value?.name === 'custom') {
      customColor.value = theme.currentTheme.value.color;
    }
  }

  /**
   * 获取自定义颜色的显示值
   * 如果当前是自定义主题，显示主题颜色；否则返回空字符串（显示彩虹渐变）
   */
  const customColorDisplay = computed(() => {
    if (theme.currentTheme.value?.name === 'custom') {
      return theme.currentTheme.value.color || '';
    }
    return '';
  });

  /**
   * 判断是否是当前主题
   */
  function isCurrentTheme(themeConfig: ThemeConfig): boolean {
    const current = theme.currentTheme.value;
    if (!current) return false;

    if (themeConfig.name === 'custom') {
      return current.name === 'custom';
    }

    return themeConfig.color === current.color;
  }

  /**
   * 处理自定义主题点击（颜色选择器打开时）
   */
  function handleCustomThemeClick() {
    // 保存打开时的原始颜色值和主题状态
    originalColor.value = customColor.value || null;
    originalTheme.value = theme.currentTheme.value ? { ...theme.currentTheme.value } : null;
    isConfirmed.value = false;

    // 确保如果有当前主题颜色，同步到 customColor（用于显示在输入框中）
    if (theme.currentTheme.value?.name === 'custom' && theme.currentTheme.value.color) {
      customColor.value = theme.currentTheme.value.color;
      originalColor.value = customColor.value;
    }

    // 如果当前有自定义颜色，临时切换到自定义主题（用于预览）
    if (customColor.value) {
      theme.currentTheme.value = {
        name: 'custom',
        label: 'theme.presets.custom',
        color: customColor.value,
      };
      theme.setThemeColor(customColor.value, theme.isDark.value);
      if (document.body) {
        document.body.className = 'theme-custom';
      }
    }
  }

  /**
   * 处理预设主题点击
   */
  function handleThemeClick(themeConfig: ThemeConfig) {
    // 点击预设主题，直接切换（不改变 customColor）
    theme.switchTheme(themeConfig);
    BtcMessage.success(`${t('theme.switched')}: ${t(themeConfig.label)}`);
  }

  /**
   * 统一的主题颜色预览更新函数
   */
  function updateThemeColorPreview(color: string | null) {
    if (color !== null && color !== undefined && color !== '') {
      // 始终创建新对象以确保响应式更新
      const newTheme: ThemeConfig = {
        name: 'custom',
        label: 'theme.presets.custom',
        color: color,
      };
      // 直接替换整个 ref 的值以触发响应式更新
      theme.currentTheme.value = newTheme;
      // 更新全局主题色
      theme.setThemeColor(color, theme.isDark.value);
      if (document.body) {
        document.body.className = 'theme-custom';
      }
    }
  }

  /**
   * 处理颜色变化（点击预设颜色或输入框变化时触发）
   */
  function handleColorChange(color: string | null) {
    // 实时更新主题颜色（点击预设颜色时也需要实时更新）
    updateThemeColorPreview(color);
  }

  /**
   * 处理清空颜色
   */
  function handleClearColor() {
    customColor.value = '';
    // 清空时恢复彩虹渐变（将主题颜色设为空）
    theme.currentTheme.value = {
      name: 'custom',
      label: 'theme.presets.custom',
      color: '',
    };
  }

  /**
   * 处理确认颜色
   */
  function handleConfirmColor(color: string | null) {
    // 标记已确认，避免在 hide 时恢复
    isConfirmed.value = true;

    // 更新 customColor（即使是空字符串也要更新）
    customColor.value = color || '';

    // 如果有颜色，切换到自定义主题并保存
    if (color) {
      // 使用 switchTheme 确保所有状态都正确更新（包括 document.body.className）
      const customThemeConfig: ThemeConfig = {
        name: 'custom',
        label: 'theme.presets.custom',
        color: color,
      };
      theme.switchTheme(customThemeConfig);
      BtcMessage.success(`${t('theme.switched')}: ${t('theme.presets.custom')}`);
    }

    // 重置状态
    originalColor.value = null;
  }

  /**
   * 处理活动颜色变化（实时预览，拖拽时触发）
   */
  function handleActiveColorChange(color: string | null) {
    // 使用统一的更新函数
    updateThemeColorPreview(color);
  }

  /**
   * 处理颜色选择器关闭
   */
  function handleColorPickerHide() {
    // 如果没有确认，恢复原始状态
    if (!isConfirmed.value && originalTheme.value) {
      // 恢复 customColor 到原始值
      customColor.value = originalColor.value || '';

      // 恢复主题状态（从保存的原始主题状态恢复）
      theme.currentTheme.value = { ...originalTheme.value };
      theme.setThemeColor(originalTheme.value.color, theme.isDark.value);
      if (document.body) {
        document.body.className = `theme-${originalTheme.value.name}`;
      }
    }

    // 重置状态
    originalColor.value = null;
    originalTheme.value = null;
    isConfirmed.value = false;
  }

  /**
   * 处理暗黑模式切换
   */
  function handleDarkToggle(event?: MouseEvent) {
    theme.toggleDark(event);
  }

  return {
    drawerVisible,
    customColor,
    customColorDisplay,
    allThemes,
    isCurrentTheme,
    openDrawer,
    handleCustomThemeClick,
    handleThemeClick,
    handleColorChange,
    handleClearColor,
    handleConfirmColor,
    handleActiveColorChange,
    handleColorPickerHide,
    handleDarkToggle,
    theme,
  } as const;
}

