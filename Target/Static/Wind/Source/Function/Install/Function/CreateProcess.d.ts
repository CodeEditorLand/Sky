/**
 * @module Function/Install/Function/CreateProcess
 * @description
 * Factory function that creates a sandbox node process interface compatible with VSCode.
 * Provides platform-specific environment information and process details.
 *
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */
import type { ISandboxNodeProcess } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals";
import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes";
/**
 * Creates a sandbox node process interface
 */
export declare function CreateProcess(Configuration: ISandboxConfiguration): ISandboxNodeProcess;
//# sourceMappingURL=CreateProcess.d.ts.map