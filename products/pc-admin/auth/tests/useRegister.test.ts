/**
 * useRegister Composable 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

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
    }
  })
}));

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该初始化注册状态', async () => {
    const { useRegister } = await import('../register/composables/useRegister');
    const register = useRegister();

    expect(register).toBeDefined();
    expect(register.app).toBeDefined();
    expect(register.t).toBeDefined();
  });

  it('应该提供国际化函数', async () => {
    const { useRegister } = await import('../register/composables/useRegister');
    const register = useRegister();

    expect(typeof register.t).toBe('function');
    expect(register.t('测试')).toBe('测试');
  });

  it('应该提供应用信息', async () => {
    const { useRegister } = await import('../register/composables/useRegister');
    const register = useRegister();

    expect(register.app).toBeDefined();
    expect(register.app.info).toBeDefined();
    expect(register.app.info.name).toBe('BTC-SaaS');
    expect(register.app.info.version).toBe('1.0.0');
  });
});
