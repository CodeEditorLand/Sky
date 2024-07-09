const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Editors.B9NWd6NL.js",
			"_astro/Editor.DUXgpfsS.js",
			"_astro/web.B9Xaj9_E.js",
		]),
) => i.map((i) => d[i]);
import { _ as e } from "./Editor.DUXgpfsS.js";
import "./web.B9Xaj9_E.js";
const _ = (
	await e(async () => {
		const { createContext: t } = await import("./web.B9Xaj9_E.js").then(
			(a) => a.z,
		);
		return { createContext: t };
	}, [])
).createContext({
	Editors: (
		await e(
			async () => {
				const { default: t } = await import("./Editors.B9NWd6NL.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2]),
		)
	).default,
});
var i = (
	await e(async () => {
		const { useContext: t } = await import("./web.B9Xaj9_E.js").then(
			(a) => a.z,
		);
		return { useContext: t };
	}, [])
).useContext(_);
export { _ as _Function, i as default };
//# sourceMappingURL=Context.Dtpps4_b.js.map
