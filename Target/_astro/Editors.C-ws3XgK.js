const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.54_H76hg.js",
			"_astro/Editor.CHcRbLoL.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.CLobAtYj.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.CHcRbLoL.js";
import "./solid.-melTDdq.js";
var r = (
	await a(
		async () => {
			const { default: t } = await import("./Create.54_H76hg.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	)
).default(
	(
		await a(
			async () => {
				const { default: t } = await import("./Persist.CLobAtYj.js");
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
//# sourceMappingURL=Editors.C-ws3XgK.js.map
