/**
 * AppCrudRow - Layout Row Component
 * React Admin - Access Control Module
 *
 * A layout container component for CRUD operations.
 */

import React from 'react';
import styles from './AppCrudRow.module.css';

interface AppCrudRowProps {
  children: React.ReactNode;
  className?: string;
}

export const AppCrudRow: React.FC<AppCrudRowProps> & {
  displayName: string;
} = ({ children, className }) => {
  return (
    <div className={`${styles.row} ${className || ''}`}>
      {children}
    </div>
  );
};

AppCrudRow.displayName = 'AppCrudRow';

export default AppCrudRow;
