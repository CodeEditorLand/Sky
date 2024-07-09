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
import { _ as n } from "./Editor.DUXgpfsS.js";
import { t as c, s, i as u, d as _, e as d, f } from "./web.B9Xaj9_E.js";
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
await n(() => import("./web.B9Xaj9_E.js").then((t) => t.z), []);
const { default: m } = await n(
	async () => {
		const { default: t } = await import("./Merge.CNl4N7U9.js");
		return { default: t };
	},
	__vite__mapDeps([0, 1, 2]),
);
f(["click"]);
export { m as Merge, E as default };
//# sourceMappingURL=Button.BO5qjWXt.js.map
