/**
 * @module Types/Interface/SandboxGlobals
 * @description
 * Complete sandbox globals interface.
 * Aggregates all VSCode-compatible APIs exposed to the webview.
 * @see {@link Types/Interface/IPCRenderer} IPC renderer interface
 * @see {@link Types/Interface/IPCMessagePort} Message port interface
 * @see {@link Types/Interface/WebFrame} Web frame interface
 * @see {@link Types/Interface/SandboxNodeProcess} Node process interface
 * @see {@link Types/Interface/SandboxContext} Sandbox context interface
 * @see {@link Types/Interface/WebUtils} Web utils interface
 * @category Interface
 */
import type { IPCRenderer } from "./IPCRenderer.js";
import type { IPCMessagePort } from "./IPCMessagePort.js";
import type { WebFrame } from "./WebFrame.js";
import type { SandboxNodeProcess } from "./SandboxNodeProcess.js";
import type { SandboxContext } from "./SandboxContext.js";
import type { WebUtils } from "./WebUtils.js";
/**
 * Complete sandbox globals interface
 */
export interface SandboxGlobals {
    readonly ipcRenderer: IPCRenderer;
    readonly ipcMessagePort: IPCMessagePort;
    readonly webFrame: WebFrame;
    readonly process: SandboxNodeProcess;
    readonly context: SandboxContext;
    readonly webUtils: WebUtils;
}
//# sourceMappingURL=SandboxGlobals.d.ts.map