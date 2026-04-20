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
	// `statusBar.update` through Mountain to `sky://status-bar/update`, and
	// `setStatusBarMessage` through `statusBar.message` →
	// `sky://status-bar/message`. Sky re-dispatches both as DOM events so
	// the workbench's status-bar component can subscribe in one place.
	await Register("sky://status-bar/update", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:status-bar:update", { detail: Payload }),
		);
	});
	await Register("sky://status-bar/dispose", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:status-bar:dispose", { detail: Payload }),
		);
	});
	await Register("sky://status-bar/message", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:status-bar:message", { detail: Payload }),
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
	// of their own.
	for (const [Channel, DomEvent] of [
		["sky://diagnostics/changed", "cel:diagnostics:changed"],
		["sky://theme/change", "cel:theme:change"],
		["sky://tree-view/dispose", "cel:tree-view:dispose"],
		["sky://tree-view/create", "cel:tree-view:create"],
		["sky://test/registered", "cel:test:registered"],
		["sky://scm/provider/added", "cel:scm:provider-added"],
		["sky://scm/provider/removed", "cel:scm:provider-removed"],
		["sky://documents/open", "cel:documents:open"],
		["sky://documents/saved", "cel:documents:saved"],
		["sky://debug/stop", "cel:debug:stop"],
		["sky://debug/addBreakpoints", "cel:debug:addBreakpoints"],
		["sky://debug/removeBreakpoints", "cel:debug:removeBreakpoints"],
		["sky://debug/consoleAppend", "cel:debug:consoleAppend"],
		["sky://terminal/closed", "cel:terminal:closed"],
		["sky://terminal/opened", "cel:terminal:opened"],
		["sky://native/openExternal", "cel:native:openExternal"],
		["sky://task/terminate", "cel:task:terminate"],
		["sky://editor/applyEdits", "cel:editor:applyEdits"],
		["sky://editor/openDocument", "cel:editor:openDocument"],
		["sky://editor/saveAll", "cel:editor:saveAll"],
		["sky://output/replace", "cel:output:replace"],
		["sky://output/reveal", "cel:output:reveal"],
		["sky://statusbar/create", "cel:statusbar:create"],
		["sky://statusbar/dispose", "cel:statusbar:dispose"],
		["sky://statusbar/dispose-entry", "cel:statusbar:dispose-entry"],
		["sky://statusbar/set-entry", "cel:statusbar:set-entry"],
		["sky://webview/setHtml", "cel:webview:setHtml"],
	] as const) {
		await Register(Channel, (Payload: any) => {
			document.dispatchEvent(
				new CustomEvent(DomEvent, { detail: Payload }),
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
	// Extension-initiated webview metadata/content updates. Covers
	// setTitle, setIconPath, setHtml so every webview panel stays in sync.
	for (const Action of ["setTitle", "setIconPath", "setHtml"]) {
		await Register(`sky://webview/${Action}`, (Payload: any) => {
			document.dispatchEvent(
				new CustomEvent(`cel:webview:${Action}`, { detail: Payload }),
			);
		});
	}

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
