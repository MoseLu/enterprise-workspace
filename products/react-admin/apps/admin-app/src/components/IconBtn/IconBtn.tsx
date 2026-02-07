/**
 * IconBtn Component
 *
 * Icon button component for displaying compact icon buttons.
 *
 * Migrated from Vue3 Element Plus to React + Ant Design
 */

import React, { useCallback } from 'react';
import styles from './IconBtn.module.css';

export interface IconBtnProps {
  /** Click event handler */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  /** Children elements (typically icons) */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * IconBtn - A compact icon button component
 *
 * Displays a small button container for icons with hover effects.
 *
 * @example
 * ```tsx
 * <IconBtn onClick={handleClick}>
 *   <EditOutlined />
 * </IconBtn>
 * ```
 */
export const IconBtn: React.FC<IconBtnProps> = ({
  onClick,
  children,
  className = '',
  disabled = false,
}) => {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled && onClick) {
        onClick(event);
      }
    },
    [disabled, onClick]
  );

  return (
    <div
      className={`${styles.iconBtn} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={handleClick}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </div>
  );
};

IconBtn.displayName = 'IconBtn';

export default IconBtn;
