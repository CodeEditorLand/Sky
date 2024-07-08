const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.BGVZFXMF.js",
			"_astro/Editor.G0rPb_Kj.js",
			"_astro/solid.f9AvF4Qv.js",
			"_astro/Get.dcqoa8B1.js",
			"_astro/Context.BNo3vInW.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.G0rPb_Kj.js";
import "./solid.f9AvF4Qv.js";

var n = ({ children: s }) => (
	a(r(e.State, (t) => e.Status[1](e.States[t]), { defer: !1 })),
	a(
		r(
			e.Socket[0],
			(t) =>
				t?.addEventListener("message", async (i) =>
					e.Messages[1](
						(
							await __vitePreload(
								async () => {
									const { default: __vite_default__ } =
										await import("./Merge.BGVZFXMF.js");
									return { default: __vite_default__ };
								},
								true ? __vite__mapDeps([0, 1, 2]) : void 0,
							)
						).default(
							e.Messages[0](),
							await (
								await __vitePreload(
									async () => {
										const { default: __vite_default__ } =
											await import("./Get.dcqoa8B1.js");
										return { default: __vite_default__ };
									},
									true ? __vite__mapDeps([3, 1, 2]) : void 0,
								)
							).default(JSON.parse(i.data)),
						),
					),
				),
			{ defer: !1 },
		),
	),
	createComponent(o.Provider, { value: o.defaultValue }, s)
);
const { createEffect: a, on: r } = await __vitePreload(
		() => import("./solid.f9AvF4Qv.js"),
		true ? [] : void 0,
	),
	{ default: e, _Function: o } = await __vitePreload(
		async () => {
			const { default: e, _Function: o } = await import(
				"./Context.BNo3vInW.js"
			);
			return { default: e, _Function: o };
		},
		true ? __vite__mapDeps([4, 1, 2]) : void 0,
	);

export {
	e as Connection,
	o as _Function,
	a as createEffect,
	n as default,
	r as on,
};
//# sourceMappingURL=Connection.CXvAsoXW.js.map
