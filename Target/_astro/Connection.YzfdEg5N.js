const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.CihF0fIl.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/web.BwkxOWcj.js",
			"_astro/Get.DAVQO4IO.js",
			"_astro/Context.BoDya5e6.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import { c as createComponent } from "./web.BwkxOWcj.js";

var f = ({ children: n }) => (
	a(r(e.State, (t) => e.Status[1](e.States[t]), { defer: !1 })),
	a(
		r(
			e.Socket[0],
			(t) =>
				t?.addEventListener("message", async (s) =>
					e.Messages[1](
						(
							await __vitePreload(
								async () => {
									const { default: __vite_default__ } =
										await import("./Merge.CihF0fIl.js");
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
											await import("./Get.DAVQO4IO.js");
										return { default: __vite_default__ };
									},
									true ? __vite__mapDeps([3, 1, 2]) : void 0,
								)
							).default(JSON.parse(s.data)),
						),
					),
				),
			{ defer: !1 },
		),
	),
	createComponent(o.Provider, {
		get value() {
			return o.defaultValue;
		},
		children: n,
	})
);
const { createEffect: a, on: r } = await __vitePreload(
		() => import("./web.BwkxOWcj.js").then((n) => n.z),
		true ? [] : void 0,
	),
	{ default: e, _Function: o } = await __vitePreload(
		async () => {
			const { default: e, _Function: o } = await import(
				"./Context.BoDya5e6.js"
			);
			return { default: e, _Function: o };
		},
		true ? __vite__mapDeps([4, 1, 2]) : void 0,
	);

export {
	e as Connection,
	o as _Function,
	a as createEffect,
	f as default,
	r as on,
};
//# sourceMappingURL=Connection.YzfdEg5N.js.map
