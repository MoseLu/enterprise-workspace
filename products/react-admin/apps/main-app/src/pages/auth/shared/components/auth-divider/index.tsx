import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

/**
 * 认证页面分隔线组件
 *
 * 显示带有流动箭头动画的分隔线，用于第三方登录分隔
 */
export const AuthDivider: React.FC = () => {
  const dividerRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);
  const [leftArrowCount, setLeftArrowCount] = useState(3);
  const [rightArrowCount, setRightArrowCount] = useState(3);

  // 计算箭头数量
  const calculateArrowCount = useCallback(() => {
    if (!leftLineRef.current || !rightLineRef.current) return;

    // 箭头的基础宽度（更密集的间距）
    const arrowWidth = 16; // 12px图标 + 4px间距
    const minSpacing = 4; // 最小间距

    // 获取每侧可用宽度
    const leftWidth = leftLineRef.current.offsetWidth;
    const rightWidth = rightLineRef.current.offsetWidth;

    // 计算每侧可以放置的箭头数量
    const leftCount = Math.max(2, Math.floor((leftWidth - minSpacing) / arrowWidth));
    const rightCount = Math.max(2, Math.floor((rightWidth - minSpacing) / arrowWidth));

    setLeftArrowCount(Math.min(leftCount, 12)); // 最多12个箭头
    setRightArrowCount(Math.min(rightCount, 12));
  }, []);

  // 监听窗口大小变化
  const handleResize = useCallback(() => {
    calculateArrowCount();
  }, [calculateArrowCount]);

  useEffect(() => {
    // 初始化计算
    const timer = setTimeout(() => {
      calculateArrowCount();
    }, 0);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [calculateArrowCount, handleResize]);

  return (
    <div className={styles.divider} ref={dividerRef}>
      <div className={`${styles.dividerLine} ${styles.leftArrows}`} ref={leftLineRef}>
        {Array.from({ length: leftArrowCount }).map((_, n) => (
          <RightOutlined
            key={`left-${n + 1}`}
            className={styles.arrow}
            style={{ animationDelay: `${n * 0.2}s` }}
          />
        ))}
      </div>
      <span className={styles.dividerText}>
        {/* 国际化翻译占位，实际使用请替换为真实翻译key */}
        {'其他登录方式'}
      </span>
      <div className={`${styles.dividerLine} ${styles.rightArrows}`} ref={rightLineRef}>
        {Array.from({ length: rightArrowCount }).map((_, n) => (
          <LeftOutlined
            key={`right-${n + 1}`}
            className={styles.arrow}
            style={{ animationDelay: `${n * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default AuthDivider;
