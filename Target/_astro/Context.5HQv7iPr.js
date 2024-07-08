const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Data.CfAuNY8F.js",
			"_astro/Create.DtQK7Ee3.js",
			"_astro/Editor.G0rPb_Kj.js",
			"_astro/solid.f9AvF4Qv.js",
			"_astro/Persist.CjG3RfDX.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.G0rPb_Kj.js";
import { createContext, useContext } from "./solid.f9AvF4Qv.js";

const o = createContext({
	Data: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Data.CfAuNY8F.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([0, 1, 2, 3, 4]) : void 0,
		)
	).default,
});
var p = useContext(o);

export { o, p };
//# sourceMappingURL=Context.5HQv7iPr.js.map
