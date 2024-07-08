const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.BR99StaI.js",
			"_astro/Editor.sXdNa4bf.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as r } from "./Editor.sXdNa4bf.js";
import "./solid.-melTDdq.js";
var l = (e) => {
	const {
		children: t,
		Content: o,
		Class: n,
		onMount: c,
		onHidden: d,
	} = m({ children: "", Content: "", Class: "" }, e);
	let a;
	return (
		_(
			() => (
				p(a, {
					content: o ?? "",
					arrow: !1,
					inertia: !1,
					animation: "shift-away",
					theme: window.matchMedia("(prefers-color-scheme: dark)")
						.matches
						? "dark-border"
						: "light-border",
					hideOnClick: !1,
					onMount: (i) =>
						window
							.matchMedia("(prefers-color-scheme: dark)")
							.addEventListener("change", ({ matches: s }) =>
								i.setProps({
									theme: s ? "dark-border" : "light-border",
								}),
							),
					offset: [0, 5],
					placement: "bottom",
					interactive: !0,
					onHidden: (i) => d?.(i),
				}),
				c?.(a)
			),
		),
		React.createElement(
			"div",
			{ class: `Tip ${typeof n == "function" ? n() : n}`.trim(), ref: a },
			t(() => t)(),
		)
	);
};
const { default: m } = await r(
		() => import("./Merge.BR99StaI.js"),
		__vite__mapDeps([0, 1, 2]),
	),
	{ default: p } = await r(async () => {
		const { default: e } = await import("./tippy.esm.zzpVmJ-M.js");
		return { default: e };
	}, []),
	{
		createEffect: f,
		on: w,
		children: E,
		onMount: _,
	} = await r(async () => {
		const {
			createEffect: e,
			on: t,
			children: o,
			onMount: n,
		} = await import("./solid.-melTDdq.js");
		return { createEffect: e, on: t, children: o, onMount: n };
	}, []),
	C = (e) => {
		try {
			navigator.clipboard.writeText(e.currentTarget.innerText),
				e.currentTarget.parentElement._tippy.setContent("Copied!");
		} catch (t) {
			console.log(t);
		}
	};
var v = async ({ children: e }) =>
	React.createElement(
		l,
		{
			Content: "Copy to clipboard.",
			onHidden: (t) => t.setContent("Copy to clipboard."),
		},
		(
			await r(async () => {
				const { children: t } = await import("./solid.-melTDdq.js");
				return { children: t };
			}, [])
		).children(() => e),
	);
export { C as Fn, v as default };
//# sourceMappingURL=Copy.B7RbcMYi.js.map
