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
	//   OSC 633 ; C  = command output begins (execution started)
	//   OSC 633 ; D[;<exitCode>] = command finished
	//   OSC 633 ; E ; <commandLine> = explicit command-line capture
	//   OSC 633 ; P ; cwd=<path>  = current working directory update
	const OscCwdPattern = /\x1b\]633;P;cwd=([^\x07\x1b]*)\x07/g;

	const OscEndPattern = /\x1b\]633;D(?:;(-?\d+))?\x07/g;

	const OscCmdLinePattern = /\x1b\]633;E;([^\x07\x1b]*)\x07/g;

	// Terminals for which we have already notified integration activation.
	const IntegrationActivated = new globalThis.Set<number>();

	// Per-terminal in-flight execution snapshot. Holds the most recent
	// command-line + cwd seen via OSC 633 ; E / ; P so the eventual
	// OSC 633 ; D can carry full TerminalShellExecution context.
	const InflightExecution = new globalThis.Map<
		number,
		{ commandLine: string; cwd: string }
	>();

	// Terminals for which `interactedWith=true` has been notified. Stock
	// VS Code flips `ITerminalInstance.interactedWith` on OSC 633 ; B
	// (command-input-begins) - the shell tells us the user is typing the
	// next command. We notify Mountain once per terminal and never reset
	// (matches VS Code's "interaction is sticky" semantics).
	const InteractedTerminals = new globalThis.Set<number>();

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

				// Stash for the next D-event so it carries the cwd
				// at the time of execution.
				const Inflight = InflightExecution.get(Id) ?? {
					commandLine: "",

					cwd: "",
				};

				Inflight.cwd = Cwd;

				InflightExecution.set(Id, Inflight);

				Tauri("MountainIPCInvoke", {
					method: "localPty:setCwd",
					params: [Id, Cwd],
				}).catch(() => {});
			}

			// OSC 633 ; E ; <commandLine> = the shell tells us exactly
			// which command is about to execute (zsh / bash with the
			// VS Code shell integration script send this right before
			// the C marker). Stash for the start/end events.
			OscCmdLinePattern.lastIndex = 0;

			while ((Match = OscCmdLinePattern.exec(Data)) !== null) {
				const CommandLine = decodeURIComponent(Match[1] ?? "");

				const Inflight = InflightExecution.get(Id) ?? {
					commandLine: "",

					cwd: "",
				};

				Inflight.commandLine = CommandLine;

				InflightExecution.set(Id, Inflight);
			}

			// OSC 633 ; B = command-input-begins. Stock VS Code marks the
			// `ITerminalInstance.interactedWith` flag here - the shell tells
			// us the user is now typing the next command. Notify Mountain
			// once per terminal so `vscode.window.onDidChangeTerminalState`
			// subscribers see `state.isInteractedWith` flip from false to
			// true. Sticky: never re-notify or reset.
			if (
				!InteractedTerminals.has(Id) &&
				Data.includes("\x1b]633;B\x07")
			) {
				InteractedTerminals.add(Id);

				Tauri("MountainIPCInvoke", {
					method: "localPty:setInteracted",
					params: [{ id: Id, interactedWith: true }],
				}).catch(() => {});
			}

			// OSC 633 ; C = command output begins. Fire
			// `terminalShellExecutionStart` so
			// `vscode.window.onDidStartTerminalShellExecution`
			// subscribers see the execution with whatever
			// commandLine/cwd we've captured (often present from
			// OSC 633 ; E which precedes C on integration-aware shells).
			if (Data.includes("\x1b]633;C\x07")) {
				const Inflight = InflightExecution.get(Id) ?? {
					commandLine: "",

					cwd: "",
				};

				Tauri("MountainIPCInvoke", {
					method: "localPty:shellExecutionStart",
					params: [
						{
							id: Id,
							commandLine: Inflight.commandLine,
							cwd: Inflight.cwd,
						},
					],
				}).catch(() => {});
			}

			// OSC 633 ; D[;<exitCode>] = command finished. Fire
			// `terminalShellExecutionEnd` carrying the captured
			// commandLine + cwd + exit code (negative when unknown).
			OscEndPattern.lastIndex = 0;

			while ((Match = OscEndPattern.exec(Data)) !== null) {
				const ExitCode =
					Match[1] !== undefined ? Number.parseInt(Match[1], 10) : -1;

				const Inflight = InflightExecution.get(Id) ?? {
					commandLine: "",

					cwd: "",
				};

				Tauri("MountainIPCInvoke", {
					method: "localPty:shellExecutionEnd",
					params: [
						{
							id: Id,
							commandLine: Inflight.commandLine,
							cwd: Inflight.cwd,
							exitCode: Number.isFinite(ExitCode) ? ExitCode : -1,
						},
					],
				}).catch(() => {});

				// Reset the in-flight snapshot - the next command will
				// re-populate via OSC 633 ; E or arrive directly at C.
				InflightExecution.set(Id, {
					commandLine: "",
					cwd: Inflight.cwd,
				});
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
