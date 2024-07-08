const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.D1A_YPSl.js",
			"_astro/Create.Cc3RTQTR.js",
			"_astro/Editor.sXdNa4bf.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.BWQzUd_Z.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.sXdNa4bf.js";
import { createContext as e, useContext as _ } from "./solid.-melTDdq.js";
const o = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.D1A_YPSl.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = _(o);
export { o as _Function, u as default };
//# sourceMappingURL=Context.cAz_IPVU.js.map
