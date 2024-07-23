const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Action.DyhnjI71.js",
			"_astro/preload-helper.BiBI96sQ.js",
			"_astro/web.Bb4_WBG9.js",
			"_astro/Editor.DUtospb_.js",
			"_astro/editor.main.COpP3lv-.js",
			"_astro/editor.Cp6PkmXt.css",
			"_astro/Editor.CqhmHK5S.css",
		]),
) => i.map((i) => d[i]);
import { _ as d } from "./preload-helper.BiBI96sQ.js";
import { t as c, c as r, i as t, S as i, l as o } from "./web.Bb4_WBG9.js";
var l = c("<div class=p-5>"),
	h = c(
		'<div class="flex flex-col"><main class="flex grow justify-center"><div class="flex grow self-center"><div class=container><div class="grid min-h-screen content-start gap-7 py-9"><div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"><div class="order-last lg:order-first">',
	);
const m = o(() =>
		d(() => import("./Action.DyhnjI71.js"), __vite__mapDeps([0, 1, 2])),
	),
	s = o(() =>
		d(
			() => import("./Editor.DUtospb_.js"),
			__vite__mapDeps([3, 2, 4, 1, 5, 6]),
		),
	);
var C = () =>
	r(i, {
		get children() {
			var a = h(),
				n = a.firstChild,
				g = n.firstChild,
				f = g.firstChild,
				p = f.firstChild,
				v = p.firstChild,
				_ = v.firstChild;
			return (
				t(
					_,
					r(i, {
						get children() {
							return r(m, {
								get children() {
									return [
										r(i, {
											get children() {
												var e = l();
												return (
													t(
														e,
														r(s, { Type: "HTML" }),
													),
													e
												);
											},
										}),
										r(i, {
											get children() {
												var e = l();
												return (
													t(e, r(s, { Type: "CSS" })),
													e
												);
											},
										}),
										r(i, {
											get children() {
												var e = l();
												return (
													t(
														e,
														r(s, {
															Type: "TypeScript",
														}),
													),
													e
												);
											},
										}),
									];
								},
							});
						},
					}),
				),
				a
			);
		},
	});
export { C as default };
//# sourceMappingURL=Editor.B8ZjYkau.js.map
