import { storage } from '../../../../utils';
import type { ThemeConfig } from '../../../composables/useTheme';
import { THEME_PRESETS } from '../../../composables/useTheme';

/**
 * 主题数据迁移：将旧的硬编码标签转换为国际化键值
 */
export function migrateThemeConfig(): ThemeConfig {
  const savedTheme = storage.get('theme');

  // 默认主题（现在是 cool-admin 蓝色）
  let migratedTheme: ThemeConfig = THEME_PRESETS[0]!;

  if (savedTheme && typeof savedTheme === 'object' && savedTheme !== null) {
    // 检查是否是旧格式（硬编码中文或英文标签）
    const oldLabels = [
      'Default',
      'Green',
      'Purple',
      'Orange',
      'Pink',
      'Mint',
      'Custom',
      'Brand Red',
      'Brand Gray',
      '默认',
      '绿色',
      '紫色',
      '橙色',
      '粉色',
      '薄荷绿',
      '拜里斯品牌红',
      '拜里斯品牌灰',
      '蓝色',
    ];
    if (
      'label' in savedTheme &&
      typeof savedTheme.label === 'string' &&
      oldLabels.includes(savedTheme.label)
    ) {
      // 根据颜色匹配对应的新主题配置
      // 如果匹配到已删除的主题（如 pink），则回退到默认主题
      const matchedPreset = THEME_PRESETS.find(
        (preset) => preset.color === (savedTheme as any).color
      );
      if (matchedPreset) {
        migratedTheme = matchedPreset;
      } else if ((savedTheme as any).name === 'pink' || (savedTheme as any).color === '#FF69B4') {
        // 粉色主题已删除，回退到默认主题
        migratedTheme = THEME_PRESETS[0]!;
      } else if ((savedTheme as any).name === 'custom') {
        // 自定义主题
        migratedTheme = {
          name: 'custom',
          label: 'theme.presets.custom',
          color: (savedTheme as any).color,
        };
      }
      // 保存迁移后的配置到统一的 settings 存储中（同步到 Cookie）
      const currentSettings = (storage.get('settings') as Record<string, any>) || {};
      storage.set('settings', { ...currentSettings, theme: migratedTheme });
    } else {
      // 已经是新格式，直接使用
      const themeConfig = savedTheme as ThemeConfig | null;
      if (themeConfig) {
        migratedTheme = themeConfig;
      }
    }
  }

  return migratedTheme;
}

