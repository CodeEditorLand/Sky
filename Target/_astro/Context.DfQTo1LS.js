const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Messages.BMZdpWwA.js",
			"_astro/solid.-melTDdq.js",
			"_astro/Socket.CvvgyZqG.js",
			"_astro/Context.BnkuuLaG.js",
			"_astro/Editor.1x_WqB4B.js",
			"_astro/State.D4OvVOZi.js",
			"_astro/Status.DyX5F7f6.js",
			"_astro/States.Lcooe606.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.1x_WqB4B.js";
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
					"./Socket.CvvgyZqG.js"
				).then((_) => _.S);
				return { default: t };
			},
			__vite__mapDeps([2, 3, 4, 1]),
		)
	).default,
	State: (
		await a(
			async () => {
				const { default: t } = await import("./State.D4OvVOZi.js");
				return { default: t };
			},
			__vite__mapDeps([5, 2, 3, 4, 1]),
		)
	).default,
	Status: (
		await a(
			async () => {
				const { default: t } = await import("./Status.DyX5F7f6.js");
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
//# sourceMappingURL=Context.DfQTo1LS.js.map
