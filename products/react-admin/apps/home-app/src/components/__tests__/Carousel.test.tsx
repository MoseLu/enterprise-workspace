/**
 * Carousel 组件单元测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Carousel from '../Carousel';

describe('Carousel Component', () => {
  it('renders carousel container', () => {
    render(<Carousel />);
    expect(screen.getByTestId('carousel-container')).toBeInTheDocument();
  });

  it('renders carousel content', () => {
    render(<Carousel />);
    expect(screen.getByText(/欢迎来到/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Carousel className="custom-carousel" />);
    expect(screen.getByTestId('carousel-container')).toHaveClass('custom-carousel');
  });
});
