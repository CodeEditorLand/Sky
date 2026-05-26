/**
 * Drains Mountain-side state that fired through `sky://*` emits
 * BEFORE any of Sky's listeners installed. Tauri's `app.emit` is
 * fire-and-forget - in the bundled-electron profile, extension
 * activation kicks off ~580 log-lines before the Sky bundle finishes
 * booting, so every `sky://tree-view/create` and `sky://scm/register`
 * emitted during that window is dropped before the `Register(...)`
 * chain installs.
 *
 * Without this replay, extension-contributed views (gitlens panes,
 * jsdebug trees, SCM provider rows) never bind data providers and the
 * panels stay empty even though the workbench is otherwise healthy.
 * The Mountain handler iterates state under
 * `runtime.ApplicationState.Feature.{TreeViews, Markers}` and
 * re-emits each entry idempotently
 * (`ScmShimRegistry.has(scmId)` short-circuits any duplicate
 * registration on the Sky side).
 */
type Invoke = (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;

interface ReplaySummary {
	treeViews?: number;
	scmProviders?: number;
	scmGroups?: number;
	scmResourceUpdates?: number;
	commands?: number;
	terminals?: number;
	terminalDataBytes?: number;
}

export default async (Invoke: Invoke): Promise<void> => {
	try {
		const Replay = (await Invoke("MountainIPCInvoke", {
			method: "sky:replay-events",
			params: [],
		})) as ReplaySummary | undefined;
		const Summary = `tree-views=${Replay?.treeViews ?? 0} scm=${Replay?.scmProviders ?? 0} scm-groups=${Replay?.scmGroups ?? 0} scm-resource-updates=${Replay?.scmResourceUpdates ?? 0} commands=${Replay?.commands ?? 0} terminals=${Replay?.terminals ?? 0} terminal-bytes=${Replay?.terminalDataBytes ?? 0}`;
		// Mountain's RenderDevLog accepts both PascalCase and lowercase
		// param names depending on the dev-log build profile; pass both
		// for forward/backward compatibility across vendored versions.
		Invoke("RenderDevLog", {
			Tag: "sky-emit",
			Message: `[SkyBridge] replay-events ${Summary}`,
			tag: "sky-emit",
			message: `[SkyBridge] replay-events ${Summary}`,
		}).catch(() => {});
	} catch (Error) {
		Invoke("RenderDevLog", {
			Tag: "sky-emit",
			Message: `[SkyBridge] replay-events failed: ${String(Error)}`,
			tag: "sky-emit",
			message: `[SkyBridge] replay-events failed: ${String(Error)}`,
		}).catch(() => {});
	}
};
