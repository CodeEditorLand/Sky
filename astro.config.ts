import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import type { ViteDevServer } from "vite";

import VSCode from "../Output/Source/ESBuild/Microsoft/VSCode";

export const { readFile } = await import("fs/promises");

export const Bundle = process.env["Bundle"] === "true";

export const Browser = process.env["Browser"] === "true";

export const Tauri = typeof process.env["TAURI_ENV_ARCH"] !== "undefined";

export const Platform = ((Platform) => {
	switch (Platform?.toLowerCase()) {
		case "windows":
			return "Windows";

		case "darwin":
			return "Mac";

		case "linux":
			return "Linux";

		case "android":
			return "Android";

		case "ios":
			return "iOS";

		default:
			return "Windows";
	}
})(process.env["TAURI_ENV_PLATFORM"]);

export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

export const Link = [
	"@codeeditorland/common",

	"@codeeditorland/output",

	"@codeeditorland/shim",

	"@codeeditorland/worker",
];

export const External = ["@microsoft/1ds-core-js", "@microsoft/1ds-post-js"];

export const Host = process.env["TAURI_DEV_HOST"]
	? `https://${process.env["TAURI_DEV_HOST"]}`
	: Tauri
		? "https://tauri.localhost"
		: On
			? "https://localhost"
			: "https://editor.land";

export const ApplicationStatic = "Static/Application";

export const VSCodeOutput =
	"node_modules/@codeeditorland/output/Target/Microsoft/VSCode";

export const Static = {
	targets: [
		{
			src: "node_modules/@codeeditorland/shim/Target/*",

			dest: "Static/Shim/",
		},
		{
			src: `${VSCodeOutput}/vs/workbench/services/keybinding/browser/keyboardLayouts/_.contribution.js`,

			dest: `${ApplicationStatic}/vs/workbench/services/keybinding/browser/keyboardLayouts/`,
		},
	],

	structured: false,
};

switch (Platform) {
	case "Windows":
		Static.targets.push({
			src: `${VSCodeOutput}/vs/workbench/services/keybinding/browser/keyboardLayouts/*.win.js`,

			dest: `${ApplicationStatic}/vs/workbench/services/keybinding/browser/keyboardLayouts/`,
		});

		break;

	default:
		break;
}

Bundle
	? Static.targets.push(
			...[
				{
					src: "node_modules/@codeeditorland/worker/Target/Worker.js",

					dest: ".",
				},
			],
		)
	: Static.targets.push(
			...[
				{
					src: `${VSCodeOutput}/*`,

					dest: ApplicationStatic,
				},

				{
					src: "node_modules/@codeeditorland/worker/Target/*",

					dest: ".",
				},
			],
		);

Browser
	? External.push(
			...[
				"@codeeditorland/output/Target/Microsoft/VSCode/vs/code/electron-sandbox/workbench/workbench.js",
			],
		)
	: {};

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

						// mangle: {
						// 	eval: true,

						// 	keep_classnames: false,

						// 	keep_fnames: false,

						// 	module: true,

						// 	properties: {
						// 		reserved: [
						// 	"WorkerApplication",

						// 	"_LOAD_CSS_WORKER",

						// 	"_POLICY_WORKER",

						// 	"_WORKER",

						// 	"value",

						// 	"get",
						// ],

						// 		keep_quoted: true,
						// 	},

						// 	reserved: [],

						// 	safari10: false,

						// 	toplevel: true,
						// },

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

		plugins: [
			(await import("vite-plugin-static-copy")).viteStaticCopy(Static),

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
			}))(Link),
		],
	},
}) as typeof defineConfig;
