import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import type { ViteDevServer } from "vite";

export const { readFile } = await import("fs/promises");

export const Tauri = typeof process.env["TAURI_ENV_ARCH"] !== "undefined";

export const On =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

export const Link = [
	"@codeeditorland/common",

	"@codeeditorland/output",

	"@codeeditorland/shim",

	"@codeeditorland/worker",
];

const Host = process.env["TAURI_DEV_HOST"]
	? `https://${process.env["TAURI_DEV_HOST"]}`
	: Tauri
		? "https://tauri.localhost"
		: On
			? "https://localhost"
			: "https://editor.land";

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
			(await import("vite-plugin-static-copy")).viteStaticCopy({
				targets: [
					{
						src: "node_modules/@codeeditorland/output/Target/Microsoft/VSCode/*",

						dest: "Static/Application/",
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
			}))(Link),
		],
	},
}) as typeof defineConfig;
