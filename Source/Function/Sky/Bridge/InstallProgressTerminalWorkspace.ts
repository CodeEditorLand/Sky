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

	await Register("sky://terminal/data", ({ id, data }: any) =>
		TerminalDispatch("cel:terminal:data")({ id, data }),
	);

	await Register("sky://terminal/exit", ({ id }: any) =>
		TerminalDispatch("cel:terminal:exit")({ id }),
	);

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
