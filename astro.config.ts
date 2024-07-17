export default (await import("astro/config")).defineConfig({
	srcDir: "./Source",
	publicDir: "./Public",
	outDir: "./Target",
	site: "http://localhost",
	compressHTML: true,
	server: {
		port: 9999,
	},
	integrations: [
		(await import("@astrojs/solid-js")).default({
			// @ts-ignore
			devtools: import.meta.env.DEV,
		}),
		// @ts-ignore
		import.meta.env.MODE === "production"
			? (await import("astrojs-service-worker")).default()
			: null,
		(await import("@astrojs/sitemap")).default(),
		(await import("@playform/inline")).default({ Logger: 1 }),
		(await import("@astrojs/prefetch")).default(),
		(await import("@playform/format")).default({ Logger: 1 }),
		(await import("@playform/compress")).default({
			Action: {},
			Cache: false,
			CSS: {},
			Exclude: [],
		}),
	],
	experimental: {
		directRenderScript: true,
		clientPrerender: true,
		globalRoutePriority: true,
	},
	vite: {
		build: {
			sourcemap: true,
		},
		optimizeDeps: {
			exclude: ["@modular-forms/solid"],
		},
	},
}) as typeof defineConfig;

import type { defineConfig } from "astro/config";
