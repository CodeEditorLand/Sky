const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Get.DAVQO4IO.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/web.BwkxOWcj.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import "./web.BwkxOWcj.js";

var i = (...[[t, [o, e]], n = null]) => {
	let r = a(t);
	try {
		r = p(JSON.parse(a(t)));
	} catch (c) {
		console.log(c);
	}
	return e(n ?? r), [o, e];
};
const { get: a } = await __vitePreload(
		() => import("./store.legacy.C1hS2y54.js").then((n) => n.s),
		true ? [] : void 0,
	),
	{ default: p } = await __vitePreload(
		async () => {
			const { default: p } = await import("./Get.DAVQO4IO.js");
			return { default: p };
		},
		true ? __vite__mapDeps([0, 1, 2]) : void 0,
	);

export { p as Get, i as default, a as get };
//# sourceMappingURL=Create.Blxrf1VZ.js.map
