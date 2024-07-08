const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Messages.BMZdpWwA.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Socket.BYqQ7NSX.js",
			"_astro/Context.z-WdePY0.js",
			"_astro/Editor.DCPGuuul.js",
			"_astro/State.8ml6QZ3X.js",
			"_astro/Status.CtCAhUKM.js",
			"_astro/States.Lcooe606.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.DCPGuuul.js";
import { createContext as e, useContext as u } from "./solid.-melTDdq.js";
const i = e({
	Messages: (
		await a(
			async () => {
				const { default: t } = await import("./Messages.BMZdpWwA.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1]),
		)
	).default,
	Socket: (
		await a(
			async () => {
				const { default: t } = await import(
					"./Socket.BYqQ7NSX.js"
				).then((_) => _.S);
				return { default: t };
			},
			__vite__mapDeps([2, 3, 4, 1]),
		)
	).default,
	State: (
		await a(
			async () => {
				const { default: t } = await import("./State.8ml6QZ3X.js");
				return { default: t };
			},
			__vite__mapDeps([5, 2, 3, 4, 1]),
		)
	).default,
	Status: (
		await a(
			async () => {
				const { default: t } = await import("./Status.CtCAhUKM.js");
				return { default: t };
			},
			__vite__mapDeps([6, 5, 2, 3, 4, 1, 7]),
		)
	).default,
	States: (
		await a(async () => {
			const { default: t } = await import("./States.Lcooe606.js");
			return { default: t };
		}, [])
	).default,
});
var o = u(i);
export { i as _Function, o as default };
//# sourceMappingURL=Context._yf8ptam.js.map
