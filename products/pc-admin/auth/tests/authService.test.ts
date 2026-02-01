/**
 * AuthService 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../services/authService';
import type { LoginRequest, SmsLoginRequest, RegisterRequest } from '../services/authService';

// Mock request
vi.mock('/@/btc/service/request', () => ({
  request: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('登录功能', () => {
    it('应该成功执行账号密码登录', async () => {
      const loginData: LoginRequest = {
        username: 'admin',
        password: '123456'
      };

      const mockResponse = {
        code: 1000,
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          user: {
            id: '1',
            username: 'admin',
            email: 'admin@btc.com'
          }
        },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.post).mockResolvedValue(mockResponse);

      const result = await authService.login(loginData);

      expect(request.post).toHaveBeenCalledWith(
        '/admin/base/open/login',
        loginData
      );
      expect(result).toEqual(mockResponse);
    });

    it('应该成功执行短信登录', async () => {
      const smsData: SmsLoginRequest = {
        phone: '13800138000',
        smsCode: '123456'
      };

      const mockResponse = {
        code: 1000,
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          user: {
            id: '2',
            username: 'user',
            phone: '13800138000'
          }
        },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.post).mockResolvedValue(mockResponse);

      const result = await authService.smsLogin(smsData);

      expect(request.post).toHaveBeenCalledWith(
        '/admin/base/open/sms-login',
        smsData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('注册功能', () => {
    it('应该成功执行用户注册', async () => {
      const registerData: RegisterRequest = {
        tenantType: 'INERT',
        username: 'newuser',
        email: 'newuser@btc.com',
        password: '123456'
      };

      const mockResponse = {
        code: 1000,
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          user: {
            id: '3',
            username: 'newuser',
            email: 'newuser@btc.com'
          }
        },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.post).mockResolvedValue(mockResponse);

      const result = await authService.register(registerData);

      expect(request.post).toHaveBeenCalledWith(
        '/admin/base/open/register',
        registerData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('短信验证码', () => {
    it('应该成功发送短信验证码', async () => {
      const phone = '13800138000';
      const type = 'login';

      const mockResponse = {
        code: 1000,
        data: { success: true },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.post).mockResolvedValue(mockResponse);

      const result = await authService.sendSmsCode(phone, type);

      expect(request.post).toHaveBeenCalledWith(
        '/admin/base/open/sms-code',
        { phone, type }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('令牌管理', () => {
    it('应该成功刷新令牌', async () => {
      // Mock storage
      vi.mock('/@/btc/utils', () => ({
        storage: {
          get: vi.fn().mockReturnValue('mock-refresh-token')
        }
      }));

      const mockResponse = {
        code: 1000,
        data: {
          token: 'new-token',
          expiresIn: 3600
        },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.post).mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(request.post).toHaveBeenCalledWith(
        '/admin/base/open/refresh-token',
        { refreshToken: 'mock-refresh-token' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('当没有 refreshToken 时应该拒绝', async () => {
      vi.mock('/@/btc/utils', () => ({
        storage: {
          get: vi.fn().mockReturnValue(null)
        }
      }));

      await expect(authService.refreshToken()).rejects.toThrow('No refresh token available');
    });
  });

  describe('二维码功能', () => {
    it('应该成功刷新二维码', async () => {
      const mockResponse = {
        code: 1000,
        data: {
          qrCodeUrl: 'https://example.com/qr',
          qrCodeId: 'qr-123'
        },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.get).mockResolvedValue(mockResponse);

      const result = await authService.refreshQrCode();

      expect(request.get).toHaveBeenCalledWith('/admin/base/open/qr-code');
      expect(result).toEqual(mockResponse);
    });

    it('应该成功检查二维码状态', async () => {
      const qrCodeId = 'qr-123';

      const mockResponse = {
        code: 1000,
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          user: {
            id: '4',
            username: 'qruser'
          }
        },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.get).mockResolvedValue(mockResponse);

      const result = await authService.checkQrCodeStatus(qrCodeId);

      expect(request.get).toHaveBeenCalledWith(
        '/admin/base/open/qr-code/status',
        { params: { qrCodeId } }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('用户信息', () => {
    it('应该成功获取用户信息', async () => {
      const mockResponse = {
        code: 1000,
        data: {
          id: '1',
          username: 'admin',
          email: 'admin@btc.com',
          roles: ['admin'],
          permissions: ['*']
        },
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.get).mockResolvedValue(mockResponse);

      const result = await authService.getUserInfo();

      expect(request.get).toHaveBeenCalledWith('/admin/base/comm/person');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('登出功能', () => {
    it('当有 token 时应该调用登出接口', async () => {
      vi.mock('/@/btc/utils', () => ({
        storage: {
          get: vi.fn().mockReturnValue('mock-token')
        }
      }));

      const mockResponse = {
        code: 1000,
        data: null,
        msg: 'success'
      };

      const { request } = await import('/@/btc/service/request');
      vi.mocked(request.post).mockResolvedValue(mockResponse);

      const result = await authService.logout();

      expect(request.post).toHaveBeenCalledWith('/admin/base/open/logout');
      expect(result).toEqual(mockResponse);
    });

    it('当没有 token 时应该直接返回成功', async () => {
      vi.mock('/@/btc/utils', () => ({
        storage: {
          get: vi.fn().mockReturnValue(null)
        }
      }));

      const result = await authService.logout();

      expect(result).toEqual({
        code: 1000,
        data: null,
        msg: 'success'
      });
    });
  });
});
