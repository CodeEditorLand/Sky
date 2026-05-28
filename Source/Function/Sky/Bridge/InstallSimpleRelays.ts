/**
 * Compact installer for the long tail of Mountain → Sky channels that
 * map 1:1 to a DOM `cel:*` CustomEvent and have no further routing
 * logic. Splitting each into its own file would multiply tiny 5-line
 * modules without improving readability; grouping them keeps the
 * "no real workbench-service hookup" channels in one place.
 *
 * Covers:
 *   - `sky://notification/{show,progress-begin,progress-update,progress-end}`
 *   - `sky://quickpick/show` + `sky://input-box/show` + `sky://dialog/{open,save}`
 *   - `sky://lifecycle/{willShutdown,phaseChanged}`
 *   - `sky://statusbar/set-message`
 *   - `sky://languages/setDocumentLanguage` + `sky://language/configure`
 *
 * Phase-change extracts a normalised `phase` int from the payload
 * (Mountain has historically emitted phases as a bare number, an
 * `{ phase }` object, or a `{ Phase }` object depending on the
 * effect dispatcher); the consumer always reads `Detail.phase`.
 */
type Handler = (Payload: any) => void;

const SimpleRelay = (DomEventName: string): Handler => {
	return (Payload: any): void => {
		document.dispatchEvent(
			new CustomEvent(DomEventName, { detail: Payload }),
		);
	};
};

const PhaseRelay: Handler = (Payload: any): void => {
	const Phase =
		typeof Payload === "number"
			? Payload
			: typeof Payload?.phase === "number"
				? Payload.phase
				: typeof Payload?.Phase === "number"
					? Payload.Phase
					: 0;

	document.dispatchEvent(
		new CustomEvent("cel:lifecycle:phaseChanged", {
			detail: { phase: Phase },
		}),
	);
};

// Map a Cocoon-side severity string to VS Code's `Severity` enum value
// (`Ignore=0`, `Info=1`, `Warning=2`, `Error=3`). INotificationService's
// `notify(notification)` reads the `severity` field as a number; passing a
// string makes the workbench fall back to `Info` and silently drops the
// `error`/`warning` styling we want for `showErrorMessage` calls.
const SeverityFromString = (Raw: unknown): number => {
	if (typeof Raw === "number") return Raw;

	const Str = String(Raw ?? "").toLowerCase();

	if (Str === "error") return 3;

	if (Str === "warning" || Str === "warn") return 2;

	return 1;
};

const NotificationShowHandler: Handler = (Payload: any): void => {
	document.dispatchEvent(
		new CustomEvent("cel:notification:show", { detail: Payload }),
	);

	// Drive the live workbench toast directly so extensions that call
	// `vscode.window.showInformationMessage(...)` without action buttons
	// actually surface a notification - the prior CustomEvent-only relay
	// reached no UI surface in production.
	try {
		const Svc = (globalThis as any).__CEL_SERVICES__?.Notification;

		if (!Svc) return;

		const Severity = SeverityFromString(
			Payload?.severity ?? Payload?.Severity,
		);

		const Message = String(
			Payload?.message ?? Payload?.Message ?? Payload?.text ?? "",
		);

		if (!Message) return;

		Svc.notify?.({
			severity: Severity,
			message: Message,
			source: Payload?.source ?? Payload?.extension ?? undefined,
			silent: Payload?.silent === true,
			sticky: Payload?.sticky === true,
		});
	} catch {
		/* swallow - notification service may not be live yet */
	}
};

const Relays: Array<readonly [string, Handler]> = [
	["sky://notification/show", NotificationShowHandler],

	[
		"sky://notification/progress-begin",

		SimpleRelay("cel:notification:progress-begin"),
	],

	[
		"sky://notification/progress-update",

		SimpleRelay("cel:notification:progress-update"),
	],

	[
		"sky://notification/progress-end",

		SimpleRelay("cel:notification:progress-end"),
	],

	["sky://quickpick/show", SimpleRelay("cel:quickpick:show")],

	["sky://input-box/show", SimpleRelay("cel:input-box:show")],

	["sky://dialog/open", SimpleRelay("cel:dialog:open")],

	["sky://dialog/save", SimpleRelay("cel:dialog:save")],

	["sky://lifecycle/willShutdown", SimpleRelay("cel:lifecycle:willShutdown")],

	["sky://lifecycle/phaseChanged", PhaseRelay],

	["sky://statusbar/set-message", SimpleRelay("cel:statusbar:set-message")],

	// `sky://languages/setDocumentLanguage` - Cocoon called
	// `vscode.languages.setTextDocumentLanguage(doc, lang)`. Relay as a
	// CustomEvent for any subscriber AND swap the live Monaco model's
	// language directly so highlighting / tokenisation switch in place
	// without re-opening the file.
	[
		"sky://languages/setDocumentLanguage",

		(Payload: any): void => {
			document.dispatchEvent(
				new CustomEvent("cel:languages:setDocumentLanguage", {
					detail: Payload,
				}),
			);

			try {
				const Services = (globalThis as any).__CEL_SERVICES__;

				const Monaco =
					(globalThis as any).monaco ?? (window as any).monaco;

				const Uri = String(Payload?.uri ?? "");

				const Language = String(
					Payload?.languageId ?? Payload?.language ?? "",
				);

				if (!Uri || !Language) return;

				const ParsedUri =
					Services?.URI && typeof Services.URI.parse === "function"
						? Services.URI.parse(Uri)
						: null;

				const Model = (() => {
					try {
						if (
							ParsedUri &&
							typeof Services?.Models?.getModel === "function"
						)
							return Services.Models.getModel(ParsedUri);

						if (Monaco?.editor?.getModel && ParsedUri)
							return Monaco.editor.getModel(ParsedUri);
					} catch {}

					return null;
				})();

				if (Model && Monaco?.editor?.setModelLanguage) {
					Monaco.editor.setModelLanguage(Model, Language);
				}
			} catch {
				/* swallow - Monaco / model may not be ready */
			}
		},
	],

	// `sky://tree-view/reveal` - extension called `treeView.reveal(element)`.
	// Opens and focuses the specified tree view panel in the workbench.
	[
		"sky://tree-view/reveal",

		({ viewId }: any): void => {
			if (!viewId) return;

			document.dispatchEvent(
				new CustomEvent("cel:tree-view:reveal", { detail: { viewId } }),
			);

			try {
				const Views = (globalThis as any).__CEL_SERVICES__?.Views;

				if (typeof Views?.openView === "function") {
					Views.openView(viewId);
				}
			} catch {
				/* workbench may not be ready yet */
			}
		},
	],

	// `sky://language/configure` - Cocoon called `vscode.languages.setLanguageConfiguration`.
	// Relay as DOM event AND directly call Monaco's API so bracket-matching,
	// auto-indent, and comment-toggling work for the configured language.
	[
		"sky://language/configure",

		(Payload: any): void => {
			document.dispatchEvent(
				new CustomEvent("cel:language:configure", { detail: Payload }),
			);

			try {
				const MonacoGlobal =
					(globalThis as any).monaco ?? (window as any).monaco;

				const LanguageId: string =
					Payload?.language ?? Payload?.languageId ?? "";

				const Config = Payload?.configuration ?? Payload;

				if (MonacoGlobal?.languages && LanguageId && Config) {
					MonacoGlobal.languages.setLanguageConfiguration(
						LanguageId,

						Config,
					);
				}
			} catch {
				/* Monaco may not be available yet */
			}
		},
	],
];

export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;
}): Promise<void> => {
	const { Register } = Dependencies;

	for (const [Channel, Handle] of Relays) {
		await Register(Channel, Handle);
	}
};
