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
	s as setAttribute,
	i as insert,
	f as createRenderEffect,
	g as className,
	j as delegateEvents,
} from "./web.BwkxOWcj.js";

var u = template("<button>");
var x = (e) => {
	const {
		Action: o,
		Type: s,
		children: r,
		Class: a,
		Label: l,
	} = $(
		{
			children: "",
			Type: "button",
			Action: () => {},
			Class: "",
			Label: "",
		},
		e,
	);
	return (() => {
		var t = u();
		return (
			(t.$$click = () => {
				o(e.Fn), e.Fn?.blur();
			}),
			setAttribute(t, "type", s),
			setAttribute(t, "aria-label", l),
			insert(t, () => r(() => r)()),
			createRenderEffect(() =>
				className(
					t,
					`Button ${typeof a == "function" ? a(e.Fn) : a}`.trim(),
				),
			),
			t
		);
	})();
};
await __vitePreload(
	() => import("./web.BwkxOWcj.js").then((n) => n.z),
	true ? [] : void 0,
);
const { default: $ } = await __vitePreload(
	async () => {
		const { default: $ } = await import("./Merge.CihF0fIl.js");
		return { default: $ };
	},
	true ? __vite__mapDeps([0, 1, 2]) : void 0,
);
delegateEvents(["click"]);

export { $ as Merge, x as default };
//# sourceMappingURL=Button.CPqykquI.js.map
