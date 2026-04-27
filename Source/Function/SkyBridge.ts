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
 *   sky://statusbar/update       → IStatusbarService.addEntry / accessor.update
 *   sky://statusbar/set-entry    → alias of /update (fast-text path)
 *   sky://statusbar/dispose      → accessor.dispose
 *   sky://statusbar/dispose-entry → alias of /dispose
 *   sky://statusbar/set-message  → fan-out to cel:statusbar:set-message
 *   sky://command/execute        → ICommandService.executeCommand
 *   sky://command/register       → CommandsRegistry.registerCommand
 *   sky://command/unregister     → disposable.dispose
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

// Single source of truth for Mountain → Sky event URIs. Importing from
// the Wind package avoids maintaining a parallel string table here and
// catches drift against Mountain's Rust `SkyEvent` enum at type-check
// time (Wind's TS table is the TS mirror of Common/IPC/SkyEvent.rs).
import SkyEvent from "@codeeditorland/wind/Target/IPC/SkyEvent.js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// Track which `cel:*` CustomEvents have at least one consumer so we
// can report a `consumer-present` flag on every dispatch under the
// `cel-dispatch` tag.
//
// Tracking is best-effort. In WebKit/Safari, DOM prototype methods
// like `Document.prototype.addEventListener` are defined as
// non-writable properties on the instance; reassigning
// `document.addEventListener` throws `TypeError: Attempted to assign
// to readonly property` in strict mode (ES modules are strict), which
// crashes the entire Sky bundle at load and takes the workbench down
// with a cascade of unhandled rejections. We wrap the install in
// `try/catch` so a failed install degrades to `consumer-present=?`
// reporting instead of breaking boot. SSR is also skipped via the
// `typeof document !== "undefined"` guard because Astro imports
// SkyBridge during pre-render.
const _CelConsumers = new Set<string>();
const _HasDOM =
	typeof globalThis !== "undefined" &&
	typeof (globalThis as any).document !== "undefined";
let _CelTrackingActive = false;
if (_HasDOM && !(globalThis as any).__LAND_CEL_TRACK__) {
	try {
		const TargetDocument = (globalThis as any).document as Document;
		const OriginalAdd =
			TargetDocument.addEventListener.bind(TargetDocument);
		// Install via `Object.defineProperty` on the prototype, with
		// `configurable: true` so we can cleanly replace the method.
		// If the runtime rejects the redefinition we catch and fall
		// back to untracked mode - the tag still fires, just without
		// the consumer-present flag.
		Object.defineProperty(TargetDocument, "addEventListener", {
			configurable: true,
			writable: true,
			value: function PatchedAdd(
				Type: string,
				Listener: EventListenerOrEventListenerObject | null,
				Options?: boolean | AddEventListenerOptions,
			) {
				if (typeof Type === "string" && Type.startsWith("cel:")) {
					_CelConsumers.add(Type);
				}
				return OriginalAdd(Type, Listener as EventListener, Options);
			},
		});
		(globalThis as any).__LAND_CEL_TRACK__ = true;
		_CelTrackingActive = true;
	} catch {
		_CelTrackingActive = false;
	}
}

// Mirror a `cel-dispatch` line into Mountain's dev-log file sink via
// the RenderDevLog Tauri command. Fire-and-forget. Silent when no
// Tauri invoke is available (SSR or plain web preview). When the
// addEventListener wrap couldn't be installed (readonly property,
// rare), the `consumer-present` field reports `?` so the tag still
// yields useful traffic data without lying about consumer state.
const _CelDispatchLog = (DomEvent: string, HasConsumer: boolean): void => {
	if (!_HasDOM) return;
	const Flag = _CelTrackingActive ? String(HasConsumer) : "?";
	try {
		invoke<void>("RenderDevLog", {
			Tag: "cel-dispatch",
			Message: `[CelDispatch] event=${DomEvent} consumer-present=${Flag}`,
			tag: "cel-dispatch",
			message: `[CelDispatch] event=${DomEvent} consumer-present=${Flag}`,
		}).catch(() => {});
	} catch {}
};

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

// Concrete workbench service handles written by the Output transform
// plugin `ExposeWorkbenchAccessor.ts` at `globalThis.__CEL_SERVICES__`.
// Resolved inside web.main.js right after `workbench.startup()` so the
// DI container has populated every `createDecorator`-registered service.
// Method surfaces (`addEntry`, `executeCommand`, `registerCommand`) are
// stable public API and survive the mangler pass.
interface CelStatusbarEntryAccessor {
	update(entry: unknown): void;
	dispose(): void;
}
interface CelStatusbarService {
	addEntry(
		entry: unknown,
		id: string,
		alignment: number,
		priority?: number,
	): CelStatusbarEntryAccessor;
}
interface CelCommandService {
	executeCommand<T = unknown>(id: string, ...args: unknown[]): Promise<T>;
}
interface CelCommandRegistry {
	registerCommand(
		id: string,
		handler: (...args: unknown[]) => unknown,
	): { dispose(): void };
}
interface CelSearchService {
	// `SearchProviderType`: file=0, text=1, aiText=2. Schema is the URI
	// scheme the provider answers for - "file" for local workspace content.
	registerSearchResultProvider(
		scheme: string,
		type: number,
		provider: unknown,
	): { dispose(): void };
}
// `ITreeView` from `vs/workbench/common/views`. Only the shape Sky
// actually writes to (`dataProvider`) is typed - the rest is optional
// read-only metadata the stock pane handles.
interface CelTreeView {
	dataProvider:
		| undefined
		| {
				getChildren(element?: {
					handle?: string;
				}): Promise<unknown[] | undefined>;
				isTreeEmpty?: boolean;
		  };
	title?: string;
	description?: string | undefined;
	message?: string | undefined;
	refresh?(
		treeItems?: readonly unknown[],
		checkboxesChanged?: readonly unknown[],
	): Promise<void>;
}
/**
 * Stock VS Code `URI` class shape. Only the methods Sky-side bridges
 * actually invoke are typed; everything else flows through the workbench
 * as opaque. The full class lives at
 * `vs/base/common/uri.js` in the renderer bundle and is exposed on
 * `__CEL_SERVICES__.URI` by `ExposeWorkbenchAccessor`.
 */
interface CelUriCtor {
	file(path: string): CelUri;
	parse(value: string, strict?: boolean): CelUri;
	from(components: {
		scheme: string;
		authority?: string;
		path?: string;
		query?: string;
		fragment?: string;
	}): CelUri;
	revive(value: unknown): CelUri;
}
interface CelUri {
	readonly scheme: string;
	readonly authority: string;
	readonly path: string;
	readonly query: string;
	readonly fragment: string;
	readonly fsPath: string;
	with(change: {
		scheme?: string;
		authority?: string;
		path?: string;
		query?: string;
		fragment?: string;
	}): CelUri;
	toString(skipEncoding?: boolean): string;
	toJSON(): unknown;
}
interface CelServices {
	Statusbar: CelStatusbarService;
	Commands: CelCommandService;
	CommandRegistry: CelCommandRegistry;
	Search: CelSearchService;
	Views?: unknown;
	TreeViewByViewId?: (viewId: string) => CelTreeView | null;
	URI?: CelUriCtor;
}

function GetServices(): CelServices | null {
	return (window as any).__CEL_SERVICES__ ?? null;
}

// Probe `__CEL_SERVICES__` shape once after services-ready fires. The
// Output transform plugin `ExposeWorkbenchAccessor.ts` populates each
// service handle inside a `try`-IIFE; a contrib that fails to resolve
// (rare but observed for `IDebugService` in the headless web profile)
// silently drops to `null`. Without this probe, the Sky-side SCM /
// Debug / CustomEditor bridges silently no-op without telling anyone
// why. Logs once to the renderer console (visible in DevTools) on the
// first `cel:services-ready` fire; subsequent listeners are unaffected.
{
	const ProbeServices = (): void => {
		const S = GetServices() as Record<string, unknown> | null;
		if (!S) {
			try {
				console.warn("[Sky:CEL] __CEL_SERVICES__ missing on probe");
			} catch {}
			return;
		}
		const Keys = [
			"Statusbar",
			"Commands",
			"CommandRegistry",
			"Search",
			"Views",
			"URI",
			"TreeViewByViewId",
			"SCM",
			"Debug",
			"CustomEditor",
			"Emitter",
			"Disposable",
			"ToDisposable",
			"Models",
			"Languages",
		];
		const Shape = Keys.map(
			(K) => `${K}=${S[K] == null ? "null" : typeof S[K]}`,
		).join(" ");
		try {
			console.log(`[Sky:CEL] services-ready ${Shape}`);
		} catch {}
	};
	if (typeof window !== "undefined") {
		// If services already ready by the time this module loads, probe
		// immediately. Otherwise wait for the event.
		if ((window as any).__CEL_SERVICES__) {
			ProbeServices();
		} else {
			window.addEventListener(
				"cel:services-ready",
				() => ProbeServices(),
				{ once: true },
			);
		}
	}
}

// ============================================================================
// URI helpers for command arguments
// ============================================================================
//
// Stock VS Code commands like `vscode.open` accept either a real `URI`
// instance OR a `URIComponents` POJO with `$mid:1` (the workbench's
// `URI.revive(...)` lifts those at the boundary). We prefer the real
// class when available because:
//
//   1. In-process consumers (search dedup Map, command palette quick
//      pick) call `uri.with(...)` / `uri.toString()` directly without
//      going through `revive` - same root cause as the search-provider
//      `uri.with is not a function` bug.
//   2. Round-tripping a real URI through serialisation is loss-free,
//      while a POJO has to be rebuilt by every consumer.
//
// `BuildOpenArg` accepts whatever the caller gives us (string,
// pre-built URI instance, plain UriComponents, or a workspace-folder
// shape with `.uri` nested) and produces a real URI when the bundled
// class is available. Fallback POJO retains `$mid:1` so the few code
// paths that DO call `revive` still work.
function BuildOpenArg(Source: unknown): unknown {
	const Ctor = GetServices()?.URI;
	const ExtractParts = (
		Value: unknown,
	): {
		Scheme: string;
		Authority: string;
		Path: string;
		Query: string;
		Fragment: string;
	} | null => {
		if (Value == null) return null;
		if (typeof Value === "string") {
			const Trimmed = Value.trim();
			if (!Trimmed) return null;
			if (Trimmed.includes("://")) {
				try {
					const Parsed = new URL(Trimmed);
					return {
						Scheme: Parsed.protocol.replace(/:$/, ""),
						Authority: Parsed.host,
						Path: decodeURIComponent(Parsed.pathname),
						Query: Parsed.search.replace(/^\?/, ""),
						Fragment: Parsed.hash.replace(/^#/, ""),
					};
				} catch {
					return null;
				}
			}
			return {
				Scheme: "file",
				Authority: "",
				Path: Trimmed,
				Query: "",
				Fragment: "",
			};
		}
		if (typeof Value !== "object") return null;
		const Holder = Value as Record<string, unknown>;
		// Workspace-folder-style nested shape.
		if (Holder["uri"] && typeof Holder["uri"] === "object") {
			return ExtractParts(Holder["uri"]);
		}
		const Scheme = String(Holder["scheme"] ?? "file");
		const Path = String(Holder["path"] ?? Holder["fsPath"] ?? "");
		if (!Path) return null;
		return {
			Scheme,
			Authority: String(Holder["authority"] ?? ""),
			Path,
			Query: String(Holder["query"] ?? ""),
			Fragment: String(Holder["fragment"] ?? ""),
		};
	};
	const Parts = ExtractParts(Source);
	if (!Parts) return Source;
	if (Ctor) {
		try {
			return Ctor.from({
				scheme: Parts.Scheme,
				authority: Parts.Authority,
				path: Parts.Path,
				query: Parts.Query,
				fragment: Parts.Fragment,
			});
		} catch {
			// Fall through to POJO.
		}
	}
	return {
		$mid: 1,
		scheme: Parts.Scheme,
		authority: Parts.Authority,
		path: Parts.Path,
		query: Parts.Query,
		fragment: Parts.Fragment,
	};
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
// Status bar bridge (no-op - stock workbench renders the bar)
// ============================================================================
//
// Stock VS Code's workbench owns the `.statusbar` DOM and its
// `StatusbarService` renders the native items (language mode, line/col,
// encoding, EOL, etc.). A previous version of this bridge appended a
// `position:fixed; bottom:0; z-index:9999` fallback bar to document.body,
// which visually overlayed the native bar and was the reason the default
// VS Code status bar did not appear. That fallback is removed - the
// bridge now drops extension-contributed status-bar notifications on the
// floor until `MainThreadStatusBar.$setEntry` is wired end-to-end into
// the workbench `IStatusbarService`. Dropping is safe: extensions keep
// booting, the native bar renders, and the missing per-extension items
// are recoverable once the real routing lands.

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
			.executeCommand("vscode.open", BuildOpenArg(uri), viewColumn)
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
	await Register("sky://window/showTextDocument", async (RawPayload: any) => {
		const RequestIdentifier = RawPayload?.RequestIdentifier;
		const Payload = RawPayload?.Payload ?? RawPayload;
		const UriValue =
			Payload?.[0]?.uri ?? Payload?.uri ?? Payload?.[0] ?? null;
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
					BuildOpenArg(UriValue),
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
	// Cocoon's `vscode.window.createStatusBarItem(...)` fans via
	// `statusBar.{update,dispose}` through Mountain's StatusBarLifecycle
	// notification onto `sky://statusbar/{update,dispose}`, and
	// `setStatusBarMessage` / direct `StatusBarItem.text =` writes onto
	// `sky://statusbar/set-entry` via SetStatusBarText. Wire all three
	// into the native `IStatusbarService` exposed by the workbench
	// accessor transform, so extension-contributed items render in the
	// same `.statusbar` DOM as stock items. The DOM CustomEvent fan-out
	// below (`cel:statusbar:*`) remains for any Sky-side component that
	// wants to mirror the state in a side panel.
	//
	// Alignment mapping follows VS Code's `StatusbarAlignment` enum:
	// LEFT=0, RIGHT=1 - the accessor takes it as a number. We accept
	// both string and numeric forms from Cocoon since extensions
	// supply whichever their dts typed as.
	const StatusbarAccessors = new Map<string, CelStatusbarEntryAccessor>();
	const BuildEntry = (Payload: any) => ({
		name: Payload?.name ?? Payload?.extension ?? "extension",
		text: Payload?.text ?? "",
		tooltip: Payload?.tooltip,
		command: Payload?.command,
		ariaLabel:
			Payload?.accessibilityInformation?.label ?? Payload?.text ?? "",
		role: Payload?.accessibilityInformation?.role,
		backgroundColor: Payload?.backgroundColor,
		color: Payload?.color,
	});
	const AlignmentToNumber = (Raw: any): number => {
		if (Raw === 0 || Raw === 1) return Raw;
		if (Raw === "right" || Raw === "RIGHT") return 1;
		return 0;
	};
	const SetOrUpdateEntry = (Payload: any) => {
		const Services = GetServices();
		if (!Services?.Statusbar) return;
		const Id = String(
			Payload?.id ?? Payload?.handle ?? Payload?.entryId ?? "",
		);
		if (!Id) return;
		const Existing = StatusbarAccessors.get(Id);
		if (Existing) {
			try {
				Existing.update(BuildEntry(Payload));
			} catch (Error) {
				console.warn("[SkyBridge] statusbar update failed", Id, Error);
			}
			return;
		}
		try {
			const Accessor = Services.Statusbar.addEntry(
				BuildEntry(Payload),
				Id,
				AlignmentToNumber(Payload?.alignment),
				typeof Payload?.priority === "number"
					? Payload.priority
					: undefined,
			);
			StatusbarAccessors.set(Id, Accessor);
		} catch (Error) {
			console.warn("[SkyBridge] statusbar addEntry failed", Id, Error);
		}
	};
	const DisposeEntry = (Payload: any) => {
		const Id = String(
			Payload?.id ?? Payload?.handle ?? Payload?.entryId ?? "",
		);
		if (!Id) return;
		const Accessor = StatusbarAccessors.get(Id);
		if (Accessor) {
			try {
				Accessor.dispose();
			} catch {}
			StatusbarAccessors.delete(Id);
		}
	};
	await Register("sky://statusbar/update", SetOrUpdateEntry);
	await Register("sky://statusbar/set-entry", SetOrUpdateEntry);
	await Register("sky://statusbar/dispose", DisposeEntry);
	await Register("sky://statusbar/dispose-entry", DisposeEntry);

	// ---- Commands ----
	// Bridge Cocoon → workbench command invocations. `sky://command/execute`
	// calls through `ICommandService.executeCommand(id, ...args)` and
	// resolves the UI request with the result (or null on failure) so the
	// extension's awaited promise in Cocoon unblocks. `sky://command/register`
	// registers an extension-contributed command into the stock
	// `CommandsRegistry`; invocation from the command palette or another
	// extension proxies back into Cocoon via `ResolveUIRequest` with
	// `{ cid, args }`. Unregister disposes the registration.
	const RegisteredCommands = new Map<string, { dispose(): void }>();
	await Register("sky://command/execute", async (RawPayload: any) => {
		const Services = GetServices();
		if (!Services?.Commands) return;
		const RequestIdentifier = RawPayload?.RequestIdentifier;
		const Payload = RawPayload?.Payload ?? RawPayload;
		const Id = String(Payload?.id ?? Payload?.commandId ?? "");
		const Arguments = Array.isArray(Payload?.args) ? Payload.args : [];
		try {
			const Result = await Services.Commands.executeCommand(
				Id,
				...Arguments,
			);
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, Result ?? null);
			}
		} catch (Error) {
			console.warn("[SkyBridge] command execute failed", Id, Error);
			if (RequestIdentifier) {
				void ResolveUiRequest(RequestIdentifier, null);
			}
		}
	});
	await Register("sky://command/register", (Payload: any) => {
		const Services = GetServices();
		if (!Services?.CommandRegistry) return;
		const Id = String(Payload?.id ?? Payload?.commandId ?? "");
		if (!Id) return;
		if (RegisteredCommands.has(Id)) return;
		try {
			const Disposable = Services.CommandRegistry.registerCommand(
				Id,
				(...AllArguments: unknown[]) => {
					// `CommandsRegistry.registerCommand` passes an accessor
					// as the first arg followed by the caller's args. The
					// accessor is the workbench ServicesAccessor - extensions
					// running in Cocoon can't consume it, so we strip it and
					// forward the remaining positional args back for the
					// extension handler to receive via $executeContributedCommand.
					const CallerArguments = AllArguments.slice(1);
					return invoke("ResolveUIRequest", {
						RequestID: `command:${Id}`,
						Result: { cid: Id, args: CallerArguments },
					}).catch(() => undefined);
				},
			);
			RegisteredCommands.set(Id, Disposable);
		} catch (Error) {
			console.warn("[SkyBridge] command register failed", Id, Error);
		}
	});
	await Register("sky://command/unregister", (Payload: any) => {
		const Id = String(Payload?.id ?? Payload?.commandId ?? "");
		if (!Id) return;
		const Disposable = RegisteredCommands.get(Id);
		if (Disposable) {
			try {
				Disposable.dispose();
			} catch {}
			RegisteredCommands.delete(Id);
		}
	});

	// ---- Search result provider (Land-native) ----
	//
	// Stock VS Code web's `RemoteSearchService` constructs a
	// `LocalFileSearchWorkerClient` which calls
	// `HTMLFileSystemProvider.getHandle(folderUri)` to obtain a File System
	// Access API directory handle. Land's filesystem goes through Mountain
	// over Tauri IPC, not the browser's FSA API, so the handle resolve
	// returns `undefined` and the search viewlet silently returns zero
	// results. The fix: register a provider that routes to Mountain's
	// existing `search:findFiles` / `search:findInFiles` handlers via
	// `MountainIPCInvoke`. Registered for the `file` scheme under both
	// SearchProviderType.file (0) and SearchProviderType.text (1) so both
	// the Search viewlet text queries and file-name filter hit it.
	//
	// Registration is best-effort - if `__CEL_SERVICES__.Search` isn't
	// populated yet (workbench still booting), wait for the
	// `cel:workbench-ready` event fired by ExposeWorkbenchAccessor.
	const RegisterLandSearchProvider = () => {
		const Services = GetServices();
		if (!Services?.Search?.registerSearchResultProvider) return false;

		// Extract the single-folder root URI from a query - Mountain's
		// search handlers take the active workspace folder, not a set.
		// Multi-root queries fan out over each folder; first one wins for
		// now (Land's scanner is single-root in the debug profile).
		const FolderFromQuery = (Query: any): string | null => {
			const Folder =
				Query?.folderQueries?.[0]?.folder ?? Query?.folder ?? null;
			if (!Folder) return null;
			if (typeof Folder === "string") return Folder;
			const Path = Folder?.fsPath ?? Folder?.path ?? "";
			return Path || null;
		};

		// `URI` lookup is re-resolved at every result construction so a
		// SkyBridge that registered before `__CEL_SERVICES__.URI` was
		// bound (event-rescue path runs before the URI patch lands) can
		// pick it up on the first actual search call rather than being
		// stuck with the boot-time snapshot. Cheap - single property
		// read per result row.
		//
		// The provider is registered IN-PROCESS in the workbench, NOT
		// through the extension-host RPC bridge - so the workbench
		// never calls `URI.revive(...)` on what we return. It dedups
		// results via `getComparisonKey(uri)` which is `uri.with({...})`
		// plus `.toString()`. Returning a raw `URIComponents` POJO
		// (`{ $mid:1, path, scheme }`) throws
		// `uri.with is not a function` at the first dedup check.
		const MakeFileUri = (
			FsPath: string,
		): CelUri | { scheme: string; path: string; fsPath: string } => {
			const Ctor = GetServices()?.URI;
			if (Ctor) return Ctor.file(FsPath);
			// Last-resort fallback when `__CEL_SERVICES__.URI` somehow
			// missed the patch. The result is a POJO with the right
			// shape but no `.with()` - the workbench will still throw
			// on dedup, just gracefully now (no `$mid:1` because that
			// implies revive should be called and isn't here).
			return { scheme: "file", path: FsPath, fsPath: FsPath };
		};

		// Translate a raw Mountain hit into the workbench's `IFileMatch`
		// shape.
		//
		// **Wire shape**: Mountain's `SearchProvider::TextSearch` (in
		// `Mountain/Source/Environment/SearchProvider.rs::TextSearch`)
		// returns one entry per FILE that contained matches:
		//
		// ```json
		// [
		//   {
		//     "resource": "file:///abs/path.ts",
		//     "matches": [
		//       { "preview": "line text", "line_number": 42 },
		//       { "preview": "another",   "line_number": 51 }
		//     ]
		//   },
		//   ...
		// ]
		// ```
		//
		// **Workbench shape**: `IFileMatch` is one entry per file with
		// `results[]` carrying every per-line match (`preview` + range).
		// The previous adapter read `Hit.uri` / `Hit.lineNumber` /
		// `Hit.preview` (flat per-hit shape) - none of those fields
		// exist in Mountain's response, so every search produced
		// `resource = MakeFileUri("")` and an empty results array. The
		// workbench's dedup map saw N "matches in <empty path>" rows
		// and merged them away to nothing visible.
		const MatchFromHit = (Hit: any) => {
			const Raw = String(Hit?.resource ?? Hit?.uri ?? "");
			const OsPath = Raw.replace(/^file:\/\//, "");
			type LineHit = {
				preview: string;
				lineNumber: number;
				columns: Array<{ start: number; end: number }>;
			};
			const PerLineMatches: LineHit[] = Array.isArray(Hit?.matches)
				? Hit.matches.map((Inner: any) => ({
						preview: String(Inner?.preview ?? ""),
						lineNumber: Number(
							Inner?.line_number ?? Inner?.lineNumber ?? 1,
						),
						columns: Array.isArray(Inner?.columns)
							? Inner.columns.map((C: any) => ({
									start: Number(C?.start ?? 0),
									end: Number(C?.end ?? 0),
								}))
							: [],
					}))
				: // Backwards-compat: also accept a flat per-hit shape
					// `{ uri, lineNumber, preview }` for any future Mountain
					// path that returns flat hits.
					[
						{
							preview: String(Hit?.preview ?? ""),
							lineNumber: Number(
								Hit?.lineNumber ?? Hit?.line_number ?? 1,
							),
							columns: [],
						},
					];
			return {
				resource: MakeFileUri(OsPath),
				results: PerLineMatches.map((M) => {
					// VS Code's `ISearchRange`: 1-based for line, 0-based
					// for column. Mountain's columns array is already
					// 0-based UTF-8 char offsets within the preview line.
					// When Mountain didn't supply columns (older ripgrep
					// path or zero-width match), highlight the whole
					// line so the user still sees the row but without
					// a sub-line underline.
					const Ranges =
						M.columns.length > 0
							? M.columns.map((C) => ({
									startLineNumber: M.lineNumber,
									startColumn: C.start + 1,
									endLineNumber: M.lineNumber,
									endColumn: C.end + 1,
								}))
							: [
									{
										startLineNumber: M.lineNumber,
										startColumn: 1,
										endLineNumber: M.lineNumber,
										endColumn: Math.max(
											1,
											M.preview.length + 1,
										),
									},
								];
					// `preview.matches` is the SAME range list but
					// translated into preview-local coordinates (line 1,
					// column relative to preview start). Without this the
					// renderer shows the row but no matched-substring
					// highlight inside the line.
					const PreviewMatches =
						M.columns.length > 0
							? M.columns.map((C) => ({
									startLineNumber: 1,
									startColumn: C.start + 1,
									endLineNumber: 1,
									endColumn: C.end + 1,
								}))
							: [];
					return {
						preview: { text: M.preview, matches: PreviewMatches },
						ranges: Ranges,
					};
				}),
			};
		};

		const Provider = {
			getAIName: async () => undefined,
			textSearch: async (
				Query: any,
				OnProgress?: (Item: unknown) => void,
				_Token?: unknown,
			) => {
				const Pattern = String(Query?.contentPattern?.pattern ?? "");
				invoke("RenderDevLog", {
					Tag: "search",
					Message: `[SkyBridge] textSearch invoked pattern="${Pattern}" folders=${Query?.folderQueries?.length ?? 0}`,
					tag: "search",
					message: `[SkyBridge] textSearch invoked pattern="${Pattern}" folders=${Query?.folderQueries?.length ?? 0}`,
				}).catch(() => {});
				if (!Pattern) {
					return { results: [], messages: [], limitHit: false };
				}
				const IsRegex = Boolean(Query?.contentPattern?.isRegExp);
				const IsCaseSensitive = Boolean(
					Query?.contentPattern?.isCaseSensitive,
				);
				const IsWordMatch = Boolean(Query?.contentPattern?.isWordMatch);
				const Include =
					Object.keys(Query?.includePattern ?? {})[0] ?? "**";
				const Exclude =
					Object.keys(Query?.excludePattern ?? {})[0] ?? "";
				const MaxResults = Number(Query?.maxResults ?? 1000);
				try {
					const Raw = (await invoke("MountainIPCInvoke", {
						method: "search:findInFiles",
						params: [
							Pattern,
							IsRegex,
							IsCaseSensitive,
							IsWordMatch,
							Include,
							Exclude,
							MaxResults,
						],
					})) as any[];
					const Results: any[] = [];
					for (const Hit of Raw ?? []) {
						const Match = MatchFromHit(Hit);
						OnProgress?.(Match);
						Results.push(Match);
					}
					return {
						results: Results,
						messages: [],
						limitHit: Results.length >= MaxResults,
					};
				} catch (Error) {
					console.warn("[SkyBridge] textSearch failed", Error);
					return { results: [], messages: [], limitHit: false };
				}
			},
			fileSearch: async (Query: any, _Token?: unknown) => {
				// IFileQuery.filePattern is the user's typed filename
				// fragment (e.g. "set" matches "settings.ts"). Mountain's
				// `search:findFiles` takes a glob, so wrap the fragment
				// as `**/<pattern>*` to get prefix-substring matching -
				// a close approximation to VS Code's fuzzy file matcher.
				const Raw = String(Query?.filePattern ?? "").trim();
				const FolderRoot = FolderFromQuery(Query);
				const Glob = Raw
					? `**/*${Raw}*`
					: (Object.keys(Query?.includePattern ?? {})[0] ?? "**");
				const MaxResults = Number(Query?.maxResults ?? 500);
				invoke("RenderDevLog", {
					Tag: "search",
					Message: `[SkyBridge] fileSearch invoked pattern="${Raw}" glob="${Glob}" max=${MaxResults}`,
					tag: "search",
					message: `[SkyBridge] fileSearch invoked pattern="${Raw}" glob="${Glob}" max=${MaxResults}`,
				}).catch(() => {});
				try {
					// Positional contract for `search:findFiles` (see
					// `Mountain/Source/IPC/WindServiceHandlers/Search.rs::handle_search_find_files`):
					//   [include, exclude?, max?, useIgnore?, followSymlinks?]
					// `null` for exclude is required - dropping it shifts
					// `MaxResults` into the exclude slot which the
					// glob-extractor then ignores, leaving max defaulted
					// to 10000 instead of the requested cap.
					const Files = (await invoke("MountainIPCInvoke", {
						method: "search:findFiles",
						params: [Glob, null, MaxResults],
					})) as string[];
					const Results = (Files ?? []).map((Uri) => ({
						resource: MakeFileUri(
							String(Uri).replace(/^file:\/\//, ""),
						),
					}));
					// Suppress unused warning - FolderRoot would be used
					// by a multi-folder fan-out that we don't need yet.
					void FolderRoot;
					return {
						results: Results,
						messages: [],
						limitHit: Results.length >= MaxResults,
					};
				} catch (Error) {
					console.warn("[SkyBridge] fileSearch failed", Error);
					return { results: [], messages: [], limitHit: false };
				}
			},
			clearCache: async (_Key: string) => undefined,
		};

		try {
			Services.Search.registerSearchResultProvider("file", 0, Provider); // file
			Services.Search.registerSearchResultProvider("file", 1, Provider); // text
			invoke("RenderDevLog", {
				Tag: "search",
				Message:
					"[SkyBridge] search provider registered (file scheme, types 0+1)",
				tag: "search",
				message:
					"[SkyBridge] search provider registered (file scheme, types 0+1)",
			}).catch(() => {});
			return true;
		} catch (Error) {
			invoke("RenderDevLog", {
				Tag: "search",
				Message: `[SkyBridge] registerSearchResultProvider threw: ${String(Error)}`,
				tag: "search",
				message: `[SkyBridge] registerSearchResultProvider threw: ${String(Error)}`,
			}).catch(() => {});
			return false;
		}
	};

	if (!RegisterLandSearchProvider()) {
		invoke("RenderDevLog", {
			Tag: "search",
			Message:
				"[SkyBridge] search provider register-immediate failed; arming retry chain",
			tag: "search",
			message:
				"[SkyBridge] search provider register-immediate failed; arming retry chain",
		}).catch(() => {});

		// Three rescue paths run in parallel, whichever wins first
		// removes the others:
		//
		// 1. Event listeners for `cel:workbench-ready` (web profile) and
		//    `cel:services-ready` (both profiles). These may have fired
		//    BEFORE SkyBridge mounted (the workbench bootstrap can
		//    complete before InstallSkyBridge resolves), in which case
		//    the listener is too late and the schedule below saves us.
		// 2. Exponential-ish polling schedule that re-attempts every
		//    `t` ms until a poll succeeds or the budget runs out.
		//    Bounded to ~10 s total so a genuinely-broken bridge fails
		//    closed instead of polling forever.
		// 3. Manual `cel:request-search-register` event any later code
		//    path can dispatch to force a re-attempt (e.g. when the
		//    search viewlet is first opened).
		let SearchRegistered = false;
		const RetrySchedule: number[] = [
			50, 100, 200, 400, 800, 1000, 1500, 1500, 1500, 1500,
		];
		let RetryStep = 0;
		const TryRegister = (Origin: string): boolean => {
			if (SearchRegistered) return true;
			if (!RegisterLandSearchProvider()) return false;
			SearchRegistered = true;
			window.removeEventListener(
				"cel:workbench-ready",
				EventRetry as EventListener,
			);
			window.removeEventListener(
				"cel:services-ready",
				EventRetry as EventListener,
			);
			invoke("RenderDevLog", {
				Tag: "search",
				Message: `[SkyBridge] search provider registered via ${Origin}`,
				tag: "search",
				message: `[SkyBridge] search provider registered via ${Origin}`,
			}).catch(() => {});
			return true;
		};
		const EventRetry = () => {
			TryRegister("event");
		};
		const PollRetry = () => {
			if (TryRegister("poll")) return;
			if (RetryStep >= RetrySchedule.length) {
				invoke("RenderDevLog", {
					Tag: "search",
					Message:
						"[SkyBridge] search provider register-poll budget exhausted; search will return empty until a manual cel:request-search-register event fires",
					tag: "search",
					message:
						"[SkyBridge] search provider register-poll budget exhausted; search will return empty until a manual cel:request-search-register event fires",
				}).catch(() => {});
				return;
			}
			setTimeout(PollRetry, RetrySchedule[RetryStep++] ?? 1500);
		};
		window.addEventListener(
			"cel:workbench-ready",
			EventRetry as EventListener,
			{ once: true },
		);
		window.addEventListener(
			"cel:services-ready",
			EventRetry as EventListener,
			{ once: true },
		);
		window.addEventListener(
			"cel:request-search-register",
			EventRetry as EventListener,
		);
		setTimeout(PollRetry, RetrySchedule[RetryStep++] ?? 50);
	}

	// ---- SCM bridge (diagnostic only) ----
	// Mountain emits `sky://scm/{register,unregister,updateGroup}` when
	// extensions call `vscode.scm.createSourceControl(...)`, but the stock
	// VS Code workbench's `ISCMService` is populated by its own in-process
	// `MainThreadSCM.$registerSourceControl` path and never sees our
	// events. Until we route Cocoon's SCM traffic into the workbench's
	// service directly, subscribe here so the channels have a consumer
	// and the `sky-emit` DevLog tag stops reporting "0 listeners" drops -
	// the `cel:scm:*` CustomEvents fan out for any Sky-side component
	// that wants to mirror SCM state in its own UI.
	// SCM channels - Mountain emits these from the
	// `RegisterScmProvider` / `RegisterScmResourceGroup` / `UpdateScmGroup`
	// / `UnregisterScmProvider` notification atoms whenever Cocoon
	// forwards an extension's `vscode.scm.*` call. The bridge fans them
	// out as DOM CustomEvents so any Sky-side viewlet that wants to
	// mirror SCM state can subscribe to `cel:scm:*` without depending
	// on Tauri's event listener directly.
	//
	// In addition, when `__CEL_SERVICES__.SCM` is available (i.e. the
	// stock workbench's `ISCMService` was successfully resolved by the
	// `ExposeWorkbenchAccessor` Output transform), we register the
	// provider against the live workbench service so the SCM viewlet
	// renders natively. The shim provider is intentionally minimal:
	// the workbench expects observable-backed fields and emitter-backed
	// events, but populating them with real values right away would
	// require deeper integration with the extension's resource state.
	// A null-safe fallback keeps the bridge stable even when the
	// services facade is missing or the registration throws.
	type CelSCMGroupShim = {
		GroupHandle: string;
		GroupId: string;
		ResourceStates: any[];
		Group: any;
		ChangeEmitter: any;
		ChangeResourcesEmitter: any;
	};
	type CelSCMShim = {
		Provider: any;
		Repository: any;
		ScmHandle: number | undefined;
		Groups: Map<string, CelSCMGroupShim>;
		ResourceGroupsEmitter: any;
	};
	const ScmShimRegistry = new Map<string, CelSCMShim>();
	const ScmShimByHandle = new Map<number, CelSCMShim>();

	// Build a minimal `ISCMResource` from a Cocoon-side resource state
	// payload. Cocoon's `ScmNamespace.ts` passes the raw `resourceStates`
	// array verbatim from the extension's `sourceControl.resourceStates =
	// [...]` setter; entries can be either `vscode.SourceControlResourceState`
	// objects (richer shape with `decorations`/`command`/`contextValue`)
	// or simple `{ resourceUri }` shapes from older extensions. We pull
	// `sourceUri` and stash whatever else is present without requiring it.
	const BuildScmResource = (
		Services: any,
		Group: any,
		Raw: any,
	): any | null => {
		const UriField =
			Raw?.resourceUri ?? Raw?.sourceUri ?? Raw?.uri ?? Raw?.path;
		let SourceUri: any = null;
		if (UriField && typeof UriField === "object") {
			// Cocoon's URI hydration may already have produced a
			// real `URI`-shaped object; if not, reconstruct via
			// `URI.from`. POJOs with `{scheme,path,...}` work via
			// `URI.from`, raw strings via `URI.parse`.
			if (typeof UriField.with === "function") {
				SourceUri = UriField;
			} else if (typeof UriField.scheme === "string") {
				SourceUri = Services.URI.from(UriField);
			} else if (typeof UriField.toString === "function") {
				try {
					SourceUri = Services.URI.parse(UriField.toString());
				} catch {
					SourceUri = null;
				}
			}
		} else if (typeof UriField === "string") {
			try {
				SourceUri = Services.URI.parse(UriField);
			} catch {
				SourceUri = null;
			}
		}
		if (!SourceUri) return null;
		const Decorations = Raw?.decorations ?? {};
		return {
			sourceUri: SourceUri,
			resourceGroup: Group,
			decorations: {
				icon: Decorations.iconPath ?? Decorations.icon,
				iconDark: Decorations.iconDarkPath ?? Decorations.iconDark,
				tooltip: Decorations.tooltip,
				strikeThrough: Decorations.strikeThrough,
				faded: Decorations.faded,
				letter: Decorations.letter,
				color: Decorations.color,
			},
			contextValue: Raw?.contextValue,
			command: Raw?.command,
			multiDiffEditorOriginalUri: Raw?.multiDiffEditorOriginalUri,
			multiDiffEditorModifiedUri: Raw?.multiDiffEditorModifiedUri,
		};
	};

	const TryRegisterScmProvider = (Payload: any): void => {
		const Services: any = (globalThis as any).__CEL_SERVICES__;
		if (!Services || !Services.SCM || !Services.URI || !Services.Emitter)
			return;
		const ScmId: string = String(Payload?.scmId ?? Payload?.id ?? "");
		if (!ScmId) return;
		if (ScmShimRegistry.has(ScmId)) return;
		try {
			const RootUri =
				typeof Payload?.rootUri === "string" &&
				Payload.rootUri.length > 0
					? Services.URI.parse(Payload.rootUri)
					: undefined;

			// Build a real `ITextModel` for the inputBox via
			// `IModelService.createModel`. Workbench's
			// `MainThreadSCMProvider` constructor reads
			// `inputBoxTextModel.uri` and binds editor commands to
			// the model identity, so a `null` placeholder makes
			// `registerSCMProvider` throw. We use a `cel-scm-input:`
			// scheme so we don't collide with the workbench's
			// built-in `SCMInputBoxContentProvider` (registered for
			// `vscode-source-control:` only when `MainThreadSCM`
			// instantiates - which only happens with a live
			// extension-host RPC channel; not the case here).
			let InputModel: any = null;
			if (Services.Models && Services.URI) {
				const InputUri = Services.URI.from({
					scheme: "cel-scm-input",
					path: `/${ScmId}/input`,
				});
				const Existing = Services.Models.getModel
					? Services.Models.getModel(InputUri)
					: null;
				if (Existing) {
					InputModel = Existing;
				} else {
					const LanguageSelection =
						Services.Languages && Services.Languages.createById
							? Services.Languages.createById("scminput")
							: null;
					InputModel = Services.Models.createModel(
						"",
						LanguageSelection,
						InputUri,
					);
				}
			}

			const ChangeEmitter = new Services.Emitter();
			const ResourceGroupsEmitter = new Services.Emitter();
			const ResourcesEmitter = new Services.Emitter();
			// `provider.groups` is a live list backed by our `Groups`
			// map; the workbench's SCM panel iterates it on every
			// `onDidChangeResourceGroups` fire to rebuild the tree.
			// Returning a cached array reference would break the
			// re-render heuristic, so build a fresh array each get.
			const ProviderGroupsList: any[] = [];
			const Provider = {
				id: ScmId,
				providerId: ScmId,
				label: String(Payload?.label ?? ScmId),
				name: String(Payload?.label ?? ScmId),
				rootUri: RootUri,
				get groups() {
					return ProviderGroupsList;
				},
				onDidChange: ChangeEmitter.event,
				onDidChangeResourceGroups: ResourceGroupsEmitter.event,
				onDidChangeResources: ResourcesEmitter.event,
				count: { get: () => 0 } as any,
				commitTemplate: { get: () => "" } as any,
				contextValue: { get: () => undefined } as any,
				artifactProvider: { get: () => undefined } as any,
				historyProvider: { get: () => undefined } as any,
				actionButton: { get: () => undefined } as any,
				statusBarCommands: { get: () => [] } as any,
				inputBoxTextModel: InputModel,
				getOriginalResource: async () => null,
				dispose: () => {
					ChangeEmitter.dispose?.();
					ResourceGroupsEmitter.dispose?.();
					ResourcesEmitter.dispose?.();
					try {
						InputModel?.dispose?.();
					} catch {}
				},
			};
			const Repository = Services.SCM.registerSCMProvider(Provider);
			const ScmHandleNumber: number | undefined =
				typeof Payload?.handle === "number"
					? Payload.handle
					: undefined;
			const Shim: CelSCMShim = {
				Provider,
				Repository,
				ScmHandle: ScmHandleNumber,
				Groups: new Map(),
				ResourceGroupsEmitter,
			};
			ScmShimRegistry.set(ScmId, Shim);
			if (ScmHandleNumber !== undefined) {
				ScmShimByHandle.set(ScmHandleNumber, Shim);
			}
			// Keep `ProviderGroupsList` reachable from the shim so
			// the registerGroup handler can mutate it in place.
			(Shim as any).ProviderGroupsList = ProviderGroupsList;
		} catch (Error) {
			// Workbench rejected the shim provider (e.g. ITextModel
			// could not be created on this profile, or `IModelService`
			// failed to resolve). Silently fall back to the
			// CustomEvent path - any Sky-side component listening on
			// `cel:scm:register` still gets the data. The
			// `LAND_DEV_LOG=cel-scm` gate surfaces the underlying
			// reason without spamming the renderer console on every
			// register.
			try {
				const W = globalThis as any;
				if (W?.process?.env?.LAND_DEV_LOG?.includes?.("cel-scm")) {
					(W.console || console).warn(
						`[Sky:CEL-SCM] registerSCMProvider failed for "${ScmId}": ${
							(Error as { message?: string })?.message ??
							String(Error)
						}`,
					);
				}
			} catch {}
		}
	};

	const TryUnregisterScmProvider = (Payload: any): void => {
		const ScmId: string = String(Payload?.scmId ?? Payload?.id ?? "");
		if (!ScmId) return;
		const Entry = ScmShimRegistry.get(ScmId);
		if (!Entry) return;
		try {
			Entry.Repository?.dispose?.();
			Entry.Provider?.dispose?.();
		} catch {}
		ScmShimRegistry.delete(ScmId);
		if (Entry.ScmHandle !== undefined) {
			ScmShimByHandle.delete(Entry.ScmHandle);
		}
	};

	// Match the wire payload's `scmHandle` (numeric, from
	// `RegisterScmResourceGroup.rs:78`) against our registry. Falls
	// back to a linear scan when the payload only carries `scmId`.
	const ResolveScmShim = (Payload: any): CelSCMShim | null => {
		const Handle = Payload?.scmHandle;
		if (typeof Handle === "number") {
			const ByHandle = ScmShimByHandle.get(Handle);
			if (ByHandle) return ByHandle;
		}
		const ScmId = Payload?.scmId ?? Payload?.providerId;
		if (typeof ScmId === "string") {
			const ById = ScmShimRegistry.get(ScmId);
			if (ById) return ById;
		}
		return null;
	};

	const TryRegisterScmGroup = (Payload: any): void => {
		const Services: any = (globalThis as any).__CEL_SERVICES__;
		if (!Services || !Services.Emitter || !Services.URI) return;
		const Shim = ResolveScmShim(Payload);
		if (!Shim) return;
		const GroupHandle: string = String(Payload?.groupHandle ?? "");
		const GroupId: string = String(Payload?.groupId ?? "");
		if (!GroupHandle || !GroupId) return;
		if (Shim.Groups.has(GroupHandle)) return;
		try {
			const ChangeEmitter = new Services.Emitter();
			const ChangeResourcesEmitter = new Services.Emitter();
			const Group: any = {
				id: GroupId,
				label: String(Payload?.label ?? GroupId),
				resources: [] as any[],
				features: { hideWhenEmpty: false },
				contextValue: undefined,
				hideWhenEmpty: false,
				multiDiffEditorEnableViewChanges: false,
				onDidChange: ChangeEmitter.event,
				onDidChangeResources: ChangeResourcesEmitter.event,
				get provider() {
					return Shim.Provider;
				},
				// `resourceTree` is consulted by the workbench's
				// hierarchical view mode (and by some flat-mode code
				// paths that pre-build the tree even when not
				// rendering it). Lazy-build a real `ResourceTree`
				// instance from the workbench's exposed class so the
				// panel can render either hierarchical or flat
				// without throwing. Cache per-group so repeat reads
				// don't rebuild on every tick.
				_resourceTree: null as any,
				get resourceTree() {
					const Self: any = this;
					if (Self._resourceTree) return Self._resourceTree;
					const Svc: any =
						(globalThis as any).__CEL_SERVICES__ ?? Services;
					const ResourceTreeCtor = Svc?.ResourceTree;
					const ExtUri =
						Svc?.UriIdentity?.extUri ??
						(Svc?.URI ? { isEqual: () => false } : null);
					const TreeRoot =
						(Shim.Provider?.rootUri as any) ||
						(Svc?.URI?.file ? Svc.URI.file("/") : null);
					if (!ResourceTreeCtor || !TreeRoot) return null;
					try {
						Self._resourceTree = new ResourceTreeCtor(
							Self,
							TreeRoot,
							ExtUri,
						);
						for (const Resource of Self.resources) {
							try {
								Self._resourceTree.add(
									Resource.sourceUri,
									Resource,
								);
							} catch {
								// One bad resource shouldn't take down
								// the whole tree.
							}
						}
						return Self._resourceTree;
					} catch {
						return null;
					}
				},
				splice: (
					Start: number,
					DeleteCount: number,
					ToInsert: any[],
				) => {
					(Group.resources as any[]).splice(
						Start,
						DeleteCount,
						...ToInsert,
					);
					// Invalidate tree cache so next read rebuilds it
					// against the updated `resources` array.
					(Group as any)._resourceTree = null;
					ChangeResourcesEmitter.fire();
				},
			};
			const GroupShim: CelSCMGroupShim = {
				GroupHandle,
				GroupId,
				ResourceStates: [],
				Group,
				ChangeEmitter,
				ChangeResourcesEmitter,
			};
			Shim.Groups.set(GroupHandle, GroupShim);
			(Shim as any).ProviderGroupsList.push(Group);
			Shim.ResourceGroupsEmitter.fire();
		} catch (Error) {
			try {
				const W = globalThis as any;
				if (W?.process?.env?.LAND_DEV_LOG?.includes?.("cel-scm")) {
					(W.console || console).warn(
						`[Sky:CEL-SCM] registerGroup failed for "${GroupId}": ${
							(Error as { message?: string })?.message ??
							String(Error)
						}`,
					);
				}
			} catch {}
		}
	};

	const TryUpdateScmGroup = (Payload: any): void => {
		const Services: any = (globalThis as any).__CEL_SERVICES__;
		if (!Services || !Services.URI) return;
		const Shim = ResolveScmShim(Payload);
		if (!Shim) return;
		const GroupHandle: string = String(Payload?.groupHandle ?? "");
		const GroupId: string = String(Payload?.groupId ?? "");
		// Mountain emits both `groupHandle` (canonical) and `groupId`
		// (split form). Prefer handle lookup; fall back to id-scan.
		let Group: CelSCMGroupShim | undefined =
			GroupHandle && Shim.Groups.get(GroupHandle);
		if (!Group && GroupId) {
			for (const Candidate of Shim.Groups.values()) {
				if (Candidate.GroupId === GroupId) {
					Group = Candidate;
					break;
				}
			}
		}
		if (!Group) return;
		const RawStates = Array.isArray(Payload?.resourceStates)
			? Payload.resourceStates
			: [];
		const Resources = RawStates.map((Raw: any) =>
			BuildScmResource(Services, Group!.Group, Raw),
		).filter((R: any): R is any => R !== null);
		// `splice` updates the live array + fires the panel's
		// re-render hook in one go. Replacing the contents in
		// place preserves array identity for any cached refs.
		Group.Group.splice(0, Group.Group.resources.length, Resources);
		Group.ResourceStates = RawStates;
	};

	await Register("sky://scm/register", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:register", { detail: Payload }),
		);
		TryRegisterScmProvider(Payload);
	});
	await Register("sky://scm/registerGroup", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:registerGroup", { detail: Payload }),
		);
		TryRegisterScmGroup(Payload);
	});
	await Register("sky://scm/unregister", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:unregister", { detail: Payload }),
		);
		TryUnregisterScmProvider(Payload);
	});
	await Register("sky://scm/updateGroup", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:scm:updateGroup", { detail: Payload }),
		);
		TryUpdateScmGroup(Payload);
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
	await Register("sky://terminal/create", ({ id, name, pid }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:terminal:create", {
				detail: { id, name, pid },
			}),
		);
	});

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
	await Register("sky://notification/progress-update", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:notification:progress-update", {
				detail: Payload,
			}),
		);
	});
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

	// ---- Status bar messages ----
	// `vscode.window.setStatusBarMessage(text, timeout?)` is the ephemeral
	// text-left-side API, separate from the StatusBarItem lifecycle handled
	// above. Mountain emits `sky://statusbar/set-message` via
	// `StatusBarMessage.rs`. We fan it out as a DOM CustomEvent for
	// Sky-side observers - the workbench's own MainThreadStatusBar
	// already paints ephemeral messages through its own path when
	// extensions call `$setStatusBarMessage`, so we don't dual-route.
	await Register("sky://statusbar/set-message", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:statusbar:set-message", { detail: Payload }),
		);
	});

	// ---- Languages ----
	// `vscode.languages.setTextDocumentLanguage(doc, languageId)` flows
	// through Mountain's `languages.setDocumentLanguage` notification.
	await Register("sky://languages/setDocumentLanguage", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:languages:setDocumentLanguage", {
				detail: Payload,
			}),
		);
	});
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
		SkyEvent.TreeViewRefresh,
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
			const DomEvent = ChannelToDomEvent(Channel);
			document.dispatchEvent(
				new CustomEvent(DomEvent, { detail: Payload }),
			);
			// `cel-dispatch` tag: surfaces whether this CustomEvent has
			// any consumer registered. Orphans (consumer-present=false)
			// are F1.1 indicators - Mountain's emit reaches the DOM
			// but nothing in the workbench listens, so the event
			// effectively vanishes.
			_CelDispatchLog(DomEvent, _CelConsumers.has(DomEvent));
		});
	}

	// ---- Tree-view data bridge ----
	// Two-way wire so extension-registered tree views actually render:
	//
	//  1. **Native data provider attach**: workbench renders a tree view
	//     only when `treeView.dataProvider` is non-undefined. Stock VS
	//     Code sets this in `MainThreadTreeViews.$registerTreeViewDataProvider`
	//     via the ExtHostContext RPC - we don't have that channel yet
	//     (Track A bring-up from the coverage matrix), so we attach a
	//     data provider here that calls `tree:getChildren` via
	//     `MountainIPCInvoke`. `__CEL_SERVICES__.TreeViewByViewId(id)` is
	//     exposed by the Output transform plugin - it returns the same
	//     `ITreeView` the stock mainThread accesses via
	//     `Registry.as(ViewsRegistry).getView(id).treeView`.
	//
	//  2. **CustomEvent fan-out** (existing): the `cel:tree-view:items`
	//     DOM event stays so any Sky/Astro observer (side-panel mirror,
	//     diagnostic inspector) can react without going through the
	//     workbench tree rendering pipeline.
	//
	// If the view is registered BEFORE the tree descriptor is mounted,
	// `TreeViewByViewId` returns null - retry on microtask + rAF (covers
	// both async workbench init and the pane-is-collapsed-so-not-yet-mounted
	// case). After 5 retries spaced 150 ms apart we give up and rely on
	// whatever `$refresh` the extension issues next to re-trigger us.
	if (typeof document !== "undefined") {
		// Map Cocoon's `{handle, label: string, isCollapsed, icon: string}`
		// wire shape (from `RequestRoutingHandler.$provideTreeChildren`)
		// into the workbench's `ITreeItem` shape. The fields the tree
		// renderer actually reads are `handle`, `collapsibleState`, and
		// `label: { label: string }`. Icons can be promoted to `iconPath`
		// once Mountain starts returning URI components - keep the
		// field name `icon` exposed on the extended shape so side-panel
		// observers can still use it.
		const ToTreeItem = (
			Raw: unknown,
			Fallback: { ViewId: string; ParentHandle: string; Index: number },
		) => {
			const Wire = (Raw ?? {}) as Record<string, unknown>;
			const Handle =
				typeof Wire.handle === "string" && Wire.handle.length > 0
					? Wire.handle
					: `${Fallback.ViewId}/${Fallback.ParentHandle || "root"}/${Fallback.Index}`;
			const Label =
				typeof Wire.label === "string"
					? { label: Wire.label }
					: (Wire.label as { label?: string } | undefined)?.label
						? (Wire.label as { label: string })
						: { label: "" };
			const CollapsibleState =
				Wire.isCollapsed === true
					? 1
					: typeof Wire.collapsibleState === "number"
						? Wire.collapsibleState
						: 0;
			// Pass through the full set of fields Cocoon's wire DTO
			// carries. Any field the workbench tree renderer doesn't
			// read is ignored silently; keeping them lets side-panel
			// mirrors (diagnostic inspectors, test harnesses) see the
			// same content the built-in tree does.
			const Description =
				typeof Wire.description === "string"
					? Wire.description
					: undefined;
			const Tooltip =
				typeof Wire.tooltip === "string" ? Wire.tooltip : undefined;
			const ContextValue =
				typeof Wire.contextValue === "string"
					? Wire.contextValue
					: undefined;
			return {
				handle: Handle,
				collapsibleState: CollapsibleState,
				label: Label,
				icon:
					typeof Wire.icon === "string" && Wire.icon.length > 0
						? Wire.icon
						: undefined,
				description: Description,
				tooltip: Tooltip,
				resourceUri: Wire.resourceUri,
				contextValue: ContextValue,
				command: Wire.command,
				accessibilityInformation: Wire.accessibilityInformation,
			};
		};
		const ProvideChildren = async (
			ViewId: string,
			Element?: { handle?: string },
		): Promise<unknown[]> => {
			try {
				const Response = (await invoke("MountainIPCInvoke", {
					method: "tree:getChildren",
					params: [
						{
							viewId: ViewId,
							treeItemHandle: Element?.handle ?? "",
						},
					],
				})) as { items?: unknown[] };
				const RawItems = Array.isArray(Response?.items)
					? Response.items
					: [];
				const ParentHandle = Element?.handle ?? "";
				const Items = RawItems.map((Raw, Index) =>
					ToTreeItem(Raw, {
						ViewId,
						ParentHandle,
						Index,
					}),
				);
				// Dual-emit: DOM CustomEvent for Sky-side observers
				// (same shape as the workbench tree renderer sees so
				// mirror panels don't need a second conversion).
				document.dispatchEvent(
					new CustomEvent("cel:tree-view:items", {
						detail: {
							viewId: ViewId,
							parent: ParentHandle,
							items: Items,
						},
					}),
				);
				return Items;
			} catch (Error) {
				invoke("RenderDevLog", {
					Tag: "tree-view",
					Message: `[TreeView] bridge-error view=${ViewId} err=${String(Error)}`,
					tag: "tree-view",
					message: `[TreeView] bridge-error view=${ViewId} err=${String(Error)}`,
				}).catch(() => {});
				return [];
			}
		};
		// Pending attaches: views whose extension contributes the
		// `viewsRegistry` registration AFTER our `cel:tree-view:create`
		// event fires (gitlens, clangd, dependencies all hit this -
		// their views activate ~3-5 s into boot, well after the original
		// 750 ms retry window expired). Each attempt-attach call adds to
		// this set on miss and removes on success; whenever ANY view
		// successfully attaches, we replay the pending set (the
		// workbench tree-views service is now wired - other pending
		// views likely just have to be looked up).
		const PendingAttaches = new Set<string>();

		const RetryPendingAttaches = (): void => {
			if (PendingAttaches.size === 0) return;
			const Services = GetServices();
			if (!Services?.TreeViewByViewId) return;
			for (const ViewId of [...PendingAttaches]) {
				const TreeView = Services.TreeViewByViewId(ViewId);
				if (TreeView) {
					PendingAttaches.delete(ViewId);
					AttachToDescriptor(ViewId, TreeView);
				}
			}
		};

		const AttachToDescriptor = (
			ViewId: string,
			TreeView: NonNullable<
				ReturnType<NonNullable<CelServices["TreeViewByViewId"]>>
			>,
		): void => {
			if (TreeView.dataProvider) {
				// Already wired (e.g. by a prior register for the same id
				// during a reload). Keep the existing provider to respect
				// any extension that registered their own.
				return;
			}
			TreeView.dataProvider = {
				async getChildren(Element?: { handle?: string }) {
					const Items = await ProvideChildren(ViewId, Element);
					return Items as any[];
				},
			};
			invoke("RenderDevLog", {
				Tag: "tree-view",
				Message: `[TreeView] attach-ok view=${ViewId}`,
				tag: "tree-view",
				message: `[TreeView] attach-ok view=${ViewId}`,
			}).catch(() => {});
			// First successful attach can mean the workbench bridge has
			// finally wired up its `TreeViewByViewId` map. Sweep any
			// pending attachers - cheap (~one HashMap lookup each) and
			// rescues the views whose retry budget hadn't quite expired.
			RetryPendingAttaches();
		};

		// Exponential-ish backoff with a generous total budget. Stock
		// VS Code's view contributions register within ~3 s of extension
		// activation; gitlens / clangd / heavy extensions stretch that
		// to ~5 s. Total budget here is ~10 s across 12 retries; the
		// last ~half are 1 s apart so we don't keep firing setTimeouts
		// indefinitely. After budget exhaustion we register in
		// `PendingAttaches` so any later successful attach can sweep
		// the still-missing entries.
		const AttachBackoffSchedule: number[] = [
			100, 200, 400, 600, 800, 1000, 1000, 1000, 1500, 1500, 1500, 1500,
		];

		const AttachDataProvider = (ViewId: string, Step: number): void => {
			const Services = GetServices();
			const GetTreeView = Services?.TreeViewByViewId;
			const TreeView =
				typeof GetTreeView === "function" ? GetTreeView(ViewId) : null;
			if (!TreeView) {
				if (Step >= AttachBackoffSchedule.length) {
					PendingAttaches.add(ViewId);
					invoke("RenderDevLog", {
						Tag: "tree-view",
						Message: `[TreeView] attach-pending view=${ViewId} (queued for late workbench wiring)`,
						tag: "tree-view",
						message: `[TreeView] attach-pending view=${ViewId} (queued for late workbench wiring)`,
					}).catch(() => {});
					return;
				}
				setTimeout(
					() => AttachDataProvider(ViewId, Step + 1),
					AttachBackoffSchedule[Step] ?? 1500,
				);
				return;
			}
			AttachToDescriptor(ViewId, TreeView);
		};
		document.addEventListener("cel:tree-view:create", (Event: Event) => {
			const Detail = (Event as CustomEvent).detail as
				| { viewId?: string; extensionId?: string }
				| undefined;
			const ViewId = Detail?.viewId ?? "";
			if (!ViewId) return;
			AttachDataProvider(ViewId, 0);
			// Prime the DOM fan-out with the initial children too so
			// side-panel shims that mirror tree state don't need to wait
			// for a user-triggered expand.
			void ProvideChildren(ViewId, undefined);
		});

		// `cel:tree-view:refresh` - extension called `treeView.refresh()` or
		// fired `onDidChangeTreeData`. Workbench re-queries `getChildren`
		// via the provider we attached above when we call `treeView.refresh()`.
		document.addEventListener("cel:tree-view:refresh", (Event: Event) => {
			const Detail = (Event as CustomEvent).detail as
				| { viewId?: string }
				| undefined;
			const ViewId = Detail?.viewId ?? "";
			if (!ViewId) return;
			const Services = GetServices();
			const TreeView = Services?.TreeViewByViewId?.(ViewId);
			if (TreeView?.refresh) {
				TreeView.refresh().catch(() => {});
			}
			// Also re-prime the Sky observers.
			void ProvideChildren(ViewId, undefined);
		});

		// `cel:tree-view:dispose` - extension disposed its tree data
		// provider. Clear the native pane's dataProvider so the workbench
		// falls back to the empty-state message. The pane stays registered
		// (ViewsRegistry keeps it) - dispose only detaches the provider.
		document.addEventListener("cel:tree-view:dispose", (Event: Event) => {
			const Detail = (Event as CustomEvent).detail as
				| { viewId?: string; handle?: string | number }
				| undefined;
			const ViewId = Detail?.viewId ?? "";
			if (!ViewId) return;
			const Services = GetServices();
			const TreeView = Services?.TreeViewByViewId?.(ViewId);
			if (TreeView && TreeView.dataProvider !== undefined) {
				TreeView.dataProvider = undefined;
			}
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

	// ---- Debug session lifecycle ----
	// Mountain's `DebugProvider::StartDebugging` / `StopDebugging` mirror
	// each session-state transition over these channels so the debug
	// toolbar, call-stack panel, and breakpoints view can react without
	// waiting on the typed `__CEL_SERVICES__.Debug` snapshot to refresh.
	// The forwarded payload matches the `vscode.DebugSession`-shaped
	// dictionary the renderer expects ({ sessionId, type, configuration }).
	await Register("sky://debug/sessionStart", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:sessionStart", { detail: Payload }),
		);
	});
	await Register("sky://debug/sessionEnd", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:sessionEnd", { detail: Payload }),
		);
	});
	// `addBreakpoints` / `removeBreakpoints` / `consoleAppend` arrive on
	// `sky://debug/<suffix>` because `DebugLifecycle.rs` strips the
	// `debug.` prefix from the Cocoon notification method.
	await Register("sky://debug/addBreakpoints", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:addBreakpoints", { detail: Payload }),
		);
	});
	await Register("sky://debug/removeBreakpoints", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:removeBreakpoints", { detail: Payload }),
		);
	});
	await Register("sky://debug/consoleAppend", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:consoleAppend", { detail: Payload }),
		);
	});

	// Forward parsed DAP frames from the spawned debug-adapter's stdout
	// (Mountain `Environment/DebugProvider.rs::StartDebugging` stdout-reader
	// task) into a `cel:debug:dap-message` DOM event. The workbench's
	// `RawDebugSession` correlates responses by `request_seq`; routing the
	// raw `{ sessionId, message }` shape here lets a future RawDebugSession
	// shim subscribe and forward without re-implementing DAP framing.
	await Register("sky://debug/dap-message", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:dap-message", { detail: Payload }),
		);
	});

	// Custom editor save lifecycle: Mountain emits `sky://customEditor/saved`
	// after `OnSaveCustomDocument` reverse-RPC succeeds. Workbench's dirty-
	// indicator already updates from the `IFileService.writeFile` flow the
	// extension drives, but observers (gitlens diff overlays, change-tracking
	// surfaces) listen on `cel:customEditor:saved` for the explicit
	// "extension save callback completed" signal.
	await Register("sky://customEditor/saved", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:customEditor:saved", { detail: Payload }),
		);
	});

	// ---- Webview extensions ----
	// Extension-initiated webview content updates. The canonical channel
	// is the kebab-case `sky://webview/set-html` (see `SkyEvent.ts` for
	// the single source of truth). The earlier camelCase fan-out over
	// `setTitle`/`setIconPath`/`setHtml` had no matching Mountain emitter
	// for the first two and the third is now covered by the main bulk
	// loop via `SkyEvent.WebviewSetHTML`.
	//
	// Webview-view html-bridge: when a Cocoon-side
	// `resolveWebviewView` callback sets `view.webview.html = X`,
	// `WindowNamespace.ts:WebviewViewBuilders` fires
	// `webview.setHtml` notification with `{handle, viewId, html}`.
	// Mountain's `WebviewLifecycle.rs` re-emits as `sky://webview/set-html`.
	// Look up the parked workbench `WebviewView` (pinned by
	// `sky://webview/registerView` listener at registration time) by
	// viewId and apply the html to its real `webview.html` setter so
	// the panel paints. Falls back to `cel:webview:set-html` DOM event
	// for any Sky-side observer that wants the raw payload.
	await Register("sky://webview/set-html", (Payload: any) => {
		const ViewId: string = String(Payload?.viewId ?? "");
		const Html: string = String(Payload?.html ?? "");
		document.dispatchEvent(
			new CustomEvent("cel:webview:set-html", { detail: Payload }),
		);
		if (!ViewId) return;
		const Registry: Map<string, any> | undefined =
			(globalThis as any).__CEL_WEBVIEW_VIEWS__;
		const ParkedView = Registry?.get(ViewId);
		if (!ParkedView?.webview) return;
		try {
			ParkedView.webview.html = Html;
		} catch (_e) {
			/* swallow - workbench WebviewView may have been disposed
			   between resolveWebviewView completion and this callback */
		}
	});

	// Webview-view post-message bridge: Cocoon `view.webview.postMessage(msg)`
	// fires `webview.postMessage` notification with `{handle, viewId,
	// message}`. The general `sky://webview/post-message` listener
	// (registered above for raw extension postMessage) dispatches a
	// `cel:webview:post-message` DOM event regardless. Forward into
	// the parked workbench view's webview when a viewId match exists.
	await Register("sky://webview/postMessage", (Payload: any) => {
		const ViewId: string = String(Payload?.viewId ?? "");
		const Message = Payload?.message;
		document.dispatchEvent(
			new CustomEvent("cel:webview:post-message", {
				detail: { ...Payload, viewId: ViewId, message: Message },
			}),
		);
		if (!ViewId) return;
		const Registry: Map<string, any> | undefined =
			(globalThis as any).__CEL_WEBVIEW_VIEWS__;
		const ParkedView = Registry?.get(ViewId);
		if (!ParkedView?.webview?.postMessage) return;
		try {
			ParkedView.webview.postMessage(Message);
		} catch (_e) {
			/* swallow */
		}
	});

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
	// `sky://webview/message` carries the workbench-RPC shape
	// `{ panelId, method, params }` (Mountain `RPC/CocoonService/mod.rs`
	// `webview.postMessage` arm). The raw extension `postMessage` path
	// (gRPC `OnDidReceiveMessage` + `PostWebviewMessage`) emits the
	// `{ handle, message }` shape on `sky://webview/post-message`.
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

	await Register(
		"sky://webview/post-message",
		({ handle, message }: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:webview:post-message", {
					detail: { handle, message },
				}),
			);
		},
	);

	await Register("sky://webview/dispose", ({ panelId }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:dispose", { detail: { panelId } }),
		);
	});

	// ---- Webview views (sidebar/panel webview content) ----
	// `vscode.window.registerWebviewViewProvider(viewId, provider)` from
	// an extension flows: Cocoon `WindowNamespace.ts:883` issues
	// `webview.registerView` RPC → Mountain
	// `Track/Effect/CreateEffectForRequest/Webview.rs:24` matches the
	// method, emits `sky://webview/registerView` with payload
	// `{ method, handle, args: [Handle, ViewId] }`. Without a Sky
	// listener the registration is invisible to the workbench's
	// `IWebviewViewService` registry, so when the user clicks an
	// extension's activity-bar icon the panel sits empty - the
	// resolver chain never fires. Register a workbench resolver here
	// that, when the workbench calls `resolve(webview, ct)`, posts a
	// `webview.resolveView` reverse-RPC back through Cocoon's
	// `RequestRoutingHandler.ts:294` which fans out to
	// `Provider.resolveWebviewView(view, ctx)` and the extension
	// populates `view.webview.html`.
	const WebviewViewResolvers = new Map<string, number>();
	await Register("sky://webview/registerView", (Payload: any) => {
		const Args = Array.isArray(Payload?.args) ? Payload.args : [];
		const Handle = Args[0] ?? Payload?.handle;
		const ViewId: string = String(Args[1] ?? Payload?.viewId ?? "");
		if (!ViewId) return;
		WebviewViewResolvers.set(ViewId, Number(Handle));
		document.dispatchEvent(
			new CustomEvent("cel:webview:registerView", {
				detail: { handle: Handle, viewId: ViewId, payload: Payload },
			}),
		);
		try {
			const Services: any = (globalThis as any).__CEL_SERVICES__;
			if (!Services?.WebviewViews?.register) return;
			Services.WebviewViews.register(ViewId, {
				resolve: async (WebviewView: any, _Cancellation: any) => {
					// Bridge the workbench-supplied WebviewView into a
					// Cocoon-visible reference. The extension's
					// `resolveWebviewView(view, ctx)` callback runs in
					// Cocoon and sets `view.webview.html = '<html>'`,
					// `view.webview.postMessage(msg)`, etc. These calls
					// can't cross the IPC boundary directly because the
					// real `view.webview` is a workbench-internal object.
					// Park the workbench view in a window-scoped registry
					// keyed by viewId; when Cocoon's provider populates
					// `view.webview.html` the webview sends a
					// `webview.setHtml` notification that Mountain
					// forwards to `sky://webview/set-html` - a future
					// listener can match by viewId and apply the html
					// to the parked workbench view.
					try {
						const Registry: Map<string, any> =
							((globalThis as any).__CEL_WEBVIEW_VIEWS__ ??=
								new Map());
						Registry.set(ViewId, WebviewView);
					} catch (_e) {
						/* ignore */
					}
					// Trigger the Cocoon provider's resolveWebviewView
					// callback by dispatching a `webview.resolveView`
					// request via Mountain → Cocoon. Failure logs to
					// dev-log but doesn't surface - the workbench's
					// resolver promise must still resolve so the panel
					// pane unblocks.
					try {
						const Invoke =
							(globalThis as any).__TAURI__?.core?.invoke ??
							(globalThis as any).__TAURI__?.invoke;
						if (typeof Invoke === "function") {
							await Invoke("MountainIPCInvoke", {
								method: "cocoon:request",
								params: [
									"webview.resolveView",
									{ handle: Handle, viewId: ViewId },
								],
							}).catch(() => null);
						}
					} catch (_e) {
						/* swallow */
					}
				},
			});
		} catch (_e) {
			/* swallow - workbench DI not yet resolved */
		}
	});

	await Register("sky://webview/unregisterView", (Payload: any) => {
		const Args = Array.isArray(Payload?.args) ? Payload.args : [];
		const Handle = Args[0] ?? Payload?.handle;
		const ViewId: string = String(Args[1] ?? Payload?.viewId ?? "");
		if (ViewId) WebviewViewResolvers.delete(ViewId);
		document.dispatchEvent(
			new CustomEvent("cel:webview:unregisterView", {
				detail: { handle: Handle, viewId: ViewId, payload: Payload },
			}),
		);
	});

	// ---- Custom editors ----
	// Mountain emits `sky://webview/registerCustomEditor` with payload
	// `{ method: "webview.registerCustomEditor", handle: <number>,
	//    args: [Handle, ViewType, Options] }` from
	// `Track/Effect/CreateEffectForRequest/Webview.rs:42`. We fan out
	// the CustomEvent for any Sky-side observer, then register the
	// viewType with the workbench's `ICustomEditorService` so the
	// "Open With..." menu surfaces it. The save reverse-RPC
	// (workbench → provider) requires deeper `ICustomEditorModelManager`
	// wiring and is deferred - the registration capability alone is
	// what makes the viewType discoverable in the editor picker.
	const CustomEditorCapabilityHandles = new Map<string, any>();
	await Register("sky://webview/registerCustomEditor", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:registerCustomEditor", {
				detail: Payload,
			}),
		);
		try {
			const Services: any = (globalThis as any).__CEL_SERVICES__;
			if (!Services?.CustomEditor?.registerCustomEditorCapabilities)
				return;
			const Args = Array.isArray(Payload?.args) ? Payload.args : [];
			const ViewType: string = String(Args[1] ?? "");
			const Options =
				typeof Args[2] === "object" && Args[2] !== null
					? (Args[2] as Record<string, unknown>)
					: {};
			if (!ViewType || CustomEditorCapabilityHandles.has(ViewType))
				return;
			const Disposable =
				Services.CustomEditor.registerCustomEditorCapabilities(
					ViewType,
					{
						supportsMultipleEditorsPerDocument: Boolean(
							Options.supportsMultipleEditorsPerDocument,
						),
					},
				);
			CustomEditorCapabilityHandles.set(ViewType, Disposable);
		} catch (Error) {
			try {
				const W = globalThis as any;
				if (
					W?.process?.env?.LAND_DEV_LOG?.includes?.(
						"cel-customeditor",
					)
				) {
					(W.console || console).warn(
						`[Sky:CEL-CustomEditor] registerCapability failed: ${
							(Error as { message?: string })?.message ??
							String(Error)
						}`,
					);
				}
			} catch {}
		}
	});
	await Register("sky://webview/unregisterCustomEditor", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:unregisterCustomEditor", {
				detail: Payload,
			}),
		);
		try {
			const Args = Array.isArray(Payload?.args) ? Payload.args : [];
			// `webview.unregisterCustomEditor` takes only the handle, not
			// the viewType - dispose every capability we registered for
			// this Cocoon process. There's no reverse handle→viewType
			// index because the registration payload doesn't expose the
			// handle in a form we tracked, so dispose-all is the safe
			// fallback when Cocoon shuts down.
			void Args;
			for (const [, Disposable] of CustomEditorCapabilityHandles) {
				try {
					Disposable?.dispose?.();
				} catch {}
			}
			CustomEditorCapabilityHandles.clear();
		} catch {}
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
	await Register("sky://ui/show-message-request", (RawPayload: any) => {
		if (RawPayload?.RequestIdentifier) {
			const Inner = RawPayload.Payload ?? {};
			const Severity = Inner?.Severity ?? Inner?.severity ?? "info";
			const Message = Inner?.Message ?? Inner?.message ?? "";
			const Options = Inner?.Options ?? Inner?.options ?? {};
			const Actions: Array<{ title: string }> = Array.isArray(
				Options?.Actions ?? Options?.actions,
			)
				? (Options?.Actions ?? Options?.actions)
				: [];
			if (Actions.length === 0) {
				ShowNotification(Severity, Message, []);
				void ResolveUiRequest(RawPayload.RequestIdentifier, null);
				return;
			}
			let Picked: string | null = null;
			if (Actions.length === 1) {
				if (window.confirm(`${Message}\n\n(${Actions[0].title})`)) {
					Picked = Actions[0].title;
				}
			} else {
				const Choice = window.prompt(
					`${Message}\n\nChoose: ${Actions.map((A) => A.title).join(
						" / ",
					)}`,
					Actions[0].title,
				);
				if (Choice && Actions.some((A) => A.title === Choice)) {
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
	});

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
				if (Choice && Actions.some((A) => A.title === Choice)) {
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
