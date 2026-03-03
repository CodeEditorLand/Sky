/**
 * @module Types/Interface/IPCRenderer
 * @description
 * IPC Renderer interface for Electron-style IPC communication.
 * Provides methods for sending, receiving, and managing IPC messages.
 * Mirrors the VSCode preload contract.
 * @see {@link Types/Type/IPCMessage} Related message type
 * @category Interface
 */
/**
 * IPC Renderer interface
 * Matches VSCode's preload expectations
 */
export interface IPCRenderer {
    readonly send: (channel: string, ...args: unknown[]) => void;
    readonly invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    readonly on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => () => void;
    readonly once: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
    readonly removeListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
    readonly removeAllListeners: (channel: string) => void;
}
//# sourceMappingURL=IPCRenderer.d.ts.map