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

import { copyFile, cp, readdir, readFile, writeFile } from "node:fs/promises";
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
					// Step 4: Strip CSS imports — Tauri WKWebView has no service worker
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

					// Step 5: Patch Electron workbench.js baseUrl computation.
					// The original uses vscode-file://vscode-app/{appRoot}/out/
					// which doesn't exist in Tauri. Replace with the embedded
					// asset root /Static/Application/ using location.origin.
					const ElectronWorkbench = join(
						Destination,
						"code",
						"electron-browser",
						"workbench",
						"workbench.js",
					);
					try {
						const WB = await readFile(
							ElectronWorkbench,
							"utf-8",
						);
						// The original line uses fileUriFromPath which
						// produces vscode-file:// URIs that Tauri can't load.
						// Replace with direct URL from _VSCODE_FILE_ROOT.
						const SearchStr =
							"fileUriFromPath(configuration.appRoot";
						const Idx = WB.indexOf(SearchStr);
						let Patched = WB;
						if (Idx !== -1) {
							// Find the enclosing: const baseUrl = new URL(`${...}/out/`);
							// Replace entire line from "const baseUrl" to the semicolon
							const LineStart = WB.lastIndexOf(
								"const baseUrl",
								Idx,
							);
							const LineEnd = WB.indexOf(";", Idx) + 1;
							if (LineStart !== -1 && LineEnd > 0) {
								Patched =
									WB.slice(0, LineStart) +
									`const baseUrl = new URL(globalThis._VSCODE_FILE_ROOT || "/Static/Application/", globalThis.location?.origin || "https://tauri.localhost")` +
									WB.slice(LineEnd);
							}
						}
						if (Patched !== WB) {
							await writeFile(
								ElectronWorkbench,
								Patched,
								"utf-8",
							);
							console.log(
								"[CopyVSCode] Step 5: Patched electron workbench baseUrl",
							);
						} else {
							console.log(
								"[CopyVSCode] Step 5: Pattern not found in workbench.js (may already be patched)",
							);
						}
					} catch {
						// Electron workbench may not exist (Browser/Mountain build)
					}

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
						const NameShim =
							`var __defProp=Object.defineProperty;var __name=(t,v)=>__defProp(t,"name",{value:v,configurable:true});`;
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

					console.log("[CopyVSCode] ✓ Assets ready in Target/");
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
						// Absolute browser URL paths (/vs/...) — Rollup treats / as filesystem,
						// but these are real browser URLs served at runtime. Mark external.
						id.startsWith("/vs/") ||
						// Package specifier — catches @codeeditorland/output/vs/**
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
