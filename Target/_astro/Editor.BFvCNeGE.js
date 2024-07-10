const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Action.5jyMYC_i.js",
			"_astro/web.Bb4_WBG9.js",
			"_astro/Editor.CPnYjIGX.js",
			"_astro/editor.main.D0g8BD-5.js",
			"_astro/editor.DYIhNL0M.css",
			"_astro/Editor.CqhmHK5S.css",
		]),
) => i.map((i) => d[i]);
import { t as h, c as r, i as d, S as o, l as v } from "./web.Bb4_WBG9.js";
const C = "modulepreload",
	S = function (i) {
		return "/" + i;
	},
	m = {},
	w = function (u, l, p) {
		let c = Promise.resolve();
		if (l && l.length > 0) {
			document.getElementsByTagName("link");
			const s = document.querySelector("meta[property=csp-nonce]"),
				t = s?.nonce || s?.getAttribute("nonce");
			c = Promise.all(
				l.map((e) => {
					if (((e = S(e)), e in m)) return;
					m[e] = !0;
					const a = e.endsWith(".css"),
						y = a ? '[rel="stylesheet"]' : "";
					if (document.querySelector(`link[href="${e}"]${y}`)) return;
					const n = document.createElement("link");
					if (
						((n.rel = a ? "stylesheet" : C),
						a || ((n.as = "script"), (n.crossOrigin = "")),
						(n.href = e),
						t && n.setAttribute("nonce", t),
						document.head.appendChild(n),
						a)
					)
						return new Promise((_, E) => {
							n.addEventListener("load", _),
								n.addEventListener("error", () =>
									E(
										new Error(
											`Unable to preload CSS for ${e}`,
										),
									),
								);
						});
				}),
			);
		}
		return c
			.then(() => u())
			.catch((s) => {
				const t = new Event("vite:preloadError", { cancelable: !0 });
				if (
					((t.payload = s),
					window.dispatchEvent(t),
					!t.defaultPrevented)
				)
					throw s;
			});
	};
var f = h("<div class=p-5>"),
	T = h(
		'<div class="flex flex-col"><main class="flex grow justify-center"><div class="flex grow self-center"><div class=container><div class="grid min-h-screen content-start gap-7 py-9"><div class="mb-28 grid w-full grow grid-flow-row gap-12 lg:grid-flow-col lg:grid-cols-2 lg:gap-10"><div class="order-last lg:order-first">',
	);
const P = v(() =>
		w(() => import("./Action.5jyMYC_i.js"), __vite__mapDeps([0, 1])),
	),
	g = v(() =>
		w(
			() => import("./Editor.CPnYjIGX.js"),
			__vite__mapDeps([2, 1, 3, 4, 5]),
		),
	);
var b = () =>
	r(o, {
		get children() {
			var i = T(),
				u = i.firstChild,
				l = u.firstChild,
				p = l.firstChild,
				c = p.firstChild,
				s = c.firstChild,
				t = s.firstChild;
			return (
				d(
					t,
					r(o, {
						get children() {
							return r(P, {
								get children() {
									return [
										r(o, {
											get children() {
												var e = f();
												return (
													d(
														e,
														r(g, { Type: "HTML" }),
													),
													e
												);
											},
										}),
										r(o, {
											get children() {
												var e = f();
												return (
													d(e, r(g, { Type: "CSS" })),
													e
												);
											},
										}),
										r(o, {
											get children() {
												var e = f();
												return (
													d(
														e,
														r(g, {
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
				i
			);
		},
	});
export { w as _, b as w };
//# sourceMappingURL=Editor.BFvCNeGE.js.map
