const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.B1zgMWSJ.js",
			"_astro/Create.CDXTcFCa.js",
			"_astro/Editor.Cjw5oqMk.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.oDYEgqVQ.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.Cjw5oqMk.js";
import { createContext as e, useContext as o } from "./solid.-melTDdq.js";
const _ = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.B1zgMWSJ.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = o(_);
export { _ as o, u as p };
//# sourceMappingURL=Context.GqnHsyOy.js.map
