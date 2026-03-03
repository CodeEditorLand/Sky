import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes";
import type { IpcRenderer } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";
import type { ISandboxNodeProcess } from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals";
/**
 * @module Install
 *
 * @description
 * Main entry point for Wind polyfill. Creates and attaches Electron API
 * shims to window.vscode that Electron workbench expects, using proper Tauri
 * integration and VSCode type compliance.
 *
 * @responsibilities
 * - Validates window context and prevents double initialization
 * - Creates VSCode-compatible globals with proper typing
 * - Handles Mountain backend communication with graceful degradation
 * - Implements Electron-like IPC subsystem with Tauri
 * - Provides comprehensive error handling and cleanup
 */
export default function Install(): Promise<void>;
export declare function CreateIPCRenderer(): IpcRenderer;
export declare function CreateProcess(Configuration: ISandboxConfiguration): ISandboxNodeProcess;
export declare function ResolveConfiguration(): Promise<ISandboxConfiguration>;
/**
 * Validates IPC channels with proper guard clauses
 */
export declare function ValidateIPCChannel(Channel: string): boolean;
/**
 * Implements graceful degradation with fallback support
 */
export declare function Fallback(): void;
//# sourceMappingURL=Install.d.ts.map