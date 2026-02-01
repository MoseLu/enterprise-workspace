/**
 * CSS变量获取工具
 */

/**
 * 获取CSS变量值
 */
export function getCssVar(varName: string, element?: HTMLElement): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const el = element || document.documentElement;
  const value = getComputedStyle(el).getPropertyValue(varName).trim();
  return value || '';
}

/**
 * 将 RGB/RGBA 颜色字符串转换为 HEX 格式
 */
function rgbToHex(rgb: string): string {
  // 匹配 rgb(r, g, b) 或 rgba(r, g, b, a) 格式
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (!match || !match[1] || !match[2] || !match[3]) {
    return rgb; // 如果不是 RGB 格式，直接返回原值
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  // 转换为 HEX
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * 获取CSS变量的计算后的颜色值（HEX格式）
 * 通过创建一个临时元素来获取实际计算后的颜色值
 * 注意：此函数获取的是当前主题下的颜色值
 */
export function getCssVarColor(varName: string, element?: HTMLElement): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  const el = element || document.documentElement;

  // 创建一个临时元素来获取计算后的颜色值
  const tempEl = document.createElement('div');
  tempEl.style.position = 'absolute';
  tempEl.style.visibility = 'hidden';
  tempEl.style.pointerEvents = 'none';
  tempEl.style.color = `var(${varName})`;

  // 将临时元素添加到DOM中（需要添加到body才能计算样式）
  document.body.appendChild(tempEl);

  // 强制浏览器重新计算样式（确保临时元素能获取到正确的主题样式）
  // 多次触发重排，确保样式已完全更新
  void tempEl.offsetHeight;
  void tempEl.offsetHeight;
  void tempEl.offsetHeight;

  // 获取计算后的颜色值（通常是 RGB 格式，如 "rgb(48, 49, 51)"）
  const computedColor = getComputedStyle(tempEl).color;

  // 移除临时元素
  document.body.removeChild(tempEl);

  // 如果获取到的是有效颜色值（rgb或rgba格式），转换为 HEX
  if (computedColor && computedColor !== 'transparent' && computedColor !== 'rgba(0, 0, 0, 0)') {
    // 如果是 RGB 格式，转换为 HEX
    if (computedColor.startsWith('rgb')) {
      return rgbToHex(computedColor);
    }
    // 如果已经是 HEX 格式，直接返回
    return computedColor;
  }

  // 如果获取失败，回退到直接获取CSS变量值
  const value = getComputedStyle(el).getPropertyValue(varName).trim();

  // 如果已经是 HEX 格式，直接返回；否则尝试转换
  if (value.startsWith('#')) {
    return value;
  }
  // 如果值是 RGB 格式，转换为 HEX
  if (value.startsWith('rgb')) {
    return rgbToHex(value);
  }
  return value || '';
}

/**
 * 获取指定主题下的CSS变量颜色值（HEX格式）
 * 通过临时切换主题来获取目标主题的颜色值
 */
export function getCssVarColorForTheme(varName: string, isDark: boolean): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return isDark ? '#e5eaf3' : '#303133';
  }

  const html = document.documentElement;
  const hadDarkClass = html.classList.contains('dark');
  let color: string;

  // 如果当前主题就是目标主题，直接获取
  if (isDark === hadDarkClass) {
    color = getCssVarColor(varName);
  } else {
    // 需要临时切换主题来获取目标主题的颜色
    if (isDark) {
      // 需要深色主题的颜色，临时添加 dark 类
      html.classList.add('dark');
      void html.offsetHeight; // 触发重排
      void html.offsetHeight; // 再次触发重排，确保 CSS 变量已更新
      // 使用 requestAnimationFrame 确保样式已更新
      // 但这是同步函数，不能使用异步，所以使用多次 offsetHeight
      void html.offsetHeight;
      color = getCssVarColor(varName);
      // 恢复原始主题
      html.classList.remove('dark');
      void html.offsetHeight;
    } else {
      // 需要浅色主题的颜色，临时移除 dark 类
      html.classList.remove('dark');
      void html.offsetHeight; // 触发重排
      void html.offsetHeight; // 再次触发重排，确保 CSS 变量已更新
      void html.offsetHeight;
      color = getCssVarColor(varName);
      // 恢复原始主题
      html.classList.add('dark');
      void html.offsetHeight;
    }
  }

  // 如果获取失败，使用默认值
  if (!color || color.trim() === '') {
    const defaultValue = isDark ? '#e5eaf3' : '#303133';
    return defaultValue;
  }

  return color;
}

/**
 * 获取主题颜色
 */
export function getThemeColors() {
  if (typeof document === 'undefined') {
    return {
      textColor: '#303133',
      textColorSecondary: '#606266',
      textColorPlaceholder: '#a8abb2',
      borderColor: '#dcdfe6',
      borderColorLight: '#e4e7ed',
      borderColorLighter: '#ebeef5',
      bgColor: '#ffffff',
      bgColorPage: '#f2f3f5',
      primary: '#409eff',
      primaryLight1: '#53a8ff',
      primaryLight2: '#66b1ff',
      primaryLight3: '#79bbff',
      primaryLight4: '#8cc5ff',
      primaryLight5: '#a0cfff',
      primaryLight6: '#b3d8ff',
      primaryLight7: '#c6e2ff',
      primaryLight8: '#d9ecff',
      primaryLight9: '#ecf5ff',
      dark: {
        textColor: '#e5eaf3',
        textColorSecondary: '#a8abb2',
        borderColor: '#4c4d4f',
        bgColor: '#1d1e1f',
        bgColorPage: '#000000'
      }
    };
  }

  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  // 获取当前主题的文字颜色
  const textColorPrimary = getCssVar('--el-text-color-primary') || (isDark ? '#e5eaf3' : '#303133');
  const textColorRegular = getCssVar('--el-text-color-regular') || (isDark ? '#a8abb2' : '#606266');

  // 获取深色主题的文字颜色（临时切换主题获取）
  let darkTextColor = '#e5eaf3';
  let darkTextColorSecondary = '#a8abb2';
  let darkBorderColor = '#4c4d4f';
  let darkBgColor = '#1d1e1f';
  let darkBgColorPage = '#000000';

  if (!isDark) {
    // 当前是浅色主题，临时切换到深色主题获取深色主题的颜色
    html.classList.add('dark');
    void html.offsetHeight; // 触发重排
    darkTextColor = getCssVar('--el-text-color-primary') || '#e5eaf3';
    darkTextColorSecondary = getCssVar('--el-text-color-regular') || '#a8abb2';
    darkBorderColor = getCssVar('--el-border-color') || '#4c4d4f';
    darkBgColor = getCssVar('--el-bg-color') || '#1d1e1f';
    darkBgColorPage = getCssVar('--el-bg-color-page') || '#000000';
    html.classList.remove('dark');
    void html.offsetHeight; // 恢复
  } else {
    // 当前是深色主题，直接获取
    darkTextColor = getCssVar('--el-text-color-primary') || '#e5eaf3';
    darkTextColorSecondary = getCssVar('--el-text-color-regular') || '#a8abb2';
    darkBorderColor = getCssVar('--el-border-color') || '#4c4d4f';
    darkBgColor = getCssVar('--el-bg-color') || '#1d1e1f';
    darkBgColorPage = getCssVar('--el-bg-color-page') || '#000000';
  }

  return {
    // 文本颜色 - 当前主题的文字颜色
    textColor: textColorPrimary,
    // 次要文本颜色
    textColorSecondary: textColorRegular,
    textColorPlaceholder: getCssVar('--el-text-color-placeholder') || '#a8abb2',

    // 边框颜色
    borderColor: getCssVar('--el-border-color') || (isDark ? '#4c4d4f' : '#dcdfe6'),
    borderColorLight: getCssVar('--el-border-color-light') || (isDark ? '#4c4d4f' : '#e4e7ed'),
    borderColorLighter: getCssVar('--el-border-color-lighter') || (isDark ? '#4c4d4f' : '#ebeef5'),

    // 背景颜色
    bgColor: getCssVar('--el-bg-color') || (isDark ? '#1d1e1f' : '#ffffff'),
    bgColorPage: getCssVar('--el-bg-color-page') || (isDark ? '#000000' : '#f2f3f5'),

    // 主题色
    primary: getCssVar('--el-color-primary') || '#409eff',
    primaryLight1: getCssVar('--el-color-primary-light-1') || '#53a8ff',
    primaryLight2: getCssVar('--el-color-primary-light-2') || '#66b1ff',
    primaryLight3: getCssVar('--el-color-primary-light-3') || '#79bbff',
    primaryLight4: getCssVar('--el-color-primary-light-4') || '#8cc5ff',
    primaryLight5: getCssVar('--el-color-primary-light-5') || '#a0cfff',
    primaryLight6: getCssVar('--el-color-primary-light-6') || '#b3d8ff',
    primaryLight7: getCssVar('--el-color-primary-light-7') || '#c6e2ff',
    primaryLight8: getCssVar('--el-color-primary-light-8') || '#d9ecff',
    primaryLight9: getCssVar('--el-color-primary-light-9') || '#ecf5ff',

    // 暗色模式下的颜色（始终返回深色主题的颜色，无论当前主题是什么）
    dark: {
      textColor: darkTextColor,
      textColorSecondary: darkTextColorSecondary,
      borderColor: darkBorderColor,
      bgColor: darkBgColor,
      bgColorPage: darkBgColorPage
    }
  };
}

