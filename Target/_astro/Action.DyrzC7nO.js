const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/editor.main.gOk32hJF.js",
			"_astro/Editor.G0rPb_Kj.js",
			"_astro/solid.f9AvF4Qv.js",
			"_astro/editor.C_BnueFE.css",
			"_astro/Context.CFyhfv8p.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.G0rPb_Kj.js";
import "./solid.f9AvF4Qv.js";

self.MonacoEnvironment = {
	createTrustedTypesPolicy: () => {},
	getWorker: async (e, t) => {
		switch (t) {
			case "css":
				return new (
					await __vitePreload(
						async () => {
							const { default: __vite_default__ } = await import(
								"./css.worker.DS5436VR.js"
							);
							return { default: __vite_default__ };
						},
						true ? [] : void 0,
					)
				).default();
			case "html":
				return new (
					await __vitePreload(
						async () => {
							const { default: __vite_default__ } = await import(
								"./html.worker.CwfwirAf.js"
							);
							return { default: __vite_default__ };
						},
						true ? [] : void 0,
					)
				).default();
			case "typescript":
				return new (
					await __vitePreload(
						async () => {
							const { default: __vite_default__ } = await import(
								"./ts.worker.Cq1_P1ls.js"
							);
							return { default: __vite_default__ };
						},
						true ? [] : void 0,
					)
				).default();
			default:
				return new (
					await __vitePreload(
						async () => {
							const { default: __vite_default__ } = await import(
								"./editor.worker.CecZkqX3.js"
							);
							return { default: __vite_default__ };
						},
						true ? [] : void 0,
					)
				).default();
		}
	},
};
var i = ({ children: e }) =>
	createComponent(
		r.Provider,
		{ value: r.defaultValue },
		createComponent("link", {
			rel: "stylesheet",
			media: "print",
			onload: (t) => {
				t.target.removeAttribute("onload"),
					t.target.removeAttribute("media");
			},
			href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap",
		}),
		e,
	);
const { editor: a, languages: o } = await __vitePreload(
	() => import("./editor.main.gOk32hJF.js").then((n) => n.a),
	true ? __vite__mapDeps([0, 1, 2, 3]) : void 0,
);
o.typescript.typescriptDefaults.setEagerModelSync(!0),
	a.defineTheme(
		"Light",
		(
			await __vitePreload(
				async () => {
					const { default: __vite_default__ } = await import(
						"./Active4D.Dv6h-wwM.js"
					);
					return { default: __vite_default__ };
				},
				true ? [] : void 0,
			)
		).default,
	),
	a.defineTheme(
		"Dark",
		(
			await __vitePreload(
				async () => {
					const { default: __vite_default__ } = await import(
						"./Amoled.ebNj7KlL.js"
					);
					return { default: __vite_default__ };
				},
				true ? [] : void 0,
			)
		).default,
	),
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", ({ matches: e }) =>
			a.setTheme(e ? "Dark" : "Light"),
		);
const { _Function: r } = await __vitePreload(
	() => import("./Context.CFyhfv8p.js"),
	true ? __vite__mapDeps([4, 1, 2]) : void 0,
);

export { a as Monaco, r as _Function, i as default, o as languages };
//# sourceMappingURL=Action.DyrzC7nO.js.map
