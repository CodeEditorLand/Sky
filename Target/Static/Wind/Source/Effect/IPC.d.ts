/**
 * @module Effect/IPC
 * @description
 * Atomic IPC service using Effect-TS.
 * Wraps Tauri IPC with typed effects and streams.
 *
 * @category Service
 */
export declare class IPCInvokeError extends Error {
    readonly _tag = "IPCInvokeError";
    readonly _channel: string;
    readonly _cause: unknown;
    constructor(channel: string, cause: unknown);
    get name(): string;
    get channel(): string;
    get cause(): unknown;
}
export declare class IPCSendError extends Error {
    readonly _tag = "IPCSendError";
    readonly _channel: string;
    readonly _cause: unknown;
    constructor(channel: string, cause: unknown);
    get name(): string;
    get channel(): string;
    get cause(): unknown;
}
export declare class IPCSubscriptionError extends Error {
    readonly _tag = "IPCSubscriptionError";
    readonly _channel: string;
    readonly _cause: unknown;
    constructor(channel: string, cause: unknown);
    get name(): string;
    get channel(): string;
    get cause(): unknown;
}
export type { IPCService } from "./IPC/Interface/IPCService.js";
export { IPCTag, IPC } from "./IPC/Tag/IPCTag.js";
export { TauriIPCLive } from "./IPC/Implementation/TauriIPC.js";
import { default as IPCTauriLiveLayer, MockIPCLive } from "./IPC/index.js";
export { IPCTauriLiveLayer, MockIPCLive };
export { IPCTauriLiveLayer as IPCTauriLive };
export { MockIPCLive as IPCMockLive };
//# sourceMappingURL=IPC.d.ts.map