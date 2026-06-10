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
import SkyEvent from "@codeeditorland/wind/Target/Element/Wind/Source/IPC/SkyEvent.js";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

// `cel:*` CustomEvent consumer-presence tracking lives in
// `Bridge/CelDispatchTracking.ts`. Module-level placeholder pair so
// the dispatch line at line ~1985 reads unchanged; the install
// function below replaces both with the real bag.
let _CelConsumers: { has: (Type: string) => boolean } = {
	has: () => false,
};

let _CelDispatchLog: (
	DomEvent: string,

	HasConsumer: boolean,
) => void = () => {};

void (async () => {
	const Tracking = (await import("./Bridge/CelDispatchTracking.js")).default(
		invoke,
	);

	_CelConsumers = { has: (T: string) => Tracking.HasConsumer(T) };

	_CelDispatchLog = Tracking.Log;
})();

// ============================================================================
// VS Code workbench accessor
// ============================================================================

/**
 * Retrieves the VS Code `IWorkbench` stored globally by Mountain.astro.
 * Returns null if the workbench has not loaded yet.
 *
 * Defensive: `window` itself can be undefined under SSR / Astro
 * pre-render evaluation; the global access path is wrapped to keep the
 * function safe to call from any module-eval context.
 */
function GetWorkbench(): {
	commands: {
		executeCommand(id: string, ...args: unknown[]): Promise<unknown>;
	};

	env: { openUri(target: unknown): Promise<boolean> };
} | null {
	try {
		if (typeof window === "undefined") return null;

		return (window as any).__CEL_WORKBENCH__ ?? null;
	} catch {
		return null;
	}
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
	// SSR safety: `window` is undefined during Astro's pre-render
	// pass. Returning `null` lets every caller keep its existing
	// `if (!Services) return;` early-return contract.
	try {
		if (typeof window === "undefined") return null;
	} catch {
		return null;
	}

	return (window as any).__CEL_SERVICES__ ?? null;
}

// One-shot diagnostic probe of `__CEL_SERVICES__` shape; implementation
// in `Bridge/ProbeServices.ts`. Wires itself onto `cel:services-ready`
// (or fires immediately if services are already ready). Uses a
// fire-and-forget dynamic import so the probe doesn't block module eval.
void (async () => {
	const Probe = (await import("./Bridge/ProbeServices.js")).default;

	Probe(() => GetServices() as Record<string, unknown> | null);
})();

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
// `BuildOpenArg` lives in `Bridge/BuildOpenArg.ts`. Bridge.ts hydrates
// the helper inside `_InstallSkyBridgeOnce` (it requires
// `__CEL_SERVICES__.URI` which is only populated after the workbench's
// `web.main.js` runs `ExposeAccessor`). The local symbol below is
// installed at install-time so existing call sites read unchanged.
let BuildOpenArg: (Source: unknown) => unknown = (S) => S;

// `OutputChannels` map + `GetOrCreateChannel` live in
// `Bridge/OutputChannels.ts`. Bridge.ts hydrates the helper inside
// `_InstallSkyBridgeOnce`; the local symbols below are install-time
// placeholders so the rest of this file's downstream call sites read
// unchanged.
let OutputChannels = new Map<string, string[]>();

let GetOrCreateChannel: (Id: string, Name?: string) => string[] = (Id) => {
	if (!OutputChannels.has(Id)) OutputChannels.set(Id, []);

	return OutputChannels.get(Id)!;
};

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

// Progress + Notification DOM bridges live in `Bridge/Progress.ts` and
// `Bridge/Notification.ts`. `_InstallSkyBridgeOnce` instantiates the
// factories and binds the three Progress operations + the single
// Notification operation into local symbols so the rest of the install
// reads identically to the pre-extraction shape.

// ============================================================================
// Main bridge initialisation
// ============================================================================

/**
 * Install all `sky://` event listeners. Call this AFTER the VS Code
 * workbench has loaded (so `__CEL_WORKBENCH__` is available).
 *
 * **Reentrancy:** the function is idempotent. Multiple calls (Astro
 * view-transition, Tauri webview reload, dev HMR re-import) only attach
 * the listener set once. Without this guard every double-call doubled
 * the Tauri `listen()` registrations, so each Mountain emit fired every
 * `sky://*` handler N times - rendering the same tree view twice,
 * inserting the same marker twice, painting the same webview twice,
 * etc. That looked exactly like "the workbench is loading twice" /
 * "purple overlays / panels not rendering properly" in the renderer.
 */
let _SkyBridgeInstalled = false;

let _SkyBridgeInstallPromise: Promise<void> | null = null;

/**
 * Master "disable Land customisations" gate. When the build-time env
 * var `Disable=true` is set (PascalCase, single-word - matches Land's
 * env-var convention in `.env.Land.Diagnostics`), `InstallSkyBridge`
 * short-circuits without registering ANY of the ~100 `sky://*` Tauri-
 * event listeners. Useful for bisecting whether a regression lives in
 * our bridges or upstream / Tauri / WKWebView. Flag arrives via
 * Sky's `astro.config.ts` Vite define (`import.meta.env.Disable`).
 *
 * Code is NOT removed - the rest of `SkyBridge.ts` and
 * `_InstallSkyBridgeOnce` still live in the chunk, ready to re-enable
 * with one rebuild after `Disable=` is unset.
 */
const ResolveLandDisabled = (): boolean => {
	try {
		const Meta = (import.meta as { env?: Record<string, unknown> }).env;

		if (Meta) {
			const Flag = Meta["Disable"];

			if (Flag === "true" || Flag === true || Flag === "1") return true;
		}
	} catch {
		/* no-op */
	}

	try {
		if (typeof localStorage !== "undefined") {
			const Stored = localStorage.getItem("Disable");

			if (Stored === "1" || Stored === "true") return true;
		}
	} catch {
		/* no-op */
	}

	return false;
};

export async function InstallSkyBridge(): Promise<void> {
	if (ResolveLandDisabled()) {
		try {
			if (typeof process !== "undefined" && process.stdout) {
				process.stdout.write(
					"[SkyBridge] Disable=true: Land bridges SKIPPED (no sky://* listeners registered, no command/scm/webview handlers wired)\n",
				);
			}
		} catch {
			/* no-op */
		}

		_SkyBridgeInstalled = true;

		return;
	}

	if (_SkyBridgeInstalled) {
		return;
	}

	if (_SkyBridgeInstallPromise) {
		return _SkyBridgeInstallPromise;
	}

	_SkyBridgeInstallPromise = (async () => {
		try {
			await _InstallSkyBridgeOnce();

			_SkyBridgeInstalled = true;
		} finally {
			_SkyBridgeInstallPromise = null;
		}
	})();

	return _SkyBridgeInstallPromise;
}

async function _InstallSkyBridgeOnce(): Promise<void> {
	const Cleanups: Array<() => void> = [];

	// Hydrate the extracted DOM-bridge factories. Both modules return a
	// closure-bound bag (Progress) or a single function (Notification);
	// keep the local symbol names identical to the pre-extraction shape
	// so every downstream call site reads unchanged.
	const Progress = (await import("./Bridge/Progress.js")).default();

	const ShowProgress = Progress.Show;

	const UpdateProgress = Progress.Update;

	const DismissProgress = Progress.Dismiss;

	const ShowNotification = (await import("./Bridge/Notification.js")).default(
		GetWorkbench,
	);

	{
		const Build = (await import("./Bridge/BuildOpenArg.js")).default;

		BuildOpenArg = (Source: unknown) => Build(GetServices, Source);
	}

	{
		const Output = (await import("./Bridge/OutputChannels.js")).default(
			GetWorkbench,
		);

		OutputChannels = Output.Channels;

		GetOrCreateChannel = Output.GetOrCreate;
	}

	// `ApplyHtmlToWebview` is needed by `InstallWebview`. Load it here so
	// the install-time local is available by the time the webview import
	// call runs below. The module also stashes itself on
	// `globalThis.__CEL_WEBVIEW_APPLY_HTML__` so the webview resolve
	// callback (which runs later, inside the workbench) can still find it.
	const ApplyHtmlToWebview = (await import("./Bridge/ApplyHtmlToWebview.js"))
		.default;

	const Register = async (
		Channel: string,

		Handler: (Payload: any) => void,
	) => {
		// Centralized try/catch wrapper: a single bad handler must not
		// crash the Tauri listener loop, which would silently
		// disconnect future events on the same channel. Stock VS
		// Code's Emitter wraps each subscriber's call in a try/catch
		// for the same reason - one buggy listener should never
		// silence its peers.
		const SafeHandler = (Payload: any): void => {
			try {
				Handler(Payload);
			} catch (HandlerError) {
				invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"sky-bridge",
						`handler for ${Channel} threw: ${HandlerError instanceof Error ? HandlerError.message : String(HandlerError)}`,
					],
				}).catch(() => {});
			}
		};

		try {
			const Unlisten = await listen<any>(Channel, (Event) =>
				SafeHandler(Event.payload),
			);

			Cleanups.push(Unlisten);
		} catch (RegisterError) {
			// Tauri's `listen()` can reject if the IPC bridge is torn
			// down mid-install (e.g. window closing during boot). Log
			// and continue - the rest of the bridge install must
			// still complete so other channels work.
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"sky-bridge",
					`failed to register listener for ${Channel}: ${RegisterError instanceof Error ? RegisterError.message : String(RegisterError)}`,
				],
			}).catch(() => {});
		}
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
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"sky-bridge",
					`ResolveUIRequest failed reqId=${RequestIdentifier} err=${Error instanceof globalThis.Error ? Error.message : String(Error)}`,
				],
			}).catch(() => {});
		});

	// Editor + Output bridges - implementation in
	// `Bridge/InstallEditorAndOutput.ts`. Covers the close-window
	// short-circuit, file-open / save-all / applyEdit /
	// showTextDocument round-trips, and the five output channel
	// lifecycle channels.
	await (
		await import("./Bridge/InstallEditorAndOutput.js")
	).default({
		Register,
		GetWorkbench,
		Invoke: invoke,
		BuildOpenArg,
		ResolveUiRequest,
		GetOrCreateChannel,
		OutputChannels,
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
	// Statusbar bridge - implementation in `Bridge/InstallStatusbar.ts`.
	// Returns the `SetOrUpdateEntry` helper so the dead-channel
	// `sky://statusbar/create` listener (in
	// `Bridge/InstallDeadChannelListeners.ts`) can route through the
	// same `IStatusbarService.addEntry` path.
	const { SetOrUpdateEntry } = await (
		await import("./Bridge/InstallStatusbar.js")
	).default({ Register, GetServices });

	// Commands bridge - implementation in `Bridge/InstallCommands.ts`.
	await (
		await import("./Bridge/InstallCommands.js")
	).default({
		Register,
		GetServices,
		Invoke: invoke,
		ResolveUiRequest,
	});

	// Tasks, decorations, workspace edits, output-channel lifecycle,
	// webview message/post-message/dispose relays.
	await (
		await import("./Bridge/InstallTasksAndDecorations.js")
	).default({ Register });

	// ---- Search result provider (Land-native) ----
	// Implementation in `Bridge/InstallSearch.ts`. Routes Mountain's
	// `search:findFiles` / `search:findInFiles` IPC handlers into the
	// workbench's `ISearchService` so the Search viewlet shows results.
	await (
		await import("./Bridge/InstallSearch.js")
	).default({ GetServices, Invoke: invoke });

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
	// Implementation in `Bridge/InstallScm.ts`.
	await (await import("./Bridge/InstallScm.js")).default({ Register });

	// Progress + Terminal + Workspaces relays - implementation in
	// `Bridge/InstallProgressTerminalWorkspace.ts`. Most of these are
	// thin DOM-event re-dispatchers keyed by Mountain's emit channel.
	await (
		await import("./Bridge/InstallProgressTerminalWorkspace.js")
	).default({
		Register,
		GetWorkbench,
		ShowProgress,
		UpdateProgress,
		DismissProgress,
	});

	// ---- Notifications ----
	// Cocoon's `vscode.window.show{Information,Warning,Error}Message` routes
	// through Mountain's `Window.ShowMessage` effect which emits this event.
	// Sky re-dispatches it as `cel:notification:show` so any notification UI
	// (toast stack, status bar banner) can subscribe without needing a
	// direct Tauri listener.
	// Notification + Quickpick + Dialog + Lifecycle + StatusBarMessage +
	// Languages relays - implementation in `Bridge/InstallSimpleRelays.ts`.
	// All channels in this group are 1:1 DOM-event re-dispatchers; the
	// workbench's own MainThreadStatusBar already paints ephemeral
	// messages through its native path when extensions call
	// `$setStatusBarMessage`, so we don't dual-route there.
	await (
		await import("./Bridge/InstallSimpleRelays.js")
	).default({
		Register,
	});

	// Generic `sky://*` → `cel:*` fan-out for the long tail of channels
	// that need only a DOM CustomEvent dispatch + consumer-presence
	// log. Implementation in `Bridge/InstallFanOut.ts`. Channel set
	// is sourced from Wind's `SkyEvent` table (single source of truth
	// mirroring Mountain's Rust enum).
	await (
		await import("./Bridge/InstallFanOut.js")
	).default({
		Register,
		Channels: [
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
		],
		Tracking: {
			HasConsumer: (DomEvent) => _CelConsumers.has(DomEvent),
			Log: (DomEvent, HasConsumer) =>
				_CelDispatchLog(DomEvent, HasConsumer),
		},
	});

	// ---- Diagnostics → IMarkerService bridge ----
	// Implementation in `Bridge/InstallDiagnostics.ts`. Translates
	// Mountain's `sky://diagnostics/changed` payload into
	// `IMarkerService.changeOne` calls so the editor paints squiggles
	// and the Problems panel is populated.
	await (
		await import("./Bridge/InstallDiagnostics.js")
	).default({ Register, GetServices, Invoke: invoke });

	// ---- Tree-view data bridge ----
	// Implementation in `Bridge/InstallTreeView.ts`. Attaches a
	// `ITreeView.dataProvider` that calls `tree:getChildren` via
	// `MountainIPCInvoke`, so extension-registered tree views render
	// in the workbench's native panel. Also wires `cel:tree-view:*`
	// DOM event listeners for refresh and dispose.
	if (typeof document !== "undefined") {
		await (
			await import("./Bridge/InstallTreeView.js")
		).default({ GetServices, Invoke: invoke });
	}

	// Debug + custom-editor channel relays - implementation in
	// `Bridge/InstallDebug.ts`. All nine channels are pure DOM-event
	// re-dispatchers; the workbench's own IDebugService /
	// ICustomEditorService handle the underlying flows through stock
	// VS Code internals.
	await (
		await import("./Bridge/InstallDebug.js")
	).default({ Register, GetServices });

	// ---- Webview extensions ----
	// Implementation in `Bridge/InstallWebview.ts`. Covers
	// `sky://webview/create`, `sky://webview/set-html`,
	// `sky://webview/updateView`, `sky://webview/postMessage`,
	// `sky://webview/registerView`, `sky://webview/unregisterView`,
	// `sky://webview/registerCustomEditor`,
	// `sky://webview/unregisterCustomEditor`.
	await (
		await import("./Bridge/InstallWebview.js")
	).default({ Register, ApplyHtmlToWebview, Invoke: invoke });

	// ---- Editor operations ----
	// Implementation in `Bridge/InstallEditorOperations.ts`. Covers
	// `sky://decoration/set-ranges`, `sky://editor/apply-text-edits`,
	// active-editor/selection push, and `sky://editor/revealRange`.
	await (
		await import("./Bridge/InstallEditorOperations.js")
	).default({ Register, GetServices, Invoke: invoke });

	// ---- Inline completions (Copilot / Roo ghost text) ----
	// Registers a Land InlineCompletionsProvider with Monaco's
	// ILanguageFeaturesService that forwards requests to Mountain →
	// Cocoon's registered `vscode.languages.registerInlineCompletionItemProvider`
	// providers. B4 (Anchor) wired the Mountain/Cocoon gRPC pipeline;
	// this module wires the Monaco/workbench side.
	void (async () => {
		try {
			await (
				await import("./Bridge/InstallInlineCompletions.js")
			).default({ GetServices, Invoke: invoke });
		} catch {
			/* non-fatal: inline ghost text won't work but boot is unaffected */
		}
	})();

	// ---- Tree view reveal ----
	// Extension calls `treeView.reveal(element)` → Mountain emits this →
	// Sky opens the view and scrolls to the element.
	await Register("sky://tree-view/reveal", (Payload: any) => {
		try {
			const ViewId = Payload?.viewId ?? "";

			if (!ViewId) return;

			const Services = GetServices();

			// Open the view (makes it visible if it's collapsed)
			const ViewsService = (Services as any)?.Views;

			if (ViewsService?.openView) {
				void ViewsService.openView(
					ViewId,

					!!Payload?.options?.focus,
				).catch(() => {});
			}
		} catch {
			/* swallow - non-fatal */
		}
	});

	// ---- Tree view refresh ----
	// Extension fired `_onDidChangeTreeData.fire(element)` to invalidate
	// its tree. Cocoon forwarded this through Mountain → `sky://tree-view/refresh`.
	// We use `TreeViewByViewId` to look up the workbench's `ITreeView` and
	// call its `refresh(element)` method - that triggers a fresh
	// `getChildren()` round-trip back to the extension.
	//
	// Element identity isn't preserved across the IPC boundary, so when
	// the extension fires `.fire(undefined)` (refresh entire tree) we
	// can dispatch directly. For element-specific refreshes Mountain has
	// already serialised the element via TreeItemDTO; we re-issue a full
	// refresh as a graceful fallback when element-by-handle resolution
	// fails (matches upstream MainThreadTreeView behaviour - element
	// resolution is best-effort across the marshalling).
	await Register("sky://tree-view/refresh", (Payload: any) => {
		try {
			const ViewId = Payload?.viewId ?? "";

			if (!ViewId) return;

			const Services = GetServices();

			const ResolveTreeView = (Services as any)?.TreeViewByViewId;

			const TreeView = ResolveTreeView?.(ViewId);

			if (TreeView && typeof TreeView.refresh === "function") {
				try {
					// `ITreeView.refresh(elements?)`: passing undefined
					// refreshes the entire tree. Element-by-element refresh
					// requires cross-process element identity (TreeItemDTO
					// → element), which we don't currently round-trip.
					void TreeView.refresh();
				} catch {
					/* refresh can fail mid-shutdown - swallow */
				}
			}
		} catch {
			/* swallow */
		}
	});

	// ---- Native ----
	await Register("sky://native/openExternal", ({ url }: any) => {
		if (url) window.open(url, "_blank", "noopener,noreferrer");
	});

	// ---- UI dialogs / notifications ----
	// Implementation in `Bridge/InstallUiRequests.ts`. Handles
	// `sky://ui/show-message-request`,
	// `sky://ui/show-input-box-request`,
	// `sky://ui/show-quick-pick-request`,
	// `sky://ui/show-message-with-actions-request`.
	await (
		await import("./Bridge/InstallUiRequests.js")
	).default({ Register, ShowNotification, ResolveUiRequest });

	// Batch 17 dead-channel listeners (tree-view, configuration,
	// extensions, security, statusbar, terminal-pid, debug start +
	// register). Implementation lives in
	// `Bridge/InstallDeadChannelListeners.ts`; passing the install-time
	// `Register` + `SetOrUpdateEntry` closures + the module-level
	// `GetServices` keeps the helper decoupled from Bridge.ts's
	// install-state while still wiring into the same Tauri listener
	// registry.
	await (
		await import("./Bridge/InstallDeadChannelListeners.js")
	).default({
		Register,
		GetServices,
		SetOrUpdateEntry,
	});

	// Cleanup helper (call on Tauri window close)
	(window as any).__CEL_SKY_BRIDGE_CLEANUP__ = () =>
		Cleanups.forEach((F) => F());

	// Always surface via stdout so Mountain captures it under [Cocoon stdout].
	if (typeof process !== "undefined" && process.stdout) {
		process.stdout.write(
			"[SkyBridge] All sky:// event channels registered\n",
		);
	}

	// Replay drain - implementation in `Bridge/ReplayEvents.ts`.
	await (await import("./Bridge/ReplayEvents.js")).default(invoke);
}

export default InstallSkyBridge;
