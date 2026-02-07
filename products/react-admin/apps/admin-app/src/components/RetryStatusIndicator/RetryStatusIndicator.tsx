/**
 * RetryStatusIndicator Component
 *
 * Network retry status indicator that displays real-time HTTP retry status.
 *
 * Migrated from Vue3 Element Plus to React + Ant Design
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Tooltip } from 'antd';
import styles from './RetryStatusIndicator.module.css';

export interface RetryStatus {
  /** Number of retries attempted */
  retryCount: number;
  /** Whether currently retrying */
  isRetrying: boolean;
  /** Last error message */
  lastError: string | null;
  /** Delay before next retry (ms) */
  nextRetryDelay: number;
}

export interface RetryStatusIndicatorProps {
  /** Custom class name */
  className?: string;
  /** Retry status fetcher function */
  getRetryStatus?: () => RetryStatus;
  /** Check interval in milliseconds (default: 2000) */
  checkInterval?: number;
  /** Maximum retries for tooltip display */
  maxRetries?: number;
}

/**
 * RetryStatusIndicator - Network retry status indicator
 *
 * Displays a colored dot indicator that shows the current retry status:
 * - Green: Normal (hidden by default)
 * - Yellow: Warning (has retry history)
 * - Blue: Retrying (active retry in progress)
 *
 * @example
 * ```tsx
 * <RetryStatusIndicator
 *   getRetryStatus={() => http.getRetryStatus()}
 * />
 * ```
 */
export const RetryStatusIndicator: React.FC<RetryStatusIndicatorProps> = ({
  className = '',
  getRetryStatus,
  checkInterval = 2000,
  maxRetries = 3,
}) => {
  const [retryStatus, setRetryStatus] = useState<RetryStatus>({
    retryCount: 0,
    isRetrying: false,
    lastError: null,
    nextRetryDelay: 0,
  });
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // If no custom getter is provided, check if there's a global http object
    const fetchRetryStatus = (): RetryStatus => {
      if (getRetryStatus) {
        return getRetryStatus();
      }

      // Try to get from global window object (set by the HTTP module)
      if (typeof window !== 'undefined') {
        const globalHttp = (window as unknown as { http?: { getRetryStatus?: () => RetryStatus } }).http;
        if (globalHttp?.getRetryStatus) {
          return globalHttp.getRetryStatus();
        }
      }

      // Default status
      return {
        retryCount: 0,
        isRetrying: false,
        lastError: null,
        nextRetryDelay: 0,
      };
    };

    const checkStatus = () => {
      const status = fetchRetryStatus();
      setRetryStatus(status);

      // Only show indicator when retrying or has retry history
      setShowIndicator(status.isRetrying || status.retryCount > 0);
    };

    // Initial check
    checkStatus();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkStatus, checkInterval);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [getRetryStatus, checkInterval]);

  const statusClass = useMemo(() => {
    if (retryStatus.isRetrying) {
      return 'retrying';
    }
    if (retryStatus.retryCount > 0) {
      return 'warning';
    }
    return 'normal';
  }, [retryStatus.isRetrying, retryStatus.retryCount]);

  const tooltipContent = useMemo(() => {
    if (retryStatus.isRetrying) {
      return `重试中 (${retryStatus.retryCount}/${maxRetries}, 延迟: ${retryStatus.nextRetryDelay}ms)`;
    }
    if (retryStatus.retryCount > 0) {
      return `重试失败 (${retryStatus.retryCount}/${maxRetries}次)`;
    }
    return '网络正常';
  }, [retryStatus, maxRetries]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div className={`${styles.indicator} ${className}`}>
      <Tooltip title={tooltipContent} placement="bottom">
        <div className={`${styles.statusDot} ${styles[statusClass]}`} />
      </Tooltip>
    </div>
  );
};

RetryStatusIndicator.displayName = 'RetryStatusIndicator';

export default RetryStatusIndicator;
