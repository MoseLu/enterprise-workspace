/**
 * Footer 组件单元测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders footer element', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders company info', () => {
    render(<Footer />);
    expect(screen.getByText(/企业工作空间/)).toBeInTheDocument();
  });

  it('renders version info', () => {
    render(<Footer />);
    expect(screen.getByText(/v1\.0/)).toBeInTheDocument();
  });
});
