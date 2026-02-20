/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Global window properties for the application
declare global {
	interface Window {
		__TAURI_ISOLATION_HOOK__: (payload: any) => any;
		NLS_LOADED?: boolean;

		// Wind preload globals
		preloadGlobals?: {
			ipcRenderer: any;
			process: any;
			configuration: any;
		};
		__WIND_PRELOAD_READY__?: boolean;

		// VSCode Electron API polyfills (window.vscode)
		vscode?: {
			process: any;
			ipcRenderer: {
				send: (channel: string, ...args: any[]) => void;
				invoke: (channel: string, ...args: any[]) => Promise<any>;
				on: (
					channel: string,
					listener: (...args: any[]) => void,
				) => any;
				once: (
					channel: string,
					listener: (...args: any[]) => void,
				) => any;
				removeListener: (
					channel: string,
					listener: (...args: any[]) => void,
				) => void;
			};
			context: {
				configuration: () => any;
				resolveConfiguration: () => Promise<any>;
			};
			webFrame: {
				setZoomLevel: (level: number) => void;
			};
			webUtils: {
				getPathForFile: (file: File) => string;
			};
			ipcMessagePort: {
				acquire: () => any;
			};
		};

		// Monaco Editor
		monaco?: any;

		// VSCode workbench
		workbench?: any;
	}
}

export {};
