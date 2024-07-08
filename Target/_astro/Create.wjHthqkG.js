const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Get.Dmd2nLX8.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
		]),
) => i.map((i) => d[i]);
import { _ as o } from "./Editor.BrGPxqy1.js";
import "./web.Dh-3o7rH.js";
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
			const { default: t } = await import("./Get.Dmd2nLX8.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	);
export { s as Get, p as default, r as get };
//# sourceMappingURL=Create.wjHthqkG.js.map
