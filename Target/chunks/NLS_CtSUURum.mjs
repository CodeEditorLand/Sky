import { c as createAstro, a as createComponent, e as addAttribute, b as renderTemplate, h as renderSlot, g as renderHead, r as renderComponent, d as renderScript } from './astro/server_snIBHQDC.mjs';
import 'piccolore';
import 'html-escaper';
import 'clsx';

const $$Astro = createAstro("https://editor.land");
const $$Meta = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Meta;
  const { Title = "FIDDEE", Description = "" } = Astro2.props;
  return renderTemplate`<title>${Title}</title><meta charset="utf-8"><meta name="description"${addAttribute(Description, "content")}><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title"${addAttribute(Title, "content")}><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"><meta name="theme-color" content="#ffffff"><meta name="format-detection" content="telephone=no"><meta name="twitter:dnt" content="on">`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Meta.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$Base = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a$1 || (_a$1 = __template$1(['<html lang="en" class="no-js" dir="ltr"> <head>', "", "", '<link rel="manifest" href="/Manifest.json" crossorigin="use-credentials"><!-- Global VSCode File Root - Must execute before module scripts --><script>\n			globalThis._VSCODE_FILE_ROOT = `${window.location.origin}/Static/Application/`;\n		<\/script>', '<!-- Favicon --><link rel="icon" type="image/png" href="/Favicon/favicon-96x96.png" sizes="96x96"><link rel="icon" type="image/svg+xml" href="/Favicon/favicon.svg"><link rel="shortcut icon" href="/Favicon/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="/Favicon/apple-touch-icon.png"><link rel="manifest" href="/Favicon/site.webmanifest">', '</head> <body aria-label=""> ', " </body></html>"], ['<html lang="en" class="no-js" dir="ltr"> <head>', "", "", '<link rel="manifest" href="/Manifest.json" crossorigin="use-credentials"><!-- Global VSCode File Root - Must execute before module scripts --><script>\n			globalThis._VSCODE_FILE_ROOT = \\`\\${window.location.origin}/Static/Application/\\`;\n		<\/script>', '<!-- Favicon --><link rel="icon" type="image/png" href="/Favicon/favicon-96x96.png" sizes="96x96"><link rel="icon" type="image/svg+xml" href="/Favicon/favicon.svg"><link rel="shortcut icon" href="/Favicon/favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="/Favicon/apple-touch-icon.png"><link rel="manifest" href="/Favicon/site.webmanifest">', '</head> <body aria-label=""> ', " </body></html>"])), renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro?astro&type=script&index=0&lang.ts"), renderComponent($$result, "Meta", $$Meta, {}), renderSlot($$result, $$slots["Meta"]), renderSlot($$result, $$slots["Head"]), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Function/Markup/Base.astro", void 0);

const On = process.env["NODE_ENV"] === "development" || process.env["TAURI_ENV_DEBUG"] === "true";
const Bust = (Base) => `${Base}${Base.includes("?") ? "&" : "?"}Time=${encodeURIComponent(Date.now())}`;

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$NLS = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<script type="module"', "><\/script>"])), addAttribute(Bust(
    `/Static/Application/${On ? "vs/" : ""}${On ? "nls.js" : "nls.messages.js"}`
  ), "src"));
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/NLS.astro", void 0);

export { $$Base as $, Bust as B, On as O, $$NLS as a };
