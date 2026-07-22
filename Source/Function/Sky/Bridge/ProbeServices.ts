/**
 * One-shot diagnostic probe of `globalThis.__CEL_SERVICES__` shape.
 * The workbench's Output-transform plugin
 * (`ExposeWorkbenchAccessor.ts`) populates each handle inside a
 * `try`-IIFE; a contrib that fails to resolve silently drops to
 * `null`. Without this probe the Sky-side SCM / Debug / CustomEditor
 * bridges no-op without telling anyone why.
 *
 * Logs once to the renderer console AND to Mountain's dev-log via
 * `MountainIPCInvoke` (the per-key shape lands under the `cel-services`
 * tag so log dissection can post-mortem boot failures). Probes a
 * deeper second-level shape on the two leverage keys the current
 * bug-hunt depends on (`WebviewViews.register`, `Markers.changeOne`)
 * and re-walks the view registry at +5s once the
 * extension-points pipeline has flushed.
 */
const ServiceKeys = [
	"Statusbar",

	"Commands",

	"CommandRegistry",

	"Search",

	"Views",

	"URI",

	"TreeViewByViewId",

	"SCM",

	"Debug",

	"CustomEditor",

	"Emitter",

	"Disposable",

	"ToDisposable",

	"Models",

	"Languages",

	"ResourceTree",

	"UriIdentity",

	"WebviewViews",

	"Markers",
] as const;

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

export default (GetServices: () => Record<string, unknown> | null): void => {

	const Probe = (): void => {
		const S = GetServices();

		if (!S) {
			ToMountain(
				"sky-bridge",

				"[Sky:CEL] __CEL_SERVICES__ missing on probe",
			);

			ToMountain("cel-services", "__CEL_SERVICES__ missing on probe");

			return;
		}

		const Shape = ServiceKeys.map(
			(K) => `${K}=${S[K] == null ? "null" : typeof S[K]}`,
		).join(" ");

		ToMountain("sky-bridge", `[Sky:CEL] services-ready ${Shape}`);

		ToMountain("cel-services", `shape ${Shape}`);

		const RegisterShape = `WebviewViews.register=${typeof (S["WebviewViews"] as any)?.register} Markers.changeOne=${typeof (S["Markers"] as any)?.changeOne}`;

		ToMountain("cel-services", RegisterShape);

		setTimeout(() => {
			try {
				const Snapshot = (S as any)?.ViewRegistrySnapshot?.();

				if (!Snapshot) {
					ToMountain(
						"view-registry",

						"snapshot accessor missing on __CEL_SERVICES__",
					);

					return;
				}

				ToMountain(
					"view-registry",

					`containers=${Snapshot.containers} views=${Snapshot.views} containerSample=${(Snapshot.containerSample ?? []).join(",")} viewSample=${(Snapshot.viewSample ?? []).join(",")}`,
				);
			} catch (Error) {
				ToMountain(
					"view-registry",

					`probe failed: ${(Error as Error)?.message ?? String(Error)}`,
				);
			}
		}, 5000);
	};

	if (typeof window !== "undefined") {
		if ((window as any).__CEL_SERVICES__) {
			Probe();
		} else {
			window.addEventListener("cel:services-ready", () => Probe(), {
				once: true,
			});
		}
	}
};
