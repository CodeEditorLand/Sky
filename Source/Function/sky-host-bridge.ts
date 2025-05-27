/*---------------------------------------------------------------------------------------------
 * Sky Host Bridge (sky-host-bridge.ts) - Wind Package
 * --------------------------------------------------------------------------------------------
 * This script runs in the Sky webview (Astro application's client-side) BEFORE
 * the VS Code workbench main script (`workbench.js`) is loaded.
 * Its purpose is to create and expose a `window.vscode` global object that shims
 * the essential APIs and properties that VS Code's sandboxed workbench code expects
 * from an Electron preload script and main process.
 *
 * Instead of Electron's IPC, this bridge uses Tauri's `invoke` and event system
 * to communicate with the Mountain (Tauri Rust backend), which acts as the
 * "main process" in this architecture.
 *
 * This script should be bundled and loaded into the webview before any VS Code
 * workbench scripts.
 *
 * Last Reviewed/Updated: 2025-05-27
 *--------------------------------------------------------------------------------------------*/

import {
	listen,
	emit as tauriEmit,
	type Event as TauriEvent,
	type UnlistenFn,
} from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import type { Event as ElectronEvent } from "electron"; // For IpcRendererEventShim type; use a local definition if electron types are not available

// --- Type Definitions (Simplified & Adapted from VS Code's Electron Preload Types) ---
// These interfaces define the shape of the `window.vscode` object that this bridge creates.
// They should be kept compatible with what `vs/code/electron-sandbox/workbench/workbench.js` expects.

/**
 * Shim for Electron's IpcRendererEvent.
 * @see https://www.electronjs.org/docs/latest/api/structures/ipc-renderer-event
 */
interface IpcRendererEventShim extends Omit<Partial<ElectronEvent>, "sender"> {
	// Omit sender if Event doesn't have it
	sender: IpcRendererShim; // Points back to our ipcRendererShimInstance
	// `ports`: MessagePort[] would be part of this if MessagePort transfer were fully supported.
}

/**
 * Shim for Electron's IpcRenderer API.
 * @see https://www.electronjs.org/docs/latest/api/ipc-renderer
 */
interface IpcRendererShim {
	send(channel: string, ...args: any[]): void;
	invoke(channel: string, ...args: any[]): Promise<any>;
	on(
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): this;
	once(
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): this;
	removeListener(
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): this;
	// `postMessage` for MessagePort transfer is stubbed due to complexity with Tauri.
	// postMessage(channel: string, message: any, transfer?: MessagePort[]): void;
}

/**
 * Shim for Electron's WebFrame API (subset).
 * @see https://www.electronjs.org/docs/latest/api/web-frame
 */
interface WebFrameShim {
	setZoomLevel(level: number): void;
}

/**
 * Shim for Node.js `process` object properties and methods available in Electron's sandboxed renderer.
 * @see https://www.electronjs.org/docs/latest/api/process#sandbox
 * @see https://nodejs.org/api/process.html
 */
interface ProcessShim {
	readonly platform: string; // e.g., 'win32', 'linux', 'darwin'
	readonly arch: string; // e.g., 'x64', 'arm64'
	readonly env: Record<string, string | undefined>; // Shallow copy of environment variables
	readonly versions: Record<string, string | undefined>; // e.g., versions of Node, Chrome (WebView specific), Electron (N/A for Tauri)
	readonly type: "renderer"; // Always 'renderer' in this context
	readonly execPath: string; // Path to the main application executable (Mountain)
	cwd(): string; // Current working directory (fetched from Mountain)
	shellEnv(): Promise<Record<string, string | undefined>>; // Shell environment variables
	getProcessMemoryInfo(): Promise<{
		private: number;
		residentSet: number;
		shared: number;
	}>; // Memory info
	on(type: string, callback: (...args: any[]) => void): void; // Basic event listener (mostly NOP for renderer process events)
	// Other properties like `pid`, `sandboxed` might be added if workbench.js queries them.
}

/**
 * Shim for the `context` object exposed by VS Code's Electron preload, primarily for configuration.
 */
interface ContextShim {
	/** Returns the cached workbench configuration, or undefined if not yet resolved. */
	configuration(): ISandboxConfiguration | undefined;
	/** Asynchronously fetches and resolves the workbench configuration from Mountain. */
	resolveConfiguration(): Promise<ISandboxConfiguration>;
}

/**
 * Shim for Electron's WebUtils (subset).
 * @see https://www.electronjs.org/docs/latest/api/web-utils
 */
interface WebUtilsShim {
	/**
	 * Attempts to get a filesystem path for a `File` object.
	 * Limited in pure web contexts; relies on Tauri/Mountain if `File` originated from native operations.
	 */
	getPathForFile(file: File): string;
}

/**
 * Represents the sandbox configuration passed from the main process (Mountain)
 * to the renderer (Sky webview), similar to `INativeWindowConfiguration` or `ISandboxConfiguration`.
 * Fields should align with what `vs/workbench/electron-sandbox/desktop.main.js` expects.
 */
interface ISandboxConfiguration {
	windowId: number; // ID of the current Sky/Tauri window
	machineId: string;
	sqmId?: string; // Optional, legacy
	sessionId: string;
	logLevel: number; // Numeric representation of VS Code's LogLevel enum
	userEnv: Record<string, string>; // Environment variables to set in the renderer's process.env shim
	appRoot: string; // URI string (file://) to the root of VS Code application assets
	appName: string; // e.g., "FIDDEE"
	appUriScheme: string; // e.g., "fiddee"
	appLanguage: string; // BCP 47 language tag, e.g., "en"
	appHost: string; // e.g., "desktop", "web", "codespaces"
	productQuality?: string; // e.g., "stable", "insider", "development"
	platform?: string; // Overrides processShim.platform if provided
	arch?: string; // Overrides processShim.arch if provided
	versions?: Record<string, string | undefined>; // Overrides processShim.versions
	execPath?: string; // Overrides processShim.execPath
	[key: string]: any; // Allow other fields that VS Code might expect
}

// --- Global State for the Bridge ---
let resolvedConfigurationCache: ISandboxConfiguration | undefined = undefined;

// Manages Tauri event listeners to allow for their removal.
// Key: channel (string), Value: Map<originalListener, actualTauriUnlistenFn | Promise<UnlistenFn>[]>
const tauriListenerMap = new Map<
	string,
	Map<Function, UnlistenFn | Promise<UnlistenFn>[]>
>();

// --- Shim Implementations ---

/** Validates IPC channel names for security (must start with 'vscode:'). */
function validateIPCChannelOrThrow(channel: string): void {
	if (!channel || !channel.startsWith("vscode:")) {
		const errorMsg = `[Sky Host Bridge] Invalid IPC channel: '${channel}'. Channels must start with 'vscode:'.`;
		console.error(errorMsg);
		throw new Error(errorMsg); // Fail hard for invalid channels, as in Electron's preload.
	}
}

const ipcRendererShimInstance: IpcRendererShim = {
	send: (channel: string, ...args: any[]): void => {
		try {
			validateIPCChannelOrThrow(channel);
			console.debug(
				`[Sky Host Bridge] ipcRenderer.send: Channel='${channel}', Args=`,
				args,
			);
			invoke("mountain_ipc_bridge_send", { channel, argsList: args }) // Send args as a named field
				.catch((err) =>
					console.error(
						`[Sky Host Bridge] Error in ipcRenderer.send for channel '${channel}':`,
						err,
					),
				);
		} catch (e) {
			// Error already logged by validateIPCChannelOrThrow
		}
	},

	invoke: async (channel: string, ...args: any[]): Promise<any> => {
		validateIPCChannelOrThrow(channel); // Will throw if invalid
		console.debug(
			`[Sky Host Bridge] ipcRenderer.invoke: Channel='${channel}', Args=`,
			args,
		);
		try {
			// Ensure 'args' from JS spread maps to a field Tauri command expects, e.g., 'argsList'
			return await invoke("mountain_ipc_bridge_invoke", {
				channel,
				argsList: args,
			});
		} catch (error) {
			console.error(
				`[Sky Host Bridge] Error in ipcRenderer.invoke for channel '${channel}':`,
				error,
			);
			throw error; // Rethrow to propagate failure to the caller in workbench.js
		}
	},

	on: (
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		try {
			validateIPCChannelOrThrow(channel);
		} catch (e) {
			return ipcRendererShimInstance;
		} // Return self if channel invalid, don't register

		console.debug(
			`[Sky Host Bridge] ipcRenderer.on: Registering listener for Channel='${channel}'`,
		);

		if (!tauriListenerMap.has(channel)) {
			tauriListenerMap.set(channel, new Map());
		}
		const channelListeners = tauriListenerMap.get(channel)!;

		// Prevent duplicate registrations of the exact same listener function
		if (channelListeners.has(listener)) {
			console.warn(
				`[Sky Host Bridge] ipcRenderer.on: Listener already registered for channel '${channel}'. Ignoring duplicate.`,
			);
			return ipcRendererShimInstance;
		}

		const tauriUnlistenPromise = listen(
			channel,
			(tauriEvent: TauriEvent<any[]>) => {
				console.debug(
					`[Sky Host Bridge] ipcRenderer.on: Event received on Channel='${channel}', Payload=`,
					tauriEvent.payload,
				);
				const eventShim: IpcRendererEventShim = {
					sender: ipcRendererShimInstance,
				};
				listener(eventShim, ...(tauriEvent.payload || [])); // Spread payload as arguments
			},
		);

		// Store the promise; it will be replaced by the UnlistenFn when it resolves.
		channelListeners.set(listener, [tauriUnlistenPromise]);

		tauriUnlistenPromise
			.then((unlistenFn) => {
				const storedEntry = channelListeners.get(listener);
				// Ensure the listener hasn't been removed while the promise was resolving
				if (
					Array.isArray(storedEntry) &&
					storedEntry[0] === tauriUnlistenPromise
				) {
					channelListeners.set(listener, unlistenFn); // Replace promise with the actual UnlistenFn
				} else if (typeof storedEntry === "function") {
					// Already replaced, this might be a redundant resolution (unlikely)
				} else {
					// Listener was removed before promise resolved, so execute the unlistenFn now
					unlistenFn();
					channelListeners.delete(listener);
				}
			})
			.catch((err) => {
				console.error(
					`[Sky Host Bridge] Error setting up Tauri event listener for channel '${channel}':`,
					err,
				);
				channelListeners.delete(listener); // Clean up if setup failed
			});

		return ipcRendererShimInstance;
	},

	once: (
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		try {
			validateIPCChannelOrThrow(channel);
		} catch (e) {
			return ipcRendererShimInstance;
		}
		console.debug(
			`[Sky Host Bridge] ipcRenderer.once: Registering one-time listener for Channel='${channel}'`,
		);

		let unlistenFnRef: UnlistenFn | null = null;
		const oneTimeListenerWrapper = (tauriEvent: TauriEvent<any[]>) => {
			console.debug(
				`[Sky Host Bridge] ipcRenderer.once: One-time event received on Channel='${channel}', Payload=`,
				tauriEvent.payload,
			);
			if (unlistenFnRef) {
				unlistenFnRef(); // Unsubscribe after first invocation
				const channelListeners = tauriListenerMap.get(channel);
				if (channelListeners) {
					channelListeners.delete(listener); // Also remove from our map
				}
			}
			const eventShim: IpcRendererEventShim = {
				sender: ipcRendererShimInstance,
			};
			listener(eventShim, ...(tauriEvent.payload || []));
		};

		const tauriUnlistenPromise = listen(channel, oneTimeListenerWrapper);

		tauriUnlistenPromise
			.then((unlistenFn) => {
				unlistenFnRef = unlistenFn;
				const channelListeners = tauriListenerMap.get(channel);
				if (channelListeners?.has(listener)) {
					// Check if still in map (not removed by explicit removeListener)
					channelListeners.set(listener, unlistenFn); // Store for potential explicit removal
				} else {
					// Was removed before promise resolved, ensure it's unlistened
					unlistenFn();
				}
			})
			.catch((err) => {
				console.error(
					`[Sky Host Bridge] Error setting up one-time Tauri listener for '${channel}':`,
					err,
				);
			});

		// Store original listener to allow removal by its reference
		if (!tauriListenerMap.has(channel)) {
			tauriListenerMap.set(channel, new Map());
		}
		tauriListenerMap.get(channel)!.set(listener, tauriUnlistenPromise); // Store promise initially

		return ipcRendererShimInstance;
	},

	removeListener: (
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		try {
			validateIPCChannelOrThrow(channel);
		} catch (e) {
			return ipcRendererShimInstance;
		}
		console.debug(
			`[Sky Host Bridge] ipcRenderer.removeListener: Attempting for Channel='${channel}'`,
		);

		const channelListeners = tauriListenerMap.get(channel);
		if (channelListeners) {
			const unlistenOrPromise = channelListeners.get(listener);
			if (unlistenOrPromise) {
				if (typeof unlistenOrPromise === "function") {
					// It's an UnlistenFn
					unlistenOrPromise();
				} else if (
					Array.isArray(unlistenOrPromise) &&
					unlistenOrPromise[0] instanceof Promise
				) {
					// It's a [Promise<UnlistenFn>]
					// If it's still a promise, it means Tauri's listen() hasn't resolved yet.
					// We can't directly call unlisten. We mark it for unlistening when it resolves.
					// Or, if Tauri's API supports cancelling a listen() promise, use that.
					// For simplicity, we'll assume the promise will eventually resolve and the
					// .then() in `on()` will handle unlistening if it was removed.
					console.warn(
						`[Sky Host Bridge] removeListener for channel '${channel}' called while UnlistenFn promise is pending. Actual unlisten might be delayed or handled by 'on'.`,
					);
				}
				channelListeners.delete(listener);
			}
		}
		return ipcRendererShimInstance;
	},
};

const webFrameShimInstance: WebFrameShim = {
	setZoomLevel: (level: number) => {
		if (typeof level === "number" && isFinite(level)) {
			console.debug(
				`[Sky Host Bridge] webFrame.setZoomLevel: Level=${level}`,
			);
			invoke("mountain_set_zoom_level", { level }).catch((err) =>
				console.error(
					"[Sky Host Bridge] Error calling mountain_set_zoom_level via Tauri invoke:",
					err,
				),
			);
		} else {
			console.warn(
				`[Sky Host Bridge] webFrame.setZoomLevel: Invalid level provided: ${level}`,
			);
		}
	},
};

// This process shim will be populated by `contextShimInstance.resolveConfiguration()`.
// Provide initial safe defaults or ensure properties are checked for existence before use by workbench.js.
const processShimInstance: ProcessShim = {
	platform: navigator.platform.toLowerCase().includes("mac")
		? "darwin"
		: navigator.platform.toLowerCase().includes("win")
			? "win32"
			: "linux",
	arch: "x64", // Common default, Mountain should provide the actual one.
	env: {}, // Populated from Mountain via resolveConfiguration().userEnv
	versions: {
		// Placeholder, Mountain should provide actual relevant versions
		node: process.versions?.node || "unknown", // Node version of Cocoon, not directly relevant to UI process
		chrome:
			navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "unknown", // Webview's Chrome version
		// Electron version is not applicable here.
	},
	type: "renderer",
	execPath: "MountainApplication", // Placeholder, Mountain provides actual.

	cwd: (): string => {
		// This should return the CWD relevant to the *application's context* (e.g., workspace root if known)
		// For a generic renderer, it might be the app's launch directory.
		// Fetched from Mountain if needed, or from configuration.
		const cwdFromConfig = resolvedConfigurationCache?.["VSCODE_CWD"]; // Example if passed via config
		if (typeof cwdFromConfig === "string") return cwdFromConfig;

		console.warn(
			"[Sky Host Bridge] process.cwd() called. Returning root '/' as a placeholder. Mountain should provide the correct CWD.",
		);
		return "/"; // Placeholder
	},
	shellEnv: async (): Promise<Record<string, string | undefined>> => {
		console.debug(
			"[Sky Host Bridge] process.shellEnv() called. Invoking 'mountain_fetch_shell_env'.",
		);
		try {
			const env = await invoke("mountain_fetch_shell_env");
			return env as Record<string, string | undefined>;
		} catch (error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_fetch_shell_env via Tauri invoke:",
				error,
			);
			return {}; // Fallback to empty object on error
		}
	},
	getProcessMemoryInfo: async (): Promise<{
		private: number;
		residentSet: number;
		shared: number;
	}> => {
		console.debug(
			"[Sky Host Bridge] process.getProcessMemoryInfo() called. Invoking 'mountain_get_process_memory_info'.",
		);
		try {
			const memInfo = await invoke("mountain_get_process_memory_info");
			return memInfo as {
				private: number;
				residentSet: number;
				shared: number;
			};
		} catch (error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_get_process_memory_info via Tauri invoke:",
				error,
			);
			return { private: 0, residentSet: 0, shared: 0 }; // Fallback
		}
	},
	on: (type: string, callback: (...args: any[]) => void): void => {
		// Events like 'uncaughtException' are typically handled by the main host process (Mountain)
		// or by VS Code's own ErrorHandler which is set up by workbench.js.
		// This `on` is for extensions or workbench code trying to listen to `process.on(...)` within the renderer context.
		// For most events, this can be a NOP or log a warning.
		console.warn(
			`[Sky Host Bridge] STUB: process.on('${type}') called in webview. This event is not actively proxied from the actual host process events for most types.`,
		);
	},
};

const contextShimInstance: ContextShim = {
	configuration: (): ISandboxConfiguration | undefined => {
		if (!resolvedConfigurationCache) {
			// This might be called by workbench.js before resolveConfiguration() promise completes.
			// It's okay to return undefined here as per ISandboxContext contract.
			console.debug(
				"[Sky Host Bridge] context.configuration() called before configuration has been resolved from Mountain. Returning undefined.",
			);
		}
		return resolvedConfigurationCache;
	},
	resolveConfiguration: async (): Promise<ISandboxConfiguration> => {
		if (resolvedConfigurationCache) {
			console.debug(
				"[Sky Host Bridge] context.resolveConfiguration: Returning cached workbench configuration.",
			);
			return resolvedConfigurationCache;
		}
		console.log(
			"[Sky Host Bridge] context.resolveConfiguration: Attempting to fetch workbench configuration from Mountain via 'mountain_get_workbench_configuration'...",
		);
		try {
			const configFromMountain = (await invoke(
				"mountain_get_workbench_configuration",
			)) as ISandboxConfiguration;
			if (!configFromMountain || typeof configFromMountain !== "object") {
				throw new Error(
					"Received invalid or empty configuration from Mountain.",
				);
			}
			resolvedConfigurationCache = configFromMountain;
			console.log(
				"[Sky Host Bridge] Workbench configuration successfully resolved from Mountain and cached:",
				resolvedConfigurationCache,
			);

			// Once configuration is resolved, update parts of the processShimInstance with more accurate data
			if (resolvedConfigurationCache.userEnv) {
				Object.assign(
					processShimInstance.env,
					resolvedConfigurationCache.userEnv,
				);
			}
			if (resolvedConfigurationCache.platform)
				(processShimInstance as any).platform =
					resolvedConfigurationCache.platform;
			if (resolvedConfigurationCache.arch)
				(processShimInstance as any).arch =
					resolvedConfigurationCache.arch;
			if (resolvedConfigurationCache.versions)
				(processShimInstance as any).versions = {
					...(processShimInstance.versions || {}),
					...resolvedConfigurationCache.versions,
				};
			if (resolvedConfigurationCache.execPath)
				(processShimInstance as any).execPath =
					resolvedConfigurationCache.execPath;

			// Apply zoom level from the resolved configuration
			if (typeof resolvedConfigurationCache.zoomLevel === "number") {
				webFrameShimInstance.setZoomLevel(
					resolvedConfigurationCache.zoomLevel,
				);
			}
			return resolvedConfigurationCache;
		} catch (error) {
			console.error(
				"[Sky Host Bridge] CRITICAL: Failed to resolve workbench configuration from Mountain. Workbench startup will likely fail.",
				error,
			);
			// This is a fatal error for workbench startup.
			throw error;
		}
	},
};

const webUtilsShimInstance: WebUtilsShim = {
	getPathForFile: (file: File): string => {
		// In standard web browsers, `File` objects (e.g., from <input type="file"> or Drag-and-Drop)
		// do not expose their full system path due to security restrictions.
		// Electron's `webUtils.getPathForFile` can retrieve this because it operates in a more privileged context.
		// For Tauri:
		// - If the `File` object originated from a Tauri dialog, Mountain (Rust) would already have the path.
		// - If it's from a generic web API like DnD into the webview, getting the full path is hard.
		//   Tauri's DnD event might provide the path if the drop originates from the filesystem.
		// This shim provides a placeholder. A full implementation might need an invoke call to Mountain
		// if Mountain has a way to map a File-like object (or its temporary blob URL) back to a system path.
		const filePath = (file as any).path || file.name; // `file.path` is non-standard but sometimes added by Electron/Node.
		console.warn(
			`[Sky Host Bridge] STUB: webUtils.getPathForFile called for file '${file.name}'. ` +
				`Returning '${filePath}'. Full path resolution for arbitrary File objects is complex in a webview ` +
				`and relies on how the File object was obtained (e.g., from Tauri dialogs or DnD events that provide paths).`,
		);
		return filePath;
	},
};

// The `window.vscode` global object that VS Code's workbench.js will expect.
const skyHostApiGlobal = {
	ipcRenderer: ipcRendererShimInstance,
	ipcMessagePort: {
		acquire: (responseChannel: string, nonce: string) => {
			console.warn(
				`[Sky Host Bridge] STUB: ipcMessagePort.acquire called for channel '${responseChannel}' with nonce '${nonce}'. ` +
					`Direct MessagePort transfer as in Electron is not straightforward with Tauri and is not implemented in this shim. ` +
					`Alternative communication channels (like dedicated Tauri events or invoke calls) should be used if needed.`,
			);
			// In Electron, this sets up a listener for the responseChannel and uses window.postMessage
			// to transfer the received MessagePort. Replicating this securely and functionally with Tauri
			// would require careful design if MessagePorts are essential for your use case.
		},
	},
	webFrame: webFrameShimInstance,
	process: processShimInstance,
	context: contextShimInstance,
	webUtils: webUtilsShimInstance,
};

// --- Global Exposure ---
// This script MUST run and attach `skyHostApiGlobal` to `window.vscode`
// *before* VS Code's `workbench.js` script is loaded and executed.
if ((window as any).vscode) {
	console.warn(
		"[Sky Host Bridge] `window.vscode` object already exists. It will be overwritten by the Sky Host Bridge. " +
			"This might indicate that the bridge script is being loaded multiple times or there's a conflict.",
	);
}
(window as any).vscode = skyHostApiGlobal;

console.log(
	"[Sky Host Bridge] `window.vscode` shim has been successfully attached to the window object. " +
		"VS Code Workbench UI (`workbench.js`) can now attempt to load and initialize using this bridge " +
		"to communicate with the Mountain (Tauri Rust backend).",
);

// This module itself doesn't need to export anything if its sole purpose is to set up the global.
// However, exporting `skyHostApiGlobal` can be useful for testing or if other client-side
// scripts in "Wind" need to access these shims directly (though they should generally
// go through the standard VS Code services once the workbench is up).
// export default skyHostApiGlobal;
