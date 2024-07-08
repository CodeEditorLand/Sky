const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.D7VqOHAD.js",
			"_astro/Editor.UyuTmccq.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.DJiRFCjv.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.UyuTmccq.js";
import "./solid.-melTDdq.js";
var r = (
	await a(
		async () => {
			const { default: t } = await import("./Create.D7VqOHAD.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	)
).default(
	(
		await a(
			async () => {
				const { default: t } = await import("./Persist.DJiRFCjv.js");
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
//# sourceMappingURL=Editors.Dv4V0DDb.js.map
