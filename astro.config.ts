import type { defineConfig } from "astro/config";
import type { ViteDevServer } from "vite";

export const Tauri = typeof process.env["TAURI_ENV_ARCH"] !== "undefined";

export const Development =
	process.env["NODE_ENV"] === "development" ||
	process.env["TAURI_ENV_DEBUG"] === "true";

export default (await import("astro/config")).defineConfig({
	srcDir: "./Source",
	publicDir: "./Public",
	outDir: "./Target",
	site: Tauri
		? Development
			? "tauri://localhost"
			: "https://tauri.localhost"
		: Development
			? "http://localhost"
			: "https://editor.land",
	compressHTML: !Development,
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	server: {
		port: 9999,
	},
	integrations: [
		(await import("@astrojs/solid-js")).default({
			// @ts-ignore
			devtools: Development,
		}),
		Tauri ? null : (await import("@astrojs/sitemap")).default(),
		Development
			? null
			: (await import("@playform/inline")).default({ Logger: 1 }),
		(await import("@astrojs/prefetch")).default(),
		Development
			? null
			: (await import("@playform/compress")).default({ Logger: 1 }),
	],
	experimental: {
		directRenderScript: true,
		clientPrerender: true,
		globalRoutePriority: true,
		serverIslands: true,
	},
	vite: {
		build: {
			sourcemap: Development,
			manifest: true,
		},
		optimizeDeps: {
			...(Development
				? {
						exclude: [
							"@codeeditorland/common",
							"@codeeditorland/wind",
							"@codeeditorland/vanilla",
						],
					}
				: {}),
		},
		resolve: {
			preserveSymlinks: true,
		},
		css: {
			devSourcemap: Development,
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
				"@codeeditorland/vanilla",
			]),
		],
	},
}) as typeof defineConfig;
