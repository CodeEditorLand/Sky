const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Messages.BMZdpWwA.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Socket.XeK02KFt.js",
			"_astro/Context.GqnHsyOy.js",
			"_astro/Editor.Cjw5oqMk.js",
			"_astro/State.Dv7XMXrJ.js",
			"_astro/Status.D4eQ_oH6.js",
			"_astro/States.Lcooe606.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.Cjw5oqMk.js";
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
					"./Socket.XeK02KFt.js"
				).then((_) => _.S);
				return { default: t };
			},
			__vite__mapDeps([2, 3, 4, 1]),
		)
	).default,
	State: (
		await a(
			async () => {
				const { default: t } = await import("./State.Dv7XMXrJ.js");
				return { default: t };
			},
			__vite__mapDeps([5, 2, 3, 4, 1]),
		)
	).default,
	Status: (
		await a(
			async () => {
				const { default: t } = await import("./Status.D4eQ_oH6.js");
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
//# sourceMappingURL=Context.BbTSrFKv.js.map
