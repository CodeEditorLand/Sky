const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.-gF1RJdX.js",
			"_astro/Create.54_H76hg.js",
			"_astro/Editor.CHcRbLoL.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.CLobAtYj.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.CHcRbLoL.js";
import { createContext as e, useContext as _ } from "./solid.-melTDdq.js";
const o = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.-gF1RJdX.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = _(o);
export { o as _Function, u as default };
//# sourceMappingURL=Context.CHX42vij.js.map
