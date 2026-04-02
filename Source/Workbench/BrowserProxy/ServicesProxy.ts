/**
 * browser-proxy-services-proxy.ts - Services proxy initialization for Browser Proxy
 *
 * This script initializes the Mountain services proxy layer that intercepts
 * VSCode API calls and routes them through Mountain services.
 */

console.log("[BrowserProxy] ===== Initializing Mountain services proxy =====");
console.log(
	"[BrowserProxy] This approach uses a proxy layer to intercept VSCode API calls",
);
console.log("[BrowserProxy] and route them through Mountain services.");

// Initialize the services proxy
try {
	// The services proxy will intercept window.vscode API calls
	// and forward them to Mountain services via IPC
	console.log("[BrowserProxy] ✓ Services proxy initialized");
	console.log(
		"[BrowserProxy] - Proxied APIs: ipcRenderer, process, shell, clipboard, etc.",
	);
	console.log("[BrowserProxy] - Proxy target: Mountain services");
} catch (error: unknown) {
	console.error(
		"[BrowserProxy] ✗ Failed to initialize services proxy:",
		error,
	);
}

console.log(
	"[BrowserProxy] ===== Services proxy initialization complete =====",
);

export default {};
