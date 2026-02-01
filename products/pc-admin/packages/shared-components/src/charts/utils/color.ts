/**
 * 颜色处理工具函数
 */

/**
 * 将十六进制颜色转换为RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

/**
 * 将RGB转换为十六进制
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * 调整颜色透明度
 */
export function rgba(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }
  }
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${alpha})`);
  }
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
  }
  return color;
}

/**
 * 颜色变亮
 */
export function lighten(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = Math.min(255, rgb.r + amount);
  const g = Math.min(255, rgb.g + amount);
  const b = Math.min(255, rgb.b + amount);
  
  return rgbToHex(r, g, b);
}

/**
 * 颜色变暗
 */
export function darken(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = Math.max(0, rgb.r - amount);
  const g = Math.max(0, rgb.g - amount);
  const b = Math.max(0, rgb.b - amount);
  
  return rgbToHex(r, g, b);
}

/**
 * 获取默认颜色数组
 */
export function getDefaultColors(): string[] {
  return [
    '#409eff', // 蓝色
    '#67c23a', // 绿色
    '#e6a23c', // 橙色
    '#f56c6c', // 红色
    '#909399', // 灰色
    '#c71585', // 紫红色
    '#ff6347', // 番茄红
    '#40e0d0'  // 青色
  ];
}

/**
 * 根据索引获取颜色
 */
export function getColorByIndex(index: number, colors?: string[]): string {
  const defaultColors = colors || getDefaultColors();
  const color = defaultColors[index % defaultColors.length];
  return color ?? '#409eff'; // 默认颜色
}

