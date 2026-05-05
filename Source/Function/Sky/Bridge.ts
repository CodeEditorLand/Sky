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
			console.info(
				"[SkyBridge] Disable=true: Land bridges SKIPPED (no sky://* listeners registered, no command/scm/webview handlers wired)",
			);
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
				try {
					console.warn(
						`[SkyBridge] handler for ${Channel} threw:`,
						HandlerError,
					);
				} catch {
					/* console may be replaced */
				}
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
			try {
				console.warn(
					`[SkyBridge] failed to register listener for ${Channel}:`,
					RegisterError,
				);
			} catch {
				/* console may be replaced */
			}
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
			console.warn(
				"[SkyBridge] ResolveUIRequest failed",
				RequestIdentifier,
				Error,
			);
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
					// VS Code's current `ITextSearchMatch` shape (≥1.92):
					//   {
					//     uri?: URI,
					//     rangeLocations: { source: ISearchRange,
					//                       preview: ISearchRange }[],
					//     previewText: string,
					//   }
					// The OLD `{preview: {text, matches}, ranges}` shape
					// was renamed: `preview.text` → `previewText`, and
					// `preview.matches` + `ranges` collapsed into a single
					// pair-array `rangeLocations[]`. Stock vscode passes
					// our matches through `searchResult.add()` which
					// reads `previewText` + `rangeLocations` and silently
					// rejects (count-of-zero) entries with the old shape -
					// which is why the search panel showed 0 results
					// despite Mountain returning 2560 line-matches.
					//
					// `source`: 1-based line, 1-based column - the
					// position in the original file that matched.
					// `preview`: 1-based line=1, 1-based column - the
					// position WITHIN `previewText` for highlight
					// underlining.
					//
					// When Mountain didn't supply columns (older ripgrep
					// path or zero-width match), produce a single full-
					// line range so the row still renders.
					// `MatchImpl` (workbench/contrib/search/.../match.ts:31)
					// indexes `_fullPreviewLines[startLineNumber]` directly,
					// then +1's both axes when constructing the editor
					// `Range`. So both `source` and `preview` must be
					// fully 0-based here. Earlier shape was 1-based on the
					// preview, which made `previewLines[1]` === undefined
					// for single-line previews and produced
					// "undefined is not an object (evaluating
					// 'this._oneLinePreviewText.substring')". Source was
					// also off-by-one (line and column too high by 1).
					const SourceLine = Math.max(0, M.lineNumber - 1);
					const RangeLocations =
						M.columns.length > 0
							? M.columns.map((C) => ({
									source: {
										startLineNumber: SourceLine,
										startColumn: C.start,
										endLineNumber: SourceLine,
										endColumn: C.end,
									},
									preview: {
										startLineNumber: 0,
										startColumn: C.start,
										endLineNumber: 0,
										endColumn: C.end,
									},
								}))
							: [
									{
										source: {
											startLineNumber: SourceLine,
											startColumn: 0,
											endLineNumber: SourceLine,
											endColumn: M.preview.length,
										},
										preview: {
											startLineNumber: 0,
											startColumn: 0,
											endLineNumber: 0,
											endColumn: M.preview.length,
										},
									},
								];
					return {
						previewText: M.preview,
						rangeLocations: RangeLocations,
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
					let LineMatchCount = 0;
					let OnProgressCalled = 0;
					const HasOnProgress = typeof OnProgress === "function";
					for (const Hit of Raw ?? []) {
						const Match = MatchFromHit(Hit);
						LineMatchCount += Match.results?.length ?? 0;
						if (HasOnProgress) {
							try {
								OnProgress?.(Match);
								OnProgressCalled++;
							} catch (ProgressErr) {
								console.warn(
									"[SkyBridge] OnProgress threw on file",
									(Hit as any)?.resource,
									ProgressErr,
								);
							}
						}
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
			// `Trace=cel-scm` gate surfaces the underlying
			// reason without spamming the renderer console on every
			// register.
			try {
				const W = globalThis as any;
				if (W?.process?.env?.Trace?.includes?.("cel-scm")) {
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
				if (W?.process?.env?.Trace?.includes?.("cel-scm")) {
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
	// Mountain emits `sky://diagnostics/changed` after each `Diagnostic.Set`
	// from Cocoon's `vscode.languages.createDiagnosticCollection().set(...)`.
	// Without a renderer-side consumer that pushes into the workbench's
	// `IMarkerService`, the data lands in Mountain's `DiagnosticsMap` but
	// the editor never paints red squiggles and the Problems panel stays
	// empty - every language extension's compile errors / lint warnings /
	// type errors are invisible.
	//
	// Payload shape (from `DiagnosticProvider.SetDiagnostics`): `{ owner,
	// changedURIs: [{ uri, markers }] }`. We translate per-URI marker
	// arrays into `IMarkerService.changeOne(owner, URI, markers)` calls.
	// `Markers.changeOne` REPLACES the marker set for that URI under the
	// given owner - matching VS Code's `MainThreadDiagnostics` behaviour
	// where each `set()` call overwrites the previous diagnostic state.
	let MarkersBridgeFirstSuccessLogged = false;
	await Register("sky://diagnostics/changed", (Payload: any) => {
		const Services = GetServices();
		const Markers = (Services as any)?.Markers;
		const URICtor = (Services as any)?.URI;
		const Owner = String(Payload?.owner ?? "");
		const Changed = Array.isArray(Payload?.changedURIs)
			? Payload.changedURIs
			: [];
		if (!Markers?.changeOne || !URICtor) {
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"markers-bridge",
					`owner=${Owner} uris=${Changed.length} pushable=false markers=${typeof Markers?.changeOne} uri=${!!URICtor}`,
				],
			}).catch(() => {});
			return;
		}
		let PushedTotal = 0;
		let FirstUri = "";
		let FirstSeverity: number | undefined;
		let FirstMessageLength = 0;
		for (const Entry of Changed) {
			try {
				const Uri = Entry?.uri;
				const Markers_ = Array.isArray(Entry?.markers)
					? Entry.markers
					: [];
				if (!Uri) continue;
				const RealUri =
					typeof Uri === "string"
						? URICtor.parse(Uri)
						: Uri && typeof (Uri as any).with === "function"
							? Uri
							: URICtor.from(Uri);
				Markers.changeOne(Owner, RealUri, Markers_);
				PushedTotal += Markers_.length;
				if (!FirstUri) {
					FirstUri =
						typeof Uri === "string"
							? Uri
							: typeof (RealUri as any)?.toString === "function"
								? (RealUri as any).toString()
								: "";
					if (Markers_[0]) {
						FirstSeverity = (Markers_[0] as any)?.severity;
						FirstMessageLength = String(
							(Markers_[0] as any)?.message ?? "",
						).length;
					}
				}
			} catch (Error) {
				// Swallow - one bad entry must not stop the rest.
				void Error;
			}
		}
		// One-time success-path confirmation. Fires on the FIRST
		// diagnostic event that actually pushed markers, then stays
		// silent. Without this we can't distinguish "bridge runs but
		// markers are empty / malformed" from "bridge never runs at
		// all" - both look like a silent Problems panel. The fields
		// included are exactly what we need to triage either failure
		// mode (URI scheme/normalisation, marker severity validity,
		// message length).
		if (!MarkersBridgeFirstSuccessLogged && PushedTotal > 0) {
			MarkersBridgeFirstSuccessLogged = true;
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"markers-bridge",
					`first-push owner=${Owner} uris=${Changed.length} markers=${PushedTotal} firstUri=${FirstUri.slice(0, 200)} firstSeverity=${FirstSeverity ?? "?"} firstMsgLen=${FirstMessageLength}`,
				],
			}).catch(() => {});
		}
	});

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
				// Per-item try/catch so a single malformed tree node
				// (extension-side serialisation glitch, missing
				// `label`/`handle`) doesn't drop the entire panel
				// children list. Stock VS Code's renderer skips bad
				// items rather than failing the parent.
				const Items: unknown[] = [];
				for (let Index = 0; Index < RawItems.length; Index += 1) {
					try {
						Items.push(
							ToTreeItem(RawItems[Index], {
								ViewId,
								ParentHandle,
								Index,
							}),
						);
					} catch {
						/* skip the bad item; the rest of the children
						 * are still valid */
					}
				}
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
		const HandleTreeViewCreate = (Entry: {
			viewId?: string;
			extensionId?: string;
		}): void => {
			const ViewId = Entry?.viewId ?? "";
			if (!ViewId) return;
			AttachDataProvider(ViewId, 0);
			// Prime the DOM fan-out with the initial children too so
			// side-panel shims that mirror tree state don't need to wait
			// for a user-triggered expand.
			void ProvideChildren(ViewId, undefined);
		};
		document.addEventListener("cel:tree-view:create", (Event: Event) => {
			const Detail = (Event as CustomEvent).detail as
				| {
						viewId?: string;
						extensionId?: string;
						views?: Array<{
							viewId?: string;
							extensionId?: string;
						}>;
				  }
				| undefined;
			// Mountain may deliver a single tree-view registration or a
			// batch (`{ views: [...] }`) collected within a 16ms flush
			// window during extension boot. The batch shape avoids
			// emitting one Tauri event per registration, which used to
			// flood the WKWebView IPC channel with 30+ events at boot.
			if (Array.isArray(Detail?.views)) {
				for (const Entry of Detail.views) HandleTreeViewCreate(Entry);
			} else {
				HandleTreeViewCreate(Detail ?? {});
			}
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
			// Defensive: `Services?.TreeViewByViewId?.()` itself could
			// throw (Registry lookup with a freshly disposed view), and
			// `TreeView.refresh()` may synchronously throw before
			// returning a Promise (older xterm/tree shims). Wrap so a
			// single failure doesn't crash the listener loop.
			try {
				const Services = GetServices();
				const TreeView = Services?.TreeViewByViewId?.(ViewId);
				if (TreeView?.refresh) {
					const RefreshResult = TreeView.refresh();
					if (
						RefreshResult &&
						typeof RefreshResult.catch === "function"
					) {
						RefreshResult.catch(() => {});
					}
				}
			} catch {
				/* swallow - already-disposed view / DI lookup race */
			}
			// Also re-prime the Sky observers.
			try {
				void ProvideChildren(ViewId, undefined);
			} catch {
				/* swallow */
			}
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
			// Defensive: setter may throw if the workbench already
			// torn down the view in a parallel disposal race.
			try {
				const Services = GetServices();
				const TreeView = Services?.TreeViewByViewId?.(ViewId);
				if (TreeView && TreeView.dataProvider !== undefined) {
					TreeView.dataProvider = undefined;
				}
			} catch {
				/* view already disposed - nothing to clear */
			}
		});
	}

	// Debug + custom-editor channel relays - implementation in
	// `Bridge/InstallDebug.ts`. All nine channels are pure DOM-event
	// re-dispatchers; the workbench's own IDebugService /
	// ICustomEditorService handle the underlying flows through stock
	// VS Code internals.
	await (await import("./Bridge/InstallDebug.js")).default({ Register });

	// ---- Webview extensions ----
	// `sky://webview/create` - extension called
	// `vscode.window.createWebviewPanel(viewType, title, showOptions, options)`.
	// Cocoon's `WindowNamespace.ts:createWebviewPanel` emits this with
	// payload `{ method: "webview.create", handle, args: [Handle, ViewType,
	// Title, ShowOptions, Options] }` (or canonicalised via Mountain's
	// Effect dispatcher). Without a Sky-side handler, panel-mode
	// webviews (createWebviewPanel) had no parked target and any
	// subsequent `webview.setHtml` arriving for the same handle was
	// silently dropped by the registry lookup. Park a placeholder under
	// the handle so the set-html listener has SOMETHING to find;
	// downstream wiring to a real workbench WebviewPanel via
	// `IWebviewWorkbenchService` is a follow-up batch (the workbench
	// service isn't in `__CEL_SERVICES__` yet - see ExposeWorkbenchAccessor).
	let WebviewCreateFirstLogged = false;
	await Register("sky://webview/create", (Payload: any) => {
		const Handle =
			Payload?.handle != null
				? Payload.handle
				: Array.isArray(Payload?.args)
					? Payload.args[0]
					: undefined;
		if (Handle == null) return;
		const HandleRegistry: Map<string | number, any> = ((
			globalThis as any
		).__CEL_WEBVIEW_VIEWS_BY_HANDLE__ ??= new Map());
		const ViewType = String(Payload?.viewType ?? Payload?.args?.[1] ?? "");
		const Title = String(
			Payload?.title ?? Payload?.args?.[2] ?? ViewType ?? "",
		);
		// Try to materialise a REAL workbench webview-panel via
		// `IWebviewWorkbenchService.openWebview`. When the workbench-side
		// service is wired (see CELExposeAccessor's `WebviewPanels` slot)
		// this gives us a fully-functional `WebviewInput.webview` whose
		// `setHtml(html)` actually paints; the iframe goes through the
		// stock workbench message-port plumbing the same way native
		// `vscode.window.createWebviewPanel` does. If anything in the
		// service chain is missing (decorator unresolved, init-info
		// shape mismatch, or the Layout part not ready yet) we fall back
		// to the historical no-op placeholder so the set-html listener
		// at least doesn't throw on `webview.html = X` assignment.
		let RealOverlayWebview: any = null;
		try {
			const Services: any = (globalThis as any).__CEL_SERVICES__;
			const WebviewPanels = Services?.WebviewPanels;
			if (
				ViewType &&
				WebviewPanels &&
				typeof WebviewPanels.openWebview === "function"
			) {
				const WebviewInput = WebviewPanels.openWebview(
					{
						origin: undefined,
						providedViewType: ViewType,
						title: Title,
						options: { purpose: "webviewView" },
						contentOptions: {
							allowScripts: true,
							allowForms: true,
						},
						extension: undefined,
					},
					ViewType,
					Title,
					undefined,
					{ preserveFocus: true },
				);
				RealOverlayWebview = WebviewInput?.webview ?? null;
			}
		} catch {
			/* swallow - fall back to placeholder */
		}
		if (
			RealOverlayWebview &&
			typeof RealOverlayWebview.setHtml === "function"
		) {
			HandleRegistry.set(Handle, { webview: RealOverlayWebview });
		} else {
			// Fallback placeholder. Sky's set-html listener will write
			// to `_pendingHtml` via the html setter; once a future panel
			// integration arrives the cached `__CEL_WEBVIEW_PENDING_HTML_BY_HANDLE__`
			// can be replayed onto the real overlay's `setHtml(html)`.
			HandleRegistry.set(Handle, {
				webview: {
					_isPlaceholder: true,
					_pendingHtml: "",
					set html(Value: string) {
						this._pendingHtml = Value;
					},
					get html() {
						return this._pendingHtml;
					},
				},
			});
		}
		if (!WebviewCreateFirstLogged) {
			WebviewCreateFirstLogged = true;
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"webview-bridge",
					`first-create handle=${String(Handle)} viewType=${ViewType} title=${Title} backedBy=${RealOverlayWebview ? "WebviewInput" : "placeholder"}`,
				],
			}).catch(() => {});
		}
	});

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
	// Per-view pending HTML cache. setHtml notifications can race ahead of
	// the WebviewViewService resolver chain: an extension may set
	// `view.webview.html = "<html>"` inside `resolveWebviewView` before
	// our resolver callback's `Registry.set(ViewId, WebviewView)` runs,
	// or before the workbench's pane is body-visible at all. Without a
	// cache the very first set-html for each view lands on a placeholder
	// or `undefined` and is dropped. Park the html keyed by viewId AND
	// handle so a late resolve can replay it onto the real workbench
	// `IOverlayWebview` via `setHtml(html)`.
	const PendingWebviewHtml = new Map<string, string>();
	const PendingWebviewHtmlByHandle = new Map<string | number, string>();
	(globalThis as any).__CEL_WEBVIEW_PENDING_HTML__ = PendingWebviewHtml;
	(globalThis as any).__CEL_WEBVIEW_PENDING_HTML_BY_HANDLE__ =
		PendingWebviewHtmlByHandle;
	const ApplyHtmlToWebview = (await import("./Bridge/ApplyHtmlToWebview.js"))
		.default;
	(globalThis as any).__CEL_WEBVIEW_APPLY_HTML__ = ApplyHtmlToWebview;
	let WebviewSetHtmlFirstLogged = false;
	await Register("sky://webview/set-html", (Payload: any) => {
		// Mountain's Effect-dispatcher path emits the payload directly
		// from Cocoon's `{ handle, viewId, html }` (webview-view path)
		// or translated `{ method, handle, html, args }` (panel path).
		// Both shapes are accepted - read every viable key, then resolve
		// a view by viewId first (most common), then fall back to a
		// handle→view registry lookup so panel-mode webviews still get
		// their html applied.
		const ViewId: string = String(Payload?.viewId ?? "");
		const Handle: string | number =
			Payload?.handle != null ? Payload.handle : "";
		const Html: string = String(Payload?.html ?? Payload?.value ?? "");
		document.dispatchEvent(
			new CustomEvent("cel:webview:set-html", { detail: Payload }),
		);
		const Registry: Map<string, any> | undefined = (globalThis as any)
			.__CEL_WEBVIEW_VIEWS__;
		const HandleRegistry: Map<string | number, any> | undefined = (
			globalThis as any
		).__CEL_WEBVIEW_VIEWS_BY_HANDLE__;
		const ParkedView =
			(ViewId && Registry?.get(ViewId)) ||
			(Handle !== "" && HandleRegistry?.get(Handle));
		// Always cache so a late resolve can replay - even if a parked
		// view was found, the resolver may build a fresh proxy on
		// re-attach and we want the latest html available.
		if (ViewId) {
			PendingWebviewHtml.set(ViewId, Html);
		}
		if (Handle !== "") {
			PendingWebviewHtmlByHandle.set(Handle, Html);
		}
		const Applied = ApplyHtmlToWebview(ParkedView, Html);
		// One-time confirmation log for the FIRST set-html that arrives.
		// Tells us at-a-glance whether the bridge sees the kebab-case
		// channel + canonicalised payload AND which apply-strategy hit.
		if (!WebviewSetHtmlFirstLogged) {
			WebviewSetHtmlFirstLogged = true;
			// Snapshot the first 320 chars + the first <script src=...>
			// match so log dissection can tell at-a-glance whether
			// Roo's HTML actually carries its bundle reference. Strip
			// nonces from the snapshot since they vary per-resolve and
			// would defeat string-matching across runs. The script-src
			// tag is the single most informative data point on a paint
			// failure: if the workbench wrote html but the iframe's
			// React app never mounted, the script src tells us whether
			// the bundle URL resolves to an extension asset or to a
			// 404 / sourcemap-probe placeholder.
			const Snapshot = Html.slice(0, 320).replace(
				/nonce="[^"]+"/g,
				'nonce="…"',
			);
			const ScriptMatch = Html.match(/<script[^>]+src=["']([^"']+)["']/);
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"webview-bridge",
					`first-set-html viewId=${ViewId} handle=${String(Handle)} htmlLen=${Html.length} parkedViewFound=${!!ParkedView} applied=${Applied} hasRegistry=${!!Registry} hasHandleRegistry=${!!HandleRegistry} scriptSrc=${ScriptMatch?.[1] ?? "<none>"} snapshot=${JSON.stringify(Snapshot)}`,
				],
			}).catch(() => {});
		}
	});

	// Webview-view metadata: Cocoon `view.title = X` / `view.description
	// = X` / `view.badge = X` setters fire `webview.updateView`
	// notification with `{handle, viewId, title, description, badge}`.
	// Apply each non-null field to the parked workbench `WebviewView`.
	// `null` is the proxy's "explicitly unset" wire form (TS undefined
	// doesn't survive JSON), so treat null as no-change.
	await Register("sky://webview/updateView", (Payload: any) => {
		const ViewId: string = String(Payload?.viewId ?? "");
		document.dispatchEvent(
			new CustomEvent("cel:webview:updateView", { detail: Payload }),
		);
		if (!ViewId) return;
		const Registry: Map<string, any> | undefined = (globalThis as any)
			.__CEL_WEBVIEW_VIEWS__;
		const ParkedView = Registry?.get(ViewId);
		if (!ParkedView) return;
		try {
			if (Payload?.title != null)
				ParkedView.title = String(Payload.title);
			if (Payload?.description != null)
				ParkedView.description = String(Payload.description);
			if (Payload?.badge != null) ParkedView.badge = Payload.badge;
		} catch (_e) {
			/* swallow */
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
		const Registry: Map<string, any> | undefined = (globalThis as any)
			.__CEL_WEBVIEW_VIEWS__;
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
	// Counterpart: `vscode.tasks.taskExecution.terminate()` routes through
	// `RPC/CocoonService/Task/TerminateTask.rs:22` and fires
	// `sky://task/terminate` with `{ id }`. The workbench's task-runner
	// component listens on the matching DOM event so it can stop tracking
	// the row and (if the task spawned a terminal) close the pane.
	await Register("sky://task/terminate", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:task:terminate", { detail: Payload }),
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
	// Mountain coalesces decoration create/dispose into 16ms batches
	// (`Vine/Server/Notification/DecorationTypeLifecycle.rs`). Each
	// Tauri payload is now `{ batch: [<original payload>, ...] }`;
	// fall back to single-payload shape for any non-batched runtime
	// emit. Sky demultiplexes back into per-decoration
	// `cel:decoration:create` / `cel:decoration:dispose` CustomEvents
	// so individual listeners stay simple.
	const DispatchDecorationBatch = (
		DomEvent: string,
		Payload: { batch?: unknown[] } | unknown,
	): void => {
		const Maybe = (Payload as { batch?: unknown[] } | undefined)?.batch;
		if (Array.isArray(Maybe)) {
			for (const Entry of Maybe) {
				document.dispatchEvent(
					new CustomEvent(DomEvent, { detail: Entry }),
				);
			}
		} else {
			document.dispatchEvent(
				new CustomEvent(DomEvent, { detail: Payload }),
			);
		}
	};
	await Register(
		"sky://decoration/createTextEditorDecorationType",
		(Payload: any) => {
			DispatchDecorationBatch("cel:decoration:create", Payload);
		},
	);
	await Register(
		"sky://decoration/disposeTextEditorDecorationType",
		(Payload: any) => {
			DispatchDecorationBatch("cel:decoration:dispose", Payload);
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

	await Register("sky://webview/post-message", ({ handle, message }: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:post-message", {
				detail: { handle, message },
			}),
		);
	});

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
	// Once-per-session diagnostic so we can confirm at-a-glance from
	// `Mountain.dev.log` that this listener is actually wired into the
	// bundle, what shape Mountain hands us, and whether ViewId resolves.
	// Without this the listener was an opaque no-op when something
	// upstream (gRPC drop, payload-shape drift, missing __CEL_SERVICES__)
	// silently broke the registration chain. Subsequent emits stay quiet
	// so extension-host re-registration after a hot-reload doesn't spam
	// the IPC channel.
	let WebviewRegisterViewFirstLogged = false;
	await Register("sky://webview/registerView", (Payload: any) => {
		const Args = Array.isArray(Payload?.args) ? Payload.args : [];
		const Handle = Args[0] ?? Payload?.handle;
		const ViewId: string = String(Args[1] ?? Payload?.viewId ?? "");
		if (!WebviewRegisterViewFirstLogged) {
			WebviewRegisterViewFirstLogged = true;
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"webview-bridge",
					`first-registerView viewId=${ViewId} handle=${String(Handle)} hasArgs=${Array.isArray(Payload?.args)} hasViewIdKey=${typeof Payload?.viewId !== "undefined"} hasServices=${typeof (globalThis as any).__CEL_SERVICES__ === "object"} hasRegister=${typeof (globalThis as any).__CEL_SERVICES__?.WebviewViews?.register === "function"}`,
				],
			}).catch(() => {});
		}
		if (!ViewId) return;
		// Defensive: a malformed payload (Mountain emit shape drift,
		// missing handle, etc.) shouldn't kill the rest of the
		// listener pipeline. Track + DOM-dispatch are best-effort;
		// the WebviewViewService.register call below is what actually
		// makes the panel work, so isolate failures so one doesn't
		// cascade into the other.
		try {
			WebviewViewResolvers.set(ViewId, Number(Handle));
		} catch {
			/* Map.set on a non-string viewId is unreachable since we
			 * String()-coerced above, but keep the guard so a future
			 * payload-shape change can't poison the registry */
		}
		try {
			document.dispatchEvent(
				new CustomEvent("cel:webview:registerView", {
					detail: {
						handle: Handle,
						viewId: ViewId,
						payload: Payload,
					},
				}),
			);
		} catch (DispatchError) {
			try {
				console.warn(
					`[SkyBridge] webview/registerView CustomEvent dispatch failed for ${ViewId}:`,
					DispatchError,
				);
			} catch {
				/* console may be replaced */
			}
		}
		// Failure-only trace - the original log fired on every
		// webview-register event, saturating the IPC channel during
		// extension boot. The triage value lives entirely in the
		// `hasRegister=false` case: when the workbench service is
		// missing we want to know why webviews aren't attaching.
		try {
			const Services: any = (globalThis as any).__CEL_SERVICES__;
			if (!Services?.WebviewViews?.register) {
				invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"webview-bridge",
						`registerView viewId=${ViewId} handle=${Handle} hasRegister=false`,
					],
				}).catch(() => {});
				return;
			}
			// Probe the workbench's `_resolvers` map straight after the
			// register call. If it doesn't contain our viewType the
			// `_resolvers` reference is on a different instance than the
			// one the WebviewViewPane uses, which is the only remaining
			// explanation for register-completes-but-resolver-never-fires.
			const Disposable = Services.WebviewViews.register(ViewId, {
				resolve: async (WebviewView: any, _Cancellation: any) => {
					// Unconditional entry trace - fires the moment the
					// workbench's WebviewViewService.register / resolve
					// path invokes our resolver, BEFORE any local logic
					// can throw. Without this we cannot distinguish
					// "workbench never called us" from "workbench called
					// us but something inside this callback errored".
					try {
						invoke("MountainIPCInvoke", {
							method: "diagnostic:log",
							params: [
								"webview-bridge",
								`resolve-enter viewId=${ViewId} handle=${String(Handle)} hasWebview=${!!WebviewView?.webview}`,
							],
						}).catch(() => {});
					} catch {
						/* invoke may be unavailable mid-teardown */
					}
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
					// forwards to `sky://webview/set-html` - a listener
					// downstream applies the html to this parked view.
					try {
						const Registry: Map<string, any> = ((
							globalThis as any
						).__CEL_WEBVIEW_VIEWS__ ??= new Map());
						Registry.set(ViewId, WebviewView);
						// Also register by handle so the set-html listener
						// can fall back to a handle lookup for payloads that
						// don't carry viewId (panel-mode webviews).
						const HandleRegistry: Map<string | number, any> = ((
							globalThis as any
						).__CEL_WEBVIEW_VIEWS_BY_HANDLE__ ??= new Map());
						if (Handle != null && Handle !== "") {
							HandleRegistry.set(Handle, WebviewView);
						}
						// Drain any pending HTML that arrived BEFORE this
						// resolver fired. Cocoon's `view.webview.html =
						// "<html>"` setter inside `resolveWebviewView` runs
						// synchronously after the extension's activate(),
						// which can race ahead of our resolver callback;
						// without the replay the very first iframe content
						// is dropped and the panel sits at the spinner
						// even though the chain is wired correctly.
						const PendingByViewId: Map<string, string> | undefined =
							(globalThis as any).__CEL_WEBVIEW_PENDING_HTML__;
						const PendingByHandle:
							| Map<string | number, string>
							| undefined = (globalThis as any)
							.__CEL_WEBVIEW_PENDING_HTML_BY_HANDLE__;
						const ApplyHtml = (globalThis as any)
							.__CEL_WEBVIEW_APPLY_HTML__ as
							| ((view: any, html: string) => string)
							| undefined;
						const PendingHtml =
							(ViewId && PendingByViewId?.get(ViewId)) ||
							(Handle != null &&
								Handle !== "" &&
								PendingByHandle?.get(Handle)) ||
							"";
						let ReplayApplied: string | "none" = "none";
						if (PendingHtml && typeof ApplyHtml === "function") {
							ReplayApplied = ApplyHtml(WebviewView, PendingHtml);
						}
						invoke("MountainIPCInvoke", {
							method: "diagnostic:log",
							params: [
								"webview-bridge",
								`resolve viewId=${ViewId} handle=${String(Handle)} hasWebview=${!!WebviewView?.webview} replayApplied=${String(ReplayApplied)} replayLen=${PendingHtml.length}`,
							],
						}).catch(() => {});
					} catch (_e) {
						/* ignore */
					}
					// Forward workbench → extension events into Cocoon's
					// notification stream. Each subscribe returns a
					// disposable; the workbench will dispose the View
					// when the panel goes away which triggers `onDispose`
					// here, where we send the dispose notification AND
					// drop the registry entry so subsequent setHtml
					// calls don't paint into a dead view.
					const Notify = (Method: string, Payload: any) => {
						try {
							const Invoke =
								(globalThis as any).__TAURI__?.core?.invoke ??
								(globalThis as any).__TAURI__?.invoke;
							if (typeof Invoke !== "function") return;
							Invoke("MountainIPCInvoke", {
								method: "cocoon:notify",
								params: [Method, Payload],
							}).catch(() => null);
						} catch (_e) {
							/* swallow */
						}
					};
					try {
						WebviewView.webview?.onDidReceiveMessage?.(
							(Message: unknown) => {
								Notify("webview.message", {
									handle: Handle,
									viewId: ViewId,
									message: Message,
								});
							},
						);
					} catch (_e) {
						/* swallow */
					}
					try {
						WebviewView.onDidChangeVisibility?.(() => {
							Notify("webview.viewState", {
								handle: Handle,
								viewId: ViewId,
								visible: !!WebviewView.visible,
							});
						});
						// Stock workbench `WebviewViewService.resolve` is
						// only invoked when the pane is being revealed -
						// `WebviewView.visible` is `true` at that moment by
						// construction. Cocoon's WebviewView shim defaults
						// `visible` to `true` so the extension's React
						// mount path (Roo, Claude, GitLens, Continue all
						// short-circuit `getHtmlContent` on a falsy
						// `view.visible`) sees the right initial value.
						// Mirror that with an explicit visible=true notify
						// so the extension-host channel agrees with both
						// ends, even on workbench builds where the
						// internal `_visible` flag flips later than the
						// resolve callback.
						Notify("webview.viewState", {
							handle: Handle,
							viewId: ViewId,
							visible: true,
						});
					} catch (_e) {
						/* swallow */
					}
					try {
						WebviewView.onDispose?.(() => {
							Notify("webview.dispose", {
								handle: Handle,
								viewId: ViewId,
							});
							const Registry: Map<string, any> | undefined = (
								globalThis as any
							).__CEL_WEBVIEW_VIEWS__;
							Registry?.delete(ViewId);
						});
					} catch (_e) {
						/* swallow */
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
			// Defensive: nudge the WebviewViewPane's resolution chain by
			// touching `Services.Views.openView(viewId)` if the pane is
			// already body-visible. The workbench's `WebviewViewPane.
			// activate()` is gated by `_activated` and only runs once;
			// when our register fires AFTER activation completed, the
			// `onNewResolverRegistered` listener calls `updateTreeVisibility`
			// which hits the no-op early-return. `openView` re-enters the
			// composite-show path which re-fires `onDidChangeBodyVisibility`,
			// and the workbench's `webviewViewService.resolve(...)` is
			// re-invoked - finding our just-registered resolver this
			// second pass. We only do this when the pane is already
			// visible so we don't force-open every collapsed sidebar.
			try {
				const Visible = Services?.Views?.isViewVisible?.(ViewId);
				if (
					Visible &&
					typeof Services?.Views?.openView === "function"
				) {
					Services.Views.openView(ViewId, false)?.catch?.(() => null);
				}
			} catch {
				/* swallow - openView is best-effort */
			}
			// One-shot post-register probe: confirm our resolver actually
			// landed in the workbench's `_resolvers` map. Bracket access
			// because `_resolvers` is a TS-private field; JS doesn't
			// enforce so this works at runtime. If `hasResolver=false` the
			// `__CEL_SERVICES__.WebviewViews` instance is divorced from
			// the one the WebviewViewPane uses (DI scope mismatch) and we
			// know the bridge is talking to the wrong service.
			if (!(globalThis as any).__CEL_REGISTER_VIEW_VERIFIED__) {
				(globalThis as any).__CEL_REGISTER_VIEW_VERIFIED__ = true;
				try {
					const Resolvers = Services.WebviewViews?._resolvers;
					const HasResolver =
						typeof Resolvers?.has === "function"
							? Resolvers.has(ViewId)
							: undefined;
					const AwaitingRevival =
						Services.WebviewViews?._awaitingRevival;
					const HasPending =
						typeof AwaitingRevival?.has === "function"
							? AwaitingRevival.has(ViewId)
							: undefined;
					invoke("MountainIPCInvoke", {
						method: "diagnostic:log",
						params: [
							"webview-bridge",
							`registerView verified viewId=${ViewId} hasResolver=${String(HasResolver)} hasPending=${String(HasPending)} disposable=${typeof Disposable} resolversSize=${Resolvers?.size} awaitingSize=${AwaitingRevival?.size}`,
						],
					}).catch(() => {});
				} catch (ProbeError) {
					try {
						invoke("MountainIPCInvoke", {
							method: "diagnostic:log",
							params: [
								"webview-bridge",
								`registerView probe-failed viewId=${ViewId} message=${String((ProbeError as any)?.message ?? ProbeError).slice(0, 200)}`,
							],
						}).catch(() => {});
					} catch {
						/* invoke may be unavailable mid-teardown */
					}
				}
			}
		} catch (RegisterError) {
			// `IWebviewViewService.register` throws on duplicate viewId -
			// stock VS Code's `webviewViewService.ts:108` does
			// `throw new Error("View resolver already registered for ...")`
			// when a viewId is registered twice. That happens when the
			// extension host re-registers after a hot-reload or when our
			// SkyBridge reentrancy guard didn't engage in time. Mirror
			// every failure into Mountain.dev.log via the diagnostic IPC
			// so we can triage from the file sink (console.warn lands in
			// the renderer devtools but never reaches the dev-log file).
			try {
				const Message =
					(RegisterError as any)?.message ?? String(RegisterError);
				const Kind = String(Message).includes("already registered")
					? "dup"
					: "error";
				invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"webview-bridge",
						`registerView ${Kind} viewId=${ViewId} message=${String(Message).slice(0, 200)}`,
					],
				}).catch(() => {});
			} catch {
				/* invoke may be unavailable mid-teardown */
			}
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
				if (W?.process?.env?.Trace?.includes?.("cel-customeditor")) {
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

	console.log("[SkyBridge] All sky:// event channels registered");
	// Replay drain - implementation in `Bridge/ReplayEvents.ts`.
	await (await import("./Bridge/ReplayEvents.js")).default(invoke);
}

export default InstallSkyBridge;
