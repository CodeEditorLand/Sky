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

const Relays: Array<readonly [string, Handler]> = [
	["sky://notification/show", SimpleRelay("cel:notification:show")],
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
	[
		"sky://languages/setDocumentLanguage",
		SimpleRelay("cel:languages:setDocumentLanguage"),
	],
	["sky://language/configure", SimpleRelay("cel:language:configure")],
];

export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;
}): Promise<void> => {
	const { Register } = Dependencies;
	for (const [Channel, Handle] of Relays) {
		await Register(Channel, Handle);
	}
};
