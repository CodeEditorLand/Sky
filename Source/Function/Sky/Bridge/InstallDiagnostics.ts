/**
 * @module Bridge/InstallDiagnostics
 *
 * ---- Diagnostics → IMarkerService bridge ----
 *
 * Mountain emits `sky://diagnostics/changed` after each `Diagnostic.Set`
 * from Cocoon's `vscode.languages.createDiagnosticCollection().set(...)`.
 * Without a renderer-side consumer that pushes into the workbench's
 * `IMarkerService`, the data lands in Mountain's `DiagnosticsMap` but
 * the editor never paints red squiggles and the Problems panel stays
 * empty - every language extension's compile errors / lint warnings /
 * type errors are invisible.
 *
 * Payload shape (from `DiagnosticProvider.SetDiagnostics`): `{ owner,
 * changedURIs: [{ uri, markers }] }`. We translate per-URI marker
 * arrays into `IMarkerService.changeOne(owner, URI, markers)` calls.
 * `Markers.changeOne` REPLACES the marker set for that URI under the
 * given owner - matching VS Code's `MainThreadDiagnostics` behaviour
 * where each `set()` call overwrites the previous diagnostic state.
 *
 * ## Why the Problems panel needs `openView`
 *
 * `MarkersView.reInitialize()` (the bulk read from `IMarkerService`) only
 * runs inside `onDidChangeMarkersViewVisibility(true)`. Until the panel
 * has been opened at least once, the `onMarkerChanged` subscription in
 * `onVisibleDisposables` does not exist, and `MicrotaskEmitter.fire()`
 * silently drops events when `hasListeners() === false`. Markers ARE
 * stored in `MarkerService._data` via `changeOne`, but nobody re-reads
 * them until the panel opens. `openView(id, false)` triggers
 * `setVisible(true)` → `reInitialize()` → bulk `markerService.read()`
 * → `markersModel.setResourceMarkers(...)` → panel renders.
 *
 * This must fire on EVERY batch where the panel is not yet visible, not
 * just the first one. A one-shot guard means a second language server
 * (e.g. rust-analyzer activating after TypeScript) never triggers the
 * panel population.
 */

export default async (Dependencies: {
	Register: (
		Channel: string,
		Handler: (Payload: any) => void,
	) => Promise<void>;
	GetServices: () => {
		Markers?: {
			changeOne(owner: string, uri: unknown, markers: unknown[]): void;
			read(...args: unknown[]): unknown[];
		};
		URI?: {
			parse(value: string): unknown;
			from(components: object): unknown;
			revive?(value: unknown): unknown;
		};
		Views?: {
			openView?(id: string, focus: boolean): Promise<unknown>;
			getViewWithId?(id: string): unknown;
		};
		[key: string]: unknown;
	} | null;
	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { Register, GetServices, Invoke } = Dependencies;

	// Throttle: don't call openView more than once per second during rapid
	// multi-file diagnostic batches (rust-analyzer can fire 50+ events/sec).
	let LastOpenViewMs = 0;
	const OpenViewThrottleMs = 1000;

	// Revive a marker's relatedInformation[].resource fields from URI strings
	// to real URI instances so MarkersView's label service can render them.
	const ReviveRelatedInformation = (
		RelInfos: unknown[],
		URICtor: any,
	): unknown[] => {
		if (!Array.isArray(RelInfos) || !URICtor) return RelInfos;
		return RelInfos.map((RI: any) => {
			if (!RI || typeof RI !== "object") return RI;
			const Raw = RI.resource;
			if (!Raw) return RI;
			try {
				const Revived =
					URICtor.revive?.(Raw) ??
					(typeof Raw === "string"
						? URICtor.parse(Raw)
						: URICtor.from(Raw));
				return { ...RI, resource: Revived };
			} catch {
				return RI;
			}
		});
	};

	await Register("sky://diagnostics/changed", (Payload: any) => {
		const Services = GetServices();
		const Markers = (Services as any)?.Markers;
		const URICtor = (Services as any)?.URI;
		const Owner = String(Payload?.owner ?? "");
		const Changed = Array.isArray(Payload?.changedURIs)
			? Payload.changedURIs
			: [];

		if (!Markers?.changeOne || !URICtor) {
			Invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"markers-bridge",
					`owner=${Owner} uris=${Changed.length} pushable=false markers=${typeof Markers?.changeOne} uri=${!!URICtor}`,
				],
			}).catch(() => {});
			return;
		}

		let PushedTotal = 0;

		for (const Entry of Changed) {
			try {
				const Uri = Entry?.uri;
				const RawMarkers: unknown[] = Array.isArray(Entry?.markers)
					? Entry.markers
					: [];
				if (!Uri) continue;

				const RealUri =
					typeof Uri === "string"
						? URICtor.parse(Uri)
						: Uri && typeof (Uri as any).with === "function"
							? Uri
							: URICtor.from(Uri);

				// Revive relatedInformation resource URIs before passing to
				// IMarkerService so MarkersView can render related-info links.
				const FinalMarkers = RawMarkers.map((M: any) => {
					if (
						!M ||
						typeof M !== "object" ||
						!Array.isArray(M.relatedInformation)
					)
						return M;
					return {
						...M,
						relatedInformation: ReviveRelatedInformation(
							M.relatedInformation,
							URICtor,
						),
					};
				});

				Markers.changeOne(Owner, RealUri, FinalMarkers);
				PushedTotal += FinalMarkers.length;
			} catch {
				// Swallow - one bad entry must not stop the rest.
			}
		}

		if (PushedTotal === 0) return;

		// Open the Problems panel if it is not currently visible so that
		// MarkersView.reInitialize() bulk-reads the stored markers. This is
		// required on EVERY batch where the panel is closed, not just the
		// first - a language server that activates after the first batch
		// (e.g. rust-analyzer starting after TypeScript) would otherwise
		// never populate the panel.
		const Now = Date.now();
		if (Now - LastOpenViewMs < OpenViewThrottleMs) return;

		const ViewsSvc = (Services as any)?.Views;
		if (typeof ViewsSvc?.openView !== "function") return;

		// Skip openView when the panel is already visible - the active
		// onMarkerChanged subscription inside onVisibleDisposables handles
		// incremental updates automatically.
		const Existing =
			typeof ViewsSvc?.getViewWithId === "function"
				? (ViewsSvc.getViewWithId(
						"workbench.panel.markers.view",
					) as any)
				: null;
		if (Existing?.isVisible?.() === true) return;

		LastOpenViewMs = Now;

		void (
			ViewsSvc.openView(
				"workbench.panel.markers.view",
				false,
			) as Promise<any>
		)
			?.then?.((View: any) => {
				// Clear the persisted activeFile filter (stored in Memento
				// across sessions) which causes "count shows but panel empty"
				// when the user had toggled "Filter by Active File" in a
				// previous session.
				if (View?.filters?.activeFile === true) {
					View.filters.activeFile = false;
				}
				// Log for diagnostics - now runs per-batch not just once.
				const Stats = View?.getFilterStats?.() as
					| { total: number; filtered: number }
					| undefined;
				Invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"markers-bridge",
						`open-panel owner=${Owner} uris=${Changed.length} pushed=${PushedTotal} filterTotal=${Stats?.total ?? "?"} filterFiltered=${Stats?.filtered ?? "?"} activeFileCleared=${View?.filters?.activeFile === false}`,
					],
				}).catch(() => {});
			})
			?.catch?.(() => {});
	});
};
