import { c as createComponent, r as renderComponent, a as renderTemplate, b as renderScript } from '../chunks/astro/server_eaf4czH-.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_BHMpyf7H.mjs';
export { renderers } from '../renderers.mjs';

const $$VSCode = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "default": ($$result2) => renderTemplate`  ${renderScript($$result2, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/VSCode.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/VSCode.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/VSCode.astro";
const $$url = "/VSCode";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$VSCode,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
