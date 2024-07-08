const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.Blxrf1VZ.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/web.BwkxOWcj.js",
			"_astro/Persist.BKvxBu3E.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import "./web.BwkxOWcj.js";

var a = (
	await __vitePreload(
		async () => {
			const { default: __vite_default__ } = await import(
				"./Create.Blxrf1VZ.js"
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
					"./Persist.BKvxBu3E.js"
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
						"./web.BwkxOWcj.js"
					).then((n) => n.z);
					return { createSignal };
				},
				true ? [] : void 0,
			)
		).createSignal(new Map([])),
		"Editors",
	]),
);

export { a as default };
//# sourceMappingURL=Editors.DvxNnOag.js.map
