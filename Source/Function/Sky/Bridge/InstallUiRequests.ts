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

		actions?: string[],

		onAction?: (label: string | null) => void,
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

			// Prefer INotificationService for proper VS Code notification
			// toasts with clickable action buttons.
			const NotificationSvc = (globalThis as any).__CEL_SERVICES__
				?.Notification;

			if (
				NotificationSvc &&
				typeof NotificationSvc.notify === "function"
			) {
				try {
					const SeverityEnum: Record<string, number> = {
						info: 1,
						warn: 2,
						warning: 2,
						error: 3,
					};

					const Level = SeverityEnum[Severity.toLowerCase()] ?? 1;

					const RequestId = RawPayload.RequestIdentifier;

					let Resolved = false;

					let FallbackTimer: number | undefined;

					const ResolveOnce = (Title: string | null) => {
						if (Resolved) return;

						Resolved = true;

						if (FallbackTimer !== undefined) {
							window.clearTimeout(FallbackTimer);
						}

						void ResolveUiRequest(RequestId, Title);
					};

					NotificationSvc.notify({
						severity: Level,
						message: Message,
						actions: {
							primary: Actions.map((A: { title: string }) => ({
								id: `cel-msg-action-${A.title}`,
								label: A.title,
								tooltip: A.title,
								class: undefined,
								enabled: true,
								checked: false,
								run: () => ResolveOnce(A.title),
							})),
						},
					});

					// Timeout fallback - if the toast is dismissed without
					// clicking a button, resolve null after 60 s so Mountain
					// doesn't hang. Cleared inside ResolveOnce when a button
					// click resolves first.
					FallbackTimer = window.setTimeout(
						() => ResolveOnce(null),

						60_000,
					);

					return;
				} catch {
					// Fall through to prompt fallback
				}
			}

			// Prompt fallback
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

			const Options = Payload ?? {};

			// Prefer IQuickInputService.createInputBox() for a native VS Code
			// input box experience. Falls back to window.prompt() when the
			// workbench service isn't available yet.
			const QI = (globalThis as any).__CEL_SERVICES__?.QuickInput;

			if (QI && typeof QI.createInputBox === "function") {
				try {
					const IB = QI.createInputBox();

					IB.placeholder =
						Options?.Prompt ??
						Options?.PlaceHolder ??
						Options?.prompt ??
						Options?.placeHolder ??
						"";

					IB.prompt =
						Options?.Prompt ?? Options?.prompt ?? IB.placeholder;

					IB.value = Options?.Value ?? Options?.value ?? "";

					IB.password = !!(Options?.Password ?? Options?.password);

					IB.title = Options?.Title ?? Options?.title ?? "";

					IB.step = Options?.Step ?? Options?.step;

					IB.totalSteps = Options?.TotalSteps ?? Options?.totalSteps;

					IB.ignoreFocusOut = !!(
						Options?.IgnoreFocusOut ?? Options?.ignoreFocusOut
					);

					let Resolved = false;

					const Resolve = (Value: string | undefined) => {
						if (Resolved) return;

						Resolved = true;

						IB.dispose();

						void ResolveUiRequest(RequestIdentifier, Value);
					};

					IB.onDidAccept(() => Resolve(IB.value));

					IB.onDidHide(() => Resolve(undefined));

					IB.show();

					return;
				} catch {
					// Fall through to window.prompt()
				}
			}

			// DOM fallback
			const Answer = window.prompt(
				Options?.Prompt ??
					Options?.PlaceHolder ??
					Options?.prompt ??
					Options?.placeHolder ??
					"",

				Options?.Value ?? Options?.value ?? "",
			);

			void ResolveUiRequest(
				RequestIdentifier,

				Answer === null ? undefined : Answer,
			);
		},
	);

	await Register(
		"sky://ui/show-quick-pick-request",

		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;

			const Items = Payload?.Items ?? Payload?.items ?? [];

			const Options = Payload?.Options ?? Payload?.options ?? {};

			// Prefer IQuickInputService.createQuickPick() so the native VS Code
			// quick-pick widget renders (keyboard nav, fuzzy-match, theming).
			// Fall back to the existing CustomEvent+DOM path when unavailable.
			const QI = (globalThis as any).__CEL_SERVICES__?.QuickInput;

			if (QI && typeof QI.createQuickPick === "function") {
				try {
					const Picker = QI.createQuickPick();

					Picker.placeholder =
						Options?.PlaceHolder ??
						Options?.placeHolder ??
						Options?.Placeholder ??
						"";

					Picker.title = Options?.Title ?? Options?.title ?? "";

					Picker.step = Options?.Step ?? Options?.step;

					Picker.totalSteps =
						Options?.TotalSteps ?? Options?.totalSteps;

					Picker.matchOnDescription = !!(
						Options?.MatchOnDescription ??
						Options?.matchOnDescription
					);

					Picker.matchOnDetail = !!(
						Options?.MatchOnDetail ?? Options?.matchOnDetail
					);

					Picker.canSelectMany = !!(
						Options?.CanPickMany ?? Options?.canPickMany
					);

					Picker.ignoreFocusOut = !!(
						Options?.IgnoreFocusOut ?? Options?.ignoreFocusOut
					);

					// Normalise items to the shape IQuickInputService expects.
					Picker.items = (Array.isArray(Items) ? Items : []).map(
						(Item: any) => ({
							label:
								typeof Item === "string"
									? Item
									: (Item?.label ?? ""),
							description: Item?.description,
							detail: Item?.detail,
							picked: !!Item?.picked,
							alwaysShow: !!Item?.alwaysShow,
						}),
					);

					let Resolved = false;

					const Resolve = (Value: unknown) => {
						if (Resolved) return;

						Resolved = true;

						Picker.dispose();

						void ResolveUiRequest(RequestIdentifier, Value);
					};

					Picker.onDidAccept(() => {
						const Sel = Picker.canSelectMany
							? Picker.selectedItems
							: (Picker.selectedItems[0] ?? null);

						Resolve(Sel);
					});

					Picker.onDidHide(() => Resolve(null));

					Picker.show();

					return;
				} catch {
					// Fall through to CustomEvent path
				}
			}

			// CustomEvent path - existing behaviour
			document.dispatchEvent(
				new CustomEvent("cel:quickpick:show", {
					detail: { RequestIdentifier, Items, Options },
				}),
			);

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

	// Message box with explicit actions. Prefer INotificationService so
	// workbench-rendered toasts with clickable buttons resolve the round-trip.
	// Falls back to ShowNotification (DOM toast) which now accepts an
	// OnAction callback, then ultimately to window.confirm/prompt.
	await Register(
		"sky://ui/show-message-with-actions-request",

		({ RequestIdentifier, Payload }: any) => {
			if (!RequestIdentifier) return;

			const Message = Payload?.Message ?? Payload?.message ?? "";

			const Severity = Payload?.Severity ?? Payload?.severity ?? "info";

			const Actions: Array<{ title: string }> =
				Payload?.Actions ?? Payload?.actions ?? [];

			const RequestId = RequestIdentifier;

			let Resolved = false;

			let FallbackTimer: number | undefined;

			const ResolveOnce = (Picked: string | null) => {
				if (Resolved) return;

				Resolved = true;

				if (FallbackTimer !== undefined) {
					window.clearTimeout(FallbackTimer);
				}

				void ResolveUiRequest(RequestId, Picked);
			};

			if (Actions.length === 0) {
				// No buttons - just show and resolve null immediately.
				ShowNotification(Severity, Message, []);

				ResolveOnce(null);

				return;
			}

			// Tier 1: INotificationService.notify() with action callbacks.
			const NotificationSvc = (globalThis as any).__CEL_SERVICES__
				?.Notification;

			if (
				NotificationSvc &&
				typeof NotificationSvc.notify === "function"
			) {
				try {
					const SeverityEnum: Record<string, number> = {
						info: 1,
						warn: 2,
						warning: 2,
						error: 3,
					};

					const Level = SeverityEnum[Severity.toLowerCase()] ?? 1;

					NotificationSvc.notify({
						severity: Level,
						message: Message,
						actions: {
							primary: Actions.map((A: { title: string }) => ({
								id: `cel-mwa-action-${A.title}`,
								label: A.title,
								tooltip: A.title,
								class: undefined,
								enabled: true,
								checked: false,
								run: () => ResolveOnce(A.title),
							})),
						},
					});

					FallbackTimer = window.setTimeout(
						() => ResolveOnce(null),

						60_000,
					);

					return;
				} catch {
					// Fall through to DOM toast
				}
			}

			// Tier 2: DOM toast with OnAction callback so button clicks
			// still resolve the Mountain oneshot.
			ShowNotification(
				Severity,

				Message,

				Actions.map((A) => A.title),

				(Label) => ResolveOnce(Label),
			);
		},
	);
};
