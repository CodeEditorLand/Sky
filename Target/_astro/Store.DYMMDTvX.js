const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Create.wjHthqkG.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
			"_astro/Persist.Cvd_6lpt.js",
			"_astro/Context.B-xm8u_0.js",
		]),
) => i.map((i) => d[i]);
import { _ as e } from "./Editor.BrGPxqy1.js";
import { c as s } from "./web.Dh-3o7rH.js";
var m = ({ children: c, Data: u }) => (
	u?.forEach(async (a, d) => {
		const _ = new URL(document.location.href),
			n = _.searchParams.get(a),
			r = (
				await e(
					async () => {
						const { default: t } = await import(
							"./Create.wjHthqkG.js"
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
								"./Persist.Cvd_6lpt.js"
							);
							return { default: t };
						},
						__vite__mapDeps([3, 1, 2]),
					)
				).default([
					(
						await e(async () => {
							const { createSignal: t } = await import(
								"./web.Dh-3o7rH.js"
							).then((i) => i.B);
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
						"./Context.B-xm8u_0.js"
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
	() => import("./Context.B-xm8u_0.js"),
	__vite__mapDeps([4, 1, 2]),
);
export { o as _Function, m as default };
//# sourceMappingURL=Store.DYMMDTvX.js.map
