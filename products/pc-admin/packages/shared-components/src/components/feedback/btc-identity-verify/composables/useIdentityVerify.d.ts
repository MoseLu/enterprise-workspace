/**
 * 身份验证 Composable
 * 封装验证码发送和校验逻辑
 */
export type VerifyType = 'phone' | 'email';
export interface SendSmsCodeFn {
    (phone: string, smsType?: string): Promise<void>;
}
export interface SendEmailCodeFn {
    (email: string, smsType?: string): Promise<void>;
}
export interface VerifySmsCodeFn {
    (phone: string, smsCode: string, smsType?: string): Promise<void | boolean>;
}
export interface VerifyEmailCodeFn {
    (email: string, emailCode: string, smsType?: string): Promise<void | boolean>;
}
export interface IdentityVerifyOptions {
    /** 用户信息（包含手机号和邮箱） */
    userInfo: {
        phone?: string;
        email?: string;
    };
    /** 发送短信验证码函数 */
    sendSmsCode: SendSmsCodeFn;
    /** 发送邮箱验证码函数 */
    sendEmailCode: SendEmailCodeFn;
    /** 验证短信验证码函数 */
    verifySmsCode: VerifySmsCodeFn;
    /** 验证邮箱验证码函数 */
    verifyEmailCode: VerifyEmailCodeFn;
    /** 验证成功回调 */
    onSuccess?: () => void;
    /** 验证失败回调 */
    onError?: (error: Error) => void;
}
/**
 * 身份验证 Composable
 */
export declare function useIdentityVerify(options: IdentityVerifyOptions): {
    currentVerifyType: globalThis.Ref<VerifyType, VerifyType>;
    phoneForm: {
        phone: string;
        smsCode: string;
    };
    emailForm: {
        email: string;
        emailCode: string;
    };
    verifying: globalThis.Ref<boolean, boolean>;
    verifyError: globalThis.Ref<string, string>;
    smsCountdown: globalThis.Ref<number, number>;
    smsSending: globalThis.Ref<boolean, boolean>;
    smsHasSent: globalThis.Ref<boolean, boolean>;
    smsCanSend: globalThis.ComputedRef<boolean>;
    sendSmsCode: (phone: string, smsType?: string) => Promise<void>;
    emailCountdown: globalThis.Ref<number, number>;
    emailSending: globalThis.Ref<boolean, boolean>;
    emailHasSent: globalThis.Ref<boolean, boolean>;
    sendEmailCode: () => Promise<void>;
    verify: () => Promise<boolean>;
    reset: () => void;
    switchVerifyType: (type: VerifyType) => void;
};
