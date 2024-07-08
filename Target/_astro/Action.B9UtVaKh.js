const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/editor.main.CDmIYRKK.js",
			"_astro/Editor.Cjw5oqMk.js",
			"_astro/solid.-melTDdq.js",
			"_astro/editor.DYIhNL0M.css",
			"_astro/Context.DyKYBtdv.js",
		]),
) => i.map((i) => d[i]);
import { _ as t } from "./Editor.Cjw5oqMk.js";
import "./solid.-melTDdq.js";
self.MonacoEnvironment = {
	createTrustedTypesPolicy: () => {},
	getWorker: async (e, r) => {
		switch (r) {
			case "css":
				return new (
					await t(async () => {
						const { default: a } = await import(
							"./css.worker.CMq9GXOa.js"
						);
						return { default: a };
					}, [])
				).default();
			case "html":
				return new (
					await t(async () => {
						const { default: a } = await import(
							"./html.worker.Duopz6Yk.js"
						);
						return { default: a };
					}, [])
				).default();
			case "typescript":
				return new (
					await t(async () => {
						const { default: a } = await import(
							"./ts.worker.BiSoPhat.js"
						);
						return { default: a };
					}, [])
				).default();
			default:
				return new (
					await t(async () => {
						const { default: a } = await import(
							"./editor.worker.DSVIkaY1.js"
						);
						return { default: a };
					}, [])
				).default();
		}
	},
};
var d = ({ children: e }) =>
	React.createElement(
		i.Provider,
		{ value: i.defaultValue },
		React.createElement("link", {
			rel: "stylesheet",
			media: "print",
			onload: (r) => {
				r.target.removeAttribute("onload"),
					r.target.removeAttribute("media");
			},
			href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap",
		}),
		e,
	);
const { editor: _, languages: o } = await t(
	() => import("./editor.main.CDmIYRKK.js").then((e) => e.a),
	__vite__mapDeps([0, 1, 2, 3]),
);
o.typescript.typescriptDefaults.setEagerModelSync(!0),
	_.defineTheme(
		"Light",
		(
			await t(async () => {
				const { default: e } = await import("./Active4D.DCMaBw04.js");
				return { default: e };
			}, [])
		).default,
	),
	_.defineTheme(
		"Dark",
		(
			await t(async () => {
				const { default: e } = await import("./Amoled.Ci6ZcdC2.js");
				return { default: e };
			}, [])
		).default,
	),
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", ({ matches: e }) =>
			_.setTheme(e ? "Dark" : "Light"),
		);
const { _Function: i } = await t(
	() => import("./Context.DyKYBtdv.js"),
	__vite__mapDeps([4, 1, 2]),
);
export { _ as Monaco, i as _Function, d as default, o as languages };
//# sourceMappingURL=Action.B9UtVaKh.js.map
