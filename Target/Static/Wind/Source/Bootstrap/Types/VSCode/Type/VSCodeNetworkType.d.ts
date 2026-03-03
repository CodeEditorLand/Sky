/**
 * @module Bootstrap/Types/VSCode/Type/VSCodeNetworkType
 * @description
 * Network-related types for VSCode (WebSocket, etc.).
 * @category Type
 */
import type { Event } from "./VSCodeCommonType.js";
/**
 * WebSocket factory interface
 */
export interface IWebSocketFactory {
    create(url: string): IWebSocket;
}
/**
 * WebSocket interface
 */
export interface IWebSocket {
    readonly onData: Event<ArrayBuffer>;
    readonly onOpen: Event<void>;
    readonly onClose: Event<void>;
    readonly onError: Event<any>;
    send(data: ArrayBuffer): void;
    close(): void;
}
//# sourceMappingURL=VSCodeNetworkType.d.ts.map