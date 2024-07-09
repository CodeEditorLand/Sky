const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.CNl4N7U9.js",
			"_astro/Editor.DUXgpfsS.js",
			"_astro/web.B9Xaj9_E.js",
		]),
) => i.map((i) => d[i]);
import { _ as i } from "./Editor.DUXgpfsS.js";
import { t as l, u, i as m, d as p, e as f, c as h } from "./web.B9Xaj9_E.js";
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
					typeof a == "function" ? u(a, t) : (o = t),
					m(t, () => r(() => r)()),
					p(() =>
						f(t, `Tip ${typeof n == "function" ? n() : n}`.trim()),
					),
					t
				);
			})()
		);
	};
const { default: E } = await i(
		() => import("./Merge.CNl4N7U9.js"),
		__vite__mapDeps([0, 1, 2]),
	),
	{ default: v } = await i(async () => {
		const { default: e } = await import("./tippy.esm.zzpVmJ-M.js");
		return { default: e };
	}, []),
	{
		createEffect: b,
		on: g,
		children: M,
		onMount: C,
	} = await i(async () => {
		const {
			createEffect: e,
			on: r,
			children: c,
			onMount: n,
		} = await import("./web.B9Xaj9_E.js").then((d) => d.z);
		return { createEffect: e, on: r, children: c, onMount: n };
	}, []),
	P = (e) => {
		try {
			navigator.clipboard.writeText(e.currentTarget.innerText),
				e.currentTarget.parentElement._tippy.setContent("Copied!");
		} catch (r) {
			console.log(r);
		}
	};
var k = ({ children: e }) =>
	h(w, {
		Content: "Copy to clipboard.",
		onHidden: (r) => r.setContent("Copy to clipboard."),
		get children() {
			return e(() => e);
		},
	});
await i(() => import("./web.B9Xaj9_E.js").then((e) => e.z), []);
export { P as Fn, k as default };
//# sourceMappingURL=Copy.c1NBGk_a.js.map
