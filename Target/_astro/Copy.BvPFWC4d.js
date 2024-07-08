const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.CzTQzxlv.js",
			"_astro/Editor.BrGPxqy1.js",
			"_astro/web.Dh-3o7rH.js",
		]),
) => i.map((i) => d[i]);
import { _ as i } from "./Editor.BrGPxqy1.js";
import {
	t as l,
	k as f,
	i as m,
	f as p,
	g as u,
	c as h,
} from "./web.Dh-3o7rH.js";
var _ = l("<div>"),
	w = (e) => {
		const {
			children: r,
			Content: c,
			Class: n,
			onMount: d,
			onHidden: s,
		} = E({ children: "", Content: "", Class: "" }, e);
		let o;
		return (
			C(
				() => (
					v(o, {
						content: c ?? "",
						arrow: !1,
						inertia: !1,
						animation: "shift-away",
						theme: window.matchMedia("(prefers-color-scheme: dark)")
							.matches
							? "dark-border"
							: "light-border",
						hideOnClick: !1,
						onMount: (t) =>
							window
								.matchMedia("(prefers-color-scheme: dark)")
								.addEventListener("change", ({ matches: a }) =>
									t.setProps({
										theme: a
											? "dark-border"
											: "light-border",
									}),
								),
						offset: [0, 5],
						placement: "bottom",
						interactive: !0,
						onHidden: (t) => s?.(t),
					}),
					d?.(o)
				),
			),
			(() => {
				var t = _(),
					a = o;
				return (
					typeof a == "function" ? f(a, t) : (o = t),
					m(t, () => r(() => r)()),
					p(() =>
						u(t, `Tip ${typeof n == "function" ? n() : n}`.trim()),
					),
					t
				);
			})()
		);
	};
const { default: E } = await i(
		() => import("./Merge.CzTQzxlv.js"),
		__vite__mapDeps([0, 1, 2]),
	),
	{ default: v } = await i(async () => {
		const { default: e } = await import("./tippy.esm.zzpVmJ-M.js");
		return { default: e };
	}, []),
	{
		createEffect: y,
		on: b,
		children: M,
		onMount: C,
	} = await i(async () => {
		const {
			createEffect: e,
			on: r,
			children: c,
			onMount: n,
		} = await import("./web.Dh-3o7rH.js").then((d) => d.B);
		return { createEffect: e, on: r, children: c, onMount: n };
	}, []),
	k = (e) => {
		try {
			navigator.clipboard.writeText(e.currentTarget.innerText),
				e.currentTarget.parentElement._tippy.setContent("Copied!");
		} catch (r) {
			console.log(r);
		}
	};
var P = ({ children: e }) =>
	h(w, {
		Content: "Copy to clipboard.",
		onHidden: (r) => r.setContent("Copy to clipboard."),
		get children() {
			return e(() => e);
		},
	});
await i(() => import("./web.Dh-3o7rH.js").then((e) => e.B), []);
export { k as Fn, P as default };
//# sourceMappingURL=Copy.BvPFWC4d.js.map
