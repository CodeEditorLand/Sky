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

import { fileURLToPath } from "node:url";

import { defineConfig } from "astro/config";
import type { ViteDevServer } from "vite";

// -----------------------------------------------------------------------------
// IMPORT CONTEXT & TRIGGER DEBUG LOGGING
// -----------------------------------------------------------------------------
import {
	External,
	Host,
	Link,
	On,
	readFile,
	Static,
	// @ts-expect-error
} from "./Source/Function/Debug";

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
	],

	experimental: {
		clientPrerender: true,

		contentIntellisense: true,

		preserveScriptOrder: true,
	},

	vite: {
		clearScreen: false,

		build: {
			rollupOptions: {
				external: External,
			},

			sourcemap: On,

			manifest: On,

			minify: On ? false : "terser",

			cssMinify: On ? false : "esbuild",

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
			alias: {
				// Wind packages - Target prefix imports need to map to static paths without Target
				"@codeeditorland/wind": "/Static/Wind",
				"@codeeditorland/wind/Bootstrap": "/Static/Wind/Bootstrap",
				"@codeeditorland/wind/Configuration": "/Static/Wind/Configuration",
				"@codeeditorland/wind/Effect": "/Static/Wind/Effect",
				"@codeeditorland/wind/Function": "/Static/Wind/Function",
				"@codeeditorland/wind/Types": "/Static/Wind/Types",
				
				// Handle @codeeditorland/wind/Target/* imports by removing Target prefix
				"@codeeditorland/wind/Target/Bootstrap": "/Static/Wind/Bootstrap",
				"@codeeditorland/wind/Target/Configuration": "/Static/Wind/Configuration",
				"@codeeditorland/wind/Target/Effect": "/Static/Wind/Effect",
				"@codeeditorland/wind/Target/Function": "/Static/Wind/Function",
				"@codeeditorland/wind/Target/Types": "/Static/Wind/Types",
				"@codeeditorland/wind/Target/Polyfills": "/Static/Wind/Polyfills",

				// Wind Polyfills for A3 Electron workbench - full paths
				"@codeeditorland/wind/Target/Polyfills/ProcessPolyfill": "/Static/Wind/Polyfills/ProcessPolyfill.js",
				"@codeeditorland/wind/Target/Polyfills/FileProtocolShim": "/Static/Wind/Polyfills/FileProtocolShim.js",
				"@codeeditorland/wind/Target/Polyfills/FileSystemPolyfill": "/Static/Wind/Polyfills/FileSystemPolyfill.js",
				"@codeeditorland/wind/Target/Polyfills/IPCRendererShim": "/Static/Wind/Polyfills/IPCRendererShim.js",
				"@codeeditorland/wind/Target/Polyfills/ChildProcessPolyfill": "/Static/Wind/Polyfills/ChildProcessPolyfill.js",
				"@codeeditorland/wind/Target/Polyfills/NativeModulePolyfill": "/Static/Wind/Polyfills/NativeModulePolyfill.js",
				"@codeeditorland/wind/Target/Polyfills/SharedProcessProxy": "/Static/Wind/Polyfills/SharedProcessProxy.js",

				// VSCode static assets
				"@vscode": "/Static/VSCode",
			},
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

		plugins: [
			// @ts-expect-error
			(await import("vite-plugin-static-copy")).viteStaticCopy(Static),

			// @ts-expect-error
			(await import("vite-plugin-top-level-await")).default(),

			// @ts-expect-error
			((Module: string[]) => ({
				name: "ExtendedWatcherIgnore",

				configureServer: (Server: ViteDevServer): void => {
					Server.watcher.options = {
						...Server.watcher.options,

						ignored: [
							new RegExp(
								`^${fileURLToPath(
									new URL(
										"./Target/Static/",

										import.meta.url,
									),
								).replace(/\\/g, "\\\\")}`,
							),

							new RegExp(
								`[/\\\\]node_modules[/\\\\](?!(${Module.join("|")})([/\\\\]|$)).*`,
							),

							"**/.git/**",

							new RegExp(
								`^${fileURLToPath(new URL("./Target/", import.meta.url)).replace(/\\/g, "\\\\")}`,
							),
						],
					};
				},
			}))(Link),
		],
	},
}) as typeof defineConfig;
