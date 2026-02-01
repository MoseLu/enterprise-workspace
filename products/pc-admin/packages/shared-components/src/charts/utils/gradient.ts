import { rgba } from './color';

/**
 * 渐变生成工具函数
 */

/**
 * 线性渐变配置
 */
export interface LinearGradientConfig {
  /** 起始X坐标（0-1） */
  x?: number;
  /** 起始Y坐标（0-1） */
  y?: number;
  /** 结束X坐标（0-1） */
  x2?: number;
  /** 结束Y坐标（0-1） */
  y2?: number;
  /** 颜色停止点 */
  colorStops: Array<{
    offset: number; // 0-1
    color: string;
  }>;
}

/**
 * 创建线性渐变
 */
export function createLinearGradient(config: LinearGradientConfig) {
  return {
    type: 'linear' as const,
    x: config.x ?? 0,
    y: config.y ?? 0,
    x2: config.x2 ?? 0,
    y2: config.y2 ?? 1,
    colorStops: config.colorStops
  };
}

/**
 * 创建垂直渐变（从上到下）
 */
export function createVerticalGradient(
  color: string,
  startAlpha: number = 0.8,
  endAlpha: number = 0
): ReturnType<typeof createLinearGradient> {
  return createLinearGradient({
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: rgba(color, startAlpha) },
      { offset: 1, color: rgba(color, endAlpha) }
    ]
  });
}

/**
 * 创建水平渐变（从左到右）
 */
export function createHorizontalGradient(
  color: string,
  startAlpha: number = 0.8,
  endAlpha: number = 0
): ReturnType<typeof createLinearGradient> {
  return createLinearGradient({
    x: 0,
    y: 0,
    x2: 1,
    y2: 0,
    colorStops: [
      { offset: 0, color: rgba(color, startAlpha) },
      { offset: 1, color: rgba(color, endAlpha) }
    ]
  });
}

/**
 * 创建径向渐变
 */
export function createRadialGradient(
  color: string,
  startAlpha: number = 1,
  endAlpha: number = 0,
  centerX: number = 0.5,
  centerY: number = 0.5,
  radius: number = 0.5
) {
  return {
    type: 'radial' as const,
    x: centerX,
    y: centerY,
    r: radius,
    colorStops: [
      { offset: 0, color: rgba(color, startAlpha) },
      { offset: 1, color: rgba(color, endAlpha) }
    ]
  };
}

