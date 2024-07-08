const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.25y0omKr.js",
			"_astro/Editor.1x_WqB4B.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.ByKBUTJ9.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.1x_WqB4B.js";
import "./solid.-melTDdq.js";
var r = (
	await a(
		async () => {
			const { default: t } = await import("./Create.25y0omKr.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	)
).default(
	(
		await a(
			async () => {
				const { default: t } = await import("./Persist.ByKBUTJ9.js");
				return { default: t };
			},
			__vite__mapDeps([3, 1, 2]),
		)
	).default([
		(
			await a(async () => {
				const { createSignal: t } = await import("./solid.-melTDdq.js");
				return { createSignal: t };
			}, [])
		).createSignal(new Map([])),
		"Editors",
	]),
);
export { r as default };
//# sourceMappingURL=Editors.CXKlUL_h.js.map
