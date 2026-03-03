/**
 * @module IPCRendererShim
 *
 * @description
 * Comprehensive polyfill for Electron's ipcRenderer API.
 * Maps Electron IPC channels to Tauri commands for full compatibility.
 *
 * @feature_set
 * - send(channel, ...args) - Send message to main process
 * - sendSync(channel, ...args) - Synchronous send (polyfilled as async with warning)
 * - invoke(channel, ...args) - Invoke main and get response
 * - on(channel, listener) - Register listener
 * - once(channel, listener) - One-time listener
 * - removeListener(channel, listener) - Remove listener
 * - removeAllListeners(channel) - Remove all listeners for channel
 * - sendTo(channel, args, callback) - Client-side request-reply pattern
 * - onReply(channel, handler) - Register reply handler
 *
 * @ipc_channel_mapping
 * - logger:* → Mountain logging service
 * - policy:* → Mountain policy service
 * - sign:* → Mountain signing service
 * - userDataProfiles:* → Mountain user data service
 * - localFileSystem:* → Mountain file system service
 * - crashReporter:* → Mountain crash reporting
 * - encryption:* → Mountain encryption service
 * - machineId:* → Mountain machine ID service
 *
 * @phase 2 of Approach A3 implementation
 */
import type { IpcRenderer, IpcRendererEvent } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";
/**
 * Reply handler for client-side request-reply pattern
 */
type ReplyHandler = (response: unknown) => void;
/**
 * SendTo request with callback
 */
interface SendToRequest {
    channel: string;
    args: unknown[];
    callback: ReplyHandler;
    timestamp: number;
}
/**
 * IPC Renderer class that implements Electron's ipcRenderer API
 */
declare class IPCRendererImpl implements IpcRenderer {
    listeners: Map<string, Set<(event: IpcRendererEvent, ...args: unknown[]) => void>>;
    replyHandlers: Map<number, SendToRequest>;
    replyCounter: number;
    onceListeners: Map<string, Set<WeakRef<(event: IpcRendererEvent, ...args: unknown[]) => void>>>;
    /**
     * Send message to main process
     */
    send(channel: string, ...args: unknown[]): void;
    /**
     * Synchronous send - polyfilled as async with warning
     */
    sendSync(_channel: string, ..._args: unknown[]): unknown;
    /**
     * Invoke main process and get response
     */
    invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;
    /**
     * Register event listener
     */
    on(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): this;
    /**
     * Register one-time event listener
     */
    once(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): this;
    /**
     * Remove specific listener
     */
    removeListener(channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): this;
    /**
     * Remove all listeners for a channel
     */
    removeAllListeners(channel?: string): this;
    /**
     * Client-side request-reply pattern (sendTo + onReply)
     */
    sendTo(channel: string, args: unknown[], callback: ReplyHandler): void;
    /**
     * Register reply handler for sendTo pattern
     */
    onReply(channel: string, handler: ReplyHandler): void;
    /**
     * Helper method to register listener with Tauri
     */
    private registerTauriListener;
    /**
     * Cleanup method to remove all listeners
     */
    cleanup(): void;
}
/**
 * Get or create the IPC renderer singleton
 */
export declare function getIPCRenderer(): IpcRenderer;
/**
 * Install the IPC renderer shim into window.vscode.ipcRenderer
 */
export declare function installIPCRendererShim(): void;
export { IPCRendererImpl as IPCRendererClass };
declare const _default: {
    install: typeof installIPCRendererShim;
    get: typeof getIPCRenderer;
};
export default _default;
//# sourceMappingURL=IPCRendererShim.d.ts.map