/**
 * Admin App 组件单元测试
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AppSkeleton } from '../AppSkeleton';
import { IconBtn } from '../IconBtn';
import { RetryStatusIndicator } from '../RetryStatusIndicator';

describe('Admin Components', () => {
  describe('AppSkeleton', () => {
    it('renders skeleton when loading', () => {
      render(
        <AppSkeleton loading={true}>
          <div>Content</div>
        </AppSkeleton>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('renders content when not loading', () => {
      render(
        <AppSkeleton loading={false}>
          <div>Content</div>
        </AppSkeleton>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('IconBtn', () => {
    it('renders icon button', () => {
      render(
        <IconBtn onClick={() => {}}>
          <span>Icon</span>
        </IconBtn>
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(
        <IconBtn onClick={handleClick}>
          <span>Icon</span>
        </IconBtn>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('RetryStatusIndicator', () => {
    it('renders retry status', async () => {
      const mockGetStatus = vi.fn().mockResolvedValue({ status: 'success' });
      render(<RetryStatusIndicator getRetryStatus={mockGetStatus} />);
      expect(mockGetStatus).toHaveBeenCalled();
    });
  });
});
