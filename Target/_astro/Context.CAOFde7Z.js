const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.CDw8DHlO.js",
			"_astro/Create.wjHthqkG.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
			"_astro/Persist.Cvd_6lpt.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.BrGPxqy1.js";
import { b as e, u as o } from "./web.Dh-3o7rH.js";
const _ = e({
	Data: (
		await a(
			async () => {
				const { default: t } = await import("./Data.CDw8DHlO.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2, 3, 4]),
		)
	).default,
});
var u = o(_);
export { _ as o, u as p };
//# sourceMappingURL=Context.CAOFde7Z.js.map
