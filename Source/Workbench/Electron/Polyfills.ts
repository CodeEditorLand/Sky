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
	// Source/Polyfill/*`. Importing through Output directly here means a
	// polyfill fix (e.g. the colon-prefix `MountainIPCInvoke` routing)
	// lands in one place and every tier picks it up on rebuild.
	//
	// Telemetry MUST load first - it installs
	// `globalThis.__LAND_POLYFILL_TELEMETRY__` which the other polyfills
	// reference from their silent catches. Sky's `PostHogBridge.ts`
	// later wires a real handler via `Set(...)`; before that, calls are
	// no-op'd.
	await import("@codeeditorland/output/Configuration/Polyfill/Telemetry.js");
	await import("@codeeditorland/output/Configuration/Polyfill/Process/Polyfill.js");
	await import("@codeeditorland/output/Configuration/Polyfill/File/Protocol/Shim.js");
	await import("@codeeditorland/output/Configuration/Polyfill/File/System/Polyfill.js");
	await import("@codeeditorland/output/Configuration/Polyfill/IPC/Renderer/Shim.js");
	await import("@codeeditorland/output/Configuration/Polyfill/Child/Process/Polyfill.js");
	await import("@codeeditorland/output/Configuration/Polyfill/Native/Module/Polyfill.js");
	await import("@codeeditorland/output/Configuration/Polyfill/Shared/Process/Proxy.js");
} catch (_Error: unknown) {}

export default {};
