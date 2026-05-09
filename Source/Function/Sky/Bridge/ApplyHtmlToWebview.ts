/**
 * Applies an HTML string to a parked workbench `WebviewView` /
 * `WebviewPanel`. Stock VS Code's `IOverlayWebview` exposes
 * `setHtml(html: string): void` as a METHOD - earlier code that
 * assigned to `webview.html = X` silently no-op'd because the
 * workbench-supplied object exposes a method, not a setter, and the
 * iframe stayed blank even when the resolver chain wired up
 * correctly. Try the method first, fall back to the property setter
 * for the panel-mode placeholder shape (set by the
 * `sky://webview/create` listener) which DOES define a setter on
 * `_pendingHtml`.
 *
 * Returns the strategy that succeeded so the diagnostic line
 * `applied=method|setter|skipped` gives log dissection a clear
 * signal whether the real workbench webview received the html.
 */
export default (
	ParkedView: any,

	Html: string,
): "method" | "setter" | "skipped" => {
	if (!ParkedView?.webview) {
		return "skipped";
	}

	try {
		if (typeof ParkedView.webview.setHtml === "function") {
			ParkedView.webview.setHtml(Html);

			return "method";
		}
	} catch {
		/* fall through to setter */
	}

	try {
		ParkedView.webview.html = Html;

		return "setter";
	} catch {
		return "skipped";
	}
};
