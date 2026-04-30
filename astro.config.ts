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

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { request } from "node:https";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ApplyPlugins from "@codeeditorland/output/Configuration/Plugin/Apply.js";
import BuildPipeline from "@codeeditorland/output/Configuration/Plugin/Index.js";
// -----------------------------------------------------------------------------
// OUTPUT PLUGIN PIPELINE
// -----------------------------------------------------------------------------
// Every "Step N:" block this file used to run inline now lives as a
// standalone plugin in `Element/Output/Source/Plugin/`. `BuildPipeline`
// returns the default ordered array (7 file-copy + 7 text-transform
// plugins); `ApplyPlugins` walks the configured roots and applies them.
// The four genuinely Sky-specific patches that could not move (Steps 8 /
// 8b / 9 / 13 - see banners below) stay inline here, each with a comment
// linking back to the blocker.
//
// Rest compatibility: every plugin is a pure data object (or a factory
// returning one) with a language-agnostic `Transform` / `Copy` payload.
// The Rest compiler will consume the same modules once its plugin API is
// wired up - no duplication or rewrite needed.
import type { Plugin as OutputPlugin } from "@codeeditorland/output/Configuration/Plugin/Type.js";
import { defineConfig } from "astro/config";

// -----------------------------------------------------------------------------
// IMPORT CONTEXT & TRIGGER DEBUG LOGGING
// -----------------------------------------------------------------------------
import { External, Host, Link, On } from "./Source/Function/Debug";

// -----------------------------------------------------------------------------
// BUNDLED-WORKBENCH INPUTS
// -----------------------------------------------------------------------------
// Read by the release-*-bundled / debug-*-bundled profiles in
// `Maintain/{Release,Debug}/Build.sh`. The `Pack` env var is a
// space-separated list of workbench variants. Each variant maps to a
// Rollup input entry pointing at its `Source/Workbench/Bundled/<Variant>/
// Entry.ts`, which in turn `await import()`s the matching VS Code
// workbench module. Vite's native pipeline handles CSS extraction,
// chunk dedup, and tree-shake. Output lands under
// `Sky/Target/Static/Bundled/<Variant>/workbench-[hash].js`. The
// existing `Static/Application/` tree (produced by the Output plugin
// pipeline in `astro:build:done` below) is unchanged.
//
// When `Pack` is empty (every other profile), the bundled-input map is
// empty and the `vs/**` external rules below stay in effect - existing
// builds are byte-for-byte identical.
// -----------------------------------------------------------------------------
const BundledVariants = [
	"electron",
	"browser",
	"sessions",
	"workbench",
] as const;
type BundledVariant = (typeof BundledVariants)[number];

const BundledList = (process.env["Pack"] ?? "")
	.split(/\s+/)
	.map((Name) => Name.trim().toLowerCase())
	.filter((Name): Name is BundledVariant =>
		(BundledVariants as readonly string[]).includes(Name),
	);

const BundledOutputDir = "Static/Bundled";

const BundledActive = BundledList.length > 0;

const BundledInputs: Record<string, string> = {};
for (const Variant of BundledList) {
	const Pascal = Variant[0]!.toUpperCase() + Variant.slice(1);
	BundledInputs[`Bundled/${Pascal}/workbench`] = resolve(
		process.cwd(),
		`Source/Workbench/Bundled/${Pascal}/Entry.ts`,
	);
}

if (BundledActive) {
	console.log(
		`[Sky/Bundled] Active variants: ${BundledList.join(", ")} -> ${BundledOutputDir}/`,
	);
}

// -----------------------------------------------------------------------------
// EXTENSION DEP INSTALLER (Atom S1)
// -----------------------------------------------------------------------------
// Runs `npm install --production` inside a copied extension when its
// package.json declares runtime `dependencies` and `node_modules/` is
// absent or empty. Also reports when an extension's `browser/` entrypoint
// has no compiled bundle - a common result of running `gulp
// compile-extensions-build` without `compile-web-extensions-build`.
//
// Kept deliberately at single-extension granularity so the per-extension
// output is readable and a single bad package.json doesn't fail the whole
// build. `Promise.all` with a semaphore is overkill for ~10 extensions
// with runtime deps (most built-ins webpack-bundle and have none).
// -----------------------------------------------------------------------------
type InstallExtensionDepsOutcome = {
	Installed: number;
	BundleWarning?: string;
};

const InstallExtensionDeps = async (
	ExtensionDirectory: string,
	PackageJsonRaw: string,
): Promise<InstallExtensionDepsOutcome> => {
	let Pkg: Record<string, unknown>;
	try {
		Pkg = JSON.parse(PackageJsonRaw);
	} catch {
		return { Installed: 0 };
	}

	const Dependencies =
		(Pkg["dependencies"] as Record<string, string> | undefined) ?? {};
	const DependencyCount = Object.keys(Dependencies).length;

	// Surface a warning when a web-worker entrypoint lives in the manifest
	// but the compiled browser bundle is missing.
	let BundleWarning: string | undefined;
	const Browser = Pkg["browser"] as string | undefined;
	if (Browser) {
		const BrowserBundle = join(ExtensionDirectory, Browser);
		if (!existsSync(BrowserBundle)) {
			BundleWarning = `browser entrypoint ${Browser} does not resolve`;
		}
	}

	if (DependencyCount === 0) {
		return { Installed: 0, BundleWarning };
	}

	const NodeModulesPath = join(ExtensionDirectory, "node_modules");
	if (existsSync(NodeModulesPath)) {
		// Already populated - trust the source tree's cached install.
		return { Installed: 0, BundleWarning };
	}

	const InstallOutcome = await RunNpmInstall(ExtensionDirectory);
	return {
		Installed: InstallOutcome ? DependencyCount : 0,
		BundleWarning,
	};
};

const RunNpmInstall = (Cwd: string): Promise<boolean> =>
	new Promise((ResolvePromise) => {
		const Child = spawn(
			"npm",
			[
				"install",
				"--production",
				"--no-audit",
				"--no-fund",
				"--no-save",
				"--ignore-scripts",
				"--silent",
			],
			{
				cwd: Cwd,
				stdio: ["ignore", "pipe", "pipe"],
				env: { ...process.env, npm_config_loglevel: "error" },
			},
		);
		let Stderr = "";
		Child.stderr?.on("data", (Chunk) => {
			Stderr += String(Chunk);
		});
		Child.on("error", () => {
			ResolvePromise(false);
		});
		Child.on("close", (Code) => {
			if (Code === 0) {
				ResolvePromise(true);
			} else {
				console.warn(
					`[CopyVSCode] Step 13: npm install exited ${Code} in ${Cwd}${
						Stderr ? `: ${Stderr.trim().slice(0, 200)}` : ""
					}`,
				);
				ResolvePromise(false);
			}
		});
	});

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

					const StaticApplicationDir = join(
						TargetDir,
						"Static",
						"Application",
					);

					// -------------------------------------------------
					// Delegated pipeline (Steps 1, 1b, 2, 3, 4, 6, 7,
					// 7b, 10, 11, 11b, 12, 14)
					// -------------------------------------------------
					// Every patch / inject / copy step that used to live
					// inline below is now a standalone plugin under
					// `Element/Output/Source/Plugin/`. Sky just feeds the
					// absolute paths of the tree roots to `BuildPipeline`
					// and drives it with `ApplyPlugins`. The returned
					// summary is logged so the per-step counters still
					// land in the build log (same `[CopyVSCode]` prefix
					// Sky's old inline code used).
					//
					// What stays inline below:
					//   Step 8  - workbench.js error surfacing + config
					//             backfill (Mountain-schema coupled)
					//   Step 8b - same block as Step 8 (config defaults)
					//   Step 9  - desktop.main.js checkpoint logging
					//   Step 13 - built-in extension copy + npm install
					//             (no esbuild-plugin lifecycle hook
					//             supports spawning `npm install`)
					const Pipeline: OutputPlugin[] = BuildPipeline({
						VSOutput: {
							From: resolve(
								process.cwd(),
								"../Output/Target/Microsoft/VSCode/vs",
							),
							To: Destination,
						},
						VSRootFiles: {
							OutputRoot: resolve(
								process.cwd(),
								"../Output/Target/Microsoft/VSCode",
							),
							DependencyOutBuild: resolve(
								process.cwd(),
								"../../Dependency/Microsoft/Dependency/Editor/out-build",
							),
							DependencyOut: resolve(
								process.cwd(),
								"../../Dependency/Microsoft/Dependency/Editor/out",
							),
							Destination: StaticApplicationDir,
						},
						Supplement: {
							From: resolve(
								process.cwd(),
								"../../Dependency/Microsoft/Dependency/Editor/out/vs",
							),
							To: Destination,
						},
						Worker: {
							From: resolve(
								process.cwd(),
								"node_modules/@codeeditorland/worker/Target/Worker.js",
							),
							To: join(TargetDir, "Worker.js"),
						},
						NodeModules: {
							LocalRoot: resolve(process.cwd(), "node_modules"),
							DependencyRoot: resolve(
								process.cwd(),
								"../../Dependency/Microsoft/Dependency/Editor/node_modules",
							),
							Destination: join(
								TargetDir,
								"Static/Application/node_modules",
							),
						},
						Addons: {
							Destination: join(
								TargetDir,
								"Static/Application/node_modules",
							),
						},
						TauriMainProcessService: {
							OutputService: resolve(
								process.cwd(),
								"node_modules/@codeeditorland/output/Configuration/Service/TauriMainProcessService.js",
							),
							WindService: resolve(
								process.cwd(),
								"node_modules/@codeeditorland/wind/Target/Service/TauriMainProcessService.js",
							),
							Destination: join(
								Destination,
								"platform",
								"ipc",
								"electron-browser",
								"TauriMainProcessService.js",
							),
						},
						// Forwarded from Maintain/Release/Build.sh which
						// exports `PROFILE=release-electron` (or similar).
						// Switches CSS handling: `release-*` profiles inline
						// CSS bytes at build time via `InlineCSSImport`;
						// other profiles use `StripCSSImport` (runtime
						// `_LOAD_CSS_WORKER`).
						Profile:
							process.env["PROFILE"] ?? process.env["Profile"],
					});

					await ApplyPlugins({
						Plugins: Pipeline,
						Roots: [{ Path: StaticApplicationDir, Role: "app" }],
						Log: (Message) =>
							console.log(`[CopyVSCode] ${Message}`),
					});
					StepMark("pipeline");

					// -------------------------------------------------
					// Sky-inline (non-movable) Steps 8, 8b, 9, 13
					// -------------------------------------------------
					// These four steps cannot move into `Output/Plugin/*`
					// in this pass:
					//
					//   Step 8  - workbench.js error surfacing
					//   Step 8b - config-backfill with Mountain-specific
					//             defaults (`colorScheme`, profile URIs,
					//             `detectedProfiles`, etc.) - requires
					//             knowledge of Mountain's IPC schema,
					//             which does not belong in Output.
					//   Step 9  - desktop.main.js perf-mark checkpoints
					//             (CP1..CP6) - Mountain-specific
					//             instrumentation.
					//   Step 13 - built-in extension copy + `npm install`
					//             spawn - esbuild plugins have no post-
					//             build external-command hook.
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
							// 8b-fix: Ensure profile URIs exist for reviveProfile(),
							// and backfill every init-data field VS Code assumes is
							// non-null. Each missing field produced a concrete
							// PostHog error in the 2026-04-21 report (counts below
							// from a single boot session):
							//
							//   colorScheme           → nativeHostColorSchemeService
							//                            destructures {highContrast,dark}
							//                            from the scheme literal (14×)
							//   detectedProfiles      → terminalPlatformConfiguration
							//                            .map over the profile list (25×)
							//   externalTerminal      → .windows / .osx / .linux pane (5×)
							//   backupPath            → base/common/path rejects undefined (33×)
							//   perfMarks             → timerService .marks.filter (14×)
							//   watcher / utilityProcess → destructure .reason (14×)
							//   colorScheme initial   → same service, initial read (14×)
							//
							// Providing neutral defaults here means the workbench
							// boots cleanly even when Mountain hasn't yet populated
							// a field; later, when Mountain DOES send a real value
							// via Tauri IPC, the assignment overwrites our default.
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
									// Backfill colorScheme so nativeHostColorSchemeService's
									// `initial.highContrast` read (nativeHostColorSchemeService.ts:46)
									// and the subsequent promise-resolved `update({highContrast,dark})`
									// never destructure from undefined.
									`if(!configuration2.colorScheme)configuration2.colorScheme={dark:false,highContrast:false};`,
									// Backfill detectedProfiles so terminalPlatformConfiguration's
									// .map call doesn't explode on cold boots where the terminal
									// profile detection hasn't completed yet.
									`if(!Array.isArray(configuration2.detectedProfiles))configuration2.detectedProfiles=[];`,
									// Backfill external-terminal per-OS config so
									// externalTerminal.electron-browser doesn't destructure
									// .windows / .osx / .linux from undefined.
									`if(!configuration2.externalTerminal)configuration2.externalTerminal={windows:{},osx:{},linux:{}};`,
									// Backfill perfMarks so timerService's marks.filter()
									// doesn't fire on a missing array.
									`if(!Array.isArray(configuration2.perfMarks))configuration2.perfMarks=[];`,
									// Backfill an empty backupPath so base/common/path
									// validators that assume a string get one. Empty
									// string is also what the browser workbench carries.
									`if(typeof configuration2.backupPath!=="string")configuration2.backupPath="";`,
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
							// 8c: Wrap result.main(configuration) with try/catch + await,
							// bookended by Atom H1c diagnostic:log invokes that route to
							// Mountain.dev.log. Confirms whether each post-nav page reload
							// enters result.main, what workspace the new page reads, and
							// how many extensions survive to the workbench registry after
							// boot completes.
							Content = Content.replace(
								"result.main(configuration)",
								[
									`performance.mark("land:wb:main");`,
									`try{`,
									`const _L=(tag,msg,...extras)=>{try{const I=globalThis.__TAURI__?.core?.invoke??globalThis.__TAURI__?.invoke;if(typeof I==="function")I("MountainIPCInvoke",{method:"diagnostic:log",params:[tag,msg,...extras]});}catch{}};`,
									// Phase advance lives here rather than in a top-
									// level Astro `<script type="module">` because
									// Astro/Vite bundles every module block in
									// Mountain.astro into a single hoisted chunk; one
									// top-level `await import(WorkbenchUrl)` later in
									// the chunk stalls everything and defers the
									// advance calls past Mountain's 8 s / 23 s
									// fallback timers. This block is injected
									// verbatim into workbench.js and runs inside its
									// own async IIFE, so nothing else can block it.
									// Mountain rejects backwards / same-phase
									// advances, so a duplicate from Mountain.astro
									// is safe.
									`const _A=(phase)=>{try{const I=globalThis.__TAURI__?.core?.invoke??globalThis.__TAURI__?.invoke;if(typeof I==="function")I("MountainIPCInvoke",{method:"lifecycle:advancePhase",params:[phase]}).catch(()=>{performance.mark("land:wb:phase:"+phase+":error");});performance.mark("land:wb:phase:"+phase+":sent");}catch{performance.mark("land:wb:phase:"+phase+":threw");}};`,
									`_L("wb:boot","pre-main href="+location.href+" search="+location.search,{folderUri:configuration?.folderUri??null,workspace:configuration?.workspace??null,windowId:configuration?.windowId??null});`,
									// Phase 3 (Restored): workbench DOM mount +
									// first paint are imminent. Fire before main()
									// so Mountain stops its 8 s fallback timer.
									`_A(3);`,
									`await result.main(configuration);`,
									`performance.mark("land:wb:mainDone");`,
									`_L("wb:boot","post-main completed","reloadCount="+(performance.getEntriesByType?performance.getEntriesByType("navigation")?.length??-1:-1));`,
									// Phase 4 (Eventually): long-tail background
									// work. Delay lets paint settle before
									// Mountain schedules anything aggressive.
									`setTimeout(()=>_A(4),1500);`,
									// `monaco.extensions` was never exposed on the
									// global in modern VS Code (the workbench keeps
									// its ExtensionService inside the DI container,
									// not under `globalThis.monaco`), so the old
									// ext-registry-probe always reported
									// `monacoExtensionsApi:false` regardless of
									// whether extensions actually registered. It was
									// useful once to rule out "maybe the API is
									// there"; now it's pure noise in every boot
									// log. Opt-in via env-driven define in
									// astro.config.ts if the probe is ever needed
									// again.
									`}catch(_e){performance.mark("land:wb:mainError");`,
									`try{const I=globalThis.__TAURI__?.core?.invoke??globalThis.__TAURI__?.invoke;if(typeof I==="function")I("MountainIPCInvoke",{method:"diagnostic:log",params:["wb:boot","main-threw",String(_e?.message||_e),String(_e?.stack||"").slice(0,400)]});}catch{}`,
									`}`,
								].join(""),
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

					// Step 13: Copy built-in extensions.
					// Primary: .build/extensions/ (compiled via gulp compile-extensions-build)
					// Fallback: extensions/ (source - themes, snippets, grammars work uncompiled)
					// Mountain scans Static/Application/extensions/ at startup.
					//
					// Atom J2: `debug-electron-minimal` / `release-electron-minimal`
					// profiles set `Skip=true` so the
					// shipping bundle excludes every bundled extension. Mountain's
					// Scanner observes the same flag (Atom J3) and returns early
					// for the built-in fallback paths, so the runtime matches the
					// zero-on-disk state.
					if (process.env["Skip"] === "true") {
						console.log(
							"[CopyVSCode] Step 13: Skip=true - skipping built-in extension copy",
						);
					} else {
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
						// Atom S1: auto-install runtime deps into each
						// copied extension so Cocoon doesn't crash on
						// `require('byline')` etc. when the source tree
						// omitted `node_modules/`. Toggle via
						// `Install=false` for CI
						// runs that pre-populate the cache.
						const AutoInstallDeps =
							process.env["Install"] !== "false";
						const InstallLog: Array<{
							Name: string;
							Installed: number;
						}> = [];
						const BundleWarnings: string[] = [];
						for (const ExtensionsSource of ExtensionsSources) {
							try {
								const ExtDirs = await readdir(ExtensionsSource);
								let Copied = 0;
								for (const Ext of ExtDirs) {
									const Source = join(ExtensionsSource, Ext);
									const PkgPath = join(
										Source,
										"package.json",
									);
									try {
										const PkgRaw = await readFile(
											PkgPath,
											"utf8",
										);
										const Dest = join(
											ExtensionsTarget,
											Ext,
										);
										await cp(Source, Dest, {
											recursive: true,
										});
										Copied++;

										if (AutoInstallDeps) {
											const Outcome =
												await InstallExtensionDeps(
													Dest,
													PkgRaw,
												);
											if (Outcome.Installed > 0) {
												InstallLog.push({
													Name: Ext,
													Installed:
														Outcome.Installed,
												});
											}
											if (Outcome.BundleWarning) {
												BundleWarnings.push(
													`${Ext}: ${Outcome.BundleWarning}`,
												);
											}
										}
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
						if (InstallLog.length > 0) {
							const Total = InstallLog.reduce(
								(Sum, Item) => Sum + Item.Installed,
								0,
							);
							console.log(
								`[CopyVSCode] Step 13: Auto-installed runtime deps for ${InstallLog.length} extension(s), ${Total} packages total`,
							);
							for (const Item of InstallLog) {
								console.log(
									`[CopyVSCode] Step 13:   - ${Item.Name} (${Item.Installed} packages)`,
								);
							}
						}
						if (BundleWarnings.length > 0) {
							// Missing browser bundles are the normal state when
							// the Electron profile is the primary target - the
							// warning only matters when someone is explicitly
							// working on the browser workbench. Gate behind
							// `Warn=true` so the
							// default build output stays clean; opt in by
							// exporting the flag in the shell or
							// `.env.Land.Local`. Preserve the call-to-action at
							// the end so the opt-in output is self-explanatory.
							if (process.env["Warn"] === "true") {
								for (const Warning of BundleWarnings) {
									console.warn(
										`[CopyVSCode] Step 13: bundle warning - ${Warning}`,
									);
								}
								console.warn(
									`[CopyVSCode] Step 13: run 'npm run compile-web-extensions-build' in Dependency/Microsoft/Dependency/Editor/ to generate missing browser bundles`,
								);
							}
						}
					}

					StepMark("done");
					console.log("[CopyVSCode] ✓ Assets ready in Target/");

					// PostHog build telemetry - debug only, skipped in production.
					// Uses top-level static `request` import; dynamic imports fail
					// here because the Vite module runner has been closed by the
					// time astro:build:done fires.
					if (process.env["NODE_ENV"] !== "production") {
						try {
							const Body = JSON.stringify({
								api_key: "",
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

	output: "static",

	experimental: {
		clientPrerender: false,

		contentIntellisense: false,

		rustCompiler: true,

		queuedRendering: {
			enabled: false,

			contentCache: false,

			poolSize: 1000,
		},
	},

	vite: {
		clearScreen: false,

		// Tier:*:Resolution 🟢 Primary - mirror every Tier* env var into
		// `import.meta.env.Tier<Capability>` so Wind's Utility/Tier.ts
		// sees the same values Cocoon does. Vite substitutes these at
		// build time; missing values fall through to Utility/Tier.ts's
		// PascalCase defaults.
		//
		// Atom N2: additionally mirror `Render` so Sky's
		// Electron/BrowserProxy bootstrap can drop the Wind import chain
		// entirely when the flag is false. Defaults to `"true"` so the
		// Wind layer loads for every profile that doesn't opt out.
		define: {
			...Object.fromEntries(
				Object.entries(process.env)
					.filter(([Key]) => Key.startsWith("Tier"))
					.map(([Key, Value]) => [
						`import.meta.env.${Key}`,
						JSON.stringify(Value),
					]),
			),
			"import.meta.env.Render": JSON.stringify(
				process.env["Render"] ?? "true",
			),
			// Atom PH1: mirror `.env.Land.PostHog` into the Sky bundle so
			// PostHogBridge.ts reads one source of truth. Default key ships
			// when `.env.Land.PostHog` is absent so a fresh clone still
			// reports to the Land project.
			"import.meta.env.Authorize": JSON.stringify(
				process.env["Authorize"] ?? "",
			),
			"import.meta.env.Beam": JSON.stringify(
				process.env["Beam"] ?? "https://eu.i.posthog.com",
			),
			"import.meta.env.Report": JSON.stringify(
				process.env["Report"] ?? "true",
			),
			"import.meta.env.Throttle": JSON.stringify(
				process.env["Throttle"] ?? "5",
			),
			"import.meta.env.Buffer": JSON.stringify(
				process.env["Buffer"] ?? "3000",
			),
			"import.meta.env.Batch": JSON.stringify(
				process.env["Batch"] ?? "20",
			),
			"import.meta.env.Replay": JSON.stringify(
				process.env["Replay"] ?? "false",
			),
			"import.meta.env.Ask": JSON.stringify(
				process.env["Ask"] ?? "false",
			),
			"import.meta.env.Brand": JSON.stringify(process.env["Brand"] ?? ""),
			// Atom DG1: mirror `.env.Land.Diagnostics` keys consumed
			// by Sky-side code so build-time gating composes with the
			// localStorage / URL-query gates without a rebuild.
			// Add new diagnostic flags to BOTH this block AND
			// `LandRuntimeKeys` in `TierEnvironment.sh`.
			"import.meta.env.Smoke": JSON.stringify(
				process.env["Smoke"] ?? "",
			),
			// `Disable=true` - master kill-switch. When set, every
			// Land-specific shim / polyfill / connection attempt is
			// short-circuited so the workbench loads as close to
			// upstream VS Code on Tauri as possible (Copy plugins
			// still produce `Output/Target/`, but no transforms
			// patch it; SkyBridge skips its ~100 listeners; the
			// smoke harness skips). Useful for bisecting whether a
			// regression is in our additions or in upstream / Tauri
			// / WKWebView itself.
			"import.meta.env.Disable": JSON.stringify(
				process.env["Disable"] ?? "",
			),
		},

		build: {
			// Never inline assets as `data:` URLs. Output's `StripCSSImport`
			// transform (now skipped for the bundled tree, see
			// `Output/Source/ApplyPipeline.ts`) used to rewrite
			// `import "./foo.css"` into a `_LOAD_CSS_WORKER(new URL(
			// "./foo.css", import.meta.url).pathname)` call. Vite would
			// recognise the `new URL(literal, import.meta.url)` pattern
			// and inline small assets as `data:text/css;base64,...` URLs,
			// then the runtime call would strip the `data:` scheme and
			// fail. Keeping `assetsInlineLimit: 0` defensively even though
			// the transform path is no longer the primary one.
			assetsInlineLimit: 0,
			// Fold every CSS module into one bundled file (per entry).
			// Default Vite behaviour code-splits CSS per dynamic import,
			// emitting ~75+ individual `_astro/*.css` chunks. With
			// `cssCodeSplit: false` Vite concatenates all CSS reachable
			// from the bundled workbench entry into a single hashed
			// `*.css` file the runtime loads once.
			cssCodeSplit: false,
			rollupOptions: {
				// Bundled-workbench Rollup inputs. When `Pack`
				// is empty this map is empty and Astro's auto-generated page
				// inputs are used unchanged.
				...(BundledActive ? { input: BundledInputs } : {}),
				treeshake: {
					// Preserve all side effects in the worker package so Register.js
					// SW registration code is not eliminated by Rollup.
					//
					// VS Code's modules (under `@codeeditorland/output/Target/
					// Microsoft/VSCode/`) are FULL of side-effect static
					// initialisers - class-static event emitters
					// (`_onWillInstantiateEditorPane = new Emitter(...)`),
					// global registries (`Registry.add(...)`), DI singleton
					// registrations (`registerSingleton(...)`). Rollup's
					// default `"no-external"` is too aggressive: it can
					// prune imports that look unused statically but whose
					// side-effect init populates a registry the workbench
					// depends on at runtime. Mark every VS Code module as
					// having side effects so Rollup preserves the init
					// order verbatim.
					moduleSideEffects: (Id: string) => {
						if (
							Id.includes("@codeeditorland/worker") ||
							Id.includes("Element/Worker")
						) {
							return true;
						}
						// VS Code's contribution-point side-effect imports
						// (`extensions.contribution`, `scm.contribution`,
						// `files.contribution`, every `*.viewlet.js` …) are
						// the entire registration mechanism for the workbench
						// view containers. Rollup's `"no-external"` default
						// drops imports whose only purpose is the side-
						// effect, leaving the bundle without an Extensions
						// view, an SCM view, an Explorer view - the whole
						// Activity Bar comes up empty even though
						// `extensions:getInstalled` returns 113 entries.
						//
						// Match both shapes Rollup might resolve to:
						//   - disk path: `/Output/Target/Microsoft/VSCode/`
						//     (capital O - file walk via `Path:`)
						//   - package spec: `@codeeditorland/output/Target/
						//     Microsoft/VSCode/` (lowercase o - exports map)
						if (BundledActive) {
							const NormalisedId = Id.replace(/\\/g, "/");
							if (
								NormalisedId.includes(
									"/Output/Target/Microsoft/VSCode/",
								) ||
								NormalisedId.includes(
									"@codeeditorland/output/Target/Microsoft/VSCode/",
								) ||
								NormalisedId.includes(
									"/output/Target/Microsoft/VSCode/",
								)
							) {
								return true;
							}
						}
						return "no-external";
					},
				},
				external: [
					...External,
					(id: string) => {
						// When a bundled-workbench profile is active, let
						// Rollup pull every `vs/**` import through the module
						// graph so Vite can extract CSS, dedup chunks, and
						// tree-shake. Skipping the external rules here is
						// the entire point of the bundled tree.
						if (BundledActive) {
							return id === "vscode";
						}
						return (
							// Absolute browser URL paths (/vs/...) - Rollup treats / as filesystem,
							// but these are real browser URLs served at runtime. Mark external.
							id.startsWith("/vs/") ||
							// Package specifier - catches @codeeditorland/output/Target/Microsoft/VSCode/vs/**
							id.startsWith(
								"@codeeditorland/output/Target/Microsoft/VSCode/vs/",
							) ||
							// Resolved absolute path (after symlink + package.json exports map)
							id.includes(
								"/@codeeditorland/output/Target/Microsoft/VSCode/vs/",
							) ||
							id.includes(
								"\\@codeeditorland\\output\\Target\\Microsoft\\VSCode\\vs\\",
							) ||
							id.startsWith("vs/") ||
							id === "vscode"
						);
					},
				],
				output: {
					// Preserve dynamic URL imports in VSCode worker files
					hoistTransitiveImports: false,
					// No `manualChunks` for the bundled tree. The workbench
					// loader (`workbench.js`) dynamically imports
					// `workbench.desktop.main.js` via a literal-string
					// `await import(...)` (rewritten there by Output's
					// `RewriteWorkbenchBaseURL` transform). Rollup
					// auto-splits at that boundary, putting workbench.js's
					// small sync graph in one chunk and desktop.main.js +
					// its 1500-module transitive graph in another. The
					// split is REQUIRED for correct initialisation order:
					// workbench.js's `load()` function must set up
					// `_VSCODE_FILE_ROOT`, NLS, and the resolved
					// configuration BEFORE desktop.main.js's contribs
					// evaluate (which `isElectron`-check at module-init
					// time and otherwise mode-detect as "web", skipping
					// the Electron-side service registrations and breaking
					// the FS provider chain).
					//
					// Forcing all VS Code into one chunk via manualChunks
					// would defeat the auto-split and re-introduce the
					// initialisation-order bug.
					// Route bundled entries to `${BundledOutputDir}/<Variant>/
					// workbench-[hash].js`; everything else keeps the existing
					// `app.js` / `[name]-[hash].js` shape.
					entryFileNames: (chunkInfo) => {
						if (
							chunkInfo.name &&
							chunkInfo.name.startsWith("Bundled/")
						) {
							return `${BundledOutputDir}/${chunkInfo.name.replace(
								/^Bundled\//,
								"",
							)}-[hash].js`;
						}
						if (chunkInfo.name === "entry") return "app.js";

						return chunkInfo.name
							? `${chunkInfo.name}-[hash].js`
							: `app-[hash].js`;
					},
					// Route bundled-tree chunk + asset siblings (CSS, etc.)
					// alongside their entry under `${BundledOutputDir}/`. Vite
					// emits CSS produced from `import "./foo.css"` as assets;
					// keep them next to the entry that pulls them in.
					chunkFileNames: (chunkInfo) => {
						if (
							chunkInfo.name &&
							chunkInfo.name.startsWith("Bundled/")
						) {
							return `${BundledOutputDir}/${chunkInfo.name.replace(
								/^Bundled\//,
								"",
							)}-[hash].js`;
						}
						return "_astro/[name]-[hash].js";
					},
					assetFileNames: (assetInfo) => {
						const Name = assetInfo.name ?? "";
						if (
							BundledActive &&
							(Name.endsWith(".css") || Name.endsWith(".woff2"))
						) {
							return `${BundledOutputDir}/[name]-[hash][extname]`;
						}
						return "_astro/[name]-[hash][extname]";
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

			// Short-circuit Rollup's walk into Bundled/<Variant> module
			// graphs the active `Pack` does not select.
			//
			// Each `Workbench/Bundled/<Variant>/Layout.astro` carries a
			// `<script>` block whose static `await import("./Entry.js")`
			// pulls a VS Code workbench entry from `@codeeditorland/output`.
			// Rollup follows literal-string `await import()` to build a
			// chunk regardless of any surrounding runtime conditional, so
			// even pages we never render pull every variant's Entry into
			// the module graph - at which point the Browser variant's
			// `vs/code/browser/workbench/workbench.js` walks into the
			// gulp-only `workbench.web.main.internal.js`, the Electron
			// variant's `workbench.js` walks into `workbench.desktop.main.js`
			// (whose StaticToDynamicImport-rewritten body is then 3000+
			// literal-string `await import()`s into excluded paths), and
			// Output's release `out-build/` tree (mangled, telemetry-
			// stripped) cannot satisfy the unmangled gulp-only imports.
			//
			// `resolveId` rewrites the inactive Layout's `./Entry.js`
			// import to a virtual module that `load` answers with an empty
			// `export default {};`. Rollup never opens the real Entry.ts,
			// has nothing to follow, and emits a trivial chunk for the
			// inactive route. The active variant's real Entry is left
			// untouched and bundled normally through `BundledInputs`.
			// Operating at `resolveId` (with `enforce: "pre"`) guarantees
			// every downstream plugin - Astro's TS loader, OXC mangler,
			// Output transforms - sees the virtual ID instead of the on-
			// disk file, regardless of which Vite phase (SSR / client)
			// is processing the page.
			{
				name: "BundledEntryStubInactive",
				enforce: "pre",
				resolveId(Source: string, Importer: string | undefined) {
					if (!Importer) return null;
					if (
						!Source.endsWith("/Entry.js") &&
						!Source.endsWith("/Entry.ts") &&
						Source !== "./Entry.js" &&
						Source !== "./Entry.ts"
					) {
						return null;
					}
					const ImporterNormalised = Importer.replace(/\\/g, "/");
					const Match = ImporterNormalised.match(
						/\/Workbench\/Bundled\/(\w+)\/Layout\.astro/,
					);
					if (!Match) return null;
					if (BundledList.includes(Match[1]!.toLowerCase())) {
						return null;
					}
					return `\0BundledEntryStub:${Match[1]!.toLowerCase()}`;
				},
				load(Identifier: string) {
					if (Identifier.startsWith("\0BundledEntryStub:")) {
						return "export default {};";
					}
					// Belt-and-suspenders: if Astro/Vite somehow resolves the
					// real Entry.ts path before our `resolveId` runs (e.g.,
					// through the page input map for a future profile, or a
					// hoisted-script virtual ID we did not anticipate), still
					// stub the file when its variant is inactive. The default
					// `resolveId` chain produces an absolute on-disk path so
					// the regex matches with or without a leading slash.
					const Match = Identifier.replace(/\\/g, "/").match(
						/(?:^|\/)Source\/Workbench\/Bundled\/(\w+)\/Entry\.(?:ts|js)$/,
					);
					if (!Match) return null;
					if (BundledList.includes(Match[1]!.toLowerCase())) {
						return null;
					}
					return "export default {};";
				},
			},

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
