import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_BqPYZAJa.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_CP69Y--p.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {})}`;
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
