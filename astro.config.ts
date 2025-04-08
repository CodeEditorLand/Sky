import { fileURLToPath } from "node:url";
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
							"@codeeditorland/output",
							"@codeeditorland/shim",
							"@codeeditorland/worker",
							"@codeeditorland/wind",
						],
					}
				: {}),
		},
		resolve: {
			preserveSymlinks: false,
			// alias: [
			// 	...[
			// 		"vscode",
			// 		"@microsoft/1ds-core-js",
			// 		"@microsoft/1ds-post-js",
			// 	].map((Module) => ({
			// 		find: Module,
			// 		replacement: new URL("./Source/Shim.ts", import.meta.url)
			// 			.pathname,
			// 	})),
			// ],
		},
		css: {
			devSourcemap: On,
			transformer: "postcss",
		},
		plugins: [
			(await import("vite-plugin-static-copy")).viteStaticCopy({
				targets: [
					{
						src: "node_modules/@codeeditorland/output/Target/Microsoft/VSCode/*",
						dest: "Static/VSCode/",
					},

					// TODO: DO THIS FOR THE CodeEditorLand/Editor BUILD AS WELL
					// {
					// 	src: "node_modules/@codeeditorland/output/Target/CodeEditorLand/Editor/",
					// 	dest: "Editor/",
					// },

					{
						src: "node_modules/@codeeditorland/shim/Target/*",
						dest: "Static/Shim/",
					},

					{
						src: "node_modules/@codeeditorland/worker/Target/*",
						dest: ".",
					},
				],
				structured: false,
			}),
			(await import("vite-plugin-top-level-await")).default(),
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
			}))([
				"@codeeditorland/common",
				"@codeeditorland/output",
				"@codeeditorland/shim",
				"@codeeditorland/wind",
				"@codeeditorland/worker",
			]),
			// (() => ({
			// 	name: "ServiceWorker",
			// 	configureServer(Server) {
			// 		Server.middlewares.use((Request, Response, Next) => {
			// 			if (Request.url === "/Static/Worker/Worker.js") {
			// 				Response.setHeader(
			// 					"Service-Worker-Allowed",
			// 					"/VSCode",
			// 				);

			// 				Response.setHeader(
			// 					"Content-Type",
			// 					"application/javascript; charset=utf-8",
			// 				);
			// 			}

			// 			Next();
			// 		});
			// 	},
			// }))(),
		],
	},
}) as typeof defineConfig;
