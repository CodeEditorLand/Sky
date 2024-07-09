const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Context.Bt9HqGxz.js",
			"_astro/Editor.DUXgpfsS.js",
			"_astro/web.B9Xaj9_E.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.DUXgpfsS.js";
import { c as o } from "./web.B9Xaj9_E.js";
var c = ({ children: t }) =>
	o(e.Provider, {
		get value() {
			return e.defaultValue;
		},
		children: t,
	});
const { createEffect: _, on: u } = await a(
		() => import("./web.B9Xaj9_E.js").then((t) => t.z),
		[],
	),
	{ default: d, _Function: e } = await a(
		async () => {
			const { default: t, _Function: n } = await import(
				"./Context.Bt9HqGxz.js"
			);
			return { default: t, _Function: n };
		},
		__vite__mapDeps([0, 1, 2]),
	);
export {
	d as Connection,
	e as _Function,
	_ as createEffect,
	c as default,
	u as on,
};
//# sourceMappingURL=Connection.FOtFDXaS.js.map
