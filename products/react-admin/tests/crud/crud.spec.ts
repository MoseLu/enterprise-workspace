/**
 * CRUD 操作 E2E 测试
 *
 * 测试增删改查核心流程
 */

import { test, expect } from '@playwright/test';

test.describe('CRUD 操作', () => {
  test.beforeEach(async ({ page }) => {
    // 登录并导航到管理页面
    await page.goto('/admin-app');
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('Admin@123456');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/home/);
  });

  test('列表页面加载正确', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('用户管理');

    // 验证表格存在
    await expect(page.locator('table')).toBeVisible();

    // 验证搜索框
    await expect(page.locator('input[placeholder*="搜索"]')).toBeVisible();

    // 验证新增按钮
    await expect(page.locator('button:has-text("新增")')).toBeVisible();
  });

  test('搜索功能', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 输入搜索关键词
    await page.locator('input[placeholder*="搜索"]').fill('testuser');

    // 验证搜索结果
    await expect(page.locator('table')).toContainText('testuser');
  });

  test('新增用户', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 点击新增按钮
    await page.locator('button:has-text("新增")').click();

    // 验证弹窗显示
    await expect(page.locator('dialog')).toBeVisible();
    await expect(page.locator('h2')).toContainText('新增用户');

    // 填写表单
    await page.locator('input[name="username"]').fill('newtestuser');
    await page.locator('input[name="email"]').fill('new@test.com');
    await page.locator('input[name="phone"]').fill('13800138000');
    await page.locator('select[name="role"]').selectOption('admin');

    // 提交表单
    await page.locator('button:has-text("确定")').click();

    // 验证成功提示
    await expect(page.locator('text=操作成功')).toBeVisible();
    await expect(page.locator('table')).toContainText('newtestuser');
  });

  test('编辑用户', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 点击编辑按钮
    await page.locator('button[aria-label="编辑"]').first().click();

    // 验证弹窗显示
    await expect(page.locator('dialog')).toBeVisible();
    await expect(page.locator('h2')).toContainText('编辑用户');

    // 修改用户名
    const usernameInput = page.locator('input[name="username"]');
    await usernameInput.clear();
    await usernameInput.fill('updateduser');

    // 提交表单
    await page.locator('button:has-text("保存")').click();

    // 验证成功提示
    await expect(page.locator('text=操作成功')).toBeVisible();
  });

  test('删除用户', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 点击删除按钮
    await page.locator('button[aria-label="删除"]').first().click();

    // 验证确认弹窗
    await expect(page.locator('text=确定要删除吗')).toBeVisible();

    // 确认删除
    await page.locator('button:has-text("确定")').click();

    // 验证成功提示
    await expect(page.locator('text=删除成功')).toBeVisible();
  });

  test('分页功能', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 验证分页组件存在
    await expect(page.locator('.pagination')).toBeVisible();

    // 点击下一页
    await page.locator('button[aria-label="下一页"]').click();

    // 验证 URL 或页面内容变化
    await expect(page.locator('.pagination')).toContainText('2');
  });

  test('批量操作', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 勾选复选框
    await page.locator('input[type="checkbox"]').first().click();

    // 验证批量操作按钮显示
    await expect(page.locator('button:has-text("批量删除")')).toBeVisible();
    await expect(page.locator('button:has-text("批量导出")')).toBeVisible();
  });
});

test.describe('表单验证', () => {
  test('必填字段验证', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    // 点击新增按钮
    await page.locator('button:has-text("新增")').click();

    // 不填写任何内容直接提交
    await page.locator('button:has-text("确定")').click();

    // 验证必填字段错误提示
    await expect(page.locator('text=用户名不能为空')).toBeVisible();
    await expect(page.locator('text=邮箱不能为空')).toBeVisible();
  });

  test('邮箱格式验证', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("新增")').click();

    // 输入无效邮箱
    await page.locator('input[name="email"]').fill('invalid-email');

    // 离开焦点
    await page.locator('input[name="username"]').click();

    // 验证邮箱格式错误
    await expect(page.locator('text=邮箱格式不正确')).toBeVisible();
  });

  test('手机号格式验证', async ({ page }) => {
    await page.goto('/admin-app/users');
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("新增")').click();

    // 输入无效手机号
    await page.locator('input[name="phone"]').fill('123');

    // 离开焦点
    await page.locator('input[name="username"]').click();

    // 验证手机号格式错误
    await expect(page.locator('text=手机号格式不正确')).toBeVisible();
  });
});
