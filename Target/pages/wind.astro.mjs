import { b as createAstro, c as createComponent, d as renderComponent, a as renderTemplate, e as addAttribute, F as Fragment } from '../chunks/astro/server_BsnhRZ9g.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Base } from '../chunks/Base_C7n0mgZj.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://tauri.localhost");
const $$Wind = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Wind;
  const IsDevelopment = process.env["NODE_ENV"] === "development" || process.env["TAURI_ENV_DEBUG"] === "true";
  const Bust = (BasePath) => `${BasePath}${BasePath.includes("?") ? "&" : "?"}Time=${Date.now()}`;
  const WindEntryPoint = "/Target/Application/DesktopMain.js";
  const BridgeEntryPoint = "/Target/Bridge.js";
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "Head": ($$result2) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "slot": "Head" }, { "default": ($$result3) => renderTemplate(_a || (_a = __template(['\n		<script type="module"', '><\/script>\n\n		<script type="module"', " defer><\/script>\n	"])), addAttribute(Bust(BridgeEntryPoint), "src"), addAttribute(Bust(WindEntryPoint), "src")) })}`, "Meta": ($$result2) => renderTemplate`<meta http-equiv="Content-Security-Policy"${addAttribute(((Configuration) => {
    const Policy = [];
    for (const Directive in Configuration) {
      if (Object.prototype.hasOwnProperty.call(
        Configuration,
        Directive
      )) {
        const Value = Configuration[Directive];
        if (Value === null || Value === void 0 || Value === false) {
          continue;
        }
        if (Value === true) {
          Policy.push(Directive);
        } else if (Array.isArray(Value) && Value.length > 0) {
          Policy.push(`${Directive} ${Value.join(" ")}`);
        }
      }
    }
    return Policy.join("; ");
  })({
    "default-src": ["'none'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "vscode-remote-resource:",
      "vscode-managed-remote-resource:",
      "https:"
    ],
    "manifest-src": ["'self'"],
    "media-src": ["'self'"],
    "frame-src": ["'self'", "vscode-webview:"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "blob:"
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "connect-src": ["'self'", "wss://tauri.localhost", "https:"],
    "font-src": [
      "'self'",
      "vscode-remote-resource:",
      "vscode-managed-remote-resource:"
    ],
    "require-trusted-types-for": ["'script'"],
    "trusted-types": [
      "WorkerApplication",
      "amdLoader",
      "cellRendererEditorText",
      "defaultWorkerFactory",
      "diffEditorWidget",
      "diffReview",
      "domLineBreaksComputer",
      "dompurify",
      "editorGhostText",
      "editorViewLayer",
      "notebookRenderer",
      "stickyScrollViewLayer",
      "tokenizeToString",
      "notebookChatEditController"
    ],
    // Standalone directives are set to true
    "block-all-mixed-content": true,
    "upgrade-insecure-requests": true
  }), "content")}><meta id="vscode-workbench-web-configuration"${addAttribute(JSON.stringify({
    remoteAuthority: "",
    connectionToken: "",
    productConfiguration: {
      embedderIdentifier: "desktop",
      nameShort: "Wind",
      nameLong: "Wind Workbench",
      applicationName: "wind"
    },
    developmentOptions: {
      logLevel: IsDevelopment ? 2 : 0
      // 2 = trace, 0 = info
    }
  }), "data-settings")}>` })}`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Wind.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Wind.astro";
const $$url = "/Wind";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Wind,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=wind.astro.mjs.map
