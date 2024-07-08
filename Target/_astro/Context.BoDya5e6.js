const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Messages.tlWMeo0U.js",
			"_astro/web.BwkxOWcj.js",
			"_astro/Socket.CyrxxX_7.js",
			"_astro/Context.CevrpyGa.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/State.C0RkEXyh.js",
			"_astro/Status.CGGkTo6e.js",
			"_astro/States.CYkdhiK1.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import { b as createContext, u as useContext } from "./web.BwkxOWcj.js";

const o = createContext({
	Messages: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Messages.tlWMeo0U.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([0, 1]) : void 0,
		)
	).default,
	Socket: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Socket.CyrxxX_7.js"
				).then((n) => n.S);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([2, 3, 4, 1]) : void 0,
		)
	).default,
	State: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./State.C0RkEXyh.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([5, 2, 3, 4, 1]) : void 0,
		)
	).default,
	Status: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./Status.CGGkTo6e.js"
				);
				return { default: __vite_default__ };
			},
			true ? __vite__mapDeps([6, 5, 2, 3, 4, 1, 7]) : void 0,
		)
	).default,
	States: (
		await __vitePreload(
			async () => {
				const { default: __vite_default__ } = await import(
					"./States.CYkdhiK1.js"
				);
				return { default: __vite_default__ };
			},
			true ? [] : void 0,
		)
	).default,
});
var s = useContext(o);

export { o as _Function, s as default };
//# sourceMappingURL=Context.BoDya5e6.js.map
