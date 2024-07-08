const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Editors.C-ws3XgK.js",
			"_astro/Editor.CHcRbLoL.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.CHcRbLoL.js";
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
				const { default: t } = await import("./Editors.C-ws3XgK.js");
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
//# sourceMappingURL=Context.BgTFgBDv.js.map
