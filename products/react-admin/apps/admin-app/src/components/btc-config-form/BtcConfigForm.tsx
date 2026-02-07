/**
 * BtcConfigForm Component
 *
 * Configuration form container component that provides context to child form items.
 *
 * Migrated from Vue3 Element Plus to React + Ant Design
 */

import React, { createContext, useContext, useMemo } from 'react';
import styles from './BtcConfigForm.module.css';

export interface BtcConfigFormContextValue {
  /** Label width */
  labelWidth: string;
  /** Form size */
  size: 'large' | 'default' | 'small';
}

export interface BtcConfigFormProps {
  /** Form model data */
  model?: Record<string, unknown>;
  /** Label width */
  labelWidth?: string;
  /** Form size */
  size?: 'large' | 'default' | 'small';
  /** Child elements */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

// Create context for form configuration
const BtcConfigFormContext = createContext<BtcConfigFormContextValue>({
  labelWidth: '80px',
  size: 'small',
});

/**
 * Use the config form context
 */
export const useBtcConfigForm = (): BtcConfigFormContextValue => {
  return useContext(BtcConfigFormContext);
};

/**
 * BtcConfigForm - Configuration form container
 *
 * Provides configuration context to child BtcConfigFormItem components.
 *
 * @example
 * ```tsx
 * <BtcConfigForm labelWidth="100px" size="small">
 *   <BtcConfigFormItem label="Name" required>
 *     <Input />
 *   </BtcConfigFormItem>
 * </BtcConfigForm>
 * ```
 */
export const BtcConfigForm: React.FC<BtcConfigFormProps> = ({
  model = {},
  labelWidth = '80px',
  size = 'small',
  children,
  className = '',
}) => {
  const contextValue = useMemo(
    () => ({
      labelWidth,
      size,
    }),
    [labelWidth, size]
  );

  return (
    <BtcConfigFormContext.Provider value={contextValue}>
      <div className={`${styles.form} ${className}`}>
        {children}
      </div>
    </BtcConfigFormContext.Provider>
  );
};

BtcConfigForm.displayName = 'BtcConfigForm';

export default BtcConfigForm;
