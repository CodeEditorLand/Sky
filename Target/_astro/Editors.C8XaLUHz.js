const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.Cc3RTQTR.js",
			"_astro/Editor.sXdNa4bf.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.BWQzUd_Z.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.sXdNa4bf.js";
import "./solid.-melTDdq.js";
var r = (
	await a(
		async () => {
			const { default: t } = await import("./Create.Cc3RTQTR.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	)
).default(
	(
		await a(
			async () => {
				const { default: t } = await import("./Persist.BWQzUd_Z.js");
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
//# sourceMappingURL=Editors.C8XaLUHz.js.map
