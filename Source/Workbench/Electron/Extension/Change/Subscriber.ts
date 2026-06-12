/**
 * @module Workbench/Electron/ExtensionChangeSubscriber
 * @description
 * Subscribes to Mountain's `sky://extensions/installed` + `…/uninstalled`
 * events and forwards each change to the VS Code workbench's extension
 * registry so the sidebar refreshes live after a VSIX install/uninstall -
 * no workbench reload required.
 *
 * Design note: Wind exposes the merged subscription as
 * `Effect/Extensions/ChangeStream.ts`. This subscriber is a
 * fire-and-forget adapter that:
 *
 *   1. Registers the merged install/uninstall watcher.
 *   2. Stores the returned disposable so the subscription can be torn
 *      down (and is replaced, not duplicated, if invoked twice).
 *   3. On each item, logs a performance.mark + attempts to call the
 *      bundled workbench's `ExtensionEnablementService` refresh hook
 *      when available. The hook isn't always present (browser / kernel
 *      profiles omit it); when missing we just log and move on.
 *
 * No-op when `Render === "false"` - if the Wind runtime is
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
		globalThis as unknown as {
			readonly __landWorkbench?: WorkbenchRefreshHost;
		}
	).__landWorkbench;

	const RefreshFn = Host?._servicesAccess?.get?.(
		"extensionEnablementService",
	)?.refresh;

	if (typeof RefreshFn === "function") {
		try {
			void RefreshFn();
		} catch {
			// Best-effort only - the workbench will self-heal on next render.
		}
	}
};

let ActiveSubscription: { readonly dispose: () => void } | undefined;

export default async (): Promise<void> => {
	if (import.meta.env["Render"] === "false") {
		performance.mark("land:extensions:subscriber:skipped-wind-disabled");

		return;
	}

	try {
		const { default: WatchExtensionChanges } =
			(await import("@codeeditorland/wind/Target/Effect/Extensions/ChangeStream")) as {
				readonly default: (
					Callback: (Change: ExtensionChangeBase) => void,
				) => Promise<{ readonly dispose: () => void }>;
			};

		ActiveSubscription?.dispose();

		ActiveSubscription = await WatchExtensionChanges(TryRefreshWorkbench);

		performance.mark("land:extensions:subscriber:started");
	} catch {
		performance.mark("land:extensions:subscriber:error");
	}
};
