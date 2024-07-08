const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f || (m.f = ["_astro/Items.DU-lRnLz.js", "_astro/solid.-melTDdq.js"]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.CHcRbLoL.js";
import "./solid.-melTDdq.js";
const e = (
	await a(async () => {
		const { createContext: t } = await import("./solid.-melTDdq.js");
		return { createContext: t };
	}, [])
).createContext({
	Items: (
		await a(
			async () => {
				const { default: t } = await import("./Items.DU-lRnLz.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1]),
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
//# sourceMappingURL=Context.BhUTlJ8-.js.map
