/**
 * BtcConfigFormItem Component
 *
 * Individual form item component for configuration forms.
 *
 * Migrated from Vue3 Element Plus to React + Ant Design
 */

import React, { useMemo } from 'react';
import styles from './BtcConfigFormItem.module.css';
import { useBtcConfigForm } from './BtcConfigForm';

export interface BtcConfigFormItemProps {
  /** Label text */
  label?: string;
  /** Form property name */
  prop?: string;
  /** Custom label width */
  labelWidth?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Child elements (form controls) */
  children?: React.ReactNode;
  /** Whether to use compact mode */
  compact?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * BtcConfigFormItem - Configuration form item
 *
 * Renders a label and content area for form controls.
 *
 * @example
 * ```tsx
 * <BtcConfigFormItem label="Username" required error={errors.username}>
 *   <Input />
 * </BtcConfigFormItem>
 * ```
 */
export const BtcConfigFormItem: React.FC<BtcConfigFormItemProps> = ({
  label = '',
  prop = '',
  labelWidth = '',
  required = false,
  error = '',
  children,
  compact = false,
  className = '',
}) => {
  const configContext = useBtcConfigForm();

  const labelStyle = useMemo(() => {
    const width = labelWidth || configContext.labelWidth;
    return {
      width,
      minWidth: width,
    };
  }, [labelWidth, configContext.labelWidth]);

  return (
    <div
      className={`
        ${styles.formItem}
        ${required ? styles.required : ''}
        ${error ? styles.error : ''}
        ${compact ? styles.compact : ''}
        ${className}
      `}
    >
      {label && (
        <div className={styles.label} style={labelStyle}>
          <span className={styles.labelText}>
            {required && <span className={styles.asterisk}>*</span>}
            {label}
          </span>
        </div>
      )}

      <div className={styles.content}>
        {children}
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
};

BtcConfigFormItem.displayName = 'BtcConfigFormItem';

export default BtcConfigFormItem;
