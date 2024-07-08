const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Editors.DCo6Yd8H.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
		]),
) => i.map((i) => d[i]);
import { _ as e } from "./Editor.BrGPxqy1.js";
import "./web.Dh-3o7rH.js";
const _ = (
	await e(async () => {
		const { createContext: t } = await import("./web.Dh-3o7rH.js").then(
			(a) => a.B,
		);
		return { createContext: t };
	}, [])
).createContext({
	Editors: (
		await e(
			async () => {
				const { default: t } = await import("./Editors.DCo6Yd8H.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2]),
		)
	).default,
});
var i = (
	await e(async () => {
		const { useContext: t } = await import("./web.Dh-3o7rH.js").then(
			(a) => a.B,
		);
		return { useContext: t };
	}, [])
).useContext(_);
export { _ as _Function, i as default };
//# sourceMappingURL=Context.Bu5wWiIs.js.map
