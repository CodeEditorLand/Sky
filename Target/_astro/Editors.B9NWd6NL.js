const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.1DUCCc8T.js",
			"_astro/Editor.DUXgpfsS.js",
			"_astro/web.B9Xaj9_E.js",
			"_astro/Persist.BxRAMWQk.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.DUXgpfsS.js";
import "./web.B9Xaj9_E.js";
var i = (
	await a(
		async () => {
			const { default: t } = await import("./Create.1DUCCc8T.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	)
).default(
	(
		await a(
			async () => {
				const { default: t } = await import("./Persist.BxRAMWQk.js");
				return { default: t };
			},
			__vite__mapDeps([3, 1, 2]),
		)
	).default([
		(
			await a(async () => {
				const { createSignal: t } = await import(
					"./web.B9Xaj9_E.js"
				).then((_) => _.z);
				return { createSignal: t };
			}, [])
		).createSignal(new Map([])),
		"Editors",
	]),
);
export { i as default };
//# sourceMappingURL=Editors.B9NWd6NL.js.map
