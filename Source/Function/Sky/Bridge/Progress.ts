/**
 * Progress toast helper bag. Routes `vscode.window.withProgress` through
 * the workbench's `IProgressService` when the service is exposed on
 * `__CEL_SERVICES__.Progress`, which renders the progress strip in the
 * status bar / notification area exactly like stock VS Code.
 *
 * Falls back to a DOM-painted toast in the bottom-right corner when the
 * progress service isn't yet bound (e.g. the workbench is mid-boot and
 * an extension fires `withProgress` before service-accessor exposure).
 *
 * State is closure-captured: a single factory call returns `Show` /
 * `Update` / `Dismiss` sharing the same per-id map. The factory shape
 * (rather than module-level statics) keeps the helper tree-shakable
 * and avoids cross-test bleed if a future test harness mounts the
 * bridge twice.
 */
type ProgressLocation = 1 | 10 | 15;

interface NativeProgressEntry {
	Resolve: () => void;

	ReportHandle?: {
		report(value: { message?: string; increment?: number }): void;
	};
}

export default (): {
	Show: (Id: string, Title?: string, Cancellable?: boolean) => void;

	Update: (Id: string, Message?: string, Increment?: number) => void;

	Dismiss: (Id: string) => void;
} => {
	const ActiveProgress = new Map<string, HTMLElement>();

	const NativeProgress = new Map<string, NativeProgressEntry>();

	const PendingMessages = new Map<
		string,
		{ message?: string; increment?: number }
	>();

	const ResolveProgressService = (): any => {
		try {
			return (globalThis as any).__CEL_SERVICES__?.Progress ?? null;
		} catch {
			return null;
		}
	};

	const StartNativeProgress = (
		Id: string,

		Title?: string,

		Cancellable?: boolean,
	): boolean => {
		const Svc = ResolveProgressService();

		if (!Svc || typeof Svc.withProgress !== "function") return false;

		try {
			Svc.withProgress(
				{
					// 15 = ProgressLocation.Notification (toast in the
					// notification area). 10 = Window (statusbar). The
					// VS Code enum lives in
					// `vs/platform/progress/common/progress.ts`.
					location: 15 as ProgressLocation,
					title: Title ?? "Working…",
					cancellable: Cancellable === true,
				},

				(Report: {
					report(value: {
						message?: string;

						increment?: number;
					}): void;
				}) =>
					new Promise<void>((Resolve) => {
						const Entry: NativeProgressEntry = {
							Resolve,
							ReportHandle: Report,
						};

						NativeProgress.set(Id, Entry);

						const Pending = PendingMessages.get(Id);

						if (Pending) {
							PendingMessages.delete(Id);

							try {
								Report.report({
									message: Pending.message,
									increment: Pending.increment,
								});
							} catch {}
						}
					}),
			);

			return true;
		} catch {
			return false;
		}
	};

	const DismissDomToast = (Id: string): void => {
		const El = ActiveProgress.get(Id);

		if (El) {
			El.remove();

			ActiveProgress.delete(Id);
		}
	};

	const Dismiss = (Id: string): void => {
		const Native = NativeProgress.get(Id);

		if (Native) {
			try {
				Native.Resolve();
			} catch {}

			NativeProgress.delete(Id);
		}

		PendingMessages.delete(Id);

		DismissDomToast(Id);
	};

	const ShowDomToast = (
		Id: string,

		Title?: string,

		Cancellable?: boolean,
	): void => {
		if (ActiveProgress.has(Id)) return;

		const El = document.createElement("div");

		El.id = `cel-progress-${CSS.escape(Id)}`;

		El.className = "cel-progress-toast";

		El.style.cssText =
			"position:fixed;bottom:28px;right:16px;background:#1e1e1e;color:#ccc;border:1px solid #454545;border-radius:4px;padding:8px 12px;font-size:12px;z-index:9998;max-width:320px;display:flex;align-items:center;gap:8px;";

		const Spinner = document.createElement("span");

		Spinner.style.cssText =
			"width:14px;height:14px;border:2px solid #555;border-top-color:#007acc;border-radius:50%;animation:cel-spin 0.8s linear infinite;flex-shrink:0;";

		El.appendChild(Spinner);

		const Label = document.createElement("span");

		Label.className = "cel-progress-label";

		Label.textContent = Title ?? "Loading…";

		El.appendChild(Label);

		if (Cancellable) {
			const CancelBtn = document.createElement("button");

			CancelBtn.textContent = "✕";

			CancelBtn.style.cssText =
				"background:none;border:none;color:#ccc;cursor:pointer;font-size:10px;margin-left:auto;padding:0 2px;";

			CancelBtn.onclick = () => Dismiss(Id);

			El.appendChild(CancelBtn);
		}

		if (!document.getElementById("cel-spin-style")) {
			const Style = document.createElement("style");

			Style.id = "cel-spin-style";

			Style.textContent =
				"@keyframes cel-spin{to{transform:rotate(360deg)}}";

			document.head.appendChild(Style);
		}

		document.body.appendChild(El);

		ActiveProgress.set(Id, El);
	};

	const UpdateDomToast = (Id: string, Message?: string): void => {
		const El = ActiveProgress.get(Id);

		if (El && Message) {
			const Label = El.querySelector(".cel-progress-label");

			if (Label) Label.textContent = Message;
		}
	};

	const Show = (Id: string, Title?: string, Cancellable?: boolean): void => {
		if (NativeProgress.has(Id) || ActiveProgress.has(Id)) return;

		if (StartNativeProgress(Id, Title, Cancellable)) return;

		ShowDomToast(Id, Title, Cancellable);
	};

	const Update = (Id: string, Message?: string, Increment?: number): void => {
		const Native = NativeProgress.get(Id);

		if (Native?.ReportHandle) {
			try {
				Native.ReportHandle.report({
					message: Message,
					increment: Increment,
				});
			} catch {}

			return;
		}

		if (NativeProgress.has(Id)) {
			// Native progress is starting but the Report handle hasn't been
			// captured yet (in-flight callback). Cache the message so the
			// upcoming activation can replay it.
			PendingMessages.set(Id, { message: Message, increment: Increment });

			return;
		}

		UpdateDomToast(Id, Message);
	};

	return { Show, Update, Dismiss };
};
