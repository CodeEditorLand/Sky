/**
 * @module Effect/IPC/Tag/IPCTag
 * @description
 * Service tag for dependency injection of the IPC service.
 * @see {@link Effect/IPC/Interface/IPCService} Service interface
 * @see {@link Effect/IPC/Implementation/IPCImplementation} Implementation
 * @category Tag
 */
import { Context } from "effect";
import type { IPCService } from "../Interface/IPCService.js";
declare const IPCTag_base: Context.TagClass<IPCTag, "IPC", IPCService>;
/**
 * IPC service tag for dependency injection
 */
export declare class IPCTag extends IPCTag_base {
}
/**
 * Alias for the IPC service tag
 */
export declare const IPC: typeof IPCTag;
export default IPCTag;
//# sourceMappingURL=IPCTag.d.ts.map