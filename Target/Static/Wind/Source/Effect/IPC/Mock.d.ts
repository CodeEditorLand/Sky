/**
 * @module Effect/IPC/Mock
 * @description
 * Mock layer for the IPC service for testing purposes.
 * Provides in-memory IPC state without actual communication.
 * @category Layer
 */
import { Layer } from "effect";
import { IPCTag } from "./Tag/IPCTag.js";
/**
 * Mock IPC service for testing
 */
export declare const MockIPCLive: Layer.Layer<IPCTag, never, never>;
export default MockIPCLive;
//# sourceMappingURL=Mock.d.ts.map