/**
 * Playwright E2E 测试配置
 *
 * 配置 Playwright 测试环境
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // 测试目录
  testDir: './tests',

  // 完全并行执行
  fullyParallel: true,

  // CI 环境配置
  forbidOnly: !!process.env.CI,

  // 重试次数
  retries: process.env.CI ? 2 : 0,

  // 并行 workers
  workers: process.env.CI ? 1 : undefined,

  // 报告器
  reporter: 'html',

  // 全局测试超时
  timeout: 30000,

  // expect timeout
  expect: {
    timeout: 5000,
  },

  // 共享上下文超时
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3000',

    // 跟踪选项
    trace: 'on-first-retry',

    // 截图
    screenshot: 'only-on-failure',

    // 视频
    video: 'retain-on-failure',

    // 忽略 HTTPS 错误
    ignoreHTTPSErrors: true,

    // 模拟移动设备
    isMobile: false,
  },

  // 项目配置
  projects: [
    // Chrome (桌面)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // 视口
        viewport: { width: 1280, height: 720 },
      },
    },

    // Firefox
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // Safari
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // 移动设备 Chrome
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    // 移动设备 Safari
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],

  // Web 服务器配置
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // 输出目录
  outputDir: './test-results/',

  // 依赖配置
  dependencies: ['install'],
});
