import { defineConfig } from "astro/config";
import type { ViteDevServer } from "vite";

export const Tauri = typeof process.env["TAURI_ENV_ARCH"] !== "undefined";

export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

export default defineConfig({
	srcDir: "./Source",
	publicDir: "./Public",
	outDir: "./Target",
	site: On
		? "http://localhost"
		: Tauri
			? "https://tauri.localhost"
			: "https://editor.land",
	compressHTML: !On,
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	server: {
		port: 9999,
	},
	build: {
		concurrency: 9999,
	},
	integrations: [
		(await import("@astrojs/solid-js")).default({
			// @ts-ignore
			devtools: On,
		}),
		Tauri ? null : (await import("@astrojs/sitemap")).default(),
		!On ? (await import("@playform/inline")).default({ Logger: 1 }) : null,
		!On
			? (await import("@playform/compress")).default({ Logger: 1 })
			: null,
	],
	experimental: {
		clientPrerender: true,
		contentIntellisense: true,
	},
	vite: {
		build: {
			sourcemap: On,
			manifest: true,
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
							ecma: 5,
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
				: {},
		},
		optimizeDeps: {
			...(On
				? {
						exclude: [
							"@codeeditorland/common",
							"@codeeditorland/wind",
							"@codeeditorland/output",
						],
					}
				: {}),
		},
		resolve: {
			preserveSymlinks: false,
			alias: [
				...[
					"vscode",
					"@microsoft/1ds-core-js",
					"@microsoft/1ds-post-js",
				].map((Module) => ({
					find: Module,
					replacement: new URL("./Source/Empty.ts", import.meta.url)
						.pathname,
				})),
			],
		},
		css: {
			devSourcemap: On,
			transformer: "postcss",
		},
		plugins: [
			(await import("vite-plugin-top-level-await")).default(),
			((Module: string[]) => ({
				name: "NodeModules",
				configureServer: (server: ViteDevServer): void => {
					server.watcher.options = {
						...server.watcher.options,
						ignored: [
							new RegExp(
								`/node_modules\\/(?!${Module.join("|")}).*/`,
							),
							"**/.git/**",
						],
					};
				},
			}))([
				"@codeeditorland/common",
				"@codeeditorland/wind",
				"@codeeditorland/output",
			]),
		],
	},
}) as typeof defineConfig;
