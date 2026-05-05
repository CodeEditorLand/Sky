/**
 * Statusbar bridge: routes the four `sky://statusbar/{update,set-entry,
 * dispose,dispose-entry}` channels into the workbench's
 * `IStatusbarService`. Maintains a per-handle accessor map so updates
 * after the initial `addEntry` reuse the same accessor (stock VS Code
 * mutates the entry through the accessor handle, not by re-adding).
 *
 * Alignment mapping follows VS Code's `StatusbarAlignment` enum
 * (LEFT=0, RIGHT=1) - we accept both string and numeric forms because
 * extensions supply whichever their `vscode.d.ts` happened to type.
 *
 * `SetOrUpdateEntry` is also returned so the dead-channel
 * `sky://statusbar/create` listener can call into the same path; that
 * channel previously just dispatched a DOM event without touching
 * `IStatusbarService`, so first-time entries never appeared in the
 * native bar.
 */
type StatusbarEntry = {
	name: string;
	text: string;
	tooltip: unknown;
	command: unknown;
	ariaLabel: string;
	role: unknown;
	backgroundColor: unknown;
	color: unknown;
};
interface StatusbarAccessor {
	update(Entry: StatusbarEntry): void;
	dispose(): void;
}
interface StatusbarService {
	addEntry(
		Entry: StatusbarEntry,
		Id: string,
		Alignment: number,
		Priority?: number,
	): StatusbarAccessor;
}
interface ServicesProbe {
	Statusbar?: StatusbarService;
}

export default async (Dependencies: {
	Register: (
		Channel: string,
		Handler: (Payload: any) => void,
	) => Promise<void>;
	GetServices: () => ServicesProbe | null;
}): Promise<{ SetOrUpdateEntry: (Payload: any) => void }> => {
	const { Register, GetServices } = Dependencies;
	const StatusbarAccessors = new Map<string, StatusbarAccessor>();
	const BuildEntry = (Payload: any): StatusbarEntry => ({
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
	const SetOrUpdateEntry = (Payload: any): void => {
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
	const DisposeEntry = (Payload: any): void => {
		const Id = String(
			Payload?.id ?? Payload?.handle ?? Payload?.entryId ?? "",
		);
		if (!Id) return;
		const Accessor = StatusbarAccessors.get(Id);
		if (Accessor) {
			try {
				Accessor.dispose();
			} catch {
				/* swallow */
			}
			StatusbarAccessors.delete(Id);
		}
	};
	await Register("sky://statusbar/update", SetOrUpdateEntry);
	await Register("sky://statusbar/set-entry", SetOrUpdateEntry);
	await Register("sky://statusbar/dispose", DisposeEntry);
	await Register("sky://statusbar/dispose-entry", DisposeEntry);
	return { SetOrUpdateEntry };
};
