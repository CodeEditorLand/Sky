/*---------------------------------------------------------------------------------------------
 * Sky Configuration - Wind Package
 * --------------------------------------------------------------------------------------------
 * This is the primary configuration file for the Sky webview frontend (Astro/Vite).
 *
 * Responsibilities:
 * 1. Configure the Astro build framework and integrations (Inline, Compress).
 * 2. Configure the underlying Vite bundler (Rollup options, Minification, Sourcemaps).
 * 3. Define static asset copying rules via `vite-plugin-static-copy` (mapped in Debug.ts).
 * 4. Manage development server settings (HMR, SSL Certificates, Port).
 *
 * This configuration delegates all environment resolution, path calculation, and
 * build context logging to `Element/Sky/Source/Function/Debug.ts`.
 *--------------------------------------------------------------------------------------------*/

import {
	copyFile,
	cp,
	mkdir,
	readdir,
	readFile,
	writeFile,
} from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "astro/config";

// -----------------------------------------------------------------------------
// IMPORT CONTEXT & TRIGGER DEBUG LOGGING
// -----------------------------------------------------------------------------
import { External, Host, Link, On } from "./Source/Function/Debug";

// -----------------------------------------------------------------------------
// ASTRO CONFIGURATION
// -----------------------------------------------------------------------------
export default defineConfig({
	srcDir: "./Source",

	publicDir: "./Public",

	outDir: "./Target",

	site: Host,

	compressHTML: !On,

	prefetch: false,

	server: {
		host: Host,

		port: 9999,
	},

	build: {
		concurrency: 9999,
	},

	integrations: [
		!On ? (await import("@playform/inline")).default({ Logger: 1 }) : null,

		!On
			? (await import("@playform/compress")).default({ Logger: 1 })
			: null,

		{
			name: "CopyVSCodeAssets",
			hooks: {
				"astro:build:done": async ({ dir }) => {
					const BuildStart = performance.now();
					const StepTimings: Record<string, number> = {};
					const StepMark = (Step: string) => {
						StepTimings[Step] = performance.now() - BuildStart;
					};

					const TargetDir = fileURLToPath(dir);

					const Destination = join(
						TargetDir,
						"Static",
						"Application",
						"vs",
					);

					// Step 1: Copy ESBuild-processed files from Output (primary source)
					const OutputSource = resolve(
						process.cwd(),
						"../Output/Target/Microsoft/VSCode/vs",
					);

					console.log(
						`[CopyVSCode] Step 1: Copying Output/vs → Static/Application/vs/`,
					);

					try {
						await cp(OutputSource, Destination, {
							recursive: true,
						});
					} catch (Error) {
						console.warn(
							"[CopyVSCode] ✗ Output copy failed:",
							Error,
						);
					}
					// Step 2: Supplement with tsc-compiled files from Dependency
					// (fills gaps like workbench.web.main.js missing from Output)
					const DependencySource = resolve(
						process.cwd(),
						"../../Dependency/Microsoft/Dependency/Editor/out/vs",
					);

					console.log(
						`[CopyVSCode] Step 2: Supplementing from Dependency/out/vs/`,
					);

					try {
						await cp(DependencySource, Destination, {
							recursive: true,
							force: false,
						});
					} catch (Error) {
						console.warn(
							"[CopyVSCode] ✗ Dependency supplement failed:",
							Error,
						);
					}
					// Step 3: Copy Worker.js from node_modules to Target/Worker.js
					const WorkerSource = resolve(
						process.cwd(),
						"node_modules/@codeeditorland/worker/Target/Worker.js",
					);

					const WorkerDestination = join(TargetDir, "Worker.js");

					try {
						await copyFile(WorkerSource, WorkerDestination);

						console.log(
							"[CopyVSCode] ✓ Worker.js copied to Target/",
						);
					} catch (Error) {
						console.warn(
							"[CopyVSCode] ✗ Worker.js copy failed:",
							Error,
						);
					}
					// Step 4: Strip CSS imports - Tauri WKWebView has no service worker
					// interception for Tauri embedded assets, so CSS module imports in
					// VS Code's JS files must be removed before embedding.
					// (The Worker/CSS interception handles the browser/PWA context.)
					// Matches: import "./foo.css"; or import './bar.css'
					const CSSImport =
						/^import\s+(['"])([^'"]+\.css)\1\s*;?\s*$/gm;

					async function StripCSSImports(Dir: string): Promise<void> {
						let Entries;

						try {
							Entries = await readdir(Dir, {
								withFileTypes: true,
							});
						} catch {
							return;
						}
						await Promise.all(
							Entries.map(async (Entry) => {
								const Full = join(Dir, Entry.name);

								if (Entry.isDirectory()) {
									await StripCSSImports(Full);
								} else if (Entry.name.endsWith(".js")) {
									try {
										const Content = await readFile(
											Full,
											"utf-8",
										);

										if (CSSImport.test(Content)) {
											CSSImport.lastIndex = 0;

											// Replace with _LOAD_CSS_WORKER call so CSS is
											// injected as a <link> element instead of being
											// imported as a JS module (which fails with
											// 'text/css is not a valid MIME type').
											// import.meta.url resolves the relative path to
											// the correct absolute /Static/Application/vs/ URL.
											await writeFile(
												Full,
												Content.replace(
													CSSImport,
													(_m, _q, Path) =>
														`window._LOAD_CSS_WORKER?.(new URL("${Path}",import.meta.url).pathname);`,
												),
												"utf-8",
											);
										}
									} catch {
										/* skip */
									}
								}
							}),
						);
					}
					console.log(
						"[CopyVSCode] Step 4: Stripping CSS imports from Static/Application/vs/",
					);

					await StripCSSImports(Destination);

					// Step 5: No JS patching needed.
					// VSCODE_DEV=true in Wind's process.env + _VSCODE_USE_RELATIVE_IMPORTS=true
					// in Base.astro makes the Electron workbench use relative import paths
					// that resolve against http://localhost instead of vscode-file://.
					// The native vscode-file:// Rust handler (Scheme.rs) covers
					// non-module requests (fetch, images, JSON).

					// Step 6: Inject __name shim into extension host iframe.
					// The blob worker created by this HTML doesn't have the
					// __name global that Dependency/out files expect.
					const ExtHostIframe = join(
						Destination,
						"workbench",
						"services",
						"extensions",
						"worker",
						"webWorkerExtensionHostIframe.html",
					);

					try {
						const HTML = await readFile(ExtHostIframe, "utf-8");

						const NameShim = `var __defProp=Object.defineProperty;var __name=(t,v)=>__defProp(t,"name",{value:v,configurable:true});`;

						// Inject into the blob content (before the first globalThis._VSCODE line)
						const PatchedHTML = HTML.replace(
							"`/*extensionHostWorker*/`,",
							"`/*extensionHostWorker*/${NameShim}`,",
						);

						if (PatchedHTML !== HTML) {
							await writeFile(
								ExtHostIframe,
								PatchedHTML,
								"utf-8",
							);

							console.log(
								"[CopyVSCode] Step 6: Injected __name shim into ext host iframe",
							);
						}
					} catch {
						// May not exist yet
					}

					// Step 7: When Electron=true, replace ElectronIPCMainProcessService
					// with TauriMainProcessService that routes channel.call() directly
					// through Tauri invoke to Mountain's WindServiceHandlers.
					//
					// ESM wrapper approach: copy the compiled service as a separate
					// module and write a 1-line re-export wrapper. This avoids
					// inlining esbuild helpers (__defProp/__name) and regex stripping.
					if (process.env["Electron"] === "true") {
						const IPCDir = join(
							Destination,
							"platform",
							"ipc",
							"electron-browser",
						);

						try {
							// Source from Output (consolidated) first, fall back to Wind
							const OutputServicePath = resolve(
								process.cwd(),
								"node_modules/@codeeditorland/output/Configuration/Service/TauriMainProcessService.js",
							);
							const WindServicePath = resolve(
								process.cwd(),
								"node_modules/@codeeditorland/wind/Target/Service/TauriMainProcessService.js",
							);

							let TauriServiceSource: string;
							try {
								await readFile(OutputServicePath);
								TauriServiceSource = OutputServicePath;
								console.log(
									"[CopyVSCode] Step 7: Using Output/Configuration/Service/TauriMainProcessService.js",
								);
							} catch {
								TauriServiceSource = WindServicePath;
								console.log(
									"[CopyVSCode] Step 7: Falling back to Wind/Target/Service/TauriMainProcessService.js",
								);
							}

							// Copy the compiled service as a separate module
							await copyFile(
								TauriServiceSource,
								join(IPCDir, "TauriMainProcessService.js"),
							);

							// Strip sourceMappingURL to prevent 404 → HTML → JSON parse error
							const ServiceJS = await readFile(
								join(IPCDir, "TauriMainProcessService.js"),
								"utf-8",
							);
							if (ServiceJS.includes("sourceMappingURL")) {
								await writeFile(
									join(IPCDir, "TauriMainProcessService.js"),
									ServiceJS.replace(
										/\/\/# sourceMappingURL=.*/g,
										"",
									),
									"utf-8",
								);
							}

							// Replace mainProcessService.js with a minimal ESM re-export
							await writeFile(
								join(IPCDir, "mainProcessService.js"),
								`export { TauriMainProcessService as ElectronIPCMainProcessService } from './TauriMainProcessService.js';\n`,
								"utf-8",
							);

							console.log(
								"[CopyVSCode] Step 7: Replaced ElectronIPCMainProcessService with TauriMainProcessService (ESM wrapper)",
							);
						} catch (Error) {
							console.warn(
								"[CopyVSCode] Step 7: TauriMainProcessService replacement failed:",
								Error,
							);
						}
					}

					// Step 8: When Electron=true, patch workbench.js to surface
					// errors from the async IIFE. The original code does NOT await
					// result.main(configuration) and has no unhandledrejection
					// listener, so all boot errors are silently swallowed.
					if (process.env["Electron"] === "true") {
						const WorkbenchJS = join(
							Destination,
							"code",
							"electron-browser",
							"workbench",
							"workbench.js",
						);

						try {
							let Content = await readFile(WorkbenchJS, "utf-8");

							// 8a: Prepend global error listeners - emit performance.mark only
							// Filter expected: FileNotFound, Canceled, Script error
							const ErrorListeners = [
								`window.addEventListener("unhandledrejection",(e)=>{var r=e.reason;if(!r)return;var m=String(r.message||r);if(m.includes("Canceled")||m.includes("FileNotFound")||(r.code&&r.code==="FileNotFound")||m.includes("No such file or directory")||m.includes("Script error"))return;try{performance.mark("land:error:rejection:"+m.slice(0,100))}catch{}});`,
								`window.addEventListener("error",(e)=>{if(!e.message||e.message==="Script error.")return;try{performance.mark("land:error:global:"+e.message.slice(0,100))}catch{}});`,
							].join("\n");

							Content = ErrorListeners + "\n" + Content;

							// 8b: Add performance.mark checkpoints inside load()
							Content = Content.replace(
								"const configuration2 = await resolveWindowConfiguration()",
								`performance.mark("land:wb:resolveConfig");const configuration2 = await resolveWindowConfiguration()`,
							);
							// 8b-fix: Ensure profile URIs exist for reviveProfile().
							Content = Content.replace(
								"setupNLS(configuration2)",
								[
									`if(configuration2.profiles){`,
									`const _S="vscode-userdata";`,
									`const _fix=(p)=>{if(!p)return;`,
									`if(!p.location)p.location={scheme:_S,path:"/User/profiles/"+(p.id||"default")};`,
									`if(!p.promptsHome)p.promptsHome={scheme:_S,path:"/User/prompts"};`,
									`if(!p.extensionsResource)p.extensionsResource={scheme:_S,path:"/User/extensions.json"};`,
									`if(!p.mcpResource)p.mcpResource={scheme:_S,path:"/User/mcp.json"};`,
									`};`,
									`_fix(configuration2.profiles.profile);`,
									`if(Array.isArray(configuration2.profiles.all))configuration2.profiles.all.forEach(_fix);`,
									`}`,
									`performance.mark("land:wb:setupNLS");setupNLS(configuration2)`,
								].join(""),
							);
							Content = Content.replace(
								"const result2 = await import(workbenchUrl)",
								`performance.mark("land:wb:importModule");const result2 = await import(workbenchUrl)`,
							);
							Content = Content.replace(
								"return { result: result2, configuration: configuration2 }",
								`performance.mark("land:wb:importDone");return { result: result2, configuration: configuration2 }`,
							);
							// 8c: Wrap result.main(configuration) with try/catch + await
							Content = Content.replace(
								"result.main(configuration)",
								`performance.mark("land:wb:main");try{await result.main(configuration);performance.mark("land:wb:mainDone")}catch(_e){performance.mark("land:wb:mainError")}`,
							);

							await writeFile(WorkbenchJS, Content, "utf-8");

							console.log(
								"[CopyVSCode] Step 8: Patched workbench.js with error surfacing",
							);
						} catch (Error) {
							console.warn(
								"[CopyVSCode] Step 8: workbench.js error surfacing failed:",
								Error,
							);
						}
					}

					// Step 9: When Electron=true, patch desktop.main.js with
					// checkpoint logging to trace where initServices() hangs.
					if (process.env["Electron"] === "true") {
						const DesktopMainJS = join(
							Destination,
							"workbench",
							"electron-browser",
							"desktop.main.js",
						);
						try {
							let Content = await readFile(
								DesktopMainJS,
								"utf-8",
							);
							// Patches use IIFE wrappers (()=>{log;return expr})() for
							// expression contexts, and statement prepends for statement contexts.
							// CP5-7 are inside Promise.all([...]) so we log BEFORE the array.
							const Patches: [string, string][] = [
								[
									"new ElectronIPCMainProcessService(this.configuration.windowId)",
									`(()=>{performance.mark("land:desktop:CP1:MainProcessService");return new ElectronIPCMainProcessService(this.configuration.windowId)})()`,
								],
								[
									"new NativeWorkbenchEnvironmentService(this.configuration, productService)",
									`(()=>{performance.mark("land:desktop:CP2:EnvironmentService");return new NativeWorkbenchEnvironmentService(this.configuration, productService)})()`,
								],
								[
									"new SharedProcessService(this.configuration.windowId, logService)",
									`(()=>{performance.mark("land:desktop:CP3:SharedProcessService");return new SharedProcessService(this.configuration.windowId, logService)})()`,
								],
								[
									"new FileService(logService)",
									`(()=>{performance.mark("land:desktop:CP4:FileService");return new FileService(logService)})()`,
								],
								[
									"const [configurationService, storageService] = await Promise.all([",
									`performance.mark("land:desktop:CP5:PromiseAll");const [configurationService, storageService] = await Promise.all([`,
								],
								[
									"const workbench = new Workbench(",
									`performance.mark("land:desktop:CP6:Workbench");const workbench = new Workbench(`,
								],
							];
							for (const [Search, Replace] of Patches) {
								if (Content.includes(Search)) {
									Content = Content.replace(Search, Replace);
								}
							}
							await writeFile(DesktopMainJS, Content, "utf-8");
							console.log(
								"[CopyVSCode] Step 9: Patched desktop.main.js with checkpoint logging",
							);
						} catch (Error) {
							console.warn(
								"[CopyVSCode] Step 9: desktop.main.js checkpoint patching failed:",
								Error,
							);
						}
					}

					// Step 10: When Electron=true, replace workbench.desktop.main.js
					// static imports with sequential dynamic imports that log progress.
					// Static imports of 3385 modules overwhelm WKWebView's module loader.
					if (process.env["Electron"] === "true") {
						const DesktopBarrelJS = join(
							Destination,
							"workbench",
							"workbench.desktop.main.js",
						);
						try {
							const Content = await readFile(
								DesktopBarrelJS,
								"utf-8",
							);
							// Extract side-effect import paths: import './foo.js';
							const SideEffectImports: string[] = [];
							const SideEffectRE =
								/^import\s+['"]([^'"]+)['"]\s*;?\s*$/gm;
							let Match;
							while (
								(Match = SideEffectRE.exec(Content)) !== null
							) {
								SideEffectImports.push(Match[1]);
							}
							// Build: static named imports at top, then dynamic side-effect
							// imports, then registerSingleton + export at bottom.
							const Lines = [
								`// Sequential dynamic import loader (Step 10)`,
								`import { registerSingleton } from '../platform/instantiation/common/extensions.js';`,
								`import { IUserDataInitializationService, UserDataInitializationService } from './services/userData/browser/userDataInit.js';`,
								`import { SyncDescriptor } from '../platform/instantiation/common/descriptors.js';`,
								``,
								`console.log("[workbench.desktop.main] Loading ${SideEffectImports.length} modules sequentially...");`,
								`const _t0 = performance.now();`,
								`let _n = 0;`,
								...SideEffectImports.map(
									(Path: string, I: number) =>
										`try{await import('${Path}');_n++;${I % 10 === 0 ? `console.log("[workbench.desktop.main] "+_n+"/${SideEffectImports.length}: ${Path}");` : ""}}catch(_e){console.error("[workbench.desktop.main] FAILED #${I}: ${Path}",_e)}`,
								),
								`console.log("[workbench.desktop.main] Done: "+_n+"/${SideEffectImports.length} in "+(performance.now()-_t0).toFixed(0)+"ms");`,
								``,
								`registerSingleton(IUserDataInitializationService, new SyncDescriptor(UserDataInitializationService, [[]], true));`,
								`export { main } from './electron-browser/desktop.main.js';`,
							];
							await writeFile(
								DesktopBarrelJS,
								Lines.join("\n"),
								"utf-8",
							);
							console.log(
								`[CopyVSCode] Step 10: Replaced ${SideEffectImports.length} static imports with sequential dynamic imports`,
							);
						} catch (Error) {
							console.warn(
								"[CopyVSCode] Step 10: dynamic import replacement failed:",
								Error,
							);
						}
					}

					// Step 11: Copy @xterm and other VS Code node_modules
					// VS Code's importAMDNodeModule loads from
					// /Static/Application/node_modules/@xterm/xterm/lib/xterm.js
					const NodeModulesToCopy = [
						"@xterm/xterm",
						"@xterm/addon-clipboard",
						"@xterm/addon-image",
						"@xterm/addon-ligatures",
						"@xterm/addon-search",
						"@xterm/addon-serialize",
						"@xterm/addon-unicode11",
						"@xterm/addon-webgl",
						"@vscode/vscode-languagedetection",
						"vscode-textmate",
						"vscode-oniguruma",
					];

					const VSCodeNodeModules = resolve(
						process.cwd(),
						"../../Dependency/Microsoft/Dependency/Editor/node_modules",
					);

					for (const Pkg of NodeModulesToCopy) {
						const Source = resolve(
							process.cwd(),
							"node_modules",
							Pkg,
						);
						const FallbackSource = resolve(
							VSCodeNodeModules,
							Pkg,
						);
						const Destination = join(
							TargetDir,
							"Static/Application/node_modules",
							Pkg,
						);
						try {
							await cp(Source, Destination, {
								recursive: true,
							});
						} catch {
							try {
								await cp(FallbackSource, Destination, {
									recursive: true,
								});
							} catch {
								// Package not installed in either location
							}
						}
					}
					console.log(
						"[CopyVSCode] Step 11: Copied node_modules for terminal + language detection",
					);

					// Step 12: Create stubs for unpublished xterm addons.
					// VS Code's xtermAddonImporter.ts references @xterm/addon-progress
					// but the package doesn't exist on npm yet. Without a stub, the
					// AMD loader gets a 404 → HTML → SyntaxError. Provide a no-op.
					// VS Code's amdX loader uses define() not ESM import.
					const StubAddons: Record<string, string> = {
						"@xterm/addon-progress":
							"define([],function(){var n=function(){};var P=function(){this.activate=n;this.dispose=n;this.onChange=function(){return{dispose:n}}};return{ProgressAddon:P}})",
					};
					for (const [Pkg, Code] of Object.entries(StubAddons)) {
						const StubDir = join(
							TargetDir,
							"Static/Application/node_modules",
							Pkg,
							"lib",
						);
						try {
							await mkdir(StubDir, { recursive: true });
							const FileName = Pkg.split("/").pop()!;
							await writeFile(
								join(StubDir, `${FileName}.js`),
								Code,
								"utf-8",
							);
						} catch {
							// Non-critical
						}
					}
					console.log(
						"[CopyVSCode] Step 12: Created stubs for unpublished addons",
					);

					// Step 13: Copy built-in extensions.
					// Primary: .build/extensions/ (compiled via gulp compile-extensions-build)
					// Fallback: extensions/ (source — themes, snippets, grammars work uncompiled)
					// Mountain scans Static/Application/extensions/ at startup.
					const ExtensionsTarget = join(
						TargetDir,
						"Static/Application/extensions",
					);
					const ExtensionsSources = [
						resolve(
							process.cwd(),
							"../../Dependency/Microsoft/Dependency/Editor/.build/extensions",
						),
						resolve(
							process.cwd(),
							"../../Dependency/Microsoft/Dependency/Editor/extensions",
						),
					];
					let ExtensionsCopied = false;
					for (const ExtensionsSource of ExtensionsSources) {
						try {
							const ExtDirs = await readdir(ExtensionsSource);
							let Copied = 0;
							for (const Ext of ExtDirs) {
								const Source = join(ExtensionsSource, Ext);
								const PkgPath = join(Source, "package.json");
								try {
									await readFile(PkgPath);
									const Dest = join(ExtensionsTarget, Ext);
									await cp(Source, Dest, { recursive: true });
									Copied++;
								} catch {
									// Skip dirs without package.json or broken extensions
								}
							}
							if (Copied > 0) {
								console.log(
									`[CopyVSCode] Step 13: Copied ${Copied} built-in extensions from ${ExtensionsSource}`,
								);
								ExtensionsCopied = true;
								break;
							}
						} catch {
							// Source dir not found, try next
						}
					}
					if (!ExtensionsCopied) {
						console.warn(
							"[CopyVSCode] Step 13: No built-in extensions found",
						);
					}

					// Step 14: Patch extensionsScannerService (node/) to fetch
					// extensions from Mountain via IPC instead of reading from disk.
					// The webview has no filesystem access, so the scanner can't read
					// builtinExtensionsPath. Instead, we override scanSystemExtensions
					// to call extensions:getAll via TauriMainProcessService.
					try {
						const ScannerPath = join(
							TargetDir,
							"Static/Application/vs/workbench/services/extensions/electron-browser/extensionsScannerService.js",
						);
						await writeFile(
							ScannerPath,
							`import { URI } from '../../../../base/common/uri.js';
import { IExtensionsScannerService } from '../../../../platform/extensionManagement/common/extensionsScannerService.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Emitter } from '../../../../base/common/event.js';

const _t = (Tag, Detail) => { try { performance.mark('land:exthost:' + Tag, Detail ? { detail: Detail } : undefined); } catch {} };
const _w = (...Args) => { try { console.warn('[Land Scanner]', ...Args); } catch {} };

class ExtensionsScannerService {
	constructor(logService) {
		this._logService = logService;
		this.userExtensionsLocation = URI.file('/extensions');
		this._onDidChangeCache = new Emitter();
		this.onDidChangeCache = this._onDidChangeCache.event;
		_t('scanner:construct');
		_w('Constructed');
	}

	async _fetchFromMountain() {
		_t('scanner:fetch:start');
		try {
			const Invoke = globalThis.__TAURI__?.core?.invoke ?? globalThis.__TAURI__?.invoke;
			if (typeof Invoke !== 'function') {
				_t('scanner:fetch:no-tauri');
				_w('No Tauri invoke available');
				return [];
			}
			const RawResult = await Invoke('MountainIPCInvoke', {
				method: 'extensions:getAll',
				params: [],
			});
			let Extensions = Array.isArray(RawResult) ? RawResult : [];
			_t('scanner:fetch:result', { count: Extensions.length, type: typeof RawResult, isArray: Array.isArray(RawResult) });
			_w('IPC returned', Extensions.length, 'extensions');

			// Mountain may still be scanning on first window open. Retry up to 5 times.
			if (Extensions.length === 0) {
				for (let Retry = 1; Retry <= 5; Retry++) {
					_w('0 extensions, retry', Retry, '/5 in 1000ms');
					await new Promise(R => setTimeout(R, 1000));
					const RetryResult = await Invoke('MountainIPCInvoke', { method: 'extensions:getAll', params: [] });
					Extensions = Array.isArray(RetryResult) ? RetryResult : [];
					_t('scanner:fetch:retry', { retry: Retry, count: Extensions.length });
					_w('Retry', Retry, 'returned', Extensions.length, 'extensions');
					if (Extensions.length > 0) break;
				}
			}
			if (Extensions.length === 0) return [];

			const Mapped = [];
			let Errors = 0;
			for (let I = 0; I < Extensions.length; I++) {
				const ext = Extensions[I];
				try {
					const location = ext.extensionLocation
						? (typeof ext.extensionLocation === 'string' ? URI.parse(ext.extensionLocation) : URI.revive(ext.extensionLocation))
						: URI.file('/extensions/' + (ext.name || 'unknown'));
					const id = ext.identifier?.value
						|| (ext.publisher ? ext.publisher + '.' + ext.name : ext.name)
						|| 'unknown';
					Mapped.push({
						type: 0,
						identifier: { id },
						manifest: {
							name: ext.name || '',
							publisher: ext.publisher || '',
							version: ext.version || '0.0.0',
							engines: ext.engines || { vscode: '*' },
							main: ext.main || undefined,
							browser: ext.browser || undefined,
							activationEvents: ext.activationEvents || [],
							contributes: ext.contributes || {},
							extensionDependencies: [],
							extensionPack: [],
							enabledApiProposals: [],
						},
						location,
						isBuiltin: true,
						targetPlatform: 'undefined',
						isValid: true,
						validationMessages: [],
					});
				} catch (e) {
					Errors++;
					if (Errors <= 3) _w('Map error for ext', I, ':', String(e).slice(0, 100));
				}
			}
			_t('scanner:fetch:mapped', { mapped: Mapped.length, errors: Errors });
			_w('Mapped', Mapped.length, 'extensions,', Errors, 'errors');
			if (Mapped.length > 0) {
				_w('First:', Mapped[0].identifier.id, 'name:', Mapped[0].manifest.name, 'pub:', Mapped[0].manifest.publisher, 'loc:', Mapped[0].location?.toString?.()?.slice(0, 80));
			}
			return Mapped;
		} catch (e) {
			_t('scanner:fetch:error', { message: String(e).slice(0, 200) });
			_w('Fetch error:', String(e).slice(0, 200));
			return [];
		}
	}

	async scanAllExtensions(systemScanOptions, userScanOptions) {
		_t('scanner:scanAll:start');
		const sys = await this.scanSystemExtensions(systemScanOptions);
		const usr = await this.scanUserExtensions(userScanOptions);
		const all = [...sys, ...usr];
		_t('scanner:scanAll:done', { system: sys.length, user: usr.length, total: all.length });
		_w('scanAll:', sys.length, 'system +', usr.length, 'user =', all.length);
		return all;
	}

	async scanSystemExtensions(scanOptions) {
		_t('scanner:scanSystem:start');
		const result = await this._fetchFromMountain();
		_t('scanner:scanSystem:done', { count: result.length });
		_w('scanSystemExtensions returning', result.length);
		return result;
	}

	async scanUserExtensions(scanOptions) {
		_t('scanner:scanUser:start');
		_w('scanUserExtensions returning 0');
		return [];
	}

	getTargetPlatform() { return Promise.resolve('undefined'); }
	getProductVersion() { return { version: '0.0.1', date: undefined }; }
	async scanAllUserExtensions(scanOptions) { return []; }
	async scanExtensionsUnderDevelopment(existingExtensions, scanOptions) { _t('scanner:scanDev'); return []; }
	async scanExistingExtension(extensionLocation, extensionType, scanOptions) { return null; }
	async scanOneOrMultipleExtensions(extensionLocation, extensionType, scanOptions) { return []; }
	async scanMetadata(extensionLocation) { return undefined; }
	async updateMetadata(extensionLocation, metadata) { return undefined; }
	async initializeDefaultProfileExtensions() { _t('scanner:initDefaults'); }
}

// DI decorators must be defined before use
var __decorate = function(decorators, target, key, desc) {
	var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') r = Reflect.decorate(decorators, target, key, desc);
	else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = function(paramIndex, decorator) {
	return function(target, key) { decorator(target, key, paramIndex); };
};
ExtensionsScannerService = __decorate([
	__param(0, ILogService)
], ExtensionsScannerService);

registerSingleton(IExtensionsScannerService, ExtensionsScannerService, InstantiationType.Delayed);
export { ExtensionsScannerService, IExtensionsScannerService };
`,
							"utf-8",
						);
						console.log(
							"[CopyVSCode] Step 14: Patched extensionsScannerService (IPC override)",
						);
					} catch (Error) {
						console.warn(
							"[CopyVSCode] Step 14: extensionsScannerService patch failed:",
							Error,
						);
					}

					StepMark("done");
					console.log("[CopyVSCode] ✓ Assets ready in Target/");

					// PostHog build telemetry — debug only, skipped in production
					if (process.env["NODE_ENV"] !== "production") {
						try {
							const { request } = await import("node:https");
							const Body = JSON.stringify({
								api_key:
									"phc_mCwHy7LgvbnEqh6a2DyMiLUJcaZvmmj7JNmmpQzvr7mA",
								event: "sky:build:complete",
								properties: {
									distinct_id: `land-dev-${process.env["USER"] || "unknown"}`,
									$app: "land-editor",
									$component: "sky",
									$build_mode:
										process.env["NODE_ENV"] ||
										"development",
									electron:
										process.env["Electron"] || "false",
									total_ms: Math.round(
										performance.now() - BuildStart,
									),
									steps: StepTimings,
								},
								timestamp: new Date().toISOString(),
							});
							const Url = new URL(
								"https://eu.i.posthog.com/capture/",
							);
							const Req = request({
								hostname: Url.hostname,
								port: 443,
								path: Url.pathname,
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									"Content-Length": Buffer.byteLength(Body),
								},
							});
							Req.on("error", () => {});
							Req.write(Body);
							Req.end();
						} catch {}
					}
				},
			},
		},
	],

	experimental: {
		clientPrerender: true,

		contentIntellisense: true,

		rustCompiler: true,
	},

	vite: {
		clearScreen: false,

		// Tier:*:Resolution 🟢 Primary — mirror every Tier* env var into
		// `import.meta.env.Tier<Capability>` so Wind's Utility/Tier.ts
		// sees the same values Cocoon does. Vite substitutes these at
		// build time; missing values fall through to Utility/Tier.ts's
		// PascalCase defaults.
		define: Object.fromEntries(
			Object.entries(process.env)
				.filter(([Key]) => Key.startsWith("Tier"))
				.map(([Key, Value]) => [
					`import.meta.env.${Key}`,
					JSON.stringify(Value),
				]),
		),

		build: {
			rollupOptions: {
				treeshake: {
					// Preserve all side effects in the worker package so Register.js
					// SW registration code is not eliminated by Rollup.
					moduleSideEffects: (Id: string) =>
						Id.includes("@codeeditorland/worker") ||
						Id.includes("Element/Worker")
							? true
							: "no-external",
				},
				external: [
					...External,
					(id: string) =>
						// Absolute browser URL paths (/vs/...) - Rollup treats / as filesystem,
						// but these are real browser URLs served at runtime. Mark external.
						id.startsWith("/vs/") ||
						// Package specifier - catches @codeeditorland/output/vs/**
						id.startsWith("@codeeditorland/output/vs/") ||
						// Resolved absolute path (after symlink + package.json exports map)
						id.includes(
							"/@codeeditorland/output/Target/Microsoft/VSCode/vs/",
						) ||
						id.includes(
							"\\@codeeditorland\\output\\Target\\Microsoft\\VSCode\\vs\\",
						) ||
						id.startsWith("vs/") ||
						id === "vscode",
				],
				output: {
					// Preserve dynamic URL imports in VSCode worker files
					hoistTransitiveImports: false,
					// Keep module IDs as absolute file URLs to preserve external module references
					entryFileNames: (chunkInfo) => {
						if (chunkInfo.name === "entry") return "app.js";

						return chunkInfo.name
							? `${chunkInfo.name}-[hash].js`
							: `app-[hash].js`;
					},
				},
			},
			// Disable sourcemaps and minification to reduce memory
			sourcemap: false,
			manifest: false,
			minify: false,
			cssMinify: false,

			terserOptions: On
				? {
						compress: false,

						ecma: 2020,

						enclose: false,

						format: {
							ascii_only: false,

							braces: false,

							comments: false,

							ie8: false,

							indent_level: 4,

							indent_start: 0,

							inline_script: false,

							keep_numbers: true,

							keep_quoted_props: true,

							max_line_len: 80,

							preamble: "",

							ecma: 2020,

							preserve_annotations: true,

							quote_keys: false,

							quote_style: 3,

							safari10: true,

							semicolons: true,

							shebang: false,

							shorthand: false,

							webkit: true,

							wrap_func_args: true,

							wrap_iife: true,
						},

						sourceMap: true,

						ie8: true,

						keep_classnames: true,

						keep_fnames: true,

						mangle: false,

						module: true,

						toplevel: true,
					}
				: {
						compress: {
							passes: 3,

							drop_console: true,

							drop_debugger: true,

							pure_funcs: [],
						},

						ecma: 2020,

						enclose: false,

						format: {
							ascii_only: false,

							braces: false,

							comments: false,

							ie8: false,

							indent_level: 0,

							indent_start: 0,

							inline_script: false,

							keep_numbers: false,

							keep_quoted_props: false,

							max_line_len: false,

							preamble: "",

							ecma: 2020,

							preserve_annotations: false,

							quote_keys: false,

							quote_style: 3,

							safari10: false,

							semicolons: false,

							shebang: true,

							shorthand: true,

							webkit: true,

							wrap_func_args: true,

							wrap_iife: true,
						},

						ie8: false,

						keep_classnames: false,

						keep_fnames: false,

						mangle: false,

						maxWorkers: 12,

						module: true,

						nameCache: {},

						parse: {
							bare_returns: true,

							html5_comments: false,

							shebang: true,
						},

						safari10: false,

						sourceMap: false,

						toplevel: true,
					},
		},

		optimizeDeps: {
			...(On
				? {
						exclude: Link,
					}
				: {}),
		},

		resolve: {
			preserveSymlinks: false,
		},

		css: {
			devSourcemap: On,

			transformer: "postcss",
		},

		server: {
			port: 9999,

			host: Host,

			strictPort: true,

			// OTLP proxy - OTELBridge sends to /v1/traces (same-origin),
			// Vite forwards to the local Jaeger/OTEL collector. No CORS.
			proxy: {
				"/v1/traces": {
					target: "http://localhost:4318",
					changeOrigin: true,
				},
			},

			https: {
				cert: await readFile("./dev-server.pem", {
					encoding: "utf-8",
				}),

				key: await readFile("./dev-server-key.pem", {
					encoding: "utf-8",
				}),
			},

			hmr: Host
				? {
						protocol: "wss",

						host: Host.replace("http://", "").replace(
							"https://",

							"",
						),

						port: 10000,
					}
				: false,
		},

		preview: {
			host: Host,
			port: 9999,
		},
		plugins: [
			(await import("vite-plugin-top-level-await")).default(),

			// Plugin to add @vite-ignore comments to VSCode worker dynamic URL imports
			{
				name: "ViteIgnoreWorkerUrls",

				transform(code: string, id: string) {
					// Only process VSCode worker files
					if (
						id.includes(
							"/vs/workbench/services/extensions/browser/",
						) ||
						id.includes("/vs/workbench/api/worker/")
					) {
						let modified = false;

						let result = code;

						// Add @vite-ignore to webWorkerExtensionHostIframe.html URL
						if (
							result.includes("webWorkerExtensionHostIframe.html")
						) {
							result = result.replace(
								/new URL\(`([^`]*webWorkerExtensionHostIframe\.html[^`]*)`, import\.meta\.url\)/g,
								"new URL(`$1`/* @vite-ignore */, import.meta.url)",
							);

							modified = true;
						}

						// Add @vite-ignore to extensionHostWorkerMain.ts URL
						if (result.includes("extensionHostWorkerMain")) {
							result = result.replace(
								/new URL\(['"]([^'"]*extensionHostWorkerMain[^'"]*)['"], import\.meta\.url\)/g,
								"new URL(/* @vite-ignore */ '$1', import.meta.url)",
							);

							modified = true;
						}

						if (modified) {
							return { code: result, map: null };
						}
					}

					return null;
				},
			},
		] as any,
	},
}) as typeof defineConfig;
