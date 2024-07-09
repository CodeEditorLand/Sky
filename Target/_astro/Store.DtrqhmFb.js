const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.1DUCCc8T.js",
			"_astro/Editor.DUXgpfsS.js",
			"_astro/web.B9Xaj9_E.js",
			"_astro/Persist.BxRAMWQk.js",
			"_astro/Context.Bn28aB1N.js",
		]),
) => i.map((i) => d[i]);
import { _ as e } from "./Editor.DUXgpfsS.js";
import { c as s } from "./web.B9Xaj9_E.js";
var m = ({ children: c, Data: u }) => (
	u?.forEach(async (a, d) => {
		const _ = new URL(document.location.href),
			n = _.searchParams.get(a),
			r = (
				await e(
					async () => {
						const { default: t } = await import(
							"./Create.1DUCCc8T.js"
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
								"./Persist.BxRAMWQk.js"
							);
							return { default: t };
						},
						__vite__mapDeps([3, 1, 2]),
					)
				).default([
					(
						await e(async () => {
							const { createSignal: t } = await import(
								"./web.B9Xaj9_E.js"
							).then((i) => i.z);
							return { createSignal: t };
						}, [])
					).createSignal(""),
					a,
				]),
				n,
			);
		if (
			(n &&
				(_.searchParams.delete(a),
				window.history.pushState({}, document.title, _.href)),
			!r[0]())
		)
			switch (d) {
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
								.then(({ k: i }) => r[1](i ?? "")),
						);
					break;
				}
			}
		(
			await e(
				async () => {
					const { default: t } = await import(
						"./Context.Bn28aB1N.js"
					);
					return { default: t };
				},
				__vite__mapDeps([4, 1, 2]),
			)
		).default.Items[0]().set(a, r);
	}),
	s(o.Provider, {
		get value() {
			return o.defaultValue;
		},
		children: c,
	})
);
const { _Function: o } = await e(
	() => import("./Context.Bn28aB1N.js"),
	__vite__mapDeps([4, 1, 2]),
);
export { o as _Function, m as default };
//# sourceMappingURL=Store.DtrqhmFb.js.map
