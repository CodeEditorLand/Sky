import { a as createComponent, r as renderComponent, F as Fragment, b as renderTemplate, m as maybeRenderHead, c as createAstro, d as renderScript, e as addAttribute, f as defineScriptVars } from '../chunks/astro/server_snIBHQDC.mjs';
import 'piccolore';
import 'html-escaper';
import { a as $$NLS, $ as $$Base, B as Bust, O as On } from '../chunks/NLS_CtSUURum.mjs';
import { $ as $$Browser } from '../chunks/Browser_DUwBaTzG.mjs';
import { $ as $$Layout$1 } from '../chunks/Layout_eJSFxvbS.mjs';
import { $ as $$Layout } from '../chunks/Layout_Dl2EsjPV.mjs';
import { $ as $$Mountain } from '../chunks/Mountain_DLeRBFsm.mjs';
export { renderers } from '../renderers.mjs';

const $$Default = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "NLS", $$NLS, {})}${maybeRenderHead()}<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; color: var(--vscode-editor-foreground); background: var(--vscode-editor-background);"><h1>Workbench Entry Point</h1><p>
This page is deprecated. Please use one of the approach-specific
			workbench pages:
</p><ul style="text-align: left;"><li><a href="/BrowserProxy.html" style="color: var(--vscode-textLink-foreground);">A1: BrowserProxy.astro</a> - Browser workbench + services proxy (70-80% features)
</li><li><a href="/Mountain.html" style="color: var(--vscode-textLink-foreground);"><strong>A2: Mountain.astro (RECOMMENDED)</strong></a> - Browser workbench + Mountain providers (80-90% features)
</li><li><a href="/Electron.html" style="color: var(--vscode-textLink-foreground);">A3: Electron.astro</a> - Electron workbench + polyfills (95%+ features)
</li></ul></div>` })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Default.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a, _b, _c;
const $$Astro = createAstro("https://editor.land");
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const Bundle = process.env["Bundle"] === "true";
  process.env["Browser"] === "true";
  const Mountain = process.env["Mountain"] === "true";
  const Electron = process.env["Electron"] === "true";
  const BrowserProxy = process.env["BrowserProxy"] === "true";
  const WorkbenchType = Electron ? "Electron" : Mountain ? "Mountain" : BrowserProxy ? "BrowserProxy" : "Browser";
  const EmbedderId = Electron ? "desktop" : "browser";
  const Worker = `/Worker.js?BASE_REMOTE=${encodeURIComponent(Astro2.url.origin)}`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "Head": ($$result2) => renderTemplate(_a || (_a = __template(['<script type="module">', '\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		globalThis.__BOOTSTRAP_DEBUG__ = On;\n	<\/script><script>(function(){", '\n		// @ts-expect-error\n		console.log("[Application] Workbench Type:", WorkbenchType);\n	})();<\/script>'])), defineScriptVars({ Worker: Bust(Worker) }), defineScriptVars({ On }), defineScriptVars({ WorkbenchType })), "Meta": ($$result2) => renderTemplate`<meta http-equiv="Content-Security-Policy"${addAttribute((() => {
    const Policy = [];
    const Configuration = {
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
        "vscode-webview.net",
        "*.vscode-cdn.net",
        "*.vscode-webview.net",
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
    };
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
  })(), "content")}><meta id="vscode-workbench-web-configuration"${addAttribute(JSON.stringify({
    remoteAuthority: "",
    serverBasePath: "/",
    connectionToken: "dummy-token",
    enableWorkspaceTrust: true,
    settingsSyncOptions: { enabled: false },
    productConfiguration: {
      embedderIdentifier: EmbedderId,
      nameShort: "FIDDEE",
      nameLong: "FIDDEE",
      applicationName: "fiddee"
    },
    developmentOptions: {
      logLevel: On ? 2 : 0,
      enableSmokeTestDriver: On
    }
  }), "data-settings")}><meta id="vscode-workbench-auth-session"${addAttribute(JSON.stringify({
    authProvider: "github",
    session: {}
  }), "data-settings")}>`, "default": ($$result2) => renderTemplate`              ${Bundle ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` ${renderScript($$result3, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/index.astro?astro&type=script&index=0&lang.ts")} ${WorkbenchType === "Electron" ? renderTemplate`${renderComponent($$result3, "ElectronWorkbench", $$Layout, {})}` : WorkbenchType === "Mountain" ? renderTemplate`${renderComponent($$result3, "MountainWorkbench", $$Mountain, {})}` : WorkbenchType === "BrowserProxy" ? renderTemplate`${renderComponent($$result3, "BrowserProxyWorkbench", $$Layout$1, {})}` : WorkbenchType === "Browser" ? renderTemplate`${renderComponent($$result3, "BrowserWorkbench", $$Browser, {})}` : renderTemplate`${renderComponent($$result3, "DefaultWorkbench", $$Default, {})}`}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate(_c || (_c = __template([' <script type="module"', ' defer><\/script> <script type="module"', '><\/script> <script type="module"', " defer><\/script> ", ""])), addAttribute(Bust("/Worker/CSS/Load.js"), "src"), addAttribute(Bust("/Worker/Policy.js"), "src"), addAttribute(Bust("/Worker/Register.js"), "src"), WorkbenchType === "Electron" ? renderTemplate`${renderComponent($$result3, "ElectronWorkbench", $$Layout, {})}` : WorkbenchType === "Mountain" ? renderTemplate`${renderComponent($$result3, "MountainWorkbench", $$Mountain, {})}` : WorkbenchType === "BrowserProxy" ? renderTemplate`${renderComponent($$result3, "BrowserProxyWorkbench", $$Layout$1, {})}` : WorkbenchType === "Browser" ? renderTemplate(_b || (_b = __template(['<script type="module"', "><\/script>"])), addAttribute(Bust(
    "/Static/Application/vs/code/browser/workbench/workbench.js"
  ), "src")) : renderTemplate`${renderComponent($$result3, "DefaultWorkbench", $$Default, {})}`) })}`}` })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/index.astro", void 0);

const $$file = "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
