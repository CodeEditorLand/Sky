/**
 * @module Function/Install/Function/CreateIPCRenderer
 * @description
 * Factory function that creates an IPC renderer interface compatible with VSCode's preload.
 * Provides send/invoke/on/once/removeListener methods for IPC communication.
 *
 * @see {@link Function/Install/Function/ValidateIPCChannel} Channel validator
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */
import type { IpcRenderer } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";
/**
 * Creates an IPC renderer interface
 */
export declare function CreateIPCRenderer(): IpcRenderer;
//# sourceMappingURL=CreateIPCRenderer.d.ts.map