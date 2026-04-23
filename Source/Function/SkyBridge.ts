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

import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// Single source of truth for Mountain → Sky event URIs. Importing from
// the Wind package avoids maintaining a parallel string table here and
// catches drift against Mountain's Rust `SkyEvent` enum at type-check
// time (Wind's TS table is the TS mirror of Common/IPC/SkyEvent.rs).
import SkyEvent from "@codeeditorland/wind/Target/IPC/SkyEvent.js";

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
			// Use logger as a lightweight sink - a real IOutputService integration
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

	// Atom Q1: resolve UI requests via Mountain's `ResolveUIRequest` Tauri
	// command (registered in CommandRegister). Mountain emits
	// `sky://ui/show-*-request` with shape `{ RequestIdentifier, Payload }`
	// and waits on a oneshot keyed by RequestIdentifier. We MUST send back a
	// ResolveUIRequest invocation with the exact same identifier or the
	// 300s timeout in UserInterfaceProvider fires. Declared here so every
	// listener below can reference it.
	const ResolveUiRequest = (
		RequestIdentifier: string,
		Result: unknown,
	): Promise<void> =>
		invoke<void>("ResolveUIRequest", {
			RequestID: RequestIdentifier,
			Result,
		}).catch((Error) => {
			console.warn(
				"[SkyBridge] ResolveUIRequest failed",
				RequestIdentifier,
				Error,
			);
		});

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

	// Atom T1: workspace.applyEdit - round-trip reply. Mountain's request
	// carries `{ RequestIdentifier, Payload }` and blocks the extension's
	// awaited promise until we resolve.
	await Register(
		"sky://workspace/applyEdit",
		async ({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			try {
				const Wb = GetWorkbench();
				const Edits = Payload?.edits ?? Payload ?? [];
				if (Wb && Edits) {
					await Wb.commands.executeCommand(
						"workbench.action.applyThemeFromFile",
						Edits,
					);
				}
				void ResolveUiRequest(RequestIdentifier, true);
			} catch (Error) {
				console.warn("[SkyBridge] applyEdit failed", Error);
				void ResolveUiRequest(RequestIdentifier, false);
			}
		},
	);

	// Atom T1: window.showTextDocument - round-trip reply with a
	// minimal TextEditor-shaped acknowledgement (`{ uri, viewColumn }`).
	// Extensions chaining editor-scoped operations will see undefined for
	// properties we don't synthesise yet; tracking that enrichment
	// separately as T2.
	await Register(
		"sky://window/showTextDocument",
		async (RawPayload: any) => {
			const RequestIdentifier = RawPayload?.RequestIdentifier;
			const Payload = RawPayload?.Payload ?? RawPayload;
			const UriValue =
				Payload?.[0]?.uri ??
				Payload?.uri ??
				Payload?.[0] ??
				null;
			const ViewColumn =
				Payload?.[1]?.viewColumn ??
				Payload?.viewColumn ??
				Payload?.[1] ??
				null;
			try {
				const Wb = GetWorkbench();
				if (Wb && UriValue) {
					await Wb.commands.executeCommand(
						"vscode.open",
						{
							$mid: 1,
							path: typeof UriValue === "string" ? UriValue : UriValue?.path,
							scheme:
								(typeof UriValue === "string"
									? UriValue
									: (UriValue?.scheme ?? "")
								).startsWith?.("file://") ||
								UriValue?.scheme === "file"
									? "file"
									: "untitled",
						},
						ViewColumn,
					);
				}
				if (RequestIdentifier) {
					void ResolveUiRequest(RequestIdentifier, {
						uri: UriValue,
						viewColumn: ViewColumn,
					});
				}
			} catch (Error) {
				console.warn("[SkyBridge] showTextDocument failed", Error);
				if (RequestIdentifier) {
					void ResolveUiRequest(RequestIdentifier, null);
				}
			}
		},
	);

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

	// BATCH-19 Part B: Mountain now fans terminal lifecycle events back
	// through the `sky://terminal/*` channel so the xterm panel can mount
	// without waiting for Cocoon to relay. Each event is re-dispatched as a
	// DOM `CustomEvent` so the terminal React/Astro components subscribe
	// through the same `document.addEventListener("cel:terminal:*")`
	// interface they use for resize.
	await Register(
		"sky://terminal/create",
		({ id, name, pid }: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:terminal:create", {
					detail: { id, name, pid },
				}),
			);
		},
	);

	await Register("sky://terminal/data", ({ id, data }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:terminal:data", {
				detail: { id, data },
			}),
		);
	});

	await Register("sky://terminal/exit", ({ id }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:terminal:exit", {
				detail: { id },
			}),
		);
	});

	// ---- Workspace folders ----
	// BATCH-14 follow-up: whenever Mountain mutates the workspace folder set
	// it emits `sky://workspaces/changed` with `{ added, removed, folders }`.
	// Sky re-dispatches it as a DOM event so the sidebar, breadcrumb, and
	// recent-folders list can refresh without polling `workspaces:getFolders`.
	await Register(
		"sky://workspaces/changed",
		({ added, removed, folders }: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:workspaces:changed", {
					detail: { added, removed, folders },
				}),
			);
		},
	);

	// ---- Notifications ----
	// Cocoon's `vscode.window.show{Information,Warning,Error}Message` routes
	// through Mountain's `Window.ShowMessage` effect which emits this event.
	// Sky re-dispatches it as `cel:notification:show` so any notification UI
	// (toast stack, status bar banner) can subscribe without needing a
	// direct Tauri listener.
	await Register("sky://notification/show", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:notification:show", {
				detail: Payload,
			}),
		);
	});
	await Register("sky://notification/progress-begin", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:notification:progress-begin", {
				detail: Payload,
			}),
		);
	});
	await Register(
		"sky://notification/progress-update",
		(Payload: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:notification:progress-update", {
					detail: Payload,
				}),
			);
		},
	);
	await Register("sky://notification/progress-end", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:notification:progress-end", {
				detail: Payload,
			}),
		);
	});

	// ---- Quick-pick / input / dialog prompts ----
	// Mountain's `Window.ShowQuickPick`/`ShowInputBox`/`ShowOpenDialog`/
	// `ShowSaveDialog` effects emit these events so Sky can render the
	// picker. Reply path (Sky → Mountain) is a downstream batch; re-
	// dispatching the event is enough for the current stub path.
	await Register("sky://quickpick/show", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:quickpick:show", { detail: Payload }),
		);
	});
	await Register("sky://input-box/show", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:input-box:show", { detail: Payload }),
		);
	});
	await Register("sky://dialog/open", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:dialog:open", { detail: Payload }),
		);
	});
	await Register("sky://dialog/save", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:dialog:save", { detail: Payload }),
		);
	});

	// ---- Lifecycle ----
	// Mountain emits this on `ApplicationRunTime::Shutdown()` before the
	// recovery pass tears sockets down. Wind/Sky need to flush state and
	// dispose long-lived subscriptions.
	await Register("sky://lifecycle/willShutdown", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:lifecycle:willShutdown", {
				detail: Payload,
			}),
		);
	});

	// ---- Status bar ----
	// Extensions that call `vscode.window.createStatusBarItem(...)` fan
	// `statusBar.update` through Mountain to `sky://statusbar/update`, and
	// `setStatusBarMessage` through `statusBar.message` →
	// `sky://statusbar/set-message`. Sky re-dispatches both as DOM events
	// so the workbench's status-bar component can subscribe in one place.
	// The canonical wire prefix is `sky://statusbar/` (no hyphen); the
	// earlier `sky://status-bar/…` fork was a listener-only mismatch with
	// no Mountain emitter and has been retired.
	await Register("sky://statusbar/update", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:statusbar:update", { detail: Payload }),
		);
	});
	await Register("sky://statusbar/dispose", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:statusbar:dispose", { detail: Payload }),
		);
	});
	await Register("sky://statusbar/set-message", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:statusbar:set-message", { detail: Payload }),
		);
	});

	// ---- Languages ----
	// `vscode.languages.setTextDocumentLanguage(doc, languageId)` flows
	// through Mountain's `languages.setDocumentLanguage` notification.
	await Register(
		"sky://languages/setDocumentLanguage",
		(Payload: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:languages:setDocumentLanguage", {
					detail: Payload,
				}),
			);
		},
	);
	// `setLanguageConfiguration` fires when an extension's activation
	// installs brackets, wordPattern, indentationRules, etc. Monaco
	// applies them via `monaco.languages.setLanguageConfiguration` in the
	// workbench layer; re-dispatch so that shim can pick them up.
	await Register("sky://language/configure", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:language:configure", { detail: Payload }),
		);
	});

	// ---- Diagnostics / themes / SCM / docs / tests / native ----
	// Round up the remaining `sky://` channels Mountain already emits so
	// every event has a DOM listener downstream. Each arm re-dispatches
	// on `cel:<prefix>:<action>` so consumers never need a Tauri listener
	// of their own. Channels are sourced from the Wind `SkyEvent` table -
	// the single source of truth that mirrors Mountain's Rust enum - so a
	// renamed variant either compiles or breaks type-check, never silently
	// fails at runtime.
	const ChannelToDomEvent = (Channel: string): string =>
		Channel.replace(/^sky:\/\//, "cel:").replace(/\//g, ":");
	const FanOut = [
		SkyEvent.DiagnosticsChanged,
		SkyEvent.ThemeChange,
		SkyEvent.TreeViewDispose,
		SkyEvent.TreeViewCreate,
		SkyEvent.TestRegistered,
		SkyEvent.SCMProviderAdded,
		SkyEvent.SCMProviderRemoved,
		SkyEvent.DocumentsOpen,
		SkyEvent.DocumentsSaved,
		SkyEvent.DebugStop,
		SkyEvent.TerminalClosed,
		SkyEvent.TerminalOpened,
		SkyEvent.NativeOpenExternal,
		SkyEvent.TaskTerminate,
		SkyEvent.EditorApplyEdits,
		SkyEvent.EditorOpenDocument,
		SkyEvent.EditorSaveAll,
		SkyEvent.OutputReplace,
		SkyEvent.OutputReveal,
		SkyEvent.StatusBarCreate,
		SkyEvent.StatusBarDispose,
		SkyEvent.StatusBarDisposeEntry,
		SkyEvent.StatusBarSetEntry,
		SkyEvent.WebviewSetHTML,
	] as const;
	for (const Channel of FanOut) {
		await Register(Channel, (Payload: any) => {
			document.dispatchEvent(
				new CustomEvent(ChannelToDomEvent(Channel), { detail: Payload }),
			);
		});
	}

	// ---- Extension-host debug service ----
	// Workbench reload/close triggered from the extension host debug
	// service (`vscode.debug.onDidReceiveDebugSessionCustomEvent` flow).
	await Register("sky://exthost/debug-reload", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:exthost:debug-reload", { detail: Payload }),
		);
	});
	await Register("sky://exthost/debug-close", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:exthost:debug-close", { detail: Payload }),
		);
	});

	// ---- Webview extensions ----
	// Extension-initiated webview content updates. The canonical channel
	// is the kebab-case `sky://webview/set-html` (see `SkyEvent.ts` for
	// the single source of truth). The earlier camelCase fan-out over
	// `setTitle`/`setIconPath`/`setHtml` had no matching Mountain emitter
	// for the first two and the third is now covered by the main bulk
	// loop via `SkyEvent.WebviewSetHTML`.

	// ---- Tasks ----
	// `vscode.tasks.executeTask(task)` flows through Mountain's
	// `Task.Execute` effect, which emits `sky://task/execute` so the
	// workbench's task-runner component can pick up the payload and drive
	// the underlying process.
	await Register("sky://task/execute", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:task:execute", { detail: Payload }),
		);
	});

	// ---- Workspace edits / focus ----
	// Extensions' `workspace.applyEdit(edit)` / `window.showTextDocument(uri)`
	// round-trip through Mountain; Sky re-dispatches so the workbench can
	// drive its BulkEditService + EditorService.
	await Register("sky://workspace/applyEdit", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:workspace:applyEdit", { detail: Payload }),
		);
	});
	await Register("sky://window/showTextDocument", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:window:showTextDocument", { detail: Payload }),
		);
	});

	// ---- Editor decorations ----
	await Register(
		"sky://decoration/createTextEditorDecorationType",
		(Payload: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:decoration:create", { detail: Payload }),
			);
		},
	);
	await Register(
		"sky://decoration/disposeTextEditorDecorationType",
		(Payload: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:decoration:dispose", { detail: Payload }),
			);
		},
	);

	// ---- Output channels ----
	// `vscode.window.createOutputChannel(...)` runs entirely in the extension
	// host, but lifecycle events (create/append/clear/show/hide/dispose)
	// round-trip through Mountain as notifications so the workbench's
	// Output panel can mirror every write. Sky re-dispatches each arm.
	for (const Action of [
		"create",
		"append",
		"clear",
		"show",
		"hide",
		"dispose",
	]) {
		await Register(`sky://output-channel/${Action}`, (Payload: any) => {
			document.dispatchEvent(
				new CustomEvent(`cel:output-channel:${Action}`, {
					detail: Payload,
				}),
			);
		});
	}

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
	// Atom Q1: Mountain emits this for *every* showMessage call regardless
	// of whether actions are provided. Two shapes land here:
	//   Legacy/passive : { severity, message, actions }
	//   Promise/pending: { RequestIdentifier, Payload: { Severity, Message, Options } }
	// The Promise shape carries a RequestIdentifier; the resolve path mirrors
	// the quick-pick / input-box flow.
	await Register(
		"sky://ui/show-message-request",
		(RawPayload: any) => {
			if (RawPayload?.RequestIdentifier) {
				const Inner = RawPayload.Payload ?? {};
				const Severity =
					Inner?.Severity ?? Inner?.severity ?? "info";
				const Message = Inner?.Message ?? Inner?.message ?? "";
				const Options = Inner?.Options ?? Inner?.options ?? {};
				const Actions: Array<{ title: string }> = Array.isArray(
					Options?.Actions ?? Options?.actions,
				)
					? (Options?.Actions ?? Options?.actions)
					: [];
				if (Actions.length === 0) {
					ShowNotification(Severity, Message, []);
					void ResolveUiRequest(
						RawPayload.RequestIdentifier,
						null,
					);
					return;
				}
				let Picked: string | null = null;
				if (Actions.length === 1) {
					if (window.confirm(`${Message}\n\n(${Actions[0].title})`)) {
						Picked = Actions[0].title;
					}
				} else {
					const Choice = window.prompt(
						`${Message}\n\nChoose: ${Actions.map(
							(A) => A.title,
						).join(" / ")}`,
						Actions[0].title,
					);
					if (
						Choice &&
						Actions.some((A) => A.title === Choice)
					) {
						Picked = Choice;
					}
				}
				void ResolveUiRequest(RawPayload.RequestIdentifier, Picked);
				return;
			}
			// Legacy passive shape - still used by telemetry / toast channels.
			ShowNotification(
				RawPayload?.severity ?? "info",
				RawPayload?.message ?? "",
				RawPayload?.actions,
			);
		},
	);

	await Register(
		"sky://ui/show-input-box-request",
		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			// Minimal fallback - a DOM prompt is serviceable until Sky ships
			// a native input box component. Extensions receive the literal
			// string the user typed, or `null` when the user dismissed.
			const Options = Payload ?? {};
			const Answer = window.prompt(
				Options?.Prompt ??
					Options?.PlaceHolder ??
					Options?.prompt ??
					Options?.placeHolder ??
					"",
				Options?.Value ?? Options?.value ?? "",
			);
			void ResolveUiRequest(RequestIdentifier, Answer);
		},
	);

	await Register(
		"sky://ui/show-quick-pick-request",
		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			const Items = Payload?.Items ?? Payload?.items ?? [];
			const Options = Payload?.Options ?? Payload?.options ?? {};
			// Broadcast a DOM event so Sky components can render a real
			// quick-pick UI. Components call `ResolveUiRequest` themselves
			// by listening for `cel:quickpick:resolve` CustomEvents.
			document.dispatchEvent(
				new CustomEvent("cel:quickpick:show", {
					detail: { RequestIdentifier, Items, Options },
				}),
			);
			// Safety-net fallback: if no component consumes the event
			// within 30 s, resolve with the first picked label (or null
			// when no item is pre-selected). Prevents Mountain from
			// timing out on a missing UI.
			const FallbackTimer = window.setTimeout(() => {
				const PickedLabels = Array.isArray(Items)
					? Items.filter((Item: any) => Item?.picked).map(
							(Item: any) => Item?.label ?? null,
						)
					: [];
				const Fallback = Options?.canPickMany
					? PickedLabels
					: (PickedLabels[0] ?? null);
				void ResolveUiRequest(RequestIdentifier, Fallback);
			}, 30_000);
			document.addEventListener(
				"cel:quickpick:resolve",
				(Event: any) => {
					if (Event?.detail?.RequestIdentifier !== RequestIdentifier)
						return;
					window.clearTimeout(FallbackTimer);
					void ResolveUiRequest(
						RequestIdentifier,
						Event?.detail?.Result ?? null,
					);
				},
				{ once: true },
			);
		},
	);

	// Atom Q1: message box with actions. Mountain already uses this shape
	// (see `sky://ui/show-message-request` above for the notification fn);
	// when extensions pass `actions`, we must return the picked index.
	await Register(
		"sky://ui/show-message-with-actions-request",
		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			const Message = Payload?.Message ?? Payload?.message ?? "";
			const Actions: Array<{ title: string }> =
				Payload?.Actions ?? Payload?.actions ?? [];
			// No native chooser yet - use confirm() for a single action, or
			// prompt() with the action titles for multiple. Real UI work
			// happens downstream when Sky ships a message-box component.
			let Picked: string | null = null;
			if (Actions.length === 0) {
				window.alert(Message);
			} else if (Actions.length === 1) {
				if (window.confirm(`${Message}\n\n(${Actions[0].title})`)) {
					Picked = Actions[0].title;
				}
			} else {
				const Choice = window.prompt(
					`${Message}\n\nChoose: ${Actions.map((A) => A.title).join(" / ")}`,
					Actions[0].title,
				);
				if (
					Choice &&
					Actions.some((A) => A.title === Choice)
				) {
					Picked = Choice;
				}
			}
			void ResolveUiRequest(RequestIdentifier, Picked);
		},
	);

	// Cleanup helper (call on Tauri window close)
	(window as any).__CEL_SKY_BRIDGE_CLEANUP__ = () =>
		Cleanups.forEach((F) => F());

	console.log("[SkyBridge] All sky:// event channels registered");
}

export default InstallSkyBridge;
