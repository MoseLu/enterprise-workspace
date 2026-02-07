/**
 * GeometricBackground 组件单元测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GeometricBackground from '../GeometricBackground';

describe('GeometricBackground', () => {
  it('renders background container', () => {
    render(<GeometricBackground />);
    expect(screen.getByTestId('geometric-background')).toBeInTheDocument();
  });

  it('renders decorative shapes', () => {
    render(<GeometricBackground />);
    expect(screen.getByTestId('geometric-shapes')).toBeInTheDocument();
  });
});
