/**
 * @module Bridge/InstallUiRequests
 *
 * ---- UI dialogs / notifications ----
 *
 * Handles the four Mountain-emitted request channels that require a
 * `ResolveUIRequest` round-trip back to Mountain:
 *
 *   sky://ui/show-message-request         - showInformationMessage / showWarning…
 *   sky://ui/show-input-box-request       - showInputBox (window.prompt fallback)
 *   sky://ui/show-quick-pick-request      - showQuickPick (DOM event + fallback)
 *   sky://ui/show-message-with-actions-request - showMessage with explicit actions
 *
 * Mountain emits these and then waits on a oneshot keyed by
 * `RequestIdentifier`. We MUST send back a `ResolveUIRequest`
 * invocation with the exact same identifier or the 300s timeout in
 * `UserInterfaceProvider` fires.
 */

export default async (Dependencies: {
	Register: (
		Channel: string,
		Handler: (Payload: any) => void,
	) => Promise<void>;
	ShowNotification: (
		severity: string,
		message: string,
		actions?: unknown,
	) => void;
	ResolveUiRequest: (
		RequestIdentifier: string,
		Result: unknown,
	) => Promise<void>;
}): Promise<void> => {
	const { Register, ShowNotification, ResolveUiRequest } = Dependencies;

	// Atom Q1: Mountain emits this for *every* showMessage call regardless
	// of whether actions are provided. Two shapes land here:
	//   Legacy/passive : { severity, message, actions }
	//   Promise/pending: { RequestIdentifier, Payload: { Severity, Message, Options } }
	// The Promise shape carries a RequestIdentifier; the resolve path mirrors
	// the quick-pick / input-box flow.
	await Register("sky://ui/show-message-request", (RawPayload: any) => {
		if (RawPayload?.RequestIdentifier) {
			const Inner = RawPayload.Payload ?? {};
			const Severity = Inner?.Severity ?? Inner?.severity ?? "info";
			const Message = Inner?.Message ?? Inner?.message ?? "";
			const Options = Inner?.Options ?? Inner?.options ?? {};
			const Actions: Array<{ title: string }> = Array.isArray(
				Options?.Actions ?? Options?.actions,
			)
				? (Options?.Actions ?? Options?.actions)
				: [];
			if (Actions.length === 0) {
				ShowNotification(Severity, Message, []);
				void ResolveUiRequest(RawPayload.RequestIdentifier, null);
				return;
			}
			let Picked: string | null = null;
			if (Actions.length === 1) {
				if (
					window.confirm(`${Message}

(${Actions[0].title})`)
				) {
					Picked = Actions[0].title;
				}
			} else {
				const Choice = window.prompt(
					`${Message}

Choose: ${Actions.map((A) => A.title).join(" / ")}`,
					Actions[0].title,
				);
				if (Choice && Actions.some((A) => A.title === Choice)) {
					Picked = Choice;
				}
			}
			void ResolveUiRequest(RawPayload.RequestIdentifier, Picked);
			return;
		}
		// Legacy passive shape - still used by telemetry / toast channels.
		ShowNotification(
			RawPayload?.severity ?? "info",
			RawPayload?.message ?? "",
			RawPayload?.actions,
		);
	});

	await Register(
		"sky://ui/show-input-box-request",
		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			// Minimal fallback - a DOM prompt is serviceable until Sky ships
			// a native input box component. Extensions receive the literal
			// string the user typed, or `null` when the user dismissed.
			const Options = Payload ?? {};
			const Answer = window.prompt(
				Options?.Prompt ??
					Options?.PlaceHolder ??
					Options?.prompt ??
					Options?.placeHolder ??
					"",
				Options?.Value ?? Options?.value ?? "",
			);
			void ResolveUiRequest(RequestIdentifier, Answer);
		},
	);

	await Register(
		"sky://ui/show-quick-pick-request",
		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			const Items = Payload?.Items ?? Payload?.items ?? [];
			const Options = Payload?.Options ?? Payload?.options ?? {};
			// Broadcast a DOM event so Sky components can render a real
			// quick-pick UI. Components call `ResolveUiRequest` themselves
			// by listening for `cel:quickpick:resolve` CustomEvents.
			document.dispatchEvent(
				new CustomEvent("cel:quickpick:show", {
					detail: { RequestIdentifier, Items, Options },
				}),
			);
			// Safety-net fallback: if no component consumes the event
			// within 30 s, resolve with the first picked label (or null
			// when no item is pre-selected). Prevents Mountain from
			// timing out on a missing UI.
			const FallbackTimer = window.setTimeout(() => {
				const PickedLabels = Array.isArray(Items)
					? Items.filter((Item: any) => Item?.picked).map(
							(Item: any) => Item?.label ?? null,
						)
					: [];
				const Fallback = Options?.canPickMany
					? PickedLabels
					: (PickedLabels[0] ?? null);
				void ResolveUiRequest(RequestIdentifier, Fallback);
			}, 30_000);
			document.addEventListener(
				"cel:quickpick:resolve",
				(Event: any) => {
					if (Event?.detail?.RequestIdentifier !== RequestIdentifier)
						return;
					window.clearTimeout(FallbackTimer);
					void ResolveUiRequest(
						RequestIdentifier,
						Event?.detail?.Result ?? null,
					);
				},
				{ once: true },
			);
		},
	);

	// Atom Q1: message box with actions. Mountain already uses this shape
	// (see `sky://ui/show-message-request` above for the notification fn);
	// when extensions pass `actions`, we must return the picked index.
	await Register(
		"sky://ui/show-message-with-actions-request",
		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;
			const Message = Payload?.Message ?? Payload?.message ?? "";
			const Actions: Array<{ title: string }> =
				Payload?.Actions ?? Payload?.actions ?? [];
			// No native chooser yet - use confirm() for a single action, or
			// prompt() with the action titles for multiple. Real UI work
			// happens downstream when Sky ships a message-box component.
			let Picked: string | null = null;
			if (Actions.length === 0) {
				window.alert(Message);
			} else if (Actions.length === 1) {
				if (
					window.confirm(`${Message}

(${Actions[0].title})`)
				) {
					Picked = Actions[0].title;
				}
			} else {
				const Choice = window.prompt(
					`${Message}

Choose: ${Actions.map((A) => A.title).join(" / ")}`,
					Actions[0].title,
				);
				if (Choice && Actions.some((A) => A.title === Choice)) {
					Picked = Choice;
				}
			}
			void ResolveUiRequest(RequestIdentifier, Picked);
		},
	);
};
