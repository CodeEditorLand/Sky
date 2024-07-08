const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Put.By2aSkwj.js",
			"_astro/Editor.sXdNa4bf.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as e } from "./Editor.sXdNa4bf.js";
import "./solid.-melTDdq.js";
var d = ([[t, a], _]) => (
	f(
		c(
			t,
			async (r) =>
				i.set(
					_,
					JSON.stringify(
						(
							await e(
								async () => {
									const { default: o } = await import(
										"./Put.By2aSkwj.js"
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
	[_, [t, a]]
);
const { default: i } = await e(
		() => import("./store.legacy.DD2y5COG.js").then((t) => t.s),
		[],
	),
	{ createEffect: f, on: c } = await e(async () => {
		const { createEffect: t, on: a } = await import("./solid.-melTDdq.js");
		return { createEffect: t, on: a };
	}, []);
export { i as Local, f as createEffect, d as default, c as on };
//# sourceMappingURL=Persist.BWQzUd_Z.js.map
