const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.ByNSwOnA.js",
			"_astro/Editor.UyuTmccq.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as r } from "./Editor.UyuTmccq.js";
import "./solid.-melTDdq.js";
var s = (e) => {
	const {
		children: t,
		Content: n,
		Class: o,
		onMount: c,
		onHidden: d,
	} = m({ children: "", Content: "", Class: "" }, e);
	let a;
	return (
		_(
			() => (
				p(a, {
					content: n ?? "",
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
							.addEventListener("change", ({ matches: l }) =>
								i.setProps({
									theme: l ? "dark-border" : "light-border",
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
			{ class: `Tip ${typeof o == "function" ? o() : o}`.trim(), ref: a },
			t(() => t)(),
		)
	);
};
const { default: m } = await r(
		() => import("./Merge.ByNSwOnA.js"),
		__vite__mapDeps([0, 1, 2]),
	),
	{ default: p } = await r(async () => {
		const { default: e } = await import("./tippy.esm.zzpVmJ-M.js");
		return { default: e };
	}, []),
	{
		createEffect: h,
		on: w,
		children: E,
		onMount: _,
	} = await r(async () => {
		const {
			createEffect: e,
			on: t,
			children: n,
			onMount: o,
		} = await import("./solid.-melTDdq.js");
		return { createEffect: e, on: t, children: n, onMount: o };
	}, []),
	C = (e) => {
		try {
			navigator.clipboard.writeText(e.currentTarget.innerText),
				e.currentTarget.parentElement._tippy.setContent("Copied!");
		} catch (t) {
			console.log(t);
		}
	};
var v = ({ children: e }) =>
	React.createElement(
		s,
		{
			Content: "Copy to clipboard.",
			onHidden: (t) => t.setContent("Copy to clipboard."),
		},
		e(() => e),
	);
await r(() => import("./solid.-melTDdq.js"), []);
export { C as Fn, v as default };
//# sourceMappingURL=Copy.hMhD-6sj.js.map
