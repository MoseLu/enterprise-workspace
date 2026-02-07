/**
 * 导航菜单 E2E 测试
 *
 * 测试侧边栏导航、面包屑、页面跳转等
 */

import { test, expect } from '@playwright/test';

test.describe('导航菜单', () => {
  test.beforeEach(async ({ page }) => {
    // 登录后导航到 admin-app
    await page.goto('/admin-app');
    await page.waitForLoadState('networkidle');
  });

  test('侧边栏显示正确', async ({ page }) => {
    // 验证侧边栏存在
    await expect(page.locator('aside')).toBeVisible();

    // 验证菜单项
    await expect(page.locator('text=首页')).toBeVisible();
    await expect(page.locator('text=运维')).toBeVisible();
    await expect(page.locator('text=组织')).toBeVisible();
    await expect(page.locator('text=权限')).toBeVisible();
  });

  test('点击菜单项跳转到对应页面', async ({ page }) => {
    // 点击运维菜单
    await page.locator('text=运维').click();

    // 验证 URL 变化
    await expect(page).toHaveURL(/ops/);

    // 验证页面内容
    await expect(page.locator('h1')).toContainText('运维');
  });

  test('面包屑导航显示正确', async ({ page }) => {
    // 导航到某个页面
    await page.locator('text=权限').click();

    // 验证面包屑
    await expect(page.locator('.breadcrumb')).toBeVisible();
    await expect(page.locator('.breadcrumb')).toContainText('首页');
    await expect(page.locator('.breadcrumb')).toContainText('权限');
  });

  test('展开/收起子菜单', async ({ page }) => {
    // 找到有子菜单的菜单项
    const parentMenu = page.locator('text=系统管理').first();

    // 验证子菜单初始隐藏
    await expect(page.locator('text=用户管理')).not.toBeVisible();

    // 点击展开
    await parentMenu.click();

    // 验证子菜单显示
    await expect(page.locator('text=用户管理')).toBeVisible();
    await expect(page.locator('text=角色管理')).toBeVisible();
  });

  test('搜索功能', async ({ page }) => {
    // 聚焦搜索框
    await page.locator('input[placeholder*="搜索"]').click();

    // 输入搜索关键词
    await page.locator('input[placeholder*="搜索"]').fill('用户');

    // 验证搜索结果
    await expect(page.locator('text=用户管理')).toBeVisible();
  });

  test('移动端菜单折叠', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 812 });

    // 验证移动端菜单按钮
    await expect(page.locator('button[aria-label*="菜单"]')).toBeVisible();

    // 点击菜单按钮
    await page.locator('button[aria-label*="菜单"]').click();

    // 验证侧边栏显示
    await expect(page.locator('aside')).toBeVisible();
  });
});
