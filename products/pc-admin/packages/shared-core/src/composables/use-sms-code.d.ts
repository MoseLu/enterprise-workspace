/**
 * 短信验证码 Composable
 * 提供完整的短信验证码发送功能，包括倒计时、发送状态、频率限制等
 */
import type { Ref, ComputedRef } from 'vue';
/**
 * 短信验证码选项
 */
export interface UseSmsCodeOptions {
    /** 倒计时时长（秒），默认 60 */
    countdown?: number;
    /** 最小发送间隔（秒），默认 60 */
    minInterval?: number;
    /** 发送短信验证码的 API 函数 */
    sendSmsCode: (data: {
        phone: string;
        smsType?: string;
    }) => Promise<void>;
    /** 发送成功回调 */
    onSuccess?: () => void;
    /** 发送失败回调 */
    onError?: (error: Error) => void;
}
/**
 * 短信验证码返回值
 */
export interface UseSmsCodeReturn {
    /** 倒计时秒数 */
    countdown: Ref<number>;
    /** 是否正在发送 */
    sending: Ref<boolean>;
    /** 是否已发送过 */
    hasSent: Ref<boolean>;
    /** 是否可以发送（倒计时结束且不在发送中） */
    canSend: ComputedRef<boolean>;
    /** 发送验证码 */
    send: (phone: string, smsType?: string) => Promise<void>;
    /** 重置状态 */
    reset: () => void;
}
/**
 * 短信验证码 Composable
 *
 * @param options 配置选项
 * @returns 短信验证码相关的状态和方法
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useSmsCode } from '@btc/shared-core';
 * import { codeApi } from '@/modules/api-services';
 * import { BtcMessage } from '@btc/shared-components';
 *
 * const { countdown, sending, canSend, send, reset } = useSmsCode({
 *   sendSmsCode: codeApi.sendSmsCode,
 *   countdown: 60,
 *   minInterval: 60,
 *   onSuccess: () => {
 *     BtcMessage.success('验证码已发送');
 *   }
 * });
 *
 * const handleSend = async () => {
 *   await send('13800138000', 'login');
 * };
 * </script>
 * ```
 */
export declare function useSmsCode(options: UseSmsCodeOptions): UseSmsCodeReturn;
//# sourceMappingURL=use-sms-code.d.ts.map