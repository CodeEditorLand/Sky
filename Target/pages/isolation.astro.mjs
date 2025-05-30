import { c as createComponent, g as renderHead, r as renderScript, a as renderTemplate } from '../chunks/astro/server_QvYx1wwB.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Isolation = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><title>Isolation Secure Script</title>${renderHead()}</head> <body> ${renderScript($$result, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Isolation.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Isolation.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Isolation.astro";
const $$url = "/Isolation";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Isolation,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
