/**
 * 布局组件单元测试
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { Sidebar } from '../Sidebar';
import { Topbar } from '../Topbar';
import { Breadcrumb } from '../Breadcrumb';

describe('Layout Components', () => {
  describe('Header', () => {
    it('renders without crashing', () => {
      render(<Header />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('renders without crashing', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('renders navigation menu', () => {
      render(<Sidebar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Topbar', () => {
    it('renders toolbar', () => {
      render(<Topbar />);
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
  });

  describe('Breadcrumb', () => {
    it('renders breadcrumb navigation', () => {
      render(<Breadcrumb />);
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'breadcrumb');
    });
  });
});
