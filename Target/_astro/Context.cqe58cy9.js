const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.BwMlO8m1.js",
			"_astro/Create.D7VqOHAD.js",
			"_astro/Editor.UyuTmccq.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.DJiRFCjv.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.UyuTmccq.js";
import { createContext as e, useContext as _ } from "./solid.-melTDdq.js";
const o = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.BwMlO8m1.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = _(o);
export { o as _Function, u as default };
//# sourceMappingURL=Context.cqe58cy9.js.map
