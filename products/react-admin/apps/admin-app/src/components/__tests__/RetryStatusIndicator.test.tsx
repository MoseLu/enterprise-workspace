/**
 * RetryStatusIndicator 组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RetryStatusIndicator from '../RetryStatusIndicator';

describe('RetryStatusIndicator', () => {
  it('renders status indicator', () => {
    render(<RetryStatusIndicator status="idle" />);
    expect(screen.getByTestId('retry-status')).toBeInTheDocument();
  });

  it('shows idle status correctly', () => {
    render(<RetryStatusIndicator status="idle" />);
    expect(screen.getByText(/就绪/)).toBeInTheDocument();
  });

  it('shows loading status correctly', () => {
    render(<RetryStatusIndicator status="loading" />);
    expect(screen.getByText(/加载中/)).toBeInTheDocument();
  });

  it('shows error status with retry button', () => {
    render(<RetryStatusIndicator status="error" onRetry={vi.fn()} />);
    expect(screen.getByText(/错误/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /重试/ })).toBeInTheDocument();
  });

  it('shows success status correctly', () => {
    render(<RetryStatusIndicator status="success" />);
    expect(screen.getByText(/成功/)).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    const handleRetry = vi.fn();
    render(<RetryStatusIndicator status="error" onRetry={handleRetry} />);
    fireEvent.click(screen.getByRole('button', { name: /重试/ }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
