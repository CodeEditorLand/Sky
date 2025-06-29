import { c as createComponent, r as renderScript, a as renderTemplate, b as createAstro, d as renderComponent, F as Fragment, e as addAttribute, f as defineScriptVars } from '../chunks/astro/server_BsnhRZ9g.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Base } from '../chunks/Base_C7n0mgZj.mjs';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Browser = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderScript($$result, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Browser.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Browser.astro", void 0);

const $$Default = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderScript($$result, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Default.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Default.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b, _c, _d, _e;
const $$Astro = createAstro("https://tauri.localhost");
const $$Application = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Application;
  const On = process.env["NODE_ENV"] === "development" || process.env["TAURI_ENV_DEBUG"] === "true";
  const Bundle = process.env["Bundle"] === "true";
  const Browser = process.env["Browser"] === "true";
  const Site = Astro2.site;
  const Worker = `/Worker.js?BASE_REMOTE=${encodeURIComponent(Site?.toString() ?? Astro2.url.origin)}`;
  const Bust = (Base) => `${Base}${Base.includes("?") ? "&" : "?"}Time=${encodeURIComponent(Date.now())}`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "Head": ($$result2) => renderTemplate(_a || (_a = __template(['<script type="module">', '\n		// @ts-expect-error\n		globalThis._VSCODE_FILE_ROOT = `${Site}Static/Application/`;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script>"], ['<script type="module">', '\n		// @ts-expect-error\n		globalThis._VSCODE_FILE_ROOT = \\`\\${Site}Static/Application/\\`;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script>"])), defineScriptVars({ Site }), defineScriptVars({ Worker: Bust(Worker) })), "Meta": ($$result2) => renderTemplate`<meta http-equiv="Content-Security-Policy"${addAttribute(((Configuration) => {
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
    serverBasePath: "",
    connectionToken: "",
    enableWorkspaceTrust: true,
    settingsSyncOptions: { enabled: false },
    productConfiguration: {
      embedderIdentifier: Browser ? "web" : "desktop",
      nameShort: "FIDDEE",
      nameLong: "FIDDEE",
      applicationName: "fiddee"
    },
    developmentOptions: {
      logLevel: On ? 2 : 0,
      enableSmokeTestDriver: On
    }
  }), "data-settings")}><meta id="vscode-workbench-auth-session"${addAttribute(JSON.stringify({}), "data-settings")}>`, "default": ($$result2) => renderTemplate`
	

	

	

	

	

	${Bundle ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate(_b || (_b = __template(["\n				", '\n\n				<script type="module"', "><\/script>\n\n				", ""])), renderScript($$result3, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Application.astro?astro&type=script&index=0&lang.ts"), addAttribute(Bust(
    `/Static/Application/${On ? "vs/" : ""}nls.messages.js`
  ), "src"), Browser ? renderTemplate`${renderComponent($$result3, "BrowserWorkbench", $$Browser, {})}` : renderTemplate`${renderComponent($$result3, "DefaultWorkbench", $$Default, {})}`) })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate(_e || (_e = __template(['\n				<script type="module"', ' defer><\/script>\n\n				<script type="module"', '><\/script>\n\n				<script type="module"', ' defer><\/script>\n\n				<script type="module"', "><\/script>\n\n				", ""])), addAttribute(Bust("/Worker/CSS/Load.js"), "src"), addAttribute(Bust("/Worker/Policy.js"), "src"), addAttribute(Bust("/Worker/Register.js"), "src"), addAttribute(Bust(
    `/Static/Application/${On ? "vs/" : ""}nls.messages.js`
  ), "src"), Browser ? renderTemplate(_c || (_c = __template(['<script type="module"', " defer><\/script>"])), addAttribute(Bust(
    "/Static/Application/vs/code/browser/workbench/workbench.js"
  ), "src")) : renderTemplate(_d || (_d = __template(['<script type="module"', " defer><\/script>"])), addAttribute(Bust(
    "/Static/Application/vs/code/electron-sandbox/workbench/workbench.js"
  ), "src"))) })}`}` })}`;
}, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Application.astro", void 0);

const $$file = "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Application.astro";
const $$url = "/Application";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Application,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
//# sourceMappingURL=application.astro.mjs.map
