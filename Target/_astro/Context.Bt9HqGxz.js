const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = ["_astro/Messages.CCV6aJ55.js", "_astro/web.B9Xaj9_E.js"]),
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
	Messages: (
		await a(
			async () => {
				const { default: t } = await import("./Messages.CCV6aJ55.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1]),
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
//# sourceMappingURL=Context.Bt9HqGxz.js.map
