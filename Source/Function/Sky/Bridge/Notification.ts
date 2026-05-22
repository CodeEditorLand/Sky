/**
 * DOM-rendered notification toast helper. Stock VS Code routes
 * `vscode.window.showInformationMessage` etc. through
 * `INotificationService` which renders into the workbench's
 * notification center. We attempt that path first via the
 * `workbench.action.showMessages` command; the DOM toast is a
 * resilient fallback so extensions that fire notifications during
 * boot (before `__CEL_SERVICES__.Notification` is wired) still get
 * visible output.
 *
 * Auto-dismisses after 6 seconds. Action buttons (when supplied)
 * call the optional `OnAction` callback so the Mountain request
 * round-trip can be resolved when `ShowNotification` is used as a
 * fallback for requests that need an action result.
 */
export default (
	GetWorkbench: () => {
		commands: { executeCommand: (id: string) => unknown };
	} | null,
): ((
	Severity: string,
	Message: string,
	Actions?: string[],
	OnAction?: (Label: string | null) => void,
) => void) => {
	return (
		Severity: string,
		Message: string,
		Actions?: string[],
		OnAction?: (Label: string | null) => void,
	): void => {
		const Wb = GetWorkbench();

		if (Wb) {
			// `executeCommand` returns a Thenable; `.catch` exists on real
			// Promises but not every Thenable shape, so reach for it
			// defensively and ignore a missing handler.
			const ShowResult = Wb.commands.executeCommand(
				"workbench.action.showMessages",
			) as { catch?: (handler: () => unknown) => unknown };

			ShowResult.catch?.(() => undefined);
		}

		const Toast = document.createElement("div");

		const Colors: Record<string, string> = {
			info: "#007acc",

			warning: "#ddb100",

			error: "#f44747",
		};

		Toast.style.cssText = `position:fixed;top:16px;right:16px;background:#1e1e1e;color:#ccc;border-left:3px solid ${Colors[Severity] ?? "#007acc"};border-radius:2px;padding:8px 12px;font-size:12px;z-index:10000;max-width:400px;box-shadow:0 2px 8px rgba(0,0,0,0.4);`;

		Toast.textContent = Message;

		// Track whether any action was taken so the auto-dismiss timeout
		// can resolve the round-trip with null if the toast times out.
		let ActionTaken = false;

		if (Actions?.length) {
			const ActionBar = document.createElement("div");

			ActionBar.style.cssText = "display:flex;gap:8px;margin-top:6px;";

			Actions.forEach((Label) => {
				const Btn = document.createElement("button");
				Btn.textContent = Label;
				Btn.style.cssText =
					"background:#007acc;color:#fff;border:none;border-radius:2px;padding:2px 8px;font-size:11px;cursor:pointer;";
				Btn.onclick = () => {
					ActionTaken = true;
					Toast.remove();
					// Resolve the Mountain round-trip with the clicked label.
					try {
						OnAction?.(Label);
					} catch {
						/* never throw from a button click */
					}
				};
				ActionBar.appendChild(Btn);
			});

			Toast.appendChild(ActionBar);
		}

		document.body.appendChild(Toast);

		setTimeout(() => {
			Toast.remove();
			// If the toast auto-dismissed without a button click, resolve
			// with null so Mountain's oneshot doesn't hang for 300 s.
			if (!ActionTaken) {
				try {
					OnAction?.(null);
				} catch {}
			}
		}, 6000);
	};
};
