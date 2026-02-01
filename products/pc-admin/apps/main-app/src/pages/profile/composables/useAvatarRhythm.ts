/**
 * 头像律动效果 Composable
 * 摇滚风格：强烈对比、急促节奏、随机爆发
 */

import { onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export function useAvatarRhythm(containerRef: Ref<HTMLElement | null>) {
  const barCount = 20; // 频谱条数量（密集更有氛围）
  const minHeight = 3; // 极低起点
  const maxHeight = 50; // 极高峰值（强烈对比）
  // const radius = 42; // 头像半径（78px / 2 + 3px padding）

  // 炫彩渐变色板（基于原渐变色）
  const gradientColors = [
    '#4F46E5', // 靛蓝
    '#EC4899', // 粉红
    '#06B6D4', // 青色
    '#818cf8', // 浅靛蓝
    '#f472b6', // 浅粉红
    '#22d3ee', // 浅青色
    '#6366f1', // 深靛蓝
    '#f43f5e', // 深粉红
    '#14b8a6'  // 深青色
  ];

  let animationFrameId: number | null = null;
  let bars: HTMLDivElement[] = [];
  let previousHeights: number[] = [];
  const baseAngles: number[] = [];
  let lastUpdateTime = 0;
  const updateInterval = 80; // 80ms 更新一次（急促节奏）

  // 添加抖动效果
  let shakeAnimationId: number | null = null;

  // 初始化频谱条（摇滚风格）
  function initBars() {
    if (!containerRef.value) return;

    // 清除已存在的条
    bars.forEach(bar => bar.remove());
    bars = [];
    previousHeights = [];

    // 创建频谱条（环形排列）
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'rhythm-bar';

      // 计算每个条的旋转角度（360° / 条数量）
      const angle = (360 / barCount) * i;
      baseAngles[i] = angle;

      // 初始高度（极低起点）
      const initialHeight = minHeight + Math.random() * 5;
      previousHeights[i] = initialHeight;

      // 设置样式 - 摇滚风格
      bar.style.position = 'absolute';
      bar.style.top = '0';
      bar.style.left = '50%';
      bar.style.width = '3px'; // 窄条更锐利
      bar.style.height = `${initialHeight}px`;
      bar.style.transformOrigin = 'bottom center';
      bar.style.transform = `translateX(-50%) rotate(${angle}deg)`;
      bar.style.borderRadius = '1px';
      bar.style.pointerEvents = 'none';
      bar.style.zIndex = '1';

      // 随机选择炫彩渐变色
      const randomColor = gradientColors[Math.floor(Math.random() * gradientColors.length)];
      // 使用炫彩渐变，保持原风格
      const hue = (angle + 135) % 360;
      bar.style.background = `linear-gradient(to top, hsla(${hue}, 80%, 50%, 0.9), ${randomColor}, hsla(${(hue + 60) % 360}, 90%, 70%, 0.8))`;

      // 暗色模式适配
      if (document.documentElement.classList.contains('dark')) {
        bar.style.background = `linear-gradient(to top, hsla(${hue}, 70%, 60%, 0.9), ${randomColor}, hsla(${(hue + 60) % 360}, 80%, 80%, 0.8))`;
      }

      // 初始发光效果
      bar.style.boxShadow = 'none';
      bar.style.opacity = '0.6';

      containerRef.value.appendChild(bar);
      bars.push(bar);
    }
  }

  // 添加轻微抖动效果（摇滚狂野感）
  function addShakeEffect() {
    if (!containerRef.value) return;

    const avatarElement = containerRef.value.querySelector('.avatar') as HTMLElement;
    if (!avatarElement) return;

    function shake() {
      const intensity = Math.random() * 1.5 - 0.75; // -0.75 到 0.75 度
      avatarElement.style.transform = `rotate(${intensity}deg)`;

      shakeAnimationId = requestAnimationFrame(shake);
    }

    shake();
  }

  // 摇滚律动核心：随机爆发+颜色突变（模拟鼓点冲击）
  function updateRhythm() {
    if (bars.length === 0) return;

    const currentTime = Date.now();

    // 控制更新频率（80ms一次，急促节奏）
    if (currentTime - lastUpdateTime < updateInterval) {
      animationFrameId = requestAnimationFrame(updateRhythm);
      return;
    }

    lastUpdateTime = currentTime;

    bars.forEach((bar, index) => {
      const angle = baseAngles[index];
      if (angle === undefined) return;

      // 摇滚律动：70%概率低，30%概率爆发到峰值（模拟鼓点）
      const isPeak = Math.random() > 0.7;
      const isSecondaryPeak = Math.random() > 0.85; // 偶尔的超高峰

      let height: number;
      if (isSecondaryPeak) {
        // 超高峰（爆发）
        height = maxHeight * (1.1 + Math.random() * 0.2);
      } else if (isPeak) {
        // 高峰
        height = maxHeight * (0.7 + Math.random() * 0.3);
      } else {
        // 低点（保持连贯性）
        const prevIndex = index === 0 ? bars.length - 1 : index - 1;
        const prevHeight = previousHeights[prevIndex] || minHeight;
        const smoothFactor = 0.3;
        const targetHeight = minHeight + Math.random() * 15;
        height = prevHeight * (1 - smoothFactor) + targetHeight * smoothFactor;
      }

      previousHeights[index] = height;

      // 更新高度
      bar.style.height = `${height}px`;

      // 使用炫彩渐变色（基于角度和随机颜色）
      const hue = (angle + 135) % 360;
      const randomColor = gradientColors[Math.floor(Math.random() * gradientColors.length)];
      bar.style.background = `linear-gradient(to top, hsla(${hue}, 80%, 50%, 0.9), ${randomColor}, hsla(${(hue + 60) % 360}, 90%, 70%, 0.8))`;

      // 暗色模式适配
      if (document.documentElement.classList.contains('dark')) {
        bar.style.background = `linear-gradient(to top, hsla(${hue}, 70%, 60%, 0.9), ${randomColor}, hsla(${(hue + 60) % 360}, 80%, 80%, 0.8))`;
      }

      // 爆发时添加荧光阴影（使用随机颜色）
      if (isPeak || isSecondaryPeak) {
        bar.style.boxShadow = `0 0 ${isSecondaryPeak ? 15 : 10}px ${randomColor}`;
        bar.style.opacity = '1';
      } else {
        bar.style.boxShadow = 'none';
        bar.style.opacity = (0.5 + (height / maxHeight) * 0.3).toString();
      }

      // 添加轻微旋转抖动（增强狂野感）
      const shake = (Math.random() - 0.5) * 2; // -1 到 1 度
      bar.style.transform = `translateX(-50%) rotate(${angle + shake}deg)`;
    });

    // 使用 requestAnimationFrame 继续更新
    animationFrameId = requestAnimationFrame(updateRhythm);
  }

  // 触发爆发律动（模拟吉他solo/鼓点爆发）
  function triggerBurst() {
    bars.forEach((bar, index) => {
      const angle = baseAngles[index];
      if (angle === undefined) return;
      const hue = (angle + 135) % 360;

      // 超峰值爆发
      const burstHeight = maxHeight * (1.2 + Math.random() * 0.3);
      bar.style.height = `${burstHeight}px`;

      // 炫彩爆发效果（使用渐变色的高亮版本）
      const burstColor = gradientColors[Math.floor(Math.random() * gradientColors.length)];
      bar.style.background = `linear-gradient(to top, hsla(${hue}, 90%, 60%, 1), ${burstColor}, hsla(${(hue + 60) % 360}, 100%, 80%, 1))`;
      bar.style.boxShadow = `0 0 20px ${burstColor}`;
      bar.style.opacity = '1';

      // 200ms后恢复
      setTimeout(() => {
        if (bars[index]) {
          const randomColor = gradientColors[Math.floor(Math.random() * gradientColors.length)];
          const currentAngle = baseAngles[index];
          if (currentAngle === undefined) return;
          const currentHue = (currentAngle + 135) % 360;
          bar.style.background = `linear-gradient(to top, hsla(${currentHue}, 80%, 50%, 0.9), ${randomColor}, hsla(${(currentHue + 60) % 360}, 90%, 70%, 0.8))`;

          // 暗色模式适配
          if (document.documentElement.classList.contains('dark')) {
            bar.style.background = `linear-gradient(to top, hsla(${currentHue}, 70%, 60%, 0.9), ${randomColor}, hsla(${(currentHue + 60) % 360}, 80%, 80%, 0.8))`;
          }
        }
      }, 200);
    });
  }

  // 开始律动效果
  function startRhythm() {
    if (animationFrameId !== null) return; // 已经启动

    initBars();
    addShakeEffect();

    if (bars.length > 0) {
      lastUpdateTime = Date.now();
      animationFrameId = requestAnimationFrame(updateRhythm);
    }

    // 点击头像触发爆发
    if (containerRef.value) {
      const avatarElement = containerRef.value.querySelector('.avatar') as HTMLElement;
      if (avatarElement) {
        avatarElement.addEventListener('click', triggerBurst);
      }
    }
  }

  // 停止律动效果
  function stopRhythm() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    if (shakeAnimationId !== null) {
      cancelAnimationFrame(shakeAnimationId);
      shakeAnimationId = null;
    }

    // 清除频谱条
    bars.forEach(bar => bar.remove());
    bars = [];
    previousHeights = [];

    // 移除点击事件
    if (containerRef.value) {
      const avatarElement = containerRef.value.querySelector('.avatar') as HTMLElement;
      if (avatarElement) {
        avatarElement.removeEventListener('click', triggerBurst);
      }
    }
  }

  // 更新颜色（响应主题切换）- 摇滚风格保持鲜艳颜色
  function updateColors() {
    // 摇滚风格不随主题切换改变颜色，保持鲜艳
    // 如果需要，可以在这里调整颜色饱和度
  }

  onMounted(() => {
    // 延迟初始化，确保 DOM 已渲染
    setTimeout(() => {
      startRhythm();
    }, 100);

    // 监听主题切换
    const observer = new MutationObserver(() => {
      updateColors();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 清理函数
    onUnmounted(() => {
      observer.disconnect();
      stopRhythm();
    });
  });

  onUnmounted(() => {
    stopRhythm();
  });

  return {
    startRhythm,
    stopRhythm,
    updateColors
  };
}

