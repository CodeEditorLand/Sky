const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.CihF0fIl.js",
			"_astro/Editor.BTGcUlfm.js",
			"_astro/web.BwkxOWcj.js",
		]),
) => i.map((i) => d[i]);
import { _ as __vitePreload } from "./Editor.BTGcUlfm.js";
import {
	t as template,
	k as use,
	i as insert,
	f as createRenderEffect,
	g as className,
	c as createComponent,
} from "./web.BwkxOWcj.js";

var h = template("<div>");
var E = (n) => {
	const {
		children: a,
		Content: i,
		Class: o,
		onMount: s,
		onHidden: m,
	} = u({ children: "", Content: "", Class: "" }, n);
	let t;
	return (
		$(
			() => (
				w(t, {
					content: i ?? "",
					arrow: !1,
					inertia: !1,
					animation: "shift-away",
					theme: window.matchMedia("(prefers-color-scheme: dark)")
						.matches
						? "dark-border"
						: "light-border",
					hideOnClick: !1,
					onMount: (e) =>
						window
							.matchMedia("(prefers-color-scheme: dark)")
							.addEventListener("change", ({ matches: r }) =>
								e.setProps({
									theme: r ? "dark-border" : "light-border",
								}),
							),
					offset: [0, 5],
					placement: "bottom",
					interactive: !0,
					onHidden: (e) => m?.(e),
				}),
				s?.(t)
			),
		),
		(() => {
			var e = h(),
				r = t;
			return (
				typeof r == "function" ? use(r, e) : (t = e),
				insert(e, () => a(() => a)()),
				createRenderEffect(() =>
					className(
						e,
						`Tip ${typeof o == "function" ? o() : o}`.trim(),
					),
				),
				e
			);
		})()
	);
};
const { default: u } = await __vitePreload(
		() => import("./Merge.CihF0fIl.js"),
		true ? __vite__mapDeps([0, 1, 2]) : void 0,
	),
	{ default: w } = await __vitePreload(
		async () => {
			const { default: w } = await import("./tippy.esm.DAKJp8X3.js");
			return { default: w };
		},
		true ? [] : void 0,
	),
	{
		createEffect: H,
		on: N,
		children: T,
		onMount: $,
	} = await __vitePreload(
		async () => {
			const {
				createEffect: H,
				on: N,
				children: T,
				onMount: $,
			} = await import("./web.BwkxOWcj.js").then((n) => n.z);
			return { createEffect: H, on: N, children: T, onMount: $ };
		},
		true ? [] : void 0,
	);

const a = (t) => {
	try {
		navigator.clipboard.writeText(t.currentTarget.innerText),
			t.currentTarget.parentElement._tippy.setContent("Copied!");
	} catch (e) {
		console.log(e);
	}
};
var i = ({ children: t }) =>
	createComponent(E, {
		Content: "Copy to clipboard.",
		onHidden: (e) => e.setContent("Copy to clipboard."),
		get children() {
			return t(() => t);
		},
	});
await __vitePreload(
	() => import("./web.BwkxOWcj.js").then((n) => n.z),
	true ? [] : void 0,
);

export { a as Fn, i as default };
//# sourceMappingURL=Copy.DSDuzYr3.js.map
