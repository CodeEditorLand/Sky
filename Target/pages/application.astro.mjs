import { c as createComponent, r as renderScript, a as renderTemplate, b as createAstro, d as renderComponent, F as Fragment, e as addAttribute, f as defineScriptVars } from '../chunks/astro/server_QvYx1wwB.mjs';
import 'kleur/colors';
import 'html-escaper';
import { $ as $$Base } from '../chunks/Base_FE5EZvuz.mjs';
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
  const Default = {
    // --- Core Local Configuration ---
    // Explicitly set to null to indicate no remote server authority
    // @ts-expect-error
    remoteAuthority: null,
    // Standard base path for web assets
    // @ts-expect-error
    serverBasePath: null,
    // No connection token needed for local
    // @ts-expect-error
    connectionToken: null,
    // Assume this is the initial load (adjust dynamically if needed)
    // isInitialStartup: true,
    // --- Explicitly Disable/Exclude Remote/Web Features ---
    // Do NOT provide a WebSocket factory
    // @ts-expect-error
    webSocketFactory: null,
    // Do NOT provide a resource URI provider (used with websockets)
    // resourceUriProvider: undefined,
    // Do NOT provide a remote resource provider
    // remoteResourceProvider: undefined,
    // No remote tunnels needed locally
    // tunnelProvider: undefined,
    // Not needed for local auth (if any)
    // codeExchangeProxyEndpoints: undefined,
    // No cloud edit session initially
    // editSessionId: undefined,
    // --- Workspace & Profile ---
    // Let the backend (Mountain via initData/RPC) determine the workspace after load
    // workspaceProvider: undefined,
    // Keep workspace trust enabled for testing the feature flow
    enableWorkspaceTrust: true,
    // Let the backend manage profiles
    // profile: undefined,
    // No profile preview
    // profileToPreview: undefined,
    // --- Features & Services (Let Backend/Shims Handle) ---
    // Let Cocoon's shim provide the proxy to Mountain's native storage
    // secretStorageProvider: undefined,
    // Disable settings sync for MVP simplicity
    settingsSyncOptions: { enabled: false },
    // Rely on extensions or backend for auth if needed later
    // authenticationProviders: undefined,
    // Rely on Mountain's native protocol handler
    // urlCallbackProvider: undefined,
    // --- Extensions ---
    // Don't force extra built-ins for now
    // additionalBuiltinExtensions: undefined,
    // Don't force enable specific extensions for now
    // enabledExtensions: undefined,
    // --- Branding & UI ---
    productConfiguration: {
      // Identify as desktop-like, might influence some UI/feature paths
      // Important to suggest non-web behavior
      embedderIdentifier: Browser ? "web" : "desktop",
      // Optional: Branding
      nameShort: "FIDDEE",
      // Optional: Branding
      nameLong: "FIDDEE",
      // Optional: Branding
      applicationName: "fiddee"
      // Add other product overrides if needed
    },
    // Use default window indicator
    // windowIndicator: undefined,
    // Use default theme initially
    // initialColorTheme: undefined,
    // No custom banner
    // welcomeBanner: undefined,
    // Use default layout
    // defaultLayout: undefined,
    // No extra default settings from embedder
    // configurationDefaults: undefined,
    // --- Security & Misc ---
    // No extra trusted domains initially
    // additionalTrustedDomains: undefined,
    // No special opener prefixes initially
    // openerAllowedExternalUrlPrefixes: undefined,
    // No custom telemetry properties initially
    // resolveCommonTelemetryProperties: undefined,
    // No extra embedder commands initially
    // commands: undefined,
    // No specific message ports needed for Cocoon/Vine
    // messagePorts: undefined,
    // Keep this from your example, might be harmlessly ignored
    // callbackRoute: "/oss-dev/callback",
    // --- Development ---
    developmentOptions: {
      // Set to Trace (1) or Debug (2) for maximum insight during development
      logLevel: On ? 2 : 0,
      enableSmokeTestDriver: On
      // Only set if running integration tests
      // extensionTestsPath: undefined,
      // Only set if loading specific dev extensions
      // extensions: undefined,
    }
    // --- Update/Quality ---
    // updateProvider: undefined,
    // productQualityChangeHandler: undefined,
  };
  const Bust = (Base) => `${Base}${Base.includes("?") ? "&" : "?"}Time=${encodeURIComponent(Date.now())}`;
  console.log(Bundle);
  return renderTemplate`${renderComponent($$result, "Layout", $$Base, {}, { "Head": ($$result2) => renderTemplate(_a || (_a = __template(['<script type="module">', '\n		// @ts-expect-error\n		globalThis._VSCODE_FILE_ROOT = `${Site}Static/Application/`;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script>"], ['<script type="module">', '\n		// @ts-expect-error\n		globalThis._VSCODE_FILE_ROOT = \\`\\${Site}Static/Application/\\`;\n	<\/script><script type="module">', "\n		// @ts-expect-error\n		window._WORKER = Worker;\n	<\/script>"])), defineScriptVars({ Site }), defineScriptVars({ Worker: Bust(Worker) })), "Meta": ($$result2) => renderTemplate`<meta http-equiv="Content-Security-Policy" content="
				default-src
					'none'
				;
				
				img-src
					'self'
					data:
					blob:
					vscode-remote-resource:
					vscode-managed-remote-resource:
					https:
				;
				
				manifest-src
					'self'
				;
				
				media-src
					'self'
				;
				
				frame-src
					'self'
					vscode-webview:
				;
				
				script-src
					'self'
					'unsafe-inline'
					'unsafe-eval'
					blob:
				;
				
				style-src
					'self'
					'unsafe-inline'
				;
				
				connect-src
					'self'
					wss://tauri.localhost
					https:
				;
				
				font-src
					'self'
					vscode-remote-resource:
					vscode-managed-remote-resource:
				;
				
				block-all-mixed-content
				;
				
				upgrade-insecure-requests
				;
				
				require-trusted-types-for
					'script'
				;
				
				trusted-types
					WorkerApplication
					amdLoader
					cellRendererEditorText
					defaultWorkerFactory
					diffEditorWidget
					diffReview
					domLineBreaksComputer
					dompurify
					editorGhostText
					editorViewLayer
					notebookRenderer
					stickyScrollViewLayer
					tokenizeToString
					notebookChatEditController
				;
		"><meta id="vscode-workbench-web-configuration"${addAttribute(JSON.stringify(Default), "data-settings")}><meta id="vscode-workbench-auth-session"${addAttribute(JSON.stringify({}), "data-settings")}>`, "default": ($$result2) => renderTemplate`      ${Bundle ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate(_b || (_b = __template([" ", ' <script type="module"', "><\/script> ", ""])), renderScript($$result3, "D:/Developer/Application/CodeEditorLand/Land/Element/Sky/Source/pages/Application.astro?astro&type=script&index=0&lang.ts"), addAttribute(Bust("/Static/Application/nls.messages.js"), "src"), Browser ? renderTemplate`${renderComponent($$result3, "BrowserWorkbench", $$Browser, {})}` : renderTemplate`${renderComponent($$result3, "DefaultWorkbench", $$Default, {})}`) })}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate(_e || (_e = __template([' <script type="module"', ' defer><\/script> <script type="module"', '><\/script> <script type="module"', ' defer><\/script> <script type="module"', "><\/script> ", ""])), addAttribute(Bust("/Worker/CSS/Load.js"), "src"), addAttribute(Bust("/Worker/Policy.js"), "src"), addAttribute(Bust("/Worker/Register.js"), "src"), addAttribute(Bust(`/Static/Application/nls.messages.js`), "src"), Browser ? renderTemplate(_c || (_c = __template(['<script type="module"', " defer><\/script>"])), addAttribute(Bust(
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
