/**
 * Compact installer for three thin Mountain → Sky channel families
 * that mostly re-dispatch onto DOM events:
 *
 *   - `sky://progress/{start,update,complete}` → DOM toasts via the
 *     factory-bound Progress helper.
 *   - `sky://terminal/{show,hide,resize,create,data,exit}` → workbench
 *     command for show/hide; DOM events for the lifecycle / data
 *     stream (xterm panel components subscribe via
 *     `document.addEventListener("cel:terminal:*")`).
 *   - `sky://workspaces/changed` → DOM event so sidebar / breadcrumb /
 *     recent-folders refresh without polling `workspaces:getFolders`.
 *
 * Grouped because each is single-handler-per-channel and would
 * otherwise sprawl across nine tiny files for no readability gain.
 */
type ExecResult = { catch?: (handler: () => unknown) => unknown };

interface Workbench {
	commands: { executeCommand: (id: string, ...args: unknown[]) => unknown };
}

export default async (Dependencies: {
	Register: (
		Channel: string,

		Handler: (Payload: any) => void,
	) => Promise<void>;
	GetWorkbench: () => Workbench | null;
	ShowProgress: (Id: string, Title?: string, Cancellable?: boolean) => void;
	UpdateProgress: (Id: string, Message?: string, Increment?: number) => void;
	DismissProgress: (Id: string) => void;
}): Promise<void> => {
	const {
		Register,

		GetWorkbench,

		ShowProgress,

		UpdateProgress,

		DismissProgress,
	} = Dependencies;

	await Register(
		"sky://progress/start",

		({ id, title, cancellable }: any) => {
			ShowProgress(id, title, cancellable);
		},
	);

	await Register(
		"sky://progress/update",

		({ id, message, increment }: any) => {
			UpdateProgress(id, message, increment);
		},
	);

	await Register("sky://progress/complete", ({ id }: any) => {
		DismissProgress(id);
	});
	// `sky://progress/end` is a separate SkyEvent (SkyEvent::ProgressEnd)
	// emitted by Mountain's Wind-IPC progress handlers. Without this handler
	// Wind-initiated progress bars never dismiss in Sky.
	await Register("sky://progress/end", ({ id }: any) => {
		DismissProgress(id);
	});

	const TerminalCommand = (Id: string): void => {
		const Result = GetWorkbench()?.commands.executeCommand(
			Id,
		) as ExecResult;

		Result?.catch?.(() => undefined);
	};

	await Register("sky://terminal/show", () =>
		TerminalCommand("workbench.action.terminal.focus"),
	);

	await Register("sky://terminal/hide", () =>
		TerminalCommand("workbench.action.closePanel"),
	);

	const TerminalDispatch = (Type: string) => (Detail: any) => {
		document.dispatchEvent(new CustomEvent(Type, { detail: Detail }));
	};

	await Register("sky://terminal/resize", ({ id, cols, rows }: any) =>
		TerminalDispatch("cel:terminal:resize")({ id, cols, rows }),
	);

	await Register("sky://terminal/create", ({ id, name, pid }: any) =>
		TerminalDispatch("cel:terminal:create")({ id, name, pid }),
	);

	// OSC 633 relay: parse shell integration sequences from terminal data
	// and forward to Mountain → Cocoon so extensions can read
	// `terminal.shellIntegration.cwd` and detect integration activation.
	//
	//   OSC 633 ; A  = prompt start (integration active signal)
	//   OSC 633 ; P ; cwd=<path>  = current working directory update
	const OscCwdPattern = /\x1b\]633;P;cwd=([^\x07\x1b]*)\x07/g;
	// Terminals for which we have already notified integration activation.
	const IntegrationActivated = new globalThis.Set<number>();

	const NotifyShellOsc = (Id: number, Data: string): void => {
		try {
			const Tauri =
				(globalThis as any).__TAURI__?.core?.invoke ??
				(globalThis as any).__TAURI__?.invoke;
			if (typeof Tauri !== "function") return;

			// OSC 633 ; A = prompt start → shell integration is active.
			if (
				!IntegrationActivated.has(Id) &&
				Data.includes("\x1b]633;A\x07")
			) {
				IntegrationActivated.add(Id);
				Tauri("MountainIPCInvoke", {
					method: "localPty:setShellIntegrationActive",
					params: [Id],
				}).catch(() => {});
			}

			// OSC 633 ; P ; cwd=<path> = CWD update.
			OscCwdPattern.lastIndex = 0;
			let Match: RegExpExecArray | null;
			while ((Match = OscCwdPattern.exec(Data)) !== null) {
				const Cwd = decodeURIComponent(Match[1] ?? "");
				if (!Cwd) continue;
				Tauri("MountainIPCInvoke", {
					method: "localPty:setCwd",
					params: [Id, Cwd],
				}).catch(() => {});
			}
		} catch {
			/* swallow - never break terminal data rendering */
		}
	};

	await Register("sky://terminal/data", ({ id, data }: any) => {
		if (typeof data === "string" && data.includes("\x1b]633;")) {
			NotifyShellOsc(id as number, data);
		}
		TerminalDispatch("cel:terminal:data")({ id, data });
	});

	await Register("sky://terminal/exit", ({ id }: any) =>
		TerminalDispatch("cel:terminal:exit")({ id }),
	);

	// Hook ITerminalService.onDidChangeActiveInstance so the Cocoon
	// extension host's `vscode.window.activeTerminal` stays accurate when
	// the user switches between terminal tabs in the UI.
	const WireActiveTerminalTracking = (): void => {
		try {
			const TerminalSvc = (globalThis as any).__CEL_SERVICES__?.Terminal;

			if (!TerminalSvc?.onDidChangeActiveInstance) {
				return;
			}

			TerminalSvc.onDidChangeActiveInstance((Instance: any) => {
				const TermId: number | null =
					typeof Instance?.instanceId === "number"
						? Instance.instanceId
						: null;

				try {
					const Tauri =
						(globalThis as any).__TAURI__?.core?.invoke ??
						(globalThis as any).__TAURI__?.invoke;

					if (typeof Tauri === "function") {
						Tauri("MountainIPCInvoke", {
							method: "localPty:setActive",
							params: [TermId],
						}).catch(() => {});
					}
				} catch {
					/* swallow - never let tracking break the terminal */
				}
			});
		} catch {
			/* swallow - ITerminalService may not be populated yet */
		}
	};

	if ((globalThis as any).__CEL_SERVICES__?.Terminal) {
		WireActiveTerminalTracking();
	} else {
		window.addEventListener(
			"cel:services-ready",
			() => WireActiveTerminalTracking(),
			{ once: true },
		);
	}

	await Register(
		"sky://workspaces/changed",

		({ added, removed, folders }: any) => {
			document.dispatchEvent(
				new CustomEvent("cel:workspaces:changed", {
					detail: { added, removed, folders },
				}),
			);
		},
	);
};
