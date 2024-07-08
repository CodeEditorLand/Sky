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
import { _ as n } from "./Editor.BrGPxqy1.js";
import { t as c, s, i as u, f as _, g as d, j as f } from "./web.Dh-3o7rH.js";
var p = c("<button>"),
	E = (t) => {
		const {
			Action: i,
			Type: o,
			children: r,
			Class: e,
			Label: l,
		} = m(
			{
				children: "",
				Type: "button",
				Action: () => {},
				Class: "",
				Label: "",
			},
			t,
		);
		return (() => {
			var a = p();
			return (
				(a.$$click = () => {
					i(t.Fn), t.Fn?.blur();
				}),
				s(a, "type", o),
				s(a, "aria-label", l),
				u(a, () => r(() => r)()),
				_(() =>
					d(
						a,
						`Button ${typeof e == "function" ? e(t.Fn) : e}`.trim(),
					),
				),
				a
			);
		})();
	};
await n(() => import("./web.Dh-3o7rH.js").then((t) => t.B), []);
const { default: m } = await n(
	async () => {
		const { default: t } = await import("./Merge.CzTQzxlv.js");
		return { default: t };
	},
	__vite__mapDeps([0, 1, 2]),
);
f(["click"]);
export { m as Merge, E as default };
//# sourceMappingURL=Button.jcqywE9T.js.map
