import { a as createComponent, g as renderHead, d as renderScript, b as renderTemplate } from '../chunks/astro/server_snIBHQDC.mjs';
import 'piccolore';
import 'html-escaper';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Isolation = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><title>Isolation Secure Script</title>${renderHead()}</head> <body> ${renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Isolation.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Isolation.astro", void 0);

const $$file = "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Isolation.astro";
const $$url = "/Isolation";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Isolation,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
