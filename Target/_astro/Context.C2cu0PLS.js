const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.C_8YURpu.js",
			"_astro/Create.54_H76hg.js",
			"_astro/Editor.CHcRbLoL.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.CLobAtYj.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.CHcRbLoL.js";
import { createContext as e, useContext as o } from "./solid.-melTDdq.js";
const _ = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.C_8YURpu.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = o(_);
export { _ as o, u as p };
//# sourceMappingURL=Context.C2cu0PLS.js.map
