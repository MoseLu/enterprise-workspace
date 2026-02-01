/**
 * 验证码相关 API 服务
 * 提供短信和邮箱验证码的发送功能
 */

// 暂时使用简化实现
/**
 * 验证码 API 服务对象
 */
export const codeApi = {
  /**
   * 发送短信验证码
   */
  sendSmsCode(_data: { phone: string; smsType?: string }): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  },

  /**
   * 发送邮箱验证码
   */
  sendEmailCode(_data: { email: string; type?: string }): Promise<void> {
    return Promise.reject(new Error('Not implemented'));
  }
};
