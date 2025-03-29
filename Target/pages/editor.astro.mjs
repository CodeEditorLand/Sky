import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_CLh5P_TT.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_GtfNWNpk.mjs';
export { renderers } from '../renderers.mjs';

const $$Editor = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Page", null, { "client:only": "solid-js", "client:component-hydration": "only", "client:component-path": "@codeeditorland/wind/Target/Element/Page/Editor.js", "client:component-export": "default" })} ` })}`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Editor.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Editor.astro";
const $$url = "/Editor";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Editor,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
