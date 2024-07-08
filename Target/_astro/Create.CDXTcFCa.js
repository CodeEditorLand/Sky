const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Get.DLul0XiS.js",
			"_astro/Editor.Cjw5oqMk.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as o } from "./Editor.Cjw5oqMk.js";
import "./solid.-melTDdq.js";
var n = (...[[t, [_, a]], i = null]) => {
	let e = r(t);
	try {
		e = l(JSON.parse(r(t)));
	} catch (s) {
		console.log(s);
	}
	return a(i ?? e), [_, a];
};
const { get: r } = await o(
		() => import("./store.legacy.DD2y5COG.js").then((t) => t.s),
		[],
	),
	{ default: l } = await o(
		async () => {
			const { default: t } = await import("./Get.DLul0XiS.js");
			return { default: t };
		},
		__vite__mapDeps([0, 1, 2]),
	);
export { l as Get, n as default, r as get };
//# sourceMappingURL=Create.CDXTcFCa.js.map
