import { beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { requestAdapter, httpClient } from '@/utils/requestAdapter';
import { server, API_BASE_URL } from '../setup/integration';
import { createSuccessHandler, createErrorHandler } from './msw/handlers';

const mockMessage = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn()
}));

vi.mock('@btc/shared-components', () => ({
  BtcMessage: mockMessage
}));

vi.mock('@/composables/useRetry', () => ({
  createHttpRetry: () => ({
    retryRequest: async (runner: any) => runner(),
    getStatus: () => ({
      retryCount: 0,
      isRetrying: false,
      lastError: null,
      nextRetryDelay: 0
    }),
    reset: vi.fn()
  }),
  RETRY_CONFIGS: {
    log: {},
    standard: {},
    fast: {}
  }
}));

beforeAll(() => {
  const axiosInstance = (httpClient as any).axiosInstance;
  if (axiosInstance) {
    axiosInstance.defaults.baseURL = API_BASE_URL;
  }
});

describe('requestAdapter 集成（MSW）', () => {
  it('能根据服务端响应提取嵌套数据', async () => {
    const payload = { data: { value: 42 } };
    server.use(createSuccessHandler('/api/integration/demo', payload));

    const result = await requestAdapter.post('/api/integration/demo', { input: true });

    expect(result).toEqual({ value: 42 });
  });

  it('遇到业务错误时会抛出响应消息', async () => {
    const errorCode = 401;
    const errorMessage = '身份已过期，请重新登录';
    server.use(createErrorHandler('/api/integration/demo', errorCode, errorMessage));

    await expect(requestAdapter.post('/api/integration/demo', {})).rejects.toThrow(errorMessage);
  });

  it('即可使用 rest 动态覆盖处理器', async () => {
    const customPath = '/api/integration/custom';
    server.use(
      http.post(`${API_BASE_URL}${customPath}`, async () =>
        HttpResponse.json({
          code: 2000,
          msg: 'OK',
          data: { custom: true }
        })
      )
    );

    const result = await requestAdapter.post(customPath, undefined, { silent: true });

    expect(result).toEqual({ custom: true });
  });
});

