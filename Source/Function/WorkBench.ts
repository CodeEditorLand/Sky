import { invoke } from "@tauri-apps/api/core";
import { listen, once, type Event as TauriEvent } from "@tauri-apps/api/event";

// Correct v2 path

// --- FIX: All ambient declarations must be at the top level ---
declare global {
	// Extend the global Window type to include our custom API.
	interface Window {
		vscode: IVscodeApi;
	}
}

// --- 1. Define the API contract we are creating ---
interface IIpcRenderer {
	send(channel: string, ...args: any[]): void;
	invoke<T>(channel: string, ...args: any[]): Promise<T>;
	on(
		channel: string,
		listener: (event: any, ...args: any[]) => void,
	): IIpcRenderer;
	once(
		channel: string,
		listener: (event: any, ...args: any[]) => void,
	): IIpcRenderer;
	removeListener(
		channel: string,
		listener: (...args: any[]) => void,
	): IIpcRenderer;
}
interface IVscodeApi {
	ipcRenderer: IIpcRenderer;
	webFrame: { setZoomLevel(level: number): void };
	process: {
		platform: string;
		arch: string;
		env: Record<string, string | undefined>;
		versions: Record<string, string | undefined>;
		type: "renderer";
		execPath: string;
		cwd(): string;
		shellEnv(): Promise<Record<string, string | undefined>>;
		getProcessMemoryInfo(): Promise<any>;
		on(type: string, callback: (...args: any[]) => void): void;
	};
	context: {
		configuration(): IWorkbenchConfiguration | undefined;
		resolveConfiguration(): Promise<IWorkbenchConfiguration>;
	};
}
interface IWorkbenchConfiguration {
	windowId: number;
	logLevel: number;
	zoomLevel: number;
	[key: string]: any;
}
interface InitialEnvironmentInfo {
	platform: string;
	arch: string;
	env: Record<string, string | undefined>;
	versions: Record<string, string | undefined>;
	execPath: string;
	cwd: string;
	shellEnv: Record<string, string | undefined>;
}

/**
 * This is our custom bootstrap script to bridge the VS Code workbench
 * with the Mountain (Tauri) backend.
 */
async function bootstrap() {
	console.log(
		"[Mountain Bootstrap] Initializing custom workbench environment...",
	);

	// const appWindow = getCurrentWindow();

	// --- 2. IPC Renderer Shim ---
	const ipcRenderer: IIpcRenderer = {
		send(channel, ...args) {
			invoke("DispatchFrontendCommand", {
				command: channel,
				argument: args,
			}).catch((err: any) =>
				console.error(`[IPC Send Error] for ${channel}:`, err),
			);
		},
		invoke(channel, ...args) {
			return invoke("DispatchFrontendCommand", {
				command: channel,
				argument: args,
			});
		},
		on(channel, listener) {
			listen(channel, (event: TauriEvent<any>) =>
				listener({}, event.payload),
			);
			return this;
		},
		once(channel, listener) {
			once(channel, (event: TauriEvent<any>) =>
				listener({}, event.payload),
			);
			return this;
		},
		removeListener(channel, _listener) {
			console.warn(
				`[IPC Shim] removeListener for "${channel}" is not implemented.`,
			);
			return this;
		},
	};

	// --- 3. WebFrame Shim ---
	const webFrame = {
		setZoomLevel(_level: number): void {
			// // FIX: The method is on the `WebviewWindow` instance we got from `getCurrentWindow`.
			// appWindow
			// 	.setZoom(level)
			// 	.catch((err: any) =>
			// 		console.error("Failed to set zoom level:", err),
			// 	);
		},
	};

	// --- 4. Process Shim ---
	const envInfo = await invoke<InitialEnvironmentInfo>(
		"get_initial_environment_info",
	);
	const processShim: IVscodeApi["process"] = {
		platform: envInfo.platform,
		arch: envInfo.arch,
		env: envInfo.env,
		versions: envInfo.versions,
		type: "renderer" as const,
		execPath: envInfo.execPath,
		cwd: () => envInfo.cwd,
		shellEnv: () => Promise.resolve(envInfo.shellEnv),
		getProcessMemoryInfo: () => invoke("get_process_memory_info"),
		on: (type, _callback) => {
			console.warn(
				`[Process Shim] process.on for "${type}" is not implemented.`,
			);
		},
	};

	// --- 5. Context Shim ---
	let windowConfiguration: IWorkbenchConfiguration | undefined;
	const context: IVscodeApi["context"] = {
		configuration: () => windowConfiguration,
		async resolveConfiguration() {
			if (windowConfiguration) {
				return windowConfiguration;
			}
			console.log(
				"[Mountain Bootstrap] Resolving window configuration from backend...",
			);
			windowConfiguration = await invoke<IWorkbenchConfiguration>(
				"MountainGetWorkbenchConfiguration",
			);
			console.log("[Mountain Bootstrap] Window configuration resolved.");
			return windowConfiguration;
		},
	};

	// --- 6. Assemble the Global API ---
	window.vscode = {
		ipcRenderer,
		webFrame,
		process: processShim,
		context,
	};

	console.log(
		"[Mountain Bootstrap] Custom environment injected. Loading workbench...",
	);

	// --- 7. Load and Run the Workbench ---
	try {
		const workbenchModule = await import(
			// @ts-expect-error
			"/Static/Application/vs/workbench/workbench.desktop.main.js"
		);
		const config = await context.resolveConfiguration();

		if (typeof config.zoomLevel === "number") {
			webFrame.setZoomLevel(config.zoomLevel);
		}

		workbenchModule.main(config);
		console.log("[Mountain Bootstrap] Workbench started successfully.");
	} catch (error: any) {
		console.error(
			"[Mountain Bootstrap] Failed to load or start workbench:",
			error,
		);
	}
}

bootstrap();
