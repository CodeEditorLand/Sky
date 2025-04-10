import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, d as defineScriptVars, e as addAttribute } from '../chunks/astro/server_DLATyTcl.mjs';
import 'kleur/colors';
import { $ as $$Base } from '../chunks/Base_VoOi3sGR.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b;
const $$Astro = createAstro("http://tauri.localhost");
const $$VSCode = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$VSCode;
  const Site = Astro2.site;
  const Worker = `/Worker.js?BASE_REMOTE=${encodeURIComponent(Site?.toString() ?? Astro2.url.origin)}`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "Head": ($$result2) => renderTemplate(_a || (_a = __template(['<meta id="vscode-workbench-web-configuration"', '><script type="importmap">\n		{\n			"imports": {\n				"vscode": "/Static/Shim/Empty.js"\n			}\n		}\n	<\/script><script type="module">', '\n		// @ts-expect-error\n		globalThis._VSCODE_FILE_ROOT = `${Site}/Static/VSCode/`;\n	<\/script><script type="module" src="/Worker/CSS/Load.js" defer><\/script><script type="module">', '\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script><script type="module" src="/Worker/Register.js" defer><\/script>'], ['<meta id="vscode-workbench-web-configuration"', '><script type="importmap">\n		{\n			"imports": {\n				"vscode": "/Static/Shim/Empty.js"\n			}\n		}\n	<\/script><script type="module">', '\n		// @ts-expect-error\n		globalThis._VSCODE_FILE_ROOT = \\`\\${Site}/Static/VSCode/\\`;\n	<\/script><script type="module" src="/Worker/CSS/Load.js" defer><\/script><script type="module">', '\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script><script type="module" src="/Worker/Register.js" defer><\/script>'])), addAttribute(JSON.stringify({
    remoteAuthority: Astro2.url.host,
    serverBasePath: "/",
    developmentOptions: { logLevel: 3 },
    enableWorkspaceTrust: true,
    productConfiguration: { embedderIdentifier: "server-distro" },
    callbackRoute: "/oss-dev/callback"
  }), "data-settings"), defineScriptVars({ Site }), defineScriptVars({ Worker })), "default": ($$result2) => renderTemplate(_b || (_b = __template(['       <script type="module" src="/Static/VSCode/vs/code/browser/workbench/workbench.js" defer><\/script> ']))) })}`;
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
