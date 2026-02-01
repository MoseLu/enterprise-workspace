/**
 * Auth Config 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAuthConfig,
  updateAuthConfig,
  resetAuthConfig,
  defaultAuthConfig
} from '../config';

describe('Auth Config', () => {
  beforeEach(() => {
    // 每次测试前重置配置
    resetAuthConfig();
  });

  describe('getAuthConfig', () => {
    it('应该返回默认配置', () => {
      const config = getAuthConfig();
      
      expect(config).toBeDefined();
      expect(config.name).toBe('auth');
      expect(config.version).toBe('1.0.0');
    });

    it('应该包含所有必需的配置项', () => {
      const config = getAuthConfig();
      
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('features');
      expect(config).toHaveProperty('security');
      expect(config).toHaveProperty('validation');
      expect(config).toHaveProperty('sms');
      expect(config).toHaveProperty('qrCode');
      expect(config).toHaveProperty('routes');
    });
  });

  describe('updateAuthConfig', () => {
    it('应该成功更新顶级配置', () => {
      updateAuthConfig({
        version: '2.0.0',
        author: 'New Author'
      });

      const config = getAuthConfig();
      expect(config.version).toBe('2.0.0');
      expect(config.author).toBe('New Author');
    });

    it('应该成功更新嵌套配置（features）', () => {
      updateAuthConfig({
        features: {
          enableCaptcha: true,
          enableWechatLogin: true
        } as any
      });

      const config = getAuthConfig();
      expect(config.features.enableCaptcha).toBe(true);
      expect(config.features.enableWechatLogin).toBe(true);
      // 其他配置应保持不变
      expect(config.features.enableSmsLogin).toBe(true);
    });

    it('应该成功更新安全配置', () => {
      updateAuthConfig({
        security: {
          passwordMinLength: 8,
          maxLoginAttempts: 3
        } as any
      });

      const config = getAuthConfig();
      expect(config.security.passwordMinLength).toBe(8);
      expect(config.security.maxLoginAttempts).toBe(3);
      // 其他配置应保持不变
      expect(config.security.passwordMaxLength).toBe(20);
    });

    it('应该成功更新路由配置', () => {
      updateAuthConfig({
        routes: {
          afterLogin: '/dashboard'
        } as any
      });

      const config = getAuthConfig();
      expect(config.routes.afterLogin).toBe('/dashboard');
      // 其他路由应保持不变
      expect(config.routes.login).toBe('/login');
    });
  });

  describe('resetAuthConfig', () => {
    it('应该重置所有配置为默认值', () => {
      // 先修改配置
      updateAuthConfig({
        version: '2.0.0',
        features: {
          enableCaptcha: true
        } as any
      });

      // 验证配置已修改
      let config = getAuthConfig();
      expect(config.version).toBe('2.0.0');
      expect(config.features.enableCaptcha).toBe(true);

      // 重置配置
      resetAuthConfig();

      // 验证配置已重置
      config = getAuthConfig();
      expect(config.version).toBe('1.0.0');
      expect(config.features.enableCaptcha).toBe(false);
    });
  });

  describe('默认配置验证', () => {
    it('功能开关配置应该合理', () => {
      const config = getAuthConfig();
      
      expect(config.features.enableRememberMe).toBe(true);
      expect(config.features.enableSmsLogin).toBe(true);
      expect(config.features.enableQrLogin).toBe(true);
      expect(config.features.enableCaptcha).toBe(false); // 默认禁用
      expect(config.features.enableWechatLogin).toBe(false); // 待开发
    });

    it('安全配置应该符合标准', () => {
      const config = getAuthConfig();
      
      expect(config.security.passwordMinLength).toBeGreaterThanOrEqual(6);
      expect(config.security.passwordMaxLength).toBeLessThanOrEqual(50);
      expect(config.security.maxLoginAttempts).toBeGreaterThan(0);
      expect(config.security.sessionTimeout).toBeGreaterThan(0);
    });

    it('验证配置应该正确', () => {
      const config = getAuthConfig();
      
      expect(config.validation.phoneRegex).toBeInstanceOf(RegExp);
      expect(config.validation.emailRegex).toBeInstanceOf(RegExp);
      expect(config.validation.usernameMinLength).toBeGreaterThan(0);
    });

    it('短信配置应该合理', () => {
      const config = getAuthConfig();
      
      expect(config.sms.codeLength).toBe(6);
      expect(config.sms.cooldownSeconds).toBeGreaterThan(0);
      expect(config.sms.resendLimit).toBeGreaterThan(0);
    });

    it('路由配置应该完整', () => {
      const config = getAuthConfig();
      
      expect(config.routes.login).toBeDefined();
      expect(config.routes.register).toBeDefined();
      expect(config.routes.forgotPassword).toBeDefined();
      expect(config.routes.afterLogin).toBeDefined();
      expect(config.routes.afterLogout).toBeDefined();
    });
  });
});
