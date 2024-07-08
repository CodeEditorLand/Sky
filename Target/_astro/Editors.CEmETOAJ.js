const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.CDXTcFCa.js",
			"_astro/Editor.Cjw5oqMk.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.oDYEgqVQ.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.Cjw5oqMk.js";
import "./solid.-melTDdq.js";
var r = (
	await a(
		async () => {
			const { default: t } = await import("./Create.CDXTcFCa.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	)
).default(
	(
		await a(
			async () => {
				const { default: t } = await import("./Persist.oDYEgqVQ.js");
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
//# sourceMappingURL=Editors.CEmETOAJ.js.map
