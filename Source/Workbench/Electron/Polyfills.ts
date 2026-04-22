/**
 * electron-polyfills.ts - Electron API polyfills loader for Electron workbench
 *
 * This script loads all 7 Electron API polyfills to make the browser environment
 * act like Electron. These polyfills provide:
 * 1. ProcessPolyfill - Node.js process object
 * 2. FileProtocolShim - vscode-file:// protocol handling
 * 3. FileSystemPolyfill - fs module polyfill
 * 4. IPCRendererShim - Electron IPC communication
 * 5. ChildProcessPolyfill - child_process module
 * 6. NativeModulePolyfill - native module loading
 * 7. SharedProcessProxy - Shared process communication
 */

try {
	// Single source of truth for polyfills is now `Element/Output/
	// Source/Polyfill/*`. Wind's `Wind/Source/Polyfills/*` are thin re-
	// exports of the same modules kept around so Cocoon and any lingering
	// VS Code imports continue to resolve; importing through Output
	// directly here means a polyfill fix (e.g. the colon-prefix
	// `MountainIPCInvoke` routing) lands in one place and every tier
	// picks it up on rebuild.
	await import("@codeeditorland/output/Polyfill/ProcessPolyfill");
	await import("@codeeditorland/output/Polyfill/FileProtocolShim");
	await import("@codeeditorland/output/Polyfill/FileSystemPolyfill");
	await import("@codeeditorland/output/Polyfill/IPCRendererShim");
	await import("@codeeditorland/output/Polyfill/ChildProcessPolyfill");
	await import("@codeeditorland/output/Polyfill/NativeModulePolyfill");
	await import("@codeeditorland/output/Polyfill/SharedProcessProxy");
} catch (_Error: unknown) {}

export default {};
