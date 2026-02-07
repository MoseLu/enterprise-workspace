/**
 * SettingHeader Component
 * Enterprise Workspace - React User Setting Shared Components
 *
 * Header component with close button for settings panel.
 */

import React, { forwardRef } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import styles from './SettingHeader.module.css';

export interface SettingHeaderProps {
  /**
   * Callback fired when close button is clicked
   */
  onClose?: () => void;
}

/**
 * SettingHeader - Header component with a close icon button
 *
 * @example
 * <SettingHeader onClose={() => setVisible(false)} />
 */
export const SettingHeader = forwardRef<HTMLDivElement, SettingHeaderProps>(
  ({ onClose }, ref) => {
    return (
      <div className={styles.settingHeader} ref={ref}>
        <div className={styles.closeWrap}>
          <button
            type="button"
            className={styles.closeIcon}
            onClick={onClose}
            aria-label="关闭"
          >
            <CloseOutlined />
          </button>
        </div>
      </div>
    );
  }
);

SettingHeader.displayName = 'SettingHeader';

export default SettingHeader;
