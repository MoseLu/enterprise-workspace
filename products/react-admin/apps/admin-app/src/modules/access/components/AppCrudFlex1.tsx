/**
 * AppCrudFlex1 - Flex Spacer Component
 * React Admin - Access Control Module
 *
 * A flex spacer component that takes up remaining space.
 */

import React from 'react';

interface AppCrudFlex1Props {
  className?: string;
}

export const AppCrudFlex1: React.FC<AppCrudFlex1Props> & {
  displayName: string;
} = ({ className }) => {
  return <div className={`crud-flex-1 ${className || ''}`} style={{ flex: 1 }} />;
};

AppCrudFlex1.displayName = 'AppCrudFlex1';

export default AppCrudFlex1;
