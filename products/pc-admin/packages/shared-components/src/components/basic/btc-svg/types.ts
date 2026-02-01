/**
 * BtcSvg 动画类型
 */
export type BtcSvgAnimation = 
  | 'rotate'      // 旋转（悬浮时旋转180度）
  | 'spin'        // 持续旋转（360度循环）
  | 'pulse'       // 脉冲（缩放动画）
  | 'grow'        // 略微变大（悬浮时放大）
  | 'bounce'      // 弹跳
  | 'shake'       // 摇晃
  | 'fade'        // 淡入淡出
  | 'flip'        // 翻转
  | false         // 无动画
  | undefined;    // 无动画

/**
 * BtcSvg 动画触发方式
 */
export type BtcSvgAnimationTrigger = 'always' | 'hover';
