import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button, Input, Dropdown } from '@enterprise-workspace/frontend/shared';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import styles from './TopToolbar.module.css';

interface TopToolbarProps {
  scale: number;
  minScale: number;
  maxScale: number;
  scaleInputValue: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomCommand: (command: string) => void;
  onScaleBlur: () => void;
  onScaleEnter: () => void;
  onScaleInput: (value: string) => void;
}

export interface TopToolbarRef {
  focusInput: () => void;
}

export const TopToolbar = forwardRef<TopToolbarRef, TopToolbarProps>(
  (
    {
      scale,
      minScale,
      maxScale,
      scaleInputValue,
      onZoomIn,
      onZoomOut,
      onZoomCommand,
      onScaleBlur,
      onScaleEnter,
      onScaleInput,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(scaleInputValue);

    useEffect(() => {
      setInputValue(scaleInputValue);
    }, [scaleInputValue]);

    useImperativeHandle(
      ref,
      () => ({
        focusInput: () => {
          // Focus the input element if needed
        },
      }),
      []
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onScaleInput(value);
    };

    const handleInputBlur = () => {
      onScaleBlur();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onScaleEnter();
      }
    };

    const zoomCommands = [
      { key: 'fit', label: '适应窗口大小', icon: <FullscreenOutlined /> },
      { key: '100', label: '100%' },
      { key: '125', label: '125%' },
      { key: '150', label: '150%' },
      { key: '175', label: '175%' },
      { key: '200', label: '200%' },
      { key: '250', label: '250%' },
      { key: '300', label: '300%' },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
      onZoomCommand(key);
    };

    const menuProps = {
      items: zoomCommands.map((cmd) => ({
        key: cmd.key,
        label: cmd.label,
        icon: cmd.icon,
      })),
      onClick: handleMenuClick,
    };

    return (
      <div className={styles.zoomControls}>
        <Button
          icon={<ZoomOutOutlined />}
          onClick={onZoomOut}
          disabled={scale <= minScale}
          size="small"
          className={styles.zoomButton}
        />

        <div className={styles.zoomCenter}>
          <Dropdown {...menuProps} trigger={['click']} placement="bottom">
            <Input
              className={styles.zoomInput}
              size="small"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              suffix={<CaretDownOutlined />}
            />
          </Dropdown>
        </div>

        <Button
          icon={<ZoomInOutlined />}
          onClick={onZoomIn}
          disabled={scale >= maxScale}
          size="small"
          className={styles.zoomButton}
        />
      </div>
    );
  }
);

TopToolbar.displayName = 'TopToolbar';

export default TopToolbar;
