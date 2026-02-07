/**
 * Login 页面单元测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../pages/index/index';

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders username input', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/用户名/)).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/密码/)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /登录/ })).toBeInTheDocument();
  });

  it('shows error on empty submit', async () => {
    const mockSubmit = vi.fn();
    render(<LoginPage onSubmit={mockSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /登录/ }));
    expect(await screen.findByText(/请输入用户名/)).toBeInTheDocument();
  });
});
