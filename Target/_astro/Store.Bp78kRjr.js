const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.D7egYPT2.js",
			"_astro/Editor.DCPGuuul.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.ctL4HzR8.js",
			"_astro/Context.CW5qt24y.js",
		]),
) => i.map((i) => d[i]);
import { _ as e } from "./Editor.DCPGuuul.js";
import "./solid.-melTDdq.js";
var f = ({ children: n, Data: c }) => (
	c?.forEach(async (a, u) => {
		const _ = new URL(document.location.href),
			i = _.searchParams.get(a),
			r = (
				await e(
					async () => {
						const { default: t } = await import(
							"./Create.D7egYPT2.js"
						);
						return { default: t };
					},
					__vite__mapDeps([0, 1, 2]),
				)
			).default(
				(
					await e(
						async () => {
							const { default: t } = await import(
								"./Persist.ctL4HzR8.js"
							);
							return { default: t };
						},
						__vite__mapDeps([3, 1, 2]),
					)
				).default([
					(
						await e(async () => {
							const { createSignal: t } = await import(
								"./solid.-melTDdq.js"
							);
							return { createSignal: t };
						}, [])
					).createSignal(""),
					a,
				]),
				i,
			);
		if (
			(i &&
				(_.searchParams.delete(a),
				window.history.pushState({}, document.title, _.href)),
			!r[0]())
		)
			switch (u) {
				case "Identifier": {
					r[1](crypto.randomUUID());
					break;
				}
				case "Key": {
					crypto.subtle
						.generateKey({ name: "AES-GCM", length: 256 }, !0, [
							"encrypt",
							"decrypt",
						])
						.then((t) =>
							crypto.subtle
								.exportKey("jwk", t)
								.then(({ k: d }) => r[1](d ?? "")),
						);
					break;
				}
			}
		(
			await e(
				async () => {
					const { default: t } = await import(
						"./Context.CW5qt24y.js"
					);
					return { default: t };
				},
				__vite__mapDeps([4, 1, 2]),
			)
		).default.Items[0]().set(a, r);
	}),
	React.createElement(o.Provider, { value: o.defaultValue }, n)
);
const { _Function: o } = await e(
	() => import("./Context.CW5qt24y.js"),
	__vite__mapDeps([4, 1, 2]),
);
export { o as _Function, f as default };
//# sourceMappingURL=Store.Bp78kRjr.js.map
