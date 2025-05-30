/*---------------------------------------------------------------------------------------------
 * Sky Host Bridge (sky-host-bridge.ts) - Wind Package
 * --------------------------------------------------------------------------------------------
 * This script is designed to run in the Sky webview (the client-side of the Astro-based
 * application, referred to as "Wind") at a very early stage of its lifecycle. Specifically,
 * it MUST execute **BEFORE** the main VS Code workbench script (e.g., `workbench.js` or
 * `desktop.main.js` when sandboxed) is loaded and run.
 *
 * The primary purpose of this bridge is to create and expose a global object,
 * `window.vscode`. This object meticulously shims (simulates) the essential APIs,
 * properties, and behaviors that VS Code's sandboxed workbench code expects to be
 * available from an Electron preload script and the Electron main process.
 *
 * Key differences from a standard Electron setup:
 * - IPC Mechanism: Instead of Electron's `ipcRenderer` and `ipcMain`, this bridge
 *   utilizes Tauri's `invoke` mechanism for request-response style communication and
 *   Tauri's event system (`listen`, `emit`) for event-driven communication. The
 *   "Mountain" (Tauri Rust backend) acts as the counterpart to Electron's main process.
 *
 * This script effectively acts as a compatibility layer, enabling the VS Code workbench
 * frontend to run within a Tauri-managed webview environment by providing the necessary
 * "Electron-like" globals. It must faithfully implement the contract defined by VS Code's
 * `IMainWindowSandboxGlobals` interface (found in `vs/base/parts/sandbox/electron-sandbox/globals.ts`).
 *
 * Key communication channels with Mountain (Tauri Rust backend):
 * - `invoke("mountain_get_workbench_configuration")`: Fetches the essential startup
 *   configuration (ISandboxConfiguration) needed by the workbench.
 * - `invoke("mountain_ipc_bridge_send", { channel, argsList })`: Used by the
 *   `ipcRenderer.send` shim to send fire-and-forget messages to Mountain.
 * - `invoke("mountain_ipc_bridge_invoke", { channel, argsList })`: Used by the
 *   `ipcRenderer.invoke` shim to send request-response messages to Mountain.
 * - Tauri events (listened to via `listen(channel, ...)`): Used by the `ipcRenderer.on`
 *   shim to receive messages pushed from Mountain to the Sky webview.
 * - Other specific invokes like `mountain_set_zoom_level`, `mountain_fetch_shell_env`,
 *   `mountain_get_process_memory_info` are used to implement corresponding shims.
 *
 * The script also handles early initialization of the configuration cache and updates
 * the `process` shim with accurate data once the configuration is fetched from Mountain.
 *
 *--------------------------------------------------------------------------------------------*/

// --- Tauri API Imports ---
// These are used for communication with the Rust backend (Mountain).
import {
	listen, // For subscribing to events emitted by the Rust backend.
	// emit as tauriEmit, // `tauriEmit` would be used if Sky needed to emit Tauri events to Mountain directly. Not typically used for emulating Electron IPC.
	type Event as TauriEvent, // Type for Tauri events.
	type UnlistenFn, // Type for the function returned by `listen` to unsubscribe.
} from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri"; // For calling Rust commands.

// --- VS Code Utility Imports (Bundled with Sky or from a shared location) ---
// These are used for type consistency and utility functions.
// Assuming these are made available to the Sky webview environment, e.g., via ESBuild/Rollup bundling.
import { URI } from "@VSCode/vs/base/common/uri.js"; // VS Code's URI implementation.
import { LogLevel } from "@VSCode/vs/platform/log/common/log.js"; // VS Code's LogLevel enum.

// --- Type Definitions (Shim Interfaces) ---
// These interfaces define the shape of the `window.vscode` object that this bridge creates.
// They are based on `IMainWindowSandboxGlobals` and related types from VS Code's
// `vs/base/parts/sandbox/electron-sandbox/globals.ts` and `electronTypes.ts`.

/**
 * Shim for Electron's `IpcRendererEvent`.
 * This is the event object passed to listeners of `ipcRenderer.on`.
 * @see https://www.electronjs.org/docs/latest/api/structures/ipc-renderer-event
 */
interface IpcRendererEventShim {
	sender: IpcRendererShim; // Points back to our `ipcRendererShimInstance`.
	// `ports?: ReadonlyArray<MessagePort>;` // MessagePort transfer is complex with Tauri and is stubbed/not supported for now.
}

/**
 * Shim for Electron's `IpcRenderer` API.
 * This object handles communication from the renderer (Sky) to the main process (Mountain).
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
	// `postMessage(channel: string, message: any, transfer?: MessagePort[]): void;` // Stubbed due to complexity.
}

/**
 * Shim for Electron's `ipcMessagePort` functionality, primarily its `acquire` method.
 * This is used by VS Code for setting up MessageChannel-based communication, often for the extension host.
 */
interface IpcMessagePortShim {
	acquire(responseChannel: string, nonce: string): void;
}

/**
 * Shim for a subset of Electron's `WebFrame` API.
 * Used for controlling web frame properties like zoom level.
 * @see https://www.electronjs.org/docs/latest/api/web-frame
 */
interface WebFrameShim {
	setZoomLevel(level: number): void;
	getZoomLevel(): number; // VS Code workbench queries this, so it needs to be implemented.
}

/**
 * Shim for Node.js `process` object properties and methods available in Electron's sandboxed renderer.
 * This object provides information about the current process and environment.
 * @see https://www.electronjs.org/docs/latest/api/process#sandbox
 * @see https://nodejs.org/api/process.html
 */
interface ProcessShim {
	readonly platform: "win32" | "linux" | "darwin"; // Operating system platform.
	readonly arch: "x64" | "arm64" | "ia32"; // Processor architecture.
	readonly env: Record<string, string | undefined>; // Environment variables (populated by Mountain).
	readonly versions: Record<string, string | undefined>; // Versions of relevant software (e.g., app, webview runtime).
	readonly type: "renderer"; // Indicates this is a renderer process.
	readonly execPath: string; // Path to the main application executable (Mountain).
	readonly sandboxed: true; // Indicates the renderer runs in a sandboxed environment.
	readonly contextIsolated: boolean; // Indicates if context isolation is enabled (usually false for Tauri webview content script).
	readonly आटा: boolean; // `isNsfw` / `devMode` flag, typically `nodeCachedDataEnabled()` in VS Code, usually false here.
	readonly resourcesPath: string; // Filesystem path to the application's resources directory.
	readonly mas?: boolean; // True if Mac App Store build.
	readonly windowsStore?: boolean; // True if Windows Store build.
	readonly linuxManualInstall?: boolean; // True if Linux manual install.
	cwd(): string; // Current working directory (provided by Mountain).
	shellEnv(): Promise<Record<string, string | undefined>>; // Shell environment variables (fetched from Mountain).
	getProcessMemoryInfo(): Promise<{
		privateBytes: number;
		sharedBytes: number;
		residentSet: number;
	}>; // Memory usage info.
	on(type: "uncaughtException", callback: (error: Error) => void): void; // Special handling for uncaught exceptions.
	on(type: string, callback: (...args: any[]) => void): void; // Generic event listener (mostly NOP for other process events).
}

/**
 * Shim for the `context` object exposed by VS Code's Electron preload script.
 * This is primarily used for accessing the initial sandbox configuration.
 */
interface ContextShim {
	/** Returns the cached workbench configuration, or undefined if not yet resolved. */
	configuration(): ISandboxConfiguration | undefined;
	/** Asynchronously fetches and resolves the workbench configuration from Mountain. */
	resolveConfiguration(): Promise<ISandboxConfiguration>;
}

/**
 * Shim for a subset of Electron's `WebUtils` API.
 * @see https://www.electronjs.org/docs/latest/api/web-utils
 */
interface WebUtilsShim {
	/**
	 * Attempts to get a filesystem path for a `File` object.
	 * This is limited in pure web contexts; it relies on Mountain if the `File` object
	 * originated from native operations (e.g., Tauri file dialogs).
	 */
	getPathForFile(file: File): string;
}

/**
 * Represents the sandbox configuration passed from the main process (Mountain)
 * to the renderer (Sky webview). This structure is critical for workbench initialization.
 * Fields MUST align with what `vs/workbench/electron-sandbox/desktop.main.ts`
 * (or its equivalent in the VS Code version being used) expects.
 * It's similar to `INativeWindowConfiguration` or `ISandboxConfiguration` from VS Code.
 */
interface ISandboxConfiguration {
	windowId: number; // Unique ID of the current Sky/Tauri window.
	machineId: string; // Unique machine identifier.
	sqmId?: string; // Optional, legacy telemetry ID.
	sessionId: string; // Unique session identifier.
	logLevel: LogLevel; // Numeric representation of VS Code's `LogLevel` enum.
	userEnv: Record<string, string | undefined>; // Environment variables to be merged into `process.env` by workbench.
	appRoot: string; // URI string (e.g., "file:///.../Static/Application/") for the root of VS Code application assets.
	appName: string; // Application name (e.g., "FIDDEE").
	appUriScheme: string; // Custom URI scheme for the application (e.g., "fiddee").
	appLanguage: string; // BCP 47 language tag for the application's UI language (e.g., "en").
	appHost: "desktop" | "web" | "codespaces" | string; // Host environment type (from product.json).
	productQuality?: string; // Product quality (e.g., "stable", "insider", "development").
	platform: ProcessShim["platform"]; // Host operating system platform (e.g., 'win32', 'linux', 'darwin').
	arch: ProcessShim["arch"]; // Host processor architecture (e.g., 'x64', 'arm64').
	versions: ProcessShim["versions"]; // Versions of relevant components (e.g., { fiddee: "1.0", webview_runtime: "..." }).
	execPath: string; // Filesystem path to the Mountain executable.
	zoomLevel?: number; // Initial zoom level for the window.
	homeDir: string; // URI string for the user's home directory.
	tmpDir: string; // URI string for the system's temporary directory.
	userDataDir: string; // URI string for the user data directory (settings, extensions, etc.).
	backupPath?: string; // URI string for the workspace backup path.
	crashReporterId?: string; // Identifier for crash reporting.
	nls: {
		// National Language Support (NLS) data.
		messages: Record<string, string>; // Localized strings for the current language.
		language: string; // The resolved UI language (e.g., 'en', 'de').
		availableLanguages: Record<string, string>; // Map of available language IDs to their display names.
		pseudo?: boolean; // Whether pseudo-localization is active (corrected typo from original: psuedo -> pseudo).
	};
	productConfiguration: {
		// Configuration from `product.json`, possibly merged with overrides.
		[key: string]: any;
	};
	VSCODE_CWD?: string; // Current working directory for the renderer process, if set by the host.
	resourcesPath: string; // Filesystem path to the application's general resources folder.
	// Allow other fields that VS Code's `desktop.main.ts` might expect, such as:
	// `partsSplash`, `filesToOpenOrCreate`, `filesToDiff`, `filesToMerge`.
	[key: string]: any;
}

// --- Global State for the Bridge ---

/** Cache for the workbench configuration once resolved from Mountain. */
let resolvedConfigurationCache: ISandboxConfiguration | undefined = undefined;

/** Promise for the ongoing `resolveConfiguration` call, to prevent multiple concurrent fetches. */
let resolveConfigurationPromise: Promise<ISandboxConfiguration> | null = null;

/**
 * Manages Tauri event listeners to allow for their removal.
 * Key: channel (string), Value: Map<originalListenerFunction, actualTauriUnlistenFn | Promise<UnlistenFn>>
 * The value is initially a Promise for the UnlistenFn, which gets replaced by the actual UnlistenFn upon resolution.
 */
const tauriListenerMap = new Map<
	string,
	Map<Function, UnlistenFn | Promise<UnlistenFn>>
>();

// --- Shim Implementations ---

/**
 * Validates IPC channel names. For security and compatibility with VS Code's expectations,
 * channels used for core IPC typically must start with "vscode:".
 *
 * @param channel - The IPC channel name to validate.
 * @param allowNonPrefixed - If true, allows channels that do not start with "vscode:".
 *                           This might be used for generic browser `window.postMessage` patterns
 *                           if they are also routed through this IPC mechanism for consistency,
 *                           though VS Code primarily uses "vscode:" prefixed channels.
 * @returns True if the channel is valid, false otherwise. Errors are logged to the console.
 */
function validateIPCChannel(
	channel: string,
	allowNonPrefixed: boolean = false,
): boolean {
	if (!channel) {
		// Check for falsy channel names.
		console.error(
			`[Sky Host Bridge] Invalid IPC channel: Channel name is falsy (null, undefined, or empty string).`,
		);
		return false;
	}
	if (!allowNonPrefixed && !channel.startsWith("vscode:")) {
		console.error(
			`[Sky Host Bridge] Invalid IPC channel: '${channel}'. Channels MUST start with 'vscode:'. This is a security and convention measure.`,
		);
		return false;
	}
	return true; // Channel is valid.
}

/** Implementation of the `IpcRendererShim` interface. */
const ipcRendererShimInstance: IpcRendererShim = {
	/**
	 * Sends a message to the main process (Mountain) asynchronously via a Tauri command.
	 * This simulates `ipcRenderer.send`.
	 * @param channel - The IPC channel name. Must start with "vscode:".
	 * @param args - Arguments to send with the message.
	 */
	send: (channel: string, ...args: any[]): void => {
		if (!validateIPCChannel(channel)) {
			return; // Do not proceed if channel is invalid.
		}
		// console.debug(`[Sky Host Bridge] ipcRenderer.send: Channel='${channel}', Args=`, args);
		// Invoke a Tauri command on Mountain to handle the "send" operation.
		// Arguments are passed as a named field `argsList` in the payload.
		invoke("mountain_ipc_bridge_send", { channel, argsList: args }).catch(
			(error: any) =>
				console.error(
					`[Sky Host Bridge] Error in ipcRenderer.send (Tauri invoke) for channel '${channel}':`,
					error,
				),
		);
	},

	/**
	 * Sends a message to the main process (Mountain) and gets a promise that resolves with the response.
	 * This simulates `ipcRenderer.invoke`.
	 * @param channel - The IPC channel name. Must start with "vscode:".
	 * @param args - Arguments to send with the message.
	 * @returns A promise that resolves with the response from Mountain or rejects on error.
	 */
	invoke: async (channel: string, ...args: any[]): Promise<any> => {
		if (!validateIPCChannel(channel)) {
			// If channel is invalid, reject the promise as per Electron's behavior.
			return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
		}
		// console.debug(`[Sky Host Bridge] ipcRenderer.invoke: Channel='${channel}', Args=`, args);
		try {
			// Invoke a Tauri command on Mountain to handle the "invoke" operation.
			return await invoke("mountain_ipc_bridge_invoke", {
				channel,
				argsList: args,
			});
		} catch (error) {
			console.error(
				`[Sky Host Bridge] Error in ipcRenderer.invoke for channel '${channel}':`,
				error,
			);
			throw error; // Rethrow to propagate the failure to the caller in workbench.js.
		}
	},

	/**
	 * Listens to `channel`, when a new message arrives `listener` would be called with
	 * `listener(event, ...args)`.
	 * This simulates `ipcRenderer.on` using Tauri events.
	 * @param channel - The IPC channel name.
	 * @param listener - The callback function to execute when a message is received.
	 * @returns The `ipcRendererShimInstance` for chaining.
	 */
	on: (
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		// Allow non-"vscode:" prefixed channels for generic window messages like 'message'
		// if contextBridge is not used for everything and raw window.postMessage is captured.
		// However, VS Code's workbench primarily uses 'vscode:' prefixed channels for its own IPC.
		const allowNonStandardPrefix = channel === "message";
		if (!validateIPCChannel(channel, allowNonStandardPrefix)) {
			return ipcRendererShimInstance; // Return self if channel is invalid.
		}

		// console.debug(`[Sky Host Bridge] ipcRenderer.on: Registering listener for Channel='${channel}'`);

		// Get or create the map of listeners for this channel.
		const channelListeners =
			tauriListenerMap.get(channel) ||
			new Map<Function, UnlistenFn | Promise<UnlistenFn>>();
		tauriListenerMap.set(channel, channelListeners);

		// Prevent duplicate registrations of the exact same listener function.
		if (channelListeners.has(listener)) {
			console.warn(
				`[Sky Host Bridge] ipcRenderer.on: Listener already registered for channel '${channel}'. Ignoring duplicate registration.`,
			);
			return ipcRendererShimInstance;
		}

		// Use Tauri's `listen` to subscribe to events from Mountain on this channel.
		const tauriUnlistenPromise: Promise<UnlistenFn> = listen(
			channel,
			(tauriEvent: TauriEvent<any[]>) => {
				// `tauriEvent.payload` is expected to be an array of arguments.
				// console.debug(`[Sky Host Bridge] ipcRenderer.on: Event received on Channel='${channel}', Payload=`, tauriEvent.payload);
				// Create a shim event object.
				const eventShim: IpcRendererEventShim = {
					sender: ipcRendererShimInstance,
				};
				try {
					// Call the original listener with the shim event and spread payload as arguments.
					listener(eventShim, ...(tauriEvent.payload || []));
				} catch (errorInListener) {
					console.error(
						`[Sky Host Bridge] Error occurred within listener for channel '${channel}':`,
						errorInListener,
					);
					// TODO: Consider if this should invoke a global error handler or send an error report to Mountain.
				}
			},
		);

		// Store the promise for the UnlistenFn initially.
		channelListeners.set(listener, tauriUnlistenPromise);

		// When the promise resolves, replace it with the actual UnlistenFn.
		tauriUnlistenPromise
			.then((unlistenFunction) => {
				// Check if the listener is still associated with this promise (i.e., not removed or replaced).
				if (channelListeners.get(listener) === tauriUnlistenPromise) {
					channelListeners.set(listener, unlistenFunction); // Store the actual UnlistenFn.
				} else {
					// If the listener was removed or its entry changed while the promise was pending,
					// execute the unlisten function now to prevent dangling listeners.
					unlistenFunction();
					// If truly removed (not just replaced by 'once' logic, which might store the UnlistenFn directly)
					if (!channelListeners.has(listener)) {
						// This state should ideally be handled by `removeListener` making the entry undefined.
						// `channelListeners.delete(listener)` should have been called by `removeListener`.
					}
				}
			})
			.catch((error) => {
				console.error(
					`[Sky Host Bridge] Error setting up Tauri event listener for channel '${channel}':`,
					error,
				);
				channelListeners.delete(listener); // Clean up map entry if listener setup failed.
			});

		return ipcRendererShimInstance; // Allow chaining.
	},

	/**
	 * Adds a one-time `listener` function for the event. This `listener` is invoked
	 * only the next time a message is sent to `channel`, after which it is removed.
	 * This simulates `ipcRenderer.once`.
	 * @param channel - The IPC channel name.
	 * @param listener - The callback function.
	 * @returns The `ipcRendererShimInstance` for chaining.
	 */
	once: (
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		if (!validateIPCChannel(channel)) {
			return ipcRendererShimInstance;
		}
		// console.debug(`[Sky Host Bridge] ipcRenderer.once: Registering one-time listener for Channel='${channel}'`);

		let unlistenFunctionReference: UnlistenFn | null = null;

		// Wrapper function that calls the original listener and then unlistens.
		const oneTimeListenerWrapper = (tauriEvent: TauriEvent<any[]>) => {
			// console.debug(`[Sky Host Bridge] ipcRenderer.once: One-time event received on Channel='${channel}', Payload=`, tauriEvent.payload);
			// Unsubscribe after the first invocation.
			if (unlistenFunctionReference) {
				unlistenFunctionReference();
				const currentChannelListeners = tauriListenerMap.get(channel);
				currentChannelListeners?.delete(listener); // Also remove original listener reference from our map.
			}
			// Create and pass the shim event.
			const eventShim: IpcRendererEventShim = {
				sender: ipcRendererShimInstance,
			};
			try {
				listener(eventShim, ...(tauriEvent.payload || []));
			} catch (errorInListener) {
				console.error(
					`[Sky Host Bridge] Error occurred within one-time listener for channel '${channel}':`,
					errorInListener,
				);
			}
		};

		// Subscribe using Tauri's `listen`.
		const tauriUnlistenPromise = listen(channel, oneTimeListenerWrapper);

		// Store the original listener with its unlisten promise in the map to allow `removeListener` to work.
		const channelListeners =
			tauriListenerMap.get(channel) ||
			new Map<Function, UnlistenFn | Promise<UnlistenFn>>();
		tauriListenerMap.set(channel, channelListeners);
		channelListeners.set(listener, tauriUnlistenPromise); // Store original listener mapped to the promise.

		// When the promise resolves, update the stored reference and map.
		tauriUnlistenPromise
			.then((unlistenFn) => {
				unlistenFunctionReference = unlistenFn;
				// Check if the listener entry in the map is still this promise (i.e., not removed by `removeListener`).
				// If `removeListener` was called, the entry might be gone or changed.
				if (
					channelListeners.get(listener) !== tauriUnlistenPromise &&
					channelListeners.get(listener) !== unlistenFunctionReference
				) {
					// Listener was removed externally before this promise resolved. Ensure it's unlistened.
					unlistenFn();
				} else {
					// Store the actual unlisten function. This allows `removeListener` to call it directly if needed
					// before the `once` listener fires.
					channelListeners.set(listener, unlistenFn);
				}
			})
			.catch((error) => {
				console.error(
					`[Sky Host Bridge] Error setting up one-time Tauri listener for channel '${channel}':`,
					error,
				);
				channelListeners.delete(listener); // Clean up map entry on error.
			});

		return ipcRendererShimInstance;
	},

	/**
	 * Removes the specified `listener` from the listener array for the specified `channel`.
	 * This simulates `ipcRenderer.removeListener`.
	 * @param channel - The IPC channel name.
	 * @param listener - The listener function to remove.
	 * @returns The `ipcRendererShimInstance` for chaining.
	 */
	removeListener: (
		channel: string,
		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		const allowNonStandardPrefix = channel === "message";
		if (!validateIPCChannel(channel, allowNonStandardPrefix)) {
			return ipcRendererShimInstance;
		}
		// console.debug(`[Sky Host Bridge] ipcRenderer.removeListener: Attempting for Channel='${channel}'`);

		const channelListeners = tauriListenerMap.get(channel);
		if (channelListeners) {
			const unlistenOrPromise = channelListeners.get(listener);
			if (unlistenOrPromise) {
				if (typeof unlistenOrPromise === "function") {
					// It's an UnlistenFn, call it directly.
					unlistenOrPromise();
				} else {
					// It's a Promise<UnlistenFn>. Chain a `then` to call the unlisten function when it resolves.
					// This handles cases where `removeListener` is called before Tauri's `listen` promise resolves.
					unlistenOrPromise
						.then((unlistenFunction) => unlistenFunction())
						.catch((error) =>
							console.warn(
								`[Sky Host Bridge] Error during eventual unlisten for channel '${channel}' (called via removeListener on a pending promise):`,
								error,
							),
						);
				}
				// Remove the listener from our map immediately.
				channelListeners.delete(listener);
			}
		}
		return ipcRendererShimInstance;
	},

	// `postMessage` for MessagePort transfer is stubbed.
	// postMessage: (channel: string, message: any, transfer?: MessagePort[]): void => {
	// 	console.warn(`[Sky Host Bridge] STUB: ipcRenderer.postMessage for channel '${channel}' called. MessagePort transfer is not supported in this shim environment.`);
	// }
};

/** Implementation of the `IpcMessagePortShim` interface. */
const ipcMessagePortShimInstance: IpcMessagePortShim = {
	/**
	 * Acquires a MessagePort for communication, typically with the extension host.
	 * This is a complex feature to shim without Electron's native MessageChannel capabilities.
	 * In this Tauri-based shim, it's currently a STUB.
	 * @param responseChannel - The channel on which the main process (Mountain) is expected to send back the MessagePort.
	 * @param nonce - A nonce for security and matching responses.
	 */
	acquire: (responseChannel: string, nonce: string): void => {
		// Detailed explanation of why this is complex and stubbed:
		// In Electron, `acquire` works as follows:
		// 1. Renderer's preload script sends a message (e.g., "vscode:acquirePort") to the main process,
		//    including `responseChannel` and `nonce`.
		// 2. The Electron main process creates a new `MessageChannel`.
		// 3. The main process sends one of the `MessageChannel.port1` or `MessageChannel.port2` objects
		//    back to the renderer on the specified `responseChannel`, along with the `nonce`.
		//    The port is transferred (moved, not copied) over IPC.
		// 4. The preload script, listening on `responseChannel`, receives this event. The transferred port
		//    is available in `event.ports[0]`.
		// 5. The preload script then uses `window.postMessage({ nonce: nonce, port: event.ports[0] }, "*", [event.ports[0]])`
		//    to deliver the `MessagePort` to the sandboxed window content (workbench.js).
		//
		// Challenges with Tauri:
		// - Tauri's core invoke/event system does not natively support transferring `MessagePort` objects.
		// - Replicating this would require a custom solution:
		//   - Option A (Very Complex): Implement a custom data streaming proxy using WebSockets or a dedicated
		//     Tauri plugin that can manage and relay raw data streams between the webview and Rust, effectively
		//     simulating `MessagePort` behavior. This is a significant undertaking.
		//   - Option B (Feature-Specific Alternative): Identify if VS Code features *critically* depend on this exact
		//     `acquire` mechanism for general `MessagePort`s. If it's used for specific, known communication channels
		//     (e.g., between the renderer and an extension host process like Cocoon), Mountain might establish
		//     alternative communication channels (like a dedicated WebSocket or a different set of Tauri events/invokes
		//     for that specific purpose). This `acquire` shim could then either be a NOP (if the alternative
		//     is always active) or potentially initiate that alternative setup.
		//   - Option C (Current MVP Stub): Log a warning and do nothing. Features relying on these dynamically
		//     acquired `MessagePort`s will not function correctly.
		console.warn(
			`[Sky Host Bridge] STUB: ipcMessagePort.acquire(responseChannel: '${responseChannel}', nonce: '${nonce}') called. ` +
				`Full MessagePort transfer as in Electron is NOT SUPPORTED in this shim. ` +
				`Features relying on this mechanism (e.g., certain types of extension host communication or shared workers) may not work.`,
		);

		// To prevent code in workbench.js that might be awaiting a `window.on('message', ...)` event
		// (expecting the port delivery via `window.postMessage`) from hanging indefinitely,
		// one *could* emit a dummy error message on the window after a timeout.
		// However, this is speculative and depends heavily on how the callers of `acquire` behave.
		// It might be too intrusive or cause other issues. For now, it's a NOP that logs.
		// Example of such a speculative error emission:
		// setTimeout(() => {
		//     window.postMessage({ error: `MessagePort for nonce ${nonce} not available (not supported in this environment)` }, "*");
		// }, 100); // Short delay.
	},
};

/** Implementation of the `WebFrameShim` interface. */
const webFrameShimInstance: WebFrameShim = {
	/**
	 * Sets the zoom level of the web frame.
	 * @param level - The desired zoom level.
	 */
	setZoomLevel: (level: number): void => {
		if (typeof level === "number" && isFinite(level)) {
			// console.debug(`[Sky Host Bridge] webFrame.setZoomLevel: Level=${level}`);
			// Invoke a Tauri command on Mountain to handle setting the zoom level.
			invoke("mountain_set_zoom_level", { level }).catch((error: any) =>
				console.error(
					"[Sky Host Bridge] Error calling mountain_set_zoom_level via Tauri invoke:",
					error,
				),
			);
		} else {
			console.warn(
				`[Sky Host Bridge] webFrame.setZoomLevel: Invalid zoom level provided: ${level}`,
			);
		}
	},

	/**
	 * Gets the current zoom level of the web frame.
	 * VS Code workbench queries this, so it needs to return a meaningful value.
	 * @returns The current zoom level, or 0 if not yet determined.
	 */
	getZoomLevel: (): number => {
		// Ideally, Mountain would provide the current zoom level, perhaps via the configuration.
		// If `resolvedConfigurationCache` is available and has `zoomLevel`, use that.
		const zoomLevelFromConfig = resolvedConfigurationCache?.zoomLevel;
		if (typeof zoomLevelFromConfig === "number") {
			return zoomLevelFromConfig;
		}
		// Fallback to a default value if not available.
		// console.warn("[Sky Host Bridge] webFrame.getZoomLevel: Zoom level not found in cached configuration. Returning default (0).");
		return 0;
	},
};

/**
 * Implementation of the `ProcessShim` interface.
 * This object is heavily dependent on data from `resolvedConfigurationCache`.
 * It provides initial defaults, which are then updated once `context.resolveConfiguration()` completes.
 */
const processShimInstance: ProcessShim = {
	// Determine platform based on `navigator.platform`. This is a common client-side approximation.
	// Mountain should provide the canonical platform in `ISandboxConfiguration`.
	platform: (navigator.platform.toLowerCase().includes("mac")
		? "darwin"
		: navigator.platform.toLowerCase().includes("win")
			? "win32"
			: "linux") as ProcessShim["platform"], // Default to Linux if not Mac or Windows.
	arch: "x64" as ProcessShim["arch"], // Common default; Mountain should provide the actual architecture.
	env: {}, // Will be populated from `ISandboxConfiguration.userEnv` after `resolveConfiguration`.
	versions: {
		// Initial minimal versions. Mountain should provide more accurate/relevant versions.
		// `(window as any).FIDDEE_VERSION` assumes a global variable is set by the build process (e.g., Astro).
		fiddee: (window as any).FIDDEE_VERSION || "0.0.0-dev", // Application version.
		// Attempt to get webview runtime (e.g., Chrome) version from user agent.
		webview_runtime:
			navigator.userAgent.match(
				/(Chrome|Firefox|Safari|Edge?)\/([\d.]+)/,
			)?.[0] || "unknown",
		// `node` and `electron` versions are not applicable in a Tauri webview.
	},
	type: "renderer", // This script runs in the renderer context.
	execPath: "FIDDEE.app/Contents/MacOS/fiddee", // Placeholder; Mountain provides the actual path.
	sandboxed: true, // VS Code's sandboxed renderer typically expects this to be true.
	contextIsolated: false, // In Tauri, the JavaScript context of this bridge script is usually the same as the webview content,
	// unlike Electron's `contextBridge` which creates isolation.
	आटा: false, // `isNsfw` / `devMode` equivalent in VS Code (`nodeCachedDataEnabled()`), typically false for sandboxed renderers.
	resourcesPath: "/placeholder/application_resources", // Placeholder; Mountain provides the actual path.

	/**
	 * Gets the current working directory.
	 * This should be consistently provided by Mountain, e.g., via `ISandboxConfiguration`.
	 * @returns The current working directory path.
	 */
	cwd: (): string => {
		const config = resolvedConfigurationCache; // Use the cached configuration.
		// If VSCODE_CWD is provided in the config, use that.
		if (config?.VSCODE_CWD && typeof config.VSCODE_CWD === "string") {
			return config.VSCODE_CWD;
		}
		// As a fallback, try to use the home directory from the config.
		if (config?.homeDir && typeof config.homeDir === "string") {
			try {
				// Assuming homeDir is a file URI, convert it to a filesystem path.
				return URI.parse(config.homeDir).fsPath;
			} catch (error) {
				console.warn(
					`[Sky Host Bridge] Error parsing homeDir URI ('${config.homeDir}') for cwd():`,
					error,
				);
			}
		}
		// Absolute fallback if no other CWD source is available.
		console.warn(
			"[Sky Host Bridge] process.cwd() called; CWD not available from configuration. Returning '/' as an absolute fallback. This might cause issues.",
		);
		return "/";
	},

	/**
	 * Gets shell environment variables.
	 * Fetches these from Mountain via a Tauri invoke call.
	 * @returns A promise resolving to a record of environment variables.
	 */
	shellEnv: async (): Promise<Record<string, string | undefined>> => {
		// console.debug("[Sky Host Bridge] process.shellEnv() called. Invoking 'mountain_fetch_shell_env'.");
		try {
			// Call the Rust command to get shell environment variables.
			return (await invoke("mountain_fetch_shell_env")) as Record<
				string,
				string | undefined
			>;
		} catch (error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_fetch_shell_env via Tauri invoke:",
				error,
			);
			return {}; // Fallback to an empty object on error.
		}
	},

	/**
	 * Gets process memory information.
	 * Fetches this from Mountain via a Tauri invoke call.
	 * Note: VS Code uses `private` and `shared` (e.g., `privateBytes`, `sharedBytes`).
	 * The Tauri backend might provide different names (e.g., `private_bytes`, `shared_bytes`, `resident_set_size`).
	 * This shim maps them to the structure VS Code expects.
	 * @returns A promise resolving to memory information.
	 */
	getProcessMemoryInfo: async (): Promise<{
		privateBytes: number;
		sharedBytes: number;
		residentSet: number;
	}> => {
		// console.debug("[Sky Host Bridge] process.getProcessMemoryInfo() called. Invoking 'mountain_get_process_memory_info'.");
		try {
			// Call the Rust command.
			const memoryInfoFromMountain = (await invoke(
				"mountain_get_process_memory_info",
			)) as {
				private_bytes?: number; // Optional to handle cases where backend might not provide all fields.
				shared_bytes?: number;
				resident_set_size?: number;
			};
			// Map to VS Code's expected property names, providing defaults if fields are missing.
			return {
				privateBytes: memoryInfoFromMountain.private_bytes ?? 0,
				sharedBytes: memoryInfoFromMountain.shared_bytes ?? 0,
				residentSet: memoryInfoFromMountain.resident_set_size ?? 0, // `residentSet` is an alias for `rss` / `resident_set_size`.
			};
		} catch (error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_get_process_memory_info via Tauri invoke:",
				error,
			);
			// Fallback to zeroed values on error.
			return { privateBytes: 0, sharedBytes: 0, residentSet: 0 };
		}
	},

	/**
	 * Attaches a listener for process events.
	 * For `uncaughtException`, it shims this to `window.onerror`.
	 * Most other Node.js process events are not applicable or actively proxied in a webview.
	 * @param type - The event type (e.g., "uncaughtException").
	 * @param callback - The callback function.
	 */
	on: (type: string, callback: (...args: any[]) => void): void => {
		if (type === "uncaughtException") {
			// VS Code's `workbench.ts` (or similar entry point) specifically listens for 'uncaughtException' on `process`.
			// We can shim this to use `window.onerror`. This is not a perfect 1:1 match for Node.js's
			// `process.on('uncaughtException', ...)` behavior, but it's the closest equivalent for browser-like environments.
			const existingOnErrorHandler = window.onerror;
			window.onerror = function (
				messageOrEvent,
				source,
				lineno,
				colno,
				errorObject,
			) {
				// Pass the error object if available, otherwise create one from the message.
				callback(errorObject || new Error(messageOrEvent as string));
				// Chain to any existing onerror handler.
				if (existingOnErrorHandler) {
					return existingOnErrorHandler.apply(this, arguments as any);
				}
				return false; // Default browser behavior for unhandled errors.
			};
			console.debug(
				"[Sky Host Bridge] process.on('uncaughtException') call shimmed to use window.onerror.",
			);
		} else {
			// For other event types, log a warning as they are generally not proxied.
			console.warn(
				`[Sky Host Bridge] STUB: process.on('${type}') called in webview. This event is not actively proxied from the actual host process events for most types.`,
			);
		}
	},
};

/** Implementation of the `ContextShim` interface. */
const contextShimInstance: ContextShim = {
	/**
	 * Synchronously returns the cached workbench configuration.
	 * If the configuration has not yet been resolved from Mountain, this returns `undefined`.
	 * VS Code's workbench startup code is designed to handle an initial `undefined` return.
	 * @returns The cached `ISandboxConfiguration` or `undefined`.
	 */
	configuration: (): ISandboxConfiguration | undefined => {
		if (!resolvedConfigurationCache) {
			// This log can be noisy if called frequently before resolution.
			// console.debug("[Sky Host Bridge] context.configuration() called before configuration has been resolved from Mountain. Returning undefined.");
		}
		return resolvedConfigurationCache;
	},

	/**
	 * Asynchronously fetches and resolves the workbench configuration from Mountain.
	 * This is a critical step for workbench initialization. The result is cached.
	 * @returns A promise that resolves with the `ISandboxConfiguration`.
	 * @throws An error if fetching or parsing the configuration fails, which is considered fatal.
	 */
	resolveConfiguration: (): Promise<ISandboxConfiguration> => {
		// If already resolved, return the cached configuration immediately.
		if (resolvedConfigurationCache) {
			// console.debug("[Sky Host Bridge] context.resolveConfiguration: Returning cached workbench configuration.");
			return Promise.resolve(resolvedConfigurationCache);
		}
		// If a fetch is already in progress, return the existing promise to avoid duplicate calls.
		if (resolveConfigurationPromise) {
			return resolveConfigurationPromise;
		}

		console.log(
			"[Sky Host Bridge] context.resolveConfiguration: Attempting to fetch workbench configuration from Mountain via 'mountain_get_workbench_configuration'...",
		);
		// Store the promise for this fetch operation.
		resolveConfigurationPromise = invoke(
			"mountain_get_workbench_configuration",
		)
			.then((configDataFromMountain: ISandboxConfiguration) => {
				// Validate the received configuration data.
				if (
					!configDataFromMountain ||
					typeof configDataFromMountain !== "object"
				) {
					throw new Error(
						"Received invalid or empty configuration object from Mountain.",
					);
				}
				resolvedConfigurationCache =
					configDataFromMountain as ISandboxConfiguration; // Cache the resolved configuration.
				console.log(
					"[Sky Host Bridge] Workbench configuration successfully resolved from Mountain and cached.",
				);

				// Once the configuration is resolved, update parts of the `processShimInstance`
				// with more accurate data obtained from Mountain.
				if (resolvedConfigurationCache.userEnv) {
					Object.assign(
						processShimInstance.env,
						resolvedConfigurationCache.userEnv,
					);
				}
				if (resolvedConfigurationCache.platform) {
					(processShimInstance as any).platform =
						resolvedConfigurationCache.platform;
				}
				if (resolvedConfigurationCache.arch) {
					(processShimInstance as any).arch =
						resolvedConfigurationCache.arch;
				}
				if (resolvedConfigurationCache.versions) {
					(processShimInstance as any).versions = {
						...(processShimInstance.versions || {}),
						...resolvedConfigurationCache.versions,
					};
				}
				if (resolvedConfigurationCache.execPath) {
					(processShimInstance as any).execPath =
						resolvedConfigurationCache.execPath;
				}

				// Determine and set `process.resourcesPath`.
				// VS Code often expects `process.resourcesPath` to be a filesystem path.
				let resourcesFilesystemPath: string =
					"/app_resources_placeholder"; // Default placeholder.
				try {
					if (resolvedConfigurationCache.resourcesPath) {
						// If `resourcesPath` is a file URI, convert it to an fsPath.
						// If it's already an fsPath or another type of URI (e.g., http for web builds), use as is.
						resourcesFilesystemPath =
							resolvedConfigurationCache.resourcesPath.startsWith(
								"file://",
							)
								? URI.parse(
										resolvedConfigurationCache.resourcesPath,
									).fsPath
								: resolvedConfigurationCache.resourcesPath;
					} else if (
						resolvedConfigurationCache.appRoot &&
						resolvedConfigurationCache.appRoot.startsWith("file://")
					) {
						// Fallback to `appRoot` if `resourcesPath` is missing and `appRoot` is a file URI.
						resourcesFilesystemPath = URI.parse(
							resolvedConfigurationCache.appRoot,
						).fsPath;
					}
				} catch (uriParseError) {
					console.warn(
						`[Sky Host Bridge] Error parsing resourcesPath ('${resolvedConfigurationCache.resourcesPath}') or appRoot ('${resolvedConfigurationCache.appRoot}') from configuration for process.resourcesPath:`,
						uriParseError,
					);
				}
				(processShimInstance as any).resourcesPath =
					resourcesFilesystemPath;

				// Apply the initial zoom level from the resolved configuration, if present.
				if (typeof resolvedConfigurationCache.zoomLevel === "number") {
					webFrameShimInstance.setZoomLevel(
						resolvedConfigurationCache.zoomLevel,
					);
				}

				return resolvedConfigurationCache; // Return the resolved configuration.
			})
			.catch((error: { name: any; message: any; stack: any }) => {
				console.error(
					"[Sky Host Bridge] CRITICAL: Failed to resolve workbench configuration from Mountain. Workbench startup will likely fail.",
					error,
				);
				// Display a prominent error message in the UI, as this is a fatal error for startup.
				const errorMessageHtml = `
					<div style="color: #CD3131; background: #252526; padding:20px; font-family:sans-serif; height: 100vh; overflow: auto; box-sizing: border-box;">
						<h1>Application Startup Error (FIDDEE Sky Host Bridge)</h1>
						<p>Could not load essential startup configuration from the host application (Mountain). The application might not be able to start correctly.</p>
						<h3>Error Details:</h3>
						<pre style="text-align:left; background:#1E1E1E; color: #D4D4D4; padding:10px; border-radius:4px; white-space:pre-wrap; word-wrap:break-word;">${error instanceof Error ? `${error.name}: ${error.message}\n${error.stack || "(No stack trace available)"}` : String(error)}</pre>
					</div>`;
				// Attempt to set body.innerHTML. If body isn't ready, use document.write as a last resort (less ideal).
				if (document.body) {
					document.body.innerHTML = errorMessageHtml;
				} else {
					document.write(errorMessageHtml);
				}
				throw error; // Rethrow the error to ensure the promise chain remains rejected.
			});
		return resolveConfigurationPromise; // Return the promise for this fetch operation.
	},
};

/** Implementation of the `WebUtilsShim` interface. */
const webUtilsShimInstance: WebUtilsShim = {
	/**
	 * Attempts to get a filesystem path for a `File` object.
	 * This is a STUB in the webview environment. In standard web browsers, `File` objects
	 * (e.g., from `<input type="file">` or Drag-and-Drop) do not expose their full system path
	 * due to security restrictions. Electron's `webUtils.getPathForFile` can retrieve this
	 * because it operates in a more privileged context.
	 * @param file - The `File` object.
	 * @returns The file name, or `file.path` if (non-standardly) available. Full path resolution is limited.
	 */
	getPathForFile: (file: File): string => {
		// `file.path` is a non-standard property sometimes added by Electron or Node.js environments.
		// In a pure webview, we typically only have `file.name`.
		const filePath = (file as any).path || file.name;
		// This warning can be noisy if `getPathForFile` is called often.
		// console.warn(
		// 	`[Sky Host Bridge] STUB: webUtils.getPathForFile called for file '${file.name}'. ` +
		// 	`Returning name or non-standard path: '${filePath}'. Full system path resolution for arbitrary File objects ` +
		// 	`obtained from web APIs (like Drag-and-Drop or <input type="file">) is limited in a webview environment. ` +
		// 	`Path resolution relies on how the File object was obtained (e.g., from Tauri dialogs or ` +
		// 	`Tauri Drag-and-Drop events that explicitly provide paths).`
		// );
		return filePath;
	},
};

/**
 * The global `window.vscode` object that shims the APIs expected by VS Code's workbench.js.
 * This object structure MUST align with `IMainWindowSandboxGlobals`.
 */
const skyHostApiGlobal = {
	ipcRenderer: ipcRendererShimInstance,
	ipcMessagePort: ipcMessagePortShimInstance,
	webFrame: webFrameShimInstance,
	process: processShimInstance,
	context: contextShimInstance,
	webUtils: webUtilsShimInstance,
};

// --- Global Exposure & Early Initialization ---

// Check if `window.vscode` already exists. This is a sanity check.
if ((window as any).vscode) {
	console.warn(
		"[Sky Host Bridge] `window.vscode` object already exists. It will be overwritten by the Sky Host Bridge. " +
			"This might indicate that the bridge script is being loaded multiple times or there's a conflict. " +
			"Ensure this script loads exactly once and before any VS Code workbench scripts.",
	);
}

// Expose the shimmed API globally as `window.vscode`.
(window as any).vscode = skyHostApiGlobal;

console.log(
	"[Sky Host Bridge] `window.vscode` shim has been successfully attached to the window object. " +
		"VS Code Workbench UI (`workbench.js`) can now attempt to load and initialize using this bridge " +
		"to communicate with the Mountain (Tauri Rust backend).",
);

// Immediately trigger the asynchronous resolution of the workbench configuration.
// VS Code's `workbench.js` (specifically `desktop.main.ts`) will call `context.resolveConfiguration()`
// and await its result early in its startup sequence. By starting the fetch here,
// the configuration might already be available or in flight when `workbench.js` requests it.
// Errors during this critical step are handled within `resolveConfiguration` (logged and displayed in UI).
contextShimInstance.resolveConfiguration().catch((_error) => {
	// The error is already logged and potentially displayed in the UI by `resolveConfiguration`.
	// No further action is strictly needed here, as workbench loading will likely be halted or severely impaired.
	// This .catch() here primarily serves to prevent an "unhandled promise rejection" at the global level for this specific call.
});
