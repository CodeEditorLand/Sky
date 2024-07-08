const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Editors.D3twlM6B.js",
			"_astro/Editor.G0rPb_Kj.js",
			"_astro/solid.f9AvF4Qv.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.G0rPb_Kj.js";
import "./solid.f9AvF4Qv.js";

const t = (
	await __vitePreload(
		async () => {
			const { createContext } = await import("./solid.f9AvF4Qv.js");
			return { createContext };
		},
		true ? [] : void 0,
	)
).createContext({
	Editors: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Editors.D3twlM6B.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([0, 1, 2]) : void 0,
		)
	).default,
});
var o = (
	await __vitePreload(
		async () => {
			const { useContext } = await import("./solid.f9AvF4Qv.js");
			return { useContext };
		},
		true ? [] : void 0,
	)
).useContext(t);

export { t as _Function, o as default };
//# sourceMappingURL=Context.CFyhfv8p.js.map
