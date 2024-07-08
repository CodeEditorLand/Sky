const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/editor.main.803Y2rvB.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/web.BwkxOWcj.js",
			"_astro/editor.C_BnueFE.css",
			"_astro/Context.CdSYDZO5.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import { t as template, c as createComponent } from "./web.BwkxOWcj.js";

var s = template(
	'<link rel=stylesheet media=print href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&amp;display=swap">',
);
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
var m = ({ children: e }) =>
	createComponent(o.Provider, {
		get value() {
			return o.defaultValue;
		},
		get children() {
			return [
				(() => {
					var t = s();
					return (
						t.addEventListener("load", (a) => {
							a.target.removeAttribute("onload"),
								a.target.removeAttribute("media");
						}),
						t
					);
				})(),
				e,
			];
		},
	});
const { editor: r, languages: p } = await __vitePreload(
	() => import("./editor.main.803Y2rvB.js").then((n) => n.a),
	true ? __vite__mapDeps([0, 1, 2, 3]) : void 0,
);
p.typescript.typescriptDefaults.setEagerModelSync(!0),
	r.defineTheme(
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
	r.defineTheme(
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
			r.setTheme(e ? "Dark" : "Light"),
		);
const { _Function: o } = await __vitePreload(
	() => import("./Context.CdSYDZO5.js"),
	true ? __vite__mapDeps([4, 1, 2]) : void 0,
);

export { r as Monaco, o as _Function, m as default, p as languages };
//# sourceMappingURL=Action.CfMGBgGq.js.map
