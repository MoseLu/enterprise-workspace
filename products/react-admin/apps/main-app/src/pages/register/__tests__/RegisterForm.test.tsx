/**
 * Register 页面单元测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RegisterPage from '../pages/index/index';

describe('Register Page', () => {
  it('renders register form', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('renders username input', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/请输入用户名/)).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/请输入邮箱/)).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/请输入密码/)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<RegisterPage />);
    fireEvent.input(screen.getByPlaceholderText(/请输入邮箱/), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /注册/ }));
    expect(await screen.findByText(/邮箱格式不正确/)).toBeInTheDocument();
  });
});
