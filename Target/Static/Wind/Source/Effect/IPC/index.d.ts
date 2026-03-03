/**
 * @module Effect/IPC
 * @description
 * Atomic IPC service using Effect-TS.
 * Wraps Tauri IPC with typed effects and streams.
 *
 * @category Service
 */
export type { IPCInvokeError, IPCSendError, IPCSubscriptionError } from "./Error/IPCError.js";
export type { IPCService } from "./Interface/IPCService.js";
export { IPCTag, IPC } from "./Tag/IPCTag.js";
export { TauriIPCLive } from "./Implementation/TauriIPC.js";
export { IPCTauriLive as default } from "./Live.js";
export { MockIPCLive } from "./Mock.js";
export { CreateIPCInvokeError, CreateIPCSendError, CreateIPCSubscriptionError, } from "./Error/IPCError.js";
//# sourceMappingURL=index.d.ts.map