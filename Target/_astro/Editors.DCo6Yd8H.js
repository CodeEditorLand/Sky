const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.wjHthqkG.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
			"_astro/Persist.Cvd_6lpt.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.BrGPxqy1.js";
import "./web.Dh-3o7rH.js";
var i = (
	await a(
		async () => {
			const { default: t } = await import("./Create.wjHthqkG.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	)
).default(
	(
		await a(
			async () => {
				const { default: t } = await import("./Persist.Cvd_6lpt.js");
				return { default: t };
			},
			__vite__mapDeps([3, 1, 2]),
		)
	).default([
		(
			await a(async () => {
				const { createSignal: t } = await import(
					"./web.Dh-3o7rH.js"
				).then((_) => _.B);
				return { createSignal: t };
			}, [])
		).createSignal(new Map([])),
		"Editors",
	]),
);
export { i as default };
//# sourceMappingURL=Editors.DCo6Yd8H.js.map
