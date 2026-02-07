/**
 * Home App 单元测试
 *
 * 验证应用核心功能正常
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('Home App', () => {
  it('renders title correctly', () => {
    render(<App />);
    expect(screen.getByText('欢迎使用 Home 首页')).toBeInTheDocument();
  });

  it('renders source path info', () => {
    render(<App />);
    expect(screen.getByText(/products\/react-admin\/apps\/home-app/)).toBeInTheDocument();
  });

  it('renders migration status', () => {
    render(<App />);
    expect(screen.getByText(/Vue3 \+ Element Plus.*React \+ Ant Design/)).toBeInTheDocument();
  });
});
