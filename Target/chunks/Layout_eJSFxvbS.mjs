import { c as createAstro, a as createComponent, r as renderComponent, F as Fragment, b as renderTemplate } from './astro/server_snIBHQDC.mjs';
import 'piccolore';
import 'html-escaper';
import { a as $$NLS } from './NLS_CtSUURum.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://editor.land");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate(_a || (_a = __template(["", '<script type="module">\n		await import("./WindPreload.js");\n	<\/script><script type="module">\n		await import("./ServicesProxy.js");\n	<\/script><script type="module">\n		await import("./Bootstrap.js");\n	<\/script><script type="module">\n		await import("./Workbench.js");\n	<\/script>'])), renderComponent($$result2, "NLS", $$NLS, {})) })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/BrowserProxy/Layout.astro", void 0);

export { $$Layout as $ };
