const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Get.DEMavfU8.js",
			"_astro/Editor.sXdNa4bf.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as o } from "./Editor.sXdNa4bf.js";
import "./solid.-melTDdq.js";
var p = (...[[t, [_, a]], i = null]) => {
	let e = r(t);
	try {
		e = s(JSON.parse(r(t)));
	} catch (l) {
		console.log(l);
	}
	return a(i ?? e), [_, a];
};
const { get: r } = await o(
		() => import("./store.legacy.DD2y5COG.js").then((t) => t.s),
		[],
	),
	{ default: s } = await o(
		async () => {
			const { default: t } = await import("./Get.DEMavfU8.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	);
export { s as Get, p as default, r as get };
//# sourceMappingURL=Create.Cc3RTQTR.js.map
