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
			changeOne(
				owner: string,
				uri: unknown,
				markers: unknown[],
			): void;
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
	Invoke: (
		cmd: string,
		args?: Record<string, unknown>,
	) => Promise<unknown>;
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
		// One-time success-path confirmation. Also checks the Problems panel
		// view filter state and clears `activeFile` if it was left on, which
		// causes "count shows but panel empty" - the status bar reads from
		// IMarkerService (unfiltered) while the panel reads from
		// IMarkersView.filteredGroups which respects the activeFile toggle.
		if (!MarkersBridgeFirstSuccessLogged && PushedTotal > 0) {
			MarkersBridgeFirstSuccessLogged = true;

			// Read back from IMarkerService to confirm markers are stored.
			const AllStored =
				(Markers.read as (...args: unknown[]) => unknown[])?.() ?? [];

			// Check the Problems panel view filter state. `getViewWithId`
			// returns the view regardless of whether it's currently focused;
			// if the panel is open, the view instance exists. Clear
			// `activeFile` if it was on so all markers are visible, not just
			// the active file's.
			try {
				const ViewsSvc = (Services as any)?.Views;
				const MarkersView = ViewsSvc?.getViewWithId?.(
					"workbench.panel.markers.view",
				) as any;
				const FilterStats = MarkersView?.getFilterStats?.() as
					| { total: number; filtered: number }
					| undefined;
				const ActiveFileWasOn =
					MarkersView?.filters?.activeFile === true;
				if (ActiveFileWasOn) {
					MarkersView.filters.activeFile = false;
				}
				Invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"markers-bridge",
						`first-push owner=${Owner} uris=${Changed.length} markers=${PushedTotal} stored=${AllStored.length} firstUri=${FirstUri.slice(0, 200)} firstSeverity=${FirstSeverity ?? "?"} firstMsgLen=${FirstMessageLength} filterTotal=${FilterStats?.total ?? "?"} filterFiltered=${FilterStats?.filtered ?? "?"} activeFileCleared=${ActiveFileWasOn}`,
					],
				}).catch(() => {});
			} catch {
				Invoke("MountainIPCInvoke", {
					method: "diagnostic:log",
					params: [
						"markers-bridge",
						`first-push owner=${Owner} uris=${Changed.length} markers=${PushedTotal} stored=${AllStored.length} firstUri=${FirstUri.slice(0, 200)} firstSeverity=${FirstSeverity ?? "?"} firstMsgLen=${FirstMessageLength}`,
					],
				}).catch(() => {});
			}
		}
	});
};
