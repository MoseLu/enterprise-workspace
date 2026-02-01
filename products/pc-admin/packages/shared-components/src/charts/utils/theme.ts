/**
 * ECharts 主题配置工具
 * 使用官方推荐的 JSON 主题文件方式
 */

import { registerTheme } from 'echarts/core';
import { getCssVar, getCssVarColor } from './css-var';
import lightTheme from '../themes/btc-light.json';
import darkTheme from '../themes/btc-dark.json';

/**
 * 将十六进制颜色转换为 RGB
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    return '64, 158, 255'; // 默认 primary 颜色
  }
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * 更新主题中的文字颜色（从 CSS 变量动态获取）
 * 使用深拷贝避免修改原始主题对象
 */
function updateThemeTextColors(theme: any, textColor: string) {
  // 深拷贝主题对象，避免修改原始 JSON
  const updatedTheme = JSON.parse(JSON.stringify(theme));

  // 更新全局文字颜色
  if (updatedTheme.textStyle) {
    updatedTheme.textStyle.color = textColor;
  }

  // 更新标题文字颜色
  if (updatedTheme.title) {
    if (updatedTheme.title.textStyle) {
      updatedTheme.title.textStyle.color = textColor;
    }
    if (updatedTheme.title.subtextStyle) {
      updatedTheme.title.subtextStyle.color = textColor;
    }
  }

  // 更新坐标轴文字颜色
  const axisTypes = ['categoryAxis', 'valueAxis', 'logAxis', 'timeAxis'];
  axisTypes.forEach(axisType => {
    if (updatedTheme[axisType]) {
      if (updatedTheme[axisType].axisLabel) {
        updatedTheme[axisType].axisLabel.color = textColor;
      }
      if (updatedTheme[axisType].nameTextStyle) {
        updatedTheme[axisType].nameTextStyle.color = textColor;
      }
    }
  });

  // 更新图例文字颜色
  if (updatedTheme.legend?.textStyle) {
    updatedTheme.legend.textStyle.color = textColor;
  }

  // 更新 dataZoom 文字颜色
  if (updatedTheme.dataZoom?.textStyle) {
    updatedTheme.dataZoom.textStyle.color = textColor;
  }

  // 更新 timeline 文字颜色
  if (updatedTheme.timeline) {
    if (updatedTheme.timeline.label) {
      updatedTheme.timeline.label.color = textColor;
    }
    if (updatedTheme.timeline.emphasis?.label) {
      updatedTheme.timeline.emphasis.label.color = textColor;
    }
  }

  // 更新 markPoint 文字颜色
  if (updatedTheme.markPoint) {
    if (updatedTheme.markPoint.label) {
      updatedTheme.markPoint.label.color = textColor;
    }
    if (updatedTheme.markPoint.emphasis?.label) {
      updatedTheme.markPoint.emphasis.label.color = textColor;
    }
  }

  // 更新 map 文字颜色
  if (updatedTheme.map) {
    if (updatedTheme.map.label) {
      updatedTheme.map.label.color = textColor;
    }
    if (updatedTheme.map.emphasis?.label) {
      updatedTheme.map.emphasis.label.color = textColor;
    }
  }

  // 更新 geo 文字颜色
  if (updatedTheme.geo) {
    if (updatedTheme.geo.label) {
      updatedTheme.geo.label.color = textColor;
    }
    if (updatedTheme.geo.emphasis?.label) {
      updatedTheme.geo.emphasis.label.color = textColor;
    }
  }

  return updatedTheme;
}

/**
 * 更新主题中的主题色（primary）相关颜色
 */
function updateThemePrimaryColors(theme: any, primary: string, primaryLight2: string, primaryLight7: string, primaryLight8: string, primaryLight9: string) {
  // 深拷贝主题对象，避免修改原始 JSON
  const updatedTheme = JSON.parse(JSON.stringify(theme));

  // 更新 candlestick
  if (updatedTheme.candlestick?.itemStyle) {
    updatedTheme.candlestick.itemStyle.color = primary;
    updatedTheme.candlestick.itemStyle.borderColor = primary;
    updatedTheme.candlestick.itemStyle.borderColor0 = primary;
  }

  // 更新 map emphasis
  if (updatedTheme.map?.emphasis?.itemStyle) {
    updatedTheme.map.emphasis.itemStyle.borderColor = primary;
    updatedTheme.map.emphasis.itemStyle.areaColor = primaryLight9;
  }

  // 更新 geo emphasis
  if (updatedTheme.geo?.emphasis?.itemStyle) {
    updatedTheme.geo.emphasis.itemStyle.borderColor = primary;
    updatedTheme.geo.emphasis.itemStyle.areaColor = primaryLight9;
  }

  // 更新 toolbox emphasis
  if (updatedTheme.toolbox?.emphasis?.iconStyle) {
    updatedTheme.toolbox.emphasis.iconStyle.borderColor = primary;
  }

  // 更新 timeline
  if (updatedTheme.timeline) {
    if (updatedTheme.timeline.itemStyle) {
      updatedTheme.timeline.itemStyle.color = primary;
    }
    if (updatedTheme.timeline.controlStyle) {
      updatedTheme.timeline.controlStyle.color = primary;
      updatedTheme.timeline.controlStyle.borderColor = primary;
    }
    if (updatedTheme.timeline.checkpointStyle) {
      updatedTheme.timeline.checkpointStyle.color = primary;
      updatedTheme.timeline.checkpointStyle.borderColor = primary;
    }
    if (updatedTheme.timeline.emphasis?.itemStyle) {
      updatedTheme.timeline.emphasis.itemStyle.color = primary;
    }
    if (updatedTheme.timeline.emphasis?.controlStyle) {
      updatedTheme.timeline.emphasis.controlStyle.color = primary;
      updatedTheme.timeline.emphasis.controlStyle.borderColor = primary;
    }
  }

  // 更新 visualMap
  if (updatedTheme.visualMap) {
    updatedTheme.visualMap.color = [primaryLight2, primaryLight8];
  }

  // 更新 dataZoom
  if (updatedTheme.dataZoom) {
    if (updatedTheme.dataZoom.selectedDataBackground?.areaStyle) {
      updatedTheme.dataZoom.selectedDataBackground.areaStyle.color = primaryLight9;
    }
    if (updatedTheme.dataZoom.selectedDataBackground?.lineStyle) {
      updatedTheme.dataZoom.selectedDataBackground.lineStyle.color = primary;
    }
    updatedTheme.dataZoom.fillerColor = `rgba(${hexToRgb(primary)}, 0.2)`;
    updatedTheme.dataZoom.handleColor = primaryLight7;
    updatedTheme.dataZoom.moveHandleColor = primaryLight7;
  }

  return updatedTheme;
}

/**
 * 获取主题对应的文字颜色
 * 根据主题类型（isDark）获取对应的文字颜色
 * 通过临时切换主题来获取正确的 CSS 变量值
 *
 * 关键改进：使用 requestAnimationFrame 确保 CSS 变量已更新
 */
function getThemeTextColor(isDark: boolean): string {
  if (typeof document === 'undefined') {
    return isDark ? '#e5eaf3' : '#303133';
  }

  const html = document.documentElement;
  const hadDarkClass = html.classList.contains('dark');
  let textColor: string;
  const defaultLightColor = '#303133';
  const defaultDarkColor = '#e5eaf3';

  // 判断当前主题类型，然后获取对应的文字颜色
  // 关键：需要为目标主题类型获取对应的文字颜色，而不是当前主题的文字颜色
  // 使用 getCssVarColor 获取计算后的实际颜色值（RGB格式）
  if (isDark) {
    // 需要深色主题的文字颜色
    if (hadDarkClass) {
      // 当前是深色主题，直接获取（已经是目标主题）
      // 但需要确保 CSS 变量已更新，使用 getComputedStyle 强制重新计算
      void html.offsetHeight; // 触发重排
      const cssValue = getCssVarColor('--el-text-color-primary');
      textColor = cssValue && cssValue.trim() ? cssValue.trim() : defaultDarkColor;
    } else {
      // 当前是浅色主题，临时切换到深色主题获取深色文字颜色
      html.classList.add('dark');
      // 强制浏览器重新计算样式（同步方式）
      void html.offsetHeight; // 触发重排，确保样式已更新
      // 再次触发重排，确保 CSS 变量已更新
      void html.offsetHeight;
      const cssValue = getCssVarColor('--el-text-color-primary');
      textColor = cssValue && cssValue.trim() ? cssValue.trim() : defaultDarkColor;
      // 立即恢复原始主题状态
      html.classList.remove('dark');
      // 再次触发重排，确保恢复
      void html.offsetHeight;
    }
  } else {
    // 需要浅色主题的文字颜色
    if (!hadDarkClass) {
      // 当前是浅色主题，直接获取（已经是目标主题）
      // 但需要确保 CSS 变量已更新，使用 getComputedStyle 强制重新计算
      void html.offsetHeight; // 触发重排
      const cssValue = getCssVarColor('--el-text-color-primary');
      textColor = cssValue && cssValue.trim() ? cssValue.trim() : defaultLightColor;
    } else {
      // 当前是深色主题，临时切换到浅色主题获取浅色文字颜色
      html.classList.remove('dark');
      // 强制浏览器重新计算样式（同步方式）
      void html.offsetHeight; // 触发重排，确保样式已更新
      // 再次触发重排，确保 CSS 变量已更新
      void html.offsetHeight;
      const cssValue = getCssVarColor('--el-text-color-primary');
      textColor = cssValue && cssValue.trim() ? cssValue.trim() : defaultLightColor;
      // 立即恢复原始主题状态
      html.classList.add('dark');
      // 再次触发重排，确保恢复
      void html.offsetHeight;
    }
  }

  return textColor;
}

/**
 * 注册自定义 ECharts 主题
 * 使用官方推荐的 JSON 主题文件方式
 *
 * 关键改进：确保在调用时 CSS 变量已完全更新
 */
export function registerEChartsThemes() {
  if (typeof document === 'undefined') {
    return;
  }

  // 强制浏览器重新计算样式，确保 CSS 变量已更新
  const html = document.documentElement;
  void html.offsetHeight; // 触发重排

  // 获取当前主题色（从 CSS 变量）
  const primary = getCssVar('--el-color-primary') || '#409eff';
  const primaryLight2 = getCssVar('--el-color-primary-light-2') || '#66b1ff';
  const primaryLight7 = getCssVar('--el-color-primary-light-7') || '#c6e2ff';
  const primaryLight8 = getCssVar('--el-color-primary-light-8') || '#d9ecff';
  const primaryLight9 = getCssVar('--el-color-primary-light-9') || '#ecf5ff';

  // 获取浅色和深色主题对应的文字颜色（从 CSS 变量动态获取）
  // 关键：确保在获取文字颜色时，CSS 变量已经更新
  const lightTextColor = getThemeTextColor(false);
  const darkTextColor = getThemeTextColor(true);

  // 更新主题中的主题色
  let lightThemeWithPrimary = updateThemePrimaryColors(lightTheme, primary, primaryLight2, primaryLight7, primaryLight8, primaryLight9);
  let darkThemeWithPrimary = updateThemePrimaryColors(darkTheme, primary, primaryLight2, primaryLight7, primaryLight8, primaryLight9);

  // 更新主题中的文字颜色（浅色主题使用浅色文字，深色主题使用深色文字）
  lightThemeWithPrimary = updateThemeTextColors(lightThemeWithPrimary, lightTextColor);
  darkThemeWithPrimary = updateThemeTextColors(darkThemeWithPrimary, darkTextColor);

  // 注册主题
  registerTheme('btc-light', lightThemeWithPrimary);
  registerTheme('btc-dark', darkThemeWithPrimary);
}
