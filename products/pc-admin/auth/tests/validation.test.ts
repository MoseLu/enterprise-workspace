/**
 * 验证工具函数单元测试
 */

import { describe, it, expect } from 'vitest';
import { getAuthConfig } from '../config';

describe('Validation Utils', () => {
  const config = getAuthConfig();

  describe('手机号验证', () => {
    const phoneRegex = config.validation.phoneRegex;

    it('应该验证通过有效的手机号', () => {
      const validPhones = [
        '13800138000',
        '15912345678',
        '17600000000',
        '18888888888',
        '19999999999'
      ];

      validPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(true);
      });
    });

    it('应该拒绝无效的手机号', () => {
      const invalidPhones = [
        '1234567890',      // 不以 1 开头
        '10012345678',     // 第二位是 0
        '12012345678',     // 第二位是 2
        '138001380',       // 少于 11 位
        '138001380000',    // 多于 11 位
        'abcdefghijk',     // 非数字
        ''                 // 空字符串
      ];

      invalidPhones.forEach(phone => {
        expect(phoneRegex.test(phone)).toBe(false);
      });
    });
  });

  describe('邮箱验证', () => {
    const emailRegex = config.validation.emailRegex;

    it('应该验证通过有效的邮箱', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'admin@btc-saas.com',
        'info_123@test.org'
      ];

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('应该拒绝无效的邮箱', () => {
      const invalidEmails = [
        'invalid',           // 无 @
        '@example.com',      // 无用户名
        'user@',             // 无域名
        'user @example.com', // 包含空格
        'user@.com',         // 域名无效
        ''                   // 空字符串
      ];

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('用户名长度验证', () => {
    const { usernameMinLength, usernameMaxLength } = config.validation;

    it('应该定义合理的长度范围', () => {
      expect(usernameMinLength).toBeGreaterThan(0);
      expect(usernameMaxLength).toBeGreaterThan(usernameMinLength);
      expect(usernameMaxLength).toBeLessThanOrEqual(50);
    });

    it('应该验证通过有效长度的用户名', () => {
      const validUsername = 'a'.repeat(usernameMinLength);
      expect(validUsername.length).toBeGreaterThanOrEqual(usernameMinLength);
      expect(validUsername.length).toBeLessThanOrEqual(usernameMaxLength);
    });
  });

  describe('密码强度验证', () => {
    const { passwordMinLength, passwordMaxLength } = config.security;

    it('应该定义合理的密码长度', () => {
      expect(passwordMinLength).toBeGreaterThanOrEqual(6);
      expect(passwordMaxLength).toBeGreaterThan(passwordMinLength);
    });

    it('最小长度应该符合安全标准', () => {
      // 密码最小长度应该至少为 6
      expect(passwordMinLength).toBeGreaterThanOrEqual(6);
    });
  });

  describe('短信验证码配置', () => {
    const { codeLength, cooldownSeconds, resendLimit } = config.sms;

    it('验证码长度应该合理', () => {
      expect(codeLength).toBeGreaterThanOrEqual(4);
      expect(codeLength).toBeLessThanOrEqual(8);
    });

    it('冷却时间应该合理', () => {
      expect(cooldownSeconds).toBeGreaterThanOrEqual(30);
      expect(cooldownSeconds).toBeLessThanOrEqual(120);
    });

    it('重发限制应该合理', () => {
      expect(resendLimit).toBeGreaterThan(0);
      expect(resendLimit).toBeLessThanOrEqual(10);
    });
  });
});
