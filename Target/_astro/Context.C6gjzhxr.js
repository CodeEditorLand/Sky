const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.Dyxp3tIb.js",
			"_astro/Create.wjHthqkG.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
			"_astro/Persist.Cvd_6lpt.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.BrGPxqy1.js";
import { b as e, u as _ } from "./web.Dh-3o7rH.js";
const o = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.Dyxp3tIb.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var i = _(o);
export { o as _Function, i as default };
//# sourceMappingURL=Context.C6gjzhxr.js.map
