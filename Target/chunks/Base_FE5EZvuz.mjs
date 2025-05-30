import { b as createAstro, c as createComponent, e as addAttribute, a as renderTemplate, r as renderScript, d as renderComponent, h as renderSlot, g as renderHead } from './astro/server_QvYx1wwB.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';

const $$Astro = createAstro("https://tauri.localhost");
const $$Meta = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Meta;
  const { Title = "FIDDEE", Description = "" } = Astro2.props;
  return renderTemplate`<title>${Title}</title><meta charset="utf-8"><meta name="description"${addAttribute(Description, "content")}><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="FIDDEE"><!-- <link rel="apple-touch-icon" href="{{WORKBENCH_WEB_BASE_URL}}/resources/server/code-192.png" /> --><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"><meta name="theme-color" content="#ffffff"><meta name="format-detection" content="telephone=no"><meta name="twitter:dnt" content="on">`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Meta.astro", void 0);

const $$Base = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en" class="no-js" dir="ltr"> <head>${renderScript($$result, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=0&lang.ts")}${renderComponent($$result, "Meta", $$Meta, {})}${renderSlot($$result, $$slots["Meta"])}<link rel="manifest" href="/Manifest.json" crossorigin="use-credentials">${renderSlot($$result, $$slots["Head"])}${renderHead()}</head> <body aria-label=""> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro", void 0);

export { $$Base as $ };
