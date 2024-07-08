const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.DtQK7Ee3.js",
			"_astro/Editor.G0rPb_Kj.js",
			"_astro/solid.f9AvF4Qv.js",
			"_astro/Persist.CjG3RfDX.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.G0rPb_Kj.js";
import "./solid.f9AvF4Qv.js";

var a = (
	await __vitePreload(
		async () => {
			const { default: __vite_default__ } = await import(
				"./Create.DtQK7Ee3.js"
			);
			return { default: __vite_default__ };
		},
		true ? __vite__mapDeps([0, 1, 2]) : void 0,
	)
).default(
	(
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Persist.CjG3RfDX.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([3, 1, 2]) : void 0,
		)
	).default([
		(
			await __vitePreload(
				async () => {
					const { createSignal } = await import(
						"./solid.f9AvF4Qv.js"
					);
					return { createSignal };
				},
				true ? [] : void 0,
			)
		).createSignal(new Map([])),
		"Editors",
	]),
);

export { a as default };
//# sourceMappingURL=Editors.D3twlM6B.js.map
