/**
 * Local mirror of Mountain's output-channel registry. Sky listens to
 * the `sky://output/*` event family and accumulates channel content
 * here as a snapshot. The actual Output panel paint now goes through
 * `__CEL_SERVICES__.Output?.getChannel(id)?.append(text)` (the real
 * `IOutputService` exposed in `Service/CEL/Expose/Accessor.ts`) -
 * see `InstallEditorAndOutput.ts`'s `sky://output/append` handler.
 * This map remains as a snapshot any bridge or test can read.
 *
 * Returned bag exposes the underlying map plus a `GetOrCreate`
 * factory that announces channel creation through the workbench
 * `workbench.action.output.show` command (best-effort: the command
 * may not exist before the output panel is registered, in which
 * case the catch-all swallows it). Single factory call per install
 * so all output handlers share one mirror.
 */
export default (
	GetWorkbench: () => {
		commands: { executeCommand: (id: string) => unknown };
	} | null,
): {

	Channels: Map<string, string[]>;

	GetOrCreate: (Id: string, Name?: string) => string[];
} => {

	const Channels = new Map<string, string[]>();

	const GetOrCreate = (Id: string, Name?: string): string[] => {
		if (!Channels.has(Id)) {
			Channels.set(Id, []);

			const Wb = GetWorkbench();

			if (Wb && Name) {
				// `executeCommand` returns a Thenable; `.catch` may be
				// absent on minimal Thenable shapes, so call it
				// defensively and ignore the absent-handler case.
				const ShowResult = Wb.commands.executeCommand(
					"workbench.action.output.show",
				) as { catch?: (handler: () => unknown) => unknown };

				ShowResult.catch?.(() => undefined);
			}
		}

		return Channels.get(Id)!;
	};

	return { Channels, GetOrCreate };
};
