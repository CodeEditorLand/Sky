const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.Belnrngr.js",
			"_astro/Create.CDXTcFCa.js",
			"_astro/Editor.Cjw5oqMk.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Persist.oDYEgqVQ.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.Cjw5oqMk.js";
import { createContext as e, useContext as _ } from "./solid.-melTDdq.js";
const o = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.Belnrngr.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = _(o);
export { o as _Function, u as default };
//# sourceMappingURL=Context.C6UhUywx.js.map
