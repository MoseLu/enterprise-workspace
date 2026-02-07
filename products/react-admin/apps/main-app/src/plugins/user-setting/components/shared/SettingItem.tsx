/**
 * SettingItem Component
 * Enterprise Workspace - React User Setting Shared Components
 *
 * Configurable setting item component supporting switch, input-number, and select types.
 */

import React, { useMemo } from 'react';
import { InputNumber, Switch, Select } from '@enterprise-workspace/frontend/shared';
import type { SwitchProps } from '@enterprise-workspace/frontend/shared';
import styles from './SettingItem.module.css';

/**
 * Option type for select dropdown
 */
export interface SettingItemOption {
  value: string | number | boolean;
  label: string;
}

/**
 * Configuration for a setting item
 */
export interface SettingItemConfig {
  /** Unique key for the setting */
  key: string;
  /** Display label */
  label: string;
  /** Type of setting control */
  type: 'switch' | 'input-number' | 'select';
  /** Handler identifier */
  handler: string;
  /** Whether to hide on mobile devices */
  mobileHide?: boolean;
  /** Minimum value for input-number */
  min?: number;
  /** Maximum value for input-number */
  max?: number;
  /** Step value for input-number */
  step?: number;
  /** Custom styles for the control */
  style?: React.CSSProperties;
  /** Position of controls for input-number */
  controlsPosition?: '' | 'right';
  /** Options for select type */
  options?: SettingItemOption[] | (() => SettingItemOption[]);
}

export interface SettingItemProps {
  /** Configuration for the setting item */
  config: SettingItemConfig;
  /** Current value */
  value: unknown;
  /** Callback when value changes */
  onChange: (value: unknown) => void;
}

/**
 * SettingItem - A configurable setting display component
 *
 * @example
 * // Switch type
 * <SettingItem
 *   config={{ key: 'enabled', label: '启用', type: 'switch', handler: 'handleToggle' }}
 *   value={isEnabled}
 *   onChange={setIsEnabled}
 * />
 *
 * @example
 * // Select type
 * <SettingItem
 *   config={{
 *     key: 'theme',
 *     label: '主题',
 *     type: 'select',
 *     handler: 'handleThemeChange',
 *     options: [
 *       { value: 'light', label: '浅色' },
 *       { value: 'dark', label: '深色' }
 *     ]
 *   }}
 *   value={theme}
 *   onChange={setTheme}
 * />
 *
 * @example
 * // Input number type
 * <SettingItem
 *   config={{
 *     key: 'quantity',
 *     label: '数量',
 *     type: 'input-number',
 *     handler: 'handleQuantityChange',
 *     min: 1,
 *     max: 100,
 *     step: 1
 *   }}
 *   value={quantity}
 *   onChange={setQuantity}
 * />
 */
export const SettingItem: React.FC<SettingItemProps> = ({
  config,
  value,
  onChange,
}) => {
  // Normalize options, handling both static arrays and getter functions
  const normalizedOptions = useMemo(() => {
    if (!config.options) return [];

    try {
      // Handle getter function
      if (typeof config.options === 'function') {
        const result = config.options();
        if (Array.isArray(result)) {
          return result.filter(
            (opt) => opt != null && 'value' in opt && 'label' in opt
          );
        }
        return [];
      }

      // Handle static array
      if (Array.isArray(config.options)) {
        return config.options.filter(
          (opt) => opt != null && 'value' in opt && 'label' in opt
        );
      }

      return [];
    } catch (error) {
      console.warn(
        `Error processing options for config: ${config.key}`,
        error
      );
      return [];
    }
  }, [config.options, config.key]);

  // Handle value change
  const handleChange = (newValue: unknown): void => {
    onChange(newValue);
  };

  // Render switch control
  if (config.type === 'switch') {
    const switchProps: SwitchProps = {
      checked: value as boolean,
      onChange: handleChange,
    };
    return (
      <div className={`${styles.settingItem} ${config.mobileHide ? styles.mobileHide : ''}`}>
        <span className={styles.label}>{config.label}</span>
        <Switch {...switchProps} />
      </div>
    );
  }

  // Render input-number control
  if (config.type === 'input-number') {
    return (
      <div className={`${styles.settingItem} ${config.mobileHide ? styles.mobileHide : ''}`}>
        <span className={styles.label}>{config.label}</span>
        <InputNumber
          value={value as number}
          min={config.min}
          max={config.max}
          step={config.step}
          style={config.style}
          controlsPosition={config.controlsPosition === 'right' ? 'right' : undefined}
          onChange={handleChange}
        />
      </div>
    );
  }

  // Render select control
  if (config.type === 'select') {
    return (
      <div className={`${styles.settingItem} ${config.mobileHide ? styles.mobileHide : ''}`}>
        <span className={styles.label}>{config.label}</span>
        <Select
          value={value}
          style={config.style}
          placeholder=""
          options={normalizedOptions}
          onChange={handleChange}
        />
      </div>
    );
  }

  // Fallback for unknown types
  return null;
};

export default SettingItem;
