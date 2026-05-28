/**
 * @module Bridge/InstallTreeView
 *
 * ---- Tree-view data bridge ----
 *
 * Two-way wire so extension-registered tree views actually render:
 *
 *  1. **Native data provider attach**: workbench renders a tree view
 *     only when `treeView.dataProvider` is non-undefined. Stock VS
 *     Code sets this in `MainThreadTreeViews.$registerTreeViewDataProvider`
 *     via the ExtHostContext RPC - we don't have that channel yet
 *     (Track A bring-up from the coverage matrix), so we attach a
 *     data provider here that calls `tree:getChildren` via
 *     `MountainIPCInvoke`. `__CEL_SERVICES__.TreeViewByViewId(id)` is
 *     exposed by the Output transform plugin - it returns the same
 *     `ITreeView` the stock mainThread accesses via
 *     `Registry.as(ViewsRegistry).getView(id).treeView`.
 *
 *  2. **CustomEvent fan-out** (existing): the `cel:tree-view:items`
 *     DOM event stays so any Sky/Astro observer (side-panel mirror,
 *     diagnostic inspector) can react without going through the
 *     workbench tree rendering pipeline.
 *
 * If the view is registered BEFORE the tree descriptor is mounted,
 * `TreeViewByViewId` returns null - retry on microtask + rAF (covers
 * both async workbench init and the pane-is-collapsed-so-not-yet-mounted
 * case). After 5 retries spaced 150 ms apart we give up and rely on
 * whatever `$refresh` the extension issues next to re-trigger us.
 */

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

interface CelServices {
	TreeViewByViewId?: (viewId: string) => CelTreeView | null;

	[key: string]: unknown;
}

export default async (Dependencies: {
	GetServices: () => CelServices | null;

	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { GetServices, Invoke } = Dependencies;

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
			typeof Wire["handle"] === "string" && Wire["handle"].length > 0
				? Wire["handle"]
				: `${Fallback.ViewId}/${Fallback.ParentHandle || "root"}/${Fallback.Index}`;

		const Label =
			typeof Wire["label"] === "string"
				? { label: Wire["label"] }
				: (Wire["label"] as { label?: string } | undefined)?.label
					? (Wire["label"] as { label: string })
					: { label: "" };

		const CollapsibleState =
			Wire["isCollapsed"] === true
				? 1
				: typeof Wire["collapsibleState"] === "number"
					? Wire["collapsibleState"]
					: 0;

		// Pass through the full set of fields Cocoon's wire DTO
		// carries. Any field the workbench tree renderer doesn't
		// read is ignored silently; keeping them lets side-panel
		// mirrors (diagnostic inspectors, test harnesses) see the
		// same content the built-in tree does.
		const Description =
			typeof Wire["description"] === "string"
				? Wire["description"]
				: undefined;

		const Tooltip =
			typeof Wire["tooltip"] === "string" ? Wire["tooltip"] : undefined;

		const ContextValue =
			typeof Wire["contextValue"] === "string"
				? Wire["contextValue"]
				: undefined;

		return {
			handle: Handle,

			collapsibleState: CollapsibleState,

			label: Label,

			icon:
				typeof Wire["icon"] === "string" && Wire["icon"].length > 0
					? Wire["icon"]
					: undefined,

			description: Description,

			tooltip: Tooltip,

			resourceUri: Wire["resourceUri"],

			contextValue: ContextValue,

			command: Wire["command"],

			accessibilityInformation: Wire["accessibilityInformation"],
		};
	};

	const ProvideChildren = async (
		ViewId: string,

		Element?: { handle?: string },
	): Promise<unknown[]> => {
		try {
			const Response = (await Invoke("MountainIPCInvoke", {
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
			Invoke("RenderDevLog", {
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

		// Subscribe directly to the workbench's ITreeView onDid* events so
		// Mountain receives selection/collapse/expand/visibility changes.
		// The DOM cel:tree-view:* events are never dispatched by anyone,
		// so the document.addEventListener handlers at the bottom of this
		// file are dead code for those paths. Direct subscription here is
		// the canonical path. Checks are defensive: some TreeView
		// implementations may omit optional event properties.
		if (typeof (TreeView as any).onDidChangeSelection === "function") {
			(TreeView as any).onDidChangeSelection((E: any) => {
				ForwardTreeViewEvent("tree:selectionChanged", ViewId, {
					selection: E?.selection ?? [],
				});
			});
		}

		if (typeof (TreeView as any).onDidCollapseElement === "function") {
			(TreeView as any).onDidCollapseElement((E: any) => {
				ForwardTreeViewEvent("tree:collapseElement", ViewId, {
					element: E?.element,
				});
			});
		}

		if (typeof (TreeView as any).onDidExpandElement === "function") {
			(TreeView as any).onDidExpandElement((E: any) => {
				ForwardTreeViewEvent("tree:expandElement", ViewId, {
					element: E?.element,
				});
			});
		}

		if (typeof (TreeView as any).onDidChangeVisibility === "function") {
			(TreeView as any).onDidChangeVisibility((E: any) => {
				ForwardTreeViewEvent("tree:visibilityChanged", ViewId, {
					visible: E?.visible ?? false,
				});
			});
		}
	};

	const AttachDataProvider = (ViewId: string): void => {
		const Services = GetServices();

		const GetTreeView = Services?.TreeViewByViewId;

		const TreeView =
			typeof GetTreeView === "function" ? GetTreeView(ViewId) : null;

		if (TreeView) {
			AttachToDescriptor(ViewId, TreeView);
		}
	};

	const HandleTreeViewCreate = (Entry: {
		viewId?: string;

		extensionId?: string;
	}): void => {
		const ViewId = Entry?.viewId ?? "";

		if (!ViewId) return;

		AttachDataProvider(ViewId);

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

	// Tree view interaction events: selection, collapse, expand, visibility.
	// When the VS Code workbench fires these, forward to Mountain so Cocoon
	// can fire the corresponding TreeView.onDid* events to extensions.
	const ForwardTreeViewEvent = (
		channel: string,

		viewId: string,

		extra?: Record<string, unknown>,
	) => {
		void Invoke("MountainIPCInvoke", {
			method: channel,
			params: [{ viewId, ...extra }],
		}).catch(() => {});
	};

	document.addEventListener(
		"cel:tree-view:selectionChanged",

		(Event: Event) => {
			const Detail = (Event as CustomEvent).detail as
				| { viewId?: string; selection?: unknown[] }
				| undefined;

			if (Detail?.viewId)
				ForwardTreeViewEvent("tree:selectionChanged", Detail.viewId, {
					selection: Detail.selection ?? [],
				});
		},
	);

	document.addEventListener("cel:tree-view:collapse", (Event: Event) => {
		const Detail = (Event as CustomEvent).detail as
			| { viewId?: string; element?: unknown }
			| undefined;

		if (Detail?.viewId)
			ForwardTreeViewEvent("tree:collapseElement", Detail.viewId, {
				element: Detail.element,
			});
	});

	document.addEventListener("cel:tree-view:expand", (Event: Event) => {
		const Detail = (Event as CustomEvent).detail as
			| { viewId?: string; element?: unknown }
			| undefined;

		if (Detail?.viewId)
			ForwardTreeViewEvent("tree:expandElement", Detail.viewId, {
				element: Detail.element,
			});
	});

	document.addEventListener(
		"cel:tree-view:visibilityChanged",

		(Event: Event) => {
			const Detail = (Event as CustomEvent).detail as
				| { viewId?: string; visible?: boolean }
				| undefined;

			if (Detail?.viewId)
				ForwardTreeViewEvent("tree:visibilityChanged", Detail.viewId, {
					visible: Detail.visible ?? false,
				});
		},
	);

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
};
