import React, { useMemo } from 'react';
import styles from './index.module.scss';

export type QrToggleBtnIcon = 'qr' | 'pc';

interface QrToggleBtnProps {
  label?: string;
  icon?: QrToggleBtnIcon;
  onClick?: () => void;
}

/**
 * 二维码切换按钮组件
 *
 * 用于切换登录方式的按钮组件，支持 qr 和 pc 两种状态
 */
export const QrToggleBtn: React.FC<QrToggleBtnProps> = ({
  label = '',
  icon = 'qr',
  onClick
}) => {
  // 计算 Y 轴偏移：qr 模式(0%)，pc 模式(100%)
  const sy = useMemo(() => {
    return icon === 'pc' ? '100%' : '0%';
  }, [icon]);

  // 翻译 label，如果没有提供则使用默认文本
  const labelText = useMemo(() => {
    return label || '切换二维码登录';
  }, [label]);

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={styles.qrToggleBtn}
      role="button"
      tabIndex={0}
      aria-label={labelText}
      style={{ '--sy': sy } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.tips}>
        <span className={styles.account} />
        <span className={styles.tipsText}>{labelText}</span>
      </div>
      <div className={styles.spriteIcon} />
    </div>
  );
};

export default QrToggleBtn;
