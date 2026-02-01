import { describe, it, expect, vi, afterEach } from 'vitest';

const mockHttp = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  request: vi.fn()
}));

const mockMessage = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn()
}));

vi.mock('@/utils/http', () => ({
  http: mockHttp
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
  })
}));

import { requestAdapter } from '@/utils/requestAdapter';
import { BtcMessage } from '@btc/shared-components';

describe('requestAdapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.values(mockHttp).forEach((fn) => fn.mockReset());
    Object.values(mockMessage).forEach((fn) => fn.mockReset());
  });

  it('调用 POST 默认触发成功提示', async () => {
    const mockResponse = { ok: true };
    mockHttp.post.mockResolvedValueOnce(mockResponse);

    const result = await requestAdapter.post('/api/demo', { foo: 'bar' });

    expect(mockHttp.post).toHaveBeenCalledWith('/api/demo', { foo: 'bar' });
    expect(BtcMessage.success).toHaveBeenCalledWith('操作成功');
    expect(result).toEqual(mockResponse);
  });

  it('在 silent 模式下不会触发提示', async () => {
    const mockResponse = { ok: true };
    mockHttp.post.mockResolvedValueOnce(mockResponse);

    await requestAdapter.post('/api/demo', undefined, { silent: true });

    expect(BtcMessage.success).not.toHaveBeenCalled();
  });

  it('失败且 notifyError=true 时触发错误提示', async () => {
    const mockError = new Error('test error');
    mockHttp.post.mockRejectedValueOnce(mockError);

    await expect(
      requestAdapter.post('/api/demo', null, { notifyError: true })
    ).rejects.toThrow('test error');

    expect(BtcMessage.error).toHaveBeenCalledWith('操作失败，请稍后重试');
  });
});

