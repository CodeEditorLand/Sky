const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f || (m.f = ["_astro/Items.aWYYBdj8.js", "_astro/web.Dh-3o7rH.js"]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.BrGPxqy1.js";
import "./web.Dh-3o7rH.js";
const _ = (
	await a(async () => {
		const { createContext: t } = await import("./web.Dh-3o7rH.js").then(
			(e) => e.B,
		);
		return { createContext: t };
	}, [])
).createContext({
	Items: (
		await a(
			async () => {
				const { default: t } = await import("./Items.aWYYBdj8.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1]),
		)
	).default,
});
var n = (
	await a(async () => {
		const { useContext: t } = await import("./web.Dh-3o7rH.js").then(
			(e) => e.B,
		);
		return { useContext: t };
	}, [])
).useContext(_);
export { _ as _Function, n as default };
//# sourceMappingURL=Context.B-xm8u_0.js.map
