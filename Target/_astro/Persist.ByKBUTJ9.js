const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Put.D47KSjGh.js",
			"_astro/Editor.1x_WqB4B.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ } from "./Editor.1x_WqB4B.js";
import "./solid.-melTDdq.js";
var c = async ([[a, r], e]) => (
	(
		await _(async () => {
			const { createEffect: t } = await import("./solid.-melTDdq.js");
			return { createEffect: t };
		}, [])
	).createEffect(
		(
			await _(async () => {
				const { on: t } = await import("./solid.-melTDdq.js");
				return { on: t };
			}, [])
		).on(
			a,
			async (t) =>
				o.set(
					e,
					JSON.stringify(
						(
							await _(
								async () => {
									const { default: i } = await import(
										"./Put.D47KSjGh.js"
									);
									return { default: i };
								},
								__vite__mapDeps([0, 1, 2]),
							)
						).default(t),
					),
				),
			{ defer: !1 },
		),
	),
	[e, [a, r]]
);
const { default: o } = await _(
	() => import("./store.legacy.DD2y5COG.js").then((a) => a.s),
	[],
);
export { o as Local, c as default };
//# sourceMappingURL=Persist.ByKBUTJ9.js.map
