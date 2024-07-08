const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.C-ceTXzq.js",
			"_astro/Create.D7egYPT2.js",
			"_astro/Editor.DCPGuuul.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.ctL4HzR8.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.DCPGuuul.js";
import { createContext as e, useContext as _ } from "./solid.-melTDdq.js";
const o = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.C-ceTXzq.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = _(o);
export { o as _Function, u as default };
//# sourceMappingURL=Context.DdaPg0Ep.js.map
