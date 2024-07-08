const __vite__mapDeps = (
	i,
	m = __vite__mapDeps,
	d = m.f ||
		(m.f = [
			"_astro/Merge.4KF2jO6K.js",
			"_astro/Editor.DCPGuuul.js",
			"_astro/solid.-melTDdq.js",
		]),
) => i.map((i) => d[i]);
import { _ as r } from "./Editor.DCPGuuul.js";
import "./solid.-melTDdq.js";
var u = (t) => {
	const {
		Action: n,
		Type: o,
		children: a,
		Class: e,
		Label: i,
	} = l(
		{
			children: "",
			Type: "button",
			Action: () => {},
			Class: "",
			Label: "",
		},
		t,
	);
	return React.createElement(
		"button",
		{
			class: `Button ${typeof e == "function" ? e(t.Fn) : e}`.trim(),
			onClick: () => {
				n(t.Fn), t.Fn?.blur();
			},
			type: o,
			"aria-label": i,
		},
		a(() => a)(),
	);
};
await r(() => import("./solid.-melTDdq.js"), []);
const { default: l } = await r(
	async () => {
		const { default: t } = await import("./Merge.4KF2jO6K.js");
		return { default: t };
	},
	__vite__mapDeps([0, 1, 2]),
);
export { l as Merge, u as default };
//# sourceMappingURL=Button.CVVA-J7s.js.map
