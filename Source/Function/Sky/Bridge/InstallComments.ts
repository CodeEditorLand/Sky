/**
 * @module Sky/Bridge/InstallComments
 * @description
 * Receives comment-thread data from Mountain/Cocoon and relays it to the
 * VS Code workbench. When an extension registers a CommentController via
 * `vscode.comments.createCommentController(id, label)` and creates comment
 * threads, Cocoon forwards the thread data to Mountain, which emits a
 * `sky://comments/thread-created` Tauri event. This bridge receives that
 * event and publishes it as a `cel:comments:thread-created` DOM
 * CustomEvent for workbench consumers.
 *
 * ## `ICommentService` availability
 *
 * The VS Code workbench's `ICommentService` is NOT exposed in
 * `globalThis.__CEL_SERVICES__` (not in the ProbeServices key list).
 * Without it we cannot drive inline gutter balloons or thread-pane
 * rendering directly. Until `ICommentService` is plumbed through the
 * workbench accessor, this bridge:
 *  1. Dispatches `cel:comments:*` DOM CustomEvents so any Sky-side
 *     consumer (future comment-pane widget, monaco contribution) can
 *     react.
 *  2. Probes `__CEL_SERVICES__?.CommentService` and, if found, invokes
 *     native `ICommentService` methods (the probe path makes this
 *     forward-compatible — no code change needed once the workbench
 *     plugin exposes the service).
 *  3. Logs via `MountainIPCInvoke` when a service is missing so the gap
 *     is visible in Mountain's dev log.
 */

type Handler = (Payload: any) => void;

/**
 * Check whether `ICommentService` is available. Returns the service
 * object or `null` so callers can gracefully degrade.
 */
const GetCommentService = (): any => {
	try {
		const Services = (globalThis as any).__CEL_SERVICES__;

		return Services?.CommentService ?? null;
	} catch {
		return null;
	}
};

/**
 * Forward a comment thread to `ICommentService` if available. Wraps
 * every method call in try/catch so one bad shape doesn't silence the
 * rest of the bridge.
 */
const ForwardToWorkbench = (Method: string, Args: any[]): void => {
	const Svc = GetCommentService();

	if (!Svc) return;

	try {
		const Fn = Svc[Method];

		if (typeof Fn === "function") {
			Fn.apply(Svc, Args);
		}
	} catch {
		/* swallow - service method may not exist or shape may differ */
	}
};

/**
 * Log a diagnostic message to Mountain for post-mortem analysis.
 */
const ToMountain = (Tag: string, Message: string): void => {
	try {
		const Inv =
			(globalThis as any).__TAURI__?.core?.invoke ??
			(globalThis as any).__TAURI__?.invoke;

		if (typeof Inv === "function") {
			Inv("MountainIPCInvoke", {
				method: "diagnostic:log",
				params: [Tag, Message],
			}).catch(() => {});
		}
	} catch {
		/* swallow */
	}
};

/**
 * Create a comment thread in the workbench. Cocoon's Comments/Namespace.ts
 * calls `controller.createCommentThread(uri, range, comments)` which
 * stores thread state in `Context.ExtensionRegistry`. This handler
 * receives the serialised thread and feeds it to `ICommentService` if
 * available.
 */
const HandleThreadCreated: Handler = (Payload: any): void => {
	// Fire DOM event first so any consumer (Monaco contribution,
	// comment-pane widget) can react regardless of ICommentService
	// availability.
	try {
		document.dispatchEvent(
			new CustomEvent("cel:comments:thread-created", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}

	const Svc = GetCommentService();

	if (!Svc) {
		// One-time log: gap is deterministic, don't spam every thread.
		let Logged = false;

		try {
			Logged = !!(globalThis as any).__CEL_COMMENTS_GAP_LOGGED;
		} catch {
			/* use default false */
		}

		if (!Logged) {
			ToMountain(
				"sky-bridge",

				"[Sky:Comments] ICommentService not exposed in __CEL_SERVICES__ — comment threads dispatched as cel:comments:* DOM events only (no inline gutter rendering)",
			);

			try {
				(globalThis as any).__CEL_COMMENTS_GAP_LOGGED = true;
			} catch {
				/* best effort */
			}
		}

		return;
	}

	try {
		const { controllerId, uri, range, comments } = Payload ?? {};

		if (typeof Svc.createCommentThread === "function") {
			// ICommentService.createCommentThread(owner, uri, range) →
			// returns ICommentThread which accepts .comments
			const Thread = Svc.createCommentThread(
				controllerId ?? "cel-default",

				uri,

				range,
			);

			if (Thread && Array.isArray(comments)) {
				Thread.comments = comments;
			}
		}
	} catch (Error) {
		ToMountain(
			"sky-bridge",

			`[Sky:Comments] HandleThreadCreated failed: ${String(Error)}`,
		);
	}
};

/**
 * Dispose a comment thread. Called when an extension calls
 * `thread.dispose()` or the controller is disposed.
 */
const HandleThreadDisposed: Handler = (Payload: any): void => {
	try {
		document.dispatchEvent(
			new CustomEvent("cel:comments:thread-disposed", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}

	ForwardToWorkbench("disposeCommentThread", [Payload?.threadId]);
};

/**
 * Update comments on an existing thread. Extensions mutate
 * `thread.comments` which triggers this event.
 */
const HandleCommentsUpdated: Handler = (Payload: any): void => {
	try {
		document.dispatchEvent(
			new CustomEvent("cel:comments:updated", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}

	ForwardToWorkbench("updateComments", [
		Payload?.threadId,

		Payload?.comments,
	]);
};

/**
 * Controller disposed — all its threads should be removed from the UI.
 */
const HandleControllerDisposed: Handler = (Payload: any): void => {
	try {
		document.dispatchEvent(
			new CustomEvent("cel:comments:controller-disposed", {
				detail: Payload,
			}),
		);
	} catch {
		/* swallow */
	}
};

/**
 * Probe `ICommentService` availability at install time so the one-shot
 * gap log fires as early as possible (before any extension creates a
 * comment thread).
 */
const ProbeCommentService = (): void => {
	const Svc = GetCommentService();

	if (Svc) {
		const Methods = Object.keys(Svc)
			.filter((K) => typeof Svc[K] === "function")
			.join(",");

		ToMountain(
			"cel-services",

			`CommentService=object methods=${Methods || "(none)"}`,
		);
	}
};

/**
 * Register comment-related channel handlers.
 *
 * Channels:
 *   - `sky://comments/thread-created`  → new comment thread
 *   - `sky://comments/thread-disposed` → thread removed
 *   - `sky://comments/updated`         → comments mutated on a thread
 *   - `sky://comments/controller-disposed` → controller cleanup
 */
export default async (Dependencies: {
	Register: (Channel: string, Handler: Handler) => Promise<void>;
}): Promise<void> => {
	const { Register } = Dependencies;

	ProbeCommentService();

	await Register("sky://comments/thread-created", HandleThreadCreated);

	await Register("sky://comments/thread-disposed", HandleThreadDisposed);

	await Register("sky://comments/updated", HandleCommentsUpdated);

	await Register(
		"sky://comments/controller-disposed",

		HandleControllerDisposed,
	);
};
