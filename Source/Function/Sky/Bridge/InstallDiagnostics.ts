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
		};
		Views?: {
			getViewWithId?(id: string): unknown;
		};
		[key: string]: unknown;
	} | null;
	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { Register, GetServices, Invoke } = Dependencies;

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
		// One-time first-push: initialize the Problems panel and clear any
		// persisted activeFile filter.
		//
		// Root cause of "count shows but panel empty":
		//   MarkersView.reInitialize() (bulk read from IMarkerService) only
		//   fires when the panel becomes VISIBLE via onDidChangeMarkersViewVisibility.
		//   If markers arrive before the panel has ever been opened,
		//   onMarkerChanged subscriptions are inactive and updates are lost.
		//   getViewWithId returns null if the ViewPaneContainer isn't yet
		//   instantiated. openView(id, false) forces initialization without
		//   stealing focus, triggers reInitialize(), and returns the live
		//   IMarkersView so we can also clear the persisted activeFile filter
		//   (stored in Memento across sessions) which causes "count shows but
		//   panel empty" when restored as true.
		if (!MarkersBridgeFirstSuccessLogged && PushedTotal > 0) {
			MarkersBridgeFirstSuccessLogged = true;

			const AllStored =
				(Markers.read as (...args: unknown[]) => unknown[])?.() ?? [];

			try {
				const ViewsSvc = (Services as any)?.Views;
				if (typeof ViewsSvc?.openView === "function") {
					void (
						ViewsSvc.openView(
							"workbench.panel.markers.view",
							false, // reveal without stealing focus
						) as Promise<any>
					)
						?.then?.((View: any) => {
							const FilterStats = View?.getFilterStats?.() as
								| { total: number; filtered: number }
								| undefined;
							const ActiveFileWasOn =
								View?.filters?.activeFile === true;
							if (ActiveFileWasOn) {
								View.filters.activeFile = false;
							}
							Invoke("MountainIPCInvoke", {
								method: "diagnostic:log",
								params: [
									"markers-bridge",
									`first-push owner=${Owner} uris=${Changed.length} markers=${PushedTotal} stored=${AllStored.length} firstUri=${FirstUri.slice(0, 200)} firstSeverity=${FirstSeverity ?? "?"} firstMsgLen=${FirstMessageLength} filterTotal=${FilterStats?.total ?? "?"} filterFiltered=${FilterStats?.filtered ?? "?"} activeFileCleared=${ActiveFileWasOn}`,
								],
							}).catch(() => {});
						})
						?.catch?.(() => {
							Invoke("MountainIPCInvoke", {
								method: "diagnostic:log",
								params: [
									"markers-bridge",
									`first-push owner=${Owner} uris=${Changed.length} markers=${PushedTotal} stored=${AllStored.length} openView=failed`,
								],
							}).catch(() => {});
						});
				} else {
					Invoke("MountainIPCInvoke", {
						method: "diagnostic:log",
						params: [
							"markers-bridge",
							`first-push owner=${Owner} uris=${Changed.length} markers=${PushedTotal} stored=${AllStored.length} openView=unavailable`,
						],
					}).catch(() => {});
				}
			} catch {
				// non-fatal
			}
		}
	});
};
