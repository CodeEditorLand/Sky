/**
 * @module Bridge/InstallInlineCompletions
 *
 * Registers a Land-specific `InlineCompletionsProvider` with Monaco's
 * `ILanguageFeaturesService.inlineCompletionsProvider`. When Monaco requests
 * ghost text (e.g. for GitHub Copilot, Roo inline suggestions), this provider
 * forwards the request to Mountain via `MountainIPCInvoke` → Mountain's
 * `ProvideInlineCompletionItems` gRPC handler → Cocoon's registered providers.
 *
 * B4 (Anchor session) added the full Vine.proto + FeatureMethods pipeline on
 * the Mountain/Cocoon side. This module wires the Sky/Monaco side so the
 * workbench actually calls Mountain when inline completions are needed.
 *
 * Registered for all languages (`*`) via a wildcard selector matching the
 * pattern used by VS Code's own `MainThreadLanguageFeatures` when an extension
 * registers a provider via `vscode.languages.registerInlineCompletionItemProvider`.
 */

export default async (Dependencies: {
	GetServices: () => Record<string, unknown> | null;
	Invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}): Promise<void> => {
	const { GetServices, Invoke } = Dependencies;

	// Retry acquiring the LanguageFeatures service - it may not be ready at
	// the initial `cel:services-ready` event if the workbench DI container
	// hasn't fully resolved all singletons yet (observed in bundled profile
	// on cold start).
	const MaxAttempts = 10;
	const RetryDelayMs = 200;

	for (let Attempt = 0; Attempt < MaxAttempts; Attempt++) {
		const Services = GetServices();
		const LanguageFeatures = (Services as any)?.LanguageFeatures;

		if (!LanguageFeatures?.inlineCompletionsProvider?.register) {
			if (Attempt < MaxAttempts - 1) {
				await new Promise<void>((Resolve) =>
					setTimeout(Resolve, RetryDelayMs),
				);
				continue;
			}
			// Give up silently - inline completions won't work in this session
			// but the workbench boot is not affected.
			return;
		}

		// Wildcard selector: match every language so every extension's
		// registered inline completion provider is reachable regardless of
		// which language is active. VS Code's workbench uses the same pattern
		// internally for Copilot's `InlineCompletionItem` bridge.
		const Selector = { language: "*", exclusive: false };

		try {
			LanguageFeatures.inlineCompletionsProvider.register(Selector, {
				/**
				 * Called by Monaco when the cursor is idle and inline ghost
				 * text should be shown. Forwards to Mountain which dispatches
				 * to the Cocoon-side registered provider(s).
				 */
				async provideInlineCompletions(
					Model: unknown,
					Position: unknown,
					_Context: unknown,
					_Token: unknown,
				) {
					const Uri =
						(Model as any)?.uri?.toString?.() ??
						(Model as any)?.uri ??
						"";
					const Line = ((Position as any)?.lineNumber ?? 1) - 1; // 0-based
					const Character = ((Position as any)?.column ?? 1) - 1; // 0-based

					if (!Uri) return { items: [] };

					try {
						const Response = (await Invoke("MountainIPCInvoke", {
							method: "language:provideInlineCompletions",
							params: [
								{
									uri: Uri,
									position: {
										line: Line,
										character: Character,
									},
									context: {
										triggerKind:
											(_Context as any)?.triggerKind ?? 0,
										selectedSuggestionInfo: (
											_Context as any
										)?.selectedSuggestionInfo,
									},
								},
							],
						})) as { items?: unknown[] } | null | undefined;

						const RawItems = Array.isArray(Response?.items)
							? (Response!.items as any[])
							: [];

						const Items = RawItems.map((Item: any) => ({
							insertText:
								typeof Item?.insertText === "string"
									? { snippet: Item.insertText }
									: typeof Item?.text === "string"
										? { snippet: Item.text }
										: { snippet: "" },
							range: Item?.range,
							command: Item?.command,
							completeBracketPairs: false,
						}));

						return { items: Items };
					} catch {
						return { items: [] };
					}
				},

				freeInlineCompletions(_Completions: unknown) {
					// No-op: items are plain objects with no external refs.
				},

				handleItemDidShow(
					_Completions: unknown,
					_Item: unknown,
					_InsertText: unknown,
				) {
					// No-op: telemetry only.
				},

				handlePartialAccept(
					_Completions: unknown,
					_Item: unknown,
					_AcceptedCharacters: unknown,
					_Info: unknown,
				) {
					// No-op.
				},
			});
		} catch {
			// Registration may throw if the service is in a torn-down state
			// (e.g. during extension host restart). Swallow silently.
		}

		break;
	}
};
