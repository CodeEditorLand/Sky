const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.C8H-Zv3J.js",
			"_astro/Create.Cc3RTQTR.js",
			"_astro/Editor.sXdNa4bf.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.BWQzUd_Z.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.sXdNa4bf.js";
import { createContext as e, useContext as o } from "./solid.-melTDdq.js";
const _ = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.C8H-Zv3J.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = o(_);
export { _ as o, u as p };
//# sourceMappingURL=Context.D1xlIlHy.js.map
