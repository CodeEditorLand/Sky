export default (await import("astro/config")).defineConfig({
	srcDir: "./Source",
	publicDir: "./Public",
	outDir: "./Target",
<<<<<<< HEAD
	site: "http://localhost",
	compressHTML: true,
	prefetch: true,
	server: {
		port: 9999,
	},
	integrations: [
		(await import("@astrojs/solid-js")).default({
			// @ts-ignore
			devtools: import.meta.env.DEV,
		}),
=======
	// TODO Place your site URL here
	// site: "",
	compressHTML: true,
	prefetch: true,
	integrations: [
>>>>>>> Fork/Current
		// @ts-ignore
		import.meta.env.MODE === "production"
			? (await import("astrojs-service-worker")).default()
			: null,
		(await import("@astrojs/sitemap")).default(),
		(await import("@playform/inline")).default({ Logger: 1 }),
<<<<<<< HEAD
		(await import("@astrojs/prefetch")).default(),
		(await import("@playform/format")).default({ Logger: 1 }),
		(await import("@playform/compress")).default({
			Action: {},
			Cache: false,
			CSS: {},
			Exclude: [],
		}),
=======
		(await import("@playform/format")).default({ Logger: 1 }),
		(await import("@playform/compress")).default({ Logger: 1 }),
>>>>>>> Fork/Current
	],
	experimental: {
		directRenderScript: true,
		clientPrerender: true,
		globalRoutePriority: true,
		serverIslands: true,
	},
	vite: {
		build: {
			sourcemap: true,
		},
<<<<<<< HEAD
		optimizeDeps: {
			exclude: ["@modular-forms/solid"],
=======
		css: {
			devSourcemap: true,
			transformer: "postcss",
>>>>>>> Fork/Current
		},
	},
}) as typeof defineConfig;

import type { defineConfig } from "astro/config";
