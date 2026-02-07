/**
 * 登录流程 E2E 测试
 *
 * 测试用户登录、注册、忘记密码等认证流程
 */

import { test, expect } from '@playwright/test';

test.describe('登录流程', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页面
    await page.goto('/main-app/login');
  });

  test('登录页面加载正确', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/登录/);

    // 验证登录表单存在
    await expect(page.locator('form')).toBeVisible();

    // 验证用户名输入框
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 验证密码输入框
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // 验证登录按钮
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('空表单提交显示错误', async ({ page }) => {
    // 点击登录按钮而不填写表单
    await page.locator('button[type="submit"]').click();

    // 验证错误提示
    await expect(page.locator('text=请输入用户名')).toBeVisible();
    await expect(page.locator('text=请输入密码')).toBeVisible();
  });

  test('无效用户名格式显示错误', async ({ page }) => {
    // 输入无效用户名
    await page.locator('input[name="username"]').fill('ab');

    // 点击登录按钮
    await page.locator('button[type="submit"]').click();

    // 验证错误提示
    await expect(page.locator('text=用户名至少4个字符')).toBeVisible();
  });

  test('登录成功跳转到首页', async ({ page }) => {
    // 填写有效的登录信息
    await page.locator('input[name="username"]').fill('testuser');
    await page.locator('input[name="password"]').fill('Test@123456');

    // 点击登录按钮
    await page.locator('button[type="submit"]').click();

    // 验证跳转到首页
    await expect(page).toHaveURL(/home-app/);

    // 验证首页内容
    await expect(page.locator('text=欢迎回来')).toBeVisible();
  });

  test('记住我功能', async ({ page }) => {
    // 验证记住我复选框
    await expect(page.locator('text=记住我')).toBeVisible();

    // 勾选记住我
    await page.locator('text=记住我').click();

    // 验证已勾选
    await expect(page.locator('input[name="remember"]')).toBeChecked();
  });
});

test.describe('注册流程', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到注册页面
    await page.goto('/main-app/register');
  });

  test('注册页面加载正确', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('注册');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  });

  test('密码不匹配显示错误', async ({ page }) => {
    await page.locator('input[name="password"]').fill('Test@123456');
    await page.locator('input[name="confirmPassword"]').fill('Different@123');

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=两次输入的密码不一致')).toBeVisible();
  });

  test('注册成功后跳转到登录页', async ({ page }) => {
    await page.locator('input[name="username"]').fill('newuser');
    await page.locator('input[name="email"]').fill('new@test.com');
    await page.locator('input[name="password"]').fill('Test@123456');
    await page.locator('input[name="confirmPassword"]').fill('Test@123456');

    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=注册成功')).toBeVisible();
  });
});
