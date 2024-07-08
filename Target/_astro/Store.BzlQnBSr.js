const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.Blxrf1VZ.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/web.BwkxOWcj.js",
			"_astro/Persist.BKvxBu3E.js",
			"_astro/Context.DtApzLJH.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import { c as createComponent } from "./web.BwkxOWcj.js";

var d = ({ children: n, Data: c }) => (
	c?.forEach(async (e, i) => {
		const r = new URL(document.location.href),
			a = r.searchParams.get(e),
			t = (
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
					).createSignal(""),
					e,
				]),
				a,
			);
		if (
			(a &&
				(r.searchParams.delete(e),
				window.history.pushState({}, document.title, r.href)),
			!t[0]())
		)
			switch (i) {
				case "Identifier": {
					t[1](crypto.randomUUID());
					break;
				}
				case "Key": {
					crypto.subtle
						.generateKey({ name: "AES-GCM", length: 256 }, !0, [
							"encrypt",
							"decrypt",
						])
						.then((s) =>
							crypto.subtle
								.exportKey("jwk", s)
								.then(({ k: u }) => t[1](u ?? "")),
						);
					break;
				}
			}
		(
			await __vitePreload(
				async () => {
					const { default: __vite_default__ } = await import(
						"./Context.DtApzLJH.js"
					);
					return { default: __vite_default__ };
				},
				true ? __vite__mapDeps([4, 1, 2]) : void 0,
			)
		).default.Items[0]().set(e, t);
	}),
	createComponent(o.Provider, {
		get value() {
			return o.defaultValue;
		},
		children: n,
	})
);
const { _Function: o } = await __vitePreload(
	() => import("./Context.DtApzLJH.js"),
	true ? __vite__mapDeps([4, 1, 2]) : void 0,
);

export { o as _Function, d as default };
//# sourceMappingURL=Store.BzlQnBSr.js.map
