import { c as createComponent, d as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_QvYx1wwB.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Base } from '../chunks/Base_FE5EZvuz.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<a href="/Application">Application</a> ` })}`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/index.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
