const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Items.DMezoscp.js",
			"_astro/Editor.DUXgpfsS.js",
			"_astro/web.B9Xaj9_E.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.DUXgpfsS.js";
import "./web.B9Xaj9_E.js";
const _ = (
	await a(async () => {
		const { createContext: t } = await import("./web.B9Xaj9_E.js").then(
			(e) => e.z,
		);
		return { createContext: t };
	}, [])
).createContext({
	Items: (
		await a(
			async () => {
				const { default: t } = await import("./Items.DMezoscp.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1, 2]),
		)
	).default,
});
var n = (
	await a(async () => {
		const { useContext: t } = await import("./web.B9Xaj9_E.js").then(
			(e) => e.z,
		);
		return { useContext: t };
	}, [])
).useContext(_);
export { _ as _Function, n as default };
//# sourceMappingURL=Context.Bn28aB1N.js.map
