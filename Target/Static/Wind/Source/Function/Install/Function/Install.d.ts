/**
 * @module Function/Install/Function/Install
 * @description
 * Main entry point for Wind polyfill installation.
 * Creates and attaches Electron API shims to window.vscode that Electron workbench expects.
 *
 * @responsibilities
 * - Validates window context and prevents double initialization
 * - Creates VSCode-compatible globals with proper typing
 * - Handles Mountain backend communication with graceful degradation
 * - Implements Electron-like IPC subsystem with Tauri
 * - Provides comprehensive error handling and cleanup
 *
 * @see {@link Function/Install/Function/ResolveConfiguration} Configuration resolver
 * @see {@link Function/Install/Function/CreateIPCRenderer} IPC renderer factory
 * @see {@link Function/Install/Function/CreateProcess} Process factory
 * @category Function
 */
/**
 * Main Wind preload installation function
 */
export default function Install(): Promise<void>;
//# sourceMappingURL=Install.d.ts.map