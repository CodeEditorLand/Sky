const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.DtQK7Ee3.js",
			"_astro/Editor.G0rPb_Kj.js",
			"_astro/solid.f9AvF4Qv.js",
			"_astro/Persist.CjG3RfDX.js",
			"_astro/Context.DIzf7vsw.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.G0rPb_Kj.js";
import "./solid.f9AvF4Qv.js";

var d = ({ children: n, Data: i }) => (
	i?.forEach(async (t, c) => {
		const r = new URL(document.location.href),
			o = r.searchParams.get(t),
			e = (
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
					).createSignal(""),
					t,
				]),
				o,
			);
		if (
			(o &&
				(r.searchParams.delete(t),
				window.history.pushState({}, document.title, r.href)),
			!e[0]())
		)
			switch (c) {
				case "Identifier": {
					e[1](crypto.randomUUID());
					break;
				}
				case "Key": {
					crypto.subtle
						.generateKey({ name: "AES-GCM", length: 256 }, !0, [
							"encrypt",
							"decrypt",
						])
						.then((p) =>
							crypto.subtle
								.exportKey("jwk", p)
								.then(({ k: m }) => e[1](m ?? "")),
						);
					break;
				}
			}
		(
			await __vitePreload(
				async () => {
					const { default: __vite_default__ } = await import(
						"./Context.DIzf7vsw.js"
					);
					return { default: __vite_default__ };
				},
				true ? __vite__mapDeps([4, 1, 2]) : void 0,
			)
		).default.Items[0]().set(t, e);
	}),
	createComponent(a.Provider, { value: a.defaultValue }, n)
);
const { _Function: a } = await __vitePreload(
	() => import("./Context.DIzf7vsw.js"),
	true ? __vite__mapDeps([4, 1, 2]) : void 0,
);

export { a as _Function, d as default };
//# sourceMappingURL=Store.Cptp7pEY.js.map
