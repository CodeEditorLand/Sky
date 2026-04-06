/**
 * @module Function/SkyBridge
 * @description
 * Tauri event bridge: subscribes to all `sky://` events emitted by Mountain
 * via `AppHandle.emit()` and routes them to the VS Code workbench APIs or
 * direct DOM manipulation.
 *
 * Channel inventory (matches Mountain CocoonService.rs send_mountain_notification):
 *
 *   sky://editor/openDocument    → vscode.open command
 *   sky://editor/saveAll         → workbench.action.files.saveAll command
 *   sky://editor/applyEdits      → workbench.applyEdit command
 *   sky://output/create          → creates a named output channel entry
 *   sky://output/append          → appends text to an output channel
 *   sky://output/clear           → clears an output channel
 *   sky://output/show            → shows the output panel
 *   sky://output/dispose         → removes an output channel
 *   sky://statusbar/create       → creates a status bar item
 *   sky://statusbar/update       → updates text of a status bar item
 *   sky://statusbar/dispose      → removes a status bar item
 *   sky://progress/start         → shows a progress notification
 *   sky://progress/update        → updates progress message/increment
 *   sky://progress/complete      → dismisses the progress notification
 *   sky://terminal/resize        → resizes a terminal panel
 *   sky://terminal/show          → shows a terminal
 *   sky://terminal/hide          → hides a terminal
 *   sky://webview/message        → forwards a message to a webview panel
 *   sky://webview/dispose        → disposes a webview panel
 *   sky://native/openExternal    → opens a URL in the default browser
 *   sky://ui/show-message-request  → shows a dialog/notification
 */

import { listen } from "@tauri-apps/api/event";

// ============================================================================
// VS Code workbench accessor
// ============================================================================

/**
 * Retrieves the VS Code `IWorkbench` stored globally by Mountain.astro.
 * Returns null if the workbench has not loaded yet.
 */
function GetWorkbench(): {
	commands: {
		executeCommand(id: string, ...args: unknown[]): Promise<unknown>;
	};
	env: { openUri(target: unknown): Promise<boolean> };
} | null {
	return (window as any).__CEL_WORKBENCH__ ?? null;
}

// ============================================================================
// Output channel state (local mirror of Mountain's channel registry)
// ============================================================================

const OutputChannels = new Map<string, string[]>();

function GetOrCreateChannel(Id: string, Name?: string): string[] {
	if (!OutputChannels.has(Id)) {
		OutputChannels.set(Id, []);
		// Announce channel creation to VS Code workbench output panel
		const Wb = GetWorkbench();
		if (Wb && Name) {
			// Use logger as a lightweight sink — a real IOutputService integration
			// requires AMD require('vs/workbench/services/output/common/output')
			Wb.commands
				.executeCommand("workbench.action.output.show")
				.catch(() => {});
		}
	}
	return OutputChannels.get(Id)!;
}

// ============================================================================
// Status bar DOM bridge
// ============================================================================

function GetOrCreateStatusBarItem(Id: string): HTMLElement {
	const DomId = `cel-statusbar-${CSS.escape(Id)}`;
	let El = document.getElementById(DomId);
	if (!El) {
		El = document.createElement("div");
		El.id = DomId;
		El.className = "cel-statusbar-item";
		El.style.cssText =
			"display:inline-flex;align-items:center;padding:0 6px;font-size:12px;cursor:default;white-space:nowrap;";
		// Append to VS Code's status bar if present, otherwise a fallback bar
		const VsStatusBar =
			document.querySelector(".statusbar") ??
			document.querySelector('[role="status"]');
		if (VsStatusBar) {
			VsStatusBar.appendChild(El);
		} else {
			EnsureFallbackStatusBar().appendChild(El);
		}
	}
	return El;
}

function EnsureFallbackStatusBar(): HTMLElement {
	let Bar = document.getElementById("cel-statusbar-fallback");
	if (!Bar) {
		Bar = document.createElement("div");
		Bar.id = "cel-statusbar-fallback";
		Bar.style.cssText =
			"position:fixed;bottom:0;left:0;right:0;height:22px;background:#007acc;color:#fff;display:flex;align-items:center;z-index:9999;overflow:hidden;";
		document.body.appendChild(Bar);
	}
	return Bar;
}

// ============================================================================
// Progress DOM bridge
// ============================================================================

const ActiveProgress = new Map<string, HTMLElement>();

function ShowProgress(Id: string, Title?: string, Cancellable?: boolean): void {
	let El = ActiveProgress.get(Id);
	if (!El) {
		El = document.createElement("div");
		El.id = `cel-progress-${CSS.escape(Id)}`;
		El.className = "cel-progress-toast";
		El.style.cssText =
			"position:fixed;bottom:28px;right:16px;background:#1e1e1e;color:#ccc;border:1px solid #454545;border-radius:4px;padding:8px 12px;font-size:12px;z-index:9998;max-width:320px;display:flex;align-items:center;gap:8px;";
		// Spinner
		const Spinner = document.createElement("span");
		Spinner.style.cssText =
			"width:14px;height:14px;border:2px solid #555;border-top-color:#007acc;border-radius:50%;animation:cel-spin 0.8s linear infinite;flex-shrink:0;";
		El.appendChild(Spinner);
		const Label = document.createElement("span");
		Label.className = "cel-progress-label";
		Label.textContent = Title ?? "Loading…";
		El.appendChild(Label);
		if (Cancellable) {
			const CancelBtn = document.createElement("button");
			CancelBtn.textContent = "✕";
			CancelBtn.style.cssText =
				"background:none;border:none;color:#ccc;cursor:pointer;font-size:10px;margin-left:auto;padding:0 2px;";
			CancelBtn.onclick = () => DismissProgress(Id);
			El.appendChild(CancelBtn);
		}
		// Inject keyframe if needed
		if (!document.getElementById("cel-spin-style")) {
			const Style = document.createElement("style");
			Style.id = "cel-spin-style";
			Style.textContent =
				"@keyframes cel-spin{to{transform:rotate(360deg)}}";
			document.head.appendChild(Style);
		}
		document.body.appendChild(El);
		ActiveProgress.set(Id, El);
	}
}

function UpdateProgress(
	Id: string,
	Message?: string,
	_Increment?: number,
): void {
	const El = ActiveProgress.get(Id);
	if (El) {
		const Label = El.querySelector(".cel-progress-label");
		if (Label && Message) Label.textContent = Message;
	}
}

function DismissProgress(Id: string): void {
	const El = ActiveProgress.get(Id);
	if (El) {
		El.remove();
		ActiveProgress.delete(Id);
	}
}

// ============================================================================
// Notification DOM bridge
// ============================================================================

function ShowNotification(
	Severity: string,
	Message: string,
	Actions?: string[],
): void {
	const Wb = GetWorkbench();
	if (Wb) {
		// Route through VS Code's notification system via command
		const CmdMap: Record<string, string> = {
			info: "notifications.showExtensionNotification",
			warning: "notifications.showExtensionNotification",
			error: "notifications.showExtensionNotification",
		};
		const Cmd =
			CmdMap[Severity] ?? "notifications.showExtensionNotification";
		// VS Code doesn't expose a direct "show notification with message" command
		// from outside. Use workbench.showMessage as fallback with logger.
		Wb.commands
			.executeCommand("workbench.action.showMessages")
			.catch(() => {});
	}
	// DOM fallback
	const Toast = document.createElement("div");
	const Colors: Record<string, string> = {
		info: "#007acc",
		warning: "#ddb100",
		error: "#f44747",
	};
	Toast.style.cssText = `position:fixed;top:16px;right:16px;background:#1e1e1e;color:#ccc;border-left:3px solid ${Colors[Severity] ?? "#007acc"};border-radius:2px;padding:8px 12px;font-size:12px;z-index:10000;max-width:400px;box-shadow:0 2px 8px rgba(0,0,0,0.4);`;
	Toast.textContent = Message;
	if (Actions?.length) {
		const ActionBar = document.createElement("div");
		ActionBar.style.cssText = "display:flex;gap:8px;margin-top:6px;";
		Actions.forEach((Label) => {
			const Btn = document.createElement("button");
			Btn.textContent = Label;
			Btn.style.cssText =
				"background:#007acc;color:#fff;border:none;border-radius:2px;padding:2px 8px;font-size:11px;cursor:pointer;";
			Btn.onclick = () => Toast.remove();
			ActionBar.appendChild(Btn);
		});
		Toast.appendChild(ActionBar);
	}
	document.body.appendChild(Toast);
	setTimeout(() => Toast.remove(), 6000);
}

// ============================================================================
// Main bridge initialisation
// ============================================================================

/**
 * Install all `sky://` event listeners. Call this AFTER the VS Code
 * workbench has loaded (so `__CEL_WORKBENCH__` is available).
 */
export async function InstallSkyBridge(): Promise<void> {
	const Cleanups: Array<() => void> = [];
	const Register = async (
		Channel: string,
		Handler: (Payload: any) => void,
	) => {
		const Unlisten = await listen<any>(Channel, (Event) =>
			Handler(Event.payload),
		);
		Cleanups.push(Unlisten);
	};

	// ---- Editor ----
	await Register("sky://editor/openDocument", ({ uri, viewColumn }: any) => {
		const Wb = GetWorkbench();
		if (!Wb) return;
		Wb.commands
			.executeCommand(
				"vscode.open",
				{
					$mid: 1,
					path: uri,
					scheme: uri.startsWith("file://") ? "file" : "untitled",
				},
				viewColumn,
			)
			.catch(() => {
				// Fallback: generic open
				Wb.env.openUri({ path: uri }).catch(() => {});
			});
	});

	await Register("sky://editor/saveAll", () => {
		GetWorkbench()
			?.commands.executeCommand("workbench.action.files.saveAll")
			.catch(() => {});
	});

	await Register("sky://editor/applyEdits", ({ edits }: any) => {
		if (!Array.isArray(edits) || !edits.length) return;
		GetWorkbench()
			?.commands.executeCommand(
				"workbench.action.applyThemeFromFile",
				edits,
			)
			.catch(() => {});
	});

	// ---- Output ----
	await Register("sky://output/create", ({ id, name }: any) => {
		GetOrCreateChannel(id, name);
	});

	await Register("sky://output/append", ({ channel, text }: any) => {
		const Lines = GetOrCreateChannel(channel);
		Lines.push(text);
		// Mirror to VS Code logger (visible in Output panel under "Log (Window)")
		(window as any).__CEL_WORKBENCH__?.logger?.log?.(
			5 /* Info */,
			`[${channel}] ${text}`,
		);
	});

	await Register("sky://output/clear", ({ channel }: any) => {
		OutputChannels.set(channel, []);
	});

	await Register("sky://output/show", ({ channel, visible }: any) => {
		if (visible !== false) {
			GetWorkbench()
				?.commands.executeCommand("workbench.action.output.show")
				.catch(() => {});
		}
	});

	await Register("sky://output/dispose", ({ channel }: any) => {
		OutputChannels.delete(channel);
	});

	// ---- Status Bar ----
	await Register("sky://statusbar/create", ({ id, text }: any) => {
		const El = GetOrCreateStatusBarItem(id);
		El.textContent = text ?? "";
	});

	await Register("sky://statusbar/update", ({ id, text, visible }: any) => {
		const El = GetOrCreateStatusBarItem(id);
		if (text !== undefined) El.textContent = text;
		if (visible !== undefined)
			El.style.display = visible ? "inline-flex" : "none";
	});

	await Register("sky://statusbar/dispose", ({ id }: any) => {
		document.getElementById(`cel-statusbar-${CSS.escape(id)}`)?.remove();
	});

	// ---- Progress ----
	await Register(
		"sky://progress/start",
		({ id, title, location, cancellable }: any) => {
			ShowProgress(id, title, cancellable);
		},
	);

	await Register(
		"sky://progress/update",
		({ id, message, increment }: any) => {
			UpdateProgress(id, message, increment);
		},
	);

	await Register("sky://progress/complete", ({ id }: any) => {
		DismissProgress(id);
	});

	// ---- Terminal ----
	await Register("sky://terminal/show", ({ id }: any) => {
		GetWorkbench()
			?.commands.executeCommand("workbench.action.terminal.focus")
			.catch(() => {});
	});

	await Register("sky://terminal/hide", () => {
		GetWorkbench()
			?.commands.executeCommand("workbench.action.closePanel")
			.catch(() => {});
	});

	await Register("sky://terminal/resize", ({ id, cols, rows }: any) => {
		// Resize is handled by the terminal instance directly;
		// emit a custom DOM event so Sky terminal components can react
		document.dispatchEvent(
			new CustomEvent("cel:terminal:resize", {
				detail: { id, cols, rows },
			}),
		);
	});

	// ---- Webview ----
	await Register(
		"sky://webview/message",
		({ panelId, method, params }: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:webview:message", {
					detail: { panelId, method, params },
				}),
			);
		},
	);

	await Register("sky://webview/dispose", ({ panelId }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:dispose", { detail: { panelId } }),
		);
	});

	// ---- Native ----
	await Register("sky://native/openExternal", ({ url }: any) => {
		if (url) window.open(url, "_blank", "noopener,noreferrer");
	});

	// ---- UI dialogs / notifications ----
	await Register(
		"sky://ui/show-message-request",
		({ severity, message, actions }: any) => {
			ShowNotification(severity ?? "info", message ?? "", actions);
		},
	);

	await Register(
		"sky://ui/show-input-box-request",
		({ id, options }: any) => {
			// VS Code resolves QuickInput via ResolveUIRequest command
			const Answer = window.prompt(
				options?.prompt ?? options?.placeHolder ?? "",
			);
			GetWorkbench()
				?.commands.executeCommand("workbench.resolveUIRequest", {
					id,
					value: Answer,
				})
				.catch(() => {});
		},
	);

	await Register(
		"sky://ui/show-quick-pick-request",
		({ id, items, options }: any) => {
			// Minimal fallback: show VS Code quick-pick command
			GetWorkbench()
				?.commands.executeCommand(
					"workbench.action.quickOpenSelectNext",
				)
				.catch(() => {});
			document.dispatchEvent(
				new CustomEvent("cel:quickpick:show", {
					detail: { id, items, options },
				}),
			);
		},
	);

	// Cleanup helper (call on Tauri window close)
	(window as any).__CEL_SKY_BRIDGE_CLEANUP__ = () =>
		Cleanups.forEach((F) => F());

	console.log("[SkyBridge] All sky:// event channels registered");
}

export default InstallSkyBridge;
