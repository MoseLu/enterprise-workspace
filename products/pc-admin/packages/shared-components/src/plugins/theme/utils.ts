/**
 * 主题工具函数
 * 独立的主题颜色设置实现，不依赖 shared-core 内部实现
 */

/**
 * 设置主题颜色到 CSS 变量
 */
export function setThemeColor(color: string, dark: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // 设置主题色 CSS 变量
  root.style.setProperty('--el-color-primary', color);
  
  // 如果是暗黑模式，使用混合颜色
  if (dark) {
    // 暗黑模式下，主题色稍微调亮
    const mixedColor = mixColor(color, '#ffffff', 0.2);
    root.style.setProperty('--el-color-primary', mixedColor);
  }

  // 同步到子应用容器
  syncThemeColorToSubApps(color, dark);
}

/**
 * 同步主题色到子应用容器
 */
function syncThemeColorToSubApps(color: string, dark: boolean): void {
  if (typeof document === 'undefined') return;

  // 查找所有子应用容器
  const containers = [
    ...document.querySelectorAll('[id^="__qiankun_subapp_wrapper_for_"]'),
    ...document.querySelectorAll('.qiankun-subapp-viewport'),
  ] as HTMLElement[];

  containers.forEach((container) => {
    if (container) {
      let root: HTMLElement = container;
      if (container.shadowRoot) {
        // 如果有 shadowRoot，直接使用容器本身（主题色需要在 shadowRoot 外部设置）
        root = container;
      }
      root.style.setProperty('--el-color-primary', color);
      if (dark) {
        const mixedColor = mixColor(color, '#ffffff', 0.2);
        root.style.setProperty('--el-color-primary', mixedColor);
      }
    }
  });
}

/**
 * 颜色混合函数
 */
function mixColor(color1: string, color2: string, weight: number): string {
  weight = Math.max(Math.min(Number(weight), 1), 0);

  if (!color1.startsWith('#') || color1.length !== 7) {
    return color1;
  }
  if (!color2.startsWith('#') || color2.length !== 7) {
    return color1;
  }

  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  if (isNaN(r1) || isNaN(g1) || isNaN(b1) || isNaN(r2) || isNaN(g2) || isNaN(b2)) {
    return color1;
  }

  let r = Math.round(r1 * (1 - weight) + r2 * weight).toString(16);
  let g = Math.round(g1 * (1 - weight) + g2 * weight).toString(16);
  let b = Math.round(b1 * (1 - weight) + b2 * weight).toString(16);
  
  r = ('0' + (r || 0).toString(16)).slice(-2);
  g = ('0' + (g || 0).toString(16)).slice(-2);
  b = ('0' + (b || 0).toString(16)).slice(-2);
  
  return '#' + r + g + b;
}

