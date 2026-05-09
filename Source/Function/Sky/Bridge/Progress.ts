/**
 * DOM-rendered progress toast helper bag. Stock VS Code routes
 * `vscode.window.withProgress` through `IProgressService` which
 * renders into the workbench's status bar / notification area.
 * Until that path is fully wired through Sky, we paint a simple
 * fixed-position toast in the bottom-right with a CSS-spinner so
 * extensions get visible feedback during long operations
 * (rust-analyzer indexing, gitlens repo scans, etc.).
 *
 * State is closure-captured: a single factory call returns `Show` /
 * `Update` / `Dismiss` sharing the same `ActiveProgress` map. The
 * factory shape (rather than module-level statics) keeps the helper
 * tree-shakable and avoids cross-test bleed if a future test harness
 * mounts the bridge twice.
 */
export default (): {
	Show: (Id: string, Title?: string, Cancellable?: boolean) => void;

	Update: (Id: string, Message?: string, Increment?: number) => void;

	Dismiss: (Id: string) => void;
} => {
	const ActiveProgress = new Map<string, HTMLElement>();

	const Dismiss = (Id: string): void => {
		const El = ActiveProgress.get(Id);

		if (El) {
			El.remove();

			ActiveProgress.delete(Id);
		}
	};

	const Show = (Id: string, Title?: string, Cancellable?: boolean): void => {
		let El = ActiveProgress.get(Id);

		if (!El) {
			El = document.createElement("div");

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
		}
	};

	const Update = (
		Id: string,

		Message?: string,

		_Increment?: number,
	): void => {
		const El = ActiveProgress.get(Id);

		if (El) {
			const Label = El.querySelector(".cel-progress-label");

			if (Label && Message) Label.textContent = Message;
		}
	};

	return { Show, Update, Dismiss };
};
