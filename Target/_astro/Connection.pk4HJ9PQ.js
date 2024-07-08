const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.CzTQzxlv.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
			"_astro/Get.Dmd2nLX8.js",
			"_astro/Context.B6zNNifW.js",
		]),
) => i.map((i) => d[i]);
import { _ } from "./Editor.BrGPxqy1.js";
import { c as s } from "./web.Dh-3o7rH.js";
var f = ({ children: e }) => (
	n(o(t.State, (a) => t.Status[1](t.States[a]), { defer: !1 })),
	n(
		o(
			t.Socket[0],
			(a) =>
				a?.addEventListener("message", async (u) =>
					t.Messages[1](
						(
							await _(
								async () => {
									const { default: r } = await import(
										"./Merge.CzTQzxlv.js"
									);
									return { default: r };
								},
								__vite__mapDeps([0, 1, 2]),
							)
						).default(
							t.Messages[0](),
							await (
								await _(
									async () => {
										const { default: r } = await import(
											"./Get.Dmd2nLX8.js"
										);
										return { default: r };
									},
									__vite__mapDeps([3, 1, 2]),
								)
							).default(JSON.parse(u.data)),
						),
					),
				),
			{ defer: !1 },
		),
	),
	s(i.Provider, {
		get value() {
			return i.defaultValue;
		},
		children: e,
	})
);
const { createEffect: n, on: o } = await _(
		() => import("./web.Dh-3o7rH.js").then((e) => e.B),
		[],
	),
	{ default: t, _Function: i } = await _(
		async () => {
			const { default: e, _Function: a } = await import(
				"./Context.B6zNNifW.js"
			);
			return { default: e, _Function: a };
		},
		__vite__mapDeps([4, 1, 2]),
	);
export {
	t as Connection,
	i as _Function,
	n as createEffect,
	f as default,
	o as on,
};
//# sourceMappingURL=Connection.pk4HJ9PQ.js.map
