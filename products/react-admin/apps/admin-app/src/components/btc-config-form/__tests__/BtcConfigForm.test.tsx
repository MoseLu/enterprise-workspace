/**
 * BtcConfigForm 组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BtcConfigForm from '../BtcConfigForm';
import { BtcConfig } from '../types';

const mockConfig: BtcConfig = {
  appId: 'test-app-id',
  appSecret: 'test-app-secret',
  merchantId: 'test-merchant-id',
  notifyUrl: 'https://test.com/notify',
  signType: 'MD5',
  version: '1.0',
};

describe('BtcConfigForm', () => {
  it('renders form elements', () => {
    render(<BtcConfigForm config={mockConfig} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/应用ID/)).toBeInTheDocument();
    expect(screen.getByLabelText(/应用密钥/)).toBeInTheDocument();
    expect(screen.getByLabelText(/商户ID/)).toBeInTheDocument();
  });

  it('displays current config values', () => {
    render(<BtcConfigForm config={mockConfig} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/应用ID/)).toHaveValue('test-app-id');
    expect(screen.getByLabelText(/商户ID/)).toHaveValue('test-merchant-id');
  });

  it('calls onChange when value changed', () => {
    const handleChange = vi.fn();
    render(<BtcConfigForm config={mockConfig} onChange={handleChange} />);

    fireEvent.change(screen.getByLabelText(/应用ID/), {
      target: { value: 'new-app-id' },
    });

    expect(handleChange).toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const emptyConfig: BtcConfig = {
      appId: '',
      appSecret: '',
      merchantId: '',
      notifyUrl: '',
      signType: 'MD5',
      version: '1.0',
    };

    render(<BtcConfigForm config={emptyConfig} onChange={vi.fn()} />);
    expect(screen.getByText(/应用ID不能为空/)).toBeInTheDocument();
  });
});
