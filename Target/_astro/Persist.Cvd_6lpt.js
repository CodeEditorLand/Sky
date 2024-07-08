const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Put.upW7Evrq.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
		]),
) => i.map((i) => d[i]);
import { _ } from "./Editor.BrGPxqy1.js";
import "./web.Dh-3o7rH.js";
var d = ([[t, a], e]) => (
	f(
		n(
			t,
			async (r) =>
				i.set(
					e,
					JSON.stringify(
						(
							await _(
								async () => {
									const { default: o } = await import(
										"./Put.upW7Evrq.js"
									);
									return { default: o };
								},
								__vite__mapDeps([0, 1, 2]),
							)
						).default(r),
					),
				),
			{ defer: !1 },
		),
	),
	[e, [t, a]]
);
const { default: i } = await _(
		() => import("./store.legacy.DD2y5COG.js").then((t) => t.s),
		[],
	),
	{ createEffect: f, on: n } = await _(async () => {
		const { createEffect: t, on: a } = await import(
			"./web.Dh-3o7rH.js"
		).then((e) => e.B);
		return { createEffect: t, on: a };
	}, []);
export { i as Local, f as createEffect, d as default, n as on };
//# sourceMappingURL=Persist.Cvd_6lpt.js.map
