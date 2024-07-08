const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Editors.CXKlUL_h.js",
			"_astro/Editor.1x_WqB4B.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.1x_WqB4B.js";
import "./solid.-melTDdq.js";
const e = (
	await a(async () => {
		const { createContext: t } = await import("./solid.-melTDdq.js");
		return { createContext: t };
	}, [])
).createContext({
	Editors: (
		await a(
			async () => {
				const { default: t } = await import("./Editors.CXKlUL_h.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2]),
		)
	).default,
});
var r = (
	await a(async () => {
		const { useContext: t } = await import("./solid.-melTDdq.js");
		return { useContext: t };
	}, [])
).useContext(e);
export { e as _Function, r as default };
//# sourceMappingURL=Context.DqU2-PD9.js.map
