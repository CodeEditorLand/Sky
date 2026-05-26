import { invoke } from "@tauri-apps/api/core";

/**
 * Bridges the nine Mountain → Sky channels that the audit at Batch
 * 17 caught firing into a void. Each emit was reaching the Tauri
 * event bus but Sky had no `Register("sky://...")` listener, so
 * extension surfaces (tree views, statusbar entries, debug picker,
 * configuration listeners, etc.) silently lost their data.
 *
 * Most relays simply re-dispatch the payload as a DOM `CustomEvent`
 * so any workbench React component / Wind orchestration layer can
 * subscribe via `document.addEventListener("cel:<channel>", ...)`.
 * Three of them additionally drive workbench services directly: the
 * configuration relay calls `IConfigurationService.reloadConfiguration`,
 * the security relay calls `INotificationService.error/warn/info`,
 * and the statusbar/create relay calls back into the closure-bound
 * `SetOrUpdateEntry` so the new entry materialises in
 * `IStatusbarService.addEntry`.
 */
// `GetServices` returns a heterogenous bag whose actual interface
// (`CelServices`) is private to Bridge.ts. Use a structural probe
// for the two surfaces we actually touch (Configuration + Notification)
// so we stay decoupled from Bridge.ts's internal type without
// re-importing it.
interface ServicesProbe {
	Configuration?: { reloadConfiguration?: () => unknown };

	Notification?: {
		error?: (m: string) => unknown;

		warn?: (m: string) => unknown;

		info?: (m: string) => unknown;
	};

	Commands?: {
		executeCommand?: (CommandId: string, ...Args: unknown[]) => unknown;
	};
}

export default async (Dependencies: {
	Register: (
		Channel: string,

		Handler: (Payload: any) => void,
	) => Promise<void>;
	GetServices: () => ServicesProbe | null;
	SetOrUpdateEntry: (Payload: any) => void;
}): Promise<void> => {
	const { Register, GetServices, SetOrUpdateEntry } = Dependencies;

	// Tree-view create. The DOM handler at `Bridge.ts ~line 2620`
	// reads `Detail.viewId` and binds a `dataProvider` against the
	// workbench's `TreeViewByViewId` map - dispatching the event is
	// the only signal it needs.
	await Register("sky://tree-view/create", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:tree-view:create", { detail: Payload }),
		);
	});

	// Configuration mutated. Force the workbench to reload its
	// per-target cache so downstream `onDidChangeConfiguration`
	// listeners (editor, themes, extensions) see the new values
	// without waiting for the next workbench tick.
	await Register("sky://configuration/changed", (Payload: any) => {
		try {
			const Services = GetServices() as any;
			const Reload = Services?.Configuration?.reloadConfiguration;
			if (typeof Reload === "function") {
				const Result = Reload.call(Services.Configuration);
				if (Result && typeof Result.catch === "function") {
					Result.catch(() => {});
				}
			}
		} catch {
			/* swallow - workbench may not have Configuration yet */
		}
		document.dispatchEvent(
			new CustomEvent("cel:configuration:changed", { detail: Payload }),
		);
	});

	// Extension lifecycle: install / uninstall.
	//
	// Mountain emits these after `extensions:install` (VsixInstaller)
	// succeeds and after a successful `extensions:uninstall`. Stock
	// VS Code's Extensions view does not subscribe to a public hook
	// firing from outside its own `IExtensionGalleryService` install
	// pipeline, so the view stays stale unless we poke it.
	//
	// The workbench command `workbench.extensions.action.refreshExtension`
	// is the same action the "Refresh" toolbar button triggers - it
	// calls `IExtensionsWorkbenchService.queryLocal()` internally,
	// which re-reads `IExtensionManagementService.getInstalled()` and
	// rebuilds the view model. Executing it on every install/uninstall
	// makes the sidebar refresh live without a workbench reload.
	//
	// The `CustomEvent` dispatch is kept so any Wind orchestration
	// layer or React component can also listen at the DOM level.
	const RefreshExtensionsView = (Services: ServicesProbe | null): void => {
		try {
			const Execute = Services?.Commands?.executeCommand;

			if (typeof Execute === "function") {
				const Result = Execute.call(
					Services!.Commands,
					"workbench.extensions.action.refreshExtension",
				) as unknown;

				if (
					Result &&
					typeof (Result as { catch?: unknown }).catch === "function"
				) {
					(
						Result as { catch: (handler: () => void) => unknown }
					).catch(() => {});
				}
			}
		} catch {
			/* swallow - the CustomEvent dispatch below still fires */
		}
	};

	await Register("sky://extensions/installed", (Payload: any) => {
		RefreshExtensionsView(GetServices());

		document.dispatchEvent(
			new CustomEvent("cel:extensions:installed", { detail: Payload }),
		);
	});

	await Register("sky://extensions/uninstalled", (Payload: any) => {
		RefreshExtensionsView(GetServices());

		document.dispatchEvent(
			new CustomEvent("cel:extensions:uninstalled", { detail: Payload }),
		);
	});

	// Security incident. Surface high-severity events via the
	// workbench `INotificationService` so they pop the toaster
	// instead of dying silently in a DOM-only relay no UI listens
	// to. Severity follows VS Code's MessageSeverity enum
	// (1=Info, 2=Warning, 3=Error).
	await Register("sky://security/incident", (Payload: any) => {
		try {
			const Services = GetServices() as any;
			const Notification = Services?.Notification;
			if (Notification) {
				const Type = String(Payload?.type ?? "security");
				const Extension = Payload?.ext ?? Payload?.extensionId;
				const Message = Extension
					? `[${Type}] ${Extension}: ${Payload?.message ?? ""}`
					: `[${Type}] ${Payload?.message ?? ""}`;
				const Severity = Number(Payload?.severity ?? 2);
				if (Severity >= 3 && typeof Notification.error === "function") {
					Notification.error(Message);
				} else if (
					Severity >= 2 &&
					typeof Notification.warn === "function"
				) {
					Notification.warn(Message);
				} else if (typeof Notification.info === "function") {
					Notification.info(Message);
				}
			}
		} catch {
			/* swallow - never throw from a security listener */
		}
		document.dispatchEvent(
			new CustomEvent("cel:security:incident", { detail: Payload }),
		);
	});

	// Statusbar create. Forwards through the install-time
	// `SetOrUpdateEntry` helper so creation calls
	// `IStatusbarService.addEntry(...)` and stashes the accessor in
	// the shared `StatusbarAccessors` map - identical to the path
	// `sky://statusbar/set-entry` already takes.
	await Register("sky://statusbar/create", (Payload: any) => {
		try {
			SetOrUpdateEntry(Payload);
		} catch (Error) {
			invoke("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [
					"sky-bridge",
					"[SkyBridge] statusbar/create failed",
					Error,
				],
			}).catch(() => {});
		}
		document.dispatchEvent(
			new CustomEvent("cel:statusbar:create", { detail: Payload }),
		);
	});

	// Terminal pid. Stash the pid in `globalThis.__CEL_TERMINAL_PIDS__`
	// so synchronous lookups don't have to wait for an async DOM
	// event round-trip.
	await Register("sky://terminal/processId", (Payload: any) => {
		try {
			const Land = globalThis as any;
			const Map_ =
				Land.__CEL_TERMINAL_PIDS__ ??
				(Land.__CEL_TERMINAL_PIDS__ = new Map<string, number>());
			const Id = String(Payload?.id ?? "");
			const Pid = Number(Payload?.pid ?? 0);
			if (Id && Pid > 0) Map_.set(Id, Pid);
		} catch {
			/* swallow */
		}
		document.dispatchEvent(
			new CustomEvent("cel:terminal:processId", { detail: Payload }),
		);
	});

	// Debug session start + adapter register. DOM relays only -
	// `IDebugService.adapterManager.registerDebugAdapterDescriptorFactory`
	// is the workbench API but registering an adapter from Sky
	// requires a real factory descriptor we don't currently mint.
	await Register("sky://debug/start", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:start", { detail: Payload }),
		);
	});

	await Register("sky://debug/register", (Payload: any) => {
		document.dispatchEvent(
			new CustomEvent("cel:debug:register", { detail: Payload }),
		);
	});
};
