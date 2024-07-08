const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.CDXTcFCa.js",
			"_astro/Editor.Cjw5oqMk.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.oDYEgqVQ.js",
			"_astro/Context.LKq552OA.js",
		]),
) => i.map((i) => d[i]);
import { _ as e } from "./Editor.Cjw5oqMk.js";
import "./solid.-melTDdq.js";
var f = async ({ children: o, Data: c }) => (
	c?.forEach(async (a, u) => {
		const _ = new URL(document.location.href),
			i = _.searchParams.get(a),
			r = (
				await e(
					async () => {
						const { default: t } = await import(
							"./Create.CDXTcFCa.js"
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
								"./Persist.oDYEgqVQ.js"
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
						"./Context.LKq552OA.js"
					);
					return { default: t };
				},
				__vite__mapDeps([4, 1, 2]),
			)
		).default.Items[0]().set(a, r);
	}),
	React.createElement(n.Provider, { value: n.defaultValue }, o)
);
const { _Function: n } = await e(
	() => import("./Context.LKq552OA.js"),
	__vite__mapDeps([4, 1, 2]),
);
export { n as _Function, f as default };
//# sourceMappingURL=Store.22XKtuCp.js.map
