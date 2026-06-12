/**
 * @module Bridge/InstallWebview
 *
 * ---- Webview extensions ----
 *
 * Covers `sky://webview/create`, `sky://webview/set-html`,
 * `sky://webview/updateView`, `sky://webview/postMessage`,
 * `sky://webview/registerView`, `sky://webview/unregisterView`,
 * `sky://webview/registerCustomEditor`, and
 * `sky://webview/unregisterCustomEditor`.
 *
 * `sky://webview/create` - extension called
 * `vscode.window.createWebviewPanel(viewType, title, showOptions, options)`.
 * Cocoon's `WindowNamespace.ts:createWebviewPanel` emits this with
 * payload `{ method: "webview.create", handle, args: [Handle, ViewType,
 * Title, ShowOptions, Options] }` (or canonicalised via Mountain's
 * Effect dispatcher). Without a Sky-side handler, panel-mode
 * webviews (createWebviewPanel) had no parked target and any
 * subsequent `webview.setHtml` arriving for the same handle was
 * silently dropped by the registry lookup. Park a placeholder under
 * the handle so the set-html listener has SOMETHING to find;
 * downstream wiring to a real workbench WebviewPanel via
 * `IWebviewWorkbenchService` is a follow-up batch (the workbench
 * service isn't in `__CEL_SERVICES__` yet - see ExposeWorkbenchAccessor).
 */

export default async (Dependencies: {
	Register: (
		Channel: string,

		Handler: (Payload: any) => void,
	) => Promise<void>;

	ApplyHtmlToWebview: (view: any, html: string) => string;

	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { Register, ApplyHtmlToWebview, Invoke } = Dependencies;

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

	(globalThis as any).__CEL_WEBVIEW_APPLY_HTML__ = ApplyHtmlToWebview;

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
		// Forward panel-mode webview events back to the extension via Cocoon's
		// notification stream. Stock VS Code's MainThreadWebviewPanels owns
		// this lifecycle directly; in Land that path is replaced by the
		// Cocoon proxy in CreateWebviewPanel.ts, so we have to push the
		// workbench events back through `cocoon:notify` keyed by the
		// handle that Cocoon's proxy emitter listens on
		// (`webview.message:<handle>` / `webview.dispose:<handle>` /
		// `webview.viewState:<handle>`).
		const NotifyForPanel = (Method: string, NotifyPayload: any) => {
			try {
				const Inv =
					(globalThis as any).__TAURI__?.core?.invoke ??
					(globalThis as any).__TAURI__?.invoke;

				if (typeof Inv !== "function") return;

				Inv("MountainIPCInvoke", {
					method: "cocoon:notify",
					params: [Method, NotifyPayload],
				}).catch(() => null);
			} catch {
				/* swallow */
			}
		};

		// Extension-provided options from `createWebviewPanel(viewType, title, showOptions, options)`.
		// Cocoon's CreateWebviewPanel.ts forwards them as `Payload.options`. These override
		// hardcoded defaults for `retainContextWhenHidden`, `enableFindWidget`, `enableScripts`,
		// and `enableForms` so extensions that explicitly opt-out of context retention
		// (e.g. lightweight stateless panels) aren't forced into the keep-alive path.
		const ExtensionOptions: Record<string, unknown> =
			Payload?.options != null &&
			typeof Payload.options === "object" &&
			!Array.isArray(Payload.options)
				? (Payload.options as Record<string, unknown>)
				: {};

		let RealOverlayWebview: any = null;

		let RealWebviewInput: any = null;

		try {
			const Services: any = (globalThis as any).__CEL_SERVICES__;

			const WebviewPanels = Services?.WebviewPanels;

			if (
				ViewType &&
				WebviewPanels &&
				typeof WebviewPanels.openWebview === "function"
			) {
				// Origin must be stable per (viewType, extensionId) for
				// session storage / cookies to stick. Use the viewType as a
				// best-effort stable seed - real extension identity isn't
				// available on the Sky side, so this approximates upstream's
				// `ExtensionKeyedWebviewOriginStore`.
				const Origin = `webview-panel-${ViewType}`;

				const WebviewInput = WebviewPanels.openWebview(
					{
						origin: Origin,
						providedViewType: ViewType,
						title: Title,
						// `disableServiceWorker: true` matches the
						// `Patch/Webview/Iframe/Service/Worker.ts` transform
						// that strips SW registration from `pre/index.html`.
						// WKWebView in Tauri refuses to register SWs on
						// `vscode-webview://` so leaving SW enabled stalls
						// the iframe handshake forever.
						options: {
							disableServiceWorker: true,
							// Default to retaining DOM when hidden (matches upstream
							// behaviour for most panels). Extensions can override via
							// `options.retainContextWhenHidden: false`.
							retainContextWhenHidden:
								ExtensionOptions.retainContextWhenHidden !==
								false,
							// `enableFindWidget` defaults to false in upstream VS Code.
							// Extensions that want the find widget in their webview
							// can pass `enableFindWidget: true` in options.
							enableFindWidget: Boolean(
								ExtensionOptions.enableFindWidget,
							),
						},
						contentOptions: {
							allowScripts:
								ExtensionOptions.enableScripts !== false,
							allowForms: ExtensionOptions.enableForms !== false,
							// localResourceRoots default = no restrictions;
							// extensions populate this via webview.setOptions
							// once they've activated. Leaving it undefined
							// (= unrestricted in upstream) prevents the
							// "blocked extension resource" failure mode on
							// first paint.
							localResourceRoots:
								(ExtensionOptions as any).localResourceRoots ??
								undefined,
						},
						extension: undefined,
					},

					ViewType,

					Title,

					undefined,

					{ preserveFocus: true },
				);

				RealWebviewInput = WebviewInput ?? null;

				RealOverlayWebview = WebviewInput?.webview ?? null;
			}
		} catch {
			/* swallow - fall back to placeholder */
		}

		if (
			RealOverlayWebview &&
			typeof RealOverlayWebview.setHtml === "function"
		) {
			HandleRegistry.set(Handle, {
				webview: RealOverlayWebview,
				input: RealWebviewInput,
			});

			// Subscribe to the panel webview's events and forward them to
			// the extension via Cocoon's emitter. Without these subscriptions
			// extensions get a non-functional panel: postMessage from the
			// iframe never reaches their `webview.onDidReceiveMessage`
			// listener, `panel.onDidDispose` never fires when the user
			// closes the editor tab, and `panel.onDidChangeViewState`
			// stays silent through every group-change.
			try {
				RealOverlayWebview.onMessage?.((Message: unknown) => {
					NotifyForPanel("webview.message", {
						handle: Handle,
						message: Message,
					});
				});
			} catch {
				/* swallow */
			}

			// IEditorService-driven viewState pushes. The WebviewInput
			// extends EditorInput, so `onWillDispose` fires when the user
			// closes the tab (or the editor is replaced).
			try {
				RealWebviewInput?.onWillDispose?.(() => {
					NotifyForPanel("webview.dispose", { handle: Handle });

					HandleRegistry.delete(Handle);
				});
			} catch {
				/* swallow */
			}

			// Active / visible tracking: hook IEditorService.onDidActiveEditorChange
			// once globally and route per-handle. We don't have a per-input
			// visibility event; the active-change emitter is the closest
			// approximation upstream's MainThreadWebviewPanels uses too.
			try {
				const Services: any = (globalThis as any).__CEL_SERVICES__;

				const EditorService = Services?.Editor;

				if (
					EditorService &&
					typeof EditorService.onDidActiveEditorChange === "function"
				) {
					const Subscription = EditorService.onDidActiveEditorChange(
						() => {
							const Active = EditorService.activeEditor;

							const IsActive = Active === RealWebviewInput;

							NotifyForPanel("webview.viewState", {
								handle: Handle,
								active: IsActive,
								visible: IsActive,
								viewColumn: 1,
							});
						},
					);

					RealWebviewInput?.onWillDispose?.(() => {
						try {
							Subscription?.dispose?.();
						} catch {
							/* swallow */
						}
					});
				}
			} catch {
				/* swallow */
			}

			// If any HTML arrived BEFORE openWebview returned (race against
			// the extension's `panel.webview.html = "..."` setter that runs
			// inside `createWebviewPanel`), replay it now so first paint
			// doesn't miss.
			try {
				const Pending = PendingWebviewHtmlByHandle.get(Handle);

				if (Pending) {
					RealOverlayWebview.setHtml(Pending);
				}
			} catch {
				/* swallow */
			}
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

			Invoke("MountainIPCInvoke", {
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
			Invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"webview-bridge",
					`first-set-html viewId=${ViewId} handle=${String(Handle)} htmlLen=${Html.length} parkedViewFound=${!!ParkedView} applied=${Applied} hasRegistry=${!!Registry} hasHandleRegistry=${!!HandleRegistry} scriptSrc=${ScriptMatch?.[1] ?? "<none>"} snapshot=${JSON.stringify(Snapshot)}`,
				],
			}).catch(() => {});
			// Store globally so the debug server /eval can query it
			(globalThis as any).__CEL_LAST_SET_HTML_INFO__ = {
				viewId: ViewId,
				handle: Handle,
				htmlLen: Html.length,
				parkedViewFound: !!ParkedView,
				applied: Applied,
				hasRegistry: !!Registry,
				hasHandleRegistry: !!HandleRegistry,
				scriptSrc: ScriptMatch?.[1] ?? "<none>",
				ts: Date.now(),
			};
		}
		// Also store on EVERY set-html (not just first)
		(globalThis as any).__CEL_LATEST_SET_HTML_INFO__ = {
			viewId: ViewId,
			handle: Handle,
			htmlLen: Html.length,
			parkedViewFound: !!ParkedView,
			applied: Applied,
			hasRegistry: !!Registry,
			hasHandleRegistry: !!HandleRegistry,
			scriptSrc: "<none> (not in scope)",
			ts: Date.now(),
		};
	});

	// Webview-view metadata: Cocoon `view.title = X` / `view.description
	// = X` / `view.badge = X` setters fire `webview.updateView`
	// `webview.setTitle` - extension set webview panel title via
	// `panel.title = "..."`. Forward to the parked overlay if available.
	await Register("sky://webview/setTitle", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:setTitle", { detail: Payload }),
		);
		const Handle: string | number =
			Payload?.handle ?? Payload?.viewId ?? "";
		const Title: string = String(Payload?.title ?? Payload?.value ?? "");
		if (!Title) return;
		const HandleRegistry: Map<string | number, any> | undefined = (
			globalThis as any
		).__CEL_WEBVIEW_VIEWS_BY_HANDLE__ as
			| Map<string | number, any>
			| undefined;
		const Entry = HandleRegistry?.get(Handle);
		if (!Entry) return;
		try {
			const Webview = Entry?.webview ?? Entry;

			if (typeof Webview?.setTitle === "function")
				Webview.setTitle(Title);
		} catch {}
	});

	// `webview.setIconPath` - extension set webview panel icon.
	await Register("sky://webview/setIconPath", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:setIconPath", { detail: Payload }),
		);
	});

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

	// Webview options: `webview.setOptions` notification (via WebviewLifecycle)
	// and `webview.setOptions` sendRequest (via Webview.rs effect). Both now
	// emit `sky://webview/setOptions`. Applies `enableScripts`, `enableForms`,
	// `localResourceRoots` etc. to the parked overlay webview.
	await Register("sky://webview/setOptions", (Payload: any) => {
		const Handle: string | number =
			Payload?.handle ?? Payload?.viewId ?? "";

		const Options = Payload?.options ?? Payload;

		document.dispatchEvent(
			new CustomEvent("cel:webview:setOptions", { detail: Payload }),
		);

		if (!Options) return;

		const Registry: Map<string, any> | undefined = (globalThis as any)
			.__CEL_WEBVIEW_VIEWS__;

		const HandleRegistry: Map<string | number, any> | undefined = (
			globalThis as any
		).__CEL_WEBVIEW_PANELS__ as Map<string | number, any> | undefined;

		const Entry =
			(typeof Handle === "string" && Registry?.get(Handle)) ||
			HandleRegistry?.get(Handle);

		if (!Entry) return;

		try {
			const Webview = Entry?.webview ?? Entry;

			if (typeof Webview?.setOptions === "function") {
				Webview.setOptions(Options);
			}
		} catch {
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

		const Handle: string | number =
			Payload?.handle != null ? Payload.handle : "";

		const Message = Payload?.message;

		document.dispatchEvent(
			new CustomEvent("cel:webview:post-message", {
				detail: { ...Payload, viewId: ViewId, message: Message },
			}),
		);

		// Resolution priority: viewId → sidebar `IWebviewViewService` view;
		// handle → editor-area panel created via `IWebviewWorkbenchService`.
		// Stock VS Code's MainThreadWebviewPanels keys panels by `handle`;
		// our Cocoon proxy in CreateWebviewPanel.ts mirrors that, so the
		// fallback by-handle lookup is what makes panel-mode postMessage
		// actually reach the iframe. Previously only viewId was checked,
		// silently dropping every panel-mode postMessage.
		const Registry: Map<string, any> | undefined = (globalThis as any)
			.__CEL_WEBVIEW_VIEWS__;

		const HandleRegistry: Map<string | number, any> | undefined = (
			globalThis as any
		).__CEL_WEBVIEW_VIEWS_BY_HANDLE__;

		const Target =
			(ViewId && Registry?.get(ViewId)) ||
			(Handle !== "" && HandleRegistry?.get(Handle));

		const Webview = Target?.webview ?? Target;

		if (typeof Webview?.postMessage !== "function") return;

		try {
			Webview.postMessage(Message);
		} catch {
			/* swallow - dead webview, message simply drops */
		}
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

			Invoke("MountainIPCInvoke", {
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
			Invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"sky-bridge",
					`webview/registerView CustomEvent dispatch failed for ${ViewId}: ${DispatchError instanceof Error ? DispatchError.message : String(DispatchError)}`,
				],
			}).catch(() => {});
		}

		// Failure-only trace - the original log fired on every
		// webview-register event, saturating the IPC channel during
		// extension boot. The triage value lives entirely in the
		// `hasRegister=false` case: when the workbench service is
		// missing we want to know why webviews aren't attaching.
		try {
			const Services: any = (globalThis as any).__CEL_SERVICES__;

			if (!Services?.WebviewViews?.register) {
				Invoke("MountainIPCInvoke", {
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
						Invoke("MountainIPCInvoke", {
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

						Invoke("MountainIPCInvoke", {
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
					const Notify = (Method: string, NotifyPayload: any) => {
						try {
							const Inv =
								(globalThis as any).__TAURI__?.core?.invoke ??
								(globalThis as any).__TAURI__?.invoke;

							if (typeof Inv !== "function") return;

							Inv("MountainIPCInvoke", {
								method: "cocoon:notify",
								params: [Method, NotifyPayload],
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
					// pane unblocks. The round-trip is bounded by a 10 s
					// timeout that RESOLVES (never rejects): a hung
					// Cocoon request must not pin this resolver past the
					// workbench's resolve deadline and permanently fail
					// the view - the parked view repaints when the
					// extension's `sky://webview/set-html` arrives.
					try {
						const Inv =
							(globalThis as any).__TAURI__?.core?.invoke ??
							(globalThis as any).__TAURI__?.invoke;

						if (typeof Inv === "function") {
							let ResolveViewTimeout: number | undefined;

							await Promise.race([
								Inv("MountainIPCInvoke", {
									method: "cocoon:request",
									params: [
										"webview.resolveView",
										{ handle: Handle, viewId: ViewId },
									],
								}).catch(() => null),

								new Promise<void>((TimeoutResolve) => {
									ResolveViewTimeout = window.setTimeout(
										() => {
											Invoke("MountainIPCInvoke", {
												method: "diagnostic:log",
												params: [
													"webview-bridge",
													`resolveView timeout viewId=${ViewId} handle=${String(Handle)} - resolving anyway; set-html will repaint`,
												],
											}).catch(() => {});

											TimeoutResolve();
										},

										10_000,
									);
								}),
							]);

							if (ResolveViewTimeout !== undefined) {
								window.clearTimeout(ResolveViewTimeout);
							}
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

					Invoke("MountainIPCInvoke", {
						method: "diagnostic:log",
						params: [
							"webview-bridge",
							`registerView verified viewId=${ViewId} hasResolver=${String(HasResolver)} hasPending=${String(HasPending)} disposable=${typeof Disposable} resolversSize=${Resolvers?.size} awaitingSize=${AwaitingRevival?.size}`,
						],
					}).catch(() => {});
				} catch (ProbeError) {
					try {
						Invoke("MountainIPCInvoke", {
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

				Invoke("MountainIPCInvoke", {
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

	// ---- Webview dispose ----
	// Mountain emits `sky://webview/dispose` from DisposeWebviewPanel.rs,
	// WebviewDispose.rs, and WebviewDispose gRPC notification when an
	// extension calls `panel.dispose()`. This handler was previously in
	// InstallTasksAndDecorations.ts and was accidentally removed.
	// Without it, panels are never cleaned up and stale DOM nodes accumulate.
	// `webview.reveal` - extension called `panel.reveal(viewColumn, preserveFocus)`.
	// Bring the webview panel into view via the parked WebviewInput or view service.
	await Register("sky://webview/reveal", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:webview:reveal", { detail: Payload }),
		);

		const Handle: string | number =
			Payload?.handle ?? Payload?.viewId ?? Payload?.args?.[0] ?? "";

		const ViewId: string = String(Payload?.viewId ?? "");

		const PreserveFocus: boolean = !!(Payload?.preserveFocus ?? false);

		try {
			const Services: any = (globalThis as any).__CEL_SERVICES__;

			if (ViewId && Services?.Views) {
				Services.Views.openView?.(ViewId, !PreserveFocus);
			} else {
				const HandleRegistry: Map<string | number, any> | undefined = (
					globalThis as any
				).__CEL_WEBVIEW_VIEWS_BY_HANDLE__ as
					| Map<string | number, any>
					| undefined;

				const Entry = HandleRegistry?.get(Handle);

				const Webview = Entry?.webview ?? Entry;

				if (typeof Webview?.focus === "function" && !PreserveFocus)
					Webview.focus();
			}
		} catch {
			/* non-fatal */
		}
	});

	await Register("sky://webview/dispose", (Payload: any) => {
		const PanelId = Payload?.panelId ?? Payload?.handle ?? "";

		document.dispatchEvent(
			new CustomEvent("cel:webview:dispose", {
				detail: { panelId: PanelId },
			}),
		);

		if (PanelId === "") return;

		// Mountain's emitters carry the handle as either a number or a
		// string depending on the dispatch path, and the registries were
		// keyed with whatever shape `sky://webview/create` / the
		// register-view resolver saw - try every coercion.
		const HandleKeys: Array<string | number> = [PanelId, String(PanelId)];

		if (Number.isFinite(Number(PanelId))) {
			HandleKeys.push(Number(PanelId));
		}

		try {
			const HandleRegistry: Map<string | number, any> | undefined = (
				globalThis as any
			).__CEL_WEBVIEW_VIEWS_BY_HANDLE__;

			for (const Key of HandleKeys) {
				HandleRegistry?.delete(Key);
			}
		} catch {
			/* non-fatal */
		}

		// Drop the parked HTML for the disposed webview so it doesn't
		// accumulate for the rest of the session. The by-viewId cache is
		// not keyed by handle - reverse-look the viewId up through the
		// resolver registry (the dispose payload itself carries no
		// viewId on the panel path).
		try {
			for (const Key of HandleKeys) {
				PendingWebviewHtmlByHandle.delete(Key);
			}

			const ViewId = String(Payload?.viewId ?? "");

			if (ViewId) {
				PendingWebviewHtml.delete(ViewId);
			}

			for (const [
				ResolverViewId,

				ResolverHandle,
			] of WebviewViewResolvers) {
				if (ResolverHandle === Number(PanelId)) {
					PendingWebviewHtml.delete(ResolverViewId);
				}
			}
		} catch {
			/* non-fatal */
		}
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

			// Resolve viewType from either payload format defensively.
			// New (named-key): { viewType, options, selector, handle }
			// Old (positional): { args: [handle, viewType, options, ...] }
			// The old code read ONLY Args[1], which was always "" after Cocoon
			// switched to named-key payloads, silently skipping registration.
			const Args: unknown[] = Array.isArray(Payload?.args)
				? Payload.args
				: [];

			const ViewType: string = String(
				Payload?.viewType ??
					(typeof Args[1] === "string" && Args[1].length > 0
						? Args[1]
						: undefined) ??
					"",
			);

			// Options: prefer named-key payload.options, fall back to Args[2].
			const Options: Record<string, unknown> =
				Payload?.options !== null &&
				typeof Payload?.options === "object"
					? (Payload.options as Record<string, unknown>)
					: Args[2] !== null && typeof Args[2] === "object"
						? (Args[2] as Record<string, unknown>)
						: {};

			// Selector: glob patterns like [{ filenamePattern: "*.{png,...}" }]
			const Selector: unknown[] = Array.isArray(Payload?.selector)
				? Payload.selector
				: [];

			if (!ViewType || CustomEditorCapabilityHandles.has(ViewType))
				return;

			// Register capabilities (metadata used by VS Code's
			// CustomEditorContribution for multi-editor and lifecycle).
			const Disposable =
				Services.CustomEditor.registerCustomEditorCapabilities(
					ViewType,

					{
						supportsMultipleEditorsPerDocument: Boolean(
							Options["supportsMultipleEditorsPerDocument"],
						),
					},
				);

			if (Disposable != null) {
				CustomEditorCapabilityHandles.set(ViewType, Disposable);
			}

			// Also register with IEditorResolverService so VS Code routes
			// matching file opens to this custom editor. This is a fallback
			// for when CustomEditorContribution's manifest-based registration
			// hasn't fired yet (e.g. extension activates lazily on first open).
			// Priority is `option` so VS Code's builtin factory (from the
			// manifest contribution) takes precedence when both are registered.
			const EditorResolver = Services?.EditorResolver;

			const Priority = Services?.RegisteredEditorPriority;

			if (
				typeof EditorResolver?.registerEditor === "function" &&
				Selector.length > 0 &&
				Priority
			) {
				for (const S of Selector) {
					const GlobPattern =
						typeof S === "string"
							? S
							: typeof (S as any)?.filenamePattern === "string"
								? (S as any).filenamePattern
								: null;

					if (!GlobPattern) continue;

					try {
						EditorResolver.registerEditor(
							GlobPattern,

							{
								id: ViewType,
								label: String(
									(Options as any)["displayName"] ?? ViewType,
								),
								priority: Priority.option,
							},

							{},

							{
								// createEditorInput MUST NOT return undefined/null -
								// VS Code would crash trying to read .editor on the
								// result. We throw so the resolver falls through to
								// CustomEditorContribution's builtin factory, which
								// is tried first (higher priority) and is the
								// canonical path for custom editors. Our registration
								// here serves primarily to trigger the
								// onCustomEditor:* activation event so the extension
								// activates and registers its provider.
								createEditorInput: () => {
									throw new Error(
										`[Sky:CEL] defer-to-builtin:${ViewType}`,
									);
								},
							},
						);
					} catch {
						// Non-fatal: manifest-based registration still works.
					}
				}
			}
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
};
