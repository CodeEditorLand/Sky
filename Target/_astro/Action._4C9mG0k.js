const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/editor.main.CB7abqJQ.js",
			"_astro/preload-helper.BiBI96sQ.js",
			"_astro/editor.CGcvjaqs.css",
			"_astro/Context.Hhlrs_cF.js",
		]),
) => i.map((i) => d[i]);
import { _ as a } from "./preload-helper.BiBI96sQ.js";
import { t as n, c as o } from "./web.Cch9Y2F5.js";
var u = n(
	'<link rel=stylesheet media=print href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&amp;display=swap">',
);
self.MonacoEnvironment = {
	createTrustedTypesPolicy: () => {},
	getWorker: async (t, r) => {
		switch (r) {
			case "css":
				return new (
					await a(async () => {
						const { default: e } = await import(
							"./css.worker.CrKlBbge.js"
						);
						return { default: e };
					}, [])
				).default();
			case "html":
				return new (
					await a(async () => {
						const { default: e } = await import(
							"./html.worker.BUEqByGK.js"
						);
						return { default: e };
					}, [])
				).default();
			case "typescript":
				return new (
					await a(async () => {
						const { default: e } = await import(
							"./ts.worker.Bca1_c_i.js"
						);
						return { default: e };
					}, [])
				).default();
			default:
				return new (
					await a(async () => {
						const { default: e } = await import(
							"./editor.worker.BwBRLVVi.js"
						);
						return { default: e };
					}, [])
				).default();
		}
	},
};
var c = ({ children: t }) =>
	o(i.Provider, {
		get value() {
			return i.defaultValue;
		},
		get children() {
			return [
				(() => {
					var r = u();
					return (
						r.addEventListener("load", (e) => {
							e.target.removeAttribute("onload"),
								e.target.removeAttribute("media");
						}),
						r
					);
				})(),
				t,
			];
		},
	});
const { editor: _, languages: d } = await a(
	() => import("./editor.main.CB7abqJQ.js").then((t) => t.a),
	__vite__mapDeps([0, 1, 2]),
);
d.typescript.typescriptDefaults.setEagerModelSync(!0),
	_.defineTheme(
		"Light",
		(
			await a(async () => {
				const { default: t } = await import("./Active4D.DCMaBw04.js");
				return { default: t };
			}, [])
		).default,
	),
	_.defineTheme(
		"Dark",
		(
			await a(async () => {
				const { default: t } = await import("./Amoled.Ci6ZcdC2.js");
				return { default: t };
			}, [])
		).default,
	),
	window
		.matchMedia("(prefers-color-scheme: dark)")
		.addEventListener("change", ({ matches: t }) =>
			_.setTheme(t ? "Dark" : "Light"),
		);
const { _Function: i } = await a(
	() => import("./Context.Hhlrs_cF.js"),
	__vite__mapDeps([3, 1]),
);
export { _ as Monaco, i as _Function, c as default, d as languages };
//# sourceMappingURL=Action._4C9mG0k.js.map
