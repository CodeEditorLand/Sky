/**
 * @module Function/SmokeTest/AutoDiagnoseInput
 * @description
 * Hands-off boot-time diagnostic that fires under `Disable=true`. Prints to
 * console (and re-prints on every focus change) which Monaco editor
 * instance is the active input target, what mode it is in (regular file,
 * chat input, search, settings), whether it looks "real" (file open with
 * a backing model) or "stub" (chat input with no session, welcome page,
 * empty group), and whether typing into it should be expected to work.
 *
 * The intent is that you don't have to copy-paste a probe into DevTools
 * any more - boot the binary, look at the console, and the diagnostic
 * tells you whether the editor you're aimed at is even *supposed* to
 * accept text. The most common reason "typing doesn't work" is that
 * the user is typing into VS Code's chat input which silently drops
 * keystrokes when no chat backend is available.
 *
 * Auto-runs only when `import.meta.env.Disable === "true"` (or
 * `localStorage.Disable === "1"`) so a normal Disable-off boot pays
 * zero observable overhead.
 */

interface InputDiagnostic {

	readonly elementTag: string;

	readonly placeholder: string | null;

	readonly ariaLabel: string | null;

	readonly mode:
		| "chat-input"
		| "file-editor"
		| "search-input"
		| "settings-input"
		| "untyped";

	readonly editorGroupEmpty: boolean;

	readonly textareaValue: string;

	readonly textareaTabIndex: number;

	readonly textareaReadonly: boolean;

	readonly typingExpected: boolean;

	readonly hint: string;
}

const ResolveDisabled = (): boolean => {

	try {
		const Meta = (import.meta as { env?: Record<string, unknown> }).env;

		if (Meta) {
			const Flag = Meta["Disable"];

			if (Flag === "true" || Flag === true || Flag === "1") return true;
		}
	} catch {
		/* no-op */
	}

	try {
		if (typeof localStorage !== "undefined") {
			const Stored = localStorage.getItem("Disable");

			if (Stored === "1" || Stored === "true") return true;
		}
	} catch {
		/* no-op */
	}

	return false;
};

const ClassifyEditor = (
	El: Element | null,
): { mode: InputDiagnostic["mode"]; typingExpected: boolean; hint: string } => {

	if (!El) {
		return {
			mode: "untyped",

			typingExpected: false,

			hint: "no input target found - click into a file editor first",
		};
	}

	const Placeholder = El.getAttribute("aria-placeholder") ?? "";

	if (
		Placeholder.includes("Describe what to build") ||
		Placeholder.includes("Ask")
	) {
		return {
			mode: "chat-input",

			typingExpected: false,

			hint: "this is the VS Code chat panel input. With Disable=true, Cocoon is off, so the chat backend is unavailable. Typing here is intentionally dropped at the workbench level. Open a real file (Cmd+O) to test typing.",
		};
	}

	const AriaLabel = El.getAttribute("aria-label") ?? "";

	if (AriaLabel.includes("Search") || AriaLabel.includes("Find")) {
		return {
			mode: "search-input",

			typingExpected: true,

			hint: "search input - typing should work; if it doesn't, the bug is general",
		};
	}

	if (AriaLabel.includes("Setting")) {
		return {
			mode: "settings-input",

			typingExpected: true,

			hint: "settings editor input - typing should work",
		};
	}

	if (AriaLabel.includes("editor") || AriaLabel.includes("not accessible")) {
		return {
			mode: "file-editor",

			typingExpected: true,

			hint: "regular Monaco file editor - typing SHOULD work; if it doesn't, the bug is real",
		};
	}

	return {
		mode: "untyped",

		typingExpected: false,

		hint: "unknown input target",
	};
};

const Snapshot = (): InputDiagnostic | null => {

	if (typeof document === "undefined") return null;

	const Active = document.activeElement;

	if (!(Active instanceof Element)) return null;

	if (!(Active instanceof HTMLTextAreaElement) && Active.tagName !== "DIV") {
		return null;
	}

	// Walk up to find the editor-group-container so we can tell if it's empty.
	let Container: Element | null = Active;

	let GroupEmpty = false;

	while (Container && Container !== document.body) {
		if (Container.classList?.contains("editor-group-container")) {
			GroupEmpty = Container.classList.contains("empty");

			break;
		}

		Container = Container.parentElement;
	}

	const Class = ClassifyEditor(Active);

	const Ta = Active instanceof HTMLTextAreaElement ? Active : null;

	return {
		elementTag: Active.tagName.toLowerCase(),

		placeholder: Active.getAttribute("aria-placeholder"),

		ariaLabel: Active.getAttribute("aria-label"),

		mode: Class.mode,

		editorGroupEmpty: GroupEmpty,

		textareaValue: Ta?.value ?? "",

		textareaTabIndex: Active instanceof HTMLElement ? Active.tabIndex : -1,

		textareaReadonly: Ta?.readOnly ?? false,

		typingExpected: Class.typingExpected,

		hint: Class.hint,
	};
};

const Report = (Snap: InputDiagnostic, Reason: string): void => {

	if (typeof console === "undefined") return;

	const Tag = "[Land/AutoDiagnose]";

	console.info(
		`${Tag} (${Reason}) mode=${Snap.mode} typingExpected=${Snap.typingExpected} groupEmpty=${Snap.editorGroupEmpty}`,
	);

	console.info(
		`${Tag}   tag=${Snap.elementTag} placeholder=${JSON.stringify(Snap.placeholder)} ariaLabel=${JSON.stringify(Snap.ariaLabel)}`,
	);

	console.info(
		`${Tag}   textarea: value=${JSON.stringify(Snap.textareaValue)} tabindex=${Snap.textareaTabIndex} readonly=${Snap.textareaReadonly}`,
	);

	console.info(`${Tag}   ↳ ${Snap.hint}`);
};

export const AutoDiagnoseInput = (): void => {

	if (!ResolveDisabled()) return;

	if (typeof document === "undefined") return;

	const Tag = "[Land/AutoDiagnose]";

	console.info(
		`${Tag} active. Will report on every focus change. To test typing in a real file:`,
	);

	console.info(
		`${Tag}   1. Press Cmd+O (or use the menu) to open a file picker`,
	);

	console.info(`${Tag}   2. Pick a .md / .ts / .json file (NOT a folder)`);

	console.info(
		`${Tag}   3. Click in its content area where the cursor blinks`,
	);

	console.info(
		`${Tag}   4. Type - this report will fire and tell you if typing should work`,
	);

	let Last: InputDiagnostic | null = null;

	const Tick = (Reason: string) => {
		const Snap = Snapshot();

		if (!Snap) return;

		// De-dup: only re-report when the active element actually changed.
		if (
			Last &&
			Last.elementTag === Snap.elementTag &&
			Last.placeholder === Snap.placeholder &&
			Last.ariaLabel === Snap.ariaLabel &&
			Last.editorGroupEmpty === Snap.editorGroupEmpty
		) {
			return;
		}

		Last = Snap;

		Report(Snap, Reason);
	};

	// Initial report after the workbench had a chance to focus something.
	setTimeout(() => Tick("initial"), 1500);

	setTimeout(() => Tick("post-mount"), 4000);

	// Focus changes.
	document.addEventListener("focusin", () => Tick("focusin"), true);

	// Input lands on Monaco's textarea.
	document.addEventListener(
		"beforeinput",

		(e) => {
			const Tgt = e.target;

			if (!(Tgt instanceof HTMLTextAreaElement)) return;

			Tick("beforeinput");

			console.info(
				`${Tag}   beforeinput data=${JSON.stringify((e as InputEvent).data)} → if typingExpected=true above and value stays "" 1s after, Monaco's onType chain is broken`,
			);
		},

		true,
	);
};

export default AutoDiagnoseInput;
