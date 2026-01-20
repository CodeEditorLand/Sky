/// <reference path="../env.d.ts" />

window.__TAURI_ISOLATION_HOOK__ = (Payload: any) => {
	console.log(`__TAURI_ISOLATION_HOOK__: ${Payload}`);

	return Payload;
};
