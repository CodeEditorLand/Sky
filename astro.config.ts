export default (await import("astro/config")).defineConfig({
	srcDir: "./Source",
	publicDir: "./Public",
	outDir: "./Target",
	site: "https://localhost/",
	compressHTML: false,
	server: {
		port: 9999,
	},
	integrations: [
		(await import("@astrojs/solid-js")).default(),
		// @ts-ignore
		import.meta.env.MODE === "production"
			? (await import("astrojs-service-worker")).default()
			: null,
		(await import("@astrojs/sitemap")).default(),
		(await import("@playform/inline")).default({ Logger: 1 }),
		(await import("@astrojs/prefetch")).default(),
		(await import("@playform/format")).default({ Logger: 1 }),
		(await import("@playform/compress")).default({ Logger: 1 }),
	],
	experimental: {
		directRenderScript: true,
	},
	vite: {
		build: {
			sourcemap: true,
		},
		plugins: [
			// @ts-ignore
			(await import("vite-plugin-node-polyfills")).nodePolyfills({
				exclude: [],
				globals: {
					Buffer: false,
					global: false,
					process: false,
				},
				protocolImports: true,
			}),
		],
	},
}) as typeof defineConfig;

import type { defineConfig } from "astro/config";
