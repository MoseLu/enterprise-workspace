/**
 * AppSkeleton 组件单元测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AppSkeleton from '../AppSkeleton';

describe('AppSkeleton', () => {
  it('renders skeleton container', () => {
    render(<AppSkeleton />);
    expect(screen.getByTestId('app-skeleton')).toBeInTheDocument();
  });

  it('renders avatar skeleton', () => {
    render(<AppSkeleton />);
    expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument();
  });

  it('renders title skeleton', () => {
    render(<AppSkeleton />);
    expect(screen.getByTestId('skeleton-title')).toBeInTheDocument();
  });

  it('renders paragraph skeleton', () => {
    render(<AppSkeleton />);
    expect(screen.getByTestId('skeleton-paragraph')).toBeInTheDocument();
  });
});
