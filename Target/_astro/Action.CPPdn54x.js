import { c as createComponent, t as template } from "./dev.CB3_ATpt.js";
import { __tla as __tla_0, _ as __vitePreload } from "./Editor.DAnszMTL.js";

const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/editor.main.CoRWhmHY.js",
			"_astro/Editor.DAnszMTL.js",
			"_astro/dev.CB3_ATpt.js",
			"_astro/editor.Cwh6TVrJ.css",
			"_astro/Context.SrFFWMSq.js",
		]),
) => i.map((i) => d[i]);

let r, o, m, p;
let __tla = Promise.all([
	(() => {
		try {
			return __tla_0;
		} catch {}
	})(),
]).then(async () => {
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
								const { default: __vite_default__ } =
									await import("./css.worker.CXyIXz8x.js");
								return {
									default: __vite_default__,
								};
							},
							true ? [] : void 0,
						)
					).default();
				case "html":
					return new (
						await __vitePreload(
							async () => {
								const { default: __vite_default__ } =
									await import("./html.worker.DOFNDttL.js");
								return {
									default: __vite_default__,
								};
							},
							true ? [] : void 0,
						)
					).default();
				case "typescript":
					return new (
						await __vitePreload(
							async () => {
								const { default: __vite_default__ } =
									await import("./ts.worker.D1O3GZk3.js");
								return {
									default: __vite_default__,
								};
							},
							true ? [] : void 0,
						)
					).default();
				default:
					return new (
						await __vitePreload(
							async () => {
								const { default: __vite_default__ } =
									await import("./editor.worker.BskY_DYw.js");
								return {
									default: __vite_default__,
								};
							},
							true ? [] : void 0,
						)
					).default();
			}
		},
	};
	m = ({ children: e }) =>
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
	({ editor: r, languages: p } = await __vitePreload(
		() =>
			import("./editor.main.CoRWhmHY.js")
				.then(async (m) => {
					await m.__tla;
					return m;
				})
				.then((n) => n.a),
		true ? __vite__mapDeps([0, 1, 2, 3]) : void 0,
	));
	p.typescript.typescriptDefaults.setEagerModelSync(!0),
		r.defineTheme(
			"Light",
			(
				await __vitePreload(
					async () => {
						const { default: __vite_default__ } = await import(
							"./Active4D.Dv6h-wwM.js"
						);
						return {
							default: __vite_default__,
						};
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
						return {
							default: __vite_default__,
						};
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
	({ _Function: o } = await __vitePreload(
		() =>
			import("./Context.SrFFWMSq.js").then(async (m) => {
				await m.__tla;
				return m;
			}),
		true ? __vite__mapDeps([4, 1, 2]) : void 0,
	));
});
export { r as Monaco, o as _Function, m as default, p as languages, __tla };
