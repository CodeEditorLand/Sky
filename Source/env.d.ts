/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Global window properties for the application
declare global {
	interface Window {
		__TAURI_ISOLATION_HOOK__: (payload: any) => any;
		NLS_LOADED?: boolean;
	}
}

export {};
