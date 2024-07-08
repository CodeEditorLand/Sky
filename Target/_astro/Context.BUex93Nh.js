const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.xSFr9lF_.js",
			"_astro/Create.Blxrf1VZ.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/web.BwkxOWcj.js",
			"_astro/Persist.BKvxBu3E.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import { b as createContext, u as useContext } from "./web.BwkxOWcj.js";

const a = createContext({
	Data: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Data.xSFr9lF_.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([0, 1, 2, 3, 4]) : void 0,
		)
	).default,
});
var p = useContext(a);

export { a as _Function, p as default };
//# sourceMappingURL=Context.BUex93Nh.js.map
