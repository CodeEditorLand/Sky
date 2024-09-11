import { c as createComponent, s as spreadAttributes, d as renderSlotToString, e as renderAllHeadContent, u as unescapeHTML, r as renderTemplate, a as renderComponent, m as maybeRenderHead, f as renderSlot, b as renderScript } from './astro/server_Cdi4o6po.mjs';
import 'kleur/colors';
import { renderSync, parse, walkSync, ELEMENT_NODE } from 'ultrahtml';
import 'clsx';
/* empty css                          */

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

const $$Meta = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#ffffff"><meta name="format-detection" content="telephone=no"><meta name="twitter:dnt" content="on">`;
}, "D:/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/Function/Meta.astro", void 0);

const $$Base = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en" class="no-js" dir="ltr"> ${renderComponent($$result, "Head", Head, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "Meta", $$Meta, {})}<link rel="manifest" href="/site.webmanifest" crossorigin="use-credentials">${renderSlot($$result2, $$slots["StyleHead"])}${renderSlot($$result2, $$slots["ScriptHead"])}` })}${maybeRenderHead()}<body aria-label=""> <div class="grow p-5 text-center"> <ul class="flex"> <li class="px-5"> <a href="/Editor">Editor</a> </li> <li class="px-5"> <a href="/VSCode">VSCode</a> </li> </ul> </div> <div class="grow"> ${renderSlot($$result, $$slots["default"])} </div> ${renderScript($$result, "D:/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "D:/Developer/Application/CodeEditorLand/EcoSystem/Elements/Sky/Source/Function/Markup/Base.astro", void 0);

export { $$Base as $ };
