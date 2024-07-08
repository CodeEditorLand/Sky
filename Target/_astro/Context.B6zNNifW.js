const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Messages.DHCxv_rX.js",
			"_astro/web.Dh-3o7rH.js",
			"_astro/Socket.DyFlgTUH.js",
			"_astro/Context.CAOFde7Z.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/State.CnxlO7fU.js",
			"_astro/Status.BpoNz3nY.js",
			"_astro/States.Lcooe606.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./Editor.BrGPxqy1.js";
import { b as e, u } from "./web.Dh-3o7rH.js";
const i = e({
	Messages: (
		await a(
			async () => {
				const { default: t } = await import("./Messages.DHCxv_rX.js");
				return { default: t };
			},
			__vite__mapDeps([0, 1]),
		)
	).default,
	Socket: (
		await a(
			async () => {
				const { default: t } = await import(
					"./Socket.DyFlgTUH.js"
				).then((_) => _.S);
				return { default: t };
			},
			__vite__mapDeps([2, 3, 4, 1]),
		)
	).default,
	State: (
		await a(
			async () => {
				const { default: t } = await import("./State.CnxlO7fU.js");
				return { default: t };
			},
			__vite__mapDeps([5, 2, 3, 4, 1]),
		)
	).default,
	Status: (
		await a(
			async () => {
				const { default: t } = await import("./Status.BpoNz3nY.js");
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
//# sourceMappingURL=Context.B6zNNifW.js.map
