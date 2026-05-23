/**
 * @module Bridge/InstallDiagnostics
 *
 * ---- Diagnostics → IMarkerService bridge ----
 *
 * Mountain emits `sky://diagnostics/changed` after each `Diagnostic.Set`
 * from Cocoon's `vscode.languages.createDiagnosticCollection().set(...)`.
 * We translate per-URI marker arrays into `IMarkerService.changeOne(owner,
 * URI, markers)` calls. `Markers.changeOne` REPLACES the marker set for
 * that URI under the given owner - matching VS Code's `MainThreadDiagnostics`
 * behaviour where each `set()` call overwrites the previous diagnostic state.
 *
 * ## How VS Code's Problems panel works (do not change this)
 *
 * - `IMarkerService.changeOne()` stores markers and fires `onMarkerChanged`
 * - The Problems panel (`MarkersView`) subscribes to `onMarkerChanged` when
 *   it is visible, and calls `reInitialize()` (bulk-read from IMarkerService)
 *   when it first becomes visible
 * - The status bar badge reads from `IMarkerService.read()` directly
 * - This is ad-hoc and reactive - we never force the panel open
 *
 * The only additional thing we do: if the panel is already open and the
 * persisted `activeFile` filter (stored in Memento across sessions) is on,
 * clear it so all markers are visible. This mirrors what VS Code's own
 * MainThreadDiagnostics does when diagnostics first arrive.
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
		[key: string]: unknown;
	} | null;
	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { Register, GetServices, Invoke } = Dependencies;

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

				// Revive relatedInformation resource URIs so MarkersView
				// label service can render related-info links.
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
			} catch {
				// Swallow - one bad entry must not stop the rest.
			}
		}
	});
};
