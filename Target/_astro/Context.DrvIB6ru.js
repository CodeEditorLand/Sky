const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.DG4iFDpE.js",
			"_astro/Create.25y0omKr.js",
			"_astro/Editor.1x_WqB4B.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.ByKBUTJ9.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.1x_WqB4B.js";
import { createContext as e, useContext as _ } from "./solid.-melTDdq.js";
const o = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.DG4iFDpE.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = _(o);
export { o as _Function, u as default };
//# sourceMappingURL=Context.DrvIB6ru.js.map
