/**
 * @module Workbench/Electron/ExtensionChangeSubscriber
 * @description
 * Subscribes to Mountain's `sky://extensions/installed` + `…/uninstalled`
 * events and forwards each change to the VS Code workbench's extension
 * registry so the sidebar refreshes live after a VSIX install/uninstall —
 * no workbench reload required.
 *
 * Design note: Wind exposes the merged typed stream as
 * `Effect/Extensions/ChangeStream.ts` (wave 6). This subscriber is a
 * fire-and-forget adapter that:
 *
 *   1. Builds the stream from Wind's IPC layer.
 *   2. Runs it forever on an Effect.runFork so the boot path never
 *      blocks on a stream that by definition never completes.
 *   3. On each item, logs a performance.mark + attempts to call the
 *      bundled workbench's `ExtensionEnablementService` refresh hook
 *      when available. The hook isn't always present (browser / kernel
 *      profiles omit it); when missing we just log and move on.
 *
 * No-op when `LAND_ENABLE_WIND === "false"` — if the Wind runtime is
 * not loaded there's no IPC to subscribe to.
 */

interface ExtensionChangeBase {
	readonly Kind: "Installed" | "Uninstalled";
	readonly Identifier: string;
}

interface WorkbenchRefreshHost {
	readonly _servicesAccess?: {
		readonly get?: (
			Key: unknown,
		) => { readonly refresh?: () => void | Promise<void> } | undefined;
	};
}

const TryRefreshWorkbench = (Change: ExtensionChangeBase): void => {
	performance.mark(
		`land:extensions:${Change.Kind.toLowerCase()}:${Change.Identifier}`,
	);

	const Host = (
		globalThis as unknown as { readonly __landWorkbench?: WorkbenchRefreshHost }
	).__landWorkbench;

	const RefreshFn = Host?._servicesAccess?.get?.(
		"extensionEnablementService",
	)?.refresh;

	if (typeof RefreshFn === "function") {
		try {
			void RefreshFn();
		} catch {
			// Best-effort only — the workbench will self-heal on next render.
		}
	}
};

export default async (): Promise<void> => {
	if (import.meta.env["LAND_ENABLE_WIND"] === "false") {
		performance.mark("land:extensions:subscriber:skipped-wind-disabled");
		return;
	}

	try {
		const Stream = (await import(
			"@codeeditorland/wind/Target/Effect/Extensions/ChangeStream"
		)) as {
			readonly default: unknown;
		};

		const { Effect, Stream: EffectStream } = await import("effect");

		const Subscription = Effect.gen(function* () {
			const Source = (yield* Stream.default as never) as unknown as {
				readonly pipe: (
					..._: unknown[]
				) => unknown;
			};

			yield* EffectStream.runForEach(Source, (Change) =>
				Effect.sync(() =>
					TryRefreshWorkbench(Change as ExtensionChangeBase),
				),
			);
		});

		// Fire-and-forget — the stream runs until the webview unloads.
		Effect.runFork(Subscription as never);

		performance.mark("land:extensions:subscriber:started");
	} catch {
		performance.mark("land:extensions:subscriber:error");
	}
};
