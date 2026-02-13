import { c as createComponent, r as renderTemplate, a as addAttribute, b as renderComponent, F as Fragment, d as renderScript, m as maybeRenderHead, e as createAstro, f as defineScriptVars } from '../chunks/astro/server_CFm8Vc5M.mjs';
import 'piccolore';
import 'html-escaper';
import { $ as $$Base } from '../chunks/Base_DaP89jso.mjs';
import 'clsx';
/* empty css                                       */
export { renderers } from '../renderers.mjs';

const On = process.env["NODE_ENV"] === "development" || process.env["TAURI_ENV_DEBUG"] === "true";
const Bust = (Base) => `${Base}${Base.includes("?") ? "&" : "?"}Time=${encodeURIComponent(Date.now())}`;

var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(cooked.slice()) }));
var _a$2;
const $$NLS = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a$2 || (_a$2 = __template$2(['<script type="module"', "><\/script>"])), addAttribute(Bust(`/Static/Application/${On ? "vs/" : ""}${On ? "nls.js" : "nls.messages.js"}`), "src"));
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/NLS.astro", void 0);

const $$Browser = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "NLS", $$NLS, {})}${renderScript($$result2, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Browser.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Browser.astro", void 0);

const $$Default = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "NLS", $$NLS, {})}${maybeRenderHead()}<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui; color: var(--vscode-editor-foreground); background: var(--vscode-editor-background);"><h1>Workbench Entry Point</h1><p>This page is deprecated. Please use one of the approach-specific workbench pages:</p><ul style="text-align: left;"><li><a href="/BrowserProxy.html" style="color: var(--vscode-textLink-foreground);">A1: BrowserProxy.astro</a> - Browser workbench + services proxy (70-80% features)</li><li><a href="/Mountain.html" style="color: var(--vscode-textLink-foreground);"><strong>A2: Mountain.astro (RECOMMENDED)</strong></a> - Browser workbench + Mountain providers (80-90% features)</li><li><a href="/Electron.html" style="color: var(--vscode-textLink-foreground);">A3: Electron.astro</a> - Electron workbench + polyfills (95%+ features)</li><li><a href="/Native/WindWorkbench.html" style="color: var(--vscode-textLink-foreground);">A4: Native/WindWorkbench.astro</a> - Native Wind implementation (60-70% features)</li></ul></div>` })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Default.astro", void 0);

const $$ActivityBar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="wind-activitybar" class="wind-activitybar" data-astro-cid-g3eugctp> <div class="wind-activitybar-container" data-astro-cid-g3eugctp> <!-- Explorer --> <div class="wind-activitybar-item active" data-command="workbench.view.explorer" data-position="0" title="Explorer" data-astro-cid-g3eugctp> <span class="wind-activitybar-icon" data-astro-cid-g3eugctp>📁</span> </div> <!-- Search --> <div class="wind-activitybar-item" data-command="workbench.view.search" data-position="1" title="Search" data-astro-cid-g3eugctp> <span class="wind-activitybar-icon" data-astro-cid-g3eugctp>🔍</span> </div> <!-- Source Control --> <div class="wind-activitybar-item" data-command="workbench.view.scm" data-position="2" title="Source Control" data-astro-cid-g3eugctp> <span class="wind-activitybar-icon" data-astro-cid-g3eugctp>⚡</span> </div> <!-- Extensions --> <div class="wind-activitybar-item" data-command="workbench.view.extensions" data-position="3" title="Extensions" data-astro-cid-g3eugctp> <span class="wind-activitybar-icon" data-astro-cid-g3eugctp>🧩</span> </div> <div class="wind-activitybar-bottom-spacer" data-astro-cid-g3eugctp></div> <!-- Settings --> <div class="wind-activitybar-item" data-command="workbench.action.openSettings" data-position="10" title="Settings" data-astro-cid-g3eugctp> <span class="wind-activitybar-icon" data-astro-cid-g3eugctp>⚙️</span> </div> </div> </div>  ${renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/ActivityBar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/ActivityBar.astro", void 0);

const $$Sidebar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="wind-sidebar" class="wind-sidebar" data-astro-cid-c6jhqyhi> <div class="wind-sidebar-header" data-astro-cid-c6jhqyhi> <div class="wind-sidebar-title" data-astro-cid-c6jhqyhi>Explorer</div> </div> <div class="wind-sidebar-content" data-astro-cid-c6jhqyhi> <div id="wind-file-tree" class="wind-file-tree" data-astro-cid-c6jhqyhi> <!-- File tree will be populated by JavaScript --> </div> </div> <div class="wind-sidebar-resize-handle" data-astro-cid-c6jhqyhi></div> </div>  ${renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/Sidebar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/Sidebar.astro", void 0);

const $$Astro$1 = createAstro("https://editor.land");
const $$Editor = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Editor;
  return renderTemplate`${maybeRenderHead()}<div id="wind-editor" class="wind-editor" data-astro-cid-iekivhbn> <!-- Editor Container --> <div id="wind-editor-container" class="wind-editor-container" data-astro-cid-iekivhbn> <!-- Monaco editor will be mounted here --> <div id="monaco-editor" class="monaco-editor" data-astro-cid-iekivhbn></div> </div> <!-- Tab Bar --> <div class="wind-editor-tabs" data-astro-cid-iekivhbn> <div class="wind-editor-tabs-container" id="wind-editor-tabs" data-astro-cid-iekivhbn> <!-- Tabs will be dynamically added --> </div> </div> </div>  ${renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/Editor.astro?astro&type=script&index=0&lang.ts")} ${renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/Editor.astro?astro&type=script&index=1&lang.ts")}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/Editor.astro", void 0);

const $$Panel = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="wind-panel" class="wind-panel" data-astro-cid-mpgmmkzu> <div class="wind-panel-header" data-astro-cid-mpgmmkzu> <!-- Panel Tabs --> <div class="wind-panel-tabs" data-astro-cid-mpgmmkzu> <div class="wind-panel-tab active" data-panel="output" data-astro-cid-mpgmmkzu>Output</div> <div class="wind-panel-tab" data-panel="terminal" data-astro-cid-mpgmmkzu>Terminal</div> <div class="wind-panel-tab" data-panel="problems" data-astro-cid-mpgmmkzu>Problems</div> <div class="wind-panel-tab" data-panel="debug" data-astro-cid-mpgmmkzu>Debug Console</div> </div> <!-- Panel Actions --> <div class="wind-panel-actions" data-astro-cid-mpgmmkzu> <button class="wind-panel-action" title="Clear" id="panel-clear" data-astro-cid-mpgmmkzu>🗑️</button> <button class="wind-panel-action" title="Close" id="panel-close" data-astro-cid-mpgmmkzu>✕</button> </div> </div> <div class="wind-panel-content" data-astro-cid-mpgmmkzu> <!-- Output Panel --> <div class="wind-panel-view active" id="panel-output" data-astro-cid-mpgmmkzu> <div class="wind-panel-output" id="wind-panel-output-content" data-astro-cid-mpgmmkzu> <div class="panel-output-line" data-astro-cid-mpgmmkzu>[Panel] Output panel initialized</div> <div class="panel-output-line" data-astro-cid-mpgmmkzu>[Panel] System is ready</div> </div> </div> <!-- Terminal Panel --> <div class="wind-panel-view" id="panel-terminal" data-astro-cid-mpgmmkzu> <div class="wind-terminal" data-astro-cid-mpgmmkzu> <div class="wind-terminal-line" data-astro-cid-mpgmmkzu>$ Ready</div> <div class="wind-terminal-input-line" data-astro-cid-mpgmmkzu> <span class="wind-terminal-prompt" data-astro-cid-mpgmmkzu>$</span> <input type="text" class="wind-terminal-input" placeholder="Type a command..." data-astro-cid-mpgmmkzu> </div> </div> </div> <!-- Problems Panel --> <div class="wind-panel-view" id="panel-problems" data-astro-cid-mpgmmkzu> <div class="wind-problems-empty" data-astro-cid-mpgmmkzu>No problems detected</div> </div> <!-- Debug Console Panel --> <div class="wind-panel-view" id="panel-debug" data-astro-cid-mpgmmkzu> <div class="wind-debug-console" data-astro-cid-mpgmmkzu> <div class="debug-console-line" data-astro-cid-mpgmmkzu>[Debug] Console ready</div> </div> </div> </div> <!-- Resize Handle --> <div class="wind-panel-resize" id="panel-resize" data-astro-cid-mpgmmkzu></div> </div>  ${renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/Panel.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/Panel.astro", void 0);

const $$StatusBar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<div id="wind-statusbar" class="wind-statusbar" data-astro-cid-dcgx3e4t> <!-- Left side status items --> <div class="wind-statusbar-left" data-astro-cid-dcgx3e4t> <div class="wind-statusbar-item" title="Git Branch" data-astro-cid-dcgx3e4t> <span class="statusbar-icon" data-astro-cid-dcgx3e4t>⚡</span> <span class="statusbar-text" data-astro-cid-dcgx3e4t>main</span> </div> <div class="wind-statusbar-item" title="Errors" data-astro-cid-dcgx3e4t> <span class="statusbar-text error-count" data-astro-cid-dcgx3e4t>✓ 0 Errors</span> </div> <div class="wind-statusbar-item" title="Warnings" data-astro-cid-dcgx3e4t> <span class="statusbar-text warning-count" data-astro-cid-dcgx3e4t>✓ 0 Warnings</span> </div> </div> <!-- Right side status items --> <div class="wind-statusbar-right" data-astro-cid-dcgx3e4t> <div class="wind-statusbar-item" id="status-language" title="Language" data-astro-cid-dcgx3e4t>TypeScript</div> <div class="wind-statusbar-item" id="status-encoding" title="Encoding" data-astro-cid-dcgx3e4t>UTF-8</div> <div class="wind-statusbar-item" id="status-encoding" title="Line Ending" data-astro-cid-dcgx3e4t>LF</div> <div class="wind-statusbar-item" id="status-cursor" title="Cursor Position" data-astro-cid-dcgx3e4t>Ln 1, Col 1</div> <div class="wind-statusbar-item" title="Spaces" data-astro-cid-dcgx3e4t>Spaces: 4</div> </div> </div>  ${renderScript($$result, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/StatusBar.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/StatusBar.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(raw || cooked.slice()) }));
var _a$1;
const $$WindWorkbench = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": async ($$result2) => renderTemplate(_a$1 || (_a$1 = __template$1(["", '<script type="module">\n		import { Install } from "@codeeditorland/wind/Target/Function/Install";\n\n		console.log("[WindWorkbench] Installing Wind preload...");\n		\n		Install()\n			.then(() => {\n				console.log("[WindWorkbench] \u2713 Wind preload installed");\n			})\n			.catch((error) => {\n				console.error("[WindWorkbench] \u2717 Wind preload error:", error);\n			});\n	<\/script><script type="module">\n		console.log("[WindWorkbench] Starting Wind bootstrap...");\n\n		try {\n			const { runBootstrap } = await import("@codeeditorland/wind/Target/Effect/Bootstrap");\n\n			console.log("[WindWorkbench] \u2713 Bootstrap module loaded");\n\n			// Run the bootstrap with options\n			const bootstrapResult = await runBootstrap({\n				skipHealthCheck: true,\n				debugMode: false,\n			});\n\n			if (bootstrapResult.success) {\n				console.log("[WindWorkbench] \u2713 Bootstrap completed successfully");\n				console.log("[WindWorkbench]   - Total duration:", bootstrapResult.totalDuration, "ms");\n\n				// Log individual stage results\n				bootstrapResult.stages.forEach((stage: any) => {\n					const status = stage.success ? "\u2713" : "\u2717";\n					console.log(`[WindWorkbench]   - ${status} ${stage.stageName}: ${stage.duration}ms`);\n				});\n			} else {\n				console.error("[WindWorkbench] \u2717 Bootstrap failed:", bootstrapResult.error);\n			}\n		} catch (error) {\n			console.error("[WindWorkbench] \u2717 Failed to load/run bootstrap:", error);\n		}\n\n		console.log("[WindWorkbench] ===== Wind bootstrap sequence complete =====");\n	<\/script>', '<div id="wind-workbench" class="wind-workbench" data-astro-cid-g5kggf5d><!-- Activity Bar (Leftmost icons) -->', '<!-- Main Content Area --><div class="wind-workbench-main" data-astro-cid-g5kggf5d><!-- Sidebar (File explorer, search, etc.) -->', '<!-- Editor Area and Panel --><div class="wind-workbench-center" data-astro-cid-g5kggf5d><!-- Editor (Monaco-based) -->', "<!-- Panel (Bottom output/terminal) -->", "</div></div><!-- Status Bar (Bottom) -->", "</div>", ""], ["", '<script type="module">\n		import { Install } from "@codeeditorland/wind/Target/Function/Install";\n\n		console.log("[WindWorkbench] Installing Wind preload...");\n		\n		Install()\n			.then(() => {\n				console.log("[WindWorkbench] \u2713 Wind preload installed");\n			})\n			.catch((error) => {\n				console.error("[WindWorkbench] \u2717 Wind preload error:", error);\n			});\n	<\/script><script type="module">\n		console.log("[WindWorkbench] Starting Wind bootstrap...");\n\n		try {\n			const { runBootstrap } = await import("@codeeditorland/wind/Target/Effect/Bootstrap");\n\n			console.log("[WindWorkbench] \u2713 Bootstrap module loaded");\n\n			// Run the bootstrap with options\n			const bootstrapResult = await runBootstrap({\n				skipHealthCheck: true,\n				debugMode: false,\n			});\n\n			if (bootstrapResult.success) {\n				console.log("[WindWorkbench] \u2713 Bootstrap completed successfully");\n				console.log("[WindWorkbench]   - Total duration:", bootstrapResult.totalDuration, "ms");\n\n				// Log individual stage results\n				bootstrapResult.stages.forEach((stage: any) => {\n					const status = stage.success ? "\u2713" : "\u2717";\n					console.log(\\`[WindWorkbench]   - \\${status} \\${stage.stageName}: \\${stage.duration}ms\\`);\n				});\n			} else {\n				console.error("[WindWorkbench] \u2717 Bootstrap failed:", bootstrapResult.error);\n			}\n		} catch (error) {\n			console.error("[WindWorkbench] \u2717 Failed to load/run bootstrap:", error);\n		}\n\n		console.log("[WindWorkbench] ===== Wind bootstrap sequence complete =====");\n	<\/script>', '<div id="wind-workbench" class="wind-workbench" data-astro-cid-g5kggf5d><!-- Activity Bar (Leftmost icons) -->', '<!-- Main Content Area --><div class="wind-workbench-main" data-astro-cid-g5kggf5d><!-- Sidebar (File explorer, search, etc.) -->', '<!-- Editor Area and Panel --><div class="wind-workbench-center" data-astro-cid-g5kggf5d><!-- Editor (Monaco-based) -->', "<!-- Panel (Bottom output/terminal) -->", "</div></div><!-- Status Bar (Bottom) -->", "</div>", ""])), renderComponent($$result2, "NLS", $$NLS, { "data-astro-cid-g5kggf5d": true }), maybeRenderHead(), renderComponent($$result2, "ActivityBar", $$ActivityBar, { "data-astro-cid-g5kggf5d": true }), renderComponent($$result2, "Sidebar", $$Sidebar, { "data-astro-cid-g5kggf5d": true }), renderComponent($$result2, "Editor", $$Editor, { "data-astro-cid-g5kggf5d": true }), renderComponent($$result2, "Panel", $$Panel, { "data-astro-cid-g5kggf5d": true }), renderComponent($$result2, "StatusBar", $$StatusBar, { "data-astro-cid-g5kggf5d": true }), renderScript($$result2, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/WindWorkbench.astro?astro&type=script&index=0&lang.ts")) })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Native/WindWorkbench.astro", void 0);

const $$Wind = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${renderComponent($$result2, "NativeWorkbench", $$WindWorkbench, {})}` })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/Workbench/Wind.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a, _b, _c;
const $$Astro = createAstro("https://editor.land");
const $$Application = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Application;
  const Bundle = process.env["Bundle"] === "true";
  const Browser = process.env["Browser"] === "true";
  const Wind = process.env["Wind"] === "true";
  const Worker = `/Worker.js?BASE_REMOTE=${encodeURIComponent(Astro2.url.origin)}`;
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "Head": ($$result2) => renderTemplate(_a || (_a = __template(['<script type="module">\n		globalThis._VSCODE_FILE_ROOT = `${window.location.origin}/Static/Application/`;\n	<\/script><script type="module">', '\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		globalThis.__BOOTSTRAP_DEBUG__ = On;\n	<\/script>"], ['<script type="module">\n		globalThis._VSCODE_FILE_ROOT = \\`\\${window.location.origin}/Static/Application/\\`;\n	<\/script><script type="module">', '\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		globalThis.__BOOTSTRAP_DEBUG__ = On;\n	<\/script>"])), defineScriptVars({ Worker: Bust(Worker) }), defineScriptVars({ On })), "Meta": ($$result2) => renderTemplate`<meta http-equiv="Content-Security-Policy"${addAttribute(((Configuration) => {
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
  }), "data-settings")}><meta id="vscode-workbench-auth-session"${addAttribute(JSON.stringify({}), "data-settings")}>`, "default": ($$result2) => renderTemplate`              ${Bundle ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` ${renderScript($$result3, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Application.astro?astro&type=script&index=0&lang.ts")} ${Wind ? renderTemplate`${renderComponent($$result3, "WindWorkbench", $$Wind, { "Bust": Bust })}` : Browser ? renderTemplate`${renderComponent($$result3, "BrowserWorkbench", $$Browser, {})}` : renderTemplate`${renderComponent($$result3, "DefaultWorkbench", $$Default, {})}`}` })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate(_c || (_c = __template([' <script type="module"', ' defer><\/script> <script type="module"', '><\/script> <script type="module"', " defer><\/script> ", ""])), addAttribute(Bust("/Worker/CSS/Load.js"), "src"), addAttribute(Bust("/Worker/Policy.js"), "src"), addAttribute(Bust("/Worker/Register.js"), "src"), Wind ? renderTemplate`${renderComponent($$result3, "WindWorkbench", $$Wind, { "Bust": Bust })}` : Browser ? renderTemplate(_b || (_b = __template(['<script type="module"', "><\/script>"])), addAttribute(Bust(
    "/Static/Application/vs/code/browser/workbench/workbench.js"
  ), "src")) : renderTemplate`${renderComponent($$result3, "DefaultWorkbench", $$Default, {})}`) })}`}` })}`;
}, "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Application.astro", void 0);

const $$file = "/Volumes/CORSAIR/Developer/macOS/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Application.astro";
const $$url = "/Application";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Application,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
