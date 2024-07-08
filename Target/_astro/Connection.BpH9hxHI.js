const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.BR99StaI.js",
			"_astro/Editor.sXdNa4bf.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Get.DEMavfU8.js",
			"_astro/Context.hb_QaC2J.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.sXdNa4bf.js";
import "./solid.-melTDdq.js";
var c = ({ children: _ }) => (
	i(n(t.State, (e) => t.Status[1](t.States[e]), { defer: !1 })),
	i(
		n(
			t.Socket[0],
			(e) =>
				e?.addEventListener("message", async (u) =>
					t.Messages[1](
						(
							await a(
								async () => {
									const { default: r } = await import(
										"./Merge.BR99StaI.js"
									);
									return { default: r };
								},
								__vite__mapDeps([0, 1, 2]),
							)
						).default(
							t.Messages[0](),
							await (
								await a(
									async () => {
										const { default: r } = await import(
											"./Get.DEMavfU8.js"
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
	React.createElement(o.Provider, { value: o.defaultValue }, _)
);
const { createEffect: i, on: n } = await a(
		() => import("./solid.-melTDdq.js"),
		[],
	),
	{ default: t, _Function: o } = await a(
		async () => {
			const { default: _, _Function: e } = await import(
				"./Context.hb_QaC2J.js"
			);
			return { default: _, _Function: e };
		},
		__vite__mapDeps([4, 1, 2]),
	);
export {
	t as Connection,
	o as _Function,
	i as createEffect,
	c as default,
	n as on,
};
//# sourceMappingURL=Connection.BpH9hxHI.js.map
