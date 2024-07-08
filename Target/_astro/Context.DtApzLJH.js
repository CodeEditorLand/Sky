const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f || (m.f = ["_astro/Items.B6MqSgRw.js", "_astro/web.BwkxOWcj.js"]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import "./web.BwkxOWcj.js";

const t = (
	await __vitePreload(
		async () => {
			const { createContext } = await import("./web.BwkxOWcj.js").then(
				(n) => n.z,
			);
			return { createContext };
		},
		true ? [] : void 0,
	)
).createContext({
	Items: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Items.B6MqSgRw.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([0, 1]) : void 0,
		)
	).default,
});
var e = (
	await __vitePreload(
		async () => {
			const { useContext } = await import("./web.BwkxOWcj.js").then(
				(n) => n.z,
			);
			return { useContext };
		},
		true ? [] : void 0,
	)
).useContext(t);

export { t as _Function, e as default };
//# sourceMappingURL=Context.DtApzLJH.js.map
