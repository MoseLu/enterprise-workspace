/**
 * 验证码相关 API 服务
 * 提供短信和邮箱验证码的发送功能
 */
/**
 * 验证码 API 服务对象
 * 提供所有验证码相关的 API 调用
 */
export declare const codeApi: {
    /**
     * 发送短信验证码
     * @param data 手机号和验证码类型
     * @returns Promise<void>
     */
    sendSmsCode(data: {
        phone: string;
        smsType?: string;
    }): Promise<void>;
    /**
     * 发送邮箱验证码
     * @param data 邮箱和验证码类型
     * @returns Promise<void>
     */
    sendEmailCode(data: {
        email: string;
        type?: string;
    }): Promise<void>;
};
