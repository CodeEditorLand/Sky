import { b as createAstro, c as createComponent, e as addAttribute, a as renderTemplate, s as spreadAttributes, f as renderSlotToString, g as renderAllHeadContent, u as unescapeHTML, h as renderSlot, m as maybeRenderHead, r as renderComponent, i as renderScript } from './astro/server_DLATyTcl.mjs';
import 'kleur/colors';
/* empty css                          */
import 'clsx';
import { renderSync, parse, walkSync, ELEMENT_NODE } from 'ultrahtml';

const $$Astro = createAstro("http://tauri.localhost");
const $$Meta = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Meta;
  const { Title = "", Description = "" } = Astro2.props;
  return renderTemplate`<title>${Title}</title><meta charset="utf-8"><meta name="description"${addAttribute(Description, "content")}><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#ffffff"><meta name="format-detection" content="telephone=no"><meta name="twitter:dnt" content="on">`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Meta.astro", void 0);

function has(value) {
  return typeof value === "string";
}
function is(a, b) {
  return a === b;
}
function any(a, b) {
  return has(a) && b.includes(a.toLowerCase());
}
const ElementWeights = {
  META: 10,
  TITLE: 9,
  PRECONNECT: 8,
  ASYNC_SCRIPT: 7,
  IMPORT_STYLES: 6,
  SYNC_SCRIPT: 5,
  SYNC_STYLES: 4,
  PRELOAD: 3,
  DEFER_SCRIPT: 2,
  PREFETCH_PRERENDER: 1,
  OTHER: 0
};
const ElementDetectors = {
  META: isMeta,
  TITLE: isTitle,
  PRECONNECT: isPreconnect,
  DEFER_SCRIPT: isDeferScript,
  ASYNC_SCRIPT: isAsyncScript,
  IMPORT_STYLES: isImportStyles,
  SYNC_SCRIPT: isSyncScript,
  SYNC_STYLES: isSyncStyles,
  PRELOAD: isPreload,
  PREFETCH_PRERENDER: isPrefetchPrerender
};
const META_HTTP_EQUIV_KEYWORDS = [
  "accept-ch",
  "content-security-policy",
  "content-type",
  "default-style",
  "delegate-ch",
  "origin-trial",
  "x-dns-prefetch-control"
];
function isMeta(name, a) {
  if (name === "base") return true;
  if (name !== "meta") return false;
  return has(a.charset) || is(a.name, "viewport") || any(a["http-equiv"], META_HTTP_EQUIV_KEYWORDS);
}
function isTitle(name) {
  return name === "title";
}
function isPreconnect(name, { rel }) {
  return name === "link" && is(rel, "preconnect");
}
function isAsyncScript(name, { src, async }) {
  return name === "script" && has(src) && has(async);
}
function isImportStyles(name, a, children) {
  const importRe = /@import/;
  if (name === "style") {
    return importRe.test(children);
  }
  return false;
}
function isSyncScript(name, { src, defer, async, type = "" }) {
  if (name !== "script") return false;
  return !(has(src) && (has(defer) || has(async) || is(type, "module")) || type.includes("json"));
}
function isSyncStyles(name, { rel }) {
  if (name === "style") return true;
  return name === "link" && is(rel, "stylesheet");
}
function isPreload(name, { rel }) {
  return name === "link" && any(rel, ["preload", "modulepreload"]);
}
function isDeferScript(name, { src, defer, async, type }) {
  if (name !== "script") return false;
  return has(src) && has(defer) || has(src) && is(type, "module") && !has(async);
}
function isPrefetchPrerender(name, { rel }) {
  return name === "link" && any(rel, ["prefetch", "dns-prefetch", "prerender"]);
}
function getWeight(element) {
  for (const [id, detector] of Object.entries(ElementDetectors)) {
    const children = element.name === "style" && element.children.length > 0 ? renderSync(element) : "";
    if (detector(element.name, element.attributes, children)) {
      return ElementWeights[id];
    }
  }
  return ElementWeights.OTHER;
}

function capo(html) {
  const ast = parse(html);
  try {
    walkSync(ast, (node, parent, index) => {
      if (node.type === ELEMENT_NODE && node.name === "head") {
        if (parent) {
          parent.children.splice(index, 1, getSortedHead(node));
          throw "done";
        }
      }
    });
  } catch (e) {
    if (e !== "done") throw e;
  }
  return renderSync(ast);
}
function getSortedHead(head) {
  const weightedChildren = head.children.map((node) => {
    if (node.type === ELEMENT_NODE) {
      const weight = getWeight(node);
      return [weight, node];
    }
  }).filter(Boolean);
  const children = weightedChildren.sort((a, b) => b[0] - a[0]).map(([_, element]) => element);
  return { ...head, children };
}

const Head = createComponent({
  factory: async (result, props, slots) => {
    let head = "";
    head += `<head${spreadAttributes(props)} data-capo>`;
    head += await renderSlotToString(result, slots.default);
    head += renderAllHeadContent(result);
    head += "</head>";
    return unescapeHTML(capo(head));
  }
});

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Base = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<html lang="en" class="no-js" dir="ltr"> ', "", '<body aria-label=""> <div class="grow p-5 text-center"> <ul class="flex"> <li class="px-5"> <a href="/Editor">Editor</a> </li> <li class="px-5"> <a href="/VSCode">VSCode</a> </li> </ul> </div> <div class="grow"> ', ' </div> <!-- <script>\n			import "@Source/Function/API.js";\n		<\/script> --> </body></html>'])), renderComponent($$result, "Head", Head, {}, { "default": ($$result2) => renderTemplate`${renderScript($$result2, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=0&lang.ts")}${renderComponent($$result2, "Meta", $$Meta, {})}<link rel="preconnect" href="HTTPS://fonts.googleapis.com" crossorigin><link rel="preconnect" href="HTTPS://fonts.gstatic.com" crossorigin><link rel="manifest" href="/Manifest.json" crossorigin="use-credentials">${renderSlot($$result2, $$slots["Head"])}` }), maybeRenderHead(), renderSlot($$result, $$slots["default"]));
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro", void 0);

export { $$Base as $ };
