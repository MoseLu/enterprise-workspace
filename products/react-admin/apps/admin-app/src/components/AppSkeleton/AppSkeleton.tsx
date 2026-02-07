/**
 * AppSkeleton Component
 *
 * Loading skeleton component for displaying placeholder content during loading.
 *
 * Migrated from Vue3 Element Plus to React + Ant Design
 */

import React from 'react';
import { Skeleton } from 'antd';
import type { SkeletonProps } from 'antd';
import styles from './AppSkeleton.module.css';

export interface AppSkeletonProps extends Omit<SkeletonProps, 'loading'> {
  /** Loading state - shows skeleton when true, children when false */
  loading?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * AppSkeleton - A simple loading skeleton component
 *
 * Displays a header and body skeleton layout similar to the original Vue component.
 *
 * @example
 * ```tsx
 * <AppSkeleton loading={isLoading}>
 *   <ActualContent />
 * </AppSkeleton>
 * ```
 */
export const AppSkeleton: React.FC<AppSkeletonProps> = ({
  loading = true,
  className = '',
  children,
  ...props
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className={`${styles.skeleton} ${className}`}>
      <Skeleton
        active
        avatar={false}
        title={{ width: '40%' }}
        paragraph={{ rows: 3, width: ['100%', '100%', '60%'] }}
        {...props}
      />
    </div>
  );
};

AppSkeleton.displayName = 'AppSkeleton';

export default AppSkeleton;
