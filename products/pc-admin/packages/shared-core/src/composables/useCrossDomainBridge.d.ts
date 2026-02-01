/**
 * 跨子域通信桥 Composable
 * 用于实现跨子域标签页之间的消息通信（如登出状态同步）
 *
 * 核心机制：
 * 1. 通过主域的隐藏 iframe (bridge.html) 作为通信枢纽
 * 2. 使用 Broadcast Channel 实现同源标签页通信
 * 3. 通过 postMessage 实现跨域通信
 */
import { type Ref } from 'vue';
/**
 * 通信桥消息类型
 */
export interface BridgeMessage {
    type: string;
    payload?: any;
    origin?: string;
    timestamp?: number;
}
/**
 * 通信桥配置选项
 */
export interface UseCrossDomainBridgeOptions {
    /**
     * 通信桥 URL，默认从环境配置获取
     * 生产环境：https://bellis.com.cn/bridge.html
     * 开发环境：http://localhost:端口/bridge.html
     */
    bridgeUrl?: string;
    /**
     * 消息回调函数
     */
    onMessage?: (message: BridgeMessage) => void;
    /**
     * 是否自动创建 iframe（默认 true）
     * 如果为 false，需要手动创建 iframe 并传入 iframeId
     */
    autoCreateIframe?: boolean;
    /**
     * 手动创建的 iframe ID（当 autoCreateIframe 为 false 时使用）
     */
    iframeId?: string;
    /**
     * 是否启用（默认根据环境判断：生产环境启用）
     */
    enabled?: boolean;
}
/**
 * 通信桥返回接口
 */
export interface UseCrossDomainBridgeReturn {
    /**
     * 发送消息到通信桥
     */
    sendMessage: (type: string, payload?: any) => void;
    /**
     * 订阅指定类型的消息
     * @returns 取消订阅的函数
     */
    subscribe: (type: string, handler: (payload?: any, origin?: string) => void) => () => void;
    /**
     * 通信桥是否就绪
     */
    isReady: Ref<boolean>;
    /**
     * 销毁通信桥（清理资源）
     */
    destroy: () => void;
}
/**
 * 跨子域通信桥 Composable
 */
export declare function useCrossDomainBridge(options?: UseCrossDomainBridgeOptions): UseCrossDomainBridgeReturn;
//# sourceMappingURL=useCrossDomainBridge.d.ts.map