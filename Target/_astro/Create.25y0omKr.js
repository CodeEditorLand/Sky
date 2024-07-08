const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Get.CzDeQehQ.js",
			"_astro/Editor.1x_WqB4B.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as o } from "./Editor.1x_WqB4B.js";
import "./solid.-melTDdq.js";
var n = async (...[[t, [i, e]], l = null]) => {
	let _ = r(t);
	try {
		_ = (
			await o(
				async () => {
					const { default: a } = await import("./Get.CzDeQehQ.js");
					return { default: a };
				},
				__vite__mapDeps([0, 1, 2]),
			)
		).default(JSON.parse(r(t)));
	} catch (a) {
		console.log(a);
	}
	return e(l ?? _), [i, e];
};
const { get: r } = await o(
	() => import("./store.legacy.DD2y5COG.js").then((t) => t.s),
	[],
);
export { n as default, r as get };
//# sourceMappingURL=Create.25y0omKr.js.map
