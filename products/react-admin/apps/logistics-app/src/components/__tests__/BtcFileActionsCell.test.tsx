/**
 * BtcFileActionsCell 组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BtcFileActionsCell from '../btc-file-actions-cell/BtcFileActionsCell';

describe('BtcFileActionsCell', () => {
  const mockFile = {
    id: '1',
    name: 'test-file.pdf',
    size: 1024,
    type: 'application/pdf',
    url: 'https://test.com/file.pdf',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  it('renders file name', () => {
    render(<BtcFileActionsCell file={mockFile} onDownload={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(<BtcFileActionsCell file={mockFile} onDownload={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /下载/ })).toBeInTheDocument();
  });

  it('renders delete button', () => {
    render(<BtcFileActionsCell file={mockFile} onDownload={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
  });

  it('calls onDownload when download clicked', () => {
    const handleDownload = vi.fn();
    render(<BtcFileActionsCell file={mockFile} onDownload={handleDownload} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /下载/ }));
    expect(handleDownload).toHaveBeenCalledWith(mockFile);
  });

  it('calls onDelete when delete clicked', () => {
    const handleDelete = vi.fn();
    render(<BtcFileActionsCell file={mockFile} onDownload={vi.fn()} onDelete={handleDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /删除/ }));
    expect(handleDelete).toHaveBeenCalledWith(mockFile);
  });

  it('shows file size correctly', () => {
    render(<BtcFileActionsCell file={mockFile} onDownload={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });
});
