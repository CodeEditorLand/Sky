const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.CteJgaqy.js",
			"_astro/Create.D7egYPT2.js",
			"_astro/Editor.DCPGuuul.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.ctL4HzR8.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.DCPGuuul.js";
import { createContext as e, useContext as o } from "./solid.-melTDdq.js";
const _ = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.CteJgaqy.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = o(_);
export { _ as o, u as p };
//# sourceMappingURL=Context.z-WdePY0.js.map
