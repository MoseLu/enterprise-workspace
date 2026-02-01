/**
 * 颜色对比度计算工具
 * 基于 WCAG 2.1 标准的相对亮度（Relative Luminance）算法
 */

/**
 * 将十六进制颜色转换为 RGB 数组
 */
function hexToRgb(hex: string): [number, number, number] {
  if (!hex.startsWith('#') || hex.length !== 7) {
    throw new Error(`Invalid hex color format: ${hex}. Expected format: #RRGGBB`);
  }

  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    throw new Error(`Failed to parse hex color: ${hex}`);
  }

  return [r, g, b];
}

/**
 * 计算相对亮度（Relative Luminance）
 * 根据 WCAG 2.1 标准：https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255;
    // 对于 sRGB 颜色空间，需要先进行 gamma 校正
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  // 使用标准权重计算相对亮度
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * 计算两个颜色之间的对比度
 * 根据 WCAG 2.1 标准：https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 * 
 * @param color1 第一个颜色（十六进制格式，如 #RRGGBB）
 * @param color2 第二个颜色（十六进制格式，如 #RRGGBB）
 * @returns 对比度比值（1:1 到 21:1）
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  // 对比度公式：(L1 + 0.05) / (L2 + 0.05)
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 将 RGB 数组转换为十六进制颜色
 */
function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map((val) => {
    const clamped = Math.max(0, Math.min(255, Math.round(val)));
    const hex = clamped.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  });
  return `#${r}${g}${b}`;
}

/**
 * 将 RGB 转换为 HSL
 */
function rgbToHsl(rgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = rgb.map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * 将 HSL 转换为 RGB
 */
function hslToRgb(hsl: [number, number, number]): [number, number, number] {
  const [h, s, l] = hsl;
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  let r, g, b;

  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ] as [number, number, number];
}

/**
 * 调整颜色的亮度以增加对比度（保持色系特征）
 * 
 * @param color 基础颜色（十六进制格式）
 * @param targetContrast 目标对比度（如 4.5 表示 4.5:1）
 * @param backgroundColor 背景颜色（十六进制格式，默认白色 #ffffff）
 * @param maxIterations 最大迭代次数（默认 200）
 * @param forceDifferent 是否强制生成不同的颜色（即使原色已满足对比度要求）
 * @returns 满足对比度要求的颜色（保持原色系）
 */
export function generateContrastColor(
  color: string,
  targetContrast: number,
  backgroundColor: string = '#ffffff',
  maxIterations: number = 200,
  forceDifferent: boolean = false
): string {
  const baseRgb = hexToRgb(color);
  const bgRgb = hexToRgb(backgroundColor);
  const bgLuminance = getRelativeLuminance(bgRgb);

  // 判断背景是亮色还是暗色
  const isLightBackground = bgLuminance > 0.5;

  // 转换为 HSL，保持色相和饱和度
  const [h, s, baseL] = rgbToHsl(baseRgb);

  // 计算当前对比度
  let currentL = baseL;
  let currentRgb = hslToRgb([h, s, currentL]);
  let currentContrast = getContrastRatio(rgbToHex(currentRgb), backgroundColor);

  // 如果已经满足对比度要求，且不需要强制生成不同颜色，直接返回
  if (currentContrast >= targetContrast && !forceDifferent) {
    return rgbToHex(currentRgb);
  }
  
  // 如果需要强制生成不同颜色，即使已满足对比度也要继续调整
  if (currentContrast >= targetContrast && forceDifferent) {
    // 强制调整亮度，确保生成明显不同的颜色
    // 亮色背景需要变暗，暗色背景需要变亮
    const minLuminanceDiff = 20; // 最小亮度差异
    if (isLightBackground) {
      currentL = Math.max(0, baseL - minLuminanceDiff);
    } else {
      currentL = Math.min(100, baseL + minLuminanceDiff);
    }
    currentRgb = hslToRgb([h, s, currentL]);
    currentContrast = getContrastRatio(rgbToHex(currentRgb), backgroundColor);
  }

  // 确定调整方向：亮色背景需要变暗，暗色背景需要变亮
  const targetL = isLightBackground ? 0 : 100; // 目标亮度：亮色背景→暗色，暗色背景→亮色
  const step = isLightBackground ? -1 : 1; // 调整步长

  // 迭代调整亮度，保持色相和饱和度不变
  let iterations = 0;
  while (currentContrast < targetContrast && iterations < maxIterations) {
    // 调整亮度
    currentL = Math.max(0, Math.min(100, currentL + step));
    
    // 转换为 RGB
    currentRgb = hslToRgb([h, s, currentL]);
    
    // 计算新的对比度
    currentContrast = getContrastRatio(rgbToHex(currentRgb), backgroundColor);

    iterations++;

    // 如果已经达到边界（0 或 100），停止迭代
    if ((isLightBackground && currentL <= 0) || (!isLightBackground && currentL >= 100)) {
      break;
    }
  }

  // 如果仍未达到目标对比度，尝试调整饱和度来增加对比度
  if (currentContrast < targetContrast && s > 0) {
    let currentS = s;
    const saturationStep = isLightBackground ? -2 : 2; // 暗色可以降低饱和度，亮色可以增加饱和度
    
    while (currentContrast < targetContrast && currentS >= 0 && currentS <= 100 && iterations < maxIterations) {
      currentS = Math.max(0, Math.min(100, currentS + saturationStep));
      currentRgb = hslToRgb([h, currentS, currentL]);
      currentContrast = getContrastRatio(rgbToHex(currentRgb), backgroundColor);
      iterations++;
    }
  }

  return rgbToHex(currentRgb);
}

/**
 * 生成高对比度颜色变体（保持色系特征）
 * 
 * @param primaryColor 主色（十六进制格式）
 * @param isDark 是否为暗色主题
 * @returns 包含各种对比度变体的对象
 */
export function generateContrastVariants(
  primaryColor: string,
  isDark: boolean = false
): {
  contrastLight: string;  // 用于深色背景的高对比度浅色（保持色系）
  contrastDark: string;   // 用于浅色背景的高对比度深色（保持色系）
  contrastAA: string;     // 满足 WCAG AA 级（4.5:1，保持色系）
  contrastAAA: string;    // 满足 WCAG AAA 级（7:1，保持色系）
} {
  try {
    // 验证输入颜色格式
    if (!primaryColor || typeof primaryColor !== 'string') {
      throw new Error(`Invalid primaryColor: ${primaryColor}`);
    }
    
    if (!primaryColor.startsWith('#') || primaryColor.length !== 7) {
      throw new Error(`Invalid hex color format: ${primaryColor}. Expected format: #RRGGBB`);
    }
    
    const lightBackground = '#ffffff';
    const darkBackground = '#131313';
    const background = isDark ? darkBackground : lightBackground;

    // 获取主色的 HSL 值
    const baseRgb = hexToRgb(primaryColor);
    const [h, s, l] = rgbToHsl(baseRgb);

  // contrastLight: 用于深色背景的高对比度浅色
  // 始终生成一个明显更亮的版本（保持色相），确保在深色背景上有足够的对比度
  let contrastLight: string;
  if (l < 50) {
    // 主色较暗，生成浅色版本（目标对比度 4.5:1）
    contrastLight = generateContrastColor(primaryColor, 4.5, darkBackground);
    // 如果生成的颜色和主色太接近，强制生成更亮的版本
    const lightRgb = hslToRgb([h, s, Math.min(100, l + 40)]);
    const lightColor = rgbToHex(lightRgb);
    const lightContrast = getContrastRatio(lightColor, darkBackground);
    // 如果强制生成的版本对比度也满足要求，且更亮，则使用它
    if (lightContrast >= 4.5 && getRelativeLuminance(hexToRgb(lightColor)) > getRelativeLuminance(hexToRgb(contrastLight))) {
      contrastLight = lightColor;
    }
  } else {
    // 主色已经较亮，生成更亮的版本（至少亮度 +30）
    const lightRgb = hslToRgb([h, Math.max(0, s - 10), Math.min(100, l + 30)]);
    contrastLight = rgbToHex(lightRgb);
    // 确保对比度满足要求
    const lightContrast = getContrastRatio(contrastLight, darkBackground);
    if (lightContrast < 4.5) {
      contrastLight = generateContrastColor(contrastLight, 4.5, darkBackground);
    }
  }

  // contrastDark: 用于浅色背景的高对比度深色
  // 始终生成一个明显更暗的版本（保持色相），确保在浅色背景上有足够的对比度
  let contrastDark: string;
  if (l > 50) {
    // 主色较亮，生成深色版本（目标对比度 4.5:1）
    contrastDark = generateContrastColor(primaryColor, 4.5, lightBackground);
    // 如果生成的颜色和主色太接近，强制生成更暗的版本
    const darkRgb = hslToRgb([h, s, Math.max(0, l - 40)]);
    const darkColor = rgbToHex(darkRgb);
    const darkContrast = getContrastRatio(darkColor, lightBackground);
    // 如果强制生成的版本对比度也满足要求，且更暗，则使用它
    if (darkContrast >= 4.5 && getRelativeLuminance(hexToRgb(darkColor)) < getRelativeLuminance(hexToRgb(contrastDark))) {
      contrastDark = darkColor;
    }
  } else {
    // 主色已经较暗，生成更暗的版本（至少亮度 -30）
    const darkRgb = hslToRgb([h, Math.max(0, s - 10), Math.max(0, l - 30)]);
    contrastDark = rgbToHex(darkRgb);
    // 确保对比度满足要求
    const darkContrast = getContrastRatio(contrastDark, lightBackground);
    if (darkContrast < 4.5) {
      contrastDark = generateContrastColor(contrastDark, 4.5, lightBackground);
    }
  }

  // contrastAA: 满足 WCAG AA 级（4.5:1）
  // 始终生成一个明显不同的版本（即使主色已满足对比度）
  const currentContrast = getContrastRatio(primaryColor, background);
  let contrastAA: string;
  if (currentContrast >= 4.5) {
    // 主色已经满足 AA，强制生成一个对比度更高的版本（目标 5.5:1，且强制不同）
    contrastAA = generateContrastColor(primaryColor, 5.5, background, 200, true);
  } else {
    contrastAA = generateContrastColor(primaryColor, 4.5, background);
  }

  // contrastAAA: 满足 WCAG AAA 级（7:1）
  // 始终生成一个明显不同的版本（即使主色已满足对比度）
  let contrastAAA: string;
  if (currentContrast >= 7.0) {
    // 主色已经满足 AAA，强制生成一个对比度更高的版本（目标 8.0:1，且强制不同）
    contrastAAA = generateContrastColor(primaryColor, 8.0, background, 200, true);
  } else {
    contrastAAA = generateContrastColor(primaryColor, 7.0, background);
  }

    const result = {
      contrastLight,
      contrastDark,
      contrastAA,
      contrastAAA,
    };
    
    return result;
  } catch (error) {
    // 返回安全的默认值
    const defaultLight = isDark ? '#ffffff' : '#000000';
    const defaultDark = isDark ? '#ffffff' : '#000000';
    
    const fallback = {
      contrastLight: defaultLight,
      contrastDark: defaultDark,
      contrastAA: defaultDark,
      contrastAAA: defaultDark,
    };
    
    return fallback;
  }
}
