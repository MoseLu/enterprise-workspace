import { type MessageHandler } from 'element-plus';
export declare const BtcMessage: {
    success: (message: string, options?: any) => MessageHandler;
    warning: (message: string, options?: any) => MessageHandler;
    info: (message: string, options?: any) => MessageHandler;
    error: (message: string, options?: any) => MessageHandler;
    closeAll: () => void;
};
