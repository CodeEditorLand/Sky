import { c as createAstro, a as createComponent, r as renderComponent, b as renderTemplate, F as Fragment, d as renderScript, e as addAttribute, f as defineScriptVars } from '../chunks/astro/server_snIBHQDC.mjs';
import 'piccolore';
import 'html-escaper';
import { $ as $$Base, B as Bust, O as On } from '../chunks/NLS_CtSUURum.mjs';
import { $ as $$Layout } from '../chunks/Layout_eJSFxvbS.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b;
const $$Astro = createAstro("https://editor.land");
const $$BrowserProxy = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BrowserProxy;
  const Bundle = process.env["Bundle"] === "true";
  const Worker = `/Worker.js?BASE_REMOTE=${encodeURIComponent(Astro2.url.origin)}`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "Head": ($$result2) => renderTemplate(_a || (_a = __template(['<script>\n		globalThis._VSCODE_FILE_ROOT = `${window.location.origin}/Static/Application/`;\n	<\/script><script type="module">', '\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		globalThis.__BOOTSTRAP_DEBUG__ = On;\n	<\/script>"], ['<script>\n		globalThis._VSCODE_FILE_ROOT = \\`\\${window.location.origin}/Static/Application/\\`;\n	<\/script><script type="module">', '\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		globalThis.__BOOTSTRAP_DEBUG__ = On;\n	<\/script>"])), defineScriptVars({ Worker: Bust(Worker) }), defineScriptVars({ On })), "Meta": ($$result2) => renderTemplate`<meta http-equiv="Content-Security-Policy"${addAttribute(((Configuration) => {
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
      "http://localhost:*",
      "https://tauri.localhost",
      "https:"
    ],
    "manifest-src": [
      "'self'",
      "http://localhost:*",
      "https://tauri.localhost"
    ],
    "media-src": [
      "'self'",
      "http://localhost:*",
      "https://tauri.localhost"
    ],
    "frame-src": [
      "'self'",
      "vscode-webview:",
      "http://localhost:*",
      "https://tauri.localhost"
    ],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "blob:",
      "http://localhost:*",
      "https://tauri.localhost"
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      "http://localhost:*",
      "https://tauri.localhost"
    ],
    "connect-src": [
      "'self'",
      "http://localhost:*",
      "https://tauri.localhost",
      "wss://tauri.localhost",
      "https:"
    ],
    "font-src": [
      "'self'",
      "vscode-remote-resource:",
      "vscode-managed-remote-resource:",
      "http://localhost:*",
      "https://tauri.localhost"
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
      "notebookChatEditController",
      "richScreenReaderContent",
      "collapsedCellPreview"
    ],
    "block-all-mixed-content": true,
    "upgrade-insecure-requests": false
  }), "content")}><meta id="vscode-workbench-web-configuration"${addAttribute(JSON.stringify({
    remoteAuthority: "",
    serverBasePath: "/",
    connectionToken: "dummy-token",
    enableWorkspaceTrust: true,
    settingsSyncOptions: { enabled: false },
    productConfiguration: {
      embedderIdentifier: "browser",
      nameShort: "FIDDEE",
      nameLong: "FIDDEE",
      applicationName: "fiddee"
    },
    developmentOptions: {
      logLevel: 2,
      enableSmokeTestDriver: true
    }
  }), "data-settings")}><meta id="vscode-workbench-auth-session"${addAttribute(JSON.stringify({}), "data-settings")}>`, "default": ($$result2) => renderTemplate`              ${Bundle ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` ${renderScript($$result3, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/BrowserProxy.astro?astro&type=script&index=0&lang.ts")} ${renderComponent($$result3, "BrowserProxyWorkbench", $$Layout, {})} ` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate(_b || (_b = __template([' <script type="module"', ' defer><\/script> <script type="module"', '><\/script> <script type="module"', " defer><\/script> ", " "])), addAttribute(Bust("/Worker/CSS/Load.js"), "src"), addAttribute(Bust("/Worker/Policy.js"), "src"), addAttribute(Bust("/Worker/Register.js"), "src"), renderComponent($$result3, "BrowserProxyWorkbench", $$Layout, {})) })}`}` })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/BrowserProxy.astro", void 0);

const $$file = "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/BrowserProxy.astro";
const $$url = "/BrowserProxy";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$BrowserProxy,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
