/*---------------------------------------------------------------------------------------------
 * Sky Host Bridge  - Wind Package
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
 * `IMainWindowSandboxGlobals` interface (found in `vs/base/parts/sandbox/electron-browser/globals.ts`).
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
 * This version incorporates fallbacks for configuration if the Mountain backend is unavailable,

 * allowing the workbench to attempt loading in a degraded state.
 *--------------------------------------------------------------------------------------------*/

// --- Tauri API Imports ---
import {
	listen,
	type Event as TauriEvent,
	type UnlistenFn,
} from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
// --- VS Code Utility Imports (Bundled with Sky or from a shared location) ---
import { URI } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/uri.js";
import { generateUuid } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/uuid.js";
import { LogLevel } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/log/common/log.js";

// --- Type Definitions (Shim Interfaces) ---
interface IpcRendererEventShim {
	sender: IpcRendererShim;
}

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
}

interface IpcMessagePortShim {
	acquire(responseChannel: string, nonce: string): void;
}

interface WebFrameShim {
	setZoomLevel(level: number): void;

	getZoomLevel(): number;
}

interface ProcessShim {
	readonly platform: "win32" | "linux" | "darwin";

	readonly arch: "x64" | "arm64" | "ia32";

	readonly env: Record<string, string | undefined>;

	readonly versions: Record<string, string | undefined>;

	readonly type: "renderer";

	readonly execPath: string;

	readonly sandboxed: true;

	readonly contextIsolated: boolean;

	// isNsfw / devMode (maps to nodeCachedDataEnabled())
	readonly आटा: boolean;

	// Filesystem path
	readonly resourcesPath: string;

	readonly mas?: boolean;

	readonly windowsStore?: boolean;

	readonly linuxManualInstall?: boolean;

	cwd(): string;

	shellEnv(): Promise<Record<string, string | undefined>>;

	getProcessMemoryInfo(): Promise<{
		privateBytes: number;

		sharedBytes: number;

		residentSet: number;
	}>;

	on(type: "uncaughtException", callback: (error: Error) => void): void;

	on(type: string, callback: (...args: any[]) => void): void;
}

interface ContextShim {
	configuration(): ISandboxConfiguration | undefined;

	resolveConfiguration(): Promise<ISandboxConfiguration>;
}

interface WebUtilsShim {
	getPathForFile(file: File): string;
}

interface ISandboxConfiguration {
	windowId: number;

	machineId: string;

	sqmId?: string;

	sessionId: string;

	logLevel: LogLevel;

	userEnv: Record<string, string | undefined>;

	// URI string
	appRoot: string;

	appName: string;

	appUriScheme: string;

	appLanguage: string;

	appHost: "desktop" | "web" | "codespaces" | string;

	productQuality?: string;

	platform: ProcessShim["platform"];

	arch: ProcessShim["arch"];

	versions: ProcessShim["versions"];

	// Filesystem path
	execPath: string;

	zoomLevel?: number;

	// URI string
	homeDir: string;

	// URI string
	tmpDir: string;

	// URI string
	userDataDir: string;

	// URI string
	backupPath?: string;

	crashReporterId?: string;

	nls: {
		messages: Record<string, string>;

		language: string;

		availableLanguages: Record<string, string>;

		pseudo?: boolean;
	};

	productConfiguration: { [key: string]: any };

	// Filesystem path
	VSCODE_CWD?: string;

	// Filesystem path (this is what process.resourcesPath should point to)
	resourcesPath: string;

	// Allow other fields VS Code might expect
	[key: string]: any;
}

// --- Global State for the Bridge ---
let resolvedConfigurationCache: ISandboxConfiguration | undefined = undefined;

let resolveConfigurationPromise: Promise<ISandboxConfiguration> | null = null;

const tauriListenerMap = new Map<
	string,
	Map<Function, UnlistenFn | Promise<UnlistenFn>>
>();

// --- Helper: Fallback ISandboxConfiguration ---
function getFallbackSandboxConfiguration(): ISandboxConfiguration {
	console.warn(
		"[Sky Host Bridge] CRITICAL: Constructing fallback ISandboxConfiguration. Mountain backend did not provide configuration. Workbench functionality will be SEVERELY limited or broken.",
	);

	const fallbackMachineId = generateUuid();

	const fallbackSessionId = generateUuid();

	const fallbackOrigin =
		typeof window !== "undefined" ? window.location.origin : "file://";

	const fallbackAppRootFromGlobal = (globalThis as any)._VSCODE_FILE_ROOT;

	const fallbackAppRoot = fallbackAppRootFromGlobal
		? fallbackAppRootFromGlobal.startsWith("file://")
			? fallbackAppRootFromGlobal
			: // Ensure it's a file URI if not already
				`file://${fallbackAppRootFromGlobal}`
		: // Absolute fallback
			`${fallbackOrigin}/Static/Application/`;

	console.warn(
		`[Sky Host Bridge] Using fallback appRoot (URI string): ${fallbackAppRoot}.`,
	);

	const navPlatform =
		typeof navigator !== "undefined"
			? navigator.platform.toLowerCase()
			: "";

	const derivedPlatform: ProcessShim["platform"] = navPlatform.includes("mac")
		? "darwin"
		: navPlatform.includes("win")
			? "win32"
			: "linux";

	// Default
	let derivedArch: ProcessShim["arch"] = "x64";

	if (
		typeof navigator !== "undefined" &&
		(navigator as any).userAgentData?.architecture
	) {
		const navArch = (navigator as any).userAgentData.architecture;

		if (navArch === "arm" || navArch === "aarch64") {
			// "arm" can mean arm64 in userAgentData
			derivedArch = "arm64";
		}
	}

	const derivedVersions: Record<string, string | undefined> = {
		fiddee: (window as any).FIDDEE_VERSION || "0.0.0-fallback",

		webview_runtime:
			navigator.userAgent.match(
				/(Chrome|Firefox|Safari|Edge?)\/([\d.]+)/,
			)?.[0] || "unknown",
	};

	const fallbackHomeDir = `file:///home/fallback_user_${generateUuid()}`;

	// Must be a direct fs path
	const fallbackResourcesPath = "/app/fallback_resources";

	return {
		// Ensure non-zero
		windowId: Math.floor(Math.random() * 100000) + 1,

		machineId: fallbackMachineId,

		sessionId: fallbackSessionId,

		logLevel: LogLevel.Info,

		userEnv: { FALLBACK_MODE: "true" },

		// URI
		appRoot: fallbackAppRoot,

		appName: "FIDDEE (Fallback Mode)",

		appUriScheme: "fiddee-fallback",

		appLanguage:
			(typeof navigator !== "undefined" ? navigator.language : "en") ||
			"en",

		appHost: "desktop",

		productQuality: "development",

		platform: derivedPlatform,

		arch: derivedArch,

		versions: derivedVersions,

		// Filesystem path
		execPath: "/app/FIDDEE_fallback_executable",

		// URI
		homeDir: fallbackHomeDir,

		// URI
		tmpDir: `file:///tmp/fallback_${generateUuid()}`,

		// URI
		userDataDir: `file:///app/user_data_fallback_${generateUuid()}`,

		// URI
		backupPath: `file:///app/backup_fallback_${generateUuid()}`,

		nls: {
			messages: {},

			language:
				(typeof navigator !== "undefined"
					? navigator.language
					: "en") || "en",

			availableLanguages: { en: "English" },
		},

		productConfiguration: {
			nameShort: "FIDDEE-FB",

			nameLong: "FIDDEE Fallback",

			applicationName: "fiddee-fallback",

			embedderIdentifier: "fiddee-desktop-fallback",

			// Add other product.json defaults if known to be critical
		},

		// Direct filesystem path
		resourcesPath: fallbackResourcesPath,

		// Filesystem path
		VSCODE_CWD: "/app/fallback_cwd",

		zoomLevel: 0,

		crashReporterId: `fallback_uuid_${generateUuid()}`,

		sqmId: `fallback_sqm_${generateUuid()}`,
	};
}

// --- Shim Implementations ---
function validateIPCChannel(
	channel: string,

	allowNonPrefixed: boolean = false,
): boolean {
	if (!channel) {
		console.error(
			"[Sky Host Bridge] Invalid IPC channel: Channel name is falsy.",
		);

		return false;
	}

	if (!allowNonPrefixed && !channel.startsWith("vscode:")) {
		console.error(
			`[Sky Host Bridge] Invalid IPC channel: '${channel}'. Channels MUST start with 'vscode:'.`,
		);

		return false;
	}

	return true;
}

const ipcRendererShimInstance: IpcRendererShim = {
	send: (channel: string, ...args: any[]): void => {
		if (!validateIPCChannel(channel)) return;

		invoke("mountain_ipc_bridge_send", { channel, argsList: args }).catch(
			(error: any) =>
				console.error(
					`[Sky Host Bridge] Error in ipcRenderer.send for channel '${channel}':`,

					error,
				),
		);
	},

	invoke: async (channel: string, ...args: any[]): Promise<any> => {
		if (!validateIPCChannel(channel)) {
			return Promise.reject(new Error(`Invalid IPC channel: ${channel}`));
		}

		try {
			return await invoke("mountain_ipc_bridge_invoke", {
				channel,

				argsList: args,
			});
		} catch (error) {
			console.error(
				`[Sky Host Bridge] Error in ipcRenderer.invoke for channel '${channel}':`,

				error,
			);

			throw error;
		}
	},

	on: (
		channel: string,

		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		const allowNonStandardPrefix = channel === "message";

		if (!validateIPCChannel(channel, allowNonStandardPrefix))
			return ipcRendererShimInstance;

		const channelListeners =
			tauriListenerMap.get(channel) ||
			new Map<Function, UnlistenFn | Promise<UnlistenFn>>();

		tauriListenerMap.set(channel, channelListeners);

		if (channelListeners.has(listener)) {
			console.warn(
				`[Sky Host Bridge] Listener already registered for channel '${channel}'.`,
			);

			return ipcRendererShimInstance;
		}

		const tauriUnlistenPromise: Promise<UnlistenFn> = listen(
			channel,

			(tauriEvent: TauriEvent<any[]>) => {
				const eventShim: IpcRendererEventShim = {
					sender: ipcRendererShimInstance,
				};

				try {
					listener(eventShim, ...(tauriEvent.payload || []));
				} catch (errorInListener) {
					console.error(
						`[Sky Host Bridge] Error in listener for channel '${channel}':`,

						errorInListener,
					);
				}
			},
		);

		channelListeners.set(listener, tauriUnlistenPromise);

		tauriUnlistenPromise
			.then((unlistenFn) => {
				if (channelListeners.get(listener) === tauriUnlistenPromise) {
					channelListeners.set(listener, unlistenFn);
				} else {
					unlistenFn();
				}
			})
			.catch((error) => {
				console.error(
					`[Sky Host Bridge] Error setting up Tauri listener for '${channel}':`,

					error,
				);

				channelListeners.delete(listener);
			});

		return ipcRendererShimInstance;
	},

	once: (
		channel: string,

		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		if (!validateIPCChannel(channel)) return ipcRendererShimInstance;

		let unlistenFunctionReference: UnlistenFn | null = null;

		const oneTimeListenerWrapper = (tauriEvent: TauriEvent<any[]>) => {
			if (unlistenFunctionReference) {
				unlistenFunctionReference();

				tauriListenerMap.get(channel)?.delete(listener);
			}

			const eventShim: IpcRendererEventShim = {
				sender: ipcRendererShimInstance,
			};

			try {
				listener(eventShim, ...(tauriEvent.payload || []));
			} catch (errorInListener) {
				console.error(
					`[Sky Host Bridge] Error in one-time listener for '${channel}':`,

					errorInListener,
				);
			}
		};

		const tauriUnlistenPromise = listen(channel, oneTimeListenerWrapper);

		const channelListeners =
			tauriListenerMap.get(channel) ||
			new Map<Function, UnlistenFn | Promise<UnlistenFn>>();

		tauriListenerMap.set(channel, channelListeners);

		channelListeners.set(listener, tauriUnlistenPromise);

		tauriUnlistenPromise
			.then((unlistenFn) => {
				unlistenFunctionReference = unlistenFn;

				if (channelListeners.get(listener) === tauriUnlistenPromise) {
					channelListeners.set(listener, unlistenFn);
				} else if (
					channelListeners.get(listener) !== unlistenFunctionReference
				) {
					unlistenFn();
				}
			})
			.catch((error) => {
				console.error(
					`[Sky Host Bridge] Error setting up one-time Tauri listener for '${channel}':`,

					error,
				);

				channelListeners.delete(listener);
			});

		return ipcRendererShimInstance;
	},

	removeListener: (
		channel: string,

		listener: (event: IpcRendererEventShim, ...args: any[]) => void,
	): IpcRendererShim => {
		const allowNonStandardPrefix = channel === "message";

		if (!validateIPCChannel(channel, allowNonStandardPrefix))
			return ipcRendererShimInstance;

		const channelListeners = tauriListenerMap.get(channel);

		if (channelListeners) {
			const unlistenOrPromise = channelListeners.get(listener);

			if (unlistenOrPromise) {
				if (typeof unlistenOrPromise === "function") {
					unlistenOrPromise();
				} else {
					unlistenOrPromise
						.then((unlistenFn) => unlistenFn())
						.catch((error) =>
							console.warn(
								`[Sky Host Bridge] Error during eventual unlisten for '${channel}':`,

								error,
							),
						);
				}

				channelListeners.delete(listener);
			}
		}

		return ipcRendererShimInstance;
	},
};

const ipcMessagePortShimInstance: IpcMessagePortShim = {
	acquire: (responseChannel: string, nonce: string): void => {
		console.warn(
			`[Sky Host Bridge] STUB: ipcMessagePort.acquire(responseChannel: '${responseChannel}', nonce: '${nonce}') called. Not supported.`,
		);
	},
};

const webFrameShimInstance: WebFrameShim = {
	setZoomLevel: (level: number): void => {
		if (typeof level === "number" && isFinite(level)) {
			invoke("mountain_set_zoom_level", { level }).catch((error: any) =>
				console.error(
					"[Sky Host Bridge] Error calling mountain_set_zoom_level:",

					error,
				),
			);
		} else {
			console.warn(
				`[Sky Host Bridge] webFrame.setZoomLevel: Invalid zoom level: ${level}`,
			);
		}
	},

	getZoomLevel: (): number => {
		return resolvedConfigurationCache?.zoomLevel ?? 0;
	},
};

const processShimInstance: ProcessShim = {
	platform: (navigator.platform.toLowerCase().includes("mac")
		? "darwin"
		: navigator.platform.toLowerCase().includes("win")
			? "win32"
			: "linux") as ProcessShim["platform"],

	arch: "x64",

	env: {},

	versions: {
		fiddee: (window as any).FIDDEE_VERSION || "0.0.0-dev",

		webview_runtime:
			navigator.userAgent.match(
				/(Chrome|Firefox|Safari|Edge?)\/([\d.]+)/,
			)?.[0] || "unknown",
	},

	type: "renderer",

	execPath: "/app/FIDDEE_placeholder_executable",

	sandboxed: true,

	contextIsolated: false,

	आटा: false,

	resourcesPath: "/app/placeholder_resources",

	cwd: (): string => {
		const config = resolvedConfigurationCache;

		if (config?.VSCODE_CWD && typeof config.VSCODE_CWD === "string")
			return config.VSCODE_CWD;

		if (config?.homeDir && typeof config.homeDir === "string") {
			try {
				return URI.parse(config.homeDir).fsPath;
			} catch (error) {
				console.warn(
					`[Sky Host Bridge] Error parsing homeDir URI ('${config.homeDir}') for cwd():`,

					error,
				);
			}
		}

		console.warn(
			"[Sky Host Bridge] process.cwd(): CWD not available from config. Returning '/' as fallback.",
		);

		return "/";
	},

	shellEnv: async (): Promise<Record<string, string | undefined>> => {
		try {
			return (await invoke("mountain_fetch_shell_env")) as Record<
				string,
				string | undefined
			>;
		} catch (error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_fetch_shell_env:",

				error,
			);

			return {};
		}
	},

	getProcessMemoryInfo: async (): Promise<{
		privateBytes: number;

		sharedBytes: number;

		residentSet: number;
	}> => {
		try {
			const memInfo = (await invoke(
				"mountain_get_process_memory_info",
			)) as {
				private_bytes?: number;

				shared_bytes?: number;

				resident_set_size?: number;
			};

			return {
				privateBytes: memInfo.private_bytes ?? 0,

				sharedBytes: memInfo.shared_bytes ?? 0,

				residentSet: memInfo.resident_set_size ?? 0,
			};
		} catch (error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_get_process_memory_info:",

				error,
			);

			return { privateBytes: 0, sharedBytes: 0, residentSet: 0 };
		}
	},

	on: (type: string, callback: (...args: any[]) => void): void => {
		if (type === "uncaughtException") {
			const existingOnError = window.onerror;

			window.onerror = (
				messageOrEvent,

				source,

				lineno,

				colno,

				errorObject,
			) => {
				callback(errorObject || new Error(messageOrEvent as string));

				if (existingOnError)
					return existingOnError.apply(window, [
						messageOrEvent,

						source,

						lineno,

						colno,

						errorObject,
					] as any);

				return false;
			};

			console.debug(
				"[Sky Host Bridge] process.on('uncaughtException') shimmed to window.onerror.",
			);
		} else {
			console.warn(
				`[Sky Host Bridge] STUB: process.on('${type}') called. Not actively proxied.`,
			);
		}
	},
};

const contextShimInstance: ContextShim = {
	configuration: (): ISandboxConfiguration | undefined => {
		return resolvedConfigurationCache;
	},

	resolveConfiguration: (): Promise<ISandboxConfiguration> => {
		if (resolvedConfigurationCache) {
			return Promise.resolve(resolvedConfigurationCache);
		}

		if (resolveConfigurationPromise) {
			return resolveConfigurationPromise;
		}

		console.log(
			"[Sky Host Bridge] context.resolveConfiguration: Fetching workbench config from Mountain...",
		);

		resolveConfigurationPromise = invoke(
			"mountain_get_workbench_configuration",
		)
			.then((configDataFromMountain: unknown) => {
				if (
					configDataFromMountain &&
					typeof configDataFromMountain === "object" &&
					(configDataFromMountain as ISandboxConfiguration).appRoot
				) {
					resolvedConfigurationCache =
						configDataFromMountain as ISandboxConfiguration;

					console.log(
						"[Sky Host Bridge] Workbench configuration successfully resolved from Mountain.",
					);
				} else {
					console.error(
						"[Sky Host Bridge] Invalid or incomplete configuration from Mountain. Using fallback.",

						configDataFromMountain,
					);

					resolvedConfigurationCache =
						getFallbackSandboxConfiguration();

					// Display a less intrusive warning if using fallback, as main error handled by catch block
					const fallbackWarningHtml = `<div style="position:fixed; top:0; left:0; background:rgba(255,220,0,0.8); color:black; padding:5px; font-size:12px; z-index:10000;">Warning: Using fallback configuration. Some features may be limited.</div>`;

					if (document.body) {
						const warningDiv = document.createElement("div");

						warningDiv.innerHTML = fallbackWarningHtml;

						document.body.prepend(warningDiv.firstChild!);
					}
				}

				// Update processShimInstance with actual or fallback data
				if (resolvedConfigurationCache.userEnv)
					Object.assign(
						processShimInstance.env,

						resolvedConfigurationCache.userEnv,
					);

				if (resolvedConfigurationCache.platform)
					(processShimInstance as any).platform =
						resolvedConfigurationCache.platform;

				if (resolvedConfigurationCache.arch)
					(processShimInstance as any).arch =
						resolvedConfigurationCache.arch;
				else {
					// Try to infer arch again if not in config
					let navArch: ProcessShim["arch"] = "x64";

					if (
						typeof navigator !== "undefined" &&
						(navigator as any).userAgentData?.architecture
					) {
						const archVal = (navigator as any).userAgentData
							.architecture;

						if (archVal === "arm" || archVal === "aarch64")
							navArch = "arm64";
					}

					(processShimInstance as any).arch = navArch;
				}

				if (resolvedConfigurationCache.versions)
					(processShimInstance as any).versions = {
						...(processShimInstance.versions || {}),

						...resolvedConfigurationCache.versions,
					};

				if (resolvedConfigurationCache.execPath)
					(processShimInstance as any).execPath =
						resolvedConfigurationCache.execPath;

				// Default placeholder
				let fsResourcesPath = "/app/resources_placeholder";

				try {
					if (resolvedConfigurationCache.resourcesPath) {
						fsResourcesPath =
							resolvedConfigurationCache.resourcesPath.startsWith(
								"file://",
							)
								? URI.parse(
										resolvedConfigurationCache.resourcesPath,
									).fsPath
								: // Assume it's already a fsPath if not file URI
									resolvedConfigurationCache.resourcesPath;
					} else if (
						resolvedConfigurationCache.appRoot?.startsWith(
							"file://",
						)
					) {
						fsResourcesPath = URI.file(
							URI.parse(resolvedConfigurationCache.appRoot)
								.fsPath,
						).with({
							path:
								URI.parse(resolvedConfigurationCache.appRoot)
									.fsPath + "/resources",

							// Example: appRoot/resources
						}).fsPath;
					} else if (resolvedConfigurationCache.appRoot) {
						// For non-file appRoot (e.g. http), resourcesPath might be relative or an absolute http path.
						// For workbench process.resourcesPath, it usually expects a filesystem path.
						// This scenario is tricky for a desktop app shim.
						console.warn(
							`[Sky Host Bridge] appRoot ('${resolvedConfigurationCache.appRoot}') is not a file URI. Setting process.resourcesPath to a placeholder. This may cause issues.`,
						);

						fsResourcesPath = "/app/web_resources_placeholder";
					}
				} catch (uriParseError) {
					console.warn(
						`[Sky Host Bridge] Error parsing paths for process.resourcesPath:`,

						uriParseError,
					);
				}

				(processShimInstance as any).resourcesPath = fsResourcesPath;

				if (typeof resolvedConfigurationCache.zoomLevel === "number") {
					webFrameShimInstance.setZoomLevel(
						resolvedConfigurationCache.zoomLevel,
					);
				}

				return resolvedConfigurationCache;
			})
			.catch((error: any) => {
				console.error(
					"[Sky Host Bridge] CRITICAL: Failed to resolve workbench configuration from Mountain. Using fallback and displaying error.",

					error,
				);

				// Ensure fallback is set on error too
				resolvedConfigurationCache = getFallbackSandboxConfiguration();

				// Update processShimInstance with fallback data
				if (resolvedConfigurationCache.userEnv)
					Object.assign(
						processShimInstance.env,

						resolvedConfigurationCache.userEnv,
					);

				if (resolvedConfigurationCache.platform)
					(processShimInstance as any).platform =
						resolvedConfigurationCache.platform;

				if (resolvedConfigurationCache.arch)
					(processShimInstance as any).arch =
						resolvedConfigurationCache.arch;

				// ... (update other relevant process properties from fallback) ...
				if (resolvedConfigurationCache.versions)
					(processShimInstance as any).versions = {
						...(processShimInstance.versions || {}),

						...resolvedConfigurationCache.versions,
					};

				if (resolvedConfigurationCache.execPath)
					(processShimInstance as any).execPath =
						resolvedConfigurationCache.execPath;

				if (resolvedConfigurationCache.resourcesPath)
					(processShimInstance as any).resourcesPath =
						// Fallback should provide fsPath
						resolvedConfigurationCache.resourcesPath;

				const errorMessageHtml = `
					<div style="color: #CD3131; background: #252526; padding:20px; font-family:sans-serif; height: 100vh; overflow: auto; box-sizing: border-box; z-index: 10001;">
						<h1>Application Startup Error (FIDDEE Sky Host Bridge)</h1>
						<p>Could not load essential startup configuration from the host application (Mountain). Attempting to continue with fallback values, but functionality will be severely limited.</p>
						<h3>Error Details:</h3>
						<pre style="text-align:left; background:#1E1E1E; color: #D4D4D4; padding:10px; border-radius:4px; white-space:pre-wrap; word-wrap:break-word;">${error instanceof Error ? `${error.name}: ${error.message}\n${error.stack || "(No stack trace available)"}` : String(error)}</pre>
					</div>`;

				if (document.body) {
					const errorDiv = document.createElement("div");

					errorDiv.innerHTML = errorMessageHtml;

					// Prepend to avoid overwriting everything if workbench somehow loads
					document.body.prepend(errorDiv.firstChild!);
				} else {
					// Last resort
					document.write(errorMessageHtml);
				}

				// Return fallback
				return resolvedConfigurationCache;
			});

		return resolveConfigurationPromise;
	},
};

const webUtilsShimInstance: WebUtilsShim = {
	getPathForFile: (file: File): string => {
		const filePath = (file as any).path || file.name;

		// console.warn(`[Sky Host Bridge] STUB: webUtils.getPathForFile for '${file.name}'. Returning: '${filePath}'.`);

		return filePath;
	},
};

const skyHostApiGlobal = {
	ipcRenderer: ipcRendererShimInstance,

	ipcMessagePort: ipcMessagePortShimInstance,

	webFrame: webFrameShimInstance,

	process: processShimInstance,

	context: contextShimInstance,

	webUtils: webUtilsShimInstance,
};

if ((window as any).vscode) {
	console.warn(
		"[Sky Host Bridge] `window.vscode` already exists. Overwriting.",
	);
}

(window as any).vscode = skyHostApiGlobal;

console.log(
	"[Sky Host Bridge] `window.vscode` shim attached. Workbench can now load.",
);

contextShimInstance.resolveConfiguration().catch((_error) => {
	// Error handling (UI display, logging, and fallback assignment) is managed within resolveConfiguration.
});
