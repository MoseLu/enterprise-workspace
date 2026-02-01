/**
 * useLogin Composable 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

vi.mock('/$/base', () => ({
  useBase: () => ({
    app: {
      info: {
        name: 'BTC-SaaS',
        version: '1.0.0'
      }
    },
    user: {
      token: null,
      setToken: vi.fn(),
      set: vi.fn()
    },
    menu: {
      get: vi.fn()
    }
  })
}));

vi.mock('./usePasswordLogin', () => ({
  usePasswordLogin: () => ({
    form: ref({ username: '', password: '' }),
    loading: ref(false),
    rules: {},
    submit: vi.fn()
  })
}));

vi.mock('./useSmsLogin', () => ({
  useSmsLogin: () => ({
    form: ref({ phone: '', smsCode: '' }),
    saving: ref(false),
    smsCountdown: ref(0),
    hasSentSms: ref(false),
    sendSmsCode: vi.fn(),
    handlePhoneEnter: vi.fn(),
    onCodeComplete: vi.fn(),
    onLogin: vi.fn()
  })
}));

vi.mock('./useQrLogin', () => ({
  useQrLogin: () => ({
    qrCodeUrl: ref(''),
    refreshQrCode: vi.fn()
  })
}));

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该初始化为密码登录模式', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    expect(login.currentLoginMode.value).toBe('password');
  });

  it('应该能够切换登录模式', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    // 切换到短信登录
    login.handleSwitchLoginMode('sms');
    expect(login.currentLoginMode.value).toBe('sms');

    // 切换到二维码登录
    login.handleSwitchLoginMode('qr');
    expect(login.currentLoginMode.value).toBe('qr');

    // 切换回密码登录
    login.handleSwitchLoginMode('password');
    expect(login.currentLoginMode.value).toBe('password');
  });

  it('应该能够切换二维码登录', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    // 初始为密码登录
    expect(login.currentLoginMode.value).toBe('password');

    // 切换到二维码登录
    login.toggleQrLogin();
    expect(login.currentLoginMode.value).toBe('qr');

    // 切换回密码登录
    login.toggleQrLogin();
    expect(login.currentLoginMode.value).toBe('password');
  });

  it('toggleIcon 应该根据当前模式正确计算', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    // 密码模式下，图标应该是 qr
    expect(login.toggleIcon.value).toBe('qr');

    // 切换到二维码模式，图标应该是 pc
    login.toggleQrLogin();
    expect(login.toggleIcon.value).toBe('pc');
  });

  it('toggleLabel 应该根据当前模式正确计算', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    // 密码模式下，标签应该是"扫码登录"
    expect(login.toggleLabel.value).toBe('扫码登录');

    // 切换到二维码模式，标签应该是"账号登录"
    login.toggleQrLogin();
    expect(login.toggleLabel.value).toBe('账号登录');
  });

  it('应该正确提供所有子登录方式的数据和方法', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    // 密码登录
    expect(login.passwordForm).toBeDefined();
    expect(login.passwordLoading).toBeDefined();
    expect(login.passwordRules).toBeDefined();
    expect(login.passwordSubmit).toBeDefined();

    // 短信登录
    expect(login.smsForm).toBeDefined();
    expect(login.smsSaving).toBeDefined();
    expect(login.smsCountdown).toBeDefined();
    expect(login.hasSentSms).toBeDefined();
    expect(login.sendSmsCode).toBeDefined();
    expect(login.handlePhoneEnter).toBeDefined();
    expect(login.onCodeComplete).toBeDefined();
    expect(login.onLogin).toBeDefined();

    // 二维码登录
    expect(login.qrCodeUrl).toBeDefined();
    expect(login.refreshQrCode).toBeDefined();
  });

  it('应该提供 t 国际化函数', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    expect(login.t).toBeDefined();
    expect(typeof login.t).toBe('function');
    expect(login.t('测试')).toBe('测试');
  });

  it('应该提供 app 应用信息', async () => {
    const { useLogin } = await import('../login/composables/useLogin');
    const login = useLogin();

    expect(login.app).toBeDefined();
    expect(login.app.info).toBeDefined();
    expect(login.app.info.name).toBe('BTC-SaaS');
  });
});
