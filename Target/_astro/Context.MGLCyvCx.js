const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.CUZeJTVw.js",
			"_astro/Create.D7VqOHAD.js",
			"_astro/Editor.UyuTmccq.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.DJiRFCjv.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.UyuTmccq.js";
import { createContext as e, useContext as o } from "./solid.-melTDdq.js";
const _ = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.CUZeJTVw.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = o(_);
export { _ as o, u as p };
//# sourceMappingURL=Context.MGLCyvCx.js.map
