/**
 * SectionTitle Component
 * Enterprise Workspace - React User Setting Shared Components
 *
 * Section title with decorative lines on both sides.
 */

import React from 'react';
import styles from './SectionTitle.module.css';

export interface SectionTitleProps {
  /**
   * The title text to display
   */
  title: string;
  /**
   * Optional inline styles for the title
   */
  style?: React.CSSProperties;
}

/**
 * SectionTitle - Displays a centered section title with decorative lines
 *
 * @example
 * <SectionTitle title="账户设置" />
 * <SectionTitle title="安全设置" style={{ color: '#1890ff' }} />
 */
export const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  style,
}) => {
  return (
    <p className={styles.sectionTitle} style={style}>
      {title}
    </p>
  );
};

export default SectionTitle;
